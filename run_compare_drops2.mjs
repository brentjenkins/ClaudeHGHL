// Use Playwright with a persistent Chrome context (reuses actual Chrome profile/localStorage)
import { chromium } from 'playwright';
import { homedir } from 'os';
import { join } from 'path';

const userDataDir = join(homedir(), 'Library/Application Support/Google/Chrome');

let browser;
try {
  browser = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    channel: 'chrome',
    args: ['--no-first-run', '--no-default-browser-check', '--disable-default-apps'],
  });
} catch(e) {
  console.error('Could not launch with persistent context (Chrome may be running):', e.message.split('\n')[0]);
  process.exit(1);
}

const pages = browser.pages();
let page = pages.length ? pages[0] : await browser.newPage();

await page.goto('http://localhost:8099/', { waitUntil: 'networkidle', timeout: 30000 });

const playerCount = await page.evaluate(() => {
  const raw = localStorage.getItem('hghl_players');
  if (!raw) return 0;
  try { return JSON.parse(raw).length; } catch { return -1; }
});

console.log(`Players in localStorage: ${playerCount}`);

if (playerCount <= 0) {
  console.error('ERROR: No player data found in localStorage.');
  await browser.close();
  process.exit(1);
}

// Capture compareDrops2526 output by intercepting the DOM writes
const result = await page.evaluate(() => {
  let summary = '', body = '';

  const origGetEl = document.getElementById.bind(document);
  document.getElementById = function(id) {
    if (id === 'compareDropsSummary') {
      return { set innerHTML(v){ summary = v; }, style: {} };
    }
    if (id === 'compareDropsBody') {
      return { set innerHTML(v){ body = v; }, style: {} };
    }
    if (id === 'compareDropsModal') {
      return { style: { set display(v){} } };
    }
    return origGetEl(id);
  };

  try {
    compareDrops2526();
  } catch(e) {
    document.getElementById = origGetEl;
    return { error: e.message + '\n' + e.stack };
  }
  document.getElementById = origGetEl;
  return { summary, body };
});

if (result.error) {
  console.error('JS error:', result.error);
} else {
  const strip = s => s
    .replace(/<strong>/g,'').replace(/<\/strong>/g,'')
    .replace(/<[^>]*>/g,'')
    .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&')
    .replace(/  +/g,' ').trim();

  console.log('\n=== SUMMARY ===');
  console.log(strip(result.summary));

  console.log('\n=== TEAM BREAKDOWN ===');
  // Split on team blocks
  const teamBlocks = result.body.split(/(?=<div style="margin-bottom:1\.25rem)/).filter(Boolean);
  for (const block of teamBlocks) {
    const nameMatch = block.match(/<strong style="font-size:13px">([^<]+)<\/strong>/);
    const scoreMatch = block.match(/<span style="[^"]*">([\d]+\/[\d]+[^<]*)<\/span>/);
    if (nameMatch) {
      console.log(`\n${nameMatch[1].trim()}  ${scoreMatch ? strip(scoreMatch[1]) : ''}`);
    }

    // Extract each section (correctly dropped, algo dropped/keep, algo kept/drop)
    const sectionRe = /<span[^>]*>([✓✗△][^<]+)<\/span>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/g;
    let m;
    while ((m = sectionRe.exec(block)) !== null) {
      console.log(`  ${strip(m[1])}`);
      const items = [...m[2].matchAll(/<li[^>]*>([^<]+)<\/li>/g)].map(x => '    ' + x[1].trim());
      items.forEach(i => console.log(i));
    }
  }
}

await browser.close();
