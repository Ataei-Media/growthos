import "server-only";
import Firecrawl from "@mendable/firecrawl-js";
import { getServerEnv } from "@/lib/env";

export interface CrawledSite {
  url: string;
  title: string | null;
  description: string | null;
  markdown: string;
}

/**
 * Scrape a site's homepage to markdown + metadata via Firecrawl. Content is
 * truncated to keep the AI prompt within a sane token budget.
 */
export async function scrapeSite(url: string): Promise<CrawledSite> {
  const env = getServerEnv();
  const firecrawl = new Firecrawl({ apiKey: env.FIRECRAWL_API_KEY });

  const doc = await firecrawl.scrape(url, { formats: ["markdown"] });
  const markdown = (doc.markdown ?? "").slice(0, 24_000);

  return {
    url,
    title: doc.metadata?.title ?? doc.metadata?.ogTitle ?? null,
    description: doc.metadata?.description ?? null,
    markdown,
  };
}
