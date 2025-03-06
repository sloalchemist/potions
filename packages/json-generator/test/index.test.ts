import { readFileSync } from 'fs';
import { executeWithArgs } from '../src/generator';
import path from 'node:path';

describe('validate global json', () => {
  beforeAll(() => {
    executeWithArgs(['server', 'client']);
  });

  it('validate client global json', () => {
    const expected = readFileSync(__dirname + '/expectedClient.json', 'utf8');
    const actual = readFileSync(
      path.join(__dirname, '../../client/world_assets/global.json'),
      'utf8'
    );
    expect(JSON.parse(actual)).toStrictEqual(JSON.parse(expected));
  });

  it('validate server global json', () => {
    const expected = readFileSync(__dirname + '/expectedServer.json', 'utf8');
    const actual = readFileSync(
      path.join(__dirname, '../../server/world_assets/global.json'),
      'utf8'
    );
    expect(JSON.parse(actual)).toStrictEqual(JSON.parse(expected));
  });
});
