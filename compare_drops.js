(() => {
  compareDrops2324(); compareDrops2425(); compareDrops2526();
  const seasons = {
    '23-24': window.lastCompareResults2324,
    '24-25': window.lastCompareResults2425,
    '25-26': window.lastCompareResults2526,
  };
  const missing = Object.entries(seasons).filter(([,v])=>!v).map(([k])=>k);
  if(missing.length) console.warn('Missing (check toasts):', missing.join(', '));

  const teams = [...new Set(Object.values(seasons).filter(Boolean).flatMap(r=>r.map(x=>x.team)))].sort();
  const rows = teams.map(team=>{
    const row = {team};
    let agg=0, con=0, n=0, pctSum=0;
    for(const [season, results] of Object.entries(seasons)){
      const r = results?.find(x=>x.team===team);
      if(!r){ row[season]='—'; continue; }
      const pct = Math.round(100*r.correct/r.total);
      row[season] = `${pct}% (▲${r.algoKeptShouldDrop.length}/▼${r.algoDroppedShouldKeep.length})`;
      agg += r.algoKeptShouldDrop.length; con += r.algoDroppedShouldKeep.length;
      pctSum += pct; n++;
    }
    row['avg %'] = n ? Math.round(pctSum/n) : '—';
    row['▲ over-drop (3yr)'] = agg;
    row['▼ under-drop (3yr)'] = con;
    return row;
  });
  console.table(rows);
})();