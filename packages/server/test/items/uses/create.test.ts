import { Create } from '../../../src/items/uses/create';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import * as itemGeneratorModule from '../../../src/items/itemGenerator';
import { Community } from '../../../src/community/community';

// Mock the entire module
jest.mock('../../../src/items/itemGenerator', () => ({
  itemGenerator: {
    createItem: jest.fn()
  }
}));
jest.mock('../../../src/community/community');

describe('Create', () => {
  let mockItem: jest.Mocked<Item>;
  let mockMob: jest.Mocked<Mob>;
  let mockCommunity: jest.Mocked<Community>;

  beforeEach(() => {
    // Create mock item
    mockItem = {
      type: 'template-type',
      subtype: 'test-subtype',
      destroy: jest.fn()
    } as unknown as jest.Mocked<Item>;

    // Create mock mob with position and community
    mockMob = {
      position: { x: 0, y: 0 },
      community_id: 'test-community'
    } as unknown as jest.Mocked<Mob>;

    // Create mock community
    mockCommunity = {} as jest.Mocked<Community>;

    // Mock Community.getVillage
    (Community.getVillage as jest.Mock).mockReturnValue(mockCommunity);

    // Reset all mocks
    jest.clearAllMocks();
  });

  test('should successfully create a new item', () => {
    const type = 'new-item-type';
    const result = Create.createItemFrom(mockItem, mockMob, type);

    expect(result).toBe(true);
    expect(Community.getVillage).toHaveBeenCalledWith(mockMob.community_id);
    expect(itemGeneratorModule.itemGenerator.createItem).toHaveBeenCalledWith({
      type: type,
      subtype: mockItem.subtype,
      position: mockMob.position,
      ownedBy: mockCommunity,
      attributes: {
        templateType: mockItem.type,
        items: 1,
        capacity: 20
      }
    });
    expect(mockItem.destroy).toHaveBeenCalled();
  });

  test('should create item with correct attributes', () => {
    const type = 'new-item-type';
    Create.createItemFrom(mockItem, mockMob, type);

    const createItemCall = (
      itemGeneratorModule.itemGenerator.createItem as jest.Mock
    ).mock.calls[0][0];

    expect(createItemCall.attributes).toEqual({
      templateType: mockItem.type,
      items: 1,
      capacity: 20
    });
  });
});
