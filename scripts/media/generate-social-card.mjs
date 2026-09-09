import { mkdir } from 'node:fs/promises';
import process from 'node:process';

process.env.XDG_CACHE_HOME ||= '/tmp/ryan-site-font-cache';
await mkdir(process.env.XDG_CACHE_HOME, { recursive: true });
const { default: sharp } = await import('sharp');

await sharp('public/social-card.svg')
  .png({ compressionLevel: 9 })
  .toFile('public/social-card.png');
console.log('Created public/social-card.png (1200×630)');
