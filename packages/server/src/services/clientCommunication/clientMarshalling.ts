import { FantasyDateI, HouseI, ItemI, MobI } from '@rt-potion/common';
import { DB } from '../database';
import { HouseData } from '../../community/house';
import { ItemAttributeData, ItemData } from '../../items/item';
import { Mob, MobData } from '../../mobs/mob';
import { FantasyDate } from '../../date/fantasyDate';
import { Personality, Personalities } from '../../mobs/traits/personality';

export function getHousesAbly(): HouseI[] {
  const houseDatas = DB.prepare(
    `
        SELECT 
            id,
            top_left_x,
            top_left_y,
            width,
            height
        FROM
        houses;
        `
  ).all() as HouseData[];

  const houses: HouseI[] = [];
  for (const houseData of houseDatas) {
    houses.push({
      id: houseData.id,
      top_left: { x: houseData.top_left_x, y: houseData.top_left_y },
      width: houseData.width,
      height: houseData.height
    });
  }
  return houses;
}

export function dateToFantasyDate(date: FantasyDate): FantasyDateI {
  return {
    time: date.time(),
    description: date.toString()
  };
}

function mobDataToMob(mobData: MobData): MobI {
  const mob: MobI = {
    personalities:
      mobData.personalities && mobData.personalities.traits
        ? Object.fromEntries(
            Object.entries(mobData.personalities.traits).map(([key, value]) => {
              const numericValue = Number(value);
              return [key, isNaN(numericValue) ? 0 : numericValue];
            })
          )
        : {},
    id: mobData.id,
    position: { x: mobData.position_x, y: mobData.position_y },
    type: mobData.action_type,
    subtype: mobData.subtype,
    target:
      mobData.target_x && mobData.target_y
        ? { x: mobData.target_x, y: mobData.target_y }
        : undefined,
    path: mobData.path ? JSON.parse(mobData.path) : [],
    name: mobData.name,
    maxHealth: mobData.maxHealth,
    carrying: mobData.carrying_id,
    community_id: mobData.community_id,
    attributes: {
      health: mobData.health,
      gold: mobData.gold,
      speed: mobData.speed,
      attack: mobData.attack,
      defense: mobData.defense
    },
    unlocks: mobData.community_id ? [mobData.community_id] : [],
    doing: mobData.current_action
  };
  return mob;
}

export function getMobsAbly(): MobI[] {
  const mobDatas = DB.prepare(
    `
    SELECT 
        id,
        action_type,
        subtype,
        name,
        gold,
        health,
        maxHealth,
        attack,
        speed,
        position_x,
        position_y,
        path,
        target_x,
        target_y,
        current_action,
        carrying_id,
        community_id
    FROM mobView;
    `
  ).all() as MobData[];

  const personalityDatas = DB.prepare(
    `
    SELECT 
        mob_id,
        stubbornness,
        bravery,
        aggression,
        industriousness,
        adventurousness,
        gluttony,
        sleepy,
        extroversion
    FROM personalities;
    `
  ).all() as Personalities[];

  const personalityMap = new Map<string, Personalities>();
  for (const personality of personalityDatas) {
    personalityMap.set(personality.mob_id, personality);
  }

  const mobs: MobI[] = mobDatas.map((mobData) => {
    const personalityData = personalityMap.get(mobData.id);

    mobData.personalities = new Personality({
      mob_id: mobData.id,
      stubbornness: personalityData?.stubbornness ?? 0,
      bravery: personalityData?.bravery ?? 0,
      aggression: personalityData?.aggression ?? 0,
      industriousness: personalityData?.industriousness ?? 0,
      adventurousness: personalityData?.adventurousness ?? 0,
      gluttony: personalityData?.gluttony ?? 0,
      sleepy: personalityData?.sleepy ?? 0,
      extroversion: personalityData?.extroversion ?? 0
    });

    return mobDataToMob(mobData);
  });

  return mobs;
}

function itemDataToItem(
  itemData: ItemData,
  itemAttributeData: ItemAttributeData[]
): ItemI {
  const item: ItemI = {
    id: itemData.id,
    name: '', // Placeholder, replace with the actual name logic
    type: itemData.type,
    subtype: itemData.subtype,
    position: { x: itemData.position_x, y: itemData.position_y },
    lock: itemData.lock,
    house: itemData.house_id,
    ownedBy: itemData.owned_by,
    carried_by: Mob.findCarryingMobID(itemData.id),
    attributes: itemAttributeData.reduce(
      (acc, attribute) => {
        acc[attribute.attribute] = attribute.value;
        return acc;
      },
      {} as Record<string, string | number>
    )
  };

  item.templateType = item.attributes['templateType'] as string;

  return item;
}

export function getMobAbly(key: string): MobI {
  const mobData = DB.prepare(
    `
    SELECT 
        id,
        action_type,
        subtype,
        name,
        gold,
        health,
        attack,
        speed,
        position_x,
        position_y,
        path,
        target_x,
        target_y,
        current_action,
        carrying_id,
        community_id
    FROM mobView
    WHERE id = :id;
    `
  ).get({ id: key }) as MobData;

  const personalityData = DB.prepare(
    `
    SELECT 
        stubbornness,
        bravery,
        aggression,
        industriousness,
        adventurousness,
        gluttony,
        sleepy,
        extroversion
    FROM personalities
    WHERE mob_id = :id;
    `
  ).get({ id: key }) as Personalities;

  mobData.personalities = new Personality({
    mob_id: mobData.id,
    stubbornness: personalityData.stubbornness ?? 0,
    bravery: personalityData.bravery ?? 0,
    aggression: personalityData.aggression ?? 0,
    industriousness: personalityData.industriousness ?? 0,
    adventurousness: personalityData.adventurousness ?? 0,
    gluttony: personalityData.gluttony ?? 0,
    sleepy: personalityData.sleepy ?? 0,
    extroversion: personalityData.extroversion ?? 0
  });

  return mobDataToMob(mobData);
}

export function getItemAbly(key: string): ItemI {
  const itemData = DB.prepare(
    `
        SELECT 
            items.id,
            items.type,
            items.subtype,
            items.position_x,
            items.position_y,
            items.house_id,
            items.lock,
            items.owned_by,
            mobs.id carrying_id
        FROM items
        LEFT JOIN mobs ON mobs.carrying_id = items.id
        WHERE items.id = :id;
        `
  ).get({ id: key }) as ItemData;

  const itemAttributeDatas = DB.prepare(
    `
            SELECT 
                attribute,
                value
            FROM item_attributes
            WHERE item_id = :id;
            `
  ).all({ id: key }) as ItemAttributeData[];

  return itemDataToItem(itemData, itemAttributeDatas);
}

export function getItemsAbly(): ItemI[] {
  const itemDatas = DB.prepare(
    `
        SELECT 
            items.id,
            items.type,
            items.subtype,
            items.position_x,
            items.position_y,
            items.house_id,
            items.lock,
            items.owned_by,
            mobs.id carrying_id
        FROM items
        LEFT JOIN mobs ON mobs.carrying_id = items.id;
        `
  ).all() as ItemData[];

  const items: ItemI[] = [];
  for (const itemData of itemDatas) {
    const itemAttributeDatas = DB.prepare(
      `
            SELECT 
                attribute,
                value
            FROM item_attributes
            WHERE item_id = :id;
            `
    ).all({ id: itemData.id }) as ItemAttributeData[];

    items.push(itemDataToItem(itemData, itemAttributeDatas));
  }

  return items;
}
