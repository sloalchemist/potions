import { Mob } from '../../src/world/mob';
import { mobFactory } from '../../../server/src/mobs/mobFactory';
import { gameWorld } from "../../../server/src/services/gameWorld/gameWorld";
import { Coord } from '@rt-potion/common';


describe("Mob Health in Volcano", () => {
  test("Mob loses health inside the volcano every 48 ticks", () => {
    const mobId = "testmob-volcano";
    const volcanoPosition: Coord = { x: 16, y: 24 }; // volcano x range 12 to 20, y range 21 to 27

    mobFactory.makeMob("player", volcanoPosition, mobId, "testPlayer");
    const testMob = Mob.getMob(mobId);

    expect(testMob?.health).toBe(100); // mob starts with full health

    // simulate 48 ticks inside volcano
    for (let tick = 0; tick < 48; tick++) {
        (gameWorld.currentDate as jest.Mock).mockReturnValue({ global_tick: tick });
    }

    (gameWorld.currentDate as jest.Mock).mockReturnValue({ global_tick: 48 });
    expect(testMob?.health).toBe(90); // health should drop by 10
  });

  test("Mob does not lose health if outside the volcano", () => {
    const mobId = "testmob-safe";
    const safePosition: Coord = { x: 100, y: 100 }; // outside volcano

    mobFactory.makeMob("player", safePosition, mobId, "testPlayer");
    const testMob = Mob.getMob(mobId);

    expect(testMob?.health).toBe(100);

    // simulate 48 ticks outside the volcano
    for (let tick = 0; tick < 48; tick++) {
        (gameWorld.currentDate as jest.Mock).mockReturnValue({ global_tick: tick });
    }

    (gameWorld.currentDate as jest.Mock).mockReturnValue({ global_tick: 48 });
    expect(testMob?.health).toBe(100); // health should remain same
  });
});
