import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

const RSS_FEEDS = [
  { name: 'Iefimerida', url: 'https://www.iefimerida.gr/rss.xml' },
  { name: 'Πρώτο Θέμα', url: 'https://www.protothema.gr/rss/' },
  { name: 'In.gr', url: 'https://www.in.gr/feed/' },
  { name: 'Ναυτεμπορική', url: 'https://www.naftemporiki.gr/feed/' },
  { name: 'Newsit', url: 'https://www.newsit.gr/feed/' },
  { name: 'Enikos', url: 'https://www.enikos.gr/feed/' },
  { name: 'Το Βήμα', url: 'https://www.tovima.gr/feed/' },
  { name: 'ΕΡΤ', url: 'https://www.ertnews.gr/feed/' },
  { name: 'Real', url: 'https://www.real.gr/rss/' },
];

export async function GET() {
  try {
    // Fetch all feeds in parallel
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const response = await fetch(feed.url, { next: { revalidate: 60 } });
        if (!response.ok) {
           console.error(`Failed to fetch ${feed.url}: ${response.statusText}`);
           return [];
        }
        const xml = await response.text();
        const parsed = await parser.parseString(xml);
        return parsed.items.map(item => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          contentSnippet: item.contentSnippet || item.content,
          source: feed.name,
        }));
      } catch (error) {
        console.error(`Error parsing feed ${feed.name}:`, error);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const flatResults = results.flat();

    // Sort by date descending
    flatResults.sort((a, b) => {
      const dateA = new Date(a.pubDate || 0).getTime();
      const dateB = new Date(b.pubDate || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ items: flatResults });
  } catch (error) {
    console.error('Error in RSS API:', error);
    return NextResponse.json({ error: 'Failed to fetch RSS feeds' }, { status: 500 });
  }
}
