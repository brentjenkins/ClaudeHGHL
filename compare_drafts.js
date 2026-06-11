(function () {
  var SEASONS = {
    '23-24': { draft: ACTUAL_DRAFT_2324, calcAge: calcAge2324, getCap: getCap2324, elcMax: ELC_MAX_2324 },
    '24-25': { draft: ACTUAL_DRAFT_2425, calcAge: calcAge2425, getCap: getCap2425, elcMax: ELC_MAX_2425 },
    '25-26': { draft: ACTUAL_DRAFT_2526, calcAge: calcAge2526, getCap: getCap2526, elcMax: ELC_MAX_2526 },
  };

  var all = [];
  Object.keys(SEASONS).forEach(function (season) {
    var cfg = SEASONS[season];
    var byTeam = {};
    Object.keys(cfg.draft).forEach(function (name) {
      var team = cfg.draft[name];
      if (!byTeam[team]) byTeam[team] = [];
      byTeam[team].push(name);
    });
    Object.keys(byTeam).forEach(function (team) {
      var names = byTeam[team];
      names.forEach(function (name, i) {
        var p = findPlayerByName(name);
        if (!p) {
          all.push({ season: season, team: team, pick: i + 1, of: names.length, name: name, found: false });
          return;
        }
        var age = cfg.calcAge(p);
        var cap = cfg.getCap(p);
        var maxAge = PROSPECT_MAX_AGE[posGroup(p.pos)] || 22;
        var isProspect = (age != null) && (cap > 0) && (age <= maxAge) && (cap <= cfg.elcMax);
        all.push({ season: season, team: team, pick: i + 1, of: names.length, name: p.name, pos: posGroup(p.pos), age: age, cap: +cap.toFixed(2), isProspect: isProspect, found: true });
      });
    });
  });

  var found = all.filter(function (r) { return r.found; });
  var unmatched = all.filter(function (r) { return !r.found; });
  console.log('Matched ' + found.length + '/' + all.length + ' draft picks (' + unmatched.length + ' unmatched)');

  Object.keys(SEASONS).forEach(function (season) {
    var rows = found.filter(function (r) { return r.season === season; });
    var pros = rows.filter(function (r) { return r.isProspect; }).length;
    var pct = rows.length ? Math.round(100 * pros / rows.length) : 0;
    console.log(season + ': ' + pros + '/' + rows.length + ' (' + pct + '%) picks were prospects');
  });

  ['23-24', '24-25'].forEach(function (season) {
    var rows = found.filter(function (r) { return r.season === season; });
    var early = rows.filter(function (r) { return r.pick <= Math.ceil(r.of / 2); });
    var late = rows.filter(function (r) { return r.pick > Math.ceil(r.of / 2); });
    var pct = function (arr) {
      if (!arr.length) return 0;
      return Math.round(100 * arr.filter(function (r) { return r.isProspect; }).length);
    };
    console.log(season + ': first-half ' + pct(early) + '% prospects (n=' + early.length(late) + '% (n=' + late.length + ')');
  });

  console.log('Unmatched:', unmatched.map(function (r) { return r.season + '/' + r.team + ': ' + r.name; }));
  window.lastDraftPatternRows = all;
})();
