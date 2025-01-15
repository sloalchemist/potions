import { commonSetup, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { Item } from '../../src/items/item';


beforeAll(() => {
  commonSetup();
});

describe('Generate heart-beet', () => {
  test('should generate heart-beet', () => {
    const position = { x: 0, y: 0 };
    itemGenerator.createItem({
      type: 'heart-beet',
      position
    });
    const heartBeetID = Item.getItemIDAt(position);
    expect(heartBeetID).not.toBeNull();
    const heartBeet = Item.getItem(heartBeetID!);
    expect(heartBeet).not.toBeNull();
    expect(heartBeet!.type).toBe('heart-beet');
  });
});
afterAll(() => {
  DB.close();
});