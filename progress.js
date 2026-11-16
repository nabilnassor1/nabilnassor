/* site progress: a border around the menu that fills while you scroll.
   Every page counts for 1/9 of the ring, filled as far as you have scrolled down it.
   When every page has been scrolled to the end it turns green, celebrates and fades away. */
(function(){
  var PAGES={'index':'Home','work':'Work','about':'About','yayyay':'YAY YAY','staropramen':'Staropramen','academedia':'AcadeMedia','kontrollavgift':'Kontrollavgift','wisdome':'Wisdome','wdw':'WDW'};
  var KEYS=Object.keys(PAGES),TOTAL=KEYS.length,KEY='nn-scroll',DONE='nn-scroll-done';
  /* progress belongs to one visit: a new visit starts from zero */
  var store;try{store=window.sessionStorage;store.getItem(KEY)}catch(e){return}
  var file=(location.pathname.split('/').pop()||'index.html').replace(/\.html?$/,'')||'index';
  var map;try{map=JSON.parse(store.getItem(KEY)||'{}');if(!map||typeof map!=='object'||Array.isArray(map))map={}}catch(e){map={}}
  var done=store.getItem(DONE)==='1';
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* colour follows the progress in one continuous blend: the red of the wall in the About portrait,
     through orange and amber, and from about 60% green starts melting in, clearly greener by 70% */
  /* blended in OKLab, so the steps between colours look even to the eye */
  var STOPS=[[0,'#e5332a'],[.35,'#e8792c'],[.6,'#e3a531'],[.8,'#9db43c'],[1,'#2fa866']].map(function(s){return [s[0],toLab(s[1])]});
  function toLab(hex){
    var c=[1,3,5].map(function(i){var v=parseInt(hex.substr(i,2),16)/255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});
    var l=Math.cbrt(.4122214708*c[0]+.5363325363*c[1]+.0514459929*c[2]),m=Math.cbrt(.2119034982*c[0]+.6806995451*c[1]+.1073969566*c[2]),s=Math.cbrt(.0883024619*c[0]+.2817188376*c[1]+.6299787005*c[2]);
    return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
  }
  function fromLab(L){
    var l=Math.pow(L[0]+.3963377774*L[1]+.2158037573*L[2],3),m=Math.pow(L[0]-.1055613458*L[1]-.0638541728*L[2],3),s=Math.pow(L[0]-.0894841775*L[1]-1.291485548*L[2],3);
    return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s].map(function(v){
      v=v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055;return Math.round(Math.max(0,Math.min(1,v))*255)});
  }
  var col=function(f){
    f=Math.max(0,Math.min(1,f));
    for(var i=1;i<STOPS.length-1;i++)if(f<=STOPS[i][0])break;
    var A=STOPS[i-1],B=STOPS[i],t=(f-A[0])/(B[0]-A[0]);
    var c=fromLab([0,1,2].map(function(k){return A[1][k]+(B[1][k]-A[1][k])*t}));
    return 'rgb('+c.join(',')+')';
  };

  function total(){var s=0;KEYS.forEach(function(k){s+=Math.max(0,Math.min(1,+map[k]||0))});return s/TOTAL}

  /* ---- progress border: drawn right on the edge of the menu ---- */
  var bar=document.querySelector('.mnav'),ring=null,path=null,L=0,cur=0,SW=2;
  var NS='http://www.w3.org/2000/svg';
  function size(){
    var w=bar.offsetWidth,h=bar.offsetHeight;if(!w||!h)return;
    var s=SW/2,r=h/2-s;
    ring.setAttribute('viewBox','0 0 '+w+' '+h);ring.setAttribute('width',w);ring.setAttribute('height',h);
    /* starts at the top centre and runs clockwise */
    var d='M'+(w/2)+' '+s+'H'+(w-s-r)+'A'+r+' '+r+' 0 0 1 '+(w-s-r)+' '+(h-s)+'H'+(s+r)+'A'+r+' '+r+' 0 0 1 '+(s+r)+' '+s+'Z';
    [].forEach.call(ring.querySelectorAll('path'),function(p){p.setAttribute('d',d)});
    L=Math.max(0,2*(w-2*s-2*r))+2*Math.PI*r;
    path.style.strokeDasharray=L.toFixed(2)+' '+L.toFixed(2);
  }
  if(!bar)return;
  ring=document.createElementNS(NS,'svg');ring.setAttribute('class','mprog');ring.setAttribute('aria-hidden','true');
  ring.innerHTML='<path class="mprog-track"/><path class="mprog-bar"/><path class="mprog-shine"/>';
  bar.appendChild(ring);path=ring.querySelector('.mprog-bar');
  var sr=document.createElement('span');sr.className='mprog-sr';bar.appendChild(sr);
  var shown=total(),target=shown,raf=0;
  function paint(){
    path.style.strokeDashoffset=(L*(1-shown)).toFixed(2);
    path.style.opacity=shown>0.002?1:0;
    path.style.stroke=col(shown);
    sr.textContent=Math.round(shown*100)+'% of the site explored';
  }
  size();paint();
  if('ResizeObserver' in window)new ResizeObserver(function(){size();paint()}).observe(bar);
  /* everything already seen: the border has done its job and stays hidden */
  if(done){bar.classList.add('mprog-done','mprog-gone');return}

  /* the whole site is seen: a short burst of confetti from the menu, a bounce and a light running round the border */
  function celebrate(){
    bar.classList.add('mprog-done');
    /* after the celebration the border fades away */
    setTimeout(function(){bar.classList.add('mprog-gone','mprog-fade')},reduce?1200:1900);
    if(reduce)return;
    bar.classList.add('mprog-cheer');setTimeout(function(){bar.classList.remove('mprog-cheer')},1700);
    if(bar.animate)bar.animate([{scale:1},{scale:1.13,offset:.28},{scale:.96,offset:.55},{scale:1.03,offset:.78},{scale:1}],{duration:850,easing:'ease-out'});
    var sh=ring.querySelector('.mprog-shine');
    if(sh&&sh.animate){var seg=Math.min(70,L*.22);sh.style.strokeDasharray=seg+' '+L;
      sh.animate([{strokeDashoffset:0,opacity:0},{opacity:1,offset:.15},{opacity:1,offset:.8},{strokeDashoffset:-L,opacity:0}],{duration:1100,easing:'cubic-bezier(.45,0,.2,1)'})}
    var r=bar.getBoundingClientRect(),ox=r.left+r.width/2,oy=r.top+Math.min(r.height/2,22);
    var ink=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()||'#252523';
    var colors=['#36ab68','#36ab68','#e5332a','#e2a850',ink];
    var box=document.createElement('div');box.className='mprog-confetti';box.setAttribute('aria-hidden','true');document.body.appendChild(box);
    var longest=0;
    function burst(N,spread,minD,maxD,delay0){
      for(var i=0;i<N;i++){
        var p=document.createElement('i'),k=i%3,c=colors[(i*7+delay0)%colors.length];
        p.className=k===0?'dot':k===1?'bit':'ring';
        if(k===2)p.style.borderColor=c;else p.style.background=c;
        p.style.left=ox+'px';p.style.top=oy+'px';box.appendChild(p);
        var a=((ox<window.innerWidth*.25?-62:-90)+(Math.random()*2-1)*spread)*Math.PI/180,dist=minD+Math.random()*(maxD-minD);
        var dx=Math.cos(a)*dist,dy=Math.sin(a)*dist,rot=(Math.random()*2-1)*720,dur=1300+Math.random()*700,del=delay0+Math.random()*80;
        longest=Math.max(longest,dur+del);
        /* shoots out fast, hangs for a moment, then drifts down and fades */
        p.animate([
          {transform:'translate(-50%,-50%) translate(0,0) rotate(0deg) scale(.3)',opacity:1},
          {transform:'translate(-50%,-50%) translate('+dx+'px,'+dy+'px) rotate('+rot*.5+'deg) scale(1.1)',opacity:1,offset:.38},
          {transform:'translate(-50%,-50%) translate('+dx*1.12+'px,'+(dy+50)+'px) rotate('+rot*.8+'deg) scale(1)',opacity:1,offset:.7},
          {transform:'translate(-50%,-50%) translate('+dx*1.2+'px,'+(dy+120)+'px) rotate('+rot+'deg) scale(.8)',opacity:0}
        ],{duration:dur,delay:del,easing:'cubic-bezier(.15,.75,.35,1)',fill:'both'});
      }
    }
    var big=window.innerWidth>=600;
    burst(big?40:30,70,110,big?300:240,0);
    burst(big?18:14,40,60,160,180);
    setTimeout(function(){box.remove()},longest+100);
  }

  /* ---- scrolling fills this page's share of the ring ---- */
  if(!PAGES[file])return;
  function pageFrac(){
    var d=document.documentElement,max=Math.max(d.scrollHeight,document.body.scrollHeight)-window.innerHeight;
    if(max<20)return 1;
    var f=(window.scrollY||d.scrollTop)/max;
    return f>=.97?1:Math.max(0,Math.min(1,f));   /* reaching the footer counts as the whole page */
  }
  function tick(){
    var diff=target-shown;
    if(Math.abs(diff)<.0008){shown=target;raf=0}else{shown+=diff*(reduce?1:.14);raf=requestAnimationFrame(tick)}
    paint();
    if(shown>=.9995&&!done){done=true;try{store.setItem(DONE,'1')}catch(e){}celebrate()}
  }
  var ready=false;
  function update(){
    if(!ready||done)return;
    var f=pageFrac(),old=+map[file]||0;
    if(f>old+.001){map[file]=f;try{store.setItem(KEY,JSON.stringify(map))}catch(e){}target=total();if(!raf)raf=requestAnimationFrame(tick)}
  }
  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  /* start counting once the page intro has settled, so a page doesn't count before anyone has looked at it */
  function go(){if(ready)return;ready=true;update()}
  var de=document.documentElement;
  if(de.classList.contains('ready'))setTimeout(go,300);
  else{var mo=new MutationObserver(function(){if(de.classList.contains('ready')){mo.disconnect();setTimeout(go,300)}});mo.observe(de,{attributes:true,attributeFilter:['class']});setTimeout(function(){mo.disconnect();go()},4000)}
})();
