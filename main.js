(function(){
  /* always start at the top of a page (unless the link points to a section) */
  var docEl=document.documentElement;
  try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
  var toTop=function(){if(!location.hash&&(window.scrollY||docEl.scrollTop))window.scrollTo(0,0)};
  toTop();
  /* layout can shift while images load: keep the top until the visitor scrolls themselves */
  var touched=false;
  ['wheel','touchstart','keydown','mousedown'].forEach(function(n){window.addEventListener(n,function(){touched=true},{passive:true,once:true})});
  var resetTop=function(){if(!touched)toTop()};
  window.addEventListener('load',resetTop);
  /* reveal the page only once it is laid out at the top: the cream cover lifts and the entrance animations start together */
  var isReady=false;
  var ready=function(){if(isReady)return;isReady=true;resetTop();requestAnimationFrame(function(){requestAnimationFrame(function(){docEl.classList.add('ready')})})};
  var fontsDone=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
  Promise.race([fontsDone,new Promise(function(r){setTimeout(r,450)})]).then(ready);
  setTimeout(ready,1200);
  window.addEventListener('pageshow',function(e){if(e.persisted){toTop();docEl.classList.add('ready')}});
  /* clicking a link to the page you are already on scrolls smoothly to the top */
  var here=location.href.split('#')[0].split('?')[0];
  [].forEach.call(document.querySelectorAll('a[href]'),function(a){
    var h=a.getAttribute('href');
    if(h&&h.indexOf('#')<0&&a.href.split('?')[0]===here){a.addEventListener('click',function(ev){ev.preventDefault();window.scrollTo({top:0,behavior:'smooth'})})}
  });
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  [].forEach.call(document.querySelectorAll('main p:not(.rv):not(.cap):not(.hobby-hint):not(.role):not(.blurb)'),function(p){p.classList.add('rv')});
  var els=[].slice.call(document.querySelectorAll('.rv,.band'));
  function show(e){e.classList.add('in')}
  if(!('IntersectionObserver' in window)||reduce){els.forEach(show)}
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){show(x.target);io.unobserve(x.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(e){io.observe(e)});
    setTimeout(function(){els.forEach(show)},6000);
  }
  var updCur=null;
  var row=document.getElementById('row');
  if(row){
    document.querySelectorAll('[data-dir]').forEach(function(b){
      b.addEventListener('click',function(){
        var w=row.querySelector('.card').getBoundingClientRect().width+16;
        row.scrollBy({left:w*Number(b.dataset.dir),behavior:reduce?'auto':'smooth'});
      });
    });
  }
  /* page changes: fade to cream, then go. Prefetch the next page on hover/touch so arrival is instant. */
  var navigating=false;
  var internal=function(a){return a&&a.href&&a.origin===location.origin&&a.pathname!==location.pathname&&!a.hasAttribute('download')&&a.target!=='_blank'&&/^https?:/.test(a.protocol)};
  var pre={};
  var prefetch=function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!internal(a)||pre[a.pathname])return;pre[a.pathname]=1;var l=document.createElement('link');l.rel='prefetch';l.href=a.href;document.head.appendChild(l)};
  document.addEventListener('pointerover',prefetch,{passive:true});document.addEventListener('touchstart',prefetch,{passive:true});
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||navigating)return;
    var a=e.target.closest&&e.target.closest('a[href]');if(!internal(a))return;
    if(reduce)return;
    e.preventDefault();navigating=true;
    document.documentElement.classList.add('leaving');
    setTimeout(function(){location.href=a.href},330);
  });
  window.addEventListener('pageshow',function(e){navigating=false;document.documentElement.classList.remove('leaving')});
  /* menu name: slot-machine reels. letters spin fast in colour, slow down and settle in black, hold 3 s, then switch */
  var roll=document.getElementById('roll');
  if(roll&&!reduce){
    var inn=roll.querySelector('.roll-in');
    var TXT=['Nabil Nassor','UX & graphic designer'],ti=0,H=26;
    var POOL='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+<>/=?';
    var meas=document.createElement('span');meas.style.cssText='position:absolute;visibility:hidden;white-space:pre;left:0;top:0';roll.appendChild(meas);
    var cw=function(ch){if(!ch)return 0;meas.textContent=ch;return meas.getBoundingClientRect().width};
    var rnd=function(n){return Math.floor(Math.random()*n)};
    var settle=function(str){
      inn.className='roll-in slot';inn.innerHTML='';
      for(var i=0;i<str.length;i++){
        var c=document.createElement('span');c.className='cell';c.style.width=cw(str[i])+'px';
        var col=document.createElement('span');col.className='col';var s=document.createElement('span');s.textContent=str[i];col.appendChild(s);c.appendChild(col);inn.appendChild(c);
      }
    };
    settle(TXT[0]);
    var spin=function(){
      if(document.hidden){setTimeout(spin,1000);return}
      var from=TXT[ti];ti=(ti+1)%TXT.length;var to=TXT[ti],L=Math.max(from.length,to.length),maxD=0;
      inn.innerHTML='';
      var cells=[];
      for(var i=0;i<L;i++){
        var f=from[i]||'',t=to[i]||'';
        var c=document.createElement('span');c.className='cell';c.style.width=cw(f)+'px';
        var col=document.createElement('span');col.className='col';
        var add=function(ch,rc){var s=document.createElement('span');s.textContent=ch;if(rc!==null)s.className='rc';if(rc){s.style.color='hsl('+rnd(360)+' 88% 50%)'}col.appendChild(s)};
        var N=14+i*2;
        add(f||' ',null);for(var k=0;k<N;k++)add(POOL[rnd(POOL.length)],k%7!==3);add(t||' ',null);
        c.appendChild(col);inn.appendChild(c);
        var d=1100+i*120;maxD=Math.max(maxD,d);
        cells.push({c:c,col:col,w:cw(t),N:N,d:d});
      }
      void inn.offsetWidth;
      cells.forEach(function(x){
        x.c.style.transition='width '+x.d+'ms cubic-bezier(.2,.9,.25,1)';
        x.col.style.transition='transform '+x.d+'ms cubic-bezier(.16,.85,.2,1)';
        x.c.style.width=x.w+'px';
        x.col.style.transform='translateY('+(-(x.N+1)*H)+'px)';
      });
      setTimeout(function(){settle(to);setTimeout(spin,3000)},maxD+120);
    };
    setTimeout(spin,3000);
  }
  /* name and title in the menu: always (re)load the start page from the top */
  if(roll){
    roll.addEventListener('click',function(e){
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button)return;
      e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
      var target=roll.href.split('#')[0],here=location.href.split('#')[0].split('?')[0];
      var home=target===here||/\/$/.test(location.pathname);
      docEl.classList.add('leaving');
      setTimeout(function(){
        try{window.scrollTo(0,0)}catch(err){}
        if(home&&!location.hash)location.reload();else location.href=target;
      },reduce?0:330);
    },true);
  }
  /* hero photo shrinks on scroll */
  var wrap=document.getElementById('heroWrap');
  if(wrap){
    var stage=wrap.querySelector('.hero-stage'),photo=document.getElementById('heroPhoto'),copy=document.getElementById('heroCopy');
    var cur=reduce?1:0,tgt=cur,raf=0;
    var target=function(){var d=wrap.offsetHeight-stage.offsetHeight;var p=d>0?(-wrap.getBoundingClientRect().top)/d:1;return Math.max(0,Math.min(1,p*1.25))};
    var paint=function(){
      var e=1-Math.pow(1-cur,2.2),H=stage.offsetHeight;
      var m=window.matchMedia('(max-width:820px) and (max-aspect-ratio:1/1)').matches;
      photo.style.setProperty('--s',(1-(m?.36:.56)*e).toFixed(4));
      photo.style.setProperty('--r',(-(m?6:7)*e).toFixed(2)+'deg');
      photo.style.setProperty('--y',(-(m?.04:.12)*H*e).toFixed(1)+'px');
      copy.classList.toggle('live',cur>.4);copy.style.setProperty('--c',Math.max(0,Math.min(1,(cur-.3)/.3)).toFixed(3));
    };
    var tick=function(){tgt=target();cur+=(tgt-cur)*.14;if(Math.abs(tgt-cur)<.0005)cur=tgt;paint();raf=(cur!==tgt)?requestAnimationFrame(tick):0};
    var kick=function(){if(!raf)raf=requestAnimationFrame(tick)};
    if(reduce){paint()}else{window.addEventListener('scroll',kick,{passive:true});window.addEventListener('resize',kick);paint();kick()}
  }
  /* small scroll cue under the hero photo: fades out as soon as the visitor scrolls */
  var cue=document.getElementById('scrollCue');
  if(cue){var cueUpd=function(){cue.classList.toggle('gone',window.scrollY>6)};window.addEventListener('scroll',cueUpd,{passive:true});cueUpd()}
  /* work row drifts left */
  if(row&&!reduce){
    var cards=[].slice.call(row.children),track=document.createElement('div');
    track.className='track';
    cards.forEach(function(c){track.appendChild(c)});
    for(var k=0;k<2;k++){cards.forEach(function(c){var n=c.cloneNode(true);n.setAttribute('aria-hidden','true');[].forEach.call(n.querySelectorAll('a'),function(a){a.setAttribute('tabindex','-1')});track.appendChild(n)})}
    row.appendChild(track);row.classList.add('is-marquee');
    var wk=document.getElementById('work');if(wk)wk.classList.add('is-marquee');
    var pb=document.getElementById('pause');
    var paused=false,hold=0,pos=0,lastSet=-1,one=0,lastT=0,px=-1,py=-1,hoverCard=null;
    var measure=function(){one=track.scrollWidth/3};
    measure();window.addEventListener('resize',measure);window.addEventListener('load',measure);
    var holdFor=function(ms){hold=performance.now()+ms};
    /* only the visitor's own scrolling (touch, wheel, arrows) pauses the drift briefly; hovering does not */
    ['touchstart','wheel'].forEach(function(n){row.addEventListener(n,function(){holdFor(1500)},{passive:true})});
    row.addEventListener('scroll',function(){if(Math.abs(row.scrollLeft-lastSet)>2){pos=row.scrollLeft;holdFor(1500)}},{passive:true});
    document.querySelectorAll('[data-dir]').forEach(function(b){b.addEventListener('click',function(){holdFor(2500)})});
    document.addEventListener('pointermove',function(e){if(e.pointerType==='touch'){px=-1;py=-1}else{px=e.clientX;py=e.clientY}},{passive:true});
    document.documentElement.addEventListener('pointerleave',function(){px=-1;py=-1});
    var drift=function(t){
      var dt=Math.min(.1,(t-lastT)/1000);lastT=t;
      if(!paused&&t>hold&&!document.hidden&&one>0){
        pos+=dt*28;if(pos>=one)pos-=one;
        lastSet=pos;row.scrollLeft=pos;
      }
      /* keep hover zoom and the round cursor in sync while cards move under a still mouse */
      if(px>=0&&!document.hidden){
        var rr=row.getBoundingClientRect();
        if(px>=rr.left&&px<=rr.right&&py>=rr.top&&py<=rr.bottom){
          var el=document.elementFromPoint(px,py),c=el&&el.closest?el.closest('.card'):null;
          if(c!==hoverCard){if(hoverCard)hoverCard.classList.remove('is-hover');if(c)c.classList.add('is-hover');hoverCard=c}
          if(updCur)updCur(el);
        }else if(hoverCard){hoverCard.classList.remove('is-hover');hoverCard=null}
      }else if(hoverCard){hoverCard.classList.remove('is-hover');hoverCard=null}
      requestAnimationFrame(drift);
    };
    requestAnimationFrame(function(t){lastT=t;drift(t)});
    if(pb){pb.addEventListener('click',function(){paused=!paused;pb.textContent=paused?'Play':'Pause';pb.setAttribute('aria-pressed',paused?'true':'false')})}
  }
  /* hobbies: photos pop up as the cursor moves */
  var hs=document.getElementById('hobbyScreen');
  if(hs){
    var hc=document.getElementById('hobbyCap'),hn=document.getElementById('hobbyNext');
    var L=[
      ['draw-bathroom','Ink drawing of a small tiled bathroom','Drawing',788,916],
      ['food-plum','Plum slices with cured fish and oxalis leaves','Cooking',1214,1376],
      ['draw-stop','Ink drawing of a village street with a stop sign','Drawing',1084,1030],
      ['food-dessert','Caramelised pastry with blueberry ice cream','Cooking',1214,1356],
      ['draw-street','Ink drawing of a narrow street with tiled roofs','Drawing',1096,960],
      ['food-fish-lemon','Seared fish with lemon in a butter sauce','Cooking',1216,1356],
      ['draw-house','Pen drawing of two wooden houses on a fish','Drawing',1160,1088],
      ['food-burrata','Burrata with grilled peach and ham','Cooking',1216,1370],
      ['food-pho','Chicken noodle soup with basil and lime','Cooking',1120,1400],
      ['food-fish-herb','Poached fish in herb sauce with dill','Cooking',1126,1400],
      ['food-dumplings','Pan-fried dumplings with chili oil','Cooking',1140,1166],
      ['food-plum-close','Close-up of plum, fish and oxalis leaf','Cooking',1071,1400],
      ['food-chicken','Crisp chicken on rice with caper sauce','Cooking',1075,1400]
    ];
    var hi=0,shown=[],lx=-999,ly=-999,loaded=false;
    var preload=function(){if(loaded)return;loaded=true;L.forEach(function(x){var i=new Image();i.src='img/'+x[0]+'.jpg'})};
    if('IntersectionObserver' in window){var po=new IntersectionObserver(function(es){if(es[0].isIntersecting){preload();po.disconnect()}},{rootMargin:'500px'});po.observe(hs)}else{preload()}
    var spawn=function(x,y){
      var it=L[hi%L.length];hi++;
      var im=document.createElement('img');
      im.className='pop';im.src='img/'+it[0]+'.jpg';im.alt=it[1];im.width=it[3];im.height=it[4];
      im.style.setProperty('--rot',(Math.random()*8-4).toFixed(1)+'deg');
      hs.appendChild(im);
      var w=im.offsetWidth,h=im.offsetHeight||w*1.2,W=hs.clientWidth,H=hs.clientHeight;
      im.style.left=Math.max(w/2,Math.min(W-w/2,x))+'px';
      im.style.top=Math.max(h/2,Math.min(H-h/2,y))+'px';
      requestAnimationFrame(function(){requestAnimationFrame(function(){im.classList.add('on')})});
      shown.push(im);if(hc)hc.textContent=it[2];hs.classList.add('touched');
      if(shown.length>5){var o=shown.shift();o.classList.remove('on');setTimeout(function(){o.remove()},800)}
    };
    hs.addEventListener('pointermove',function(e){
      var r=hs.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      if(Math.hypot(x-lx,y-ly)>110){lx=x;ly=y;spawn(x,y)}
    });
    /* photos also pop up while the page scrolls past the screen */
    var sy=window.scrollY,acc=0,sp=0;
    window.addEventListener('scroll',function(){
      var y=window.scrollY,dy=Math.abs(y-sy);sy=y;
      var r=hs.getBoundingClientRect(),vh=window.innerHeight;
      if(r.bottom<vh*.08||r.top>vh*.92)return;
      acc+=dy;
      if(acc>110){acc=0;sp++;var W=hs.clientWidth,H=hs.clientHeight;spawn(W*(.2+.6*((sp*.618)%1)),H*(.2+.6*((sp*.382+.3)%1)))}
    },{passive:true});
    if(hn){hn.addEventListener('click',function(){var W=hs.clientWidth,H=hs.clientHeight;spawn(W*(.25+Math.random()*.5),H*(.3+Math.random()*.4))})}
  }
  /* round cursor on clickable things (mouse devices only) */
  if(window.matchMedia&&window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    var cu=document.createElement('div');cu.className='cur';cu.setAttribute('aria-hidden','true');
    cu.innerHTML='<span class="cur-dot"><span class="cur-label"></span></span>';
    document.body.appendChild(cu);document.documentElement.classList.add('has-cur');
    var cl=cu.querySelector('.cur-label'),tx=-100,ty=-100,cx=-100,cy=-100,cr=0;
    var move=function(){
      cx+=(tx-cx)*(reduce?1:.25);cy+=(ty-cy)*(reduce?1:.25);
      cu.style.transform='translate3d('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px,0)';
      cr=(Math.abs(tx-cx)>.3||Math.abs(ty-cy)>.3)?requestAnimationFrame(move):0;
    };
    updCur=function(){cu.classList.add('on')};
    document.addEventListener('pointermove',function(e){
      if(e.pointerType==='touch')return;
      tx=e.clientX;ty=e.clientY;
      cx=tx;cy=ty;
      cu.style.transform='translate3d('+cx+'px,'+cy+'px,0)';
      updCur(e.target);
    },{passive:true});
    document.documentElement.addEventListener('pointerleave',function(){cu.classList.remove('on')});
  }
  /* every skill and tool chip on the site toggles on and off */
  [].forEach.call(document.querySelectorAll('.chips li,.wdw-chips li,.tool-list span'),function(li){
    li.setAttribute('role','button');li.setAttribute('tabindex','0');li.setAttribute('aria-pressed','false');
    var flip=function(){var on=li.getAttribute('aria-pressed')!=='true';li.setAttribute('aria-pressed',on?'true':'false')};
    li.addEventListener('click',flip);
    li.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}});
  });
  /* night mode toggle; on phones it sits in a bottom bar together with the menu links */
  (function(){
    var root=document.documentElement,put=function(k,v){try{localStorage.setItem(k,v)}catch(e){}};
    try{localStorage.removeItem('grid')}catch(e){}
    var bar=document.createElement('nav');bar.className='mnav';bar.setAttribute('aria-label','Menu');
    var links='';
    [].forEach.call(document.querySelectorAll('.top nav a'),function(a){links+='<a class="mnav-link" href="'+a.getAttribute('href')+'"'+(a.hasAttribute('aria-current')?' aria-current="page"':'')+'>'+a.textContent+'</a>'});
    bar.innerHTML=links+'<button type="button" class="ui-btn theme-btn" aria-label="Night mode" aria-pressed="false">'+
      '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>'+
      '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg></button>';
    document.body.appendChild(bar);
    /* phones: a copy of the menu lives inside the footer as a stack of buttons, so it scrolls natively with it */
    var ftEl=document.querySelector('.site-foot');
    if(ftEl){var fn=document.createElement('nav');fn.className='sf-nav';fn.setAttribute('aria-label','Footer menu');fn.innerHTML=bar.innerHTML;ftEl.insertBefore(fn,ftEl.firstChild)}
    var tbs=[].slice.call(document.querySelectorAll('.theme-btn'));
    var sync=function(){var d=root.getAttribute('data-theme')==='dark';tbs.forEach(function(tb){tb.setAttribute('aria-pressed',d?'true':'false');tb.setAttribute('aria-label',d?'Day mode':'Night mode')})};
    sync();
    /* on phones: shrink while scrolling down, grow back when scrolling up; flip colours over dark sections */
    var lastY=window.scrollY,acc=0,q=false,phone=window.matchMedia('(max-width:820px)');
    var lum=function(c){var m=c.match(/[\d.]+/g);if(!m||(m.length>3&&+m[3]<.5))return null;return (.2126*m[0]+.7152*m[1]+.0722*m[2])/255};
    var darkUnder=function(){
      var r=bar.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
      var els=document.elementsFromPoint(x,y);
      for(var i=0;i<els.length;i++){var e=els[i];if(bar.contains(e))continue;
        if(e.closest('.site-foot,.case-in,.fan-stage,.browser'))return true;
        for(var n=e;n&&n!==document.documentElement;n=n.parentElement){var l=lum(getComputedStyle(n).backgroundColor);if(l!==null)return l<.3}
        return false}
      return false};
    var upd=function(){q=false;var y=window.scrollY,d=y-lastY;lastY=y;
      if(d>0){acc=Math.max(0,acc)+d}else if(d<0){acc=Math.min(0,acc)+d}
      if(y<60||acc<-24)bar.classList.remove('mini');else if(acc>24)bar.classList.add('mini');
      if(phone.matches){
        /* once the footer's own menu is on screen, the floating bar fades away (and back when scrolling up) */
        var ft=document.querySelector('.site-foot'),ftTop=ft?ft.getBoundingClientRect().top:1e9;
        var hid=ftTop<window.innerHeight-60;bar.classList.toggle('hide',hid);if(ft)ft.classList.toggle('nav-in',hid);
        bar.classList.toggle('on-dark',root.getAttribute('data-theme')!=='dark'&&darkUnder());
      }
    };
    window.addEventListener('scroll',function(){if(!q){q=true;requestAnimationFrame(upd)}},{passive:true});
    window.addEventListener('load',upd);setTimeout(upd,400);
    tbs.forEach(function(tb){tb.addEventListener('click',function(){
      var d=root.getAttribute('data-theme')!=='dark';
      root.classList.add('theme-anim');root.setAttribute('data-theme',d?'dark':'light');put('theme',d?'dark':'light');sync();
      setTimeout(function(){root.classList.remove('theme-anim')},600);upd();
    })});
  })();
  var cp=document.getElementById('copy'),st=document.getElementById('status');
  if(cp){
    cp.addEventListener('click',function(){
      var m=cp.dataset.mail;
      function ok(){st.textContent='Copied: '+m}
      function no(){st.textContent=m}
      try{navigator.clipboard.writeText(m).then(ok,no)}catch(e){no()}
    });
  }
  /* reading focus: paragraphs are dark in the middle of the screen and fade to light grey toward the edges */
  var fxEls=[].slice.call(document.querySelectorAll('.lead,.prose p,.sec-head p'));
  var okMix=window.CSS&&CSS.supports&&CSS.supports('color','color-mix(in srgb, red 50%, blue)');
  if(fxEls.length&&okMix&&!reduce){
    document.documentElement.classList.add('fx-on');
    fxEls.forEach(function(e){e.classList.add('fx')});
    var fq=false;
    var fxDraw=function(){
      fq=false;var vh=window.innerHeight;
      fxEls.forEach(function(e){
        var r=e.getBoundingClientRect();
        if(r.bottom<-80||r.top>vh+80){e.style.setProperty('--fx',0);return}
        var d=Math.abs(r.top+r.height/2-vh/2)/(vh/2);
        var x=Math.max(0,Math.min(1,(d-.4)/.65));
        e.style.setProperty('--fx',(1-x*x*(3-2*x)).toFixed(3));
      });
    };
    var fxQ=function(){if(!fq){fq=true;requestAnimationFrame(fxDraw)}};
    window.addEventListener('scroll',fxQ,{passive:true});window.addEventListener('resize',fxQ);window.addEventListener('load',fxDraw);fxDraw();
  }
  /* smooth mouse-wheel scrolling on desktop: a normal step that glides to a stop quickly.
     Trackpads, touch, keyboard and the scrollbar keep the browser's own scrolling. */
  if(!reduce&&window.matchMedia&&window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    var sTarget=window.scrollY,sCur=window.scrollY,sRaf=0,FACTOR=1,EASE=.2,last=0;
    var maxY=function(){return document.documentElement.scrollHeight-window.innerHeight};
    var step=function(){
      var now=performance.now(),k=1-Math.pow(1-EASE,Math.min(4,(now-(last||now-16))/16.67));last=now;
      sCur+=(sTarget-sCur)*k;
      if(Math.abs(sTarget-sCur)<.5){sCur=sTarget;window.scrollTo(0,Math.round(sCur));sRaf=0;return}
      window.scrollTo(0,sCur);sRaf=requestAnimationFrame(step);
    };
    window.addEventListener('wheel',function(e){
      if(e.ctrlKey||e.defaultPrevented||docEl.classList.contains('outro-open'))return;
      /* trackpads send many small, fine-grained steps and already scroll smoothly: leave them alone */
      if(e.deltaMode===0&&(Math.abs(e.deltaY)<40||e.deltaX!==0||e.deltaY%1!==0)){if(sRaf){cancelAnimationFrame(sRaf);sRaf=0}return}
      var t=e.target;
      while(t&&t!==document.body){
        if(t.scrollHeight>t.clientHeight+2){var oy=getComputedStyle(t).overflowY;if(oy==='auto'||oy==='scroll')return}
        t=t.parentElement;
      }
      e.preventDefault();
      if(!sRaf){sCur=window.scrollY;sTarget=window.scrollY;last=0}
      var d=e.deltaY*(e.deltaMode===1?40:e.deltaMode===2?window.innerHeight:1);
      sTarget=Math.max(0,Math.min(maxY(),sTarget+d*FACTOR));
      if(!sRaf)sRaf=requestAnimationFrame(step);
    },{passive:false});
    /* any other kind of scroll (keys, scrollbar, links) takes over cleanly */
    ['keydown','mousedown','touchstart'].forEach(function(n){window.addEventListener(n,function(){if(sRaf){cancelAnimationFrame(sRaf);sRaf=0}},{passive:true})});
  }
})();
