import { readFileSync } from 'fs';
import path from 'node:path';
import { globalJsonSchema } from '../src/schema';

describe('generator processes global.json', () => {
  it('global.json passes validation', () => {
    const globalJsonString = readFileSync(
      path.join(__dirname, '../global.json'),
      'utf8'
    );
    const globalJsonObject = JSON.parse(globalJsonString);

    const result = globalJsonSchema.safeParse(globalJsonObject);
    expect(result.error).toBeUndefined();
  });
});
