const destinations = [
"Worldwide","Worldwide excluding USA, Canada and the Caribbean","Worldwide including USA, Canada and the Caribbean","Europe (multiple countries)",
"Afghanistan","Åland Islands","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bonaire, Sint Eustatius and Saba","Bosnia and Herzegovina","Botswana","Bouvet Island","Brazil","British Indian Ocean Territory","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Cayman Islands","Central African Republic","Chad","Chile","China","Christmas Island","Cocos (Keeling) Islands","Colombia","Comoros","Cook Islands","Costa Rica","Côte d'Ivoire","Croatia","Cuba","Curaçao","Cyprus","Czechia","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Guiana","French Polynesia","French Southern Territories","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana","Haiti","Heard Island and McDonald Islands","Holy See","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macao","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island","North Korea","North Macedonia","Northern Mariana Islands","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Pitcairn","Poland","Portugal","Puerto Rico","Qatar","Republic of the Congo","Réunion","Romania","Russia","Rwanda","Saint Barthélemy","Saint Helena, Ascension and Tristan da Cunha","Saint Kitts and Nevis","Saint Lucia","Saint Martin","Saint Pierre and Miquelon","Saint Vincent and the Grenadines","Samoa","San Marino","São Tomé and Príncipe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Sint Maarten","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Georgia and the South Sandwich Islands","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Svalbard and Jan Mayen","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu","Uganda","Ukraine","United Arab Emirates","United States","United States Minor Outlying Islands","United States Virgin Islands","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam","Wallis and Futuna","Western Sahara","Yemen","Zambia","Zimbabwe"
];

const input=document.querySelector("#destination");
const list=document.querySelector("#destination-list");
const error=document.querySelector("#destination-error");
const popular=["Spain","France","Italy","Turkey","Greece","Portugal","United States","Canada","Australia","Europe (multiple countries)","Worldwide"];
let activeIndex=-1;
let current=[];

function renderSuggestions(values){
  current=values.slice(0,12); activeIndex=-1; list.innerHTML="";
  if(!current.length){list.hidden=true;return}
  current.forEach((name,index)=>{
    const button=document.createElement("button");
    button.type="button";button.className="suggestion";button.role="option";button.textContent=name;
    button.addEventListener("mousedown",e=>{e.preventDefault();choose(name)});
    list.appendChild(button);
  });
  list.hidden=false;
}
function choose(name){input.value=name;list.hidden=true;error.textContent="";input.focus()}
function updateList(){
  const query=input.value.trim().toLowerCase();
  const matches=query?destinations.filter(d=>d.toLowerCase().includes(query)):popular;
  renderSuggestions(matches);
}
input.addEventListener("focus",updateList);
input.addEventListener("input",updateList);
input.addEventListener("keydown",e=>{
  const items=[...list.querySelectorAll(".suggestion")];
  if(e.key==="ArrowDown"&&items.length){e.preventDefault();activeIndex=(activeIndex+1)%items.length}
  else if(e.key==="ArrowUp"&&items.length){e.preventDefault();activeIndex=(activeIndex-1+items.length)%items.length}
  else if(e.key==="Enter"&&activeIndex>=0){e.preventDefault();choose(current[activeIndex]);return}
  else if(e.key==="Escape"){list.hidden=true;return}
  items.forEach((item,i)=>item.classList.toggle("active",i===activeIndex));
});
document.addEventListener("click",e=>{if(!e.target.closest(".destination-field"))list.hidden=true});

const today=new Date().toISOString().split("T")[0];
document.querySelector("#departure").min=today;
document.querySelector("#return-date").min=today;
document.querySelector("#departure").addEventListener("change",e=>{
  document.querySelector("#return-date").min=e.target.value||today;
});

document.querySelectorAll('input[name="trip-type"]').forEach(radio=>{
  radio.addEventListener("change",()=>{
    document.querySelectorAll(".trip-option").forEach(label=>label.classList.toggle("active",label.contains(document.querySelector('input[name="trip-type"]:checked'))));
  });
});

document.querySelector("#quote-form").addEventListener("submit",e=>{
  e.preventDefault();
  const valid=destinations.some(d=>d.toLowerCase()===input.value.trim().toLowerCase());
  if(!valid){error.textContent="Please select a valid destination.";input.focus();updateList();return}
  error.textContent="";
  trackAnalyticsEvent("quote_submit",{
    trip_type:document.querySelector('input[name="trip-type"]:checked')?.value||"single",
    destination:input.value.trim(),
    travellers:document.querySelector("#travellers")?.value||""
  });
  const message=document.querySelector("#form-message");
  message.hidden=false;
  message.scrollIntoView({behavior:"smooth",block:"nearest"});
});

const menu=document.querySelector(".menu-button");
const nav=document.querySelector("#site-nav");
menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open))});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false")}));
document.querySelector("#year").textContent=new Date().getFullYear();


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
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
  if(!analyticsLoaded){
    const tag=document.createElement("script");
    tag.async=true;
    tag.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(tag);
    window.gtag("js",new Date());
    analyticsLoaded=true;
  }
  window.gtag("config",GA_MEASUREMENT_ID);
}
function disableAnalytics(){
  window[GA_DISABLE_KEY]=true;
  clearAnalyticsCookies();
}
function trackAnalyticsEvent(name,parameters={}){
  if(getAnalyticsPreference()==="accepted"&&typeof window.gtag==="function"){
    window.gtag("event",name,parameters);
  }
}

const cookieBanner=document.querySelector("#cookie-banner");
const cookieAccept=document.querySelector("#cookie-accept");
const cookieReject=document.querySelector("#cookie-reject");
const cookieSettings=document.querySelector("#cookie-settings");

function showCookieBanner(){cookieBanner.hidden=false}
function hideCookieBanner(){cookieBanner.hidden=true}

cookieAccept.addEventListener("click",()=>{
  setAnalyticsPreference("accepted");
  loadAnalytics();
  hideCookieBanner();
});
cookieReject.addEventListener("click",()=>{
  setAnalyticsPreference("rejected");
  disableAnalytics();
  hideCookieBanner();
});
cookieSettings.addEventListener("click",showCookieBanner);

const storedAnalyticsPreference=getAnalyticsPreference();
if(storedAnalyticsPreference==="accepted")loadAnalytics();
else if(storedAnalyticsPreference==="rejected")disableAnalytics();
else showCookieBanner();

document.querySelector("#quote-form").addEventListener("input",()=>{
  if(quoteStarted)return;
  quoteStarted=true;
  trackAnalyticsEvent("quote_start");
});
document.querySelector(".text-link")?.addEventListener("click",()=>trackAnalyticsEvent("outbound_click",{link_name:"official_ghic_guidance"}));
document.querySelector(".secondary-button")?.addEventListener("click",()=>trackAnalyticsEvent("partner_contact_click"));
