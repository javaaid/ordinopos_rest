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

function escapeCsvCell(cell: any): string {
  if (cell === undefined || cell === null) {
    return '';
  }
  const str = cell.toString();
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCsv(headers: string[], rows: (string|number|boolean|undefined|null)[][]): string {
  const headerRow = headers.map(escapeCsvCell).join(',');
  const contentRows = rows.map(row => row.map(escapeCsvCell).join(','));
  return [headerRow, ...contentRows].join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToCsv(headers: string[], rows: (string|number|boolean|undefined|null)[][], filename: string) {
  const csvContent = arrayToCsv(headers, rows);
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        return (error as { message: string }).message;
    }
    if (typeof error === 'string' && error.length > 0) {
        return error;
    }
    try {
        const stringified = JSON.stringify(error);
        if (stringified !== '{}' && stringified !== '[]') {
            return stringified;
        }
    } catch {
        // Fall through
    }
    return 'An unexpected error occurred. Check the browser console for details.';
}
