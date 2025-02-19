// In /test/social/fantasyDate.test.ts

import {
  current_date,
  set_current_date
} from '../../src/library/social/fantasyDate';
import { DB } from '../../src/library/database';

// Declare the interface locally in the test file if you don't want to export it
interface FantasyDate {
  date_description: string;
  tick: number;
}

jest.mock('../../src/library/database', () => {
  return {
    DB: {
      prepare: jest.fn(() => ({
        run: jest.fn(),
        get: jest.fn()
      }))
    }
  };
});

describe('Fantasy Date Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear any previous mock calls before each test
  });

  describe('current_date()', () => {
    it('should fetch the current fantasy date from the database', () => {
      const mockResult: FantasyDate = {
        date_description: 'Year 1, Day 100',
        tick: 100
      };
      (DB.prepare as jest.Mock).mockReturnValueOnce({
        get: jest.fn().mockReturnValue(mockResult)
      });

      const result = current_date();

      //   expect(DB.prepare).toHaveBeenCalledWith(
      //     expect.stringContaining('SELECT date_description, tick FROM fantasy_date')
      //   );
      expect(result).toEqual(mockResult);
    });

    it('should return undefined if no result is found', () => {
      (DB.prepare as jest.Mock).mockReturnValueOnce({
        get: jest.fn().mockReturnValue(undefined)
      });

      const result = current_date();

      expect(DB.prepare).toHaveBeenCalled();
      expect(result).toEqual(undefined);
    });
  });

  describe('set_current_date()', () => {
    it('should set the current fantasy date in the database', () => {
      const date: FantasyDate = {
        date_description: 'Year 1, Day 200',
        tick: 200
      };

      set_current_date(date);
    });
  });
});
