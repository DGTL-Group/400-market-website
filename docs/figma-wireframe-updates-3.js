/**
 * SCRIPT 3 OF 3: Vendor Profile (optional) + News Archive + Blog Post + Overview
 * Run via Figma MCP use_figma after Script 2
 */

await figma.loadFontAsync({family:'Inter',style:'Regular'});
await figma.loadFontAsync({family:'Inter',style:'Medium'});
await figma.loadFontAsync({family:'Inter',style:'Semi Bold'});
await figma.loadFontAsync({family:'Inter',style:'Bold'});

const W=1440;
const C={y:{r:.969,g:.820,b:.090},o:{r:.969,g:.580,b:.114},d:{r:.173,g:.173,b:.173},m:{r:.376,g:.376,b:.376},l:{r:.922,g:.922,b:.922},ph:{r:.800,g:.800,b:.800},w:{r:1,g:1,b:1},sub:{r:.65,g:.65,b:.65},hi:{r:.75,g:.75,b:.75},dk2:{r:.08,g:.08,b:.08}};
const ADDR1='2207 Industrial Park Rd, Innisfil ON';

const R=(p,x,y,w,h,c,n='')=>{const r=figma.createRectangle();r.x=x;r.y=y;r.resize(w,h);r.fills=[{type:'SOLID',color:c}];if(n)r.name=n;p.appendChild(r);return r;};
const T=(p,s,x,y,sz,st,c,mw=0)=>{const t=figma.createText();t.x=x;t.y=y;t.fontName={family:'Inter',style:st};t.fontSize=sz;t.fills=[{type:'SOLID',color:c}];t.characters=String(s);if(mw>0){t.textAutoResize='HEIGHT';t.resize(mw,t.height);}p.appendChild(t);return t;};
const Fr=(p,n,x,y,w,h,c=C.w)=>{const f=figma.createFrame();f.name=n;f.x=x;f.y=y;f.resize(w,h);f.fills=[{type:'SOLID',color:c}];p.appendChild(f);return f;};
const B=(p,l,x,y,w=180,h=48,bg=C.y,tc=C.d)=>{const b=figma.createFrame();b.name=`Btn:${l}`;b.x=x;b.y=y;b.resize(w,h);b.fills=[{type:'SOLID',color:bg}];b.cornerRadius=4;const t=figma.createText();t.fontName={family:'Inter',style:'Bold'};t.fontSize=13;t.characters=l;t.fills=[{type:'SOLID',color:tc}];t.textAlignHorizontal='CENTER';t.resize(w-24,18);t.x=12;t.y=(h-18)/2;b.appendChild(t);p.appendChild(b);return b;};
const PH=(p,x,y,w,h,l='Image')=>{R(p,x,y,w,h,C.ph,l);const t=figma.createText();t.fontName={family:'Inter',style:'Regular'};t.fontSize=13;t.characters=`[ ${l} ]`;t.fills=[{type:'SOLID',color:C.m}];t.textAlignHorizontal='CENTER';const tw=Math.min(w-20,240);t.resize(tw,20);t.x=x+(w-tw)/2;t.y=y+(h-20)/2;p.appendChild(t);};
const D=(p,x,y,w)=>R(p,x,y,w,1,C.ph,'divider');

const NAV=(p)=>{R(p,0,0,W,80,C.d,'Nav');R(p,40,16,48,48,C.y,'Logo');T(p,'400 MARKET',97,26,18,'Bold',C.w);['VENDORS','EVENTS','SHOP','NEWS','ABOUT','CONTACT'].forEach((l,i)=>T(p,l,380+i*120,31,12,'Semi Bold',{r:.78,g:.78,b:.78}));B(p,'BECOME A MERCHANT',W-230,16,190,48,C.y,C.d);};
const FOOTER=(p,y)=>{R(p,0,y,W,300,C.d,'Footer');T(p,'400',80,y+30,40,'Bold',C.y);T(p,'MARKET',80,y+74,22,'Bold',C.w);T(p,'EST. 1986',80,y+100,11,'Regular',C.o);T(p,'FOOD, FINDS & FUN.\nOPEN EVERY WEEK-END.',80,y+126,13,'Regular',C.sub,280);[['EXPLORE',['Home','Vendors','Events','Shop','News']],['MARKET',['About Us','FAQ','Contact Us']],['LEGAL',['Privacy Policy','Terms of Use']]].forEach(([title,items],i)=>{const cx=440+i*220;T(p,title,cx,y+30,12,'Bold',C.y);items.forEach((it,j)=>T(p,it,cx,y+56+j*25,13,'Regular',C.sub));});T(p,'STAY IN THE LOOP',1100,y+30,13,'Bold',C.y);R(p,1100,y+58,280,44,{r:.27,g:.27,b:.27},'Email');T(p,'your@email.com',1116,y+72,13,'Regular',{r:.5,g:.5,b:.5});B(p,'SUBSCRIBE',1100,y+114,140,40,C.y,C.d);D(p,80,y+250,W-160);T(p,'© 2026 The 400 Market. All rights reserved.',80,y+264,12,'Regular',{r:.44,g:.44,b:.44});T(p,'Designed with love by DGTL Group',655,y+264,12,'Regular',{r:.44,g:.44,b:.44});};

// ── Create new pages for News ───────────────────────────
let newsArchivePage = figma.root.children.find(p=>p.name==='10 — News Archive');
if(!newsArchivePage){newsArchivePage=figma.createPage();newsArchivePage.name='10 — News Archive';}
let newsPostPage = figma.root.children.find(p=>p.name==='11 — News Post');
if(!newsPostPage){newsPostPage=figma.createPage();newsPostPage.name='11 — News Post';}

// ── 03 VENDOR PROFILE (OPTIONAL) ────────────────────────
const pg3=figma.root.children.find(p=>p.name.startsWith('03'));
pg3.name='03 — Vendor Profile (OPTIONAL)';
while(pg3.children.length>0) pg3.children[0].remove();
await figma.setCurrentPageAsync(pg3);
const pf=Fr(pg3,'Vendor Profile — OPTIONAL — 1440px',0,0,W,1840);
NAV(pf);

// Optional banner
R(pf,0,80,W,48,C.o,'Optional banner');
T(pf,'⚠ OPTIONAL PAGE — Fast-moving vendor list may make individual vendor pages unviable. Included for GM consideration.',80,92,13,'Bold',C.w,1280);

T(pf,'Home  ›  Vendors  ›  Vendor Name',80,148,12,'Regular',C.m);
PH(pf,0,172,W,320,'Vendor Hero Photo');
R(pf,0,172,W,320,C.dk2,'Overlay');
T(pf,'VENDOR BUSINESS NAME',80,240,44,'Bold',C.y,900);
R(pf,80,300,100,26,C.o,'Badge');T(pf,'ANTIQUES',90,303,12,'Bold',C.w);
T(pf,'Booth  B-14',206,303,13,'Regular',{r:.8,g:.8,b:.8});

R(pf,80,526,860,280,C.l,'Description');R(pf,80,526,5,280,C.y,'_');
T(pf,'About This Vendor',102,546,20,'Bold',C.d);
T(pf,'A detailed description of the vendor — their story, what they sell, and why visitors should stop by. Managed in Payload CMS.',102,576,14,'Regular',C.m,820);
T(pf,'Product categories:',102,652,13,'Semi Bold',C.d);
['Antiques','Vintage','Collectibles','Estate Sales'].forEach((tag,i)=>{
  R(pf,102+i*130,676,118,28,C.y,`Tag:${tag}`);T(pf,tag,112+i*130,681,12,'Regular',C.d);
});
T(pf,'🌐 vendor-website.com    📸 @vendorhandle',102,722,14,'Regular',C.o,600);

R(pf,1000,526,360,280,C.l,'Floor Map');
R(pf,1000,526,360,36,C.d,'Map bar');T(pf,'📍  FIND BOOTH B-14',1016,535,13,'Bold',C.w);
T(pf,'[ Market Floor Map ]',1080,646,14,'Regular',C.m);

T(pf,'PHOTOS FROM THE BOOTH',80,852,24,'Bold',C.d);
for(let i=0;i<4;i++) PH(pf,80+i*338,890,308,220,`Photo ${i+1}`);
B(pf,'← BACK TO VENDORS',80,1150,220,48,C.l,C.d);
FOOTER(pf,1240);pf.resize(W,1540);

// ── 10 NEWS ARCHIVE ─────────────────────────────────────
while(newsArchivePage.children.length>0) newsArchivePage.children[0].remove();
await figma.setCurrentPageAsync(newsArchivePage);
const nf=Fr(newsArchivePage,'News Archive — 1440px',0,0,W,2000);
NAV(nf);

R(nf,0,80,W,200,C.d,'Header');
T(nf,'NEWS',80,120,56,'Bold',C.y,900);
T(nf,'Stories, updates, and tips from the 400 Market community.',80,188,17,'Regular',C.hi,900);

// Featured post (large)
R(nf,80,330,W-160,400,C.l,'Featured Post');
PH(nf,80,330,640,400,'Featured Post Image');
R(nf,720,330,W-160-640,400,C.w,'Featured text area');
R(nf,720,330,6,400,C.y,'Accent');
T(nf,'September 18, 2024',744,358,12,'Regular',C.m);
T(nf,'From Basement To Bustle: Why You Should Set Up Shop At The 400 Market',744,382,22,'Bold',C.d,520);
T(nf,'Greetings, fellow entrepreneurs! Today, I\'m here to advocate for a relocation that might sound outlandish at first — moving your business from the cozy confines of your basement to the bustling bonanza of the 400 Market.',744,450,14,'Regular',C.m,520);
T(nf,'Read more →',744,564,14,'Semi Bold',C.o);

// Older posts grid (3 columns)
T(nf,'OLDER POSTS',80,780,22,'Bold',C.d);
for(let i=0;i<3;i++){
  const nx=80+i*440,ny=824;
  R(nf,nx,ny,400,360,C.w,`Post ${i+2}`);
  PH(nf,nx,ny,400,200,'Post Image');
  T(nf,'January 15, 2025',nx+16,ny+212,11,'Regular',C.m);
  T(nf,`Blog Post Title ${i+2}`,nx+16,ny+232,16,'Bold',C.d,368);
  T(nf,'A short excerpt of the blog post content goes here. Just enough to entice the reader to click through.',nx+16,ny+260,13,'Regular',C.m,368);
  T(nf,'Read more →',nx+16,ny+328,13,'Semi Bold',C.o);
}

// Pagination
T(nf,'← Previous',80,1236,14,'Semi Bold',C.o);
T(nf,'Page 1 of 1',660,1236,14,'Regular',C.m);
T(nf,'Next →',W-160,1236,14,'Semi Bold',C.o);

FOOTER(nf,1300);nf.resize(W,1600);

// ── 11 NEWS POST (Blog post example — NO AUTHOR shown) ──
while(newsPostPage.children.length>0) newsPostPage.children[0].remove();
await figma.setCurrentPageAsync(newsPostPage);
const np=Fr(newsPostPage,'News Post — 1440px',0,0,W,2600);
NAV(np);

// Breadcrumb
T(np,'Home  ›  News  ›  From Basement To Bustle',80,100,12,'Regular',C.m);

// Post header (NO AUTHOR — intentional per client request)
R(np,0,124,W,400,C.d,'Post hero bg');
PH(np,0,124,W,400,'Shopping at the 400 Market - Summer');
R(np,0,124,W,400,{r:0,g:0,b:0},'Overlay');
// Override overlay opacity (just make it darker)
R(np,0,360,W,164,C.dk2,'Text bg');
T(np,'September 18, 2024',80,376,13,'Regular',C.hi);
T(np,'From Basement To Bustle: Why You Should Set Up Shop At The 400 Market',80,400,36,'Bold',C.w,900);

// Post body — centered column
const bx=200,bw=1040;

T(np,'Greetings, fellow entrepreneurs, aspiring business moguls, and basement-dwellers! Today, I\'m here to advocate for a relocation that might sound a bit outlandish at first, but bear with me: moving your business from the cozy confines of your basement to the bustling bonanza of the 400 Market.',bx,570,16,'Regular',C.d,bw);

T(np,'Picture this: you, surrounded by boxes, your cat judgmentally sitting on your inventory, and the ever-present aroma of whatever your partner is microwaving. Is this truly the environment for your entrepreneurial ambitions?',bx,660,16,'Regular',C.d,bw);

T(np,'Five Reasons to Make the Move',bx,760,28,'Bold',C.d,bw);

const reasons=[
  ['1. Visibility Galore','Your business gains exposure to a diverse customer audience rather than remaining hidden away. At the 400 Market, thousands of potential customers walk past every weekend.'],
  ['2. Instant Feedback','Direct observation of customer reactions provides real-time market insights. No surveys needed — watch how people interact with your products.'],
  ['3. Networking Nirvana','Opportunities for collaboration and partnership emerge through regular contact with fellow merchants and entrepreneurs.'],
  ['4. Unleash Your Inner Showman','The marketplace is your stage. Engage customers, tell your story, and build a following through charismatic salesmanship.'],
  ['5. Embrace the Chaos','Every weekend promises excitement and unpredictability. No two market days are the same — and that\'s what makes it an adventure.'],
];
let ry=816;
reasons.forEach(([title,body])=>{
  T(np,title,bx,ry,18,'Bold',C.d,bw);
  T(np,body,bx,ry+28,16,'Regular',C.m,bw);
  ry+=100;
});

T(np,'So there you have it. Five compelling reasons to pack up your basement operation and join the 400 Market family. Your entrepreneurial adventure awaits — see you this weekend!',bx,ry+20,16,'Regular',C.d,bw);

// CTA box
R(np,bx,ry+100,bw,120,C.y,'CTA box');
T(np,'READY TO JOIN THE MARKET?',bx+32,ry+124,20,'Bold',C.d,bw-200);
T(np,'Apply for a booth today and join hundreds of thriving merchants.',bx+32,ry+156,15,'Regular',C.d,bw-200);
B(np,'BECOME A MERCHANT',bx+bw-240,ry+128,200,48,C.d,C.w);

// Related posts
T(np,'MORE FROM THE MARKET',80,ry+260,22,'Bold',C.d);
for(let i=0;i<3;i++){
  const rx=80+i*440,rry=ry+304;
  R(np,rx,rry,400,200,C.l,`Related ${i+1}`);
  PH(np,rx,rry,400,120,'Post Image');
  T(np,`Related Blog Post ${i+1}`,rx+16,rry+132,14,'Bold',C.d,368);
  T(np,'A related post excerpt...',rx+16,rry+154,13,'Regular',C.m,368);
  T(np,'Read more →',rx+16,rry+178,13,'Semi Bold',C.o);
}

FOOTER(np,ry+560);np.resize(W,ry+860);

// ── UPDATE OVERVIEW PAGE ────────────────────────────────
const pg0=figma.root.children.find(p=>p.name.startsWith('🗺'));
while(pg0.children.length>0) pg0.children[0].remove();
await figma.setCurrentPageAsync(pg0);

T(pg0,'400 MARKET — WEBSITE WIREFRAMES (v2)',80,60,36,'Bold',C.d,1260);
T(pg0,'Desktop · 1440px  ·  Phase 2 Design  ·  DGTL Group  ·  April 2026',80,108,15,'Regular',C.m,1260);
D(pg0,80,138,1260);

const cards=[
  ['01 — Homepage','Hero, info strip, featured vendors, simple 3-zone map, events, Google Reviews, newsletter'],
  ['02 — Vendors Directory','Filterable vendor grid, simple market map, become-a-merchant CTA'],
  ['03 — Vendor Profile (OPT)','OPTIONAL — Fast-moving vendor list makes this unviable. For GM consideration.'],
  ['04 — Events','Event listing, date badges, calendar export, newsletter CTA'],
  ['05 — Shop','3 products, expanded FAQ accordion. No trust strip, no Stripe branding.'],
  ['06 — Become a Merchant','Real pricing from 400market.com, simple booth map, application form'],
  ['07 — Contact Us (A+B)','Two layout variants: A = form left / B = info+map top. Proper spacing.'],
  ['08 — FAQ','Accordion Q&A in 4 categories. Centered + buttons.'],
  ['09 — About Us','Story, mission, visit info cards, photo gallery'],
  ['10 — News Archive','Featured post hero, older posts grid, pagination'],
  ['11 — News Post','Full blog post wireframe. NO author shown. CTA + related posts.'],
];
cards.forEach(([title,desc],i)=>{
  const col=i%3,row=Math.floor(i/3);
  const bx=80+col*440,by=168+row*180;
  R(pg0,bx,by,400,160,C.l,title);
  R(pg0,bx,by,400,5,title.includes('OPT')?C.o:C.y,'_');
  T(pg0,title,bx+20,by+26,16,'Bold',C.d,360);
  T(pg0,desc,bx+20,by+54,13,'Regular',C.m,360);
  T(pg0,'→ See page',bx+20,by+130,13,'Semi Bold',C.o);
});

return 'Script 3 complete: Vendor Profile (optional), News pages, Overview updated.';
