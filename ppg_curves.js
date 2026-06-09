var _raw = localStorage.getItem('nhl_players_v3');
var _stored = JSON.parse(_raw);
var _all = Object.values(_stored.players || _stored);

function _pg(pos) { return ['C','LW','RW','F','Util'].indexOf(pos)>=0?'F':pos==='D'?'D':pos==='G'?'G':'F'; }

function _fitQ(data) {
  var n=data.length; if(n<3) return null;
  var s0=n,sx=0,sx2=0,sx3=0,sx4=0,sy=0,sxy=0,sx2y=0;
  for(var di=0;di<n;di++){var dx=data[di].x,dy=data[di].y;sx+=dx;sx2+=dx*dx;sx3+=dx*dx*dx;sx4+=dx*dx*dx*dx;sy+=dy;sxy+=dx*dy;sx2y+=dx*dx*dy;}
  var A=[[sx4,sx3,sx2],[sx3,sx2,sx],[sx2,sx,s0]],B=[sx2y,sxy,sy];
  for(var pi=0;pi<3;pi++){var pmx=pi;for(var pk=pi+1;pk<3;pk++)if(Math.abs(A[pk][pi])>Math.abs(A[pmx][pi]))pmx=pk;var ta=A[pi];A[pi]=A[pmx];A[pmx]=ta;var tb=B[pi];B[pi]=B[pmx];B[pmx]=tb;if(Math.abs(A[pi][pi])<1e-12)continue;for(var pk=pi+1;pk<3;pk++){var pf=A[pk][pi]/A[pi][pi];for(var pj=pi;pj<3;pj++)A[pk][pj]-=pf*A[pi][pj];B[pk]-=pf*B[pi];}}
  var co=[0,0,0];
  for(var ci=2;ci>=0;ci--){if(Math.abs(A[ci][ci])<1e-12){co[ci]=0;continue;}co[ci]=B[ci];for(var cj=ci+1;cj<3;cj++)co[ci]-=A[ci][cj]*co[cj];co[ci]/=A[ci][ci];}
  var ca=co[0],cb=co[1],cc=co[2];
  return function(x){return ca*x*x+cb*x+cc;};
}

var _fd = _all.filter(function(p){var g=_pg(p.pos);return (g==='F'||g==='D')&&(p.gp2526||0)>=15&&(p.cap||0)>0&&(p.pts2526||0)>0;});

var _rows = _fd.map(function(p){
  var rate=p.pts2526/p.gp2526;
  var pts82=Math.round(rate*82);
  var ppts=p.pts||0;
  return {name:p.name,pos:_pg(p.pos),rawPos:p.pos,team:p.team||'',gp:p.gp2526,pts2526:p.pts2526,rate:rate.toFixed(2),pts82:pts82,ppts:ppts,delta:pts82-ppts,cap:p.cap,rostered:p.start2627||''};
});

console.log('=== UNDERVALUED (pts/82 > PPTS by >5) ===');
var _under=_rows.filter(function(r){return r.delta>5;}).sort(function(a,b){return b.delta-a.delta;});
console.table(_under.map(function(r){return {Name:r.name,Pos:r.rawPos,GP:r.gp,Pts:r.pts2526,PtsPerGm:r.rate,Pts82:r.pts82,PPTS:r.ppts,Delta:'+'+r.delta,Cap:r.cap.toFixed(2),Rostered:r.rostered};}));

console.log('=== OVERVALUED (PPTS > pts/82 by >8) ===');
var _over=_rows.filter(function(r){return r.delta<-8;}).sort(function(a,b){return a.delta-b.delta;});
console.table(_over.map(function(r){return {Name:r.name,Pos:r.rawPos,GP:r.gp,Pts:r.pts2526,PtsPerGm:r.rate,Pts82:r.pts82,PPTS:r.ppts,Delta:r.delta,Cap:r.cap.toFixed(2),Rostered:r.rostered};}));

['F','D'].forEach(function(pg){
  var pool=_rows.filter(function(r){return r.pos===pg;});
  var cRaw=_fitQ(pool.map(function(r){return {x:r.cap,y:r.pts2526};}));
  var c82=_fitQ(pool.map(function(r){return {x:r.cap,y:r.pts82};}));
  var cP=_fitQ(pool.map(function(r){return {x:r.cap,y:r.ppts};}));
  console.log('--- '+pg+' curves at $1M-$12M ---');
  console.table([1,2,3,4,5,6,7,8,9,10,11,12].map(function(c){return {'Cap':c,'raw pts2526':cRaw?Math.round(cRaw(c)):'?','pts/82':c82?Math.round(c82(c)):'?','PPTS':cP?Math.round(cP(c)):'?'};}));
  if(c82){
    var out=pool.map(function(r){return {Name:r.name,GP:r.gp,Pts82:r.pts82,Cap:r.cap.toFixed(2),'vs curve':Math.round(r.pts82-c82(r.cap)),Rostered:r.rostered};}).sort(function(a,b){return b['vs curve']-a['vs curve'];});
    console.log(pg+' above pts/82 curve:'); console.table(out.slice(0,8));
    console.log(pg+' below pts/82 curve:'); console.table(out.slice(-5));
  }
});
