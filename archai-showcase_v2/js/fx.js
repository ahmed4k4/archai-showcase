// Motion layer: scroll reveal, count-up, card tilt/spotlight, scroll progress. Uses transform/opacity only.
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const count=el=>{const n=+el.dataset.n||0,t0=performance.now(),d=1400;el.dataset.done=1;
const f=t=>{const p=Math.min(1,(t-t0)/d);el.textContent=Math.round(n*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(f)};RM?el.textContent=n.toLocaleString():requestAnimationFrame(f)};
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;io.unobserve(el);
if(el.dataset.n!=null)count(el);
if(el.classList.contains('rv')){el.classList.add('in');setTimeout(()=>el.classList.remove('rv','in'),1100)}}),{threshold:.12});
export function fx(root=document){
document.documentElement.classList.add('fx');
root.querySelectorAll('.stat,.box,.tw,h2.st,.gal,.card,.crumb,.rv,[data-n]').forEach(el=>{
if(el.dataset.o)return;el.dataset.o=1;
if(!el.matches('[data-n]')||el.matches('.rv,.stat')){el.classList.add('rv');el.style.setProperty('--d',Math.min([...el.parentNode.children].indexOf(el),6)*70+'ms')}
io.observe(el)});
if(window.__fx)return;window.__fx=1;
const pb=document.createElement('div');pb.id='pb';document.body.append(pb);
const on=()=>{pb.style.transform=`scaleX(${scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`;document.querySelector('header.top')?.classList.toggle('sc',scrollY>10)};
addEventListener('scroll',on,{passive:true});on();
if(RM)return;
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const c=e.target.closest?.('.card');if(!c)return;
const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');
c.style.transform=`perspective(900px) rotateX(${((.5-y)*6).toFixed(2)}deg) rotateY(${((x-.5)*8).toFixed(2)}deg) translateY(-6px)`});
document.addEventListener('pointerout',e=>{const c=e.target.closest?.('.card');if(c&&!c.contains(e.relatedTarget))c.style.transform=''})}
