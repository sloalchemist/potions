import { AcquireWealth } from '../../../src/mobs/plans/acquireWealth';
import { Mob } from '../../../src/mobs/mob';
import { FindItem } from '../../../src/mobs/plans/means/findItem';

// Mocking FindItem class
jest.mock('../../../src/mobs/plans/means/findItem', () => {
  return {
    FindItem: jest.fn().mockImplementation(() => ({
      itemTypes: ['gold'],
      action: 'pickup',
    })),
  };
});

describe('AcquireWealth', () => {
  let acquireWealth: AcquireWealth;
  let mockMob: jest.Mocked<Mob>;

  beforeEach(() => {
    acquireWealth = new AcquireWealth();
    mockMob = {} as any; // Mock any Mob properties needed
  });

  test('should have the correct description', () => {
    const description = acquireWealth.description();
    expect(description).toBe('found some gold');
  });

  test('should return the correct reaction', () => {
    const reaction = acquireWealth.reaction();
    expect(reaction).toBe('I found some gold!');
  });

  test('should return the correct type', () => {
    const type = acquireWealth.type();
    expect(type).toBe('get rich');
  });

  test('should return the correct benefit value', () => {
    const benefit = acquireWealth.benefit(mockMob);
    expect(benefit).toBe(100);
  });


});
