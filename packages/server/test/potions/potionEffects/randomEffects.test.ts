import { commonSetup, world, itemGenerator } from '../../testSetup';
import { DB } from '../../../src/services/database';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Community } from '../../../src/community/community';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Drink } from '../../../src/items/uses/drink';
import { FantasyDate } from '../../../src/date/fantasyDate';
import { Coord } from '@rt-potion/common';
import { hexStringToNumber } from '../../../src/util/colorUtil';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  Community.makeVillage('blobs', 'Blobby town');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Consume potions with a random effect', () => {
    test('Random potion effect gets applied', () => {
        FantasyDate.initialDate();
        const mobLocation: Coord = { x: 0, y: 0 };
        const potionLocation: Coord = { x: 1, y: 0 };

        // create a player
        mobFactory.makeMob('player', mobLocation, 'TestID', 'TestPlayer');
        const testMob = Mob.getMob('TestID');
        expect(testMob).not.toBeNull();
        testMob!.changeGold(50);

        // create a potion
        itemGenerator.createItem({
        type: 'potion',
        subtype: String(hexStringToNumber('#ffffff')),
        position: potionLocation,
        carriedBy: testMob
        });
        const potionId = Item.getItemIDAt(potionLocation);
        expect(potionId).not.toBeNull();
        const potion = Item.getItem(potionId!);
        expect(potion).not.toBeNull();

        // ensure the player is carrying the potion
        expect(testMob!.carrying).not.toBeNull();
        expect(testMob!.carrying!.type).toBe('potion');
        expect(testMob!.carrying!.subtype).toBe(
        String(hexStringToNumber('#ffffff'))
        );

        // expected initial stats
        const initSpeed = testMob!._speed;
        const initHealth = testMob!.health;
        const initDefense = testMob!._defense;
        const initAttack = testMob!._attack;
        const initMaxHealth = testMob!._maxHealth;
        const initGold = testMob!.gold;

        expect(initSpeed).toBe(2.5);
        expect(initHealth).toBe(100);
        expect(initDefense).toBe(50);
        expect(initAttack).toBe(5);
        expect(initMaxHealth).toBe(100);
        expect(initGold).toBe(50);

        // have the player drink the potion
        const testDrink = new Drink();
        const test = testDrink.interact(testMob!, potion!);
        expect(test).toBe(true);

        // check to make sure potion is not being carried
        expect(testMob!.carrying).toBeUndefined();

        // get new stats
        const newSpeed = testMob!._speed;
        const newHealth = testMob!.health;
        const newDefense = testMob!._defense;
        const newAttack = testMob!._attack;
        const newMaxHealth = testMob!._maxHealth;
        const newGold = testMob!.gold;

        // check attributes on player
        expect(newSpeed == 1.875
            || newHealth == 80
            || newDefense == 37.5
            || newAttack == 3.75
            || newMaxHealth == 95
            || (newSpeed == 2.875 && newAttack == 5.75 && newDefense == 57.5)
            || newSpeed == 0.5
            || newGold == 45
        ).toBe(true);
        
        for (let i = 0; i < 60; i++) {
            // 60 ticks to ensure stats revert
            FantasyDate.runTick();
        }

        // check attributes on player
        expect(testMob!._speed == initSpeed
            || testMob!.health == newHealth
            || testMob!._defense == initDefense
            || testMob!._attack == initAttack
            || testMob!._maxHealth == newMaxHealth
            || testMob!.gold == newGold
        ).toBe(true);
    });

    test('Random potion effect gets applied to minimum stats', () => {
        FantasyDate.initialDate();
        const mobLocation: Coord = { x: 0, y: 0 };
        const potionLocation: Coord = { x: 1, y: 0 };

        // create a player
        mobFactory.makeMob('player', mobLocation, 'TestID', 'TestPlayer');
        const testMob = Mob.getMob('TestID');
        expect(testMob).not.toBeNull();
        testMob!.changeHealth(-96);
        testMob!.changeMaxHealth(-96);
        testMob!.changeGold(3);

        // create a potion
        itemGenerator.createItem({
        type: 'potion',
        subtype: String(hexStringToNumber('#ffffff')),
        position: potionLocation,
        carriedBy: testMob
        });
        const potionId = Item.getItemIDAt(potionLocation);
        expect(potionId).not.toBeNull();
        const potion = Item.getItem(potionId!);
        expect(potion).not.toBeNull();

        // ensure the player is carrying the potion
        expect(testMob!.carrying).not.toBeNull();
        expect(testMob!.carrying!.type).toBe('potion');
        expect(testMob!.carrying!.subtype).toBe(
        String(hexStringToNumber('#ffffff'))
        );

        // expected initial stats
        const initSpeed = testMob!._speed;
        const initHealth = testMob!.health;
        const initDefense = testMob!._defense;
        const initAttack = testMob!._attack;
        const initMaxHealth = testMob!._maxHealth;
        const initGold = testMob!.gold;

        expect(initSpeed).toBe(2.5);
        expect(initHealth).toBe(4);
        expect(initDefense).toBe(50);
        expect(initAttack).toBe(5);
        expect(initMaxHealth).toBe(4);
        expect(initGold).toBe(3);

        // have the player drink the potion
        const testDrink = new Drink();
        const test = testDrink.interact(testMob!, potion!);
        expect(test).toBe(true);

        // check to make sure potion is not being carried
        expect(testMob!.carrying).toBeUndefined();

        // get new stats
        const newSpeed = testMob!._speed;
        const newHealth = testMob!.health;
        const newDefense = testMob!._defense;
        const newAttack = testMob!._attack;
        const newMaxHealth = testMob!._maxHealth;
        const newGold = testMob!.gold;

        // check attributes on player
        expect(newSpeed == 1.875
            || newHealth == 1
            || newDefense == 37.5
            || newAttack == 3.75
            || newMaxHealth == 1
            || (newSpeed == 2.875 && newAttack == 5.75 && newDefense == 57.5)
            || newSpeed == 0.5
            || newGold == 0
        ).toBe(true);
        
        for (let i = 0; i < 60; i++) {
            // 60 ticks to ensure stats revert
            FantasyDate.runTick();
        }

        // check attributes on player
        expect(testMob!._speed == initSpeed
            || testMob!.health == newHealth
            || testMob!._defense == initDefense
            || testMob!._attack == initAttack
            || testMob!._maxHealth == newMaxHealth
            || testMob!.gold == newGold
        ).toBe(true);
    });
});

afterAll(() => {
    DB.close();
});
