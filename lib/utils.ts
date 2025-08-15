import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hexToHsl(hex: string): string {
    if (!hex || typeof hex !== 'string') return '0 0% 0%';
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    const hexVal = hex.startsWith('#') ? hex.substring(1) : hex;
    
    if (hexVal.length === 3) {
      r = parseInt(hexVal[0] + hexVal[0], 16);
      g = parseInt(hexVal[1] + hexVal[1], 16);
      b = parseInt(hexVal[2] + hexVal[2], 16);
    } else if (hexVal.length === 6) {
      r = parseInt(hexVal.substring(0, 2), 16);
      g = parseInt(hexVal.substring(2, 4), 16);
      b = parseInt(hexVal.substring(4, 6), 16);
    } else {
        return '0 0% 0%'; // Invalid hex
    }

    // Then to HSL
    r /= 255; g /= 255; b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0, s = 0, l = 0;
    
    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    
    return `${h} ${s}% ${l}%`;
}
