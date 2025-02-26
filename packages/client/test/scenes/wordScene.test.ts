/* eslint-disable @typescript-eslint/no-explicit-any,
 */
import { WorldScene } from '../../src/scenes/worldScene';

describe('Check WorldScene resetToLoadWorldScene interactions', () => {
  let scene: WorldScene;

  beforeEach(() => {
    scene = new WorldScene();

    scene.scene = {
      stop: jest.fn(),
      start: jest.fn(),
      get: jest.fn().mockReturnValue({
        chatButtons: {
          clearButtonOptions: jest.fn()
        }
      }),
      manager: {
        getScenes: jest
          .fn()
          .mockReturnValue([{ sys: { settings: { key: 'BrewScene' } } }])
      }
    } as any;
  });

  test('stop BrewScene if active when resetting to LoadWorldScene', () => {
    scene.resetToLoadWorldScene();
    expect(scene.scene.stop).toHaveBeenCalledWith('BrewScene');
  });
});
