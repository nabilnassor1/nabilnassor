(function(){
  /* the website scrolls inside the browser frame while the section is pinned */
  var sec=document.getElementById('siteScroll'),view=document.getElementById('bView');if(!sec||!view)return;
  var img=view.querySelector('img');
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))},inout=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
  var cur=0,tgt=0,run=false;
  function target(){var r=sec.getBoundingClientRect(),tot=r.height-window.innerHeight;tgt=clamp(-r.top/Math.max(1,tot),0,1)}
  function draw(p){var e=inout(clamp((p-.12)/.76,0,1)),max=Math.max(0,img.offsetHeight-view.offsetHeight);img.style.setProperty('--sy',(e*max).toFixed(1))}
  function tick(){cur+=(tgt-cur)*.12;if(Math.abs(tgt-cur)<.0006)cur=tgt;draw(cur);if(cur!==tgt)requestAnimationFrame(tick);else run=false}
  function kick(){target();if(!run){run=true;requestAnimationFrame(tick)}}
  window.addEventListener('scroll',kick,{passive:true});window.addEventListener('resize',function(){draw(cur);kick()});window.addEventListener('load',kick);
  kick();
})();
