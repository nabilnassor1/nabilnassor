(function(){
  var logo=document.getElementById('wdwLogo');
  var items=[].slice.call(document.querySelectorAll('#collage .ani'));
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){items.forEach(function(el){el.style.setProperty('--e',1)});return}
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))},ease=function(t){return 1-Math.pow(1-t,3)};
  /* every piece belongs to a group; pieces arrive one after another from alternating sides, then drift a little at their own depth */
  var st=items.map(function(el){
    var grp=el.closest('.cl'),sib=[].slice.call(grp.querySelectorAll('.ani')),i=sib.indexOf(el),side=i%2?1:-1;
    el.style.setProperty('--dx',(side*(50+i*14))+'px');
    el.style.setProperty('--dy',(150+i*30)+'px');
    el.style.setProperty('--dr',(side*(9+i*2))+'deg');
    return {el:el,grp:grp,i:i,d:parseFloat(el.dataset.d||1),cur:0};
  });
  var running=false;
  function frame(){
    var vh=window.innerHeight,moving=false,narrow=window.innerWidth<=820;
    st.forEach(function(s){
      var r=s.grp.getBoundingClientRect();
      /* 0 when the group's top reaches the bottom of the screen; each next piece starts a little later */
      var p=(vh-r.top)/(vh*(narrow?.7:.8))-s.i*(narrow?.1:.13);
      var tgt=ease(clamp(p,0,1)),d=tgt-s.cur;
      if(Math.abs(d)>.0008){s.cur+=d*.12;moving=true}else s.cur=tgt;
      s.el.style.setProperty('--e',s.cur.toFixed(4));
      var c=clamp((r.top+r.height/2-vh/2)/vh,-1.2,1.2);
      s.el.style.setProperty('--par',(c*-(narrow?10:22)*s.d).toFixed(1)+'px');
    });
    if(logo){var lr=logo.getBoundingClientRect();logo.style.setProperty('--lp',clamp(1-(lr.top+lr.height)/vh,0,1).toFixed(3))}
    if(moving)requestAnimationFrame(frame);else running=false;
  }
  function kick(){if(!running){running=true;requestAnimationFrame(frame)}}
  window.addEventListener('scroll',kick,{passive:true});window.addEventListener('resize',kick);window.addEventListener('load',kick);
  kick();
})();
