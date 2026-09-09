import { access, mkdir } from 'node:fs/promises';
import { extname, parse } from 'node:path';
import process from 'node:process';

process.env.XDG_CACHE_HOME ??= '/tmp/ryan-site-font-cache';
await mkdir(process.env.XDG_CACHE_HOME, { recursive: true });
const { default: sharp } = await import('sharp');

const args = process.argv.slice(2);
const force = args.includes('--force');
const values = args.filter((arg) => arg !== '--force');
const [input, requestedOutput] = values;

if (!input) {
  console.error('Usage: pnpm media:image <input> [output.webp|output.avif] [--force]');
  process.exit(1);
}

const inputPath = parse(input);
const output = requestedOutput ?? `${inputPath.dir}/${inputPath.name}.webp`;
const format = extname(output).slice(1).toLowerCase();

if (!['webp', 'avif'].includes(format)) {
  console.error('Output must use .webp or .avif.');
  process.exit(1);
}

if (!force) {
  try {
    await access(output);
    console.error(`Refusing to overwrite ${output}. Pass --force to replace it.`);
    process.exit(1);
  } catch {
    // The destination does not exist and is safe to create.
  }
}

const pipeline = sharp(input).rotate().resize({ width: 1800, withoutEnlargement: true });
if (format === 'avif') await pipeline.avif({ quality: 68, effort: 5 }).toFile(output);
else await pipeline.webp({ quality: 82, effort: 5 }).toFile(output);

const metadata = await sharp(output).metadata();
console.log(`Created ${output} (${metadata.width}×${metadata.height}, ${metadata.format})`);
