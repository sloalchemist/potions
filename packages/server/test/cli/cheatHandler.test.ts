import { commonSetup, world } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { logger } from '../../src/util/logger';
import { itemGenerator } from '../../src/items/itemGenerator';
import { DB } from '../../src/services/database';
import {
  initializeCli,
  closeCli,
  handleCliCommand,
  rl,
  HELP_PROMPT
} from '../../cli/cheatHandler';
import { Community } from '../../src/community/community';
import exp from 'constants';

jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    close: jest.fn(),
    prompt: jest.fn(),
    on: jest.fn()
  }))
}));

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  Community.makeVillage('blobs', 'Blobby Town');
  Community.makeVillage('fighters', 'Fighters guild');
  Community.makeVillage('silverclaw', 'Village of Silverclaw');
  mobFactory.loadTemplates(world.mobTypes);
  initializeCli();
});

afterEach(() => {
  closeCli();
  jest.clearAllMocks();
  DB.close();
});

describe('Cheat Handler Tests', () => {
  describe('handleCliCommand', () => {
    it('exit command should close the CLI', async () => {
      const closeSpy = jest.spyOn(rl, 'close');
      const logSpy = jest.spyOn(console, 'log');
      handleCliCommand('exit');
      expect(closeSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        'Exiting CLI. Potions server still running.'
      );
    });

    it('help command should print available commands', () => {
      const logSpy = jest.spyOn(console, 'log');
      handleCliCommand('help');
      expect(logSpy).toHaveBeenCalledWith(HELP_PROMPT);
    });

    describe('loglevel CLI Command', () => {
      it('Should change logging level with "loglevel <valid level>" command', () => {
        const logLevelSpy = jest.spyOn(logger, 'setConsoleLogLevel').mockImplementation();

        handleCliCommand('loglevel error');
        expect(logLevelSpy).toHaveBeenCalledWith('error');
      });

      it('Should reject "loglevel <invalid level>" command', () => {
        const logSpy = jest.spyOn(console, 'warn').mockImplementation();
        const logLevelSpy = jest.spyOn(logger, 'setConsoleLogLevel').mockImplementation();

        handleCliCommand('loglevel sillyLevel');
        expect(logSpy).toHaveBeenCalled();
        expect(logLevelSpy).not.toHaveBeenCalled();
      });
    });

    describe('Spawn Item Tests', () => {
      it('should spawn item with valid item type', () => {
        const createItemSpy = jest.spyOn(itemGenerator, 'createItem');
        handleCliCommand('spawn item potion x:0 y:0');
        expect(createItemSpy).toHaveBeenCalledWith({
          type: 'potion',
          position: { x: 0, y: 0 },
          attributes: {
            health: 1
          }
        });
      });

      it('should spawn item with valid item type and no attributes', () => {
        const createItemSpy = jest.spyOn(itemGenerator, 'createItem');
        handleCliCommand('spawn item blueberry-bush x:0 y:0');
        expect(createItemSpy).toHaveBeenCalledWith({
          type: 'blueberry-bush',
          position: { x: 0, y: 0 },
          attributes: {}
        });
      });

      it('should spawn item with invalid item type', () => {
        const logSpy = jest.spyOn(console, 'log');
        handleCliCommand('spawn item invalidItem x:0 y:0');
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Unknown item type: invalidItem')
        );
      });
    });

    it('should not spawn invalid entity type', () => {
      const logSpy = jest.spyOn(console, 'log');
      handleCliCommand('spawn invalidType invalid x:0 y:0');
      expect(logSpy).toHaveBeenCalledWith(
        "Invalid entity type. Spawn either 'mob' or 'item'."
      );
    });

    it('invalid command', () => {
      const logSpy = jest.spyOn(console, 'log');
      handleCliCommand('invalid command');
      expect(logSpy).toHaveBeenCalledWith(
        "Invalid command. Type 'help' for available commands."
      );
    });

    describe('Coordinate Validation Tests', () => {
      it('should error on more than 2 coordinates', () => {
        const logSpy = jest.spyOn(console, 'log');
        handleCliCommand('spawn mob blob x:0 y:0 z:0');
        expect(logSpy).toHaveBeenCalledWith(
          'Invalid number of coordinate arguments. Expected 2, got 3.'
        );
      });

      it('should error on invalid coordinate format', () => {
        const logSpy = jest.spyOn(console, 'log');
        handleCliCommand('spawn mob blob x:0 y');
        expect(logSpy).toHaveBeenCalledWith(
          'Invalid coordinate format: y. Expected format is key:value.'
        );
      });

      it('should error on invalid key', () => {
        const logSpy = jest.spyOn(console, 'log');
        handleCliCommand('spawn mob blob z:0 y:0');
        expect(logSpy).toHaveBeenCalledWith(
          "Invalid key: z. Expected keys are 'x' or 'y'."
        );
      });

      it('should error on invalid value', () => {
        const logSpy = jest.spyOn(console, 'log');
        handleCliCommand('spawn mob blob x:zero y:0');
        expect(logSpy).toHaveBeenCalledWith(
          'Invalid value for x: zero. Expected a number.'
        );
      });
    });
  });
});
