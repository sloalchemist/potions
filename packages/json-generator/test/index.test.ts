import { readFileSync } from 'fs';
import path from 'node:path';
import { globalJsonSchema } from '../src/schema';
import { executeWithArgs } from '../src/generator';

describe('generator processes global.json', () => {
  it('global.json passes validation', () => {
    const globalJsonString = readFileSync(
      path.join(__dirname, '../global.json'),
      'utf8'
    );
    const globalJsonObject = JSON.parse(globalJsonString);

    const result = globalJsonSchema.parse(globalJsonObject);
    expect(result).toBeDefined();
  });

  it('client global.json passes validation', () => {
    executeWithArgs(['client']);

    const clientGlobalJsonString = readFileSync(
      path.join(__dirname, '../../client/world_assets/global.json'),
      'utf8'
    );
    const clientGlobalJsonObject = JSON.parse(clientGlobalJsonString);

    // expect there to be exactly 3 keys
    expect(Object.keys(clientGlobalJsonObject).sort()).toEqual([
      'item_types',
      'mob_types',
      'portals'
    ]);
  });
});
