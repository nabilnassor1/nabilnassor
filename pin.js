(function(){
  [].forEach.call(document.querySelectorAll('.pin-stage img'),function(im){
    var w=+im.getAttribute('width'),h=+im.getAttribute('height');if(w&&h)im.style.setProperty('--r',(w/h).toFixed(4));
  });
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)return;
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
  var ease=function(t){return 1-Math.pow(1-t,3)};
  var items=[];
  function add(sel,build){[].forEach.call(document.querySelectorAll(sel),function(el){var it=build(el);if(it){it.el=el;it.cur=0;it.tgt=0;items.push(it)}})}

  /* picture piles: each picture rises into the middle, the ones before stay behind it */
  add('.pinstack',function(c){
    var cards=[].slice.call(c.querySelector('.pin-stage').children);
    c.style.setProperty('--n',cards.length);
    if(cards.length<2)return null;
    return {draw:function(p){
      var N=cards.length,s=p*(N-1),vh=window.innerHeight;
      cards.forEach(function(f,i){
        var e=i===0?1:clamp(s-(i-1),0,1),side=i%2?1:-1,d=clamp(s-i,0,3),x=1-ease(e);
        var rot=x*side*5+side*1.3*Math.min(d,1),sc=1-.045*d;
        f.style.transform='translate3d(0,'+(x*vh*.8-d*10).toFixed(1)+'px,0) rotate('+rot.toFixed(2)+'deg) scale('+sc.toFixed(3)+')';
      });
    }};
  });
  /* hero picture: settles from a closer crop */

  /* picture grows from a rounded inset to full width */
  add('.growpin',function(c){
    var fig=c.querySelector('.grow'),img=fig.querySelector('img');
    return {draw:function(p){var g=ease(clamp(p/.7,0,1));
      fig.style.setProperty('--gi',((1-g)*14).toFixed(2)+'%');fig.style.setProperty('--gr',((1-g)*28).toFixed(1)+'px');
      img.style.setProperty('--z',(1.12-.12*g).toFixed(3))}};
  });
  /* two posters rise at different speeds and settle side by side */
  add('.duo',function(c){
    var f=c.querySelectorAll('.duo-stage figure');if(f.length<2)return null;
    return {draw:function(p){
      var vh=window.innerHeight,a=ease(clamp(p/.35,0,1)),b=ease(clamp((p-.1)/.5,0,1));
      var mob=window.innerWidth<=820;f[0].style.opacity=1;f[1].style.opacity=clamp(b*3,0,1).toFixed(2);
      if(mob){
        f[0].style.transform='translate3d(0,'+(((1-a)*vh*.05)-b*14).toFixed(1)+'px,0) rotate('+(((1-a)*-4)-1.3*b).toFixed(2)+'deg) scale('+(1-.06*b).toFixed(3)+')';
        f[1].style.transform='translate3d(0,'+((1-b)*vh*.7).toFixed(1)+'px,0) rotate('+((1-b)*4).toFixed(2)+'deg)';
      }else{
        f[0].style.transform='translate3d(0,'+((1-a)*vh*.05).toFixed(1)+'px,0) rotate('+((1-a)*-4).toFixed(2)+'deg)';
        f[1].style.transform='translate3d(0,'+((1-b)*vh*.7).toFixed(1)+'px,0) rotate('+((1-b)*4).toFixed(2)+'deg)';
      }
    }};
  });

  /* the can turns slowly on its own axis as you scroll */
  add('.spinpin',function(c){
    var can=c.querySelector('.spin-can');if(!can)return null;
    return {draw:function(p){
      var t=(p-.5)*2;
      can.style.setProperty('--ry',(t*62).toFixed(2)+'deg');
      can.style.setProperty('--rz',(t*-4).toFixed(2)+'deg');
      can.style.setProperty('--sc',(1+(1-Math.abs(t))*.04).toFixed(3));
    }};
  });

  /* AcadeMedia: the four decks start as one pile and spread into a fan */
  add('.fanpin',function(c){
    var cards=[].slice.call(c.querySelectorAll('.fan-card'));if(!cards.length)return null;
    var place=function(t){
      var mob=window.innerWidth<=820;
      cards.forEach(function(f,i){
        var k=i-(cards.length-1)/2;
        var x=k*t*(mob?26:64),y=Math.abs(k)*t*(mob?4:6),r=k*t*(mob?6:6);
        f.style.transform='translate3d('+x.toFixed(2)+'%,'+(y+(1-t)*k*-1.5).toFixed(2)+'%,0) rotate('+(r+(1-t)*k*2).toFixed(2)+'deg)';
      });
    };
    place(0);
    return {draw:function(p){place(ease(clamp(p/.7,0,1)))}};
  });

  var run=false;
  function prog(el){var r=el.getBoundingClientRect();return clamp(-r.top/Math.max(1,r.height-window.innerHeight),0,1)}
  function tick(){
    var moving=false;
    items.forEach(function(it){
      var d=it.tgt-it.cur;
      if(Math.abs(d)<.0007)it.cur=it.tgt;else{it.cur+=d*.15;moving=true}
      it.draw(it.cur);
    });
    if(moving)requestAnimationFrame(tick);else run=false;
  }
  function kick(){items.forEach(function(it){it.tgt=prog(it.el)});if(!run){run=true;requestAnimationFrame(tick)}}
  window.addEventListener('scroll',kick,{passive:true});window.addEventListener('resize',kick);window.addEventListener('load',kick);
  kick();

  /* trim the empty bands above and below each pinned picture so the page reads without big gaps */
  var pins=[].slice.call(document.querySelectorAll('.pinstack,.growpin,.duo,.spinpin,.fanpin,.scene,.wipe'));
  function trim(){
    var vh=window.innerHeight;
    pins.forEach(function(c){
      var st=c.firstElementChild;if(!st)return;
      c.style.marginTop='';c.style.marginBottom='';
      /* top edge = first picture (what you see as it arrives), bottom edge = last picture (what you see as it leaves) */
      var kids=[].filter.call(st.children,function(ch){return ch.offsetHeight>0});
      var top=1e9,bot=0;
      if(kids.length){top=kids[0].offsetTop;bot=kids[kids.length-1].offsetTop+kids[kids.length-1].offsetHeight;
        if(st.classList.contains('duo-stage')){kids.forEach(function(ch){top=Math.min(top,ch.offsetTop);bot=Math.max(bot,ch.offsetTop+ch.offsetHeight)})}}
      if(top===1e9)return;
      var sh=st.offsetHeight||vh;
      var gap=window.innerWidth>820?56:36;
      c.style.marginTop=(-Math.max(0,top-gap))+'px';
      c.style.marginBottom=(-Math.max(0,sh-bot-gap))+'px';
    });
    kick();
  }
  window.addEventListener('resize',trim);window.addEventListener('load',trim);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(trim);
  [].forEach.call(document.querySelectorAll('.pin-stage img'),function(im){if(!im.complete)im.addEventListener('load',trim,{once:true})});
  trim();setTimeout(trim,600);
})();
