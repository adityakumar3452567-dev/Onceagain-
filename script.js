/* ================= Slide navigation ================= */
const slides = Array.from(document.querySelectorAll('.slide'));
let current = 0;
function motionDelay(ms){
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;
}
function showControl(element){
  element.inert=false;
  element.setAttribute('aria-hidden','false');
  element.classList.add('show');
}
function hideControl(element){
  element.classList.remove('show');
  element.inert=true;
  element.setAttribute('aria-hidden','true');
}
slides.forEach((slide,index)=>{
  const inactive=index!==current;
  slide.inert=inactive;
  slide.setAttribute('aria-hidden', String(inactive));
  slide.tabIndex=-1;
});
const dotsWrap = document.getElementById('progressDots');
slides.forEach((_,i)=>{
  const d = document.createElement('span');
  if(i===0) d.className='on';
  dotsWrap.appendChild(d);
});
const backBtn = document.getElementById('backBtn');
function updateDots(){
  Array.from(dotsWrap.children).forEach((d,i)=> d.classList.toggle('on', i===current));
}
function updateBackBtn(){
  backBtn.classList.toggle('hidden', current===0);
}
function goTo(i){
  if(i<0||i>=slides.length) return;
  const previousSlide=slides[current];
  previousSlide.classList.remove('active');
  previousSlide.inert=true;
  previousSlide.setAttribute('aria-hidden','true');
  current = i;
  const activeSlide=slides[current];
  activeSlide.inert=false;
  activeSlide.setAttribute('aria-hidden','false');
  activeSlide.classList.add('active');
  activeSlide.scrollTop=0;
  updateDots();
  updateBackBtn();
  activeSlide.focus({preventScroll:true});
}
document.querySelectorAll('[data-next]').forEach(btn=>{
  btn.addEventListener('click', ()=> goTo(current+1));
});
backBtn.addEventListener('click', ()=> goTo(current-1));
updateBackBtn();

/* Opening scene */
(function(){
  const cta = document.getElementById('openSlide1Btn');
  const slide = document.getElementById('slide-1');
  cta.style.animation = 'fadeIn .35s ease .45s both';
  window.setTimeout(()=>showControl(cta),motionDelay(450));
  cta.addEventListener('click',()=>{
    if(slide.classList.contains('s1-exit')) return;
    slide.classList.add('s1-exit');
    window.setTimeout(()=>goTo(current+1),motionDelay(300));
  });
})();
/* ================= Slide 2: birthday reveal (blossom tree, adapted from birthday_tree_2.html) ================= */
(function(){
  var s2trPending = [];
  function s2trTimer(fn, ms){
    var id = window.setTimeout(fn, motionDelay(ms));
    s2trPending.push(id);
    return id;
  }
  function s2trClearAll(){
    s2trPending.forEach(function(id){ window.clearTimeout(id); });
    s2trPending = [];
  }


  var stage = document.getElementById('s2tree-stage');
  var replayBtn = document.getElementById('s2tree-replayBtn');
  var treeGroup = document.getElementById('s2tree-treeGroup');
  var heartGroup = document.getElementById('s2tree-heartGroup');
  var sparkLayer = document.getElementById('s2tree-sparkLayer');
  var miniHeartLayer = document.getElementById('s2tree-miniHeartLayer');
  var greeting = document.getElementById('s2tree-greeting');

  var rand = function(seed){ var x = Math.sin(seed*999)*10000; return x - Math.floor(x); };

  /* ---------------------------------------------------------
     TREE STRUCTURE — trunk, large branches, small sub-branches
     each entry grows from a parent tip, cascading delays below
  --------------------------------------------------------- */
  var branchDefs = [
    // level 0 — trunk (0–2s)
    { id:'trunk', d:"M 485 440 C 473 393 497 358 480 318 C 466 286 490 258 478 224", w:10, delay:0.3, dur:1.5 },

    // level 1 — large limbs off the trunk (2–3s)
    { id:'b1', d:"M 480 318 C 458 300 428 278 398 244", w:6, delay:2.0, dur:0.9 },
    { id:'b2', d:"M 478 224 C 470 196 478 168 466 138", w:5, delay:2.05, dur:0.85 },
    { id:'b3', d:"M 480 318 C 502 298 530 274 546 242", w:6, delay:2.1, dur:0.9 },

    // level 2 — small sub-branches off the large limbs (3–4s)
    { id:'s1', d:"M 398 244 C 384 222 380 196 393 168", w:3, delay:3.0, dur:0.7 },
    { id:'s2', d:"M 398 244 C 378 230 354 214 338 188", w:3, delay:3.1, dur:0.7 },
    { id:'s3', d:"M 466 138 C 454 116 460 90 446 68", w:3, delay:3.0, dur:0.7 },
    { id:'s4', d:"M 466 138 C 482 116 496 90 511 68", w:3, delay:3.1, dur:0.7 },
    { id:'s5', d:"M 546 242 C 562 218 572 192 559 162", w:3, delay:3.2, dur:0.7 },
    { id:'s6', d:"M 546 242 C 566 228 590 212 606 188", w:3, delay:3.3, dur:0.7 }
  ];

  var branchEls = {};
  branchDefs.forEach(function(b){
    var path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', b.d);
    path.setAttribute('class','branch');
    path.setAttribute('stroke-width', b.w);
    treeGroup.appendChild(path);
    var len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.dataset.delay = b.delay;
    path.dataset.dur = b.dur;
    path.dataset.len = len;
    branchEls[b.id] = path;
  });

  // branch tip coordinates — where the first blooms visibly grow FROM
  var tipPoints = [
    { x:393, y:168 }, { x:338, y:188 },
    { x:446, y:68 },  { x:511, y:68 },
    { x:559, y:162 }, { x:606, y:188 },
    { x:398, y:244 }, { x:546, y:242 }, { x:466, y:138 }
  ];

  // extra points sampled directly ALONG each branch/sub-branch (not just tips)
  // so the first blooms clearly read as growing out of the wood itself
  var alongBranchPoints = [];
  ['b1','b2','b3','s1','s2','s3','s4','s5','s6'].forEach(function(id, bi){
    var path = branchEls[id];
    var len = parseFloat(path.dataset.len);
    [0.45, 0.8].forEach(function(frac, fi){
      var pt = path.getPointAtLength(len * frac);
      alongBranchPoints.push({ x: pt.x, y: pt.y, seed: bi*2+fi });
    });
  });

  /* ---------------------------------------------------------
     HEART CANOPY — points generated in stages so the viewer
     watches the shape trace its outline, then fill inward
  --------------------------------------------------------- */
  var centerX = 472, centerY = 148, scale = 9.4;
  function heartXY(t, rr){
    var x = 16 * Math.pow(Math.sin(t), 3);
    var y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
    return { x: centerX + x * scale * rr, y: centerY - y * scale * rr };
  }

  var points = [];
  var heartFill = document.createElementNS('http://www.w3.org/2000/svg','path');
  var heartPath = '';
  for(var heartPoint=0;heartPoint<=120;heartPoint++){
    var heartCoordinate=heartXY((heartPoint/120)*Math.PI*2,1.0);
    heartPath += (heartPoint===0?'M':'L') + heartCoordinate.x.toFixed(1) + ',' + heartCoordinate.y.toFixed(1) + ' ';
  }
  heartFill.setAttribute('class','heart-fill');
  heartFill.setAttribute('d',heartPath+'Z');
  heartFill.setAttribute('fill','var(--rose)');
  heartGroup.appendChild(heartFill);

  // stage 0 (4–5s) — first blooms: right at branch tips AND along the branches themselves
  tipPoints.forEach(function(p, i){
    points.push({ x:p.x + (rand(i+1)-0.5)*6, y:p.y + (rand(i+11)-0.5)*6, stage:0, order: i / (tipPoints.length + alongBranchPoints.length) });
  });
  alongBranchPoints.forEach(function(p, i){
    points.push({ x:p.x + (rand(i+80)-0.5)*5, y:p.y + (rand(i+90)-0.5)*5, stage:0, order: (tipPoints.length + i) / (tipPoints.length + alongBranchPoints.length) });
  });

  // stage 1 (5–7s) — the outer heart outline, ordered by angle so it visibly traces around
  var outlineN = 78;
  for (var i = 0; i < outlineN; i++){
    var t = (i / outlineN) * Math.PI * 2;
    var xy = heartXY(t, 1.0);
    points.push({ x: xy.x + (rand(i+30)-0.5)*4, y: xy.y + (rand(i+40)-0.5)*4, stage:1, order:i/outlineN });
  }

  // stage 1b (6.5–8s) — a second ring just inside, thickening the outline / spreading outward
  var midN = 60;
  for (var i2 = 0; i2 < midN; i2++){
    var t2 = (i2 / midN) * Math.PI * 2 + 0.08;
    var xy2b = heartXY(t2, 0.88);
    points.push({ x: xy2b.x + (rand(i2+120)-0.5)*4, y: xy2b.y + (rand(i2+130)-0.5)*4, stage:1.5, order:i2/midN });
  }

  // stage 2 (8–10s) — inward rings, filling the silhouette until the canopy reads dense
  var fillRings = [0.72, 0.56, 0.4];
  fillRings.forEach(function(rr, ringIdx){
    var N = Math.round(34 + rr * 40);
    for (var i = 0; i < N; i++){
      var t = (i / N) * Math.PI * 2 + ringIdx * 0.14;
      var xy = heartXY(t, rr);
      points.push({
        x: xy.x + (rand(i+ringIdx*70)-0.5)*5,
        y: xy.y + (rand(i+ringIdx*90)-0.5)*5,
        stage: 2 + ringIdx * 0.3,
        order: i / N
      });
    }
  });

  // stage 3 (10–11s) — scattered core fill, closes any remaining gaps
  for (var j = 0; j < 22; j++){
    var rt = rand(j+500) * Math.PI * 2;
    var rr3 = rand(j+600) * 0.35;
    var xy3 = heartXY(rt, rr3);
    points.push({ x:xy3.x, y:xy3.y, stage:3, order: rand(j+700) });
  }

  // timing bands per stage (seconds) — bloom formation sped up
  var stageBands = {
    0:   [4.0, 4.7],
    1:   [4.7, 5.3],
    1.5: [5.1, 5.6],
    2:   [5.5, 5.85],
    2.3: [5.7, 6.05],
    2.6: [5.9, 6.25],
    3:   [6.2, 6.5]
  };

  var palette = [
    'var(--s2-pink)','var(--s2-pink)','var(--s2-blush)','var(--s2-blush)',
    'var(--s2-white-bloom)','var(--s2-peach)','var(--s2-peach)'
  ];

  points.forEach(function(p, idx){
    var band = stageBands[p.stage];
    var delay = band[0] + (band[1]-band[0]) * p.order + rand(idx*1.7) * 0.18;

    var s = 5.5 + rand(idx*3.1) * 5.2;
    var color = palette[Math.floor(rand(idx*7.7) * palette.length)];
    var rot = (rand(idx*2.3) - 0.5) * 30;

    // outer group: STATIC svg-attribute transform only (position + rotation)
    var pos = document.createElementNS('http://www.w3.org/2000/svg','g');
    pos.setAttribute('class','bloom-pos');
    pos.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')');

    // inner group: CSS-animated (opacity/scale) only — no attribute transform here,
    // so the CSS animation can never wipe out the outer position
    var g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('class','bloom');

    var hd = "M0,-"+ (s*0.5) +
      " C" + (s*0.5) + ",-" + (s*1.05) + " " + s + ",-" + (s*0.35) + " " + s + "," + (s*0.18) +
      " C" + s + "," + (s*0.68) + " 0," + (s*1.05) + " 0," + (s*1.3) +
      " C0," + (s*1.05) + " -" + s + "," + (s*0.68) + " -" + s + "," + (s*0.18) +
      " C-" + s + ",-" + (s*0.35) + " -" + (s*0.5) + ",-" + (s*1.05) + " 0,-" + (s*0.5) + " Z";

    // soft shadow layer for depth
    var shadow = document.createElementNS('http://www.w3.org/2000/svg','path');
    shadow.setAttribute('d', hd);
    shadow.setAttribute('fill', 'rgba(var(--rose-rgb),0.10)');
    shadow.setAttribute('transform', 'translate(0.8,1.2) scale(1.02)');
    g.appendChild(shadow);

    var heart = document.createElementNS('http://www.w3.org/2000/svg','path');
    heart.setAttribute('d', hd);
    heart.setAttribute('fill', color);
    heart.setAttribute('stroke', 'rgba(var(--rose-rgb),0.12)');
    heart.setAttribute('stroke-width', '0.4');
    g.appendChild(heart);

    var hi = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
    hi.setAttribute('cx', -s*0.3); hi.setAttribute('cy', -s*0.1);
    hi.setAttribute('rx', s*0.2); hi.setAttribute('ry', s*0.13);
    hi.setAttribute('fill', 'rgba(var(--surface-rgb),0.5)');
    g.appendChild(hi);

    pos.appendChild(g);
    g.dataset.delay = delay.toFixed(2);
    heartGroup.appendChild(pos);
  });

  // --- ambient sparks (settle phase, 11–12s onward) ---
  var sparks = [];
  for (var k = 0; k < 12; k++){
    var sp = document.createElement('div');
    sp.className = 'spark';
    var size = 3 + Math.random()*3.5;
    sp.style.width = size + 'px';
    sp.style.height = size + 'px';
    sp.style.left = (30 + Math.random()*62) + '%';
    sp.style.top = (10 + Math.random()*70) + '%';
    sp.dataset.delay = (6.7 + Math.random()*0.6).toFixed(2);
    sparkLayer.appendChild(sp);
    sparks.push(sp);
  }

  // --- a few subtle floating mini hearts, drifting near the canopy ---
  var miniHearts = [];
  var miniColors = ['var(--rose-soft)','var(--rose-soft)','var(--paper)'];
  for (var mh = 0; mh < 5; mh++){
    var el = document.createElement('div');
    el.className = 'mini-heart';
    var msize = 9 + Math.random()*5;
    el.style.left = (34 + Math.random()*58) + '%';
    el.style.top = (8 + Math.random()*66) + '%';
    el.dataset.delay = (6.9 + Math.random()*0.5).toFixed(2);
    el.innerHTML = '<svg width="'+msize+'" height="'+msize+'" viewBox="0 0 20 20">' +
      '<path d="M10,17 C10,17 2,11 2,6.5 C2,3.5 4.5,2 7,2.5 C8.5,2.8 9.5,4 10,5.2 ' +
      'C10.5,4 11.5,2.8 13,2.5 C15.5,2 18,3.5 18,6.5 C18,11 10,17 10,17 Z" ' +
      'fill="'+miniColors[mh % miniColors.length]+'" opacity="0.75"/></svg>';
    miniHeartLayer.appendChild(el);
    miniHearts.push(el);
  }

  var TOTAL_MS = 5400;

  function resetBranch(path){
    path.style.transition = 'none';
    path.style.strokeDashoffset = path.dataset.len;
  }

  function play(){
    // reset everything
    branchDefs.forEach(function(b){ resetBranch(branchEls[b.id]); });
    document.querySelectorAll('.bloom').forEach(function(el){ el.classList.remove('go'); });
    greeting.classList.remove('go');
    sparks.forEach(function(sp){ sp.classList.remove('go'); });
    miniHearts.forEach(function(m){ m.classList.remove('go'); });
    heartFill.classList.remove('go');
    hideControl(replayBtn);

    void stage.offsetWidth; // reflow

    branchDefs.forEach(function(b){
      var path = branchEls[b.id];
      s2trTimer(function(p, dur){
        return function(){
          p.style.transition = 'stroke-dashoffset ' + dur + 's cubic-bezier(.35,.6,.25,1)';
          p.style.strokeDashoffset = 0;
        };
      }(path, b.dur), b.delay * 1000);
    });

    document.querySelectorAll('.bloom').forEach(function(el){
      s2trTimer(function(){ el.classList.add('go'); }, parseFloat(el.dataset.delay) * 1000);
    });

    s2trTimer(function(){ greeting.classList.add('go'); }, 4800);
    s2trTimer(function(){ heartFill.classList.add('go'); }, 4200);

    sparks.forEach(function(sp){
      s2trTimer(function(){ sp.classList.add('go'); }, parseFloat(sp.dataset.delay) * 1000);
    });
    miniHearts.forEach(function(m){
      s2trTimer(function(){ m.classList.add('go'); }, parseFloat(m.dataset.delay) * 1000);
    });

    s2trTimer(function(){ showControl(replayBtn); }, TOTAL_MS);
  }

  replayBtn.addEventListener('click', play);

  var nextBtn = document.getElementById('s2tree-nextBtn');
  var slide2 = document.getElementById('slide-2');

  new MutationObserver(function(){
    if(slide2.classList.contains('active')){
      hideControl(nextBtn);
      play();
      s2trTimer(function(){ showControl(nextBtn); }, TOTAL_MS);
    } else {
      s2trClearAll();
    }
  }).observe(slide2, { attributes:true, attributeFilter:['class'] });

  if(slide2.classList.contains('active')){
    hideControl(nextBtn);
    play();
    s2trTimer(function(){ showControl(nextBtn); }, TOTAL_MS);
  }
})();

/* ================= Slide 3: Vanshika — personal file 01 ================= */
(function(){
  const slide3 = document.getElementById('slide-3');
  const hangtag = document.getElementById('s3Hangtag');
  const hangtagBtn = document.getElementById('s3HangtagBtn');
  if(hangtagBtn){
    hangtagBtn.addEventListener('click', ()=> hangtag.classList.toggle('flipped'));
    hangtagBtn.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); hangtag.classList.toggle('flipped'); }
    });
  }
  const sideA = document.getElementById('s3SideA');
  const file = document.getElementById('s3File');
  const topSecret = document.getElementById('s3TopSecret');
  const title = document.getElementById('s3Title');
  const confidential = document.getElementById('s3Confidential');
  const subtitle = document.getElementById('s3Subtitle');
  const rows = Array.from(document.querySelectorAll('#s3Table .s3-row'));
  const officialNote = document.getElementById('s3OfficialNote');
  const fingerprintCard = document.getElementById('s3FingerprintCard');
  const certified = document.getElementById('s3Certified');
  const ctaHint = document.getElementById('s3CtaHint');
  const openBtn = document.getElementById('s3OpenBtn');
  const outerSticky = document.getElementById('s3OuterSticky');

  let timers = [];
  function later(fn, ms){ timers.push(setTimeout(fn, motionDelay(ms))); }
  function clearTimers(){ timers.forEach(id=>clearTimeout(id)); timers = []; }

  function play(){
    file.classList.add('show');
    later(()=>{ hangtag.classList.add('show'); showControl(hangtagBtn); }, 150);
    later(()=> sideA.classList.add('show'), 250);
    later(()=> topSecret.classList.add('show'), 500);
    later(()=> title.classList.add('show'), 400);
    later(()=> confidential.classList.add('show'), 650);
    later(()=> subtitle.classList.add('show'), 700);
    rows.forEach((el,i)=>{
      later(()=> el.classList.add('show'), 900 + i*130);
    });
    const rowsEnd = 900 + rows.length*130;
    later(()=> officialNote.classList.add('show'), rowsEnd + 150);
    later(()=> fingerprintCard.classList.add('show'), rowsEnd + 280);
    later(()=> certified.classList.add('show'), rowsEnd + 380);
    later(()=> outerSticky.classList.add('show'), rowsEnd + 500);
    later(()=> ctaHint.classList.add('show'), rowsEnd + 650);
    later(()=> showControl(openBtn), rowsEnd + 750);
  }

  function reset(){
    clearTimers();
    file.classList.remove('show');
    hangtag.classList.remove('show');
    hideControl(hangtagBtn);
    sideA.classList.remove('show');
    topSecret.classList.remove('show');
    title.classList.remove('show');
    confidential.classList.remove('show');
    subtitle.classList.remove('show');
    rows.forEach(el=> el.classList.remove('show'));
    officialNote.classList.remove('show');
    fingerprintCard.classList.remove('show');
    certified.classList.remove('show');
    outerSticky.classList.remove('show');
    ctaHint.classList.remove('show');
    hideControl(openBtn);
  }

  let played = false;
  new MutationObserver(()=>{
    if(slide3.classList.contains('active')){
      if(!played){ played = true; reset(); play(); }
    } else if(played){
      played = false;
      reset();
    }
  }).observe(slide3, { attributes:true, attributeFilter:['class'] });

  if(slide3.classList.contains('active')){
    played = true;
    play();
  }
})();

/* ================= Slide 4: CASE NOTES — 02 evidence board ================= */
(function(){
  const slide4 = document.getElementById('slide-4');
  const board = document.getElementById('s4Board');
  const folderTab = document.getElementById('s4FolderTab');
  const confidential = document.getElementById('s4Confidential');
  const header = document.getElementById('s4Header');
  const threads = document.getElementById('s4Threads');
  const subject = document.getElementById('s4Subject');
  const cards = [document.getElementById('s4Card1'), document.getElementById('s4Card2'), document.getElementById('s4Card3')];
  const stamp1 = document.getElementById('s4Card2') ? document.getElementById('s4Card2').querySelector('.s4-stamp-1') : null;
  const stampClassified = document.getElementById('s4StampClassified');
  const sticky = document.getElementById('s4Sticky');
  const more = document.getElementById('s4More');
  const continueBtn = document.getElementById('s4Continue');

  let timers = [];
  function later(fn, ms){ timers.push(setTimeout(fn, motionDelay(ms))); }
  function clearTimers(){ timers.forEach(id=> clearTimeout(id)); timers = []; }

  function play(){
    board.classList.add('show');
    later(()=> folderTab.classList.add('show'), 120);
    later(()=> confidential.classList.add('show'), 220);
    later(()=> header.classList.add('show'), 250);
    later(()=> subject.classList.add('show'), 500);
    cards.forEach((el,i)=>{
      later(()=> el && showControl(el), 750 + i*220);
    });
    later(()=> threads.classList.add('show'), 1550);
    later(()=> stamp1 && stamp1.classList.add('show'), 1700);
    later(()=> stampClassified.classList.add('show'), 1850);
    later(()=> sticky.classList.add('show'), 1950);
    later(()=> more.classList.add('show'), 2100);
    later(()=> showControl(continueBtn), 2250);
  }

  function reset(){
    clearTimers();
    board.classList.remove('show');
    folderTab.classList.remove('show');
    confidential.classList.remove('show');
    header.classList.remove('show');
    subject.classList.remove('show');
    cards.forEach(el=>{ if(el) hideControl(el); });
    threads.classList.remove('show');
    if(stamp1) stamp1.classList.remove('show');
    stampClassified.classList.remove('show');
    sticky.classList.remove('show');
    more.classList.remove('show');
    hideControl(continueBtn);
    cards.forEach(el=>{
    if(!el) return;
    el.classList.remove('s4-tapped');
    el.setAttribute('aria-expanded','false');
  });
  }

  // tap-to-reveal handwritten detail on touch devices (hover has no meaning there)
  function toggleEvidenceNote(card){
    const isExpanded=card.classList.contains('s4-tapped');
    cards.forEach(item=>{
      if(!item) return;
      item.classList.remove('s4-tapped');
      item.setAttribute('aria-expanded','false');
    });
    if(!isExpanded){
      card.classList.add('s4-tapped');
      card.setAttribute('aria-expanded','true');
    }
  }
  cards.forEach(card=>{
    if(!card) return;
    card.addEventListener('click',()=>toggleEvidenceNote(card));
    card.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){
        event.preventDefault();
        toggleEvidenceNote(card);
      }
    });
  });

  let played = false;
  const observer = new MutationObserver(()=>{
    if(slide4.classList.contains('active')){
      if(!played){ played = true; reset(); play(); }
    } else if(played){
      played = false;
      reset();
    }
  });
  observer.observe(slide4, { attributes:true, attributeFilter:['class'] });

  if(slide4.classList.contains('active')){
    played = true;
    play();
  }
})();

/* ================= Slide 5: memory photos ================= */
const memoryData = [
  { src:'photos/eyes.jpg', cap:'a photo worth keeping around' },
  { src:'photos/memory-01.jpg', cap:'the smile you didn\'t even know you were doing' },
  { src:'photos/memory-02.jpg', cap:'Somehow, you make ordinary moments look special.' },
  { src:'photos/memory-03.jpg', cap:'okay this one\'s just unfair, honestly' },
  { src:'photos/memory-04.jpg', cap:'Proof that the camera clearly has a favorite.' },
  { src:'photos/memory-05.jpg', cap:'a moment worth saving' },
];
/* EVIDENCE ARCHIVE — 03 layout: position/rotation/decoration per card, desktop only */
const eaLayout = [
  {top:'0%',   left:'2%',  rot:-7,  deco:'tape'},
  {top:'2%',   left:'40%', rot:5,   deco:'pin'},
  {top:'6%',   left:'74%', rot:-4,  deco:'clip'},
  {top:'44%',  left:'10%', rot:6,   deco:'clip'},
  {top:'42%',  left:'44%', rot:-6,  deco:'tape'},
  {top:'40%',  left:'76%', rot:4,   deco:'pin'},
];
const eaBoard = document.getElementById('eaBoard');
const viewerOverlay = document.getElementById('viewerOverlay');
const viewerImg = document.getElementById('viewerImg');
const viewerCap = document.getElementById('viewerCap');
const viewerNum = document.getElementById('viewerNum');

const viewerClose = document.getElementById('viewerClose');
const birthdayExperience = document.getElementById('birthdayExperience');
let viewerReturnFocus = null;
function openMemoryViewer(trigger, memory, number){
  viewerReturnFocus=trigger;
  birthdayExperience.inert=true;
  viewerImg.src=memory.src;
  viewerImg.alt=memory.cap;
  viewerNum.textContent='Evidence '+number;
  viewerCap.textContent=memory.cap;
  viewerOverlay.inert=false;
  viewerOverlay.setAttribute('aria-hidden','false');
  viewerOverlay.classList.add('open');
  viewerClose.focus();
}
function closeMemoryViewer(){
  if(!viewerOverlay.classList.contains('open')) return;
  viewerOverlay.classList.remove('open');
  viewerOverlay.inert=true;
  viewerOverlay.setAttribute('aria-hidden','true');
  birthdayExperience.inert=false;
  if(viewerReturnFocus?.isConnected) viewerReturnFocus.focus();
  viewerReturnFocus=null;
}

memoryData.forEach((memory,index)=>{
  const number=String(index+1).padStart(2,'0');
  const layout=eaLayout[index];
  const card=document.createElement('div');
  card.className='ea-card';
  card.setAttribute('role','button');
  card.setAttribute('tabindex','0');
  card.inert=true;
  card.setAttribute('aria-hidden','true');
  card.setAttribute('aria-label','Open photo '+number+': '+memory.cap);
  card.style.top=layout.top;
  card.style.left=layout.left;

  let decoration='';
  if(layout.deco==='tape') decoration='<div class="ea-tape" aria-hidden="true"></div>';
  else if(layout.deco==='pin') decoration='<div class="ea-pin" aria-hidden="true">📍</div>';
  else decoration='<div class="ea-clip" aria-hidden="true">📎</div>';

  card.innerHTML=`
    <div class="ea-card-inner" style="--rot:${layout.rot}deg; --rot-m:${layout.rot}deg;">
      ${decoration}
      <div class="ea-num-tag">EVIDENCE #${number}</div>
      <img src="${memory.src}" alt="${memory.cap}" loading="lazy">
    </div>
    <div class="ea-cap">${memory.cap}</div>
  `;
  const open=()=>openMemoryViewer(card,memory,number);
  card.addEventListener('click',open);
  card.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}
  });
  eaBoard.appendChild(card);
});

viewerClose.addEventListener('click',closeMemoryViewer);
viewerOverlay.addEventListener('click',event=>{
  if(event.target===viewerOverlay) closeMemoryViewer();
});
document.addEventListener('keydown',event=>{
  if(!viewerOverlay.classList.contains('open')) return;
  if(event.key==='Escape'){
    event.preventDefault();
    closeMemoryViewer();
  } else if(event.key==='Tab'){
    event.preventDefault();
    viewerClose.focus();
  }
});

/* Reveal the photo archive when its slide becomes active. */
const eaHead=document.getElementById('eaHead');
const eaNext=document.getElementById('eaNext');
const slide5El=document.getElementById('slide-5');
const memoryCards=Array.from(eaBoard.children);
let evidenceTimers=[];
let evidenceIntroPlayed=false;
function clearEvidenceTimers(){
  evidenceTimers.forEach(timer=>clearTimeout(timer));
  evidenceTimers=[];
}
function playEvidenceArchiveIntro(){
  clearEvidenceTimers();
  eaHead.classList.add('show');
  memoryCards.forEach((card,index)=>{
    evidenceTimers.push(setTimeout(()=>showControl(card),motionDelay(180+index*140)));
  });
  evidenceTimers.push(setTimeout(()=>showControl(eaNext),motionDelay(1100+memoryCards.length*140)));
}
function resetEvidenceArchive(){
  clearEvidenceTimers();
  eaHead.classList.remove('show');
  memoryCards.forEach(hideControl);
  hideControl(eaNext);
}
new MutationObserver(()=>{
  const active=slide5El.classList.contains('active');
  if(active&&!evidenceIntroPlayed){
    evidenceIntroPlayed=true;
    playEvidenceArchiveIntro();
  } else if(!active&&evidenceIntroPlayed){
    evidenceIntroPlayed=false;
    resetEvidenceArchive();
  }
}).observe(slide5El,{attributes:true,attributeFilter:['class']});

/* ================= Slide 6: THE BESTIE SUPPORT DEPARTMENT ================= */
(function(){
  const slide6 = document.getElementById('slide-6');
  const board = document.getElementById('s6Board');
  const folderTab = document.getElementById('s6FolderTab');
  const classified = document.getElementById('s6Classified');
  const header = document.getElementById('s6Header');
  const summary = document.getElementById('s6Summary');
  const cards = Array.from(document.querySelectorAll('#s6EvidenceGrid .s6-card'));
  const verdictPanel = document.getElementById('s6VerdictPanel');
  const guilty = document.getElementById('s6Guilty');
  const punchline = document.getElementById('s6Punchline');
  const checking = document.getElementById('s6Checking');
  const barFill = document.getElementById('s6BarFill');
  const answer = document.getElementById('s6Answer');
  const defense = document.getElementById('s6Defense');
  const closeNote = document.getElementById('s6CloseNote');
  const cta = document.getElementById('s6Cta');

  let timers = [];
  function later(fn, ms){ timers.push(setTimeout(fn, motionDelay(ms))); }
  function clearTimers(){ timers.forEach(id=>clearTimeout(id)); timers = []; }

  function play(){
    board.classList.add('show');
    later(()=> folderTab.classList.add('show'), 120);
    later(()=> classified.classList.add('show'), 220);
    later(()=> header.classList.add('show'), 300);
    later(()=> summary.classList.add('show'), 480);
    cards.forEach((el,i)=>{ later(()=> el.classList.add('show'), 620 + i*140); });
    const cardsEnd = 620 + cards.length*140;
    later(()=> verdictPanel.classList.add('show'), cardsEnd + 150);
    later(()=> guilty.classList.add('show'), cardsEnd + 380);
    later(()=> punchline.classList.add('show'), cardsEnd + 650);
    later(()=> checking.classList.add('show'), cardsEnd + 800);
    later(()=> barFill.style.width = '100%', cardsEnd + 850);
    later(()=> answer.classList.add('show'), cardsEnd + 1900);
    later(()=> defense.classList.add('show'), cardsEnd + 2200);
    later(()=> closeNote.classList.add('show'), cardsEnd + 2500);
    later(()=> showControl(cta), cardsEnd + 2750);
  }

  function reset(){
    clearTimers();
    board.classList.remove('show');
    folderTab.classList.remove('show');
    classified.classList.remove('show');
    header.classList.remove('show');
    summary.classList.remove('show');
    cards.forEach(el=> el.classList.remove('show'));
    verdictPanel.classList.remove('show');
    guilty.classList.remove('show');
    punchline.classList.remove('show');
    checking.classList.remove('show');
    barFill.style.width = '0%';
    answer.classList.remove('show');
    defense.classList.remove('show');
    closeNote.classList.remove('show');
    hideControl(cta);
  }

  let played = false;
  new MutationObserver(()=>{
    if(slide6.classList.contains('active')){
      if(!played){ played = true; play(); }
    } else if(played){
      played = false; reset();
    }
  }).observe(slide6, { attributes:true, attributeFilter:['class'] });
  if(slide6.classList.contains('active')){ played = true; play(); }
})();

/* ================= Slide 7: envelope + letter ================= */
/* ================= Slide 7: A LETTER FOR YOU ================= */
(function(){
  const slide7 = document.getElementById('slide-7');
  const envelopeWrap = document.getElementById('s7EnvelopeWrap');
  const hint = document.getElementById('s7Hint');
  const actions = document.getElementById('s7EnvelopeActions');
  const readBtn = document.getElementById('s7ReadBtn');
  const paperWrap = document.getElementById('s7PaperWrap');
  const paper = document.getElementById('s7Paper');
  const salutation = document.getElementById('s7Salutation');
  const bodyEl = document.getElementById('s7Body');
  const signatureEl = document.getElementById('s7Signature');
  const backBtn = document.getElementById('s7BackBtn');
  const backFooter = document.getElementById('s7BackFooter');
  const stickers = Array.from(document.querySelectorAll('#slide-7 .s7-sticker'));

  const letterText = [
   "Dear Vanshika,",
   "It was really nice meeting you at the volunteering event. The first day was mostly casual chit-chat, but on the second day we exchanged numbers and Instagram, and I am glad we did. It is funny how a couple of days volunteering turned into such a nice new friendship.",
   "I have enjoyed our online games and getting to know you a little more. Those little conversations and fun moments have made staying in touch really nice. I hope we get more chances to hang out, laugh, and make good memories together as friends.",
   "I hope your birthday brings you lots of happiness, laughter, and all the things you enjoy most. You deserve a year full of good moments, exciting opportunities, and plenty of reasons to smile. Wishing you the happiest birthday and all the best for the year ahead!",
   "- Your friend, Armaan Bishnoi"
  ];

  const bodyLines = letterText.slice(1, -1);
  const signatureLine = letterText[letterText.length - 1];
  signatureEl.textContent = signatureLine;

  const paragraphEls = bodyLines.map(line=>{
    const p = document.createElement('p');
    p.textContent = line;
    bodyEl.appendChild(p);
    return p;
  });

  let timers = [];
  function later(fn, ms){ timers.push(setTimeout(fn, motionDelay(ms))); }
  function clearTimers(){ timers.forEach(id=>clearTimeout(id)); timers = []; }

  function openEnvelope(){
    if(envelopeWrap.classList.contains('open')) return;
    envelopeWrap.classList.add('open');
    envelopeWrap.setAttribute('aria-expanded','true');
    hint.classList.add('hide');
    hint.setAttribute('aria-hidden','true');
    later(()=>{ showControl(actions); readBtn.focus(); }, 650);
  }

  function showLetter(){
    envelopeWrap.classList.add('hide');
    envelopeWrap.inert=true;
    envelopeWrap.setAttribute('aria-hidden','true');
    hint.classList.add('hide');
    hint.setAttribute('aria-hidden','true');
    hideControl(actions);

    paperWrap.inert=false;
    paperWrap.setAttribute('aria-hidden','false');
    paperWrap.classList.add('active');
    paper.scrollTop = 0;
    paper.classList.add('show');
    later(()=>{ salutation.classList.add('show'); salutation.focus(); }, 500);
    paragraphEls.forEach((el,i)=>{ later(()=> el.classList.add('show'), 750 + i*260); });
    const bodyEnd = 750 + paragraphEls.length*260;
    stickers.forEach((el,i)=>{ later(()=> el.classList.add('show'), 300 + i*180); });
    later(()=> signatureEl.classList.add('show'), bodyEnd + 250);
    later(()=>{ backFooter.inert=false; backFooter.setAttribute('aria-hidden','false'); backBtn.classList.add('show'); }, bodyEnd + 700);
  }

  function backToEnvelope(){
    clearTimers();
    paperWrap.classList.remove('active');
    paperWrap.inert=true;
    paperWrap.setAttribute('aria-hidden','true');
    paper.classList.remove('show');
    salutation.classList.remove('show');
    paragraphEls.forEach(el=> el.classList.remove('show'));
    stickers.forEach(el=> el.classList.remove('show'));
    signatureEl.classList.remove('show');
    backBtn.classList.remove('show');

    envelopeWrap.classList.remove('hide');
    envelopeWrap.inert=false;
    envelopeWrap.setAttribute('aria-hidden','false');
    showControl(actions);
    readBtn.focus();
  }

  function resetAll(){
    clearTimers();
    envelopeWrap.classList.remove('open');
    envelopeWrap.setAttribute('aria-expanded','false');
    envelopeWrap.inert=false;
    envelopeWrap.setAttribute('aria-hidden','false');
    envelopeWrap.classList.remove('hide');
    hint.classList.remove('hide');
    hint.setAttribute('aria-hidden','false');
    hint.textContent = 'tap the envelope';
    hideControl(actions);
    paperWrap.classList.remove('active');
    paperWrap.inert=true;
    paperWrap.setAttribute('aria-hidden','true');
    paper.classList.remove('show');
    salutation.classList.remove('show');
    paragraphEls.forEach(el=> el.classList.remove('show'));
    stickers.forEach(el=> el.classList.remove('show'));
    signatureEl.classList.remove('show');
    backBtn.classList.remove('show');
  }

  envelopeWrap.addEventListener('click', openEnvelope);
  envelopeWrap.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();openEnvelope();}
  });
  readBtn.addEventListener('click', showLetter);
  backBtn.addEventListener('click', backToEnvelope);

  let wasActive = false;
  new MutationObserver(()=>{
    const isActive = slide7.classList.contains('active');
    if(isActive && !wasActive){ resetAll(); }
    wasActive = isActive;
  }).observe(slide7, { attributes:true, attributeFilter:['class'] });
  resetAll();
})();

/* ================= Slide 8: THE THINGS I HOPE FOR YOU ================= */
(function(){
  const slide8 = document.getElementById('slide-8');
  const header = document.getElementById('s8Header');
  const centerpiece = document.getElementById('s8Centerpiece');
  const notes = Array.from(document.querySelectorAll('#s8Notes .s8-note'));
  const ending = document.getElementById('s8Ending');
  const cta = document.getElementById('s8Cta');

  let timers = [];
  function later(fn, ms){ timers.push(setTimeout(fn, motionDelay(ms))); }
  function clearTimers(){ timers.forEach(id=>clearTimeout(id)); timers = []; }

  function play(){
    later(()=> header.classList.add('show'), 150);
    later(()=> centerpiece.classList.add('show'), 500);
    notes.forEach((el,i)=>{ later(()=> el.classList.add('show'), 850 + i*220); });
    const notesEnd = 850 + notes.length*220;
    later(()=> ending.classList.add('show'), notesEnd + 300);
    later(()=> showControl(cta), notesEnd + 650);
  }

  function reset(){
    clearTimers();
    header.classList.remove('show');
    centerpiece.classList.remove('show');
    notes.forEach(el=> el.classList.remove('show'));
    ending.classList.remove('show');
    hideControl(cta);
  }

  let played = false;
  new MutationObserver(()=>{
    if(slide8.classList.contains('active')){
      if(!played){ played = true; play(); }
    } else if(played){
      played = false; reset();
    }
  }).observe(slide8, { attributes:true, attributeFilter:['class'] });
  if(slide8.classList.contains('active')){ played = true; play(); }
})();

/* Birthday escape room */
(function(){
  const slide = document.getElementById('slide-game');
  const introPanel = document.getElementById('birthdayGameIntro');
  const playPanel = document.getElementById('birthdayGamePlay');
  const wonPanel = document.getElementById('birthdayGameWon');
  const overPanel = document.getElementById('birthdayGameOver');
  const panels = [introPanel, playPanel, wonPanel, overPanel];
  const startButton = document.getElementById('birthdayGameStart');
  const retryButton = document.getElementById('birthdayGameRetry');
  const replayWonButton = document.getElementById('birthdayGameReplayWon');
  const progress = document.getElementById('birthdayGameProgress');
  const timer = document.getElementById('birthdayGameTimer');
  const status = document.getElementById('birthdayGameStatus');
  const hint = document.getElementById('birthdayGameHint');
  const hintButton = document.getElementById('birthdayGameHintButton');
  const pauseButton = document.getElementById('birthdayGamePause');
  const memoryGrid = document.getElementById('birthdayMemoryGrid');
  const memoryCards = Array.from(memoryGrid.querySelectorAll('.bday-memory-card'));
  const puzzlePanels = [
    document.getElementById('birthdayPuzzlePairs'),
    document.getElementById('birthdayPuzzleSequence'),
    document.getElementById('birthdayPuzzleRiddle')
  ];
  const puzzleTitles = [
    document.getElementById('birthdayPairsTitle'),
    document.getElementById('birthdaySequenceTitle'),
    document.getElementById('birthdayRiddleTitle')
  ];
  let secondsLeft = 90;
  let timerId = null;
  let mismatchId = null;
  let currentPuzzle = 0;
  let matchedPairs = 0;
  let flippedCards = [];
  let manuallyPaused = false;
  let gameStarted = false;

  function showPanel(activePanel){
    panels.forEach(panel=>{
      const hidden = panel !== activePanel;
      panel.hidden = hidden;
      panel.inert = hidden;
      panel.setAttribute('aria-hidden', String(hidden));
    });
  }

  function showPuzzle(index){
    currentPuzzle = index;
    puzzlePanels.forEach((panel,panelIndex)=>{ panel.hidden = panelIndex !== index; });
    progress.textContent = 'Puzzle ' + (index + 1) + ' of 3';
    hint.textContent = '';
    status.textContent = index === 0 ? 'Find all four matching pairs.' : 'Solve the clue to continue.';
    puzzleTitles[index].focus();
  }

  function updateTimer(){
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = String(secondsLeft % 60).padStart(2, '0');
    timer.textContent = minutes + ':' + seconds;
    timer.setAttribute('aria-label', 'Time remaining: ' + minutes + ' minutes ' + seconds + ' seconds');
  }

  function stopTimer(){
    if(timerId !== null){
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function syncTimer(){
    const canRun = gameStarted && !manuallyPaused && !document.hidden && slide.classList.contains('active') && !playPanel.hidden;
    if(!canRun){ stopTimer(); return; }
    if(timerId !== null) return;
    timerId = window.setInterval(()=>{
      secondsLeft -= 1;
      updateTimer();
      if(secondsLeft <= 0){
        stopTimer();
        gameStarted = false;
        window.clearTimeout(mismatchId);
        showPanel(overPanel);
        overPanel.querySelector('h2').focus();
      }
    }, 1000);
  }

  function shuffleMemoryCards(){
    const positions = memoryCards.map((_,index)=>index);
    for(let index=positions.length-1;index>0;index--){
      const randomIndex=Math.floor(Math.random()*(index+1));
      [positions[index],positions[randomIndex]]=[positions[randomIndex],positions[index]];
    }
    positions.forEach((position,index)=>{ memoryGrid.appendChild(memoryCards[position]); });
  }

  function resetMemoryCards(){
    window.clearTimeout(mismatchId);
    flippedCards=[];
    matchedPairs=0;
    memoryCards.forEach(card=>{
      card.classList.remove('is-revealed','is-matched');
      card.disabled=false;
      card.textContent='?';
      card.setAttribute('aria-label','Hidden party card');
    });
    shuffleMemoryCards();
  }

  function startGame(){
    stopTimer();
    gameStarted=true;
    manuallyPaused=false;
    pauseButton.textContent='Pause';
    pauseButton.setAttribute('aria-pressed','false');
    secondsLeft=90;
    updateTimer();
    resetMemoryCards();
    puzzlePanels.forEach((panel,index)=>{ panel.hidden=index!==0; });
    showPanel(playPanel);
    showPuzzle(0);
    syncTimer();
  }

  function finishPuzzle(){
    if(currentPuzzle===puzzlePanels.length-1){
      stopTimer();
      gameStarted=false;
      showPanel(wonPanel);
      wonPanel.querySelector('h2').focus();
      return;
    }
    showPuzzle(currentPuzzle+1);
  }

  function flipCard(card){
    if(card.disabled || card.classList.contains('is-revealed') || flippedCards.length===2 || !gameStarted || manuallyPaused) return;
    card.classList.add('is-revealed');
    card.textContent=card.dataset.name;
    card.setAttribute('aria-label', card.dataset.name);
    flippedCards.push(card);
    if(flippedCards.length!==2) return;

    const [first,second]=flippedCards;
    if(first.dataset.name===second.dataset.name){
      first.classList.add('is-matched');
      second.classList.add('is-matched');
      first.disabled=true;
      second.disabled=true;
      matchedPairs+=1;
      flippedCards=[];
      status.textContent='Match found. ' + matchedPairs + ' of 4 pairs.';
      if(matchedPairs===4) finishPuzzle();
      return;
    }

    status.textContent='Not a match. Try another pair.';
    mismatchId=window.setTimeout(()=>{
      [first,second].forEach(mismatched=>{
        mismatched.classList.remove('is-revealed');
        mismatched.textContent='?';
        mismatched.setAttribute('aria-label','Hidden party card');
      });
      flippedCards=[];
    }, 850);
  }

  function answerPuzzle(event){
    const answerButton=event.target.closest('[data-answer]');
    if(!answerButton || !gameStarted || manuallyPaused) return;
    const correctAnswer=currentPuzzle===1 ? '12' : 'Gift';
    if(answerButton.dataset.answer===correctAnswer){
      status.textContent='That is right. The next puzzle is ready.';
      finishPuzzle();
    } else {
      status.textContent='Not quite. Try another answer.';
    }
  }

  function togglePause(){
    if(!gameStarted) return;
    manuallyPaused=!manuallyPaused;
    pauseButton.textContent=manuallyPaused ? 'Resume' : 'Pause';
    pauseButton.setAttribute('aria-pressed', String(manuallyPaused));
    status.textContent=manuallyPaused ? 'Game paused.' : 'Clock resumed.';
    syncTimer();
  }

  startButton.addEventListener('click', startGame);
  retryButton.addEventListener('click', startGame);
  replayWonButton.addEventListener('click', startGame);
  memoryCards.forEach(card=>card.addEventListener('click',()=>flipCard(card)));
  puzzlePanels[1].addEventListener('click',answerPuzzle);
  puzzlePanels[2].addEventListener('click',answerPuzzle);
  hintButton.addEventListener('click',()=>{ hint.textContent=puzzlePanels[currentPuzzle].dataset.hint; });
  pauseButton.addEventListener('click',togglePause);
  document.addEventListener('visibilitychange',syncTimer);
  new MutationObserver(syncTimer).observe(slide,{attributes:true,attributeFilter:['class']});
})();

/* ================= Music toggle ================= */
const musicToggle = document.getElementById('musicToggle');
const bgm = document.getElementById('bgm');
bgm.addEventListener('error',()=>musicToggle.classList.add('hidden'));
bgm.addEventListener('play',()=>{
  musicToggle.classList.remove('is-muted');
  musicToggle.setAttribute('aria-label','Pause music');
  musicToggle.setAttribute('aria-pressed','true');
});
bgm.addEventListener('pause',()=>{
  musicToggle.classList.add('is-muted');
  musicToggle.setAttribute('aria-label','Play music');
  musicToggle.setAttribute('aria-pressed','false');
});
musicToggle.addEventListener('click',()=>{
  if(!bgm.paused){
    bgm.pause();
    return;
  }
  const playback=bgm.play();
  if(playback&&playback.catch){
    playback.catch(()=>{
      musicToggle.classList.add('is-muted');
      musicToggle.setAttribute('aria-label','Play music');
      musicToggle.setAttribute('aria-pressed','false');
    });
  }
});
