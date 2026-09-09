import rss from '@astrojs/rss';
import { getWriting, writingHref } from '@/lib/content';
import { site } from '@/site.config';

export async function GET(context: { site: URL | undefined }) {
  const writing = await getWriting();
  return rss({
    title: `${site.name} — Writing`,
    description: site.description,
    site: context.site ?? 'https://example.com',
    items: writing.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: writingHref(entry),
      categories: entry.data.tags,
    })),
  });
}
