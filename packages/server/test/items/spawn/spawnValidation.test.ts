import { loadDefaults } from '../../../src/generate/generateWorld';
import {
  ServerWorldDescription,
  ItemConfig
} from '../../../src/services/gameWorld/worldMetadata';
import { logger } from '../../../src/util/logger';
import { commonSetup, itemGenerator } from '../../testSetup';
import { PathFinder } from '@rt-potion/common';

jest.mock('../../../src/util/logger');
jest.mock('../../../src/items/itemGenerator');
jest.mock('@rt-potion/common');

describe('loadDefaults', () => {
  beforeAll(() => {
    commonSetup();
  });

  let global: ServerWorldDescription;

  beforeEach(() => {
    global = {
      communities: [],
      alliances: [],
      houses: [],
      items: [],
      containers: [],
      tiles: [
        [-1, 1],
        [2, 51]
      ],
      terrain_types: [
        {
          name: `dirt`,
          id: 2,
          walkable: true
        },
        {
          name: `Grass`,
          id: 1,
          walkable: true
        },
        {
          name: `water`,
          id: 51,
          walkable: false
        }
      ],
      item_types: [],
      mob_types: [],
      regions: []
    };

    (PathFinder as jest.Mock).mockImplementation(() => ({
      isWalkable: jest.fn((_, x, y) => {
        const tileId = global.tiles[y]?.[x];
        const terrain = global.terrain_types.find((t) => t.id === tileId);
        return terrain ? terrain.walkable : false;
      })
    }));
  });

  it('no errors on placing items in valid places', () => {
    itemGenerator.createItem({
      type: 'fence',
      position: { x: 1, y: 0 }
    });
    itemGenerator.createItem({
      type: 'heartbeet',
      position: { x: 0, y: 1 }
    });
  });

  it('fail putting a fence on water', () => {
    global.items = [{ type: 'fence', coord: { x: 1, y: 1 } } as ItemConfig];

    expect(() => loadDefaults(global)).toThrowError(
      'Invalid fence placement at (1, 1), please move it!'
    );

    expect(logger.error).toHaveBeenCalledWith(
      'fence at 1, 1 is placed out of walkable terrain, please move it!'
    );
  });

  it('fail putting a fence on nothing', () => {
    global.items = [{ type: 'fence', coord: { x: 0, y: 0 } } as ItemConfig];

    expect(() => loadDefaults(global)).toThrowError(
      'Invalid fence placement at (0, 0), please move it!'
    );

    expect(logger.error).toHaveBeenCalledWith(
      'fence at 0, 0 is placed out of walkable terrain, please move it!'
    );
  });
});
