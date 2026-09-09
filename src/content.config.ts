import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const commonWriting = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  demo: z.boolean().default(false),
  related: z.array(z.string()).default([]),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: commonWriting.extend({
    kind: z.literal('article').default('article'),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: commonWriting.extend({
    kind: z.literal('note').default('note'),
    course: z.string().optional(),
    order: z.number().int().positive().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    status: z.enum(['building', 'completed', 'paused', 'archived']),
    tech: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    github: z.url().optional(),
    demoUrl: z.url().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    demo: z.boolean().default(false),
    related: z.array(z.string()).default([]),
  }),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(['planned', 'learning', 'completed', 'paused']),
    startDate: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    sourceUrl: z.url().optional(),
    topics: z.array(z.string()).default([]),
    order: z.number().int().default(0),
    draft: z.boolean().default(false),
    demo: z.boolean().default(false),
  }),
});

const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/now' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
    demo: z.boolean().default(false),
  }),
});

export const collections = { articles, notes, projects, courses, insights, now };
