//import { ItemGenerator } from '../../../src/items/itemGenerator';
import { commonSetup } from '../../testSetup';
import { DB } from '../../../src/services/database';
//import { Item } from '../../../src/items/item';

beforeAll(() => {
  commonSetup();
});

describe('Build wall from partial wall', () => {
  test('should build wall from partial wall', () => {
    //generate world

    //create partial wall

    //need to trigger "interact" in buildWall.ts

    //expect there to be a wall at our coords

    //without bug fix there is a partial wall so test fails
    
  });
});

afterAll(() => {
  DB.close();
});