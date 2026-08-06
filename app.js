/* ==========================================================================
   Threads — concept build
   Phase 1: like-for-like recreation (layout, colour, interaction model).
   Phase 2: monetization layer (sponsored posts, Pro subscriptions, tipping,
            Creator Studio earnings).
   Phase 3: the differentiators that make this a standalone product instead
            of an Instagram appendage (Pulse real-time ranking, Communities,
            Lists, portable identity, open API, keyboard-driven power use).
   No backend: everything lives in localStorage. See threads/README.md.
   ========================================================================== */

const STORE_KEY = 'threads_proto_v1';
const NOW = Date.now();
const MIN = 60000, HOUR = 3600000, DAY = 86400000;

const ICONS = {
  heart:'<path d="M20.8 6.6c0 6-8.8 11.4-8.8 11.4S3.2 12.6 3.2 6.6a4.6 4.6 0 0 1 8.8-2 4.6 4.6 0 0 1 8.8 2z"/>',
  comment:'<path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 9 9 0 0 1-3.6-.7L3 21l1.8-5.4A8.4 8.4 0 1 1 21 11.5z"/>',
  repost:'<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  share:'<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>',
  verified:'<path d="M12 2l2.6 1.3 2.9-.4 1.4 2.6 2.6 1.4-.4 2.9L22 12l-1.3 2.6.4 2.9-2.6 1.4-1.4 2.6-2.9-.4L12 22l-2.6-1.3-2.9.4-1.4-2.6-2.6-1.4.4-2.9L2 12l1.3-2.6-.4-2.9 2.6-1.4L6.9 2.9l2.9.4L12 2z"/><path d="M9 12l2 2 4-4" stroke="#fff" fill="none"/>'
};
function icon(name, extraClass){ return `<svg class="${extraClass||''}" viewBox="0 0 24 24">${ICONS[name]}</svg>`; }

/* ---------------------------------------------------------------------- */
/* Seed data                                                               */
/* ---------------------------------------------------------------------- */
const NAMES = [
  ['you','You','You'],
  ['maya.codes','Maya Govender','Product designer. Building in public.'],
  ['thab0','Thabo N.','Sports, tech, occasional hot takes.'],
  ['lerato_writes','Lerato M.','Journalist. DMs open for tips.'],
  ['kgosi.dev','Kgosi','Backend engineer. Rust and coffee.'],
  ['ayesha.b','Ayesha B.','Photography, film, city walks.'],
  ['sipho_runs','Sipho K.','Marathon #7 done. #6 to go.'],
  ['nomvula.art','Nomvula','Illustrator — commissions open.'],
  ['david_reads','David P.','Books, longform, slow mornings.'],
  ['zara.fm','Zara','Music curator. New playlist every Friday.'],
  ['themba_tech','Themba S.','AI, startups, unsolicited opinions.'],
  ['priya.k','Priya K.','Climate researcher.'],
  ['news_wire','Wire News','Breaking news, verified sources only.'],
  ['founders_co','Founders Co.','A community for early-stage builders.'],
];
const COLORS = ['#7c3aed','#0ea5e9','#f97316','#16a34a','#e11d48','#0891b2','#a16207','#4f46e5','#db2777','#059669','#ca8a04','#2563eb','#c026d3','#65a30d'];

function seed(){
  const users = NAMES.map((n,i)=>({
    id:'u'+i, handle:n[0], name:n[1], bio:n[2],
    color:COLORS[i%COLORS.length],
    followers: i===0?128: Math.floor(Math.random()*40000)+300,
    following: i===0?54: Math.floor(Math.random()*900)+20,
    verified: i===12 || i===0? false : [1,3,10,12,13].includes(i),
    pro: i===1||i===10,
    joined: NOW - (400+i*13)*DAY,
  }));

  const draftTexts = [
    "First thread. Be nice.",
    "Hot take: the best product decisions are the ones you can reverse in five minutes.",
    "Load-shedding again tonight. Battery at 40%. Send thoughts and inverters.",
    "Nobody talks about how much of \"shipping fast\" is just deleting scope.",
    "New illustration up — a rainy Joburg street at 6am. Commissions open this week.",
    "Marathon #7 in the books. Legs are done, spirit is not.",
    "Reading: a 40-year-old paper on distributed consensus that explains half of today's outages.",
    "Friday playlist is live. Slow build, no skips.",
    "If your onboarding needs a tutorial, your onboarding is the bug.",
    "Unpopular opinion: most apps would be better with fewer notifications, not smarter ones.",
    "Rewatching old conference talks instead of doom-scrolling. Feels illegal.",
    "The best backend engineers I know are obsessed with deleting code, not writing it.",
    "BREAKING: central bank holds rates steady, cites easing inflation.",
    "We're opening 20 spots in the founders cohort this month. Reply if building something.",
    "Coffee number three. The deploy can wait.",
    "Design tip nobody asked for: if you can't explain the empty state, you don't understand the feature.",
    "Six years in tech and the best career advice I ever got was \"finish things.\"",
    "Photo dump from the coastal trip. No filter, just good light.",
    "Every roadmap is a hypothesis. Ship it like one.",
    "The gap between a good app and a great one is entirely in what it leaves out.",
  ];

  const posts = [];
  let pid = 0;
  draftTexts.forEach((text,i)=>{
    const author = users[(i*3+1)%users.length];
    posts.push({
      id:'p'+(pid++), authorId: author.id, text,
      createdAt: NOW - Math.floor(Math.random()*60)*MIN - i*7*MIN,
      likes:[], reposts:[], replyTo:null, image: i===4 || i===17,
      tag: i===12?'news': i===13?'founders': i===5?'running': null,
    });
  });
  // a handful of replies, so thread view has content
  [0,1,3,6,9].forEach((rootIdx,i)=>{
    const root = posts[rootIdx];
    const author = users[(i*5+2)%users.length];
    posts.push({
      id:'p'+(pid++), authorId: author.id,
      text: ["Strong agree.", "Wait, say more?", "This aged well.", "Following for updates.", "Same energy as last week's thread."][i],
      createdAt: root.createdAt + (i+1)*4*MIN,
      likes:[], reposts:[], replyTo: root.id, image:false, tag:null,
    });
  });
  // seed some likes/reposts randomly, deterministic-ish
  posts.forEach((p,i)=>{
    const likeCount = (i*37)%40;
    for(let k=0;k<Math.min(likeCount, users.length-1);k++) p.likes.push(users[(i+k+1)%users.length].id);
    if(i%6===0) p.reposts.push(users[(i+2)%users.length].id);
  });

  const sponsored = [
    {id:'s0', brand:'Aria Running Co.', handle:'ariarunning', color:'#0891b2', text:'Race day is closer than you think. New carbon-plate trainers, 20% off for Threads.', cta:'Shop now'},
    {id:'s1', brand:'FocusMail', handle:'focusmail', color:'#4f46e5', text:'The inbox that unsubscribes itself. Try it free for 30 days.', cta:'Learn more'},
  ];

  const communities = [
    {id:'c0', name:'Founders', icon:'🚀', desc:'Early-stage builders trading notes, not pitches.', members:8420, tag:'founders', joined:true},
    {id:'c1', name:'Running Club', icon:'🏃', desc:'PBs, injuries, and unsolicited shoe advice.', members:5310, tag:'running', joined:false},
    {id:'c2', name:'News & Current Events', icon:'📰', desc:'Verified-source discussion, moderated for civility.', members:41200, tag:'news', joined:false},
    {id:'c3', name:'Design Crit', icon:'🎨', desc:'Post work, get real feedback, no vague praise.', members:3980, tag:null, joined:false},
  ];

  return {
    users, posts, sponsored, communities,
    lists:[], notifications: buildNotifications(users, posts),
    currentUserId:'u0',
    theme:'light',
    settings:{ portableIdentity:false, adFree:false, proSub:false, proPrice:6.99, subscriptionsEnabled:false, apiKey:null },
    studio:{ subscribers:0, tipsTotal:0, adShare:0, boostCredits:2 },
  };
}

function buildNotifications(users, posts){
  const items = [];
  posts.slice(0,8).forEach((p,i)=>{
    const from = users[(i*2+3)%users.length];
    items.push({id:'n'+i, type: i%3===0?'reply':(i%3===1?'like':'follow'), fromUserId: from.id, postId: p.id, createdAt: NOW - i*40*MIN, read: i>2});
  });
  return items;
}

let state = load();
function load(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return seed();
}
function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function resetProto(){ localStorage.removeItem(STORE_KEY); state = seed(); save(); route('home'); toast('Prototype data reset'); }

function meId(){ return state.currentUserId; }
function userOf(id){ return state.users.find(u=>u.id===id); }
function postOf(id){ return state.posts.find(p=>p.id===id); }
function isMe(id){ return id === meId(); }

/* ---------------------------------------------------------------------- */
/* Time / text helpers                                                     */
/* ---------------------------------------------------------------------- */
function timeAgo(ts){
  const d = Date.now() - ts;
  if(d < MIN) return 'now';
  if(d < HOUR) return Math.floor(d/MIN)+'m';
  if(d < DAY) return Math.floor(d/HOUR)+'h';
  if(d < 7*DAY) return Math.floor(d/DAY)+'d';
  return new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric'});
}
function initials(name){ return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
function fmtNum(n){
  if(n>=1000000) return (n/1000000).toFixed(1).replace(/\.0$/,'')+'M';
  if(n>=1000) return (n/1000).toFixed(1).replace(/\.0$/,'')+'K';
  return ''+n;
}
function esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

/* ---------------------------------------------------------------------- */
/* Router                                                                   */
/* ---------------------------------------------------------------------- */
const TITLES = {home:'Threads', search:'Search', activity:'Activity', profile:'Profile', pulse:'Pulse', communities:'Communities', lists:'Lists', studio:'Creator Studio', settings:'Settings'};
let currentTab = 'home';
let currentSub = {}; // e.g. {profileTab:'threads', profileUserId, communityId, listId}

function route(tab, extra){
  currentTab = tab;
  currentSub = extra||{};
  document.getElementById('tbTitle').textContent = TITLES[tab]||'Threads';
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  const main = document.getElementById('main');
  main.scrollTop = 0;
  window.scrollTo(0,0);
  const renderers = {
    home: renderHome, search: renderSearch, activity: renderActivity,
    profile: ()=>renderProfile(extra&&extra.profileUserId || meId()),
    pulse: renderPulse, communities: renderCommunities, lists: renderLists,
    studio: renderStudio, settings: renderSettings,
  };
  main.innerHTML = (renderers[tab]||renderHome)();
  closeMore();
  refreshRailDot();
}
function refreshRailDot(){
  const unread = state.notifications.filter(n=>!n.read).length;
  document.getElementById('railDot').style.display = unread? 'block':'none';
}

/* ---------------------------------------------------------------------- */
/* Post card + feed                                                        */
/* ---------------------------------------------------------------------- */
function avatarHTML(user, size){
  const cls = size==='lg'?'avatar lg':size==='xl'?'avatar xl':'avatar';
  return `<div class="${cls}" style="background:${user.color}" data-action="open-profile" data-user="${user.id}">${esc(initials(user.name))}</div>`;
}
function postCardHTML(p, opts){
  opts = opts||{};
  const author = userOf(p.authorId);
  if(!author) return '';
  const liked = p.likes.includes(meId());
  const reposted = p.reposts.includes(meId());
  const replyCount = state.posts.filter(x=>x.replyTo===p.id).length;
  return `
  <article class="post" data-post="${p.id}" data-action="open-post">
    ${avatarHTML(author)}
    <div class="post-body">
      <div class="post-head">
        <span class="post-name" data-action="open-profile" data-user="${author.id}">${esc(author.name)}</span>
        ${author.verified?icon('verified','verified'):''}
        ${author.pro?'<span class="badge-pro">PRO</span>':''}
        <span class="post-time">${timeAgo(p.createdAt)}</span>
        <span class="spacer"></span>
        <button class="more-dots" data-action="post-menu" data-post="${p.id}">&#8942;</button>
      </div>
      <div class="post-text">${esc(p.text)}</div>
      ${p.image?`<div class="post-image">image</div>`:''}
      <div class="post-actions">
        <button class="pa-btn ${liked?'liked':''}" data-action="like" data-post="${p.id}">${icon('heart')}<span class="pa-count">${p.likes.length||''}</span></button>
        <button class="pa-btn" data-action="open-post" data-post="${p.id}">${icon('comment')}<span class="pa-count">${replyCount||''}</span></button>
        <button class="pa-btn ${reposted?'reposted':''}" data-action="repost" data-post="${p.id}">${icon('repost')}<span class="pa-count">${p.reposts.length||''}</span></button>
        <button class="pa-btn" data-action="share" data-post="${p.id}">${icon('share')}</button>
        ${!isMe(author.id)?`<button class="pa-btn" data-action="tip" data-post="${p.id}" title="Send a tip">💸</button>`:''}
      </div>
    </div>
  </article>`;
}
function sponsoredHTML(s){
  return `
  <article class="post sponsored">
    <div class="avatar" style="background:${s.color}">${esc(initials(s.brand))}</div>
    <div class="post-body">
      <div class="post-head">
        <span class="post-name">${esc(s.brand)}</span>
        <span class="post-time"></span>
      </div>
      <div class="post-text">${esc(s.text)}</div>
      <button class="pill small spon-cta" data-action="sponsored-cta">${esc(s.cta)}</button>
    </div>
  </article>`;
}

function renderHome(){
  const roots = state.posts.filter(p=>!p.replyTo).sort((a,b)=>b.createdAt-a.createdAt);
  const showAds = !state.settings.adFree && !state.settings.proSub;
  let html = '';
  roots.forEach((p,i)=>{
    html += postCardHTML(p);
    if(showAds && (i+1)%5===0){
      const s = state.sponsored[Math.floor(i/5)%state.sponsored.length];
      html += sponsoredHTML(s);
    }
  });
  if(!roots.length) html = `<div class="empty">Nothing here yet. Start a thread.</div>`;
  return html;
}

function renderSearch(){
  return `
  <div style="padding:10px 16px;">
    <input class="field" id="searchInput" placeholder="Search" oninput="doSearch(this.value)">
  </div>
  <div class="section-title" style="padding-top:0">Trending</div>
  <div id="searchResults">${trendingListHTML(6)}</div>`;
}
function doSearch(q){
  q = q.trim().toLowerCase();
  const el = document.getElementById('searchResults');
  if(!q){ el.innerHTML = trendingListHTML(6); return; }
  const users = state.users.filter(u=>u.handle.includes(q)||u.name.toLowerCase().includes(q));
  const posts = state.posts.filter(p=>p.text.toLowerCase().includes(q));
  let html = '';
  if(users.length){
    html += `<div class="label-sm" style="padding:0 16px">People</div>`;
    users.slice(0,5).forEach(u=> html += profileRowHTML(u));
  }
  if(posts.length){
    html += `<div class="label-sm" style="padding:0 16px">Threads</div>`;
    posts.slice(0,10).forEach(p=> html += postCardHTML(p));
  }
  el.innerHTML = html || `<div class="empty">No results for "${esc(q)}"</div>`;
}
function profileRowHTML(u){
  return `<div class="post" data-action="open-profile" data-user="${u.id}">
    ${avatarHTML(u)}
    <div class="post-body">
      <div class="post-head"><span class="post-name">${esc(u.name)}</span>${u.verified?icon('verified','verified'):''}</div>
      <div class="post-time">@${esc(u.handle)}</div>
    </div>
  </div>`;
}

function renderActivity(){
  state.notifications.forEach(n=>n.read=true);
  save(); refreshRailDot();
  const rows = state.notifications.slice().sort((a,b)=>b.createdAt-a.createdAt).map(n=>{
    const from = userOf(n.fromUserId);
    const verb = n.type==='reply'?'replied to your thread':n.type==='like'?'liked your thread':'followed you';
    return `<div class="post" data-action="${n.postId?'open-post':'open-profile'}" data-post="${n.postId||''}" data-user="${from.id}">
      ${avatarHTML(from)}
      <div class="post-body">
        <div class="post-text"><b>${esc(from.name)}</b> ${verb}</div>
        <div class="post-time">${timeAgo(n.createdAt)}</div>
      </div>
    </div>`;
  }).join('');
  return rows || `<div class="empty">No activity yet.</div>`;
}

function renderProfile(userId){
  const u = userOf(userId);
  const tab = (currentSub.profileTab)||'threads';
  const mine = isMe(userId);
  let posts;
  if(tab==='threads') posts = state.posts.filter(p=>p.authorId===userId && !p.replyTo);
  else if(tab==='replies') posts = state.posts.filter(p=>p.authorId===userId && p.replyTo);
  else posts = state.posts.filter(p=>p.reposts.includes(userId));
  posts = posts.slice().sort((a,b)=>b.createdAt-a.createdAt);

  return `
  <div class="profile-head">
    <div class="profile-top">
      <div>
        <div class="profile-name">${esc(u.name)} ${u.verified?icon('verified','verified'):''} ${u.pro?'<span class="badge-pro">PRO</span>':''}</div>
        <div class="profile-handle">@${esc(u.handle)}</div>
      </div>
      ${avatarHTML(u,'lg')}
    </div>
    <div class="profile-bio">${esc(u.bio)}</div>
    <div class="profile-stats">${fmtNum(u.followers)} followers · ${fmtNum(u.following)} following</div>
    <div class="profile-actions">
      ${mine? `<button class="pill" data-action="edit-profile">Edit profile</button>`
            : `<button class="pill ${state.follows&&state.follows[u.id]?'':'solid'}" data-action="follow" data-user="${u.id}">${followed(u.id)?'Following':'Follow'}</button>
               <button class="pill" data-action="dm" data-user="${u.id}">Message</button>`}
    </div>
  </div>
  <div class="subtabs">
    <div class="subtab ${tab==='threads'?'active':''}" data-action="profile-tab" data-t="threads">Threads</div>
    <div class="subtab ${tab==='replies'?'active':''}" data-action="profile-tab" data-t="replies">Replies</div>
    <div class="subtab ${tab==='reposts'?'active':''}" data-action="profile-tab" data-t="reposts">Reposts</div>
  </div>
  ${posts.map(p=>postCardHTML(p)).join('') || `<div class="empty">Nothing here yet.</div>`}
  `;
}
state.follows = state.follows || {};
function followed(uid){ return !!state.follows[uid]; }

/* ---------------- Phase 3: Pulse (real-time trending) ------------------ */
function trendingTopics(limit){
  // velocity score: engagement in the last 60 min, decayed — not raw
  // all-time engagement. This is the "recency over popularity" bet
  // described in docs/THREADS_PROJECT_CONCEPT.md.
  const tags = {};
  state.posts.forEach(p=>{
    const ageMin = (NOW-p.createdAt)/MIN;
    const decay = Math.max(0, 1 - ageMin/180);
    const engagement = (p.likes.length + p.reposts.length*2 + 1) * decay;
    const words = p.text.split(/\s+/).filter(w=>w.length>5).slice(0,1);
    const key = p.tag ? '#'+p.tag : (words[0]? words[0].replace(/[^a-zA-Z0-9]/g,'') : null);
    if(!key) return;
    tags[key] = (tags[key]||0) + engagement;
  });
  return Object.entries(tags).sort((a,b)=>b[1]-a[1]).slice(0,limit||8);
}
function trendingListHTML(limit){
  const t = trendingTopics(limit);
  if(!t.length) return `<div class="empty">Nothing trending yet.</div>`;
  return t.map(([topic,score],i)=>`
    <div class="pulse-item">
      <div class="pulse-rank">${i+1}</div>
      <div class="pulse-live"></div>
      <div style="flex:1">
        <div class="pulse-topic">${esc(topic)}</div>
        <div class="pulse-meta">live · velocity ${score.toFixed(1)}</div>
      </div>
    </div>`).join('');
}
function renderPulse(){
  return `
  <div class="section-title">Pulse</div>
  <div class="phase-note">Ranked by how fast a topic is moving in the last 60–180 minutes, not lifetime like count — the "what's happening right now" surface the concept doc flags as missing from the real app.</div>
  ${trendingListHTML(15)}`;
}

/* ---------------- Phase 3: Communities ---------------------------------- */
function renderCommunities(){
  return `
  <div class="section-title">Communities</div>
  <div class="phase-note">Durable, moderated topic spaces — the Reddit/Discord-shaped gap between a flat algorithmic feed and a closed server.</div>
  ${state.communities.map(c=>`
    <div class="community-card">
      <div class="community-icon">${c.icon}</div>
      <div class="community-info">
        <div class="community-name">${esc(c.name)}</div>
        <div class="community-desc">${esc(c.desc)}</div>
        <div class="community-meta">${fmtNum(c.members)} members</div>
      </div>
      <button class="pill ${c.joined?'':'solid'} small" data-action="join-community" data-c="${c.id}">${c.joined?'Joined':'Join'}</button>
    </div>`).join('')}
  `;
}
function communityFeedHTML(cid){
  const c = state.communities.find(x=>x.id===cid);
  const posts = state.posts.filter(p=>p.tag===c.tag && !p.replyTo).sort((a,b)=>b.createdAt-a.createdAt);
  return `<div class="section-title">${c.icon} ${esc(c.name)}</div>
  <div class="phase-note">${esc(c.desc)} · ${fmtNum(c.members)} members</div>
  ${posts.map(p=>postCardHTML(p)).join('') || `<div class="empty">No posts tagged to this community yet.</div>`}`;
}

/* ---------------- Phase 3: Lists ----------------------------------------- */
function renderLists(){
  return `
  <div class="section-title">Lists</div>
  <div class="phase-note">Curated feeds of specific accounts — the power-user primitive (Twitter Lists / TweetDeck columns) the real app has never shipped.</div>
  <div style="padding:0 16px 12px"><button class="pill solid" data-action="create-list">+ New list</button></div>
  ${state.lists.length? state.lists.map(l=>`
    <div class="list-row" data-action="open-list" data-l="${l.id}">
      <div><div style="font-weight:700">${esc(l.name)}</div><div class="post-time">${l.memberIds.length} accounts</div></div>
      <span>&rsaquo;</span>
    </div>`).join('') : `<div class="empty">No lists yet. Create one to follow a slice of people without it drowning your main feed.</div>`}
  `;
}
function listFeedHTML(lid){
  const l = state.lists.find(x=>x.id===lid);
  const posts = state.posts.filter(p=>l.memberIds.includes(p.authorId) && !p.replyTo).sort((a,b)=>b.createdAt-a.createdAt);
  return `<div class="section-title">${esc(l.name)}</div>
  ${posts.map(p=>postCardHTML(p)).join('') || `<div class="empty">Nobody on this list has posted yet.</div>`}`;
}

/* ---------------- Phase 2: Creator Studio / monetization ---------------- */
function renderStudio(){
  const s = state.settings, st = state.studio;
  return `
  <div class="section-title">Creator Studio</div>
  <div class="studio-grid">
    <div class="stat-card"><div class="stat-label">Subscribers</div><div class="stat-value">${st.subscribers}</div><div class="stat-sub">$${(st.subscribers*s.proPrice).toFixed(2)}/mo</div></div>
    <div class="stat-card"><div class="stat-label">Tips received</div><div class="stat-value">$${st.tipsTotal.toFixed(2)}</div><div class="stat-sub">all-time</div></div>
    <div class="stat-card"><div class="stat-label">Ad revenue share</div><div class="stat-value">$${st.adShare.toFixed(2)}</div><div class="stat-sub">this month</div></div>
    <div class="stat-card"><div class="stat-label">Boost credits</div><div class="stat-value">${st.boostCredits}</div><div class="stat-sub">1 free boost / month</div></div>
  </div>

  <div class="studio-block">
    <h3>Subscriptions</h3>
    <p>Paid follows that unlock subscriber-only threads. This is the direct-monetization layer the real app has always underbuilt relative to YouTube/TikTok/X — the thing that gives a creator a reason to post here first.</p>
    <div class="row-flex">
      <div><div class="row-label">Enable subscriptions</div><div class="row-desc">Let people pay to follow you and see subscriber-only threads.</div></div>
      <label class="switch"><input type="checkbox" ${s.subscriptionsEnabled?'checked':''} data-action="toggle-subs"><span class="track"></span></label>
    </div>
    <div class="row-flex">
      <div><div class="row-label">Monthly price</div><div class="row-desc">Shown to people considering a subscription.</div></div>
      <input class="field" style="width:90px" type="number" min="1.99" step="0.5" value="${s.proPrice}" data-action="set-price">
    </div>
  </div>

  <div class="studio-block">
    <h3>Ad revenue share</h3>
    <p>A cut of the native "Sponsored" post revenue generated against your audience, split automatically — no separate ad-sales relationship required.</p>
    <div class="row-flex">
      <div><div class="row-label">Simulate a payout</div><div class="row-desc">Demo only — credits a mock month of ad share.</div></div>
      <button class="pill small" data-action="simulate-ad-share">Simulate</button>
    </div>
  </div>

  <div class="studio-block">
    <h3>Boosts</h3>
    <p>Spend a boost credit to push a thread higher in followers' feeds for a few hours — self-serve promotion without buying a traditional ad.</p>
    <div class="row-flex">
      <div><div class="row-label">Boost credits available</div><div class="row-desc">Refill monthly, or buy more.</div></div>
      <span style="font-weight:700">${st.boostCredits}</span>
    </div>
  </div>
  `;
}

/* ---------------- Phase 3: Settings / portable identity / API ----------- */
function renderSettings(){
  const s = state.settings;
  return `
  <div class="section-title">Settings</div>

  <div class="studio-block" style="border-top:none">
    <h3>Appearance</h3>
    <div class="row-flex">
      <div class="row-label">Dark mode</div>
      <label class="switch"><input type="checkbox" ${state.theme==='dark'?'checked':''} data-action="toggle-theme-switch"><span class="track"></span></label>
    </div>
  </div>

  <div class="studio-block">
    <h3>Threads Pro</h3>
    <p>Ad-free browsing, a subscriber badge, and priority in replies.</p>
    <div class="row-flex">
      <div><div class="row-label">Subscribe — $${s.proPrice}/mo</div><div class="row-desc">Removes sponsored posts from your Home feed.</div></div>
      <label class="switch"><input type="checkbox" ${s.proSub?'checked':''} data-action="toggle-pro"><span class="track"></span></label>
    </div>
  </div>

  <div class="studio-block">
    <h3>Portable identity <span class="badge-pro">NEW</span></h3>
    <p>Federate this account over ActivityPub / AT Protocol so followers on Mastodon or Bluesky see your threads without an account here — identity you own, not identity borrowed from another app's graph.</p>
    <div class="row-flex">
      <div><div class="row-label">Enable federation</div><div class="row-desc">Publish threads to the fediverse alongside this app.</div></div>
      <label class="switch"><input type="checkbox" ${s.portableIdentity?'checked':''} data-action="toggle-federation"><span class="track"></span></label>
    </div>
  </div>

  <div class="studio-block">
    <h3>Developer platform <span class="badge-pro">NEW</span></h3>
    <p>A real, stable public API — the ecosystem layer (bots, alt clients, integrations) the real app went years without.</p>
    <div class="row-flex">
      <div><div class="row-label">API key</div><div class="row-desc">${s.apiKey? esc(s.apiKey) : 'No key generated yet.'}</div></div>
      <button class="pill small" data-action="gen-key">${s.apiKey?'Regenerate':'Generate'}</button>
    </div>
  </div>

  <div class="studio-block">
    <h3>Keyboard shortcuts</h3>
    <div class="shortcut-row"><span>Next / previous post</span><span><span class="kbd">j</span> <span class="kbd">k</span></span></div>
    <div class="shortcut-row"><span>Like focused post</span><span class="kbd">l</span></div>
    <div class="shortcut-row"><span>Reply to focused post</span><span class="kbd">r</span></div>
    <div class="shortcut-row"><span>Open focused post</span><span class="kbd">Enter</span></div>
    <div class="shortcut-row"><span>New thread</span><span class="kbd">n</span></div>
  </div>

  <div class="studio-block">
    <h3>Prototype data</h3>
    <p>Everything here is local to this browser — no account, no server.</p>
    <button class="pill" data-action="reset-proto">Reset prototype data</button>
  </div>
  `;
}

/* ---------------------------------------------------------------------- */
/* Modals                                                                  */
/* ---------------------------------------------------------------------- */
const modalRoot = () => document.getElementById('modalRoot');
function closeModal(){ modalRoot().innerHTML=''; }
function openModal(html){ modalRoot().innerHTML = `<div class="overlay" data-action="close-modal">${html}</div>`; }

function openCompose(replyTo){
  const me = userOf(meId());
  const root = replyTo ? postOf(replyTo) : null;
  openModal(`
    <div class="modal">
      <div class="modal-head">
        <button class="close-btn" data-action="close-modal">Cancel</button>
        <div class="modal-title">${root?'Reply':'New thread'}</div>
        <span style="width:50px"></span>
      </div>
      <div class="modal-body">
        ${root?`<div class="compose-row" style="opacity:.6;margin-bottom:8px">${avatarHTML(userOf(root.authorId))}<div class="compose-text"><b>${esc(userOf(root.authorId).name)}</b><div class="post-text" style="font-size:14px">${esc(root.text)}</div></div></div>`:''}
        <div class="compose-row">
          ${avatarHTML(me)}
          <div class="compose-text">
            <textarea id="composeInput" placeholder="${root?'Reply to '+userOf(root.authorId).name:"What's new?"}" autofocus></textarea>
          </div>
        </div>
        <div class="compose-foot">
          <span class="post-time">Anyone can reply</span>
          <button class="pill solid" data-action="submit-compose" data-reply="${root?root.id:''}">Post</button>
        </div>
      </div>
    </div>`);
  setTimeout(()=>document.getElementById('composeInput')?.focus(), 30);
}
function submitCompose(replyTo){
  const text = document.getElementById('composeInput').value.trim();
  if(!text) return;
  const p = {id:'p'+Date.now(), authorId: meId(), text, createdAt: Date.now(), likes:[], reposts:[], replyTo: replyTo||null, image:false, tag:null};
  state.posts.unshift(p);
  save(); closeModal();
  if(replyTo){
    openPostDetail(replyTo);
  }else{
    route('home');
  }
  toast(replyTo?'Reply posted':'Thread posted');
}

function openPostDetail(postId){
  const p = postOf(postId);
  const root = p.replyTo ? postOf(p.replyTo) : p;
  const replies = state.posts.filter(x=>x.replyTo===root.id).sort((a,b)=>a.createdAt-b.createdAt);
  const author = userOf(root.authorId);
  openModal(`
    <div class="modal" style="max-width:600px;max-height:92vh">
      <div class="modal-head"><button class="close-btn" data-action="close-modal">Close</button><div class="modal-title">Thread</div><span style="width:50px"></span></div>
      <div class="detail-post">
        <div class="post-head">${avatarHTML(author)}<span class="post-name">${esc(author.name)}</span>${author.verified?icon('verified','verified'):''}<span class="spacer"></span><span class="post-time">${timeAgo(root.createdAt)}</span></div>
        <div class="post-text">${esc(root.text)}</div>
        ${root.image?`<div class="post-image">image</div>`:''}
        <div class="post-actions">
          <button class="pa-btn ${root.likes.includes(meId())?'liked':''}" data-action="like" data-post="${root.id}">${icon('heart')}<span class="pa-count">${root.likes.length||''}</span></button>
          <button class="pa-btn" data-action="focus-reply" data-post="${root.id}">${icon('comment')}<span class="pa-count">${replies.length||''}</span></button>
          <button class="pa-btn ${root.reposts.includes(meId())?'reposted':''}" data-action="repost" data-post="${root.id}">${icon('repost')}<span class="pa-count">${root.reposts.length||''}</span></button>
          <button class="pa-btn" data-action="share" data-post="${root.id}">${icon('share')}</button>
        </div>
      </div>
      <div class="modal-body" style="padding:12px 16px">
        <button class="pill" data-action="focus-reply" data-post="${root.id}" style="width:100%">Reply to ${esc(author.name)}</button>
      </div>
      <div>${replies.map(r=>postCardHTML(r)).join('') || `<div class="empty">No replies yet.</div>`}</div>
    </div>`);
}

function openTip(postId){
  const p = postOf(postId); const author = userOf(p.authorId);
  const amounts = [2,5,10,20];
  openModal(`
    <div class="modal">
      <div class="modal-head"><button class="close-btn" data-action="close-modal">Cancel</button><div class="modal-title">Send a tip to ${esc(author.name)}</div><span style="width:50px"></span></div>
      <div class="modal-body">
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${amounts.map(a=>`<button class="pill" style="flex:1;min-width:70px" data-action="confirm-tip" data-post="${postId}" data-amt="${a}">$${a}</button>`).join('')}
        </div>
      </div>
    </div>`);
}
function confirmTip(postId, amt){
  const p = postOf(postId);
  state.studio.tipsTotal += (isMe(p.authorId)? 0 : amt);
  save(); closeModal(); toast(`Sent $${amt} to ${userOf(p.authorId).name}`);
}

function openCreateList(){
  openModal(`
    <div class="modal">
      <div class="modal-head"><button class="close-btn" data-action="close-modal">Cancel</button><div class="modal-title">New list</div><span style="width:50px"></span></div>
      <div class="modal-body">
        <input class="field" id="listNameInput" placeholder="List name" style="margin-bottom:14px">
        <div class="label-sm">Add accounts</div>
        <div style="max-height:280px;overflow-y:auto">
          ${state.users.filter(u=>!isMe(u.id)).map(u=>`
            <label class="row-flex" style="cursor:pointer">
              <span style="display:flex;align-items:center;gap:10px">${avatarHTML(u)}<span>${esc(u.name)}<div class="post-time">@${esc(u.handle)}</div></span></span>
              <input type="checkbox" class="list-member" value="${u.id}">
            </label>`).join('')}
        </div>
        <button class="pill solid" style="width:100%;margin-top:14px" data-action="save-list">Create list</button>
      </div>
    </div>`);
}
function saveList(){
  const name = document.getElementById('listNameInput').value.trim() || 'Untitled list';
  const memberIds = Array.from(document.querySelectorAll('.list-member:checked')).map(el=>el.value);
  state.lists.push({id:'l'+Date.now(), name, memberIds});
  save(); closeModal(); route('lists'); toast('List created');
}

function openShortcuts(){ route('settings'); }

/* ---------------------------------------------------------------------- */
/* Toast                                                                    */
/* ---------------------------------------------------------------------- */
let toastTimer;
function toast(msg){
  let el = document.querySelector('.toast');
  if(!el){ el = document.createElement('div'); el.className='toast'; document.body.appendChild(el); }
  el.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.remove(), 2200);
}

/* ---------------------------------------------------------------------- */
/* More panel                                                              */
/* ---------------------------------------------------------------------- */
function toggleMore(){
  if(document.getElementById('morePanel')){ closeMore(); return; }
  const panel = document.createElement('div');
  panel.id='morePanel';
  panel.className='overlay';
  panel.setAttribute('data-action','close-more');
  panel.innerHTML = `
    <div class="modal" style="max-width:340px">
      <div class="modal-head"><div class="modal-title">More</div><button class="close-btn" data-action="close-more">Close</button></div>
      <div class="modal-body" style="padding:8px 0">
        ${moreRow('pulse','⚡','Pulse','Real-time trending')}
        ${moreRow('communities','🌐','Communities','Topic spaces')}
        ${moreRow('lists','📋','Lists','Curated feeds')}
        ${moreRow('studio','💰','Creator Studio','Earnings & monetization')}
        ${moreRow('settings','⚙️','Settings','Identity, API, shortcuts')}
      </div>
    </div>`;
  document.body.appendChild(panel);
}
function moreRow(tab,emoji,label,sub){
  return `<div class="row-flex" style="padding:10px 16px;cursor:pointer" data-action="go-more" data-tab="${tab}">
    <span style="display:flex;align-items:center;gap:12px"><span style="font-size:20px">${emoji}</span><span><div class="row-label">${label}</div><div class="row-desc">${sub}</div></span></span>
    <span>&rsaquo;</span>
  </div>`;
}
function closeMore(){ document.getElementById('morePanel')?.remove(); }

/* ---------------------------------------------------------------------- */
/* Theme                                                                    */
/* ---------------------------------------------------------------------- */
function applyTheme(){
  document.documentElement.setAttribute('data-theme', state.theme);
  const svg = document.getElementById('themeIcon');
  svg.innerHTML = state.theme==='dark'
    ? '<path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/><circle cx="12" cy="12" r="4"/>'
    : '<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36A5.4 5.4 0 0 1 12 3z" fill="currentColor" stroke="none"/>';
}
function toggleTheme(){ state.theme = state.theme==='dark'?'light':'dark'; save(); applyTheme(); }

/* ---------------------------------------------------------------------- */
/* Keyboard shortcuts (power-user affordance, phase 3)                     */
/* ---------------------------------------------------------------------- */
let focusIdx = -1;
function visiblePosts(){ return Array.from(document.querySelectorAll('#main .post[data-post]')); }
function setFocus(idx){
  const posts = visiblePosts();
  posts.forEach(p=>p.classList.remove('focused'));
  if(!posts.length) return;
  focusIdx = Math.max(0, Math.min(idx, posts.length-1));
  posts[focusIdx].classList.add('focused');
  posts[focusIdx].scrollIntoView({block:'nearest'});
}
document.addEventListener('keydown', e=>{
  if(document.getElementById('modalRoot').firstChild) { if(e.key==='Escape') closeModal(); return; }
  if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
  const posts = visiblePosts();
  if(e.key==='j'){ setFocus(focusIdx+1); }
  else if(e.key==='k'){ setFocus(focusIdx-1); }
  else if(e.key==='l' && posts[focusIdx]) { toggleLike(posts[focusIdx].dataset.post); }
  else if(e.key==='r' && posts[focusIdx]) { openCompose(posts[focusIdx].dataset.post); }
  else if((e.key==='Enter'||e.key==='o') && posts[focusIdx]) { openPostDetail(posts[focusIdx].dataset.post); }
  else if(e.key==='n'){ openCompose(); }
  else if(e.key==='?'){ route('settings'); }
});

/* ---------------------------------------------------------------------- */
/* Actions                                                                  */
/* ---------------------------------------------------------------------- */
function toggleLike(postId){
  const p = postOf(postId); if(!p) return;
  const i = p.likes.indexOf(meId());
  if(i>=0) p.likes.splice(i,1); else p.likes.push(meId());
  save(); rerenderInPlace();
}
function toggleRepost(postId){
  const p = postOf(postId); if(!p) return;
  const i = p.reposts.indexOf(meId());
  if(i>=0){ p.reposts.splice(i,1); } else { p.reposts.push(meId()); toast('Reposted'); }
  save(); rerenderInPlace();
}
function rerenderInPlace(){
  // cheap re-render of current tab; modal (if any) is left as-is except detail view
  const openDetail = modalRoot().querySelector('.detail-post');
  route(currentTab, currentSub);
}
function toggleFollow(uid){
  state.follows[uid] = !state.follows[uid];
  const u = userOf(uid);
  u.followers += state.follows[uid]?1:-1;
  save(); route('profile',{profileUserId:uid});
}

document.body.addEventListener('click', e=>{
  const el = e.target.closest('[data-action]');
  if(!el) return;
  const action = el.dataset.action;
  switch(action){
    case 'go-home': route('home'); break;
    case 'toggle-theme': case 'toggle-theme-switch': toggleTheme(); if(action==='toggle-theme-switch') route('settings'); break;
    case 'toggle-more': toggleMore(); break;
    case 'close-more': if(el.classList.contains('overlay') && e.target!==el) break; closeMore(); break;
    case 'go-more': closeMore(); route(el.dataset.tab); break;
    case 'open-compose': openCompose(); break;
    case 'submit-compose': submitCompose(el.dataset.reply); break;
    // the overlay backdrop and the modal's own Close/Cancel button share
    // this action; .modal has no stopPropagation, so a click anywhere
    // inside modal content bubbles here too — only treat it as "close"
    // when it's a genuine backdrop hit (closest() resolved to the overlay
    // itself) or the button itself (closest() resolved to the button).
    case 'close-modal': if(el.classList.contains('overlay') && e.target!==el) break; closeModal(); break;
    case 'open-post': openPostDetail(el.dataset.post); break;
    case 'focus-reply': closeModal(); openCompose(el.dataset.post); break;
    case 'like': toggleLike(el.dataset.post); e.stopPropagation(); break;
    case 'repost': toggleRepost(el.dataset.post); e.stopPropagation(); break;
    case 'share': navigator.clipboard?.writeText(location.href.split('#')[0]+'#'+el.dataset.post).catch(()=>{}); toast('Link copied'); e.stopPropagation(); break;
    case 'tip': openTip(el.dataset.post); e.stopPropagation(); break;
    case 'confirm-tip': confirmTip(el.dataset.post, Number(el.dataset.amt)); break;
    case 'open-profile': closeModal(); route('profile',{profileUserId:el.dataset.user}); e.stopPropagation(); break;
    case 'profile-tab': route('profile',{profileUserId:currentSub.profileUserId||meId(), profileTab:el.dataset.t}); break;
    case 'follow': toggleFollow(el.dataset.user); e.stopPropagation(); break;
    case 'dm': toast('Messaging is Instagram-inherited in the real app — this concept keeps it out of scope for phase 1.'); break;
    case 'edit-profile': toast('Prototype: profile editing not wired up.'); break;
    case 'join-community': {
      const c = state.communities.find(x=>x.id===el.dataset.c);
      c.joined = !c.joined; c.members += c.joined?1:-1;
      save(); route('communities'); break;
    }
    case 'create-list': openCreateList(); break;
    case 'save-list': saveList(); break;
    case 'open-list': document.getElementById('main').innerHTML = listFeedHTML(el.dataset.l); break;
    case 'sponsored-cta': toast('This is a mock ad unit — nothing to click through to.'); break;
    case 'toggle-subs': state.settings.subscriptionsEnabled = el.checked; save(); break;
    case 'simulate-ad-share': state.studio.adShare += (Math.random()*40+10); save(); route('studio'); toast('Simulated payout added'); break;
    case 'toggle-pro': state.settings.proSub = el.checked; save(); if(currentTab==='home') route('home'); break;
    case 'toggle-federation': state.settings.portableIdentity = el.checked; save(); toast(el.checked?'Federation enabled (concept only — no real ActivityPub server)':'Federation disabled'); break;
    case 'gen-key': state.settings.apiKey = 'tk_'+Math.random().toString(36).slice(2,10)+Math.random().toString(36).slice(2,10); save(); route('settings'); break;
    case 'reset-proto': resetProto(); break;
  }
});
document.body.addEventListener('input', e=>{
  if(e.target.dataset.action==='set-price'){ state.settings.proPrice = Number(e.target.value)||1.99; save(); }
});
document.querySelectorAll('[data-tab]').forEach(b=>{
  b.addEventListener('click', ()=> route(b.dataset.tab, b.dataset.tab==='profile'?{profileUserId:meId()}:null));
});
document.getElementById('mainCol')?.querySelector('.rail-logo');

/* ---------------------------------------------------------------------- */
/* Community rows also route into a filtered feed — small extra binding    */
/* ---------------------------------------------------------------------- */
document.body.addEventListener('click', e=>{
  const row = e.target.closest('.community-card');
  if(row && !e.target.closest('[data-action="join-community"]')){
    // find id via the join button inside this card
    const btn = row.querySelector('[data-action="join-community"]');
    if(btn) document.getElementById('main').innerHTML = communityFeedHTML(btn.dataset.c);
  }
});

/* ---------------------------------------------------------------------- */
/* Boot                                                                     */
/* ---------------------------------------------------------------------- */
applyTheme();
route('home');
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=> navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
