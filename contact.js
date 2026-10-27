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
  if(up)up.addEventListener('click',function(e){e.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
})();
