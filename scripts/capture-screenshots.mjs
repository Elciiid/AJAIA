// Capture deliverable screenshots from the running local app.
// Usage: npm run dev (with DB up) in one terminal, then:
//   node scripts/capture-screenshots.mjs
import puppeteer from "puppeteer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const outDir = path.resolve(process.cwd(), "docs/screenshots");
mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

async function shot(name) {
  await sleep(700);
  await page.screenshot({ path: path.join(outDir, name) });
  console.log("saved", name);
}

// 1) Login screen
await page.goto(BASE, { waitUntil: "networkidle0" });
await shot("01-login.png");

// 2) Sign in as Alice -> dashboard
await page.type("#email", "alice@ajaia.test");
await Promise.all([
  page.click('button[type="submit"]'),
  page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {}),
]);
await page.waitForSelector("h1");
await sleep(800);
await shot("02-dashboard.png");

// 3) Open the roadmap -> editor
await page.evaluate(() => {
  const a = [...document.querySelectorAll("a")].find((el) =>
    el.textContent.includes("Q3 Product Roadmap"),
  );
  a?.click();
});
await page.waitForSelector(".ProseMirror");
await sleep(1000);
await shot("03-editor.png");

// 4) Share dialog
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(
    (el) => el.textContent.trim() === "Share",
  );
  b?.click();
});
await sleep(900);
await shot("04-share-dialog.png");

await browser.close();
console.log("Done. Screenshots in docs/screenshots/");
