import fs from "fs";
import path from "path";
import { chromium } from "playwright";

/* ===================== CONFIG ===================== */

const BASE = "https://mydesi.click";
const PAGES = [
  `${BASE}/`,
  `${BASE}/page/2/`,
];

/* reject known junk / fake embeds */
const BLOCKED_PATTERNS = [
  "javascript:",
  "/sync",
  "doubleclick",
  "googlesyndication",
  "ads",
  "afcdn",
  "pixel",
  "tracker",
  "company-target",
];

/* ===================== FILE ===================== */

const DATA_PATH = path.resolve("data/videos.json");

/* ===================== HELPERS ===================== */

function loadExisting() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch {
    return [];
  }
}

function save(videos) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(videos, null, 2));
}

function makeId(str) {
  return "vid-" + Buffer.from(str).toString("base64").slice(0, 32);
}

function isValidVideoUrl(url) {
  if (!url) return false;
  if (!url.startsWith("http")) return false;
  return !BLOCKED_PATTERNS.some(b => url.toLowerCase().includes(b));
}

/* ===================== MAIN ===================== */

async function run() {
  console.log("▶ Scraper started (mydesi.click)");

  const existing = loadExisting();
  const seen = new Set(existing.map(v => v.embedUrl));
  const results = [...existing];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  });

  const page = await context.newPage();

  /* block heavy ads */
  await page.route("**/*", route => {
    const u = route.request().url();
    if (BLOCKED_PATTERNS.some(b => u.includes(b))) {
      return route.abort();
    }
    route.continue();
  });

  for (const url of PAGES) {
    console.log("📄 Listing:", url);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    /* mydesi.click uses article cards */
    let cards = await page.$$("article a[href]");
    if (!cards.length) cards = await page.$$(".post a[href]");
    if (!cards.length) cards = await page.$$("a[href]");

    console.log(`Found ${cards.length} cards`);

    for (const card of cards) {
      try {
        const href = await card.getAttribute("href");
        if (!href || href.startsWith("#")) continue;

        const postUrl = href.startsWith("http") ? href : BASE + href;

        const title =
          (await card.$eval("h1", el => el.textContent.trim()).catch(() => null)) ||
          (await card.$eval("h2", el => el.textContent.trim()).catch(() => null)) ||
          (await card.$eval("h3", el => el.textContent.trim()).catch(() => null)) ||
          (await card.getAttribute("title")) ||
          "Video";

        const thumbnail =
          (await card.$eval("img", el => el.src).catch(() => "")) || "";

        const post = await context.newPage();

        await post.route("**/*", route => {
          const u = route.request().url();
          if (BLOCKED_PATTERNS.some(b => u.includes(b))) {
            return route.abort();
          }
          route.continue();
        });

        await post.goto(postUrl, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        await post.waitForTimeout(2000);

        let embedUrl = null;

        /* prefer iframe embeds */
        const iframeUrls = await post.$$eval("iframe", els =>
          els.map(el => el.src).filter(Boolean)
        );

        embedUrl = iframeUrls.find(isValidVideoUrl) || null;

        /* fallback: <video><source> */
        if (!embedUrl) {
          const videoUrls = await post.$$eval("video source", els =>
            els.map(el => el.src).filter(Boolean)
          );
          embedUrl = videoUrls.find(isValidVideoUrl) || null;
        }

        await post.close();

        if (!embedUrl || seen.has(embedUrl)) continue;

        results.push({
          id: makeId(embedUrl),
          title,
          description: `Video from mydesi.click`,
          category: "Viral",
          duration: "00:00",
          embedUrl,
          thumbnailUrl: thumbnail,
          tags: ["mydesi.click"],
          uploadedAt: new Date().toISOString(),
          views: 0,
        });

        seen.add(embedUrl);
        console.log("➕ Added:", title.slice(0, 60));
      } catch {
        continue;
      }
    }
  }

  await browser.close();
  save(results);

  console.log(`✅ Done. Total videos: ${results.length}`);
}

/* hard stop */
setTimeout(() => {
  console.error("⏱ Forced exit");
  process.exit(0);
}, 4 * 60 * 1000);

run();
