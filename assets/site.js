const GA_MEASUREMENT_ID="G-2MBQKGSBMB";
const GA_PREFERENCE_KEY="ctc_analytics_consent";
const GA_DISABLE_KEY="ga-disable-"+GA_MEASUREMENT_ID;
let analyticsLoaded=false;
let quoteStarted=false;

function getAnalyticsPreference(){
  try{return localStorage.getItem(GA_PREFERENCE_KEY)}catch(e){return null}
}
function setAnalyticsPreference(value){
  try{localStorage.setItem(GA_PREFERENCE_KEY,value)}catch(e){}
}
function clearAnalyticsCookies(){
  document.cookie.split(";").forEach(cookie=>{
    const name=cookie.split("=")[0].trim();
    if(name==="_ga"||name.startsWith("_ga_")){
      document.cookie=name+"=; Max-Age=0; path=/; SameSite=Lax";
      document.cookie=name+"=; Max-Age=0; path=/; domain=cleartravelcover.co.uk; SameSite=Lax";
      document.cookie=name+"=; Max-Age=0; path=/; domain=.cleartravelcover.co.uk; SameSite=Lax";
    }
  });
}
function loadAnalytics(){
  window[GA_DISABLE_KEY]=false;
  if(typeof window.gtag!=="function")return;
  window.gtag("consent","update",{
    analytics_storage:"granted",
    ad_storage:"denied",
    ad_user_data:"denied",
    ad_personalization:"denied"
  });
  if(!analyticsLoaded){
    window.gtag("config",GA_MEASUREMENT_ID,{send_page_view:true});
    analyticsLoaded=true;
  }
}
function disableAnalytics(){
  window[GA_DISABLE_KEY]=true;
  if(typeof window.gtag==="function"){
    window.gtag("consent","update",{
      analytics_storage:"denied",
      ad_storage:"denied",
      ad_user_data:"denied",
      ad_personalization:"denied"
    });
  }
  clearAnalyticsCookies();
}
function trackAnalyticsEvent(name,parameters={}){
  if(getAnalyticsPreference()==="accepted"&&typeof window.gtag==="function"){
    window.gtag("event",name,parameters);
  }
}

const menu=document.querySelector(".menu-button");
const nav=document.querySelector("#site-nav");
if(menu&&nav){
  menu.addEventListener("click",()=>{
    const open=nav.classList.toggle("open");
    menu.setAttribute("aria-expanded",String(open));
  });
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded","false");
  }));
}
document.querySelectorAll("#year").forEach(year=>year.textContent=new Date().getFullYear());

const cookieBanner=document.querySelector("#cookie-banner");
const cookieAccept=document.querySelector("#cookie-accept");
const cookieReject=document.querySelector("#cookie-reject");
const cookieSettings=document.querySelector("#cookie-settings");
function showCookieBanner(){if(cookieBanner)cookieBanner.hidden=false}
function hideCookieBanner(){if(cookieBanner)cookieBanner.hidden=true}

cookieAccept?.addEventListener("click",()=>{
  setAnalyticsPreference("accepted");
  loadAnalytics();
  hideCookieBanner();
});
cookieReject?.addEventListener("click",()=>{
  setAnalyticsPreference("rejected");
  disableAnalytics();
  hideCookieBanner();
});
cookieSettings?.addEventListener("click",showCookieBanner);

const storedAnalyticsPreference=getAnalyticsPreference();
if(storedAnalyticsPreference==="accepted")loadAnalytics();
else if(storedAnalyticsPreference==="rejected")disableAnalytics();
else showCookieBanner();

const quoteForm=document.querySelector("#quote-form");
quoteForm?.addEventListener("input",()=>{
  if(quoteStarted)return;
  quoteStarted=true;
  trackAnalyticsEvent("quote_start");
});
document.querySelectorAll("[data-track]").forEach(link=>{
  link.addEventListener("click",()=>trackAnalyticsEvent(link.dataset.track,{link_url:link.href||""}));
});
