(function(){
  /* title drifts at a steady speed (px per second), regardless of screen width */
  var mq=document.getElementById('mq');
  if(mq){
    var setSpeed=function(){mq.style.animationDuration=Math.max(8,(mq.scrollWidth/2)/70).toFixed(1)+'s'};
    setSpeed();window.addEventListener('resize',setSpeed);window.addEventListener('load',setSpeed);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(setSpeed);
  }
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
  var ease=function(t){return 1-Math.pow(1-t,3)};
  var inout=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};

  /* pinned device scene */
  var scene=document.getElementById('scene'),dev=document.getElementById('dev'),
      steps=[].slice.call(document.querySelectorAll('#steps li')),
      cur={p:0},tgt={p:0},running=false;
  function drawScene(p){
    var t1=inout(clamp(p/.3,0,1)),
        wp=inout(clamp((p-.42)/.2,0,1))*100,
        t3=ease(clamp((p-.66)/.26,0,1)),
        sh=ease(clamp((p-.64)/.22,0,1));
    var st=dev.style;
    st.setProperty('--rx',(42*(1-t1)).toFixed(2));
    st.setProperty('--rz',(-6*(1-t1)).toFixed(2));
    st.setProperty('--sc',(.74+.26*t1-.06*sh).toFixed(3));
    st.setProperty('--lx',(-7*sh).toFixed(2));
    st.setProperty('--wp',wp.toFixed(1));
    st.setProperty('--py',(110*(1-t3)).toFixed(1));
    st.setProperty('--pr',(10*(1-t3)).toFixed(2));
    st.setProperty('--po',clamp(t3*2,0,1).toFixed(2));
    var on=p<.4?0:(p<.7?1:2);
    steps.forEach(function(li,i){li.classList.toggle('on',i===on)});
  }
  function sceneTarget(){
    var r=scene.getBoundingClientRect(),total=r.height-window.innerHeight;
    tgt.p=clamp(-r.top/Math.max(1,total),0,1);
  }
  function sceneTick(){
    cur.p+=(tgt.p-cur.p)*.14;
    if(Math.abs(tgt.p-cur.p)<.0008)cur.p=tgt.p;
    drawScene(cur.p);
    if(cur.p!==tgt.p)requestAnimationFrame(sceneTick);else running=false;
  }
  function sceneKick(){sceneTarget();if(!running){running=true;requestAnimationFrame(sceneTick)}}
  if(scene&&dev){window.addEventListener('scroll',sceneKick,{passive:true});window.addEventListener('resize',sceneKick);sceneKick()}

  /* sketch -> photograph wipe */
  var wipe=document.getElementById('wipe'),wfig=document.getElementById('wipeFig'),wst=[].slice.call(document.querySelectorAll('#wipeSteps li'));
  function drawWipe(){
    if(!wipe)return;
    var r=wipe.getBoundingClientRect(),tot=r.height-window.innerHeight,p=clamp(-r.top/Math.max(1,tot),0,1);
    var w=inout(clamp((p-.2)/.55,0,1))*100;
    wfig.style.setProperty('--wp',w.toFixed(1));
    wfig.style.setProperty('--wl',(w>1&&w<99)?1:0);
    wfig.style.setProperty('--ws',(.92+.08*ease(clamp(p/.25,0,1))).toFixed(3));
    wst.forEach(function(li,i){li.classList.toggle('on',i===(w>50?1:0))});
  }
  function drawAll(){drawWipe()}
  var qa=false;
  function qAll(){if(!qa){qa=true;requestAnimationFrame(function(){qa=false;drawAll()})}}
  window.addEventListener('scroll',qAll,{passive:true});window.addEventListener('resize',qAll);window.addEventListener('load',drawAll);drawAll();

  var els=[].slice.call(document.querySelectorAll('[data-par],[data-zoom],[data-x]'));
  if(!els.length)return;
  var queued=false;
  function run(){
    queued=false;
    var vh=window.innerHeight;
    els.forEach(function(e){
      var host=e.dataset.host==='self'?e:e.parentElement;
      var r=host.getBoundingClientRect();
      if(r.bottom<-150||r.top>vh+150)return;
      var p=(r.top+r.height/2-vh/2)/vh;
      p=Math.max(-1.2,Math.min(1.2,p));
      var t='';
      if(e.dataset.par)t+='translate3d(0,'+(p*Number(e.dataset.par)).toFixed(1)+'px,0) ';
      if(e.dataset.x)t+='translate3d('+(p*Number(e.dataset.x)).toFixed(1)+'px,0,0) ';
      if(e.dataset.zoom)t+='scale('+(1+Number(e.dataset.zoom)*Math.min(1,Math.abs(p))).toFixed(4)+')';
      e.style.transform=t;
    });
  }
  function q(){if(!queued){queued=true;requestAnimationFrame(run)}}
  window.addEventListener('scroll',q,{passive:true});
  window.addEventListener('resize',q);
  window.addEventListener('load',run);
  run();
  /* deck cards tilt toward the mouse (desktop only) */
  if(window.matchMedia&&window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    [].forEach.call(document.querySelectorAll('.deck-card'),function(c){
      var t=c.querySelector('.deck-tilt');
      c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;t.style.setProperty('--ty',(x*14).toFixed(2)+'deg');t.style.setProperty('--tx',(-y*12).toFixed(2)+'deg')});
      c.addEventListener('pointerleave',function(){t.style.setProperty('--ty','0deg');t.style.setProperty('--tx','0deg')});
    });
  }
})();
