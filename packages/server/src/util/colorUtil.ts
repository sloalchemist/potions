import Color from 'color';
import DeltaE from 'delta-e';

export function hexStringToNumber(hexString: string): number {
  // Remove the '#' if it exists
  if (hexString.startsWith('#')) {
    hexString = hexString.slice(1);
  }
  // Parse the string as a hexadecimal number
  return parseInt(hexString, 16);
}

// Convert hex to RGB
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
};

export const rgbToHex = (r: number, g: number, b: number): string =>
  `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;

export function hexToLab(hex: string): DeltaE.LAB {
  const [L, A, B] = Color(hex).lab().array();
  return { L, A, B };
}

export function perceptualColorDistance(hex1: string, hex2: string): number {
  const labA = hexToLab(hex1);
  const labB = hexToLab(hex2);
  return DeltaE.getDeltaE00(labA, labB);
}

export function combineHexColors(
  hex1: string,
  hex2: string,
  weight1: number,
  weight2: number
): string {
  // Parse the two colors
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  // Normalize weights (to ensure they sum to 1)
  const totalWeight = weight1 + weight2;
  const w1 = weight1 / totalWeight;
  const w2 = weight2 / totalWeight;

  // Apply gamma correction
  const gamma = 1.8;
  const combinedRgb = {
    r: Math.round(
      Math.pow(
        Math.pow(rgb1.r, gamma) * w1 + Math.pow(rgb2.r, gamma) * w2,
        1 / gamma
      )
    ),
    g: Math.round(
      Math.pow(
        Math.pow(rgb1.g, gamma) * w1 + Math.pow(rgb2.g, gamma) * w2,
        1 / gamma
      )
    ),
    b: Math.round(
      Math.pow(
        Math.pow(rgb1.b, gamma) * w1 + Math.pow(rgb2.b, gamma) * w2,
        1 / gamma
      )
    )
  };

  // Convert back to hex
  return rgbToHex(combinedRgb.r, combinedRgb.g, combinedRgb.b);
}

export function numberToHexString(num: number): string {
  // Convert the number to a hexadecimal string
  let hexString = num.toString(16);
  // Ensure the string is 6 characters long, pad with zeros if necessary
  hexString = hexString.padStart(6, '0');
  // Add the '#' prefix
  return `#${hexString}`;
}

export function getRandomColor(): string {
  const colors = [
    '#a3f1d8', // Light Aqua
    '#7b2c9f', // Deep Purple
    '#e5a73c', // Golden Orange
    '#4d9bea', // Sky Blue
    '#ff5733', // Fiery Red
    '#2ecc71', // Emerald Green
    '#c70039', // Crimson Red
    '#900c3f', // Burgundy
    '#f1c40f', // Bright Yellow
    '#2980b9', // Ocean Blue
    '#8e44ad', // Violet
    '#16a085' // Teal Green
  ] as const satisfies readonly string[];

  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}
