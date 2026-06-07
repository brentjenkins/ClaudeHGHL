import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });

// Use a persistent context so we can load the real localStorage from an existing session
// First: launch with a fresh context connected to the local server
const context = await browser.newContext();
const page = await context.newPage();

await page.goto('http://localhost:8099/', { waitUntil: 'networkidle', timeout: 30000 });

// Check if localStorage has player data
const playerCount = await page.evaluate(() => {
  const raw = localStorage.getItem('hghl_players');
  if (!raw) return 0;
  try { return JSON.parse(raw).length; } catch { return -1; }
});

console.log(`Players in localStorage: ${playerCount}`);

if (playerCount <= 0) {
  console.log('ERROR: No player data in localStorage. The headless browser starts with a fresh session.');
  await browser.close();
  process.exit(1);
}

// Run compareDrops2526 and capture results before modal is shown
const result = await page.evaluate(() => {
  // Patch document.getElementById for compareDropsModal to suppress display change
  // and capture the innerHTML instead
  const orig = document.getElementById.bind(document);
  let summary = '', body = '';
  const mockEl = (html, store) => ({
    set innerHTML(v) { store.push(v); },
    get style() { return { set display(v){} }; }
  });

  const summaryStore = [], bodyStore = [];

  // Temporarily override getElementById for the modal elements
  document.getElementById = function(id) {
    if (id === 'compareDropsSummary') return { set innerHTML(v){ summary = v; }, style:{} };
    if (id === 'compareDropsBody')    return { set innerHTML(v){ body = v; }, style:{} };
    if (id === 'compareDropsModal')   return { style: { set display(v){} } };
    return orig(id);
  };

  try {
    compareDrops2526();
  } catch(e) {
    document.getElementById = orig;
    return { error: e.message + '\n' + e.stack };
  }

  document.getElementById = orig;
  return { summary, body };
});

if (result.error) {
  console.error('Error running compareDrops2526():', result.error);
} else {
  // Strip HTML tags for readable output
  const strip = s => s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();

  console.log('\n=== SUMMARY ===');
  console.log(strip(result.summary));

  console.log('\n=== TEAM BREAKDOWN ===');
  // Parse team sections from the HTML
  const teamBlocks = result.body.split('<div style="margin-bottom:1.25rem').slice(1);
  for (const block of teamBlocks) {
    // Extract team name and score
    const nameMatch = block.match(/<strong[^>]*>([^<]+)<\/strong>/);
    const scoreMatch = block.match(/<span[^>]*>(\d+\/\d+[^<]*)<\/span>/);
    if (nameMatch) {
      console.log(`\n${nameMatch[1]}  ${scoreMatch ? scoreMatch[1] : ''}`);
    }
    // Extract sections: correctly dropped, algo dropped should keep, algo kept should drop
    const sections = block.matchAll(/<span[^>]*>([✓✗△][^<]+)<\/span>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/g);
    for (const [, label, items] of sections) {
      const playerList = [...items.matchAll(/<li[^>]*>([^<]+)<\/li>/g)].map(m => '    ' + m[1]);
      console.log(`  ${strip(label)}`);
      playerList.forEach(p => console.log(p));
    }
  }
}

await browser.close();
