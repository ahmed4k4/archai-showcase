import{sb,$,$$,esc,t,boot}from'./core.js';import{BUCKET}from'./config.js';import{fx}from'./fx.js';
boot();
const bye=(q='')=>{location.replace('login.html'+q);throw 0};
const{data:{session}}=await sb.auth.getSession();if(!session)bye();
{const{data}=await sb.from('profiles').select('role').eq('id',session.user.id).maybeSingle();if(data?.role!=='admin'){await sb.auth.signOut();bye('?denied=1')}}
const V=$('#view');let charts=[];new MutationObserver(()=>fx(V)).observe(V,{childList:true});
const toast=(m,e)=>{const d=document.createElement('div');d.id='toast';d.textContent=m;if(e)d.style.borderColor='var(--danger)';document.body.append(d);setTimeout(()=>d.remove(),3500)};
const run=async f=>{try{return await f()}catch(e){console.error(e);toast(e.message||String(e),1)}};
const ok=r=>{if(r.error)throw r.error;return r.data};
const fmt=n=>(n??0).toLocaleString(),day=864e5;
const slug=s=>s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const SLUG=/^[a-z0-9]+(-[a-z0-9]+)*$/;
const empty=m=>`<div class="empty">${m}</div>`;

const form=(title,fields,v={},extra)=>new Promise(res=>{const d=document.createElement('dialog');d.className='dlg';
const inp=f=>f.sec?`<h4 class="sec">${f.sec}</h4>`:f.x?'<div class="full" id="xt"></div>':`<label class="${f.t=='checkbox'?'ck ':''}${f.w||''}">${f.t=='checkbox'?`<input type="checkbox" name="${f.n}">${f.l}`:f.l+(f.t=='textarea'?`<textarea name="${f.n}" rows="4" ${f.r?'required':''}></textarea>`:f.t=='select'?`<select name="${f.n}">${f.o.map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join('')}</select>`:`<input name="${f.n}" type="${f.t||'text'}" ${f.r?'required':''} ${f.ph?`placeholder="${f.ph}"`:''}>`)}</label>`;
d.innerHTML=`<form><h3>${title}</h3><div class="fg">${fields.map(inp).join('')}</div><div class="fa"><button type="button" class="btn" id="cx">${t('cancel')}</button><button class="btn p">${t('save')}</button></div></form>`;
document.body.append(d);const F=d.firstChild;
fields.forEach(f=>{if(f.n){const e=F.elements[f.n];f.t=='checkbox'?e.checked=!!v[f.n]:e.value=v[f.n]??''}});
const close=r=>{res(r);d.close();d.remove()};d.onclose=()=>res(null);$('#cx',d).onclick=()=>close(null);
F.onsubmit=e=>{e.preventDefault();const o={};fields.forEach(f=>{if(!f.n)return;const e=F.elements[f.n];o[f.n]=f.t=='checkbox'?e.checked:f.t=='number'?Number(e.value||0):(e.value.trim()||(f.nul?null:''))});close(o)};
d.showModal();extra&&extra($('#xt',d))});

async function pack(f){const b=await createImageBitmap(f),s=Math.min(1,1600/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=Math.round(b.width*s);c.height=Math.round(b.height*s);c.getContext('2d').drawImage(b,0,0,c.width,c.height);return new Promise(r=>c.toBlob(r,'image/webp',.85))}
const ROLE={cover:['is_cover','cover_image'],featured:['is_featured','featured_image'],hero:['is_hero','hero_image']};
async function media(box,pid){let im=[];
const setRole=async(i,k)=>{const[c,pc]=ROLE[k];ok(await sb.from('project_images').update({[c]:false}).eq('project_id',pid));ok(await sb.from('project_images').update({[c]:true}).eq('id',i.id));ok(await sb.from('projects').update({[pc]:i.public_url}).eq('id',pid))};
const draw=async()=>{im=ok(await sb.from('project_images').select('*').eq('project_id',pid).order('sort_order'));
box.innerHTML=`<h4 class="sec" style="margin:0 0 8px">Media</h4><label class="drop" id="dz">Drop images here or click to upload<input type="file" id="fi" accept="image/*" multiple hidden></label><div class="imgs" style="margin-top:8px">${im.map(i=>`<figure data-id="${i.id}"><img src="${esc(i.public_url)}" alt=""><div class="row">${Object.keys(ROLE).map(k=>`<button type="button" class="btn s ${i[ROLE[k][0]]?'on':''}" data-r="${k}">${k}</button>`).join('')}<button type="button" class="btn s d" data-x="1" aria-label="Delete">✕</button></div></figure>`).join('')}</div>`;
const up=async fl=>run(async()=>{const a=[...fl].filter(f=>f.type.startsWith('image/'));let n=0;for(const f of a){toast(`Uploading ${++n}/${a.length}…`);const b=await pack(f),path=`${pid}/${crypto.randomUUID()}.webp`;
const s=await sb.storage.from(BUCKET).upload(path,b,{contentType:'image/webp'});if(s.error)throw s.error;
const pu=sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
const row=ok(await sb.from('project_images').insert({project_id:pid,storage_path:path,public_url:pu,sort_order:im.length+n}).select().single());
if(!im.length&&n==1)for(const k in ROLE)await setRole(row,k)}toast('Uploaded ✓');await draw()});
$('#fi').onchange=e=>up(e.target.files);const z=$('#dz');z.ondragover=e=>e.preventDefault();z.ondrop=e=>{e.preventDefault();up(e.dataTransfer.files)};
box.onclick=e=>{const b=e.target.closest('button');if(!b)return;const i=im.find(x=>x.id==b.closest('figure').dataset.id);
run(async()=>{if(b.dataset.r)await setRole(i,b.dataset.r);else if(confirm('Delete this image?')){await sb.storage.from(BUCKET).remove([i.storage_path]);ok(await sb.from('project_images').delete().eq('id',i.id));const u={};for(const k in ROLE)if(i[ROLE[k][0]])u[ROLE[k][1]]=null;if(Object.keys(u).length)ok(await sb.from('projects').update(u).eq('id',pid))}await draw()})}};
await run(draw)}

async function editProject(id){
const cats=ok(await sb.from('categories').select('id,name_en').order('sort_order'));
let v={status:'draft',sort_order:0,featured:false,featured_sort_order:0},exists=!!id;
if(id){v=ok(await sb.from('projects').select('*,project_technologies(technology),project_industries(industry)').eq('id',id).single());v.tech=v.project_technologies.map(x=>x.technology).join(', ');v.ind=v.project_industries.map(x=>x.industry).join(', ')}
const pid=id||crypto.randomUUID();
const F=[{sec:'General'},{n:'title_en',l:'Title EN *',r:1},{n:'title_ar',l:'Title AR *',r:1},{n:'slug',l:'Slug',ph:'smart-home-controller'},{n:'category_id',l:'Category',t:'select',nul:1,o:[['','—'],...cats.map(c=>[c.id,c.name_en])]},{n:'status',l:'Status',t:'select',o:[['draft','Draft'],['published','Published'],['archived','Archived']]},{n:'sort_order',l:'Sort order',t:'number'},
{sec:'Content'},{n:'summary_en',l:'Summary EN *',t:'textarea',w:'full',r:1},{n:'summary_ar',l:'Summary AR *',t:'textarea',w:'full',r:1},{n:'description_en',l:'Description EN',t:'textarea',w:'full'},{n:'description_ar',l:'Description AR',t:'textarea',w:'full'},
{sec:'Technologies & Industries'},{n:'tech',l:'Technologies (comma separated)',w:'full'},{n:'ind',l:'Industries (comma separated)',w:'full'},
{sec:'Publishing'},{n:'live_url',l:'Live URL (http/https)',t:'url',nul:1,w:'full'},{n:'featured',l:'Show on homepage featured slider',t:'checkbox',w:'full'},{n:'featured_sort_order',l:'Featured order',t:'number'},{x:1}];
const bad=o=>{o.slug=o.slug||slug(o.title_en);if(!SLUG.test(o.slug))return'Invalid slug — use a-z, 0-9 and hyphens';if(o.live_url){try{if(!/^https?:$/.test(new URL(o.live_url).protocol))throw 0}catch{return'Live URL must start with http:// or https://'}}};
const sync=async(tb,col,str)=>{ok(await sb.from(tb).delete().eq('project_id',pid));const a=[...new Map(str.split(',').map(s=>s.trim()).filter(Boolean).map(s=>[s.toLowerCase(),s])).values()];if(a.length)ok(await sb.from(tb).insert(a.map(x=>({project_id:pid,[col]:x}))))};
for(;;){const o=await form(exists?'Edit project':'New project',F,v,box=>exists?media(box,pid):box.innerHTML=empty('Save the project first, then reopen it to upload images.'));
if(!o)return;let err=bad(o);
if(!err)try{const{tech,ind,...rec}=o;rec.id=pid;ok(await sb.from('projects').upsert(rec).select());await sync('project_technologies','technology',tech);await sync('project_industries','industry',ind);toast('Saved ✓');break}catch(e){err=e.message}
toast(err,1);v=o}
if(!exists)await editProject(pid);else tabs[cur]()}

async function projects(){
const[ps,vc]=await Promise.all([sb.from('projects').select('id,slug,status,sort_order,title_en,featured,updated_at,categories(name_en)').order('sort_order').then(ok),sb.from('project_view_counts').select('*').then(ok)]);
const vm=Object.fromEntries(vc.map(x=>[x.project_id,x]));
V.innerHTML=`<div class="bar"><button class="btn p" data-a="new" style="flex:0;white-space:nowrap">+ New project</button></div>${ps.length?`<div class="tw"><table><thead><tr><th>#</th><th>Project</th><th>Category</th><th>Status</th><th>Views</th><th>Featured</th><th>Updated</th><th>Actions</th></tr></thead><tbody>${ps.map(p=>`<tr data-id="${p.id}"><td><input class="so" type="number" value="${p.sort_order}" aria-label="Sort order"></td><td><b>${esc(p.title_en)}</b><br><small>${esc(p.slug)}</small></td><td>${esc(p.categories?.name_en||'—')}</td><td><span class="badge ${p.status=='published'?'':'c'}">${p.status}</span></td><td>${fmt(vm[p.id]?.views)} <small>(${fmt(vm[p.id]?.unique_visitors)} unique)</small></td><td>${p.featured?'★':'—'}</td><td>${new Date(p.updated_at).toLocaleDateString()}</td><td><div class="row" style="margin:0"><button class="btn s" data-a="edit">Edit</button><button class="btn s" data-a="view">View</button><button class="btn s" data-a="stats">Stats</button><button class="btn s" data-a="dup">Duplicate</button><button class="btn s" data-a="pub">${p.status=='published'?'Unpublish':'Publish'}</button><button class="btn s d" data-a="del">Delete</button></div></td></tr>`).join('')}</tbody></table></div>`:empty('No projects yet.')}`;
V.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const tr=b.closest('tr'),id=tr?.dataset.id,p=ps.find(x=>x.id==id);
run(async()=>{switch(b.dataset.a){
case'new':return editProject();case'edit':return editProject(id);
case'view':return window.open('project.html?id='+id,'_blank');
case'pub':ok(await sb.from('projects').update({status:p.status=='published'?'draft':'published'}).eq('id',id));break;
case'dup':{const f=ok(await sb.from('projects').select('*,project_technologies(technology),project_industries(industry)').eq('id',id).single());const n={...f,id:crypto.randomUUID(),slug:f.slug+'-copy-'+Math.random().toString(36).slice(2,6),status:'draft',featured:false,cover_image:null,hero_image:null,featured_image:null};['project_technologies','project_industries','created_at','updated_at'].forEach(k=>delete n[k]);ok(await sb.from('projects').insert(n));
const a=f.project_technologies.map(x=>({project_id:n.id,technology:x.technology})),c=f.project_industries.map(x=>({project_id:n.id,industry:x.industry}));if(a.length)ok(await sb.from('project_technologies').insert(a));if(c.length)ok(await sb.from('project_industries').insert(c));toast('Duplicated ✓');break}
case'del':{if(!confirm(`Delete "${p.title_en}" and all its images? This cannot be undone.`))return;const im=ok(await sb.from('project_images').select('storage_path').eq('project_id',id));if(im.length)await sb.storage.from(BUCKET).remove(im.map(x=>x.storage_path));ok(await sb.from('projects').delete().eq('id',id));toast('Deleted ✓');break}
case'stats':{const r=ok(await sb.rpc('project_analytics',{p_project:id,p_from:'2000-01-01',p_to:new Date().toISOString()}));alert(`${p.title_en}\nViews: ${r.views}\nUnique visitors: ${r.unique_visitors}`);return}}
await projects()})};
V.onchange=e=>{if(!e.target.classList.contains('so'))return;run(async()=>{ok(await sb.from('projects').update({sort_order:Number(e.target.value)||0}).eq('id',e.target.closest('tr').dataset.id));toast('Order saved ✓')})}}

async function categories(){const cs=ok(await sb.from('categories').select('*').order('sort_order'));
V.innerHTML=`<div class="bar"><button class="btn p" data-a="new" style="flex:0;white-space:nowrap">+ New category</button></div>${cs.length?`<div class="tw"><table><thead><tr><th>#</th><th>Name EN</th><th>Name AR</th><th>Slug</th><th>Active</th><th>Actions</th></tr></thead><tbody>${cs.map(c=>`<tr data-id="${c.id}"><td><input class="so" type="number" value="${c.sort_order}"></td><td>${esc(c.icon||'')} ${esc(c.name_en)}</td><td>${esc(c.name_ar)}</td><td>${esc(c.slug)}</td><td><input type="checkbox" class="ac" ${c.active?'checked':''} aria-label="Active"></td><td><div class="row" style="margin:0"><button class="btn s" data-a="edit">Edit</button><button class="btn s d" data-a="del">Delete</button></div></td></tr>`).join('')}</tbody></table></div>`:empty('No categories yet.')}`;
const edit=async c=>{let v=c||{sort_order:cs.length+1,active:true};for(;;){const o=await form(c?'Edit category':'New category',[{n:'name_en',l:'Name EN *',r:1},{n:'name_ar',l:'Name AR *',r:1},{n:'slug',l:'Slug'},{n:'icon',l:'Icon (emoji)',nul:1},{n:'description_en',l:'Description EN',nul:1,w:'full'},{n:'description_ar',l:'Description AR',nul:1,w:'full'},{n:'sort_order',l:'Sort order',t:'number'},{n:'active',l:'Active (visible on site)',t:'checkbox'}],v);if(!o)return;o.slug=o.slug||slug(o.name_en);
if(!SLUG.test(o.slug)){toast('Invalid slug',1);v=o;continue}
try{c?ok(await sb.from('categories').update(o).eq('id',c.id)):ok(await sb.from('categories').insert(o));toast('Saved ✓');return}catch(e){toast(e.message,1);v=o}}};
V.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const id=b.closest('tr')?.dataset.id,c=cs.find(x=>x.id==id);
run(async()=>{if(b.dataset.a=='new')await edit();else if(b.dataset.a=='edit')await edit(c);else if(confirm(`Delete "${c.name_en}"? Its projects will become uncategorized.`)){ok(await sb.from('categories').delete().eq('id',id));toast('Deleted ✓')}else return;await categories()})};
V.onchange=e=>{const tr=e.target.closest('tr'),k=e.target;if(!tr)return;run(async()=>{ok(await sb.from('categories').update(k.classList.contains('so')?{sort_order:Number(k.value)||0}:{active:k.checked}).eq('id',tr.dataset.id));toast('Saved ✓')})}}

const rng=k=>{const n=new Date(),s=new Date(n.getFullYear(),n.getMonth(),n.getDate());return{today:[s,n],yesterday:[new Date(+s-day),s],7:[new Date(+s-6*day),n],30:[new Date(+s-29*day),n],90:[new Date(+s-89*day),n],year:[new Date(n.getFullYear(),0,1),n]}[k]};
async function analytics(){
V.onclick=V.onchange=null;
V.innerHTML=`<div class="bar"><select id="rk"><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="7">Last 7 days</option><option value="30" selected>Last 30 days</option><option value="90">Last 90 days</option><option value="year">This year</option><option value="custom">Custom range</option></select><input type="date" id="f1" hidden><input type="date" id="f2" hidden><button class="btn p" id="ap" style="flex:0">Apply</button></div><div id="ao"></div>`;
$('#rk').onchange=e=>$$('#f1,#f2').forEach(x=>x.hidden=e.target.value!='custom');
const load=()=>run(async()=>{let a,b;const k=$('#rk').value;if(k=='custom'){if(!$('#f1').value||!$('#f2').value)return toast('Pick both dates',1);a=new Date($('#f1').value);b=new Date($('#f2').value+'T23:59:59')}else[a,b]=rng(k);
$('#ao').innerHTML=empty('Loading analytics…');charts.forEach(c=>c.destroy());charts=[];
const d=ok(await sb.rpc('analytics_dashboard',{p_from:a.toISOString(),p_to:b.toISOString(),p_bucket:(b-a)/day>92?'month':'day'})),T=d.totals;
if(!T.page_views&&!T.project_views){$('#ao').innerHTML=empty('No analytics data available for this period.');return}
const tb=(h,rows)=>`<div class="tw"><table><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.join(''):`<tr><td colspan="${h.length}">—</td></tr>`}</tbody></table></div>`;
$('#ao').innerHTML=`<div class="stats">${[['Unique sessions',T.unique_sessions],['Page views',T.page_views],['Project views (raw)',T.project_views],['Unique project visitors',T.unique_project_visitors]].map(x=>`<div class="stat"><b data-n="${x[1]??0}">0</b><span>${x[0]}</span></div>`).join('')}</div>
<div class="two"><div class="box"><h4>Visitors over time</h4><div class="cv"><canvas id="c1"></canvas></div></div><div class="box"><h4>Project views over time</h4><div class="cv"><canvas id="c2"></canvas></div></div><div class="box"><h4>Devices</h4><div class="cv"><canvas id="c3"></canvas></div></div><div class="box"><h4>Traffic sources</h4><div class="cv"><canvas id="c4"></canvas></div></div></div>
<h4>Top projects</h4>${tb(['Project','Views','Unique','%'],d.top_projects.map(p=>`<tr><td>${esc(p.title_en)}</td><td>${fmt(p.views)}</td><td>${fmt(p.uniq)}</td><td>${p.pct}%</td></tr>`))}
<h4>Top categories</h4>${tb(['Category','Views'],d.top_categories.map(c=>`<tr><td>${esc(c.name_en)}</td><td>${fmt(c.views)}</td></tr>`))}`;
Chart.defaults.color=getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();Chart.defaults.borderColor=getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
const dt=s=>s.map(x=>new Date(x.t).toLocaleDateString()),P=['#22d3ee','#8b5cf6','#34d399','#fbbf24','#f472b6'];
const mk=(id,type,labels,sets)=>charts.push(new Chart($('#'+id),{type,data:{labels,datasets:sets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:sets.length>1||type=='doughnut'}}}}));
mk('c1','line',dt(d.visitors_series),[{label:'Visitors',data:d.visitors_series.map(x=>x.visitors),borderColor:P[0],backgroundColor:'rgba(34,211,238,.14)',fill:true,tension:.4},{label:'Page views',data:d.visitors_series.map(x=>x.page_views),borderColor:P[1],tension:.3}]);
mk('c2','bar',dt(d.project_views_series),[{label:'Views',data:d.project_views_series.map(x=>x.views),backgroundColor:P[0]},{label:'Unique',data:d.project_views_series.map(x=>x.uniq),backgroundColor:P[1]}]);
mk('c3','doughnut',d.devices.map(x=>x.device_type),[{data:d.devices.map(x=>x.sessions),backgroundColor:P}]);
mk('c4','doughnut',d.sources.map(x=>x.referrer_type),[{data:d.sources.map(x=>x.sessions),backgroundColor:P}])});
$('#ap').onclick=load;load()}

async function overview(){V.onclick=V.onchange=null;const o=ok(await sb.rpc('admin_overview'));
V.innerHTML=`<div class="stats">${[['Total projects',o.total_projects],['Published',o.published_projects],['Featured',o.featured_projects],['Total visitors (sessions)',o.sessions],['Total project views',o.project_views]].map(x=>`<div class="stat"><b data-n="${x[1]??0}">0</b><span>${x[0]}</span></div>`).join('')}</div>`}

async function settings(){V.onclick=V.onchange=null;const s=ok(await sb.from('site_settings').select('*').eq('id',1).single());
V.innerHTML=`<div class="box"><p>Company: <b>${esc(s.company_name||'—')}</b></p><button class="btn p" id="es">Edit site settings</button></div>`;
$('#es').onclick=()=>run(async()=>{const o=await form('Site settings',[{n:'company_name',l:'Company name',nul:1},{n:'logo_url',l:'Logo URL',nul:1},{n:'site_title',l:'Website title',nul:1,w:'full'},{n:'home_title_en',l:'Homepage title EN',nul:1},{n:'home_title_ar',l:'Homepage title AR',nul:1},{n:'home_desc_en',l:'Homepage description EN',t:'textarea',w:'full'},{n:'home_desc_ar',l:'Homepage description AR',t:'textarea',w:'full'},{n:'footer_text_en',l:'Footer EN',nul:1},{n:'footer_text_ar',l:'Footer AR',nul:1},{n:'default_seo_image',l:'Default SEO image URL',nul:1,w:'full'},{n:'featured_limit',l:'Slider: max featured projects',t:'number'}],s);
if(o){ok(await sb.from('site_settings').update(o).eq('id',1));toast('Saved ✓');await settings()}})}

const tabs={overview,projects,categories,analytics,settings};let cur='overview';
const go=k=>{cur=k;document.body.classList.remove('open');$$('aside [data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab==k));$('#ttl').textContent=t(k)==k?k[0].toUpperCase()+k.slice(1):t(k);V.innerHTML=empty(t('load'));run(tabs[k])};
$$('aside [data-tab]').forEach(b=>b.onclick=()=>go(b.dataset.tab));
$('#menu').onclick=()=>document.body.classList.toggle('open');
$('#out').onclick=async()=>{await sb.auth.signOut();location.replace('login.html')};
go('overview');
