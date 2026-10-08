import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import{SUPABASE_URL as U,SUPABASE_KEY as K}from'./config.js';
export const sb=createClient(U,K);
export const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
export const url=u=>/^https?:\/\//i.test(u||'')?u:'#';
const D={ar:{heroT:'اكتشف مشاريعنا الرقمية',explore:'استعرض المشاريع',featT:'المشاريع المميزة',feat:'مميز',search:'ابحث عن مشروع…',all:'كل الأقسام',allT:'كل التقنيات',visit:'زيارة المشروع',details:'التفاصيل',none:'لا توجد مشاريع بعد.',related:'مشاريع مشابهة',tech:'التقنيات',ind:'المجالات',info:'معلومات المشروع',home:'الرئيسية',projects:'المشاريع',load:'جاري التحميل…',err:'حدث خطأ في التحميل.',retry:'إعادة المحاولة',nf:'المشروع غير موجود.',other:'أخرى',status:'الحالة',cat:'القسم',tryT:'جرّب المشروع بنفسك',tryD:'افتح المشروع الفعلي في تبويب جديد واستكشفه.',login:'تسجيل الدخول',email:'البريد الإلكتروني',pass:'كلمة المرور',logout:'تسجيل الخروج',overview:'نظرة عامة',categories:'الأقسام',analytics:'الإحصائيات',settings:'الإعدادات',save:'حفظ',cancel:'إلغاء',add:'إضافة'},
en:{heroT:'Explore Our Digital Projects',explore:'Explore Projects',featT:'Featured Projects',feat:'Featured',search:'Search projects…',all:'All categories',allT:'All technologies',visit:'Visit Live Project',details:'View Details',none:'No projects available yet.',related:'Related Projects',tech:'Technologies',ind:'Industries',info:'Project Information',home:'Home',projects:'Projects',load:'Loading…',err:'Failed to load.',retry:'Retry',nf:'Project not found.',other:'Other',status:'Status',cat:'Category',tryT:'Try it yourself',tryD:'Open the live project in a new tab and explore it.',login:'Sign in',email:'Email',pass:'Password',logout:'Logout',overview:'Overview',categories:'Categories',analytics:'Analytics',settings:'Settings',save:'Save',cancel:'Cancel',add:'Add'}};
export let lang=localStorage.lang==='en'?'en':'ar';
export const t=k=>D[lang][k]||k;
export const L=(o,f)=>o?.[f+'_'+lang]||o?.[f+'_en']||'';
export function boot(){const h=document.documentElement;h.lang=lang;h.dir=lang=='ar'?'rtl':'ltr';h.dataset.theme=localStorage.theme||'dark';
$$('[data-i]').forEach(e=>e.textContent=t(e.dataset.i));$$('[data-ph]').forEach(e=>e.placeholder=t(e.dataset.ph));
const l=$('#lang');if(l){l.textContent=lang=='ar'?'EN':'ع';l.onclick=()=>{localStorage.lang=lang=='ar'?'en':'ar';location.reload()}}
const m=$('#theme');if(m)m.onclick=()=>{localStorage.theme=h.dataset.theme=='dark'?'light':'dark';h.dataset.theme=localStorage.theme}}
// Anonymous analytics: no personal data; admins are never tracked.
export async function track(projectId){try{
if(/bot|crawl|spider|headless|lighthouse|preview/i.test(navigator.userAgent))return;
const key='t:'+(projectId||location.pathname),now=Date.now();if(now-(+sessionStorage[key]||0)<(projectId?18e5:3e4))return;sessionStorage[key]=now;
const{data:{session}}=await sb.auth.getSession();if(session)return;
let s=sessionStorage.sid;if(!s)s=sessionStorage.sid=crypto.randomUUID().replace(/-/g,'');
const ua=navigator.userAgent,dev=/ipad|tablet/i.test(ua)?'tablet':/mobi|android|iphone/i.test(ua)?'mobile':'desktop';
const br=/edg\//i.test(ua)?'Edge':/firefox/i.test(ua)?'Firefox':/chrome/i.test(ua)?'Chrome':/safari/i.test(ua)?'Safari':'Other';
const os=/android/i.test(ua)?'Android':/iphone|ipad/i.test(ua)?'iOS':/windows/i.test(ua)?'Windows':/mac/i.test(ua)?'macOS':/linux/i.test(ua)?'Linux':'Other';
let ref=document.referrer,rt='direct';if(ref){try{const h=new URL(ref).hostname;rt=h===location.hostname?'direct':/google|bing|yahoo|duckduckgo|yandex|baidu/i.test(h)?'search':'referral'}catch{rt='other'}}
await sb.rpc('track_visit',{p_session:s,p_page:projectId?'/project':location.pathname,p_device:dev,p_browser:br,p_os:os,p_referrer:ref||null,p_referrer_type:rt,p_project:projectId||null})}catch(e){console.warn('track',e)}}
