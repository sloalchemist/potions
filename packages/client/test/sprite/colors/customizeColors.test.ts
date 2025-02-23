import { hexStringToNumber, numberToHexString } from '../../../src/utils/color';
import { Character } from '../../../src/worldMetadata';

describe('Customize Tab Functionality', () => {
  let character: Character;
  let saveColors: () => void;

  beforeEach(() => {
    character = new Character(
      'TestCharacter',
      hexStringToNumber('#123456'),
      hexStringToNumber('#654321'),
      hexStringToNumber('#123654'),
      'alchemists'
    );

    saveColors = jest.fn(() => {
      localStorage.setItem('eyeColor', numberToHexString(character.eyeColor));
      localStorage.setItem('furColor', numberToHexString(character.furColor));
      localStorage.setItem(
        'bellyColor',
        numberToHexString(character.bellyColor)
      );
    });
  });

  test('Color pickers update character colors correctly and save them', async () => {
    expect(character.eyeColor).toBe(0x123456);
    expect(character.bellyColor).toBe(0x123654);
    expect(character.furColor).toBe(0x654321);

    saveColors();
    expect(localStorage.getItem('eyeColor')).toBe(numberToHexString(0x123456));
    expect(localStorage.getItem('bellyColor')).toBe(
      numberToHexString(0x123654)
    );
    expect(localStorage.getItem('furColor')).toBe(numberToHexString(0x654321));

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
        (character as unknown as Record<string, number>)[colorKeys[index]] =
          color;
        saveColors(); // Call saveColors after updating the color
      });

      document.body.appendChild(inputElement);
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(character.eyeColor).toBe(0xff0000);
    expect(character.bellyColor).toBe(0x00ff00);
    expect(character.furColor).toBe(0x0000ff);
    expect(localStorage.getItem('eyeColor')).toBe(numberToHexString(0xff0000));
    expect(localStorage.getItem('bellyColor')).toBe(
      numberToHexString(0x00ff00)
    );
    expect(localStorage.getItem('furColor')).toBe(numberToHexString(0x0000ff));
  });
});
