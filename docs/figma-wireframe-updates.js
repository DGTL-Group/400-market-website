/**
 * 400 Market — Figma Wireframe Update Script
 * Run via Figma MCP `use_figma` tool when rate limit resets
 *
 * SCRIPT 1 OF 3: Homepage + Vendors Directory + Events + Shop
 *
 * Global changes applied:
 * - Address: 2207 Industrial Park Road, Innisfil, Ontario, L9S 3V9
 * - Phone: 705-436-1010
 * - "Become a Vendor" → "Become a Merchant" (nav CTA + page references)
 * - Footer: NO "Become a Merchant" link. Added "Designed with love by DGTL Group"
 * - Parking is PAID — replaced with "105,000 SQ FT OF SHOPPING"
 * - "200+ vendors" → "HUNDREDS OF UNIQUE VENDORS"
 * - Homepage: Shop section replaced with Google Reviews section
 * - Market map: Ultra-simple, 3 zones, no text (interactive SVG placeholder)
 * - Events: Newsletter section before footer
 * - Shop: No trust strip, no Stripe mentions, expanded FAQ
 */

await figma.loadFontAsync({family:'Inter',style:'Regular'});
await figma.loadFontAsync({family:'Inter',style:'Medium'});
await figma.loadFontAsync({family:'Inter',style:'Semi Bold'});
await figma.loadFontAsync({family:'Inter',style:'Bold'});

const W=1440;
const C={
  y:{r:.969,g:.820,b:.090},o:{r:.969,g:.580,b:.114},
  d:{r:.173,g:.173,b:.173},m:{r:.376,g:.376,b:.376},
  l:{r:.922,g:.922,b:.922},ph:{r:.800,g:.800,b:.800},
  w:{r:1,g:1,b:1},sub:{r:.65,g:.65,b:.65},
  hi:{r:.75,g:.75,b:.75},dk2:{r:.08,g:.08,b:.08}
};
const ADDR1='2207 Industrial Park Rd, Innisfil ON';

// ── HELPERS ──────────────────────────────────────────────
const R=(p,x,y,w,h,c,n='')=>{const r=figma.createRectangle();r.x=x;r.y=y;r.resize(w,h);r.fills=[{type:'SOLID',color:c}];if(n)r.name=n;p.appendChild(r);return r;};
const T=(p,s,x,y,sz,st,c,mw=0)=>{const t=figma.createText();t.x=x;t.y=y;t.fontName={family:'Inter',style:st};t.fontSize=sz;t.fills=[{type:'SOLID',color:c}];t.characters=String(s);if(mw>0){t.textAutoResize='HEIGHT';t.resize(mw,t.height);}p.appendChild(t);return t;};
const Fr=(p,n,x,y,w,h,c=C.w)=>{const f=figma.createFrame();f.name=n;f.x=x;f.y=y;f.resize(w,h);f.fills=[{type:'SOLID',color:c}];p.appendChild(f);return f;};
const B=(p,l,x,y,w=180,h=48,bg=C.y,tc=C.d)=>{const b=figma.createFrame();b.name=`Btn:${l}`;b.x=x;b.y=y;b.resize(w,h);b.fills=[{type:'SOLID',color:bg}];b.cornerRadius=4;const t=figma.createText();t.fontName={family:'Inter',style:'Bold'};t.fontSize=13;t.characters=l;t.fills=[{type:'SOLID',color:tc}];t.textAlignHorizontal='CENTER';t.resize(w-24,18);t.x=12;t.y=(h-18)/2;b.appendChild(t);p.appendChild(b);return b;};
const PH=(p,x,y,w,h,l='Image')=>{R(p,x,y,w,h,C.ph,l);const t=figma.createText();t.fontName={family:'Inter',style:'Regular'};t.fontSize=13;t.characters=`[ ${l} ]`;t.fills=[{type:'SOLID',color:C.m}];t.textAlignHorizontal='CENTER';const tw=Math.min(w-20,240);t.resize(tw,20);t.x=x+(w-tw)/2;t.y=y+(h-20)/2;p.appendChild(t);};
const D=(p,x,y,w)=>R(p,x,y,w,1,C.ph,'divider');
const FQ=(p,q,x,y,w=W-160)=>{R(p,x,y,w,56,C.l,q);T(p,q,x+32,y+19,14,'Regular',C.d,w-80);T(p,'+',x+w-40,y+16,22,'Bold',C.m);D(p,x,y+56,w);return 64;};

const NAV=(p)=>{
  R(p,0,0,W,80,C.d,'Nav');R(p,40,16,48,48,C.y,'Logo');
  T(p,'400 MARKET',97,26,18,'Bold',C.w);
  ['VENDORS','EVENTS','SHOP','NEWS','ABOUT','CONTACT'].forEach((l,i)=>T(p,l,380+i*120,31,12,'Semi Bold',{r:.78,g:.78,b:.78}));
  B(p,'BECOME A MERCHANT',W-230,16,190,48,C.y,C.d);
};

// Footer: NO "Become a Merchant" link. MARKET column = About Us, FAQ, Contact Us only.
const FOOTER=(p,y)=>{
  R(p,0,y,W,300,C.d,'Footer');
  T(p,'400',80,y+30,40,'Bold',C.y);T(p,'MARKET',80,y+74,22,'Bold',C.w);
  T(p,'EST. 1986',80,y+100,11,'Regular',C.o);
  T(p,'FOOD, FINDS & FUN.\nOPEN EVERY WEEK-END.',80,y+126,13,'Regular',C.sub,280);
  [['EXPLORE',['Home','Vendors','Events','Shop','News']],
   ['MARKET',['About Us','FAQ','Contact Us']],
   ['LEGAL',['Privacy Policy','Terms of Use']]
  ].forEach(([title,items],i)=>{
    const cx=440+i*220;T(p,title,cx,y+30,12,'Bold',C.y);
    items.forEach((it,j)=>T(p,it,cx,y+56+j*25,13,'Regular',C.sub));
  });
  T(p,'STAY IN THE LOOP',1100,y+30,13,'Bold',C.y);
  R(p,1100,y+58,280,44,{r:.27,g:.27,b:.27},'Email');
  T(p,'your@email.com',1116,y+72,13,'Regular',{r:.5,g:.5,b:.5});
  B(p,'SUBSCRIBE',1100,y+114,140,40,C.y,C.d);
  D(p,80,y+250,W-160);
  T(p,'© 2026 The 400 Market. All rights reserved.',80,y+264,12,'Regular',{r:.44,g:.44,b:.44});
  T(p,'Designed with love by DGTL Group',655,y+264,12,'Regular',{r:.44,g:.44,b:.44});
};

const NL=(p,y)=>{
  R(p,0,y,W,180,C.y,'Newsletter');
  T(p,'STAY IN THE LOOP',80,y+32,32,'Bold',C.d,680);
  T(p,'Market news, merchant spotlights, and event updates to your inbox.',80,y+76,15,'Regular',C.d,680);
  R(p,880,y+36,340,52,C.w,'Email input');T(p,'your@email.com',898,y+50,14,'Regular',C.m);
  B(p,'SUBSCRIBE',1236,y+36,156,52,C.d,C.w);
};

// Market map: Ultra-simple, 3 zones, no text. Interactive SVG placeholder.
const MAP=(p,y,title='EXPLORE THE MARKET')=>{
  T(p,title,80,y,28,'Bold',C.d,800);
  T(p,'Interactive floor plan — tap a section to explore.',80,y+38,15,'Regular',C.m,800);
  const mx=80,my=y+80,mw=W-160,mh=320;
  R(p,mx,my,mw,mh,C.l,'Interactive Market Map (SVG)');
  // 3 simple colored zones — no text labels (interactive SVG handles labels)
  R(p,mx+8,my+8,mw*.3-12,mh-16,C.o,'Zone: Food Court');
  R(p,mx+mw*.3+4,my+8,mw*.34-8,mh-16,{r:.75,g:.82,b:.65},'Zone: Vendor Section');
  R(p,mx+mw*.64+4,my+8,mw*.36-12,mh-16,{r:.65,g:.75,b:.85},'Zone: Vendor Section');
  T(p,'[ Interactive SVG Map — zones are clickable ]',mx+(mw-340)/2,my+mh+12,13,'Regular',C.m);
  return y+mh+120;
};

// ── CLEAR PAGES 01-05 ───────────────────────────────────
for(const pg of figma.root.children){
  if(['01','02','04','05'].some(n=>pg.name.startsWith(n))){
    while(pg.children.length>0) pg.children[0].remove();
  }
}

// ══════════════════════════════════════════════════════════
// 01 — HOMEPAGE
// ══════════════════════════════════════════════════════════
const pg1=figma.root.children.find(p=>p.name.startsWith('01'));
await figma.setCurrentPageAsync(pg1);
const hf=Fr(pg1,'Homepage — 1440px',0,0,W,3400);
NAV(hf);

// Hero
PH(hf,0,80,W,640,'Hero Background Photo');
R(hf,0,80,680,640,C.dk2,'Hero overlay');
T(hf,'FOOD, FINDS & FUN.',80,180,60,'Bold',C.y,580);
T(hf,"Innisfil's #1 Indoor Weekend Market",80,360,26,'Regular',C.w,560);
T(hf,'Sat & Sun · 9AM–5PM  ·  '+ADDR1,80,400,16,'Regular',C.hi,560);
B(hf,'PLAN YOUR VISIT',80,460,200,56,C.y,C.d);
B(hf,'BECOME A MERCHANT',296,460,220,56,C.o,C.w);

// Info strip — NO free parking. 105k sqft instead. "Hundreds of unique vendors" not 200+.
R(hf,0,720,W,72,C.y,'Info strip');
['🕐  SAT–SUN · 9AM–5PM','📍  '+ADDR1,'📐  105,000 SQ FT OF SHOPPING','🏪  HUNDREDS OF UNIQUE VENDORS'].forEach((s,i)=>
  T(hf,s,80+i*340,743,14,'Bold',C.d));

// Featured Vendors
T(hf,'FEATURED VENDORS',80,844,30,'Bold',C.d,640);
T(hf,'Discover the makers, growers, and artisans of 400 Market.',80,882,15,'Regular',C.m,640);
for(let i=0;i<3;i++){
  const vx=80+i*440,vy=928;
  R(hf,vx,vy,400,320,C.l,`Vendor card ${i+1}`);
  PH(hf,vx,vy,400,200,'Vendor Photo');
  R(hf,vx+16,vy+212,80,22,C.y,'Badge');T(hf,'ANTIQUES',vx+22,vy+214,11,'Bold',C.d);
  T(hf,`Vendor Name ${i+1}`,vx+16,vy+246,16,'Bold',C.d,368);
  T(hf,'Booth collectibles & curios',vx+16,vy+268,13,'Regular',C.m,368);
  T(hf,'View profile →',vx+16,vy+292,13,'Semi Bold',C.o);
}
B(hf,'VIEW ALL VENDORS',620,1284,200,48,C.d,C.w);

// Market Map (simple, 3 zones, interactive SVG)
const me1=MAP(hf,1380);

// Events Section
R(hf,0,me1+20,W,460,C.l,'Events bg');
T(hf,'UPCOMING EVENTS',80,me1+60,30,'Bold',C.d,640);
T(hf,'Special weekends, seasonal markets, and community days.',80,me1+98,15,'Regular',C.m,640);
for(let i=0;i<3;i++){
  const ex=80+i*440,ey=me1+148;
  R(hf,ex,ey,400,220,C.w,`Event card ${i+1}`);
  R(hf,ex,ey,72,72,C.y,'Date');T(hf,'APR',ex+16,ey+12,11,'Bold',C.d);
  T(hf,`${12+i*7}`,ex+10,ey+26,28,'Bold',C.d);
  T(hf,`Market Event ${i+1}`,ex+88,ey+16,16,'Bold',C.d,292);
  T(hf,'Sat & Sun · 9AM–5PM',ex+88,ey+42,12,'Regular',C.m,292);
  T(hf,'A brief event description goes here telling visitors what to expect.',ex+88,ey+62,13,'Regular',C.m,292);
  T(hf,'Details & add to calendar →',ex+88,ey+148,13,'Semi Bold',C.o);
}
B(hf,'VIEW ALL EVENTS',620,me1+396,200,48,C.d,C.w);

// ── GOOGLE REVIEWS section (replaces Shop section on homepage) ──
let revY=me1+500;
T(hf,'WHAT PEOPLE ARE SAYING',80,revY,30,'Bold',C.d,640);
T(hf,'Real reviews from real visitors — straight from Google.',80,revY+38,15,'Regular',C.m,640);
// 3 review cards (animated carousel in production)
for(let i=0;i<3;i++){
  const rx=80+i*440,ry=revY+88;
  R(hf,rx,ry,400,220,C.w,`Review card ${i+1}`);
  R(hf,rx,ry,400,4,C.y,'Accent');
  // Stars
  T(hf,'★★★★★',rx+24,ry+24,18,'Bold',C.y);
  // Review text
  T(hf,[
    '"Amazing market! So many unique vendors and great food. We come every weekend with the family."',
    '"Love the variety here. Found incredible antiques and handmade crafts. The atmosphere is fantastic."',
    '"Best flea market in Ontario. Huge space, friendly vendors, and always something new to discover."'
  ][i],rx+24,ry+60,14,'Regular',C.d,352);
  // Reviewer
  T(hf,['— Sarah M.','— James T.','— Lisa K.'][i],rx+24,ry+160,13,'Semi Bold',C.m);
  T(hf,'Google Review',rx+24,ry+180,11,'Regular',C.m);
}
T(hf,'[ Animated carousel — auto-scrolling reviews pulled from Google ]',400,revY+328,13,'Regular',C.m,640);

// Newsletter
NL(hf,revY+380);
FOOTER(hf,revY+580);
hf.resize(W,revY+880);

// ══════════════════════════════════════════════════════════
// 02 — VENDORS DIRECTORY
// ══════════════════════════════════════════════════════════
const pg2=figma.root.children.find(p=>p.name.startsWith('02'));
await figma.setCurrentPageAsync(pg2);
const vf=Fr(pg2,'Vendors Directory — 1440px',0,0,W,3200);
NAV(vf);

R(vf,0,80,W,200,C.d,'Header');T(vf,'OUR VENDORS',80,124,48,'Bold',C.y,900);
T(vf,'Hundreds of unique makers, growers, and artisans under one roof.',80,186,17,'Regular',C.hi,900);

R(vf,0,280,W,72,C.l,'Filter bar');T(vf,'Filter:',80,300,13,'Semi Bold',C.d);
['ALL','ANTIQUES','CLOTHING','FOOD','COLLECTIBLES','JEWELRY','HOME GOODS','CRAFTS'].forEach((cat,i)=>{
  const ox=140+i*148;R(vf,ox,290,cat.length*8+20,36,i===0?C.y:C.w,`Cat:${cat}`);
  T(vf,cat,ox+10,299,11,'Bold',i===0?C.d:C.m);
});
R(vf,W-360,290,280,40,C.w,'Search');T(vf,'🔍  Search vendors...',W-344,302,13,'Regular',C.m);

for(let row=0;row<4;row++) for(let col=0;col<3;col++){
  const vx=80+col*440,vy=392+row*380;
  R(vf,vx,vy,400,340,C.w,`Vendor ${row*3+col+1}`);PH(vf,vx,vy,400,220,'Vendor Photo');
  R(vf,vx+16,vy+228,82,22,C.y,'Badge');T(vf,'ANTIQUES',vx+22,vy+230,11,'Bold',C.d);
  T(vf,`Vendor Business ${row*3+col+1}`,vx+16,vy+262,16,'Bold',C.d,368);
  T(vf,'Antiques, curios & vintage finds',vx+16,vy+285,13,'Regular',C.m,368);
  T(vf,'View profile →',vx+16,vy+315,13,'Semi Bold',C.o);
}

// Market Map
const ve=MAP(vf,1932);

// Become a Merchant CTA
R(vf,0,ve+20,W,200,C.y,'BaM CTA');T(vf,'WANT A BOOTH?',80,ve+56,36,'Bold',C.d,700);
T(vf,'Join hundreds of merchants. Affordable rates, thousands of weekend shoppers.',80,ve+102,16,'Regular',C.d,700);
B(vf,'APPLY NOW',W-260,ve+72,180,52,C.d,C.w);

FOOTER(vf,ve+250);vf.resize(W,ve+550);

// ══════════════════════════════════════════════════════════
// 04 — EVENTS (with newsletter before footer)
// ══════════════════════════════════════════════════════════
const pg4=figma.root.children.find(p=>p.name.startsWith('04'));
while(pg4.children.length>0) pg4.children[0].remove();
await figma.setCurrentPageAsync(pg4);
const ef=Fr(pg4,'Events — 1440px',0,0,W,2400);
NAV(ef);

R(ef,0,80,W,200,C.y,'Events header');T(ef,'EVENTS',80,118,56,'Bold',C.d,800);
T(ef,'Special market days, themed weekends & seasonal events.',80,188,17,'Regular',C.d,800);

R(ef,0,280,W,64,C.l,'Tab bar');
['ALL EVENTS','UPCOMING','THIS MONTH','PAST'].forEach((tab,i)=>{
  R(ef,80+i*188,288,172,46,i===1?C.y:C.w,`Tab:${tab}`);
  T(ef,tab,96+i*188,302,13,'Bold',i===1?C.d:C.m);
});
B(ef,'+ ADD ALL TO CALENDAR',W-280,294,240,44,C.d,C.w);

const en=['Spring Flea','Mother\'s Day Market','Vintage Weekend','Holiday Preview','Summer Kickoff'];
for(let i=0;i<5;i++){
  const ey=370+i*220;R(ef,80,ey,W-160,200,i===0?C.l:C.w,`Event ${i+1}`);D(ef,80,ey+200,W-160);
  R(ef,96,ey+24,72,72,C.y,'Date');T(ef,'APR',107,ey+32,11,'Bold',C.d);T(ef,`${12+i*7}`,101,ey+46,28,'Bold',C.d);
  if(i===0){R(ef,192,ey+24,88,24,C.o,'Featured');T(ef,'FEATURED',200,ey+27,11,'Bold',C.w);}
  const ity=i===0?ey+58:ey+28;
  T(ef,`Market Event: ${en[i]}`,192,ity,20,'Bold',C.d,860);
  T(ef,'Saturday & Sunday  ·  9AM–5PM  ·  '+ADDR1,192,ity+32,13,'Regular',C.m,860);
  T(ef,'What makes this market day special, featured merchants, activities, and what visitors can expect.',192,ity+54,13,'Regular',C.m,860);
  B(ef,'EVENT DETAILS',192,ey+150,160,40,C.y,C.d);T(ef,'+ Add to Calendar',370,ey+159,13,'Regular',C.o);
  PH(ef,W-380,ey+24,280,160,`Event Photo ${i+1}`);
}

NL(ef,1500);FOOTER(ef,1700);ef.resize(W,2000);

// ══════════════════════════════════════════════════════════
// 05 — SHOP (no trust strip, no Stripe, more FAQs)
// ══════════════════════════════════════════════════════════
const pg5=figma.root.children.find(p=>p.name.startsWith('05'));
while(pg5.children.length>0) pg5.children[0].remove();
await figma.setCurrentPageAsync(pg5);
const sf=Fr(pg5,'Shop — 1440px',0,0,W,2000);
NAV(sf);

R(sf,0,80,W,200,C.d,'Shop header');T(sf,'SHOP THE MARKET',80,130,48,'Bold',C.y,900);
T(sf,"Parking passes and gift certificates — pick up before your next visit.",80,193,17,'Regular',C.hi,900);

[['Parking Pass','$5.00','Pre-paid parking for one vehicle, one visit to 400 Market.'],
 ['$5 Gift Certificate','$5.00','Redeemable with any merchant at 400 Market. Perfect for first-timers.'],
 ['$10 Gift Certificate','$10.00','Redeemable with any merchant. The ultimate market gift.']
].forEach(([n,pr,desc],i)=>{
  const px=80+i*440,py=336;
  R(sf,px,py,400,520,C.w,`Product: ${n}`);PH(sf,px,py,400,280,n);
  T(sf,n,px+20,py+296,20,'Bold',C.d,360);T(sf,pr,px+20,py+330,28,'Bold',C.o);
  T(sf,desc,px+20,py+370,13,'Regular',C.m,360);
  B(sf,'BUY NOW',px+20,py+438,360,48,C.y,C.d);
});

T(sf,'COMMON QUESTIONS',80,916,24,'Bold',C.d);
let fy=956;
['How do I redeem a gift certificate at the market?','Does a parking pass expire?',
 'Can I purchase for someone else as a gift?','Do all merchants accept gift certificates?',
 'Can I use multiple gift certificates in one visit?','What happens if I lose my certificate?',
 'Is there a limit on how many I can buy?','Can I get a refund on a gift certificate or parking pass?'
].forEach(q=>{fy+=FQ(sf,q,80,fy);});
FOOTER(sf,fy+40);sf.resize(W,fy+340);

return 'Script 1 complete: Homepage, Vendors, Events, Shop rebuilt.';
