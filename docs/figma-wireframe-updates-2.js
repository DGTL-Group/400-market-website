/**
 * SCRIPT 2 OF 3: Become a Merchant + Contact Us (2 versions) + FAQ + About Us
 * Run via Figma MCP use_figma after Script 1
 */

await figma.loadFontAsync({family:'Inter',style:'Regular'});
await figma.loadFontAsync({family:'Inter',style:'Medium'});
await figma.loadFontAsync({family:'Inter',style:'Semi Bold'});
await figma.loadFontAsync({family:'Inter',style:'Bold'});

const W=1440;
const C={y:{r:.969,g:.820,b:.090},o:{r:.969,g:.580,b:.114},d:{r:.173,g:.173,b:.173},m:{r:.376,g:.376,b:.376},l:{r:.922,g:.922,b:.922},ph:{r:.800,g:.800,b:.800},w:{r:1,g:1,b:1},sub:{r:.65,g:.65,b:.65},hi:{r:.75,g:.75,b:.75},dk2:{r:.08,g:.08,b:.08}};
const ADDR='2207 Industrial Park Road\nInnisfil, Ontario, L9S 3V9';
const ADDR1='2207 Industrial Park Rd, Innisfil ON';

const R=(p,x,y,w,h,c,n='')=>{const r=figma.createRectangle();r.x=x;r.y=y;r.resize(w,h);r.fills=[{type:'SOLID',color:c}];if(n)r.name=n;p.appendChild(r);return r;};
const T=(p,s,x,y,sz,st,c,mw=0)=>{const t=figma.createText();t.x=x;t.y=y;t.fontName={family:'Inter',style:st};t.fontSize=sz;t.fills=[{type:'SOLID',color:c}];t.characters=String(s);if(mw>0){t.textAutoResize='HEIGHT';t.resize(mw,t.height);}p.appendChild(t);return t;};
const Fr=(p,n,x,y,w,h,c=C.w)=>{const f=figma.createFrame();f.name=n;f.x=x;f.y=y;f.resize(w,h);f.fills=[{type:'SOLID',color:c}];p.appendChild(f);return f;};
const B=(p,l,x,y,w=180,h=48,bg=C.y,tc=C.d)=>{const b=figma.createFrame();b.name=`Btn:${l}`;b.x=x;b.y=y;b.resize(w,h);b.fills=[{type:'SOLID',color:bg}];b.cornerRadius=4;const t=figma.createText();t.fontName={family:'Inter',style:'Bold'};t.fontSize=13;t.characters=l;t.fills=[{type:'SOLID',color:tc}];t.textAlignHorizontal='CENTER';t.resize(w-24,18);t.x=12;t.y=(h-18)/2;b.appendChild(t);p.appendChild(b);return b;};
const PH=(p,x,y,w,h,l='Image')=>{R(p,x,y,w,h,C.ph,l);const t=figma.createText();t.fontName={family:'Inter',style:'Regular'};t.fontSize=13;t.characters=`[ ${l} ]`;t.fills=[{type:'SOLID',color:C.m}];t.textAlignHorizontal='CENTER';const tw=Math.min(w-20,240);t.resize(tw,20);t.x=x+(w-tw)/2;t.y=y+(h-20)/2;p.appendChild(t);};
const D=(p,x,y,w)=>R(p,x,y,w,1,C.ph,'divider');
const FQ=(p,q,x,y,w=W-160)=>{R(p,x,y,w,56,C.l,q);T(p,q,x+32,y+19,14,'Regular',C.d,w-80);T(p,'+',x+w-40,y+16,22,'Bold',C.m);D(p,x,y+56,w);return 64;};

const NAV=(p)=>{R(p,0,0,W,80,C.d,'Nav');R(p,40,16,48,48,C.y,'Logo');T(p,'400 MARKET',97,26,18,'Bold',C.w);['VENDORS','EVENTS','SHOP','NEWS','ABOUT','CONTACT'].forEach((l,i)=>T(p,l,380+i*120,31,12,'Semi Bold',{r:.78,g:.78,b:.78}));B(p,'BECOME A MERCHANT',W-230,16,190,48,C.y,C.d);};
const FOOTER=(p,y)=>{R(p,0,y,W,300,C.d,'Footer');T(p,'400',80,y+30,40,'Bold',C.y);T(p,'MARKET',80,y+74,22,'Bold',C.w);T(p,'EST. 1986',80,y+100,11,'Regular',C.o);T(p,'FOOD, FINDS & FUN.\nOPEN EVERY WEEK-END.',80,y+126,13,'Regular',C.sub,280);[['EXPLORE',['Home','Vendors','Events','Shop','News']],['MARKET',['About Us','FAQ','Contact Us']],['LEGAL',['Privacy Policy','Terms of Use']]].forEach(([title,items],i)=>{const cx=440+i*220;T(p,title,cx,y+30,12,'Bold',C.y);items.forEach((it,j)=>T(p,it,cx,y+56+j*25,13,'Regular',C.sub));});T(p,'STAY IN THE LOOP',1100,y+30,13,'Bold',C.y);R(p,1100,y+58,280,44,{r:.27,g:.27,b:.27},'Email');T(p,'your@email.com',1116,y+72,13,'Regular',{r:.5,g:.5,b:.5});B(p,'SUBSCRIBE',1100,y+114,140,40,C.y,C.d);D(p,80,y+250,W-160);T(p,'© 2026 The 400 Market. All rights reserved.',80,y+264,12,'Regular',{r:.44,g:.44,b:.44});T(p,'Designed with love by DGTL Group',655,y+264,12,'Regular',{r:.44,g:.44,b:.44});};

const MAP=(p,y,title='AVAILABLE BOOTHS',showBooths=true)=>{
  T(p,title,80,y,28,'Bold',C.d,800);
  T(p,showBooths?'See where the open spaces are — contact us to reserve yours.':'Find your way around our indoor market.',80,y+38,15,'Regular',C.m,800);
  const mx=80,my=y+80,mw=W-160,mh=340;R(p,mx,my,mw,mh,C.l,'Market Map — Interactive SVG');
  R(p,mx,my,mw,48,C.d,'Map header');T(p,'📍 MARKET FLOOR PLAN',mx+16,my+14,14,'Bold',C.w);
  [{n:'FOOD COURT',x:0,y:56,w:.33,h:.85,c:C.o},{n:'VENDOR\nSECTION',x:.34,y:56,w:.33,h:.85,c:{r:.6,g:.78,b:.85}},{n:'VENDOR\nSECTION',x:.68,y:56,w:.32,h:.85,c:{r:.75,g:.85,b:.65}}].forEach(s=>{
    const sx=mx+(s.x<1?s.x*mw:s.x),sy=my+(s.y<1?s.y*mh:s.y),sw=(s.w<1?s.w*mw:s.w),sh=(s.h<1?s.h*mh:s.h);
    R(p,sx,sy,sw-4,sh-4,s.c,s.n);
  });
  T(p,'[ Interactive SVG — clickable zones ]',mx+mw/2-150,my+mh-30,12,'Regular',C.m,300);
  return y+440;
};

// Clear pages 06-09
for(const pg of figma.root.children){
  if(['06','07','08','09'].some(n=>pg.name.startsWith(n))){
    while(pg.children.length>0) pg.children[0].remove();
  }
}

// Rename page 06
const pg6r=figma.root.children.find(p=>p.name.startsWith('06'));
pg6r.name='06 — Become a Merchant';

// ── 06 BECOME A MERCHANT ────────────────────────────────
await figma.setCurrentPageAsync(pg6r);
const bf=Fr(pg6r,'Become a Merchant — 1440px',0,0,W,3200);
NAV(bf);

R(bf,0,80,W,280,C.d,'Hero');PH(bf,680,80,760,280,'Market Scene Photo');
T(bf,'BECOME A MERCHANT',80,140,48,'Bold',C.y,560);
T(bf,'For over 35 years, the 400 Market has been the heart of Simcoe County\'s local economy, uniting entrepreneurs, small businesses, and food artisans in one thriving community.',80,204,15,'Regular',{r:.8,g:.8,b:.8},560);

T(bf,'WHY SELL AT 400 MARKET?',80,418,28,'Bold',C.d);
[['Established Traffic','Thousands of shoppers every weekend. No building your own audience.'],
 ['Flexible Rentals','New merchants enjoy flexible options — one-day, weekend, or monthly rentals. No long-term leases.'],
 ['Indoor Year-Round','Rain or shine — the market is fully indoors. Never lose a market day to weather.'],
 ['Low Commitment','Only first and last month\'s rent as deposit. 30-day notice to leave — that\'s it.']
].forEach(([title,body],i)=>{
  const cx=80+(i%2)*680,cy=468+(Math.floor(i/2)*180);
  R(bf,cx,cy,640,160,C.l,title);R(bf,cx,cy,5,160,C.y,'_');
  T(bf,title,cx+20,cy+20,18,'Bold',C.d,600);T(bf,body,cx+20,cy+52,13,'Regular',C.m,600);
});

// Pricing — MONTHLY (from 400market.com)
T(bf,'MONTHLY RATES',80,860,28,'Bold',C.d);
R(bf,80,904,W-160,52,C.d,'Th');
['Booth Type','Size','Monthly Rate','Taxes'].forEach((h,i)=>T(bf,h,104+i*300,918,13,'Bold',C.w));
[['Outdoor – Wooden Stall / Parking Lot','—','$350/month','Included'],
 ['Indoor Booth','8\'×8\'','$500/month','Included'],
 ['Indoor Booth','8\'×16\'','$975/month','Included'],
 ['Indoor Booth','8\'×24\'','$1,200/month','Included'],
 ['Indoor Booth','8\'×32\'','$1,450/month','Included'],
].forEach(([...cells],i)=>{
  R(bf,80,956+i*52,W-160,52,i%2===0?C.l:C.w,`Row ${i}`);
  cells.forEach((c,j)=>T(bf,c,104+j*300,969+i*52,13,'Regular',C.d));
});

// DAILY rates
T(bf,'DAILY & WEEKEND RATES',80,1240,28,'Bold',C.d);
R(bf,80,1284,W-160,52,C.d,'Th2');
['Booth Type','Saturday','Sunday','Full Weekend'].forEach((h,i)=>T(bf,h,104+i*300,1298,13,'Bold',C.w));
[['Outdoor – Parking Lot (20×20, no tables)','$50','$50','$100'],
 ['Outdoor – Wooden Stall','$50','$50','$100'],
 ['Indoor – 8\'×8\' Booth','$75','$75','$150'],
].forEach(([...cells],i)=>{
  R(bf,80,1336+i*52,W-160,52,i%2===0?C.l:C.w,`Row ${i}`);
  cells.forEach((c,j)=>T(bf,c,104+j*300,1349+i*52,13,'Regular',C.d));
});

T(bf,'Payment is due prior to set up. Set up is between 7:30–8:30 AM.',80,1504,13,'Regular',C.m,900);
T(bf,'Permanent merchants: first and last month\'s rent as deposit. 30-day notice upon leaving.',80,1528,13,'Regular',C.m,900);

// Market map showing available booths
const bme=MAP(bf,1580);

// Application form
T(bf,'APPLY FOR A BOOTH',80,bme+20,28,'Bold',C.d);
T(bf,'Fill out the form and our team will be in touch within 2 business days.',80,bme+58,15,'Regular',C.m,900);
[['First Name','Last Name'],['Business Name','Email Address'],['Phone Number','Business Description']].forEach((pair,row)=>{
  pair.forEach((field,col)=>{
    const fx=80+col*680,fy=bme+108+row*96;
    T(bf,field,fx,fy,12,'Semi Bold',C.d);
    R(bf,fx,fy+20,640,field==='Business Description'?100:48,C.l,field);
  });
});
B(bf,'SUBMIT APPLICATION',80,bme+420,240,56,C.y,C.d);
T(bf,'By submitting you agree to our Terms of Use and Privacy Policy.',340,bme+434,12,'Regular',C.m,700);

FOOTER(bf,bme+520);bf.resize(W,bme+820);

// ── 07 CONTACT US — VERSION A (Form left, Info right, Map below) ──
const pg7=figma.root.children.find(p=>p.name.startsWith('07'));
await figma.setCurrentPageAsync(pg7);

// Version A
const cfA=Fr(pg7,'Contact Us — Version A',0,0,W,1700);
NAV(cfA);
R(cfA,0,80,W,160,C.y,'Header');T(cfA,'CONTACT US',80,118,48,'Bold',C.d,900);
T(cfA,"We'd love to hear from you. Questions, merchant inquiries, or just saying hello.",80,180,16,'Regular',C.d,900);

T(cfA,'SEND US A MESSAGE',80,296,22,'Bold',C.d);
['Your Name','Email Address','Subject'].forEach((f,i)=>{T(cfA,f,80,344+i*88,12,'Semi Bold',C.d);R(cfA,80,362+i*88,660,48,C.l,f);});
T(cfA,'Message',80,607,12,'Semi Bold',C.d);R(cfA,80,625,660,120,C.l,'Message');
B(cfA,'SEND MESSAGE',80,776,200,52,C.y,C.d);

// Info panel — with space between form and panel
R(cfA,800,280,560,560,C.l,'Info panel');
T(cfA,'GET IN TOUCH',832,308,18,'Bold',C.d);
[['📍 Address','The 400 Market\n2207 Industrial Park Road\nInnisfil, Ontario, L9S 3V9'],
 ['📞 Phone','705-436-1010'],
 ['✉️ Email','manager@400market.com'],
 ['🕐 Hours','Sat & Sun · 9:00 AM – 5:00 PM\nRain or shine · Year-round'],
].forEach(([label,val],i)=>{T(cfA,label,832,356+i*120,13,'Bold',C.d);T(cfA,val,832,378+i*120,14,'Regular',C.m,488);});

// Map with clear gap
PH(cfA,80,900,W-160,340,'Google Maps Embed — 2207 Industrial Park Road, Innisfil ON');
FOOTER(cfA,1300);cfA.resize(W,1600);

// Version B (Map top, then form + info side by side below)
const cfB=Fr(pg7,'Contact Us — Version B',1600,0,W,1900);
NAV(cfB);
R(cfB,0,80,W,160,C.y,'Header');T(cfB,'CONTACT US',80,118,48,'Bold',C.d,900);
T(cfB,"We'd love to hear from you. Questions, merchant inquiries, or just saying hello.",80,180,16,'Regular',C.d,900);

// Info panel at top
R(cfB,80,296,W-160,320,C.l,'Info panel');
T(cfB,'GET IN TOUCH',120,320,22,'Bold',C.d);
const infoItems=[['📍 Address','The 400 Market\n2207 Industrial Park Road\nInnisfil, Ontario, L9S 3V9'],['📞 Phone','705-436-1010'],['✉️ Email','manager@400market.com'],['🕐 Hours','Sat & Sun · 9:00 AM – 5:00 PM\nRain or shine · Year-round']];
infoItems.forEach(([label,val],i)=>{
  const ix=120+i*300;
  T(cfB,label,ix,360,13,'Bold',C.d);T(cfB,val,ix,382,14,'Regular',C.m,260);
});

// Map
PH(cfB,80,660,W-160,320,'Google Maps Embed — 2207 Industrial Park Road, Innisfil ON');

// Form below map
T(cfB,'SEND US A MESSAGE',80,1036,22,'Bold',C.d);
['Your Name','Email Address','Subject'].forEach((f,i)=>{T(cfB,f,80,1084+i*88,12,'Semi Bold',C.d);R(cfB,80,1102+i*88,W-160,48,C.l,f);});
T(cfB,'Message',80,1347,12,'Semi Bold',C.d);R(cfB,80,1365,W-160,120,C.l,'Message');
B(cfB,'SEND MESSAGE',80,1516,200,52,C.y,C.d);

FOOTER(cfB,1600);cfB.resize(W,1900);

// ── 08 FAQ (fixed + centering) ──────────────────────────
const pg8=figma.root.children.find(p=>p.name.startsWith('08'));
await figma.setCurrentPageAsync(pg8);
const ff=Fr(pg8,'FAQ — 1440px',0,0,W,2200);
NAV(ff);
R(ff,0,80,W,160,C.y,'FAQ header');T(ff,'FREQUENTLY ASKED QUESTIONS',80,112,40,'Bold',C.d,900);
T(ff,'Everything you need to know about visiting and selling at 400 Market.',80,168,16,'Regular',C.d,900);
let qy=296;
[['VISITING THE MARKET',['What are your hours?','Where do I park?','Is the market pet-friendly?','Do you accept credit cards?','Is the market indoor or outdoor?']],
 ['MERCHANTS & BOOTHS',['How do I apply for a booth?','What are the booth rates?','What can I sell?','Can I try a day before committing?','Do I need insurance?']],
 ['SHOP & GIFT CERTIFICATES',['How do I redeem a gift certificate?','When does a parking pass expire?','Can I get a refund?','Do all merchants accept gift certificates?']],
 ['LOCATION & ACCESSIBILITY',['Where exactly is 400 Market located?','Is the market wheelchair accessible?','Is there public transit?','Where do I park?']]
].forEach(([section,qs])=>{
  T(ff,section,80,qy,18,'Bold',C.d);D(ff,80,qy+28,W-160);qy+=44;
  qs.forEach(q=>{qy+=FQ(ff,q,80,qy);});qy+=36;
});
FOOTER(ff,qy+40);ff.resize(W,qy+340);

// ── 09 ABOUT US ─────────────────────────────────────────
const pg9=figma.root.children.find(p=>p.name.startsWith('09'));
await figma.setCurrentPageAsync(pg9);
const af=Fr(pg9,'About Us — 1440px',0,0,W,2200);
NAV(af);
PH(af,0,80,W,400,'Market Interior — Wide Shot');
R(af,0,80,640,400,{r:.07,g:.07,b:.07},'Overlay');
T(af,'OUR STORY',80,190,52,'Bold',C.y,520);
T(af,'Est. 1986  ·  Innisfil, Ontario',80,258,18,'Regular',C.hi,520);

T(af,'FROM HUMBLE BEGINNINGS',80,542,30,'Bold',C.d,660);
T(af,'For over 35 years, the 400 Market has been the heart of Simcoe County\'s local economy, uniting entrepreneurs, small businesses, and food artisans in one thriving community.\n\nWith hundreds of unique vendor spaces, thousands of weekly visitors, and a dedicated team committed to the market experience, 400 Market is more than a shopping destination — it\'s where community happens.\n\nToday, the market is managed by Scott Saunders, General Manager.',80,586,14,'Regular',C.m,660);
PH(af,820,522,540,380,'Market History Photo');

R(af,0,1000,W,240,C.y,'Mission block');
T(af,'OUR MISSION',80,1032,28,'Bold',C.d,1260);
T(af,'To provide a vibrant, accessible, and welcoming marketplace where local vendors thrive and community members discover unique finds, fresh food, and lasting connections — every single weekend.',80,1076,18,'Regular',C.d,1260);

T(af,'VISIT US',80,1310,28,'Bold',C.d);
[['Hours','Saturday & Sunday\n9:00 AM – 5:00 PM\nYear-round, rain or shine'],
 ['Location','The 400 Market\n2207 Industrial Park Road\nInnisfil, Ontario, L9S 3V9'],
 ['Space','105,000 SQ FT of shopping\nAccessible spaces available']
].forEach(([title,body],i)=>{
  R(af,80+i*440,1356,400,180,C.l,title);R(af,80+i*440,1356,400,5,C.y,'_');
  T(af,title,100+i*440,1378,16,'Bold',C.d);T(af,body,100+i*440,1408,14,'Regular',C.m,360);
});

T(af,'INSIDE THE MARKET',80,1600,26,'Bold',C.d);
for(let i=0;i<4;i++) PH(af,80+i*338,1644,308,200,`Gallery ${i+1}`);
FOOTER(af,1908);af.resize(W,2208);

return 'Script 2 complete: Become a Merchant, Contact (2 versions), FAQ, About Us rebuilt.';
