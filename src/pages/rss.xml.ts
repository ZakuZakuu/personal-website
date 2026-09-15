import rss from '@astrojs/rss';
import { entryHref, getEntries } from '@/lib/content';
import { site } from '@/site.config';

export async function GET(context: { site: URL | undefined }) {
  const entries = await getEntries();
  return rss({
    title: site.name,
    description: site.description,
    site: context.site ?? 'https://example.com',
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: entryHref(entry),
      categories: entry.data.tags,
    })),
  });
}
