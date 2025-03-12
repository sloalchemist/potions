import path from 'node:path';
import { globalJsonSchema } from '../src/schema';
import { executeWithArgs } from '../src/generator';

// Mock only the writeFileSync function of the fs module
jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs');
  return {
    ...originalModule,
    writeFileSync: jest.fn()
  };
});

// Import fs after mocking
import * as fs from 'fs';

describe('generator processes global.json', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('global.json passes validation', () => {
    const globalJsonString = fs.readFileSync(
      path.join(__dirname, '../global.json'),
      'utf8'
    );
    const globalJsonObject = JSON.parse(globalJsonString);

    const result = globalJsonSchema.parse(globalJsonObject);
    expect(result).toBeDefined();
  });

  it('client global.json passes validation', () => {
    // Get the mocked writeFileSync function
    const writeFileSyncMock = fs.writeFileSync as jest.Mock;

    executeWithArgs(['client']);

    expect(writeFileSyncMock).toHaveBeenCalled();

    const clientGlobalJsonString = writeFileSyncMock.mock.calls[0][1] as string;
    const clientGlobalJsonObject = JSON.parse(clientGlobalJsonString);

    // Expect there to be exactly 3 keys in the client global.json
    expect(Object.keys(clientGlobalJsonObject).sort()).toEqual([
      'item_types',
      'mob_types',
      'portals'
    ]);

    writeFileSyncMock.mockClear();
  });
});
