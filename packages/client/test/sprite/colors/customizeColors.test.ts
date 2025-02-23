import { UxScene } from '../../../src/scenes/uxScene';
import { hexStringToNumber } from '../../../src/utils/color';
import { saveColors, Character } from '../../../src/worldMetadata';

interface WorldMetadata {
  currentCharacter: Character | null;
  saveColors: () => void;
}

jest.mock('../../../src/worldMetadata', () => {
  const originalModule = jest.requireActual('../../../src/worldMetadata');

  const mockedWorldMetadata: Partial<WorldMetadata> = {
    ...originalModule,
    currentCharacter: null,
    saveColors: jest.fn(() => {
      if (!mockedWorldMetadata.currentCharacter) {
        throw new Error('currentCharacter is null!');
      }
      localStorage.setItem(
        'eyeColor',
        mockedWorldMetadata.currentCharacter.eyeColor.toString()
      );
      localStorage.setItem(
        'bellyColor',
        mockedWorldMetadata.currentCharacter.bellyColor.toString()
      );
      localStorage.setItem(
        'furColor',
        mockedWorldMetadata.currentCharacter.furColor.toString()
      );
    })
  };

  return mockedWorldMetadata;
});

describe('Customize Tab Functionality', () => {
  let uxScene: UxScene;
  let saveColorsSpy: jest.SpyInstance;
  let worldMetadata: WorldMetadata;

  beforeEach(() => {
    uxScene = new UxScene();

    worldMetadata = require('../../../src/worldMetadata');
    worldMetadata.currentCharacter = new Character(
      'TestCharacter',
      hexStringToNumber('#123456'),
      hexStringToNumber('#654321'),
      hexStringToNumber('#123654'),
      'alchemists'
    );

    saveColorsSpy = jest.spyOn(worldMetadata, 'saveColors');
  });

  test('Color pickers update character colors correctly and save them', async () => {
    expect(worldMetadata.currentCharacter!.eyeColor).toBe(0x123456);
    expect(worldMetadata.currentCharacter!.bellyColor).toBe(0x123654);
    expect(worldMetadata.currentCharacter!.furColor).toBe(0x654321);
    saveColors();
    expect(localStorage.getItem('eyeColor')).toBe((0x123456).toString(10));
    expect(localStorage.getItem('bellyColor')).toBe((0x123654).toString(10));
    expect(localStorage.getItem('furColor')).toBe((0x654321).toString(10));

    const colorKeys = ['eyeColor', 'bellyColor', 'furColor'];
    const colors = ['#ff0000', '#00ff00', '#0000ff'];

    for (let index = 0; index < 3; index++) {
      const inputElement = document.createElement('input');
      inputElement.type = 'color';
      inputElement.value = colors[index];

      inputElement.addEventListener('input', (event: Event) => {
        const color = hexStringToNumber(
          (event.target as HTMLInputElement).value
        );
        (worldMetadata.currentCharacter as unknown as Record<string, number>)[
          colorKeys[index]
        ] = color;
        saveColors();
      });

      document.body.appendChild(inputElement);
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(worldMetadata.currentCharacter!.eyeColor).toBe(0xff0000);
    expect(worldMetadata.currentCharacter!.bellyColor).toBe(0x00ff00);
    expect(worldMetadata.currentCharacter!.furColor).toBe(0x0000ff);
    expect(localStorage.getItem('eyeColor')).toBe((0xff0000).toString(10));
    expect(localStorage.getItem('bellyColor')).toBe((0x00ff00).toString(10));
    expect(localStorage.getItem('furColor')).toBe((0x0000ff).toString(10));

    expect(saveColorsSpy).toHaveBeenCalledTimes(4);
  });
});
