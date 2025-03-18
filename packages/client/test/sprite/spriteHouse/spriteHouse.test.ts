import { SpriteHouse } from '../../../src/sprite/sprite_house';
import { WorldScene } from '../../../src/scenes/worldScene';
import { World } from '../../../src/world/world';
import { HouseI } from '@rt-potion/common';

jest.mock('../../../src/scenes/worldScene', () => {
  return {
    WorldScene: jest.fn().mockImplementation(() => {
      return {
        add: {
          sprite: jest.fn().mockImplementation(() => {
            return {
              setFrame: jest.fn(), // Mock setFrame method
              setDepth: jest.fn(),
              destroy: jest.fn(),
              setAlpha: jest.fn()
            };
          })
        },
        convertToWorldXY: jest.fn().mockImplementation((coord) => {
          // Mock the convertToWorldXY method to return an array [x, y]
          return [coord.x, coord.y];
        })
      };
    })
  };
});

jest.mock('../../../src/world/world', () => {
  return {
    World: jest.fn().mockImplementation(() => {
      return {
        houses: {}
      };
    })
  };
});

describe('SpriteHouse', () => {
  let scene: WorldScene;
  let house: HouseI;
  let spriteHouse: SpriteHouse;

  beforeEach(() => {
    scene = new WorldScene();
    house = {
      id: 'house1',
      top_left: { x: 0, y: 0 },
      width: 5,
      height: 5
    };

    spriteHouse = new SpriteHouse(scene, house);
  });

  test('should correctly initialize floorSprites and roofSprites', () => {
    // Check the number of floor sprites created
    expect(spriteHouse.floorSprites.length).toBe(24);

    // Check the number of roof sprites created
    expect(spriteHouse.roofSprites.length).toBe(42);

    // Verify that the sprites have been added to the scene
    expect(scene.add.sprite).toHaveBeenCalledTimes(66); // 16 for floor, 36 for roof
  });

  test('should animate roof sprites alpha based on coordinates', () => {
    const coordInside = { x: 2, y: 2 }; // Coordinates within the house
    const coordOutside = { x: -1, y: -1 }; // Coordinates outside the house

    // Call animate with coordinates inside the house
    spriteHouse.animate(coordInside.x, coordInside.y);

    // Check that the alpha of all roof sprites is set to 0.05 when inside
    spriteHouse.roofSprites.forEach((sprite) => {
      expect(sprite.setAlpha).toHaveBeenCalledWith(0.05);
    });

    // Call animate with coordinates outside the house
    spriteHouse.animate(coordOutside.x, coordOutside.y);

    // Check that the alpha of all roof sprites is set to 1 when outside
    spriteHouse.roofSprites.forEach((sprite) => {
      expect(sprite.setAlpha).toHaveBeenCalledWith(1);
    });
  });

  test('should destroy floor and roof sprites and remove house from world', () => {
    const world = new World();
    spriteHouse.destroy(world);

    // Verify floor and roof sprites are destroyed
    spriteHouse.floorSprites.forEach((sprite) => {
      expect(sprite.destroy).toHaveBeenCalled();
    });
    spriteHouse.roofSprites.forEach((sprite) => {
      expect(sprite.destroy).toHaveBeenCalled();
    });

    // Verify house is deleted from the world
    expect(world.houses[spriteHouse.key]).toBeUndefined();
  });
});
