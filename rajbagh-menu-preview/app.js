/* Raj Bagh — The Menu Edit. Zero-build, phone-first static site. */
(() => {
  'use strict';
  const menu = window.MENU_DATA;
  const config = window.MENU_CONFIG || {};
  const hasBackend = Boolean(config.supabaseUrl && config.supabasePublishableKey);
  const $ = (id) => document.getElementById(id);
  const keys = { name:'rajbagh.name.v1', id:'rajbagh.localVoterId.v1', votes:'rajbagh.demoVotes.v1' };
  const initialMeal = 'breakfast';
  const eventOrder = ['breakfast','lunch1','sangeet','lunch2','gala'];
  const eventById = Object.fromEntries(menu.events.map(e=>[e.id,e]));
  const itemsBySection = {};
  const itemById = Object.fromEntries(menu.items.map(x=>[x.id,x]));
  for (const item of menu.items) (itemsBySection[item.category] ||= []).push(item);
  const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'guest-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const state = { name:localStorage.getItem(keys.name)||'', userId:'', event:initialMeal, section:'breakfast_cold', view:'browse', search:'', sort:'bank', organizerEvent:'all', votes:[], wishes:[], totals:[], participants:[], organizer:false, db:null, channel:null, saving:false, active:false, connection:'', ready:false, modal:false };
  let toastTimer;
  function toast(message){const x=$('toast');x.textContent=message;x.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>x.classList.remove('visible'),3400);}
  function event(){return eventById[state.event];}
  function section(){return menu.sections[state.section];}
  function own(v){return v.user_id===state.userId;}
  function currentVotes(){return state.votes.filter(v=>v.event_id===state.event);}
  function ownVotes(){return currentVotes().filter(own);}
  function ownWishes(){return state.wishes.filter(w=>w.user_id===state.userId && w.event_id===state.event);}
  function categoryWish(sectionId){return ownWishes().find(w=>w.section_id===sectionId);}
  function sameVote(itemId){return ownVotes().find(x=>x.item_id===itemId);}
  function isNonveg(sectionId){return Boolean(menu.sections[sectionId]?.nonveg);}
  function slotLimit(sectionId){return event().limits[sectionId];}
  function selectedInSection(sectionId){return ownVotes().filter(x=>x.section_id===sectionId && x.rank==='primary').length;}
  function myNonveg(sectionId,rank){return ownVotes().filter(x=>x.section_id===sectionId && x.rank===rank);}
  function nonvegLimit(sectionId,rank){return event().nonvegLimits?.[sectionId]?.[rank] ?? 0;}
  function votesOn(itemId){return currentVotes().filter(x=>x.item_id===itemId);}
  function voteCount(itemId, rank='primary'){
    if(!hasBackend)return votesOn(itemId).filter(v=>v.rank===rank).length;
    return Number(state.totals.find(t=>t.event_id===state.event&&t.item_id===itemId)?.[rank+'_count']||0);
  }
  function people(){return hasBackend?Number(state.participants.find(x=>x.event_id===state.event)?.participants||0):new Set(currentVotes().map(x=>x.user_id)).size;}
  function totalEventPicks(){return hasBackend?state.totals.filter(t=>t.event_id===state.event).reduce((n,t)=>n+Number(t.primary_count||0),0):currentVotes().filter(v=>v.rank==='primary').length;}
  function initials(name){return String(name||'?').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
  function summary(){const v=ownVotes();return {p:v.filter(x=>x.rank==='primary').length,b:v.filter(x=>x.rank==='backup').length};}
  function sortItems(items){
    // Preserve the caterer's menu-bank order by default. Popularity-based
    // sorting would leak vote rankings even when counts are hidden.
    const xs=[...items];
    if(state.sort==='az')xs.sort((a,b)=>a.name.localeCompare(b.name));
    return xs;
  }
  const iconHeart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-9-5.7-9-12a5.1 5.1 0 0 1 9-3 5.1 5.1 0 0 1 9 3c0 6.3-9 12-9 12Z"/></svg>';
  function renderShell(){
    $('app').innerHTML = `
      <header class="app-header"><div class="container masthead">
        <div class="mast-top"><div class="brand"><div class="crest" aria-hidden="true">❧</div><div><div class="brand-name">RAJ BAGH</div><div class="brand-sub">THE WEDDING MENU EDIT</div></div></div>
          <div class="header-actions"><button class="top-button" data-action="share" aria-label="Share the voting website">↗ <span class="button-text">Share</span></button><button class="avatar-bubble" data-action="profile" aria-label="Change your name"><span id="avatar-initial">?</span></button></div></div>
        <div class="header-copy"><div class="eyebrow">A little something for everyone</div><h1>Good food.<br><em>Great company.</em></h1><p>Your favorites, one beautiful menu. Pick what you'd love to eat. Choose your favorites independently. Your picks aren't visible to other guests.</p></div>
        <div class="header-bottom"><div class="live-indicator"><span class="dot ${hasBackend?'':'demo'}" id="status-dot"></span><span id="connection-label">${hasBackend?'Connecting…':'Preview mode · votes on this device only'}</span></div><div class="status-pill" id="name-pill">Welcome!</div></div>
      </div></header>
      <div class="context-strip"><div class="container context-inner"><div class="metric-container"><div class="mini-metric"><strong id="participants-count">0</strong><span>your primary picks</span></div><div class="mini-metric"><strong id="total-count">0</strong><span>your backups</span></div></div><div class="disclaimer" id="top-disclaimer">Voting is private. Other guests cannot see your selections or vote totals.</div></div></div>
      <div class="container page-content">
        <div class="section-caption">01 / Choose your event</div><nav class="meal-tabs" id="meal-tabs" aria-label="Choose a meal"></nav>
        <div class="desktop-layout"><aside class="sidebar"><h3>Explore the menu</h3><nav class="category-list" id="desktop-categories" aria-label="Menu categories"></nav><div class="how-note">Tap a dish to vote. Your choices stay private, and you can change your mind any time.</div></aside>
          <div class="content-panel"><div class="meal-title" id="meal-heading"></div><nav class="view-switch" id="view-switch" aria-label="Menu views"></nav><nav class="quick-picks" id="quick-picks" aria-label="Quick access to non-vegetarian choices"></nav><nav class="section-nav" id="mobile-categories" aria-label="Choose a category"></nav><div id="selection-content"></div></div>
        </div><div class="footer">Made with care for the Raj Bagh celebrations · Menu choices are subject to venue confirmation</div>
      </div>
      <div class="bottom-bar"><div class="bottom-inner"><div class="bottom-copy"><strong id="bottom-title">Your menu picks</strong><span id="bottom-subtitle">Start choosing your favorites</span></div><button class="primary-button" data-action="mine">View my picks &nbsp;↗</button></div></div>
      <div id="welcome-root"></div><div id="modal-root"></div>`;
  }
  function renderEventTabs(){
    const oldScroll=$('meal-tabs').scrollLeft;
    $('meal-tabs').innerHTML=eventOrder.map(id=>{
      const e=eventById[id];return `<button data-action="event" data-id="${id}" class="meal-tab ${state.event===id?'active':''}" aria-pressed="${state.event===id}"><div class="tab-eyebrow">${esc(e.eyebrow)}</div><div class="tab-name">${esc(e.label)}</div></button>`;
    }).join('');
    $('meal-tabs').scrollLeft=oldScroll;
  }
  function renderCategories(){
    const e=event();
    const make=(mobile)=>e.sections.map(id=>{
      const s=menu.sections[id];const count=state.event==='breakfast'?0:selectedInSection(id);
      const cap=(state.event==='breakfast'||(id==='curd'&&state.event==='gala'))?'Included':s.nonveg?`${count}/${nonvegLimit(id,'primary')}`:(e.limits[id]===undefined?'':`${count}/${e.limits[id]}`);
      return mobile?`<button class="section-chip ${state.section===id?'active':''}" data-action="section" data-id="${id}" aria-pressed="${state.section===id}">${esc(s.label)}${count?' · '+count:''}</button>`
      :`<button class="category-button ${state.section===id?'active':''}" data-action="section" data-id="${id}" aria-pressed="${state.section===id}"><strong>${esc(s.label)}</strong><em>${cap}</em></button>`;
    }).join('');
    const oldScroll=$('mobile-categories').scrollLeft; $('desktop-categories').innerHTML=make(false);$('mobile-categories').innerHTML=make(true); $('mobile-categories').scrollLeft=oldScroll;
    $('quick-picks').innerHTML=e.nonvegLimits && Object.keys(e.nonvegLimits).length ? `<div class="quick-heading">Non-veg picks · 2 + backup in each</div><div class="quick-actions">${[['nonveg_starters','Starters'],['nonveg_mains','Main courses']].map(([id,label])=>`<button data-action="section" data-id="${id}" class="quick-chip ${state.section===id?'active':''}">${label} <span>${myNonveg(id,'primary').length}/2 · ${myNonveg(id,'backup').length}/1 backup</span></button>`).join('')}</div>` : '';
  }
  function renderTop(){
    $('avatar-initial').textContent=initials(state.name);$('name-pill').textContent=`Voting as ${state.name||'guest'}`;
    $('connection-label').textContent = !hasBackend?'Preview mode · votes on this device only':state.connection;
    $('status-dot').classList.toggle('demo',!hasBackend||state.connection!=='Private voting connected');
    $('top-disclaimer').textContent=hasBackend?"Your selections are private and aren\'t shown to other guests.":'Demo: picks remain on this phone. Results stay private.';
    const onBreakfast=state.event==='breakfast';
    document.querySelector('.metric-container').style.display=onBreakfast?'none':'';
    document.querySelector('.bottom-bar').style.display=onBreakfast?'none':'';
    if(onBreakfast)$('top-disclaimer').textContent='Breakfast is already included — no voting required.';
    $('participants-count').textContent=onBreakfast?'0':summary().p;$('total-count').textContent=onBreakfast?'0':summary().b;
    const s=summary();$('bottom-title').textContent=`Your ${event().label.toLowerCase()} picks`;
    $('bottom-subtitle').textContent=`${s.p} chosen${s.b?' · '+s.b+' backup':''} · tap to review`;
    $('meal-heading').innerHTML=`<div><div class="eyebrow">${esc(event().eyebrow)}</div><h2>${esc(event().label)}</h2><p>${state.event==='breakfast'?'Browse the breakfast offerings included by the venue. Exact types and alternative preparations are to be confirmed.':'Choose your favorites independently—other guests’ selections are hidden. Non-veg: 2 starters + 1 backup, and 2 mains + 1 backup.'}</p>${state.event==='breakfast'?'':'<p class="included-meta">✓ Included: bottled water (200 ml). Soup comes with an assorted bread basket.</p>'}</div>`;
  }
  function renderViews(){
    $('view-switch').innerHTML=[['browse',state.event==='breakfast'?'Included menu':'Explore menu'], ...(state.event==='breakfast'?[]:[['mine','My picks']]), ...(state.organizer?[['organizer','Organizer results']]:[])].map(([key,label])=>`<button data-action="view" data-id="${key}" class="${state.view===key?'active':''}" aria-pressed="${state.view===key}">${label}</button>`).join('');
    $('mobile-categories').style.display=state.view==='browse'?'':'none';
    $('quick-picks').style.display=state.view==='browse'?'':'none';
    $('desktop-categories').closest('.sidebar').style.display=state.view==='browse'?'':'none';
  }
  function normalizeVotes(){state.votes=state.votes.filter(v=>itemById[v.item_id] && eventById[v.event_id]);state.wishes=state.wishes.filter(w=>itemById[w.item_id] && eventById[w.event_id]);}
  function dishHTML(item){
    const current=sameVote(item.id),isNV=isNonveg(item.category),selected=Boolean(current),rank=current?.rank;
    let controls='';
    if(item.category.startsWith('breakfast_')){
      const choice=/\bor\b|choice/i.test(item.name);
      const pending=/\btypes\b|Potato Preparation|Veg Sandwich/i.test(item.name);
      controls='<span class="included-pill '+(choice||pending?'pending':'')+'">'+(choice?'Venue choice pending':pending?'Included · variety TBD':'Included')+'</span>';
    }else if(isNV){
      const normalFull=myNonveg(item.category,'primary').length>=nonvegLimit(item.category,'primary'), backupFull=myNonveg(item.category,'backup').length>=nonvegLimit(item.category,'backup');
      controls = `<button class="pick-button ${rank==='primary'?'active':''}" data-action="vote" data-id="${item.id}" data-rank="primary" ${state.saving||(rank!=='primary' && normalFull)?'disabled':''} aria-label="${rank==='primary'?'Remove':'Choose'} ${esc(item.name)} as primary">${rank==='primary'?'✓ Picked':'Pick'}</button>`;
      if(rank!=='primary')controls += `<button class="pick-button backup-btn ${rank==='backup'?'active':''}" data-action="vote" data-id="${item.id}" data-rank="backup" ${state.saving||(rank!=='backup'&&backupFull)?'disabled':''} aria-label="${rank==='backup'?'Remove backup':'Add as backup'} ${esc(item.name)}">${rank==='backup'?'★ Backup':'☆ Backup'}</button>`;
    }else{
      const cap=slotLimit(item.category);const limitReached=cap!==undefined && selectedInSection(item.category)>=cap;
      controls=`<button class="pick-button ${selected?'active':''}" data-action="vote" data-id="${item.id}" data-rank="primary" ${state.saving||(!selected&&limitReached)?'disabled':''} aria-label="${selected?'Remove':'Choose'} ${esc(item.name)}">${selected?'✓ Picked':cap===undefined?'♡ Interested':'+ Pick'}</button>`;
    }
    const statusText = item.category.startsWith('breakfast_')?'Provided as part of the breakfast offering':rank==='primary'?'✓ Your choice is saved':rank==='backup'?'★ Saved as your backup':'Choose what you would enjoy · results are private';
    return `<article class="dish ${rank==='primary'?'selected':rank==='backup'?'backup':''}"><div class="dish-main"><div class="dish-title-row"><span class="dish-title">${esc(item.name)}</span>${rank==='primary'?'<span class="selected-mark">✓ Yours</span>':''}${rank==='backup'?'<span class="backup-mark">★ Your backup</span>':''}</div><div class="vote-detail">${statusText}</div></div><div class="dish-actions">${controls}</div></article>`;
  }
  function renderBrowse(){
    const s=section(), e=event(), limit=s.nonveg?nonvegLimit(state.section,'primary'):slotLimit(state.section);
    const selected=selectedInSection(state.section);
    const done=limit!==undefined&&selected===limit;
    let notices='';
    if(s.nonveg)notices=`<div class="banner"><div class="banner-symbol">✧</div><div><strong>${s.label}: 2 picks + 1 optional backup</strong><p>${selectedInSection(state.section)}/2 primary picks · ${myNonveg(state.section,'backup').length}/1 backup. Starters and mains have separate limits for each event. No non-veg soups. Biryani allocation is pending venue confirmation.</p></div></div>`;
    if(s.note)notices+=`<div class="special">${esc(s.note)}</div>`;
    if(['achaar','papad','chutney'].includes(state.section))notices+=`<div class="banner"><div class="banner-symbol">!</div><div><strong>Varieties not supplied by venue</strong><p>There are ${event().limits[state.section]||0} contracted slots, but no named options in the PDFs. No selections can be made until the venue confirms the varieties.</p></div></div>`;
    if(menu.special[state.event] && state.section==='curd')notices+=`<div class="special">${esc(menu.special[state.event][0])}</div>`;
    if(state.event==='gala' && state.section==='curd'){
      $('selection-content').innerHTML='<section class="content-card"><div class="section-heading"><div><h3>Curd / raita</h3><p>Included as part of the gala menu</p></div><span class="quota-pill complete">Included</span></div><div class="special">Dahi Mehfil is included by the venue. There is no separate choice to make for this section.</div></section>';return;
    }
    if(state.event==='breakfast')notices+='<div class="banner"><div class="banner-symbol">✓</div><div><strong>Breakfast is included</strong><p>The items below are offerings listed in the breakfast PDF, not extra selections. Exact varieties and either/or preparations still need venue confirmation.</p></div></div>';
    if(state.event!=='breakfast'&&state.section==='soups')notices+='<div class="special"><b>Included:</b> Assorted bread basket with soup (as specified by the venue).</div>';
    const found=sortItems((itemsBySection[state.section]||[]).filter(x=>x.name.toLowerCase().includes(state.search.trim().toLowerCase())));
    if(['achaar','papad','chutney'].includes(state.section)){
      $('selection-content').innerHTML=`<section class="content-card"><div class="section-heading"><div><h3>${esc(s.label)}</h3><p>The contracted menu allows ${limit} varieties, but the PDF doesn't name them.</p></div><span class="quota-pill">Venue confirmation needed</span></div><div class="special">No options are available for voting until the caterer confirms the actual varieties. These slots are not marked complete.</div></section>`;
      return;
    }
    const quota=state.event==='breakfast'?'<span class="quota-pill complete">Included</span>':limit!==undefined?`<span class="quota-pill ${done?'complete':''}">${selected} of ${limit} selected</span>`:`<span class="quota-pill">Preferences only</span>`;
    $('selection-content').innerHTML=`${!hasBackend?'<div class="banner"><div class="banner-symbol">i</div><div><strong>Preview mode</strong><p>Your selections work on this phone. Live shared voting starts after Supabase is connected. Do not share this demo as a live poll yet.</p></div></div>':''}${notices}
      <section class="content-card"><div class="section-heading"><div><h3>${esc(s.label)}</h3><p>${state.event==='breakfast'?'Venue-listed breakfast offerings · no selections required':(itemsBySection[state.section]||[]).length+' choices from the venue menu bank'}</p></div>${quota}</div>
      <div class="toolbar"><label class="searchbox"><span class="screenreader">Search ${esc(s.label)}</span><input id="dish-search" type="search" placeholder="Find a dish…" autocomplete="off" value="${esc(state.search)}" /></label><select id="dish-sort" class="sort-control" aria-label="Sort dishes"><option value="bank" ${state.sort==='bank'?'selected':''}>Menu order</option><option value="az" ${state.sort==='az'?'selected':''}>A–Z</option></select></div>
      <div class="dish-list" id="dish-list">${found.length?found.map(dishHTML).join(''):'<div class="no-results">No matching dishes. Try another search.</div>'}</div></section>`;
  }
  function renderResults(){
    // Legacy "results" navigation should never expose another guest's votes.
    state.view='mine';renderMine();
  }
  function renderMine(){
    if(state.event==='breakfast'){state.view='browse';renderBrowse();return;}
    const grouped=event().sections.map(id=>({id,votes:ownVotes().filter(x=>x.section_id===id)})).filter(x=>x.votes.length);
    const html=grouped.map(g=>`<div class="mine-group"><h4>${esc(menu.sections[g.id].label)}</h4>${g.votes.map(v=>`<div class="mine-item"><span>${v.rank==='backup'?'★ ':''}${esc(itemById[v.item_id]?.name||v.item_id)}</span><button class="remove-link" data-action="remove" data-id="${esc(v.item_id)}" aria-label="Remove ${esc(itemById[v.item_id]?.name||'item')}">Remove</button></div>`).join('')}</div>`).join('');
    $('selection-content').innerHTML=`<section class="content-card mine-results"><div class="section-heading"><div><h3>Your menu shortlist</h3><p>Voting as ${esc(state.name)}</p></div><span class="quota-pill">${summary().p} choices</span></div><p class="results-note">You can revisit any category, remove a selection, or switch your optional backup.</p>${html||'<div class="no-results">Your shortlist is empty. Explore the menu to start picking.</div>'}<div style="padding-top:18px"><button class="secondary-button" data-action="view" data-id="browse">← Keep exploring</button> <button class="secondary-button" data-action="reset">Reset my picks</button></div></section>`;
  }
  function renderOrganizer(){
    if(!state.organizer){state.view='results';renderResults();return;}
    // Organizer reports must not depend on the currently selected browsing meal.
    const all=state.votes.filter(v=>itemById[v.item_id]&&eventById[v.event_id]);
    const current=state.organizerEvent||'all';
    const people=new Set(all.map(v=>v.user_id));
    const chips=[['all','All events'],...eventOrder.map(id=>[id,eventById[id].label])].map(([id,label])=>
      '<button class="organizer-chip '+(current===id?'active':'')+'" data-action="organizer-event" data-id="'+id+'" aria-pressed="'+(current===id)+'">'+esc(label)+' <span>'+all.filter(v=>id==='all'||v.event_id===id).length+'</span></button>').join('');
    const groups=eventOrder.filter(id=>current==='all'||id===current).map(id=>{
      const rows=all.filter(v=>v.event_id===id);
      if(!rows.length)return '';
      const byPerson=new Map();
      for(const v of rows){
        if(!byPerson.has(v.user_id))byPerson.set(v.user_id,{name:v.user_name||'Unnamed',votes:[]});
        byPerson.get(v.user_id).votes.push(v);
      }
      const html=[...byPerson.values()].sort((a,b)=>a.name.localeCompare(b.name)).map(person=>{
        const picks=person.votes.sort((a,b)=>eventById[id].sections.indexOf(a.section_id)-eventById[id].sections.indexOf(b.section_id)||a.rank.localeCompare(b.rank)).map(v=>
          '<div class="organizer-pick"><strong>'+esc(itemById[v.item_id].name)+'</strong><span>'+esc(menu.sections[v.section_id]?.label||v.section_id)+(v.rank==='backup'?' · ★ Backup':'')+'</span></div>').join('');
        return '<div class="organizer-person"><div class="organizer-person-head"><span class="organizer-avatar">'+esc(initials(person.name))+'</span><strong>'+esc(person.name)+'</strong><small>'+person.votes.length+' picks</small></div>'+picks+'</div>';
      }).join('');
      return '<section class="organizer-event"><div class="organizer-event-heading"><h4>'+esc(eventById[id].label)+'</h4><span>'+byPerson.size+' voters · '+rows.length+' picks</span></div>'+html+'</section>';
    }).join('');
    const visible=all.filter(v=>current==='all'||v.event_id===current);
    const tallyMap=new Map();
    for(const v of visible){
      const key=v.event_id+'|'+v.item_id;
      if(!tallyMap.has(key))tallyMap.set(key,{event_id:v.event_id,item_id:v.item_id,primary:0,backup:0});
      tallyMap.get(key)[v.rank]++;
    }
    const topDishes=[...tallyMap.values()].sort((a,b)=>b.primary-a.primary || b.backup-a.backup ||
      itemById[a.item_id].name.localeCompare(itemById[b.item_id].name));
    const tallyHtml=topDishes.length?'<section class="organizer-tally"><h4>Dish popularity · organizer only</h4><div class="organizer-tally-list">'+topDishes.map((x,i)=>
      '<div class="organizer-tally-row"><span class="organizer-tally-rank">'+(i+1)+'</span><div class="organizer-tally-description"><strong>'+esc(itemById[x.item_id].name)+'</strong><small>'+esc(eventById[x.event_id].label)+' · '+esc(menu.sections[itemById[x.item_id].category].label)+'</small></div><span class="organizer-tally-count">'+x.primary+' pick'+(x.primary===1?'':'s')+(x.backup?' · '+x.backup+' backup':'')+'</span></div>').join('')+'</div></section>':'';
    const currentCount=visible.length;
    $('selection-content').innerHTML='<section class="content-card organizer-panel"><div class="section-heading"><div><h3>Everyone’s picks</h3><p>Private organizer view · all events</p></div><span class="quota-pill">'+all.length+' total</span></div><p class="results-note">Names and individual picks are only visible to authorized organizers. Guests cannot see totals or names.</p><div class="organizer-metrics"><div><strong>'+people.size+'</strong><span>Voters</span></div><div><strong>'+all.length+'</strong><span>Total picks</span></div><div><strong>'+all.filter(v=>v.rank==='backup').length+'</strong><span>Backups</span></div></div><nav class="organizer-filter" aria-label="Filter organizer results">'+chips+'</nav>'+tallyHtml+(currentCount?groups:'<div class="no-results">No votes for this event. Choose All events to view votes elsewhere.</div>')+'<div class="organizer-tools"><button class="secondary-button" data-action="organizer-refresh">↻ Refresh results</button><button class="secondary-button" data-action="reset-all">Reset ALL guests’ votes</button></div></section>';
  }
  function renderContent(){if(state.view==='browse')renderBrowse();else if(state.view==='results')renderResults();else if(state.view==='organizer')renderOrganizer();else renderMine();}
  function renderAll(){renderEventTabs();renderCategories();renderTop();renderViews();renderContent();}
  function renderWelcome(error=''){
    $('welcome-root').innerHTML=state.ready?'':`<div class="welcome-overlay"><div class="welcome-card"><div class="welcome-ornament">❧</div><div class="eyebrow">You're invited to choose</div><h2>First, what should<br>we call you?</h2><p class="intro">Choose the food you'd love to eat. Other guests cannot see your name, selections, or voting totals.</p><form id="name-form"><label for="voter-name">Your name</label><input id="voter-name" type="text" autocomplete="name" placeholder="e.g. Priya Sharma" maxlength="50" minlength="2" required value="${esc(state.name)}" /><div class="form-error" id="login-error">${esc(error)}</div><button type="submit" class="primary-button" id="join-button">Let's see the menu →</button></form><p class="privacy-note">Your name and individual picks aren't shared with other guests. Vote counts stay hidden while voting is open.</p></div></div>`;
    if(!state.ready){const input=$('voter-name');setTimeout(()=>input?.focus(),80)}
  }
  function renderProfile(){
    $('modal-root').innerHTML=`<div class="backdrop-modal" data-action="dismiss"><div class="modal-body" role="dialog" aria-modal="true" aria-label="Change voter name"><h3>Your voting name</h3><p>Your selections won't be shown to other guests. Change your display name anytime.</p><form id="edit-name-form"><input id="edit-name" maxlength="50" minlength="2" required value="${esc(state.name)}" /><div class="modal-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">Save name</button></div></form>${hasBackend?'<button class="secondary-button" style="margin-top:14px" data-action="organizer-login">Organizer sign in</button>':''}</div></div>`;
    $('edit-name')?.focus();
  }
  async function initBackend(){
    if(!hasBackend){state.userId=localStorage.getItem(keys.id)||uid();localStorage.setItem(keys.id,state.userId);state.votes=JSON.parse(localStorage.getItem(keys.votes)||'[]');state.connection='Preview mode';return;}
    if(!window.supabase?.createClient) throw Error('Unable to load Supabase. Check your connection and reload.');
    state.db=window.supabase.createClient(config.supabaseUrl,config.supabasePublishableKey);
    state.connection='Connecting…';
    const {data:{session},error}=await state.db.auth.getSession(); if(error)throw error;
    if(session?.user?.id){state.userId=session.user.id;return;}
    const signed=await state.db.auth.signInAnonymously();if(signed.error)throw signed.error;
    state.userId=signed.data.user?.id;if(!state.userId)throw Error('Anonymous sign-in did not return a user.');
  }
  async function refreshOrganizer(){
    if(!hasBackend)return;
    const {data,error}=await state.db.rpc('user_is_organizer');
    if(error)throw error;
    state.organizer=data===true;
  }
  async function fetchVotes(){
    if(!hasBackend){state.votes=JSON.parse(localStorage.getItem(keys.votes)||'[]');state.wishes=JSON.parse(localStorage.getItem('rajbagh.extraWishes.v1')||'[]');normalizeVotes();return;}
    let all=[],start=0;
    while(true){
      const {data,error}=await state.db.from('votes').select('user_id,user_name,event_id,section_id,item_id,rank,created_at').range(start,start+999);
      if(error)throw error;
      all.push(...(data||[]));if((data||[]).length<1000)break;start+=1000;
    }
    state.votes=all;
    let wishes=[],wishStart=0;
    while(true){
      const {data,error}=await state.db.from('extra_wishes').select('user_id,user_name,event_id,section_id,item_id,created_at').range(wishStart,wishStart+999);
      if(error)throw error;
      wishes.push(...(data||[]));if((data||[]).length<1000)break;wishStart+=1000;
    }
    state.wishes=wishes;normalizeVotes();
    // Guests must never request aggregate functions; backend independently restricts these to organizers.
    if(state.organizer){
      const [totals,participants]=await Promise.all([state.db.rpc('vote_totals'),state.db.rpc('vote_participants')]);
      if(totals.error)throw totals.error;if(participants.error)throw participants.error;
      state.totals=totals.data||[];state.participants=participants.data||[];
    }else{state.totals=[];state.participants=[];}
  }
  function subscribe(){
    if(!hasBackend||state.channel)return;
    // RLS deliberately hides other users' vote rows. Poll only each guest’s private ballots; only organizers can fetch aggregates, rather than
    // subscribing to raw postgres_changes, which could disclose private records.
    state.connection='Private voting connected';renderTop();
    state.channel=setInterval(async()=>{
      if(state.saving||!state.ready||document.hidden)return;
      try{await fetchVotes();renderAll();}catch(e){state.connection='Sync delayed';renderTop();}
    },8000);
  }
  async function join(name){
    name=name.trim().replace(/\s+/g,' ');
    if(name.length<2||name.length>50)throw Error('Please enter a name between 2 and 50 characters.');
    await initBackend();await refreshOrganizer();await fetchVotes();state.name=name;localStorage.setItem(keys.name,name);state.ready=true;renderWelcome();renderAll();subscribe();document.dispatchEvent(new CustomEvent('rajbagh:joined',{detail:{name}}));
  }
  function isOverLimit(item,rank){
    if(isNonveg(item.category))return myNonveg(item.category,rank).length>=nonvegLimit(item.category,rank);
    const limit=slotLimit(item.category);return limit!==undefined&&selectedInSection(item.category)>=limit;
  }
  async function applyVote(itemId,rank){
    if(state.event==='breakfast')return;
    if(state.saving||!state.ready)return;
    const item=itemById[itemId];if(!item||!event().sections.includes(item.category)||['achaar','papad','chutney'].includes(item.category))return;
    const previous=sameVote(itemId);
    const remove=Boolean(previous&&previous.rank===rank);
    if(!remove && (!previous||previous.rank!==rank) && isOverLimit(item,rank)){
      toast(isNonveg(item.category)?`That ${menu.sections[item.category].label.toLowerCase()} slot is full. Remove one ${rank==='backup'?'backup':'primary pick'} in this category first.`:`${menu.sections[item.category].label} allows ${slotLimit(item.category)} pick(s). Remove another item first.`);return;
    }
    if(!isNonveg(item.category)&&rank==='backup')return;
    const snapshot=[...state.votes]; state.saving=true;
    state.votes=state.votes.filter(v=>!(own(v)&&v.event_id===state.event&&v.item_id===itemId));
    const newRow=!remove?{user_id:state.userId,user_name:state.name,event_id:state.event,section_id:item.category,item_id:item.id,rank}:null;
    if(newRow)state.votes.push(newRow);
    renderAll();
    try{
      if(hasBackend){
        let result;
        if(remove)result=await state.db.from('votes').delete().eq('user_id',state.userId).eq('event_id',state.event).eq('item_id',item.id);
        else result=await state.db.from('votes').upsert(newRow,{onConflict:'user_id,event_id,item_id'});
        if(result.error)throw result.error;
        await fetchVotes();
      }else localStorage.setItem(keys.votes,JSON.stringify(state.votes));
    }catch(e){state.votes=snapshot;toast('Could not save your vote: '+(e.message||e));}
    finally{state.saving=false;renderAll();}
  }
  async function saveExtraWish(itemId){
    if(!state.ready||state.saving||state.event==='breakfast')return;
    const item=itemById[itemId];
    if(!item||!event().sections.includes(item.category)||item.category!==state.section)return;
    if(['achaar','papad','chutney'].includes(state.section)||(state.event==='gala'&&state.section==='curd'))return;
    if(ownVotes().some(v=>v.item_id===itemId)){toast('This dish is already one of your main picks.');return;}
    const old=[...state.wishes],row={user_id:state.userId,user_name:state.name,event_id:state.event,section_id:state.section,item_id:itemId};
    state.saving=true;
    state.wishes=state.wishes.filter(w=>!(own(w)&&w.event_id===state.event&&w.section_id===state.section));
    state.wishes.push(row);renderAll();
    try{
      if(hasBackend){const {error}=await state.db.from('extra_wishes').upsert(row,{onConflict:'user_id,event_id,section_id'});if(error)throw error;await fetchVotes();}
      else localStorage.setItem('rajbagh.extraWishes.v1',JSON.stringify(state.wishes));
      toast('Extra suggestion saved! It does not change the menu limit.');
    }catch(e){state.wishes=old;toast('Could not save suggestion: '+(e.message||e));}
    finally{state.saving=false;renderAll();}
  }
  async function removeExtraWish(sectionId){
    if(!state.ready||state.saving)return;
    const old=[...state.wishes];state.saving=true;
    state.wishes=state.wishes.filter(w=>!(own(w)&&w.event_id===state.event&&w.section_id===sectionId));renderAll();
    try{
      if(hasBackend){const {error}=await state.db.from('extra_wishes').delete().eq('user_id',state.userId).eq('event_id',state.event).eq('section_id',sectionId);if(error)throw error;await fetchVotes();}
      else localStorage.setItem('rajbagh.extraWishes.v1',JSON.stringify(state.wishes));
      toast('Extra suggestion removed.');
    }catch(e){state.wishes=old;toast('Could not remove suggestion: '+(e.message||e));}
    finally{state.saving=false;renderAll();}
  }
  async function saveName(name){
    name=name.trim().replace(/\s+/g,' ');if(name.length<2||name.length>50){toast('Enter a name between 2 and 50 characters.');return}
    if(hasBackend){const {error}=await state.db.from('votes').update({user_name:name}).eq('user_id',state.userId);if(error){toast('Could not update name: '+error.message);return}const {error:wishError}=await state.db.from('extra_wishes').update({user_name:name}).eq('user_id',state.userId);if(wishError){toast('Could not update suggestion name: '+wishError.message);return}}
    state.votes=state.votes.map(x=>own(x)?{...x,user_name:name}:x);state.wishes=state.wishes.map(x=>own(x)?{...x,user_name:name}:x);state.name=name;localStorage.setItem(keys.name,name);
    if(!hasBackend){localStorage.setItem(keys.votes,JSON.stringify(state.votes));localStorage.setItem('rajbagh.extraWishes.v1',JSON.stringify(state.wishes));}$('modal-root').innerHTML='';renderAll();toast('Your display name has been updated.');document.dispatchEvent(new CustomEvent('rajbagh:joined',{detail:{name}}));
  }
  async function share(){
    const url=location.protocol==='file:'?'':location.href.split('#')[0];if(!url){toast('Publish the site before sharing a link.');return}
    if(!hasBackend){toast('This is a preview. Set up Supabase before inviting others.');return}
    try{if(navigator.share)await navigator.share({title:'Vote on our wedding menu',text:'Help us choose the wedding menu — your picks are private!',url});else{await navigator.clipboard.writeText(url);toast('Voting link copied!')}}catch(e){if(e.name!=='AbortError')toast('Could not share. You can copy the browser URL.');}
  }
  async function resetMyVotes(){
    if(!confirm('Reset all YOUR selections across every event? This cannot be undone. Other people’s votes will remain.'))return;
    try{
      if(hasBackend){const {error}=await state.db.from('votes').delete().eq('user_id',state.userId);if(error)throw error;const {error:wishError}=await state.db.from('extra_wishes').delete().eq('user_id',state.userId);if(wishError)throw wishError;await fetchVotes();}
      else{state.votes=state.votes.filter(v=>!own(v));state.wishes=state.wishes.filter(w=>!own(w));localStorage.setItem(keys.votes,JSON.stringify(state.votes));localStorage.setItem('rajbagh.extraWishes.v1',JSON.stringify(state.wishes));}
      state.event=initialMeal;state.section='breakfast_cold';state.view='browse';state.search='';renderAll();toast('Your picks have been reset.');
    }catch(e){toast('Reset failed: '+(e.message||e));}
  }
  function renderOrganizerLogin(){
    if(!hasBackend){toast('Connect Supabase to enable organizer login.');return;}
    $('modal-root').innerHTML=`<div class="backdrop-modal" data-action="dismiss"><div class="modal-body" role="dialog" aria-modal="true" aria-label="Organizer sign in"><h3>Organizer sign in</h3><p>Only an explicitly authorized Supabase account can reveal named selections.</p><form id="organizer-form"><input id="organizer-email" type="email" autocomplete="username" required placeholder="Email"/><input id="organizer-password" type="password" autocomplete="current-password" required placeholder="Password"/><div class="modal-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">Sign in</button></div></form></div></div>`;
  }
  async function resetAllVotes(){
    if(!hasBackend||!state.organizer)return;
    const confirmation=prompt('This permanently removes EVERYONE’S votes. Type RESET ALL VOTES to confirm:');
    if(confirmation!=='RESET ALL VOTES')return;
    const {error}=await state.db.rpc('organizer_reset_all_votes',{confirmation});
    if(error){toast('Reset failed: '+error.message);return;}await fetchVotes();renderAll();toast('All votes cleared.');
  }
  document.addEventListener('submit',async(e)=>{
    if(e.target.id==='name-form'){
      e.preventDefault();const input=$('voter-name');const button=$('join-button');button.disabled=true;button.textContent='Joining…';
      try{await join(input.value)}catch(err){$('login-error').textContent=(err.message||String(err));button.disabled=false;button.textContent="Let's see the menu →";}
    }else if(e.target.id==='edit-name-form'){e.preventDefault();await saveName($('edit-name').value)}
    else if(e.target.id==='organizer-form'){
      e.preventDefault();
      const email=$('organizer-email').value,password=$('organizer-password').value;
      const {error}=await state.db.auth.signInWithPassword({email,password});
      if(error){toast('Sign in failed: '+error.message);return;}
      const {data:{user}}=await state.db.auth.getUser();state.userId=user.id;
      await refreshOrganizer();
      if(!state.organizer){toast('This account is not an authorized organizer.');return;}
      await fetchVotes();$('modal-root').innerHTML='';state.view='organizer';renderAll();toast('Organizer access granted.');
    }
  });
  document.addEventListener('click',async(e)=>{
    const t=e.target.closest('[data-action]');if(!t)return;
    const action=t.dataset.action, id=t.dataset.id;
    if(action==='event'){state.event=id;state.section=id==='breakfast'?'breakfast_cold':'starters';state.search='';state.view='browse';renderAll();window.scrollTo({top:window.innerWidth<801?250:330,behavior:'smooth'})}
    else if(action==='organizer-event'){state.organizerEvent=id;renderContent();}
    else if(action==='organizer-refresh'){try{await fetchVotes();renderAll();toast('Results refreshed.')}catch(err){toast('Refresh failed: '+(err.message||err));}}
    else if(action==='section'){state.section=id;state.search='';renderCategories();renderContent();if(window.innerWidth<801)window.scrollTo({top:document.querySelector('.content-panel').getBoundingClientRect().top+scrollY-12,behavior:'smooth'});}
    else if(action==='view'){state.view=state.event==='breakfast'&&id==='mine'?'browse':id;renderViews();renderContent()}
    else if(action==='mine'){state.view=state.event==='breakfast'?'browse':'mine';renderViews();renderContent();document.querySelector('.content-panel').scrollIntoView({behavior:'smooth',block:'start'})}
    else if(action==='vote'){await applyVote(id,t.dataset.rank)}
    else if(action==='remove'){const vote=sameVote(id);if(vote)await applyVote(id,vote.rank)}
    else if(action==='extra-save'){const select=$('extra-wish-select');if(select?.value)await saveExtraWish(select.value);else toast('Please choose a dish to suggest.');}
    else if(action==='extra-remove'){await removeExtraWish(state.section);}
    else if(action==='share')await share();
    else if(action==='profile')renderProfile();
    else if(action==='organizer-login')renderOrganizerLogin();
    else if(action==='reset')await resetMyVotes();
    else if(action==='reset-all')await resetAllVotes();
    else if(action==='close-modal')$('modal-root').innerHTML='';
    else if(action==='dismiss'&&e.target===t)$('modal-root').innerHTML='';
  });
  document.addEventListener('input',(e)=>{
    if(e.target.id==='dish-search'){
      const q=e.target.value;const caret=e.target.selectionStart;state.search=q;
      const found=sortItems((itemsBySection[state.section]||[]).filter(x=>x.name.toLowerCase().includes(q.trim().toLowerCase())));
      $('dish-list').innerHTML=found.length?found.map(dishHTML).join(''):'<div class="no-results">No matching dishes. Try another search.</div>';
      if(e.target.setSelectionRange&&caret!=null)try{e.target.setSelectionRange(caret,caret)}catch(_){/* ignore search caret unsupported browsers */}
    }
  });
  document.addEventListener('change',e=>{if(e.target.id==='dish-sort'){state.sort=e.target.value;renderContent()}});
  async function start(){
    if(!menu){$('app').textContent='Menu data could not be loaded.';return}
    renderShell();state.userId=localStorage.getItem(keys.id)||uid();renderAll();renderWelcome();
    if(state.name){try{await join(state.name)}catch(e){state.ready=false;state.connection='Connection failed';renderWelcome('Could not connect: '+(e.message||String(e)));}}
  }
  start();
})();
/* A private little welcome surprise for Shruti — no voting information used. */
(() => {
  'use strict';
  const dismissedKey = 'rajbagh.bride.dismissed.v1';
  const isBride = name => /(?:^|\s)shruti(?:\s|$)/i.test(String(name || '').trim().replace(/\s+/g, ' '));
  const alreadyDismissed = () => {
    try { return sessionStorage.getItem(dismissedKey) === 'yes'; }
    catch (_) { return false; }
  };
  const root = document.createElement('div');
  root.id = 'bride-root';
  document.body.append(root);
  let previousFocus;
  function dismiss() {
    root.replaceChildren();
    try { sessionStorage.setItem(dismissedKey, 'yes'); } catch (_) {}
    if (previousFocus?.isConnected) previousFocus.focus();
  }
  function show(name) {
    if (!isBride(name) || alreadyDismissed() || root.firstChild) return;
    previousFocus = document.activeElement;
    const particles = Array.from({ length: 19 }, (_, i) => {
      const left = 5 + (i * 37) % 90;
      const delay = -((i * 11) % 27) / 10;
      const duration = 3.2 + (i % 5) * .4;
      const glyph = ['✦', '❀', '♥', '✧', '✿'][i % 5];
      return '<span class="bride-petal" aria-hidden="true" style="--x:' + left + '%;--delay:' + delay + 's;--duration:' + duration + 's">' + glyph + '</span>';
    }).join('');
    root.innerHTML = '<div class="bride-backdrop" data-bride-dismiss>' +
      '<div class="bride-surprise" role="dialog" aria-modal="true" aria-labelledby="bride-title" aria-describedby="bride-desc">' +
        '<div class="bride-petals" aria-hidden="true">' + particles + '</div>' +
        '<button type="button" class="bride-close" data-bride-dismiss aria-label="Dismiss special greeting">✕</button>' +
        '<div class="bride-monogram" aria-hidden="true">S <span>♥</span> S</div>' +
        '<div class="bride-eyebrow">A LITTLE SURPRISE, JUST FOR YOU</div>' +
        '<h2 id="bride-title">Hi bride <span aria-label="wink">😉</span></h2>' +
        '<p id="bride-desc">Shruti, the most important guest has entered the chat! ✨</p>' +
        '<div class="bride-sparkle-line" aria-hidden="true">✧ &nbsp; ❀ &nbsp; ✧</div>' +
        '<button type="button" class="bride-continue" data-bride-dismiss>Okay, now feed me! ♡</button>' +
      '</div></div>';
    root.querySelector('.bride-continue')?.focus();
  }
  document.addEventListener('rajbagh:joined', e => show(e.detail?.name));
  document.addEventListener('click', e => {
    const button = e.target.closest('[data-bride-dismiss]');
    if (button && root.contains(button) && (button === e.target || button.tagName === 'BUTTON')) dismiss();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && root.firstChild) { e.preventDefault(); dismiss(); }
  });
})();
