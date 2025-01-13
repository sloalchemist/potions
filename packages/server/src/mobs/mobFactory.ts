import { Coord } from '@rt-potion/common';
import {
  addPerson,
  addPlayer,
  findCommunity,
  Person
} from '@rt-potion/converse';
import { Hunt } from './plans/hunt';
import { Flee } from './plans/flee';
import { Mob } from './mob';
import { Plan } from './plans/plan';
import { Wander } from './plans/wander';
import { Relax } from './plans/relax';
import { Sleep } from './plans/sleep';
import { Heal } from './plans/heal';
import { AcquireWealth } from './plans/acquireWealth';
import { Chat } from './plans/chat';
import { Meal } from './plans/meal';
import { Gather } from './plans/gather';
import { getRandomColor, hexStringToNumber } from '../util/colorUtil';
import { DB } from '../services/database';
import { v4 as uuidv4 } from 'uuid';
import { nameGeneratorFactory } from './names/nameGenerator';
import { House } from '../community/house';
import { pubSub } from '../services/clientCommunication/pubsub';
import { Item } from '../items/item';
import { Container } from '../items/container';
import { MobType } from '../services/gameWorld/worldMetadata';
import { personalityToDescription } from '../util/descriptionUtil';

class MobFactory {
  mobTemplates: Record<string, MobType>;

  constructor() {
    this.mobTemplates = {};
  }

  makeMob(
    type: string,
    position: Coord,
    id?: string,
    name?: string,
    subtype?: string
  ): void {
    if (id == undefined) {
      id = uuidv4();
    }
    const eyeColor = hexStringToNumber(getRandomColor());
    const bellyColor = hexStringToNumber(getRandomColor());
    const furColor = hexStringToNumber(getRandomColor());

    if (subtype == undefined) {
      subtype = `${eyeColor}-${bellyColor}-${furColor}`;
    }
    const mobType = this.getTemplate(type);
    const gold = mobType.gold;

    if (name == undefined) {
      name = nameGeneratorFactory.generateName(mobType.name_style);
    }
    const speed = mobType.speed;
    const attack = mobType.attack;
    const community_id = mobType.community;
    const health = mobType.health;

    const house_id = House.findLeastPopulatedHouse(community_id);

    DB.prepare(
      `
            INSERT INTO mobs
            (id, action_type, name, subtype, gold, health, maxHealth, attack, speed, position_x, position_y, community_id, house_id,
            satiation, max_energy, energy, social)
            VALUES
            (:id, :type, :name, :subtype, :gold, :health, :health, :attack, :speed, :position_x, :position_y, :community_id, :house_id, 100, 100, 100, 100);
            `
    ).run({
      id,
      type,
      name,
      subtype: subtype,
      gold,
      health,
      attack,
      speed,
      position_x: position.x,
      position_y: position.y,
      community_id,
      house_id
    });
    DB.prepare(
      `
            INSERT INTO personalities
            (mob_id, stubbornness, bravery, aggression, industriousness, adventurousness, gluttony, sleepy, extroversion)
            VALUES
            (:id, :stubbornness, :bravery, :aggression, :industriousness, :adventurousness, :gluttony, :sleepy, :extroversion);
            `
    ).run({
      id,
      stubbornness: mobType.stubbornness,
      bravery: mobType.bravery,
      aggression: mobType.aggression,
      industriousness: mobType.industriousness,
      adventurousness: mobType.adventurousness,
      gluttony: mobType.gluttony,
      sleepy: mobType.sleepy,
      extroversion: mobType.extroversion
    });
    pubSub.addMob(id);

    const community = findCommunity(mobType.community);
    if (!community) {
      throw new Error(
        `Can't find community: ${mobType.community} to create mob: ${type}.`
      );
    }

    const person = new Person(
      id,
      name,
      type,
      mobType.description,
      personalityToDescription(Mob.getMob(id)!.personality),
      community,
      [],
      []
    );
    addPerson(person);
    if (type === 'player') {
      addPlayer(id);
    }
  }

  getActionSet(npc: Mob): Plan[] {
    if (npc.type === 'player') {
      return [];
    }

    const actions = [
      new Hunt(),
      new Flee(),
      new Wander(),
      new Relax(),
      new Sleep(),
      new Heal(),
      new Chat(),
      new AcquireWealth(),
      new Meal(npc)
    ];

    const baskets = npc.getBaskets();

    for (const basketID of baskets) {
      const basket = Item.getItem(basketID)!;
      const container = Container.fromItem(basket);

      if (!container) {
        throw new Error('Basket has no container');
      }
      const item_type = container.getType();
      actions.push(new Gather(item_type, 0.8, basket));
    }

    return actions;
  }

  loadTemplates(mobTypes: MobType[]) {
    for (const mobType of mobTypes) {
      this.mobTemplates[mobType.type] = mobType;
    }
  }

  getTemplate(type: string): MobType {
    const template = this.mobTemplates[type];
    if (!template) {
      throw new Error(
        `Unknown mob type: ${type} - ${JSON.stringify(this.mobTemplates)}`
      );
    }
    return template;
  }
}

export const mobFactory = new MobFactory();
