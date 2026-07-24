// duplicate players.  assert == 0.
var byId={};for(var i=0;i<players.length;i++){var p=players[i];if(p.nhlId){if(!byId[p.nhlId])byId[p.nhlId]=[];byId[p.nhlId].push(p);}}var idDupeKeys=[];for(var k in byId){if(byId[k].length>1)idDupeKeys.push(k);}console.log('=== NHL-ID duplicates:',idDupeKeys.length,'===');for(var i1=0;i1<idDupeKeys.length;i1++){var grp=byId[idDupeKeys[i1]];var parts=[];for(var g=0;g<grp.length;g++)parts.push(grp[g].name+' (id='+grp[g].id+')');console.log('nhlId='+idDupeKeys[i1],parts.join(' | '));}var byName={};for(var i2=0;i2<players.length;i2++){var p2=players[i2];var key2=normName(p2.name).toLowerCase()+'_'+posGroup(p2.pos);if(!byName[key2])byName[key2]=[];byName[key2].push(p2);}var nameDupeKeys=[];for(var k2 in byName){if(byName[k2].length>1)nameDupeKeys.push(k2);}console.log('=== Exact name+pos duplicates:',nameDupeKeys.length,'===');for(var i3=0;i3<nameDupeKeys.length;i3++){var grp2=byName[nameDupeKeys[i3]];var parts2=[];for(var g2=0;g2<grp2.length;g2++)parts2.push('id='+grp2[g2].id+' nhlId='+grp2[g2].nhlId);console.log(nameDupeKeys[i3],parts2.join(' | '));}var byLast={};for(var i4=0;i4<players.length;i4++){var p4=players[i4];var nm=normName(p4.name).toLowerCase();var toks=nm.split(' ');var last=toks[toks.length-1];var key4=last+'_'+posGroup(p4.pos);if(!byLast[key4])byLast[key4]=[];byLast[key4].push(p4);}var fuzzy=[];for(var k4 in byLast){var grp4=byLast[k4];if(grp4.length<2)continue;for(var a=0;a<grp4.length;a++){for(var b=a+1;b<grp4.length;b++){var pa=grp4[a],pb=grp4[b];if(normName(pa.name).toLowerCase()===normName(pb.name).toLowerCase())continue;var fields=['cap2324','cap2425','cap2526','cap'];var match=false;var matchDetail='';for(var f=0;f<fields.length;f++){var fn=fields[f];var ca=pa[fn]||0,cb=pb[fn]||0;if(ca>0&&cb>0&&Math.abs(ca-cb)<0.01){match=true;matchDetail=fn+':'+ca.toFixed(4)+' vs '+cb.toFixed(4);break;}}if(match)fuzzy.push(pa.name+' (id='+pa.id+', nhlId='+pa.nhlId+') vs '+pb.name+' (id='+pb.id+', nhlId='+pb.nhlId+') -- '+matchDetail);}}}console.log('=== Suspected fuzzy duplicates (same last name+pos, near-identical cap, different spelling):',fuzzy.length,'===');console.log(fuzzy.join('\n'));


// Nick Perbix records.  assert == 1.
var perbix=players.filter(function(p){return /perbix/i.test(p.name);});console.log('Total Perbix records:',perbix.length);perbix.forEach(function(p){console.log('id='+p.id,'name='+p.name,'nhlId='+p.nhlId,'source='+p.source,'cap2425='+p.cap2425);});


// players with GP in a season but no CAP HIT.  assert == 0.
var m2324 = players.filter(function(p){ return (p.gp2324||0) >= 10 && !(p.cap2324 > 0); }); var m2425 = players.filter(function(p){ return (p.gp2425||0) >= 10 && !(p.cap2425 > 0); }); var m2526 = players.filter(function(p){ return (p.gp2526||0) >= 10 && !(p.cap2526 > 0); }); console.log('23-24 GP>=10 no cap:', m2324.length); console.log(m2324.map(function(p){ return p.name + ' | ' + p.pos + ' | gp=' + p.gp2324 + ' | cap=' + p.cap2324; }).join('\n')); console.log('24-25 GP>=10 no cap:', m2425.length); console.log(m2425.map(function(p){ return p.name + ' | ' + p.pos + ' | gp=' + p.gp2425 + ' | cap=' + p.cap2425; }).join('\n')); console.log('25-26 GP>=10 no cap:', m2526.length); console.log(m2526.map(function(p){ return p.name + ' | ' + p.pos + ' | gp=' + p.gp2526 + ' | cap=' + p.cap2526; }).join('\n'));


// fantasy teams with != 20 players.  assert == 0.  (run right after Reset)
// Algo Draft: assert all teams have F == 12, D == 6, G == 2.  (i have seen this get out of line when there were name mismatches)  (run after Algo Draft — same script covers both, second console.log block)
var byTeam={};for(var i=0;i<players.length;i++){var p=players[i];if(!p.start2627)continue;var pg=posGroup(p.pos);if(!byTeam[p.start2627])byTeam[p.start2627]={F:0,D:0,G:0,total:0};byTeam[p.start2627][pg]++;byTeam[p.start2627].total++;}var badTotal=[];var badFDG=[];for(var k in byTeam){var c=byTeam[k];if(c.total!==20)badTotal.push(k+'='+c.total);if(c.F!==12||c.D!==6||c.G!==2)badFDG.push(k+': F='+c.F+' D='+c.D+' G='+c.G);}console.log('=== Teams with != 20 total players:',badTotal.length,'===');console.log(badTotal.join('\n'));console.log('=== Teams with wrong F/D/G split (12/6/2):',badFDG.length,'===');console.log(badFDG.join('\n'));


// Compare Draft: assert "Real value missed" == "Real reaches"
// No JS yet — _runCompareDrafts never stores leagueAlgoOnly/leagueActualOnly counts anywhere
// accessible (unlike _runCompareDrops, which exposes window.lastCompareResults2X2Y). Right now
// this can only be checked by reading the two numbers off the Compare Drafts modal directly.
// Would need a small addition to _runCompareDrafts (roster_tracker.html) to store something like
// window.lastCompareDraftsResults2627 = {matched, algoOnly, actualOnly} before this is scriptable.


// PP Signings run today.  assert HWM == today.
var hwm=localStorage.getItem('hghl_signings_hwm');var today=new Date();var todayStr=today.toISOString().slice(0,10);var hoursOld=hwm?((today-new Date(hwm))/3600000):null;console.log('Signings HWM:',hwm,'| today:',todayStr,'| hours since HWM date:',hoursOld===null?'N/A (never synced)':hoursOld.toFixed(1));console.log(hwm===todayStr?'OK - synced today':'STALE - not synced today');
// Note: LS_SIGNINGS_HWM is a date-only string (data-complete-through date, not a literal
// last-run timestamp), so "within 24 hours" really means "HWM date == today's date" here.


// 26-27 Inj reports run today
// Manual check — syncInjuries() doesn't persist any last-synced timestamp, so this isn't
// scriptable as-is. (Declined adding one — signings-only per 2026-07-23 decision.)


// 26-27 Actual drops populated
// Manual check — same reasoning as Inj reports above; no timestamp tracked, left as a manual
// reminder rather than adding new tracking code.
