// ---- YOUR IMAGES (run embed_assets.py --images images/ to fill this block, or paste URLs by hand) ----
/*IMAGES_START*/
const STICKERS = {   // the 4 icons (path inside your images folder)
  projects:'images/projects.png', about:'images/about.png',
  team:'images/team.png', skills:'images/skills.png'
};
const CLOVER = {     // clover: normal + one image per hovered leaf
  original:'images/clover.png',
  projects:'images/clover_projects.png', about:'images/clover_about.png',
  team:'images/clover_team.png', skills:'images/clover_skills.png'
};
/*IMAGES_END*/
// (leave CLOVER.original empty to keep the drawn clover)
const EMOJI = {projects:'🧑‍💻', about:'🐰', team:'🐾', skills:'🐸'};   // shown if an image is missing
function fillIcon(box, k){
  box.textContent = '';
  if (!STICKERS[k]) { box.textContent = EMOJI[k]; return; }
  const im = new Image(); im.alt = ''; im.src = STICKERS[k];
  im.onerror = () => { box.textContent = EMOJI[k]; };
  box.appendChild(im);
}
document.querySelectorAll('.sticker').forEach(s => fillIcon(s.querySelector('.float'), s.dataset.sec));
document.querySelectorAll('[data-st]').forEach(t => fillIcon(t, t.dataset.st));

const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const touch = matchMedia('(hover:none)').matches;

// ---- clover: gentle sway + pulse (eases still while a leaf is hovered) ----
const svg = document.getElementById('cl');
let curAngle = 0, amp = 14, ampTarget = 14, last = performance.now(), hovering = 0;
function tick(now){
  const dt = Math.min(now - last, 50); last = now;
  ampTarget = hovering ? 0 : 14;
  amp += (ampTarget - amp) * Math.min(1, dt * 0.005);
  const a = reduce ? 0 : Math.sin(now / 1800) * amp;
  const p = reduce ? 1 : 1 + Math.sin(now / 900) * 0.03 * (amp / 14);
  curAngle = a; svg.style.transform = 'rotate(' + a + 'deg) scale(' + p + ')';
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---- hover: dialog + pink leaf ----
const leaf = s => document.querySelector('.leaf[data-sec="' + s + '"]');
const zone = s => document.querySelector('.zone[data-sec="' + s + '"]');
const stk = s => document.querySelector('.sticker[data-sec="' + s + '"]');
function show(sec, on){
  leaf(sec).classList.toggle('on', on);
  stk(sec).querySelector('.bubble').classList.toggle('show', on);
  hovering += on ? 1 : -1; if (hovering < 0) hovering = 0;
}
const shown = {};
function set(sec, on){ if (!!shown[sec] === on) return; shown[sec] = on; show(sec, on); refreshClover(); }
// clover images: original, swapped for the hovered leaf's image
let imgMode = !!CLOVER.original;
const cimg = document.getElementById('cimg');
if (imgMode){
  document.getElementById('clover').classList.add('imgmode');
  ['original','projects','about','team','skills'].forEach(k => {
    const im = document.createElement('img'); im.alt = ''; im.dataset.k = k;
    im.src = CLOVER[k] || CLOVER.original;
    // if an image can't load: drawn clover (original) / original image (hover)
    im.onerror = k === 'original'
      ? () => { imgMode = false; document.getElementById('clover').classList.remove('imgmode'); }
      : () => { im.onerror = null; im.src = CLOVER.original; };
    cimg.appendChild(im);
  });
  cimg.querySelector('[data-k="original"]').classList.add('act');
}
function refreshClover(){
  if (!imgMode) return;
  const k = ['projects','about','team','skills'].find(x => shown[x]) || 'original';
  cimg.querySelectorAll('img').forEach(i => i.classList.toggle('act', i.dataset.k === k));
}
['projects','about','team','skills'].forEach(sec => {
  [zone(sec), stk(sec)].forEach(el => {
    el.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') set(sec, true); });
    el.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') set(sec, false); });
    el.addEventListener('focus', () => set(sec, true));
    el.addEventListener('blur', () => set(sec, false));
    el.addEventListener('click', () => {
      // on touch screens: first tap shows the dialog, second tap goes
      if (touch && !shown[sec]) { ['projects','about','team','skills'].forEach(o => set(o, o === sec)); return; }
      go(sec, el);
    });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(sec, el); } });
  });
});

// ---- click: the thing grows bigger and bigger, then jump to the section ----
let busy = false;
const ORIGIN = {projects:[-.25,-.25], about:[.25,-.25], team:[-.25,.25], skills:[.25,.25]};
function go(sec, el){
  if (busy) return;
  const target = document.getElementById(sec);
  if (true) { target.scrollIntoView(); history.replaceState(null, '', '#' + sec); return; }
  busy = true;
  const isLeaf = el.classList.contains('zone');
  const useImg = isLeaf && imgMode;
  const src = useImg ? document.getElementById('clover') : (isLeaf ? leaf(sec) : el);
  const r = src.getBoundingClientRect();
  const size = Math.max(r.width, r.height);
  const veil = document.createElement('div'); veil.className = 'veil';
  const bg = document.createElement('div');
  bg.style.cssText = 'position:absolute;inset:0;opacity:0;background:' + (isLeaf ? 'var(--pink)' : 'var(--bg)');
  const g = document.createElement('div'); g.className = 'grow';
  g.style.cssText = 'left:' + (r.left + r.width / 2) + 'px;top:' + (r.top + r.height / 2) + 'px;width:' + size + 'px;height:' + size + 'px';
  let rot = 0, k = Math.max(innerWidth, innerHeight) / size * 3.2;
  if (useImg) {
    const o = ORIGIN[sec]; rot = curAngle;
    g.style.transformOrigin = (50 + o[0] * 100) + '% ' + (50 + o[1] * 100) + '%';
    g.innerHTML = '<img alt="" src="' + (CLOVER[sec] || CLOVER.original) + '" style="width:100%;height:100%;object-fit:contain">';
    k = Math.hypot(innerWidth, innerHeight) * 2.5 / (size * 0.45);
  } else if (isLeaf) {
    const bb = src.getBBox();
    g.innerHTML = '<svg viewBox="' + [bb.x, bb.y, bb.width, bb.height].join(' ') + '">' + src.innerHTML + '</svg>';
  } else {
    g.innerHTML = el.querySelector('.float').innerHTML;
    g.style.fontSize = (size * 0.7) + 'px';
  }
  veil.append(bg, g); document.body.appendChild(veil);
  bg.animate([{opacity:0},{opacity:0,offset:.45},{opacity:1}], {duration:1100, easing:'ease-in', fill:'forwards'});
  g.animate([{transform:'translate(-50%,-50%) rotate(' + rot + 'deg) scale(1)'},
             {transform:'translate(-50%,-50%) rotate(' + rot + 'deg) scale(' + k + ')'}],
    {duration:1100, easing:'cubic-bezier(.6,0,.9,.5)', fill:'forwards'}).finished.then(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    scrollTo(0, target.offsetTop);
    document.documentElement.style.scrollBehavior = '';
    history.replaceState(null, '', '#' + sec);
    return veil.animate([{opacity:1},{opacity:0}], {duration:600, easing:'ease-out', fill:'forwards'}).finished;
  }).then(() => { veil.remove(); busy = false; });
}

// make each bubble match its drawing's proportions (no stretching)
document.querySelectorAll('.sticker').forEach(s => {
  const b = s.querySelector('.bubble'), im = new Image();
  im.onload = () => { b.style.aspectRatio = im.naturalWidth + ' / ' + im.naturalHeight; };
  im.src = 'images/' + s.dataset.sec + '-bubble.png';
});

// ---- back to top button ----
const up = document.getElementById('up');
addEventListener('scroll', () => up.classList.toggle('vis', scrollY > innerHeight * 0.6), {passive:true});
up.addEventListener('click', () => scrollTo({top:0}));


// ---- top bar + sidebar ----
const root = document.documentElement;
const sideBtn = document.getElementById('sideBtn');
const sideEl = document.getElementById('side');
function setSide(open){
  root.classList.toggle('side-open', open);
  sideBtn.setAttribute('aria-expanded', open);
  sideEl.setAttribute('aria-hidden', !open);
  (open ? document.getElementById('sideClose') : sideBtn).focus({preventScroll:true});
}
sideBtn.addEventListener('click', () => setSide(true));
document.getElementById('sideClose').addEventListener('click', () => setSide(false));
document.getElementById('scrim').addEventListener('click', () => setSide(false));
addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('side-open')) setSide(false); });
sideEl.querySelectorAll('nav a[href^="#"]').forEach(a => a.addEventListener('click', () => setSide(false)));

// highlight the section you are on
const sideLinks = [...sideEl.querySelectorAll('nav a[data-t]')];
const sideIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) sideLinks.forEach(a => a.classList.toggle('act', a.dataset.t === e.target.id)); });
}, { rootMargin: '-45% 0px -45% 0px' });
sideLinks.forEach(a => sideIO.observe(document.getElementById(a.dataset.t)));

