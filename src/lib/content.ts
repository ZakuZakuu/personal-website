import { getCollection, type CollectionEntry } from 'astro:content';

import { slugifyTag } from './text';

export type ArticleEntry = CollectionEntry<'articles'>;
export type NoteEntry = CollectionEntry<'notes'>;
export type WritingEntry = ArticleEntry | NoteEntry;
export type ProjectEntry = CollectionEntry<'projects'>;
export type CourseEntry = CollectionEntry<'courses'>;

type DatedEntry = { data: { date: Date } };
type DraftableEntry = { data: { draft: boolean } };

export function sortNewest<T extends DatedEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function withoutDrafts<T extends DraftableEntry>(entries: T[]): T[] {
  return entries.filter((entry) => !entry.data.draft);
}

export async function getWriting(): Promise<WritingEntry[]> {
  const [articles, notes] = await Promise.all([
    getCollection('articles', ({ data }) => !data.draft),
    getCollection('notes', ({ data }) => !data.draft),
  ]);
  return sortNewest<WritingEntry>([...articles, ...notes]);
}

export async function getProjects(): Promise<ProjectEntry[]> {
  return sortNewest(await getCollection('projects', ({ data }) => !data.draft));
}

export async function getCourses(): Promise<CourseEntry[]> {
  const courses = await getCollection('courses', ({ data }) => !data.draft);
  return courses.sort((a, b) => a.data.order - b.data.order);
}

export async function getCourseNotes(courseId: string): Promise<NoteEntry[]> {
  const notes = await getCollection(
    'notes',
    ({ data }) => !data.draft && data.course === courseId,
  );
  return notes.sort(
    (a, b) =>
      (a.data.order ?? Number.MAX_SAFE_INTEGER) - (b.data.order ?? Number.MAX_SAFE_INTEGER),
  );
}

export function writingHref(entry: WritingEntry): string {
  return `/writing/${entry.id}/`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
}

export function getTagIndex(entries: WritingEntry[]) {
  const tags = new Map<string, { label: string; count: number }>();
  for (const entry of entries) {
    for (const label of entry.data.tags) {
      const slug = slugifyTag(label);
      const previous = tags.get(slug);
      tags.set(slug, { label, count: (previous?.count ?? 0) + 1 });
    }
  }
  return [...tags.entries()]
    .map(([slug, value]) => ({ slug, ...value }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export async function getRelatedWriting(entry: WritingEntry): Promise<WritingEntry[]> {
  if (entry.data.related.length === 0) return [];
  const writing = await getWriting();
  return entry.data.related
    .map((id) => writing.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is WritingEntry => Boolean(candidate));
}
