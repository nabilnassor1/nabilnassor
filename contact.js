(function(){
  var form=document.getElementById('cForm'),st=document.getElementById('cStatus');if(!form)return;
  var MAIL='a.nabilnassor@gmail.com';
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var email=form.email.value.trim(),btn=form.querySelector('.c-send');
    if(!form.checkValidity()){form.reportValidity();return}
    btn.disabled=true;st.textContent='Sending…';
    var body=new URLSearchParams(new FormData(form)).toString();
    /* On Netlify the form is saved and emailed to Nabil. Anywhere else, fall back to the visitor's email app. */
    fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body})
      .then(function(r){if(!r.ok)throw 0;form.reset();st.textContent='Thanks! I’ll be in touch soon.'})
      .catch(function(){
        st.textContent='Opening your email app instead…';
        location.href='mailto:'+MAIL+'?subject='+encodeURIComponent('Hello from your portfolio')+'&body='+encodeURIComponent('My email: '+email);
      })
      .then(function(){btn.disabled=false});
  });
})();

(function(){
  /* footer: the big name rises when the footer comes into view; back to top scrolls smoothly */
  var f=document.querySelector('.site-foot');if(!f)return;
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){f.classList.add('in');io.disconnect()}},{threshold:.25});io.observe(f)}else f.classList.add('in');
  var up=document.getElementById('sfUp');
  if(up)up.addEventListener('click',function(e){
    e.preventDefault();
    var start=window.scrollY||document.documentElement.scrollTop;
    var done=function(){var t=document.getElementById('main')||document.body;try{t.setAttribute('tabindex','-1');t.focus({preventScroll:true})}catch(x){}};
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||start<2){window.scrollTo(0,0);done();return}
    /* eased glide to the top; longer pages get a little more time, capped so it never drags */
    var dur=Math.min(1600,Math.max(700,start*.18)),t0=0,raf=0;
    var ease=function(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
    var stop=function(){if(raf){cancelAnimationFrame(raf);raf=0}off()};
    var off=function(){['wheel','touchstart','keydown'].forEach(function(n){window.removeEventListener(n,stop)})};
    ['wheel','touchstart','keydown'].forEach(function(n){window.addEventListener(n,stop,{passive:true})});
    var tick=function(now){
      if(!t0)t0=now;var k=Math.min(1,(now-t0)/dur);
      window.scrollTo(0,Math.round(start*(1-ease(k))));
      if(k<1)raf=requestAnimationFrame(tick);else{raf=0;off();done()}
    };
    raf=requestAnimationFrame(tick);
  });
})();
