(function(){
  var cs=[].slice.call(document.querySelectorAll('.case'));if(!cs.length)return;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var now=document.getElementById('caseNow');
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
  var cur=cs.map(function(){return {e:0,c:0}}),q=false,raf=0;
  function top0(){return parseFloat(getComputedStyle(cs[0]).top)||0}
  function frame(){
    q=false;var vh=window.innerHeight,t0=top0(),moving=false,active=0;
    cs.forEach(function(c,i){
      var r=c.getBoundingClientRect();
      /* entering: 0 when the panel is below the screen, 1 when it has reached its place */
      var e=clamp(1-(r.top-t0)/Math.max(1,vh-t0),0,1);
      /* covered: 0..1 while the next panel slides over this one */
      var cv=0,n=cs[i+1];
      if(n){var nr=n.getBoundingClientRect();cv=clamp(1-(nr.top-t0)/Math.max(1,vh-t0),0,1)}
      var s=cur[i];
      var de=e-s.e,dc=cv-s.c;
      if(Math.abs(de)>.0005||Math.abs(dc)>.0005){moving=true;s.e+=de*.14;s.c+=dc*.14}else{s.e=e;s.c=cv}
      c.style.setProperty('--e',s.e.toFixed(4));c.style.setProperty('--cv',s.c.toFixed(4));
      if(r.top-t0<vh*.5&&(!n||n.getBoundingClientRect().top-t0>vh*.5))active=i;
    });
    if(now)now.textContent='0'+(active+1);
    if(moving&&!q){q=true;requestAnimationFrame(frame)}
  }
  function kick(){if(!q){q=true;requestAnimationFrame(frame)}}
  if(reduce){cs.forEach(function(c){c.style.setProperty('--e',1);c.style.setProperty('--cv',0)});return}
  window.addEventListener('scroll',kick,{passive:true});window.addEventListener('resize',kick);window.addEventListener('load',kick);
  frame();
})();
