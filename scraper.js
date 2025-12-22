// scraper.js (root) — universal, schema-aligned
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URLS = [
  // add/remove pages freely (pagination or different sites)
  'https://viralkand.com/page/1/',
  'https://viralkand.com/page/2/',
  'https://www.fsiblog.cc/page/2/',
  'https://www.fsiblog.cc/page/3/',
];

const OUT_PATH = path.join(__dirname, 'data', 'videos.json');

function slugId(str) {
  return (
    'vid-' +
    (str || 'item')
      .toLowerCase()
      .replace(/https?:\/\//, '')
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 48)
  );
}

async function scrapeListing(page, sourceLabel) {
  // kill overlays/ads (best-effort)
  await page.evaluate(() => {
    document
      .querySelectorAll(
        'iframe, .ad, .ads, .popup, .overlay, .modal, [class*="ad-"], [id*="ad-"]'
      )
      .forEach((el) => el.remove());
  });

  // universal extraction with layered fallbacks
  return await page.evaluate((sourceLabel) => {
    const items = [];
    const cards = document.querySelectorAll(
      // common containers across WP/shady sites
      'article, .post, .video, .video-item, li, div'
    );

    cards.forEach((card) => {
      const a =
        card.querySelector('a[href]') ||
        card.closest('a[href]') ||
        null;
      if (!a) return;

      const url = a.href || '';
      if (!url || !/^https?:\/\//.test(url)) return;

      // title fallbacks
      const titleEl =
        card.querySelector('h1,h2,h3,.entry-title,.title') ||
        a.querySelector('h1,h2,h3') ||
        null;
      const title =
        (titleEl?.textContent || '').trim().replace(/\s+/g, ' ') ||
        document.title ||
        'Untitled';

      // thumbnail fallbacks
      const img =
        card.querySelector('img') ||
        a.querySelector('img') ||
        document.querySelector('meta[property="og:image"]');
      const thumbnailUrl =
        img?.getAttribute('data-src') ||
        img?.src ||
        img?.content ||
        '';

      // embed fallbacks:
      // 1) direct mp4 if visible
      // 2) iframe src
      // 3) use post URL (player page)
      let embedUrl = '';
      const mp4 = card.querySelector('video source[src*=".mp4"]');
      if (mp4) embedUrl = mp4.src;

      if (!embedUrl) {
        const iframe = card.querySelector(
          'iframe[src*="embed"], iframe[src*="player"], iframe[src]'
        );
        if (iframe) embedUrl = iframe.src;
      }

      if (!embedUrl) embedUrl = url;

      items.push({
        id: slugId(embedUrl || url),
        title,
        description: `Viral video from ${sourceLabel}`,
        category: 'Viral',
        duration: '00:00',
        embedUrl,
        thumbnailUrl,
        tags: [sourceLabel, 'viral'],
        uploadedAt: new Date().toISOString(),
        views: 0,
      });
    });

    // de-dup inside page by embedUrl/url
    const seen = new Set();
    return items.filter((it) => {
      const k = it.embedUrl || it.id;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, sourceLabel);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
  });

  let allNew = [];

  for (const url of TARGET_URLS) {
    const page = await context.newPage();
    console.log('Opening', url);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(4000);
      const host = new URL(url).hostname.replace('www.', '');
      const items = await scrapeListing(page, host);
      console.log(`Found ${items.length} items on ${url}`);
      allNew = allNew.concat(items);
    } catch (e) {
      console.error('Failed on', url, e.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // read existing
  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
  } catch {
    existing = [];
  }

  // global dedupe by embedUrl
  const map = new Map();
  existing.forEach((v) => map.set(v.embedUrl, v));
  allNew.forEach((v) => map.set(v.embedUrl, v));

  const combined = Array.from(map.values());
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(combined, null, 2), 'utf8');

  console.log(`Wrote ${combined.length} total videos`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
