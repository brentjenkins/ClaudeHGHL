import { readFileSync } from 'fs';

// ─── Constants (from roster_tracker.html) ────────────────────────────────────
const CAP_LIMIT_2526 = 95.5;
const NHL_SEASON_YEAR = 2026;
const RANK_DEFAULTS = { multF: 1.0, multD: 1.4, multG: 1.0, wtPPTSM: 1, wtYrs: 2, wtAge: 1 };
const abpWiggle = 0.1;

// Current draftWeights (defaults from code)
const draftWeights = { multF:1.0, multD:1.2, multG:1.0, wtScarcity:10, wtPPTSM:1, wtYrs:2, wtAge:1, effFloor:7, protectedN:8 };

// ─── Helpers ─────────────────────────────────────────────────────────────────
const posGroup = p => ['C','LW','RW','F','Util'].includes(p) ? 'F' : p === 'D' ? 'D' : p === 'G' ? 'G' : 'F';

const normName = s => s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[-.']/g,'');

const getCap2526 = p => p.cap2526 != null ? p.cap2526 : (p.cap || 0);

const ppts2526blend = p => {
  const srcs = [];
  if (p.proj2526_athletic > 0) srcs.push(p.proj2526_athletic);
  if (p.proj2526_dfo      > 0) srcs.push(p.proj2526_dfo);
  if (p.proj2526_espn     > 0) srcs.push(p.proj2526_espn);
  return srcs.length ? Math.round(srcs.reduce((s,v)=>s+v,0)/srcs.length) : 0;
};

const calcAge = p => {
  if (!p.birthDate) return null;
  const today = new Date(), dob = new Date(p.birthDate);
  let age = today.getFullYear() - dob.getFullYear();
  if (today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
  return age;
};

function computeABP2526(allPlayers) {
  const fas = allPlayers.filter(p => !p.sim2526 && getCap2526(p) > 0 && ppts2526blend(p) > 0);
  const abpMap = new Map();
  for (const p of allPlayers) {
    const pp = ppts2526blend(p), c2526 = getCap2526(p);
    if (!pp || c2526 <= 0) { abpMap.set(p.id, null); continue; }
    const pg = posGroup(p.pos), cap = c2526 + abpWiggle;
    abpMap.set(p.id, fas.filter(fa =>
      fa.id !== p.id && posGroup(fa.pos) === pg && getCap2526(fa) <= cap && ppts2526blend(fa) > pp
    ).length);
  }
  return abpMap;
}

// ─── ACTUAL_ROSTER_2526 (extracted from roster_tracker.html) ─────────────────
const ACTUAL_ROSTER_2526 = {
  'mackenzie weegar':'Blue Line Bangers','brandon montour':'Blue Line Bangers',
  'gustav forsling':'Blue Line Bangers','jack eichel':'Blue Line Bangers',
  'nico hischier':'Blue Line Bangers','adrian kempe':'Blue Line Bangers',
  'alex tuch':'Blue Line Bangers','jared mccann':'Blue Line Bangers',
  'macklin celebrini':'Blue Line Bangers','adam fantilli':'Blue Line Bangers',
  'jordan spence':'Blue Line Bangers','michael kesselring':'Blue Line Bangers',
  'connor hellebuyck':'Blue Line Bangers',
  'evan bouchard':'Bossy Posse','adam fox':'Bossy Posse',
  'nathan mackinnon':'Bossy Posse','robert thomas':'Bossy Posse',
  'tage thompson':'Bossy Posse','kyle connor':'Bossy Posse',
  'ryan nugenthopkins':'Bossy Posse','juraj slafkovsky':'Bossy Posse',
  'shane wright':'Bossy Posse','jackson lacombe':'Bossy Posse',
  'matt coronato':'Bossy Posse',
  'nikita kucherov':'Damage Inc.','mikko rantanen':'Damage Inc.',
  'brayden point':'Damage Inc.','luke hughes':'Damage Inc.',
  'matt boldy':'Damage Inc.','dylan strome':'Damage Inc.',
  'drake batherson':'Damage Inc.','dylan guenther':'Damage Inc.',
  'adam boqvist':'Damage Inc.','kirill marchenko':'Damage Inc.',
  'leo carlsson':'Damage Inc.','simon nemec':'Damage Inc.',
  'philip broberg':'Damage Inc.','sam montembeault':'Damage Inc.',
  'cale makar':'Dumb and Goalie To','david pastrnak':'Dumb and Goalie To',
  'thomas harley':'Dumb and Goalie To','brandon hagel':'Dumb and Goalie To',
  'cole caufield':'Dumb and Goalie To','sean monahan':'Dumb and Goalie To',
  'jonathan drouin':'Dumb and Goalie To','jack quinn':'Dumb and Goalie To',
  'mackenzie blackwood':'Dumb and Goalie To','stuart skinner':'Dumb and Goalie To',
  'morgan geekie':'Dumb and Goalie To','dmitri voronkov':'Dumb and Goalie To',
  'seamus casey':'Dumb and Goalie To','jiri kulich':'Dumb and Goalie To',
  'victor hedman':'Killer Whales','auston matthews':'Killer Whales',
  'jack hughes':'Killer Whales','josh morrissey':'Killer Whales',
  'dustin wolf':'Killer Whales','connor bedard':'Killer Whales',
  'anze kopitar':'Killer Whales','seth jarvis':'Killer Whales',
  'quinton byfield':'Killer Whales','jamie drysdale':'Killer Whales',
  'will smith':'Killer Whales','william eklund':'Killer Whales',
  'cole perfetti':'Killer Whales','jacob markstrom':'Killer Whales',
  'dylan holloway':'Killer Whales',
  'kirill kaprizov':'Motor City Wings','sidney crosby':'Motor City Wings',
  'zach werenski':'Motor City Wings','jake guentzel':'Motor City Wings',
  'shayne gostisbehere':'Motor City Wings','clayton keller':'Motor City Wings',
  'dylan larkin':'Motor City Wings','lucas raymond':'Motor City Wings',
  'brandt clarke':'Motor City Wings','olen zellweger':'Motor City Wings',
  'marco rossi':'Motor City Wings','pavel dorofeyev':'Motor City Wings',
  'jake oettinger':'Motor City Wings','connor mcmichael':'Motor City Wings',
  'marco kasper':'Motor City Wings',
  'mitch marner':'Muller Time!','roope hintz':'Muller Time!',
  'shea theodore':'Muller Time!','martin necas':'Muller Time!',
  'vincent trocheck':'Muller Time!','bryan rust':'Muller Time!',
  'carter verhaeghe':'Muller Time!','aliaksei protas':'Muller Time!',
  'logan cooley':'Muller Time!','matvei michkov':'Muller Time!',
  'zayne parekh':'Muller Time!','carter yakemchuk':'Muller Time!',
  'denton mateychuk':'Muller Time!',
  'quinn hughes':'Pernicious Puckers','leon draisaitl':'Pernicious Puckers',
  'jt miller':'Pernicious Puckers','jason robertson':'Pernicious Puckers',
  'sam reinhart':'Pernicious Puckers','tim stutzle':'Pernicious Puckers',
  'lane hutson':'Pernicious Puckers','nick suzuki':'Pernicious Puckers',
  'logan stankoven':'Pernicious Puckers','kent johnson':'Pernicious Puckers',
  'filip gustavsson':'Pernicious Puckers','simon edvinsson':'Pernicious Puckers',
  'thatcher demko':'Pernicious Puckers','artyom levshunov':'Pernicious Puckers',
  'anthony deangelo':'Pernicious Puckers',
  'logan thompson':'Silence of the Lamb','connor mcdavid':'Silence of the Lamb',
  'jesper bratt':'Silence of the Lamb','rasmus andersson':'Silence of the Lamb',
  'mark scheifele':'Silence of the Lamb','brad marchand':'Silence of the Lamb',
  'patrick kane':'Silence of the Lamb','matt duchene':'Silence of the Lamb',
  'conor garland':'Silence of the Lamb','matthew knies':'Silence of the Lamb',
  'cutter gauthier':'Silence of the Lamb','darren raddysh':'Silence of the Lamb',
  'jason zucker':'Silence of the Lamb','erik gustafsson':'Silence of the Lamb',
};

// ─── Load player data ─────────────────────────────────────────────────────────
const players = JSON.parse(readFileSync('/tmp/hghl_players_clean.json', 'utf8'));
console.log(`Loaded ${players.length} players`);

// ─── Simulate ─────────────────────────────────────────────────────────────────
const MIN_DROPS = 5, MAX_DROPS = 20, SCALE = 10;
const CAP_CEIL  = Math.round((CAP_LIMIT_2526 - MIN_DROPS) * SCALE);

// Virtual copy seeded from fantasyTeam2425
const vp = players.map(p => ({...p, sim2526: p.fantasyTeam2425 || null}));
const teams = [...new Set(vp.map(p => p.sim2526).filter(Boolean))].sort();
console.log(`Teams: ${teams.join(', ')}\n`);

const abpMap = computeABP2526(vp);
const scarcityMult = abp => abp===0?1.3:abp<=2?1.15:abp<=5?1.05:1.0;
const posMult = {F: draftWeights.multF, D: draftWeights.multD, G: draftWeights.multG};
const effFloor = draftWeights.effFloor;

const adjVal2526v = p => {
  const pp = ppts2526blend(p), c = getCap2526(p);
  const adjPts  = pp * (posMult[posGroup(p.pos)]??1.0) * scarcityMult(abpMap.get(p.id)??99);
  const ptsPerM = (pp>0&&c>0) ? (pp/c)*RANK_DEFAULTS.wtPPTSM : 0;
  const yrs     = (p.expYear>=NHL_SEASON_YEAR ? p.expYear-NHL_SEASON_YEAR+1 : 0)*RANK_DEFAULTS.wtYrs;
  const youth   = Math.max(0,35-(calcAge(p)??35))*RANK_DEFAULTS.wtAge;
  return adjPts + ptsPerM + yrs + youth;
};
const adjPPTSMv = p => {
  const pp = ppts2526blend(p), c = getCap2526(p);
  return (pp>0&&c>0) ? pp*(posMult[posGroup(p.pos)]??1.0)/c : 0;
};

const protectedN = draftWeights.protectedN ?? 0;

for (const team of teams) {
  const roster = vp.filter(p => p.sim2526===team);

  // Protect top N by adjVal — they bypass floor and knapsack entirely
  const rankedRoster = [...roster].sort((a,b) => adjVal2526v(b) - adjVal2526v(a));
  const protectedIds = new Set(rankedRoster.slice(0, protectedN).map(p => p.id));

  const preDropIds = new Set(
    roster.filter(p => !protectedIds.has(p.id) && ppts2526blend(p)>0 && getCap2526(p)>0 && adjPPTSMv(p) < effFloor).map(p=>p.id)
  );
  const evaluable = roster.filter(p => !protectedIds.has(p.id) && ppts2526blend(p)>0 && getCap2526(p)>0 && !preDropIds.has(p.id));
  const m = evaluable.length;

  // Reduce cap ceiling by what the protected players consume
  const protectedCapUsed = Math.round(roster.filter(p=>protectedIds.has(p.id)).reduce((s,p)=>s+getCap2526(p)*SCALE,0));
  const effectiveCAP = Math.max(0, CAP_CEIL - protectedCapUsed);

  const keptIds = new Set();
  if (m>0) {
    const W = evaluable.map(p=>Math.round(getCap2526(p)*SCALE));
    const V = evaluable.map(p=>adjVal2526v(p));
    const dp = Array.from({length:m+1},()=>new Float32Array(effectiveCAP+1));
    for (let i=0;i<m;i++) {
      const w=W[i],v=V[i];
      for (let c=0;c<=effectiveCAP;c++) {
        dp[i+1][c]=dp[i][c];
        if (c>=w&&dp[i][c-w]+v>=dp[i+1][c]) dp[i+1][c]=dp[i][c-w]+v;
      }
    }
    let remC=effectiveCAP;
    for (let i=m-1;i>=0;i--) {
      const w=W[i],v=V[i];
      if (remC>=w&&Math.abs(dp[i+1][remC]-(dp[i][remC-w]+v))<0.01) {
        keptIds.add(evaluable[i].id); remC-=w;
      }
    }
  }
  let dropList = roster.filter(p=>!protectedIds.has(p.id)&&(preDropIds.has(p.id)||!keptIds.has(p.id))).sort((a,b)=>adjVal2526v(b)-adjVal2526v(a));
  let keepList = roster.filter(p=>protectedIds.has(p.id)||keptIds.has(p.id));
  while (dropList.length > MAX_DROPS) keepList.push(dropList.shift());
  if (dropList.length < MIN_DROPS) {
    keepList.sort((a,b)=>adjVal2526v(a)-adjVal2526v(b));
    while (dropList.length < MIN_DROPS && keepList.length > 0) dropList.push(keepList.shift());
  }
  dropList.forEach(p=>{ p.sim2526=null; });
}

// ─── Compare ─────────────────────────────────────────────────────────────────
let totalCorrect=0, totalAll=0;
const allResults = [];

for (const team of teams) {
  const teamPlayers = vp.filter(p => p.fantasyTeam2425===team);
  const correctDrops=[], correctKeeps=[], algoDropShouldKeep=[], algoKeepShouldDrop=[];

  for (const p of teamPlayers) {
    const key = normName(p.name).toLowerCase();
    const actuallyKept = (key in ACTUAL_ROSTER_2526) && ACTUAL_ROSTER_2526[key]===team;
    const simKept = p.sim2526 !== null;
    const pp = ppts2526blend(p), cap = getCap2526(p);
    const eff = cap > 0 ? (pp * (posMult[posGroup(p.pos)]??1) / cap).toFixed(1) : '—';
    const label = `${p.name} (${posGroup(p.pos)}, ${pp}pts, $${cap.toFixed(2)}M, ${eff}x adj PPTS/$M)`;

    if (!simKept && !actuallyKept) correctDrops.push(label);
    else if (simKept && actuallyKept)  correctKeeps.push(label);
    else if (!simKept && actuallyKept) algoDropShouldKeep.push(label);
    else if (simKept && !actuallyKept) algoKeepShouldDrop.push(label);
  }

  const correct = correctDrops.length + correctKeeps.length;
  totalCorrect += correct; totalAll += teamPlayers.length;
  allResults.push({team, correctDrops, correctKeeps, algoDropShouldKeep, algoKeepShouldDrop, correct, total: teamPlayers.length});
}

// ─── Output ───────────────────────────────────────────────────────────────────
const pct = totalAll>0 ? Math.round(100*totalCorrect/totalAll) : 0;
console.log(`OVERALL MATCH: ${totalCorrect}/${totalAll} (${pct}%)`);
console.log(`Floor: ${effFloor}x adj PPTS/$M  |  D mult: ${draftWeights.multD}×`);
console.log('');

for (const r of allResults) {
  const pct2 = Math.round(100*r.correct/r.total);
  console.log(`── ${r.team}  ${r.correct}/${r.total} (${pct2}%)`);
  if (r.algoDropShouldKeep.length) {
    console.log('  ✗ Algo DROPPED, should have KEPT:');
    r.algoDropShouldKeep.forEach(s => console.log('      ' + s));
  }
  if (r.algoKeepShouldDrop.length) {
    console.log('  △ Algo KEPT, should have DROPPED:');
    r.algoKeepShouldDrop.forEach(s => console.log('      ' + s));
  }
  if (r.correctDrops.length) {
    console.log(`  ✓ Correct drops (${r.correctDrops.length}): ${r.correctDrops.map(s=>s.split(' (')[0]).join(', ')}`);
  }
  console.log('');
}
