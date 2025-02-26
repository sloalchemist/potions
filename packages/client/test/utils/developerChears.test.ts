import {
  speedUpCharacter,
  restoreHealth,
  persistWorldData
} from '../../src/utils/developerCheats';
import { publishPlayerMessage } from '../../src/services/playerToServer';

jest.mock('../../src/services/playerToServer');

describe('developerCheats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('speedUpCharacter should publish speed cheat message', () => {
    speedUpCharacter();
    expect(publishPlayerMessage).toHaveBeenCalledWith('cheat', {
      action: 'speed'
    });
  });

  test('restoreHealth should publish health cheat message', () => {
    restoreHealth();
    expect(publishPlayerMessage).toHaveBeenCalledWith('cheat', {
      action: 'health'
    });
  });

  test('persistWorldData should publish save cheat message', () => {
    persistWorldData();
    expect(publishPlayerMessage).toHaveBeenCalledWith('cheat', {
      action: 'save'
    });
  });
});
