import {
  calculateDistance,
  Coord,
  equals,
  floor,
  followPath
} from '@rt-potion/common';
import { Personality } from './traits/personality';
import { DB } from '../services/database';
import { Item } from '../items/item';
import { House, HouseData } from '../community/house';
import { itemGenerator } from '../items/itemGenerator';
import { Needs } from './traits/needs';
import { conversationTracker } from './social/conversationTracker';
import { pubSub } from '../services/clientCommunication/pubsub';
import { Carryable } from '../items/carryable';
import { gameWorld } from '../services/gameWorld/gameWorld';
import { selectAction } from './plans/actionRunner';

export type MobData = {
  id: string;
  action_type: string;
  subtype: string;
  name: string;
  gold: number;
  health: number;
  maxHealth: number;
  attack: number;
  speed: number;
  position_x: number;
  position_y: number;
  path: string;
  target_x: number;
  target_y: number;
  current_action: string;
  carrying_id: string;
  community_id: string;
};

interface MobParams {
  key: string;
  name: string;
  type: string;
  position: Coord;
  speed: number;
  gold: number;
  health: number;
  maxHealth: number;
  attack: number;
  community_id: string;
  subtype: string;
  currentAction?: string;
  carrying?: string;
  path: Coord[];
  target?: Coord;
}

export class Mob {
  private _currentAction?: string;
  public readonly personality: Personality;
  public readonly community_id: string;

  public readonly needs: Needs = new Needs(this);
  public readonly visionDistance: number = 5;

  public readonly id: string;
  private target?: Coord;
  private path: Coord[];
  private speed: number;
  private _name: string;
  private maxHealth: number;
  private _carrying?: string;
  public readonly unlocks: string[] = [];
  private _type: string;
  private _subtype: string = '';

  private _position: Coord;

  private _gold: number;
  private _health: number;
  public readonly attack: number;

  // Addition: Tracking when sprite last moved, and how long they've been asleep for
  private lastMoveTick: number = 0;  // Track last move tick
  private sleepDuration: number = 12 * 4; // Asleep if doesnt move for 48 ticks

  // subtype: string,
  // currentAction?: string,
  // carrying?: string,
  // path: Coord[],
  // target?: Coord

  private constructor({
    key,
    name,
    type,
    position,
    speed,
    gold,
    health,
    maxHealth,
    attack,
    community_id,
    subtype,
    currentAction,
    carrying,
    path,
    target
  }: MobParams) {
    this.id = key;
    this._name = name;
    this._type = type;
    this._subtype = subtype;
    this._currentAction = currentAction;

    this._carrying = carrying;
    this.path = path;
    this.target = target;
    this._position = position;
    this.speed = speed;
    this._gold = gold;
    this._health = health;
    this.maxHealth = maxHealth;
    this.attack = attack;

    this.personality = Personality.loadPersonality(this);
    this.community_id = community_id;
    this.unlocks.push(community_id);

    // Addition: Initialize that the mob hasn't moved at the start of the game
    this.lastMoveTick = 0;
  }

  private setAction(action: string, finished: boolean = false) {
    if (this._currentAction === action && !finished) {
      return;
    }

    if (finished) {
      this._currentAction = undefined;
    } else {
      this._currentAction = action;
    }

    DB.prepare(
      `
            UPDATE mobs
            SET current_action = :current_action
            WHERE id = :id
        `
    ).run({ id: this.id, current_action: this._currentAction });

    if (this._currentAction) {
      pubSub.doing(this.id, this._currentAction);
    }
  }

  get type(): string {
    return this._type;
  }

  get subtype(): string {
    return this._subtype;
  }

  get position(): Coord {
    return this._position;
  }

  get gold(): number {
    return this._gold;
  }

  get health(): number {
    return this._health;
  }

  get name(): string {
    return this._name;
  }

  set carrying(item: Item | undefined) {
    if (this.carrying !== undefined && item !== undefined) {
      Carryable.fromItem(this.carrying)!.dropAtFeet(this);
    }
    this._carrying = item ? item.id : undefined;
    DB.prepare(
      `
            UPDATE mobs
            SET carrying_id = :carrying_id
            WHERE id = :id
        `
    ).run({ carrying_id: this._carrying ? this._carrying : null, id: this.id });
  }

  get carrying(): Item | undefined {
    return this._carrying ? Item.getItem(this._carrying) : undefined;
  }

  isNotMoving(): boolean {
    return this.target == undefined;
  }

  updatePlayer(name: string, subtype: string) {
    this._name = name;
    this._subtype = subtype;
    DB.prepare(
      `
            UPDATE mobs
            SET name = :name, subtype = :subtype
            WHERE id = :id
        `
    ).run({ name, subtype, id: this.id });
  }

  findNearbyMobIDs(radius: number): string[] {
    const query = `
              SELECT id
              FROM mobs
              WHERE ((position_x - :x) * (position_x - :x) + (position_y - :y) * (position_y - :y)) <= :radiusSquared
              AND id != :id
          `;
    const mobIDs = DB.prepare(query).all({
      id: this.id,
      x: this.position.x,
      y: this.position.y,
      radiusSquared: radius * radius
    }) as { id: string }[];

    return mobIDs.map((mobID) => {
      return mobID.id;
    });
  }

  findClosestEnemyID(
    community_id: string,
    maxDistance: number = 20
  ): string | undefined {
    const maxDistanceSquared = maxDistance * maxDistance;
    const query = `
            SELECT 
                id
            FROM mobs
            WHERE NOT EXISTS (
                SELECT 1 FROM alliances 
                WHERE 
                    (alliances.community_1_id = :community_id AND alliances.community_2_id = mobs.community_id) OR
                    (alliances.community_2_id = :community_id AND alliances.community_1_id = mobs.community_id) OR
                    mobs.community_id = :community_id
            )
            AND ((position_x - :x) * (position_x - :x) + (position_y - :y) * (position_y - :y)) <= :maxDistanceSquared
            ORDER BY ((position_x - :x) * (position_x - :x) + (position_y - :y) * (position_y - :y)) ASC
            LIMIT 1
        `;
    const params = {
      x: this.position.x,
      y: this.position.y,
      maxDistanceSquared,
      community_id
    };
    const closestMob = DB.prepare(query).get(params) as { id: string };

    return closestMob ? closestMob.id : undefined;
  }

  findClosestObjectID(
    types: string[],
    maxDistance: number = Infinity
  ): string | undefined {
    const maxDistanceSquared = maxDistance * maxDistance;
    const typesList = types.map((type) => `'${type}'`).join(', ');
    const query = `
            SELECT 
                id
            FROM items
            WHERE type IN (${typesList})
            AND ((position_x - :x) * (position_x - :x) + (position_y - :y) * (position_y - :y)) <= :maxDistanceSquared
            ORDER BY ((position_x - :x) * (position_x - :x) + (position_y - :y) * (position_y - :y)) ASC
            LIMIT 1
        `;
    const result = DB.prepare(query).get({
      x: this.position.x,
      y: this.position.y,
      maxDistanceSquared
    }) as { id: string };
    return result ? result.id : undefined;
  }

  setMoveTarget(target: Coord, fuzzy: boolean = false): boolean {
    const start = floor(this.position);
    const end = floor(target);
    if (
      //equals(this.target?, end) ||
      equals(start, end) &&
      this.target == null
    ) {
      return true;
    }
    if (equals(start, end)) {
      this.updateMoveTarget(end, [end]);
      return true;
    }

    const path = gameWorld.generatePath(this.unlocks, start, end, fuzzy);
    if (path.length === 0) {
      return false;
    }
    this.updateMoveTarget(end, path);
    return true;
  }

  private updateMoveTarget(target: Coord, path: Coord[]) {
    if (
      target &&
      (!Number.isInteger(target.x) || !Number.isInteger(target.y))
    ) {
      throw new Error(`Target coordinates must be whole integers ${target}`);
    }
    if (path.length === 0) {
      throw new Error('Path must have at least one point');
    }

    this.target = target;
    this.path = path;
    DB.prepare(
      `
            UPDATE mobs
            SET path = :path, target_x = :target_x, target_y = :target_y
            WHERE id = :id
        `
    ).run({
      path: JSON.stringify(this.path),
      target_x: this.target ? this.target.x : null,
      target_y: this.target ? this.target.y : null,
      id: this.id
    });
    pubSub.move(this.id, this.target, this.path);
  }

  speak(message: string) {
    pubSub.speak(this.id, message);
  }

  changeHealth(amount: number) {
    if (amount === 0 || this.health <= 0) return;
    let newHealth = this.health + amount;
    newHealth = Math.min(newHealth, this.maxHealth);
    DB.prepare(
      `
            UPDATE mobs
            SET health = :health
            WHERE id = :id
        `
    ).run({ health: newHealth, id: this.id });
    this._health = newHealth;
    pubSub.changeHealth(this.id, amount, this.health);
    if (this.health <= 0) {
      DB.prepare(
        `
                DELETE FROM mobs
                WHERE id = :id
            `
      ).run({ id: this.id });
      this.destroy();
    }
  }

  // Addition: These things happen when the character is in sleep state (healing + energy)
  sleep() {
    if (gameWorld.currentDate().global_tick % (12 * 4) === 0) { // Checks for every 48 ticks that elapsed of no movement
      this.needs.changeNeed('max_energy', 25);
      this.needs.changeNeed('energy', 25);
      this.changeHealth(10);
    }
  }

  // Addition: Implements sleep if it recognizes that mob is asleep
  checkForSleep() {
    const currentTick = gameWorld.currentDate().global_tick; // Use the game world time and not real time
    if (currentTick - this.lastMoveTick >= this.sleepDuration) {
      this.sleep();  // Sleep if conidtion is met
    }
  }

  getHouse(): House | undefined {
    const houseData = DB.prepare(
      `
            SELECT houses.id, top_left_x, top_left_y, width, height, houses.community_id
            FROM houses
            JOIN mobs ON mobs.house_id = houses.id
            WHERE mobs.id = :id
        `
    ).get({ id: this.id }) as HouseData;
    return houseData
      ? new House(
          houseData.id,
          { x: houseData.top_left_x, y: houseData.top_left_y },
          houseData.width,
          houseData.height,
          houseData.community_id
        )
      : undefined;
  }

  changeGold(amount: number) {
    this._gold += amount;
    DB.prepare(
      `
            UPDATE mobs
            SET gold = gold + :gold
            WHERE id = :id
        `
    ).run({ gold: amount, id: this.id });
    pubSub.changeGold(this.id, amount, this._gold);
  }

  destroy() {
    if (this.gold > 0 && this.position) {
      const position = Item.findEmptyPosition(this.position);
      itemGenerator.createItem({
        type: 'gold',
        position,
        attributes: { amount: this.gold }
      });
    }

    const carriedItem = this.carrying;
    if (carriedItem) {
      Carryable.fromItem(carriedItem)!.dropAtFeet(this);
    }
    pubSub.kill(this.id);
  }

  private updatePosition(deltaTime: number) {
    if (this.path.length === 0) {
      return;
    }
    this._position = followPath(
      this.position,
      this.path,
      this.speed,
      deltaTime
    )[0]; // retrieve just the position

    if (
      this.path.length === 0 &&
      this.target &&
      this.target.x == this.position.x &&
      this.target.y == this.position.y
    ) {
      this.target = undefined;
    }

    // Addition: Keep track of when it last moved for sleep
    this.lastMoveTick = gameWorld.currentDate().global_tick;

    DB.prepare(
      `
            UPDATE mobs
            SET position_x = :position_x, position_y = :position_y, path = :path, target_x = :target_x, target_y = :target_y, lastMoveTick = :lastMoveTick
            WHERE id = :id
        `
    ).run({
      position_x: this._position.x,
      position_y: this._position.y,
      id: this.id,
      path: JSON.stringify(this.path),
      target_x: this.target ? this.target?.x : null,
      target_y: this.target ? this.target?.y : null,
      // Addition: ALSO UPDATE the lastMoveTick when the mob moves
      lastMoveTick: this.lastMoveTick, 
    });
  }

  chatRequest(mob: Mob): boolean {
    conversationTracker.startConversation(mob, this);
    return false;
  }

  static findCarryingMobID(item_id: string): string | undefined {
    const mob = DB.prepare(
      `
            SELECT id
            FROM mobs
            WHERE carrying_id = :item_id
        `
    ).get({ item_id }) as { id: string };
    if (!mob) {
      return undefined;
    }

    return mob.id;
  }

  static getCountOfType(type: string): number {
    const count = DB.prepare(
      `
            SELECT COUNT(*) as count
            FROM mobs
            WHERE action_type = :type
        `
    ).get({ type }) as { count: number };
    return count.count;
  }

  static getMob(key: string): Mob | undefined {
    const mob = DB.prepare(
      `
            SELECT id, action_type, subtype, name, gold, maxHealth, health, attack, speed, position_x, position_y, path, target_x, target_y, current_action, carrying_id, community_id
            FROM mobs
            WHERE id = :id
        `
    ).get({ id: key }) as MobData;
    if (!mob) {
      return undefined;
    }
    const player = new Mob({
      key: mob.id,
      name: mob.name,
      type: mob.action_type,
      position: { x: mob.position_x, y: mob.position_y },
      speed: mob.speed,
      gold: mob.gold,
      health: mob.health,
      maxHealth: mob.maxHealth,
      attack: mob.attack,
      community_id: mob.community_id,
      subtype: mob.subtype,
      currentAction: mob.current_action,
      carrying: mob.carrying_id,
      path: mob.path ? JSON.parse(mob.path) : [],
      target:
        mob.target_x && mob.target_y
          ? { x: mob.target_x, y: mob.target_y }
          : undefined
    });

    return player;
  }

  public moveToOrExecute(
    to: Coord,
    range: number,
    action: () => boolean,
    fuzzy: boolean = false
  ): boolean {
    if (this.isWithinRange(to, range)) {
      return action();
    } else {
      const foundPath = this.setMoveTarget(to, fuzzy);
      return !foundPath; // return true if we didn't find a path to cancel it
    }
  }

  public isWithinRange(item: Coord, range: number): boolean {
    return calculateDistance(item, this.position) <= range;
  }

  public getBaskets(): string[] {
    const results = DB.prepare(
      `
            SELECT items.id
            FROM item_attributes
            JOIN items ON item_attributes.item_id = items.id
            JOIN mobs ON mobs.community_id = items.owned_by
            WHERE mobs.id = :id and item_attributes.attribute = 'items'
        `
    ).all({ id: this.id }) as { id: string }[];

    return results.map((result) => result.id);
  }

  public getBasket(type: string): string | undefined {
    const itemData = DB.prepare(
      `
            SELECT items.id
            FROM item_attributes
            JOIN items ON item_attributes.item_id = items.id
            JOIN mobs ON mobs.community_id = items.owned_by
            WHERE item_attributes.attribute = 'items' AND mobs.id = :id
        `
    ).get({ type, id: this.id }) as { id: string };
    return itemData ? itemData.id : undefined;
  }

  get action(): string | undefined {
    return this._currentAction;
  }

  static getAllMobIDs(): string[] {
    const result = DB.prepare(
      `
            SELECT 
                id
            FROM mobs;
            `
    ).all() as { id: string }[];
    return result.map((row) => row.id);
  }

  tick(deltaTime: number) {
    this.updatePosition(deltaTime);

    if (this.type !== 'player') {
      const action = selectAction(this);
      const finished = action.execute(this);
      //console.log(`${this.name} action: ${action.type()} finished: ${finished}`);
      this.setAction(action.type(), finished);
    }

    // Addition: Check if it hasn't moved in a while
    this.checkForSleep();

    this.needs.tick();
  }

  static SQL = `
        CREATE TABLE mobs (
            id TEXT PRIMARY KEY,
            action_type TEXT NOT NULL,
            subtype TEXT NOT NULL,
            name TEXT NOT NULL,
            gold INTEGER NOT NULL,
            health INTEGER NOT NULL,
            maxHealth INTEGER NOT NULL,
            attack INTEGER NOT NULL,
            speed REAL NOT NULL,
            position_x REAL NOT NULL,
            position_y REAL NOT NULL,
            carrying_id TEXT,
            path TEXT,
            target_x INTEGER,
            target_y INTEGER,
            current_action TEXT,
            satiation INTEGER NOT NULL DEFAULT 100,
            max_energy INTEGER NOT NULL DEFAULT 100,
            energy INTEGER NOT NULL DEFAULT 100,
            social INTEGER NOT NULL DEFAULT 100,
            community_id TEXT,
            house_id TEXT,
            lastMoveTick INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (carrying_id) REFERENCES items (id) ON DELETE SET NULL,
            FOREIGN KEY (community_id) REFERENCES community (id) ON DELETE SET NULL,
            FOREIGN KEY (house_id) REFERENCES houses (id) ON DELETE SET NULL
        );
    `;
}
