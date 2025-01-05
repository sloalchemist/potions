export function hexStringToNumber(hexString: string): number {
  // Remove the '#' if it exists
  if (hexString.startsWith('#')) {
    hexString = hexString.slice(1);
  }
  // Parse the string as a hexadecimal number
  return parseInt(hexString, 16);
}

export function darkenColor(hexColor: number, percent: number): number {
  // Ensure the percentage is between 0 and 100
  percent = Math.min(100, Math.max(0, percent));

  // Extract the RGB components from the hexadecimal color
  const r = (hexColor >> 16) & 0xff;
  const g = (hexColor >> 8) & 0xff;
  const b = hexColor & 0xff;

  // Calculate the darkened RGB values
  const newR = Math.floor(r * (1 - percent / 100));
  const newG = Math.floor(g * (1 - percent / 100));
  const newB = Math.floor(b * (1 - percent / 100));

  // Combine the new RGB values back into a single hexadecimal number
  const darkenedHexColor = (newR << 16) | (newG << 8) | newB;

  return darkenedHexColor;
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
