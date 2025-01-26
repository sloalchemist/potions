export function hexStringToNumber(hexString: string): number {
  // Remove the '#' if it exists
  if (hexString.startsWith('#')) {
    hexString = hexString.slice(1);
  }
  // Parse the string as a hexadecimal number
  return parseInt(hexString, 16);
}

export function combineHexColors(hex1: string, hex2: string): string {
  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    if (hex.startsWith("#")) {
      hex = hex.slice(1);
    }
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number): string =>
    `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;

  // Parse the two colors
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  // Average the RGB components
  const combinedRgb = {
    r: Math.round((rgb1.r + rgb2.r) / 2),
    g: Math.round((rgb1.g + rgb2.g) / 2),
    b: Math.round((rgb1.b + rgb2.b) / 2),
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
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}
