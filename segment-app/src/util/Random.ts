import { createHash, randomUUID } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ntc = require('ntcjs');

export function randomString() {
  return randomUUID();
}

export function deriveColor(str: string) {
  // calculate the sha256 hash of the input string
  const hash = createHash('sha256').update(str).digest('hex');

  // Extract the first three bytes of the hash
  const r = hash.slice(0, 2);
  const g = hash.slice(2, 4);
  const b = hash.slice(4, 6);

  // Convert the bytes to decimal and then to a percentage
  const red = parseInt(r, 16) / 255;
  const green = parseInt(g, 16) / 255;
  const blue = parseInt(b, 16) / 255;

  // Use the RGB values to calculate the HSL values
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const diff = max - min;

  let hue, saturation, lightness;

  if (diff === 0) {
    hue = 0;
  } else if (max === red) {
    hue = ((green - blue) / diff) % 6;
  } else if (max === green) {
    hue = (blue - red) / diff + 2;
  } else {
    hue = (red - green) / diff + 4;
  }

  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  lightness = (max + min) / 2;

  if (diff === 0) {
    saturation = 0;
  } else {
    saturation = diff / (1 - Math.abs(2 * lightness - 1));
  }

  saturation = Math.round(saturation * 100);
  lightness = Math.round(lightness * 100);

  // convert the hsl values to a css string
  const colorStr = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  // convert the rgb values to a hex code
  const hexCode = `#${r}${g}${b}`;

  // use the hex code to look up a color name
  const colorName = ntc.name(hexCode)[1];

  // Return an object with the hex code and color name
  return {
    hexCode,
    colorName,
    colorStr,
  };
}
