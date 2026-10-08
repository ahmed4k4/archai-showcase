import{sb,$,$$,esc,url,t,L,lang,boot,track}from'./core.js';
const img=(s,a)=>s?`<img loading="lazy" src="${esc(s)}" alt="${esc(a)}">`:'';
const SEL='*,categories(name_en,name_ar),project_technologies(technology),project_industries(industry)';
const LIST='id,slug,category_id,sort_order,title_en,title_ar,summary_en,summary_ar,live_url,cover_image,featured_image,featured,featured_sort_order,categories(name_en,name_ar),project_technologies(technology),project_industries(industry)';
const ss=(k,v)=>{try{if(v===undefined){const c=JSON.parse(sessionStorage[k]||'null');return c&&Date.now()-c.t<6e4?c.d:null}sessionStorage[k]=JSON.stringify({t:Date.now(),d:v})}catch{return null}};
const PV=lang=='ar'?'›':'‹',NX=lang=='ar'?'‹':'›';
const live=p=>p.live_url?`<a class="btn p" target="_blank" rel="noopener noreferrer" href="${esc(url(p.live_url))}">${t('visit')} ↗</a>`:'';
export const card=p=>`<article class="card"><a class="im" href="project.html?id=${p.id}">${img(p.cover_image,L(p,'title'))}</a><div class="b"><div><span class="badge c">${esc(L(p.categories,'name')||t('other'))}</span>${p.featured?`<span class="badge">★ ${t('feat')}</span>`:''}</div><h3>${esc(L(p,'title'))}</h3><p>${esc(L(p,'summary'))}</p><div class="tags">${(p.project_technologies||[]).slice(0,3).map(x=>`<span>${esc(x.technology)}</span>`).join('')}</div><div class="row">${live(p)}<a class="btn" href="project.html?id=${p.id}">${t('details')}</a></div></div></article>`;
const fail=(el,e)=>{console.error(e);el.innerHTML=`<div class="empty">${t('err')} <button class="btn" onclick="location.reload()">${t('retry')}</button></div>`};
const seo=(title,desc,image)=>{document.title=title;[['description',desc],['og:title',title],['og:description',desc],['og:image',image],['twitter:card','summary_large_image']].forEach(([n,c])=>{if(!c)return;const k=n.startsWith('og')?'property':'name';let m=document.head.querySelector(`meta[${k}="${n}"]`);if(!m){m=document.createElement('meta');m.setAttribute(k,n);document.head.append(m)}m.content=c});let l=document.head.querySelector('link[rel=canonical]');if(!l){l=document.createElement('link');l.rel='canonical';document.head.append(l)}l.href=location.href};

export async function home(){boot();track();const root=$('#app');$('#h1').textContent=t('heroT');root.innerHTML=`<div class="empty">${t('load')}</div>`;
try{let R=ss('hm');if(!R){R=await Promise.all([sb.from('categories').select('id,slug,icon,name_en,name_ar').order('sort_order'),sb.from('projects').select(LIST).order('sort_order'),sb.from('site_settings').select('*').eq('id',1).maybeSingle()]);if(R[0].error||R[1].error)throw R[0].error||R[1].error;ss('hm',R)}
const[c,p,s]=R;
const cats=c.data,ps=p.data,st=s.data||{},vis=st.section_visibility||{};
if(L(st,'home_title'))$('#h1').textContent=L(st,'home_title');$('#hp').textContent=L(st,'home_desc');$('#foot').textContent=L(st,'footer_text')||st.company_name||'';
if(vis.hero===false)$('#hero').hidden=true;
seo(st.site_title||'Archai',L(st,'home_desc'),st.default_seo_image);
const fts=ps.filter(x=>x.featured).sort((a,b)=>a.featured_sort_order-b.featured_sort_order||a.sort_order-b.sort_order).slice(0,st.featured_limit||6);
const techs=[...new Set(ps.flatMap(x=>x.project_technologies.map(y=>y.technology)))].sort();
root.innerHTML=`${fts.length&&vis.featured!==false?`<section id="sl" class="slider" aria-label="${t('featT')}"><div class="track">${fts.map(x=>`<article class="slide">${img(x.featured_image||x.cover_image,L(x,'title'))}<div class="tx"><span class="badge">★ ${t('feat')}</span><h3>${esc(L(x,'title'))}</h3><p>${esc(L(x,'summary'))}</p><div class="row">${live(x)}<a class="btn" href="project.html?id=${x.id}">${t('details')}</a></div></div></article>`).join('')}</div><button class="nv pv" aria-label="Previous">${PV}</button><button class="nv nx" aria-label="Next">${NX}</button><div class="dots"></div></section>`:''}
<div class="bar" id="list"><input id="q" type="search" data-ph="search" aria-label="${t('search')}"><select id="cf" aria-label="${t('cat')}"><option value="">${t('all')}</option>${cats.map(x=>`<option value="${x.id}">${esc(L(x,'name'))}</option>`).join('')}</select><select id="tf"><option value="">${t('allT')}</option>${techs.map(x=>`<option>${esc(x)}</option>`).join('')}</select></div><div id="out"></div>`;
boot();
const draw=()=>{const q=$('#q').value.toLowerCase().trim(),cf=$('#cf').value,tf=$('#tf').value;
const f=ps.filter(x=>(!cf||x.category_id==cf)&&(!tf||x.project_technologies.some(y=>y.technology==tf))&&(!q||[x.title_en,x.title_ar,x.summary_en,x.summary_ar,x.categories?.name_en,x.categories?.name_ar,...x.project_technologies.map(y=>y.technology),...x.project_industries.map(y=>y.industry)].join(' ').toLowerCase().includes(q)));
const sec=(h,a)=>a.length?`<h2 class="st">${h}</h2><div class="grid">${a.map(card).join('')}</div>`:'';
$('#out').innerHTML=f.length?cats.map(x=>sec(`${esc(x.icon||'')} ${esc(L(x,'name'))}`,f.filter(y=>y.category_id==x.id))).join('')+sec(t('other'),f.filter(y=>!y.category_id)):`<div class="empty">${t('none')}</div>`};
['q','cf','tf'].forEach(i=>$('#'+i).oninput=draw);draw();
const tr=$('.track');if(tr){const sl=[...tr.children],dots=$('.dots');let i=0,hold=0;dots.innerHTML=sl.map(()=>'<i></i>').join('');
const mark=()=>[...dots.children].forEach((d,j)=>d.classList.toggle('on',j==i)),go=n=>{i=(n+sl.length)%sl.length;sl[i].scrollIntoView({behavior:'smooth',inline:'start',block:'nearest'})};
tr.onscroll=()=>{i=Math.round(Math.abs(tr.scrollLeft)/tr.clientWidth);mark()};mark();
$('.pv').onclick=()=>go(i-1);$('.nx').onclick=()=>go(i+1);[...dots.children].forEach((d,j)=>d.onclick=()=>go(j));
$('#sl').onmouseenter=()=>hold=1;$('#sl').onmouseleave=()=>hold=0;tr.addEventListener('touchstart',()=>hold=1,{passive:true});
if(sl.length>1)setInterval(()=>{if(!hold&&!document.hidden)go(i+1)},5000)}
}catch(e){fail(root,e)}}

export async function project(){boot();const root=$('#app'),id=new URLSearchParams(location.search).get('id');root.innerHTML=`<div class="empty">${t('load')}</div>`;
const{data:p}=await sb.from('projects').select(SEL+',project_images(*)').eq('id',id).maybeSingle();
if(!p){root.innerHTML=`<div class="empty">${t('nf')} <a class="btn" href="index.html">${t('home')}</a></div>`;return}
track(p.id);
let im=(p.project_images||[]).sort((a,b)=>b.is_hero-a.is_hero||a.sort_order-b.sort_order);if(!im.length&&p.cover_image)im=[{public_url:p.cover_image}];
const ti=L(p,'title'),tg=p.project_technologies.map(x=>x.technology),ins=p.project_industries.map(x=>x.industry);
seo(ti+' — Archai',L(p,'summary'),p.cover_image);
const chips=a=>a.map(x=>`<span class="badge">${esc(x)}</span>`).join('')||'—';
root.innerHTML=`<nav class="crumb" aria-label="Breadcrumb"><a href="index.html">${t('home')}</a> › ${p.categories?esc(L(p.categories,'name'))+' › ':''}${esc(ti)}</nav>
<header><span class="badge c">${esc(L(p.categories,'name')||t('other'))}</span>${p.featured?`<span class="badge">★ ${t('feat')}</span>`:''}<h1 style="margin:.4rem 0">${esc(ti)}</h1><p style="color:var(--text-muted);font-size:var(--fs-lg)">${esc(L(p,'summary'))}</p><div class="row">${live(p)}</div></header>
${im.length?`<section class="gal" style="margin-top:var(--sp-4)"><div class="main"><img id="mi" alt=""><button class="nv pv" aria-label="Previous">${PV}</button><button class="nv nx" aria-label="Next">${NX}</button></div><div class="thumbs">${im.map((x,j)=>`<img loading="lazy" src="${esc(x.public_url)}" alt="${esc(L(x,'alt')||ti)}" tabindex="0" data-j="${j}">`).join('')}</div></section>`:''}
<div class="pg"><section class="box"><h2 style="margin-top:0">${t('details')}</h2><p class="pre">${esc(L(p,'description')||L(p,'summary'))}</p><h3>${t('tech')}</h3><div>${chips(tg)}</div><h3>${t('ind')}</h3><div>${chips(ins)}</div></section>
<aside><div class="box"><h3 style="margin-top:0">${t('info')}</h3><p>${t('cat')}: <b>${esc(L(p.categories,'name')||'—')}</b><br>${t('status')}: <b>${esc(p.status)}</b></p></div>${p.live_url?`<div class="box" style="margin-top:var(--sp-3)"><h3 style="margin-top:0">${t('tryT')}</h3><p>${t('tryD')}</p>${live(p)}</div>`:''}</aside></div>
<h2 class="st">${t('related')}</h2><div class="grid" id="rel"></div>
<dialog id="lb"><img id="li" alt=""><div class="row" style="justify-content:center;padding:8px"><button class="btn" id="lp">${PV}</button><button class="btn" id="ln">${NX}</button><button class="btn" id="lf" aria-label="Fullscreen">⛶</button><button class="btn" id="lc" aria-label="Close">✕</button></div></dialog>`;
if(im.length){let k=0,x0=0;const show=n=>{k=(n+im.length)%im.length;$('#mi').src=$('#li').src=im[k].public_url;$$('.thumbs img').forEach((e,j)=>e.classList.toggle('on',j==k))};show(0);
$$('.thumbs img').forEach(e=>{e.onclick=()=>show(+e.dataset.j);e.onkeydown=ev=>ev.key=='Enter'&&show(+e.dataset.j)});
$('.gal .pv').onclick=$('#lp').onclick=()=>show(k-1);$('.gal .nx').onclick=$('#ln').onclick=()=>show(k+1);
$('#mi').onclick=()=>$('#lb').showModal();$('#lc').onclick=()=>$('#lb').close();$('#lf').onclick=()=>$('#lb').requestFullscreen?.();
const m=$('.gal .main');m.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});m.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>40)show(k+(d<0?1:-1)*(lang=='ar'?-1:1))})}
const{data:o}=await sb.from('projects').select(LIST).neq('id',p.id).limit(20);
const sc=x=>(x.category_id&&x.category_id==p.category_id?2:0)+x.project_technologies.filter(y=>tg.includes(y.technology)).length+x.project_industries.filter(y=>ins.includes(y.industry)).length;
const r=(o||[]).map(x=>[sc(x),x]).filter(a=>a[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,3).map(a=>a[1]);
$('#rel').innerHTML=r.length?r.map(card).join(''):`<div class="empty" style="grid-column:1/-1">${t('none')}</div>`}
