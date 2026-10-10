// Opens the deployed site in headless Chromium and fails if it doesn't render.
// Usage: node deploy/check/site-check.mjs https://example.com [screenshot-dir]
import { chromium } from "playwright";

const url = process.argv[2];
const outDir = process.argv[3] ?? "site-check";
if (!url) throw new Error("Pass the site URL as the first argument.");

const failures = [];
const browser = await chromium.launch();

for (const [name, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));

  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  if (!response || response.status() !== 200) failures.push(`${name}: HTTP ${response?.status()}`);

  const headline = page.getByRole("heading", { name: "Complexity is slowing business down." });
  if (!(await headline.isVisible())) failures.push(`${name}: hero headline not visible`);

  if ((await page.locator("svg.scene .actor").count()) < 10)
    failures.push(`${name}: hero scene did not render`);

  for (const id of ["services", "ai", "industries", "about", "insights", "contact"]) {
    if ((await page.locator(`#${id}`).count()) !== 1) failures.push(`${name}: section #${id} missing`);
  }

  // Hydration: the story's pause button only responds once React has taken over.
  await page.getByRole("button", { name: "Pause the story" }).click();
  if (!(await page.getByRole("button", { name: "Play the story" }).isVisible())) {
    failures.push(`${name}: page did not hydrate (pause button inert)`);
  }

  if (errors.length) failures.push(`${name}: browser errors: ${errors.join(" | ")}`);
  await page.screenshot({ path: `${outDir}/${name}.png` });
  await page.close();
}

await browser.close();
if (failures.length) {
  console.error(failures.map((failure) => `✗ ${failure}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${url} renders on desktop and mobile, hydrates, and shows every section.`);
