import { readFileSync } from 'fs';
import { executeWithArgs } from '../src/generator';
import path from 'node:path';

describe('validate global json', () => {
  it('validate client global json', () => {
    executeWithArgs(['client', 'server']);

    const expected = readFileSync(__dirname + '/expectedClient.json', 'utf8');

    const actual = readFileSync(
      path.join(__dirname, '../../../world_assets/global/client/global.json'),
      'utf8'
    );

    expect(JSON.parse(expected)).toStrictEqual(JSON.parse(actual));
  });

  // it('validate server global json', () => {
  //   executeWithArgs(['client', 'server']);

  //   const expected = readFileSync(__dirname + '/expectedServer.json', 'utf8');

  //   const actual = readFileSync(
  //     path.join(__dirname, '../../../world_assets/global/server/global.json'),
  //     'utf8'
  //   );

  //   expect(JSON.parse(expected)).toStrictEqual(JSON.parse(actual));
  // });
});
