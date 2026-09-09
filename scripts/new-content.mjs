import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import process from 'node:process';

const type = process.argv[2];
const title = process.argv.slice(3).join(' ').trim();
const supported = new Set(['note', 'article', 'project', 'course']);

if (!supported.has(type) || !title) {
  console.error('Usage: pnpm new:<note|article|project|course> "Title"');
  process.exit(1);
}

const slug = title
  .normalize('NFKD')
  .toLowerCase()
  .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
  .replace(/^-+|-+$/g, '');

if (!slug) {
  console.error('The title must contain at least one letter or number.');
  process.exit(1);
}

const collection = `${type}s`;
const target = join(process.cwd(), 'src', 'content', collection, `${slug}.md`);
const date = new Date().toISOString().slice(0, 10);

const frontmatter = {
  note: `---\ntitle: ${title}\ndescription: TODO: Describe the question this note answers.\ndate: ${date}\ntags: []\n---\n\nStart with the question or contradiction that made this worth recording.\n`,
  article: `---\ntitle: ${title}\ndescription: TODO: Describe the argument or synthesis.\ndate: ${date}\ntags: []\nfeatured: false\n---\n\n## Motivation\n\nWhy does this need to be an article?\n\n## Core idea\n\nDevelop the argument here.\n`,
  project: `---\ntitle: ${title}\ndescription: TODO: Describe what this project changes or makes possible.\ndate: ${date}\nstatus: building\ntech: []\ntags: []\nfeatured: false\n---\n\n## Overview\n\n## Motivation\n\n## Architecture\n\n## Technical decisions\n\n## What I learned\n\n## Next steps\n`,
  course: `---\ntitle: ${title}\ndescription: TODO: Describe the learning path.\nstatus: planned\ntopics: []\norder: 0\n---\n\nExplain why these notes belong in one sequence.\n`,
}[type];

try {
  await access(target);
  console.error(`Refusing to overwrite existing content: ${target}`);
  process.exit(1);
} catch {
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, frontmatter, 'utf8');
  console.log(`Created ${target}`);
}
