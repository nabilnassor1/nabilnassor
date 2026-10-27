(function(){
  /* first picture of every project (except AcadeMedia's pinned card fan): no pinning.
     As it scrolls in, it opens from a rounded inset to full width, zooms out softly and drifts slower than the page. */
  var figs=[].slice.call(document.querySelectorAll('.heropin .bleed'));if(!figs.length)return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))},ease=function(t){return 1-Math.pow(1-t,3)};
  var st=figs.map(function(f){return {f:f,img:f.querySelector('img'),cur:-1}});
  var run=false;
  /* 0 at the top of the page (picture inset, zoomed in), 1 once the picture has risen to near the top of the screen */
  function target(s){var r=s.f.getBoundingClientRect(),vh=window.innerHeight,docTop=r.top+window.scrollY;
    return clamp(window.scrollY/Math.max(vh*.35,docTop-vh*.08),0,1.4)}
  function paint(s,p){var e=ease(Math.min(p,1)),w=window.innerWidth<=820;
    s.f.style.setProperty('--hi',((1-e)*(w?6:10)).toFixed(2)+'%');
    s.f.style.setProperty('--hr',((1-e)*(w?18:28)).toFixed(1)+'px');
    var sc=1.24-.16*e,room=(sc-1)/2*100*.85;   /* never move further than the zoom leaves room for, so no background shows */
    s.img.style.transform='translate3d(0,'+(-Math.min(p,1)*room).toFixed(2)+'%,0) scale('+sc.toFixed(4)+')';}
  function tick(){var moving=false;st.forEach(function(s){var t=target(s);if(s.cur<0)s.cur=t;var d=t-s.cur;if(Math.abs(d)>.0008){s.cur+=d*.16;moving=true}else s.cur=t;paint(s,s.cur)});if(moving)requestAnimationFrame(tick);else run=false}
  function kick(){if(!run){run=true;requestAnimationFrame(tick)}}
  window.addEventListener('scroll',kick,{passive:true});window.addEventListener('resize',kick);window.addEventListener('load',kick);
  kick();
})();
