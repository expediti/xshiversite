// scraper.js (root) - Viralkand only
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function scrapeSite(targetUrl) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
  });

  const page = await context.newPage();
  console.log('Opening', targetUrl);
  
  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.error('Failed to load', targetUrl, e.message);
    await browser.close();
    return [];
  }

  await page.waitForTimeout(5000);

  // Remove ads
  await page.evaluate(() => {
    document
      .querySelectorAll('iframe, .ad, .ads, .popup, .overlay, .modal')
      .forEach((el) => el.remove());
  });

  const videos = await page.evaluate(() => {
    const out = [];
    
    // Viralkand uses <article class="post">
    const cards = document.querySelectorAll('article.post');

    cards.forEach((card, index) => {
      const link = card.querySelector('a');
      if (!link) return;

      const href = link.href || '';
      if (!href) return;

      // Title from h2.entry-title
      const titleEl = card.querySelector('h2.entry-title') || card.querySelector('h2');
      const rawTitle = titleEl?.textContent || '';
      const title = rawTitle.trim().replace(/\s+/g, ' ').replace(/Viral video from viralkand\.com/gi, '').trim();

      // Thumbnail from img
      const imgEl = card.querySelector('img');
      const thumb = imgEl?.src || imgEl?.getAttribute('data-src') || '';

      // Category
      const catEl = card.querySelector('a[rel="category"]');
      const category = catEl?.textContent?.trim() || 'Viral';

      if (href && title) {
        out.push({
          id: `vid-${href.split('/').filter(Boolean).pop()}`,
          title: title.slice(0, 150),
          description: 'Viral video from viralkand.com',
          category: category,
          duration: '00:00',
          embedUrl: href,
          thumbnailUrl: thumb,
          tags: ['viralkand', 'viral'],
          uploadedAt: new Date().toISOString(),
          views: 0,
        });
      }
    });

    return out;
  });

  await browser.close();
  console.log(`Found ${videos.length} videos on ${targetUrl}`);
  return videos;
}

async function main() {
  // Scrape 10 pages of viralkand
  const targetUrls = [
    'https://viralkand.com/',
    'https://viralkand.com/page/2/',
    'https://viralkand.com/page/3/',
    'https://viralkand.com/page/4/',
    'https://viralkand.com/page/5/',
    'https://viralkand.com/page/6/',
    'https://viralkand.com/page/7/',
    'https://viralkand.com/page/8/',
    'https://viralkand.com/page/9/',
    'https://viralkand.com/page/10/',
  ];

  let allNew = [];
  for (const url of targetUrls) {
    try {
      const vids = await scrapeSite(url);
      allNew = allNew.concat(vids);
      // Small delay between pages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.error('Error scraping', url, e.message);
    }
  }

  const filePath = path.join(__dirname, 'data', 'videos.json');
  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    existing = [];
  }

  // Dedupe by embedUrl
  const combined = [...existing];
  allNew.forEach((v) => {
    if (!combined.some((e) => e.embedUrl === v.embedUrl || e.id === v.id)) {
      combined.push(v);
    }
  });

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(combined, null, 2), 'utf8');
  console.log(`✅ Scraped ${allNew.length} new videos from ${targetUrls.length} pages`);
  console.log(`✅ Total videos in database: ${combined.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
