import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'public', 'icons');
mkdirSync(output, { recursive: true });

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let value = n;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[n] = value >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function blend(pixel, color, alpha) {
  pixel[0] = Math.round(pixel[0] * (1 - alpha) + color[0] * alpha);
  pixel[1] = Math.round(pixel[1] * (1 - alpha) + color[1] * alpha);
  pixel[2] = Math.round(pixel[2] * (1 - alpha) + color[2] * alpha);
}

function makeIcon(size) {
  const rgba = new Uint8Array(size * size * 4);
  const center = size / 2;
  const scale = size / 512;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      const radial = Math.max(0, 1 - Math.hypot(x - center, y - center) / (size * 0.72));
      const topGlow = Math.max(0, 1 - Math.hypot(x - size * 0.68, y - size * 0.2) / (size * 0.7));
      const pixel = [
        Math.round(7 + radial * 4 + topGlow * 2),
        Math.round(9 + radial * 12 + topGlow * 6),
        Math.round(12 + radial * 15 + topGlow * 11),
      ];
      const grid = Math.max(1, Math.round(48 * scale));
      if ((x % grid <= scale || y % grid <= scale) && radial > 0.15) {
        blend(pixel, [67, 230, 194], 0.035);
      }

      const dx = Math.abs(x - center);
      const dy = Math.abs(y - center);
      const diamond = dx + dy;
      const mainRadius = 128 * scale;
      const innerRadius = 68 * scale;
      const lineWidth = Math.max(2, 7 * scale);
      const outerDistance = Math.abs(diamond - mainRadius);
      const innerDistance = Math.abs(diamond - innerRadius);
      if (outerDistance < 20 * scale) {
        blend(pixel, [67, 230, 194], Math.max(0, 0.12 * (1 - outerDistance / (20 * scale))));
      }
      if (outerDistance < lineWidth) {
        blend(pixel, [67, 230, 194], 0.92 * (1 - outerDistance / lineWidth));
      }
      if (innerDistance < lineWidth * 0.75) {
        blend(pixel, [167, 139, 250], 0.88 * (1 - innerDistance / (lineWidth * 0.75)));
      }

      const circleDistance = Math.abs(Math.hypot(x - center, y - center) - 174 * scale);
      if (circleDistance < Math.max(1, 2.2 * scale)) {
        blend(pixel, [94, 120, 130], 0.45);
      }
      const coreDistance = Math.hypot(x - center, y - center);
      if (coreDistance < 38 * scale) {
        blend(pixel, [67, 230, 194], 0.1 + 0.8 * (1 - coreDistance / (38 * scale)));
      }
      if (coreDistance < 11 * scale) blend(pixel, [244, 247, 250], 0.95);

      rgba[index] = pixel[0];
      rgba[index + 1] = pixel[1];
      rgba[index + 2] = pixel[2];
      rgba[index + 3] = 255;
    }
  }
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * stride] = 0;
    Buffer.from(rgba.buffer, y * size * 4, size * 4).copy(raw, y * stride + 1);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(resolve(output, name), makeIcon(size));
}

console.log('Original app icons generated in public/icons.');
