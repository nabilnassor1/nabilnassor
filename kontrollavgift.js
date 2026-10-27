(function(){
  /* the yellow ticket prints out of the slot, wobbles a little, then tears off and tilts as you scroll */
  var sec=document.getElementById('tk'),st=document.getElementById('tkStage');if(!sec||!st)return;
  var paper=st.querySelector('.tk-paper');
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){st.style.setProperty('--pr',1);return}
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))},ease=function(t){return 1-Math.pow(1-t,3)},inout=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
  var cur=0,tgt=0,run=false;
  function target(){var r=sec.getBoundingClientRect(),tot=r.height-window.innerHeight;var lead=window.innerHeight*.95;tgt=clamp((lead-r.top)/Math.max(1,tot+lead),0,1)}
  function draw(p){
    var pr=ease(clamp((p-.04)/.46,0,1));            /* printing starts as soon as the slot scrolls into view */
    var wob=Math.sin(pr*Math.PI*5)*(1-pr)*1.6;       /* small wobble while it feeds out */
    var tear=ease(clamp((p-.6)/.3,0,1));             /* tears off and tilts */
    st.style.setProperty('--pr',pr.toFixed(4));
    paper.style.setProperty('--wob',wob.toFixed(3));
    st.style.setProperty('--tear',tear.toFixed(3));
    st.style.setProperty('--tilt',(tear*-12).toFixed(2));
    st.style.setProperty('--lift',tear.toFixed(3));
  }
  function tick(){cur+=(tgt-cur)*.12;if(Math.abs(tgt-cur)<.0006)cur=tgt;draw(cur);if(cur!==tgt)requestAnimationFrame(tick);else run=false}
  function kick(){target();if(!run){run=true;requestAnimationFrame(tick)}}
  window.addEventListener('scroll',kick,{passive:true});window.addEventListener('resize',kick);window.addEventListener('load',kick);
  draw(0);kick();
})();

(function(){
  /* when the visitor reaches the end of the page, the ticket falls like a leaf and lands on the right */
  var zone=document.getElementById('tkRest'),leaf=document.getElementById('tkLeaf');if(!zone||!leaf||!leaf.animate)return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){leaf.classList.add('landed');return}
  var done=false,FINAL=68;
  function fall(){
    if(done)return;done=true;
    var r=leaf.getBoundingClientRect(),dist=r.top+r.height+60,w=zone.querySelector('.tk-land').offsetWidth;
    var N=24,frames=[],sway=Math.min(110,w*.42);
    for(var i=0;i<=N;i++){
      var t=i/N,e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;        /* gentle in and out */
      var wave=Math.sin(t*Math.PI*3.2);
      var x=-sway*(.5+.5*wave)*(1-t*.85);                   /* drifts left and back, settling to the right */
      var rot=wave*34*(1-t)+FINAL*Math.pow(t,1.6);           /* rocks side to side, ends lying tilted */
      var flip=Math.cos(t*Math.PI*3.2)*(1-t);                /* turns a little, like a leaf catching air */
      frames.push({offset:t,transform:'translate3d('+x.toFixed(1)+'px,'+(-(1-e)*dist).toFixed(1)+'px,0) rotate('+rot.toFixed(1)+'deg) rotateY('+(flip*38).toFixed(1)+'deg)',opacity:t<.04?t*25:1});
    }
    leaf.style.opacity=1;
    var a=leaf.animate(frames,{duration:3400,easing:'linear',fill:'forwards'});
    a.onfinish=function(){
      leaf.classList.add('landed');
      leaf.animate([{transform:'rotate('+FINAL+'deg) translateY(0)'},{transform:'rotate('+(FINAL-3)+'deg) translateY(-4px)'},{transform:'rotate('+FINAL+'deg) translateY(0)'}],{duration:500,easing:'ease-out'});
      a.cancel();leaf.style.transform='rotate('+FINAL+'deg)';
    };
  }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){fall();io.disconnect()}},{threshold:.9});
    io.observe(zone);
  }else{leaf.classList.add('landed')}
})();
