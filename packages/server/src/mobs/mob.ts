import {
  calculateDistance,
  Coord,
  equals,
  floor,
  followPath
} from '@rt-potion/common';
import { Personality, PersonalityTraits } from './traits/personality';
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
import { Favorability } from '../favorability/favorability';

export type MobData = {
  personalities: Personality;
  id: string;
  action_type: string;
  subtype: string;
  name: string;
  gold: number;
  health: number;
  maxHealth: number;
  attack: number;
  speed: number;
  defense: number;
  position_x: number;
  position_y: number;
  path: string;
  target_x: number;
  target_y: number;
  current_action: string;
  carrying_id: string;
  community_id: string;
  favorite_item: string;
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
  defense: number;
  favorite_item: string;
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
  private attack: number;
  private defense: number;
  private _name: string;
  private maxHealth: number;
  private _carrying?: string;
  public readonly unlocks: string[] = [];
  private _type: string;
  private _subtype: string = '';

  private _position: Coord;

  private _gold: number;
  private _health: number;
  private favorite_item: string;

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
    defense,
    favorite_item,
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
    this.defense = defense;
    this.favorite_item = favorite_item;

    this.personality = Personality.loadPersonality(this);
    this.community_id = community_id;
    this.unlocks.push(community_id);
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

  sendMessage(message: string) {
    console.log(`${this.name} reads: "${message}"`);
    pubSub.speak(this.id, message);
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
    const mob = DB.prepare(
      `
      SELECT health FROM mobView WHERE id = :id
      `
    ).get({ id: this.id }) as { health: number };

    return mob.health;
  }

  get poisoned(): number {
    const mob = DB.prepare(
      `
      SELECT poisoned FROM mobView WHERE id = :id
      `
    ).get({ id: this.id }) as { poisoned: number };

    return mob.poisoned;
  }

  get damageOverTime(): number {
    const mob = DB.prepare(
      `
      SELECT damageOverTime FROM mobView WHERE id = :id
      `
    ).get({ id: this.id }) as { damageOverTime: number };

    return mob.damageOverTime;
  }

  get _speed(): number {
    const mob = DB.prepare(
      `
      SELECT speed FROM mobView WHERE id = :id
      `
    ).get({ id: this.id }) as { speed: number };

    return mob.speed;
  }

  get _favorite_item(): string {
    return this.favorite_item;
  }

  get _maxHealth(): number {
    return this.maxHealth;
  }

  get _attack(): number {
    const mob = DB.prepare(
      `
      SELECT attack FROM mobView WHERE id = :id
      `
    ).get({ id: this.id }) as { attack: number };

    return mob.attack;
  }

  get _defense(): number {
    const mob = DB.prepare(
      `
      SELECT defense FROM mobView WHERE id = :id
      `
    ).get({ id: this.id }) as { defense: number };

    return mob.defense;
  }

  get name(): string {
    return this._name;
  }

  get current_tick(): number {
    return gameWorld.currentDate().global_tick;
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

  removePlayer() {
    DB.prepare(
      `
              DELETE FROM mobs
              WHERE id = :id
          `
    ).run({ id: this.id });
  }

  findNearbyMobIDs(radius: number): string[] {
    const query = `
              SELECT id
              FROM mobView
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
            FROM mobView
            WHERE mobView.id != :self_id
              AND NOT EXISTS (
                SELECT 1 FROM alliances 
                WHERE 
                    (alliances.community_1_id = :community_id AND alliances.community_2_id = mobView.community_id) OR
                    (alliances.community_2_id = :community_id AND alliances.community_1_id = mobView.community_id) OR
                    mobView.community_id = :community_id
            )
            AND ((position_x - :x) * (position_x - :x) + (position_y - :y) * (position_y - :y)) <= :maxDistanceSquared
            ORDER BY ((position_x - :x) * (position_x - :x) + (position_y - :y) * (position_y - :y)) ASC
            LIMIT 1
        `;
    const params = {
      self_id: this.id,
      x: this.position.x,
      y: this.position.y,
      maxDistanceSquared,
      community_id
    };
    const closestMob = DB.prepare(query).get(params) as { id: string };

    return closestMob ? closestMob.id : undefined;
  }

  findNClosestObjectIDs(
    types: string[],
    maxNum: number,
    maxDistance: number = Infinity
  ): string[] | undefined {
    const maxDistanceSquared = maxDistance * maxDistance;
    const typesList = types.map((type) => `'${type}'`).join(', ');
    const query = `
            SELECT 
                id
            FROM items
            WHERE type IN (${typesList})
            AND ((position_x - :x) * (position_x - :x) + (position_y - :y) * (position_y - :y)) <= :maxDistanceSquared
            ORDER BY ((position_x - :x) * (position_x - :x) + (position_y - :y) * (position_y - :y)) ASC
            LIMIT :maxNum
        `;
    const result = DB.prepare(query).all({
      x: this.position.x,
      y: this.position.y,
      maxDistanceSquared,
      maxNum: maxNum !== Infinity ? maxNum : 1000 // maxNum cannot be Infinity (SQLite Mismatch error)
    }) as { id: string }[];
    return result ? result.map((res) => res.id) : undefined;
  }

  setMoveTarget(target: Coord, fuzzy: boolean = false): boolean {
    const start = this.position;
    const end = floor(target);
    if (
      //equals(this.target?, end) ||
      equals(floor(start), end) &&
      this.target == null
    ) {
      return true;
    }
    if (equals(floor(start), end)) {
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
    newHealth = Math.max(newHealth, 0);
    DB.prepare(
      `
            UPDATE mobs
            SET health = :health
            WHERE id = :id
        `
    ).run({ health: newHealth, id: this.id });
    this._health = newHealth;
    pubSub.changeHealth(this.id, amount, this.health);
    // don't remove mob from server db if it is the player
    // so that the player info can be saved.
    if (this.health <= 0 && this.type == 'player') {
      this.destroy();
    } else if (this.health <= 0) {
      DB.prepare(
        `
                DELETE FROM mobs
                WHERE id = :id
            `
      ).run({ id: this.id });
      this.destroy();
    }
  }

  changeAttack(amount: number) {
    if (amount === 0) return;
    let newAttack = this.attack + amount;
    if (newAttack <= 0) {
      newAttack = 0;
    }
    DB.prepare(
      `
            UPDATE mobs
            SET attack = :attack
            WHERE id = :id
        `
    ).run({ attack: newAttack, id: this.id });
    this.attack = newAttack;
    pubSub.changeAttack(this.id, amount, this.attack);
  }

  changeMaxHealth(amount: number, fromGold: boolean = false) {
    if (amount === 0) return;

    // get the number of gold potions already used
    const currentIncreases = DB.prepare(
      `SELECT goldPotionsUsed FROM mobs WHERE id = :id`
    ).get({ id: this.id }) as { goldPotionsUsed: number };

    // stop if at limit
    if (fromGold && currentIncreases.goldPotionsUsed >= 5) {
      return;
    }

    // increment usage count (only if from gold potion) and max health
    const newIncreaseCount = fromGold
      ? currentIncreases.goldPotionsUsed + 1
      : currentIncreases.goldPotionsUsed;
    const newMaxHealth = this.maxHealth + amount;

    // apply changes
    DB.prepare(
      `UPDATE mobs 
      SET maxHealth = :maxHealth, 
          goldPotionsUsed = :increaseCount 
      WHERE id = :id`
    ).run({
      maxHealth: newMaxHealth,
      increaseCount: newIncreaseCount,
      id: this.id
    });

    this.maxHealth = newMaxHealth;
    pubSub.changeMaxHealth(this.id, amount, this.maxHealth);
  }

  changeSlowEnemy(amount: number) {
    // get current amount of slowEnemy debuffs
    const currentIncreases = DB.prepare(
      `SELECT slowEnemy FROM mobs WHERE id = :id`
    ).get({ id: this.id }) as { slowEnemy: number };

    // change amount of slowEnemy debuffs
    const newSlowEnemy = currentIncreases.slowEnemy + amount;

    DB.prepare(
      `
            UPDATE mobs
            SET slowEnemy = :newSlowEnemy
            WHERE id = :id
        `
    ).run({ id: this.id, newSlowEnemy: newSlowEnemy });
  }

  changeSpeed(amount: number) {
    if (amount === 0) return;
    let newSpeed = this.speed + amount;
    DB.prepare(
      `
            UPDATE mobs
            SET speed = :speed
            WHERE id = :id
        `
    ).run({ speed: newSpeed, id: this.id });
    this.speed = newSpeed;
    pubSub.changeSpeed(this.id, amount, this.speed);
  }

  changePersonality(trait: string, amount: number) {
    if (amount === 0) return;
    const traitKey = trait as PersonalityTraits;
    let newValue = this.personality.traits[traitKey] + amount;
    DB.prepare(
      `
            UPDATE personalities
            SET ${trait} = :value
            WHERE mob_id = :id
        `
    ).run({ value: newValue, id: this.id });
    this.personality.traits[traitKey] = newValue;
    pubSub.changePersonality(this.id, trait, amount);
  }

  changeEffect(delta: number, duration: number, attribute: string): void {
    // only responsible for inserting rows and broadcasting changes
    const targetTick = this.current_tick + duration;
    let finalDelta = delta;

    // check if an effect is already active
    const current_delta = DB.prepare(
      `
      SELECT delta
      FROM mobEffects
      WHERE id = :id AND attribute = :attribute AND targetTick > :currentTick
      LIMIT 1
      `
    ).get({
      id: this.id,
      attribute: attribute,
      currentTick: this.current_tick
    }) as { delta: number };

    // if so, then set the final delta to current delta
    if (current_delta) {
      finalDelta = current_delta.delta;
      pubSub.changeTargetTick(this.id, attribute, duration, targetTick);
    }

    // put in new row into mobEffects with the delta
    DB.prepare(
      `
      INSERT INTO mobEffects (id, attribute, delta, targetTick)
      VALUES (:id, :attribute, :delta, :targetTick)
      `
    ).run({
      id: this.id,
      attribute: attribute,
      delta: finalDelta,
      targetTick: targetTick
    });

    // grab updated value
    const value = DB.prepare(
      `
      SELECT ${attribute}
      FROM mobView
      WHERE id = :id 
      `
    ).get({
      id: this.id
    }) as Record<string, number>;

    if (!current_delta) {
      pubSub.changeEffect(this.id, attribute, finalDelta, value[attribute]);
    }
  }

  private checkPoison(): void {
    if (this.poisoned == 1){
      const deltaDamage = Math.floor(Math.random() * -10);

      this.changeHealth(deltaDamage);
    }

  }

  private checkTickReset(): void {
    type QueryResult = {
      attribute: string;
      delta: number;
    };

    const result = DB.prepare(
      `
      WITH current_effects AS (
        SELECT attribute
        FROM mobEffects
        WHERE id = :id AND targetTick > :currentTick
        GROUP BY attribute
      )
      DELETE FROM mobEffects
      WHERE id = :id AND attribute NOT IN (SELECT attribute FROM current_effects)
      RETURNING attribute, delta
      `
    ).all({
      id: this.id,
      currentTick: this.current_tick
    }) as QueryResult[] | undefined;

    if (!result) {
      return;
    }

    // reduce the list to only unique attr's so we don't broadcast multiple deletions
    const uniqueRes: QueryResult[] = Object.values(
      result.reduce((acc: Record<string, QueryResult>, item: QueryResult) => {
        // if the attribute already exists in the accumulator, keep the higher delta
        if (acc[item.attribute]) {
          if (item.delta > acc[item.attribute].delta) {
            acc[item.attribute] = item;
          }
        } else {
          // else add the item to the accumulator
          acc[item.attribute] = item;
        }
        return acc;
      }, {})
    );

    for (const row of uniqueRes) {
      // get the new value for the attribute and broadcast it
      const value = DB.prepare(
        `
        SELECT ${row.attribute}
        FROM mobView
        WHERE id = :id
        `
      ).get({ id: this.id }) as Record<string, number>;

      pubSub.changeEffect(
        this.id,
        row.attribute,
        -row.delta,
        value[row.attribute]
      );
    }
  }

  getHouse(): House | undefined {
    const houseData = DB.prepare(
      `
            SELECT houses.id, top_left_x, top_left_y, width, height, houses.community_id
            FROM houses
            JOIN mobView ON mobView.house_id = houses.id
            WHERE mobView.id = :id
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

      if (this.type === 'player') {
        // If the player dies, drop half their gold
        const halfGold = Math.floor(this.gold / 2);
        itemGenerator.createItem({
          type: 'gold',
          position,
          attributes: { amount: halfGold }
        });
        // NOTE: The team working on the persistence feature (which
        // is currently incomplete on mainline) will update the changeGold
        // method to persist to supabase in addition to the local DB
        this.changeGold(-halfGold);
      } else {
        // Otherwise drop all of the mob's gold
        itemGenerator.createItem({
          type: 'gold',
          position,
          attributes: { amount: this.gold }
        });
      }
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
    DB.prepare(
      `
            UPDATE mobs
            SET position_x = :position_x, position_y = :position_y, path = :path, target_x = :target_x, target_y = :target_y
            WHERE id = :id
        `
    ).run({
      position_x: this._position.x,
      position_y: this._position.y,
      id: this.id,
      path: JSON.stringify(this.path),
      target_x: this.target ? this.target?.x : null,
      target_y: this.target ? this.target?.y : null
    });
  }

  chatRequest(mob: Mob): boolean {
    conversationTracker.startConversation(mob, this);
    return false;
  }

  fightRequest(mob: Mob): boolean {
    console.log('fight request from ' + mob.name);
    // TODO: replace with FightTracker class
    pubSub.playerAttacks(mob.id, ['Test Attack']);
    // fightTracker.startFight(mob, this);
    this.updateFightFavorability(mob);
    return false;
  }

  /**
   * Updates mob species' favorability to decrease by 20 with the player
   * @param mob The target mob whose species you want to decrease favorability with
   */
  updateFightFavorability(mob: Mob): void {
    var id = mob.community_id;
    DB.prepare(
      `   
      UPDATE favorability
        SET favor = favor - 20
        WHERE
            (community_1_id = :id_1 AND community_2_id = :id_2) OR
            (community_1_id = :id_2 AND community_2_id = :id_1)
        `
    ).run({ id_1: 'alchemists', id_2: id });
    Favorability.updatePlayerStat(this);
  }

  static findCarryingMobID(item_id: string): string | undefined {
    const mob = DB.prepare(
      `
            SELECT id
            FROM mobView
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
            FROM mobView
            WHERE action_type = :type
        `
    ).get({ type }) as { count: number };
    return count.count;
  }

  getNumAlliesTargettingPos(
    community_id: string,
    x: number,
    y: number
  ): number {
    // Get the number of allied mobs targeting x, y, excluding yourself
    const count = DB.prepare(
      `
        SELECT COUNT(*) as count
        FROM mobView
        WHERE community_id = :community_id AND
          target_x = :x AND
          target_y = :y AND
          id != :mobId
      `
    ).get({ community_id, x, y, mobId: this.id }) as { count: number };
    return count.count;
  }

  static getMob(key: string): Mob | undefined {
    const mob = DB.prepare(
      `
            SELECT id, action_type, subtype, name, gold, maxHealth, health, attack, defense, favorite_item, speed, position_x, position_y, path, target_x, target_y, current_action, carrying_id, community_id
            FROM mobView
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
      defense: mob.defense,
      favorite_item: mob.favorite_item,
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
            JOIN mobView ON mobView.community_id = items.owned_by
            WHERE mobView.id = :id and item_attributes.attribute = 'items'
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
            JOIN mobView ON mobView.community_id = items.owned_by
            WHERE item_attributes.attribute = 'items' AND mobView.id = :id
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
            FROM mobView;
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

    this.checkTickReset();
    this.checkPoison();
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
            goldPotionsUsed INTEGER DEFAULT 0,
            damageOverTime INTEGER DEFAULT 0,
            poisoned INTEGER DEFAULT 0,
            slowEnemy INTEGER DEFAULT 0,
            attack INTEGER NOT NULL,
            defense INTEGER NOT NULL,
            favorite_item TEXT,
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
            FOREIGN KEY (carrying_id) REFERENCES items (id) ON DELETE SET NULL,
            FOREIGN KEY (community_id) REFERENCES community (id) ON DELETE SET NULL,
            FOREIGN KEY (house_id) REFERENCES houses (id) ON DELETE SET NULL
        );
    `;

  static effectsSQL = `
        CREATE TABLE mobEffects (
            id TEXT,
            attribute TEXT,
            delta INT,
            targetTick INTEGER,
            FOREIGN KEY (id) REFERENCES mobs (id) ON DELETE SET NULL 
        );
    `;

  static viewSQL = `
    CREATE VIEW mobView AS
        SELECT 
          m.id,
          m.action_type,
          m.subtype,
          m.name,
          m.gold,
          m.health,
          m.maxHealth,
          m.goldPotionsUsed,
          m.damageOverTime + COALESCE(
            (SELECT delta FROM mobEffects AS e WHERE e.id = m.id AND attribute = 'damageOverTime' ORDER BY e.targetTick DESC LIMIT 1)
            , 0) AS damageOverTime,
          m.poisoned + COALESCE(
            (SELECT delta FROM mobEffects AS e WHERE e.id = m.id AND attribute = 'poisoned' ORDER BY e.targetTick DESC LIMIT 1)
            , 0) AS poisoned,
          m.slowEnemy,
          m.defense + COALESCE(
            (SELECT delta FROM mobEffects AS e WHERE e.id = m.id AND attribute = 'defense' ORDER BY e.targetTick DESC LIMIT 1)
            , 0) AS defense,
          m.attack + COALESCE(
            (SELECT delta FROM mobEffects AS e WHERE e.id = m.id AND attribute = 'attack' ORDER BY e.targetTick DESC LIMIT 1)
            , 0) AS attack,
          m.favorite_item,
          m.speed + COALESCE(
            (SELECT delta FROM mobEffects AS e WHERE e.id = m.id AND attribute = 'speed' ORDER BY e.targetTick DESC LIMIT 1)
            , 0) AS speed,
          m.position_x,
          m.position_y,
          m.carrying_id,
          m.path,
          m.target_x,
          m.target_y,
          m.current_action,
          m.satiation,
          m.max_energy,
          m.energy,
          m.social,
          m.community_id,
          m.house_id
        FROM mobs AS m
      ;
    `;
}
