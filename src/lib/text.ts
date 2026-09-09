export function slugifyTag(value: string): string {
  return value
    .normalize('NFKD')
    .trim()
    .toLocaleLowerCase('en')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function estimateReadingTime(source: string, wordsPerMinute = 220): number {
  const withoutMarkup = source
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>`~\[\](){}|$\\-]/g, ' ');
  const latinWords = withoutMarkup.match(/[\p{Letter}\p{Number}]+/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(latinWords / wordsPerMinute));
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
