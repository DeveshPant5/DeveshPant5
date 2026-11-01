#!/usr/bin/env node
// Builds every animated SVG used by README.md into ./assets.
// No dependencies. Edit the data below, then run:  node scripts/build-assets.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ─── design tokens ──────────────────────────────────────────────────────────
const C = {
  bg0: '#03050c', bg1: '#070b18', panel: '#0a1022', panel2: '#0d1530',
  line: '#1a2644', lineHi: '#2a3a63',
  text: '#e6edf7', text2: '#9aa8c0', text3: '#5d6b86',
  cyan: '#22d3ee', cyanHi: '#67e8f9', ice: '#e0faff',
  violet: '#8b5cf6', violetHi: '#a78bfa',
  pink: '#f472b6', green: '#34d399', amber: '#fbbf24', blue: '#60a5fa',
};
const MONO = `'JetBrains Mono','Fira Code','SF Mono',SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace`;
const SANS = `'Inter','Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif`;
const MONO_W = 0.6; // advance width of a monospace glyph, in em

// ─── content ────────────────────────────────────────────────────────────────
const PROFILE = {
  pill: 'ONLINE · BUILDING AT KUMI LABS',
  role: 'Full Stack Developer',
  tagline: 'building AI products that ship',
  phrases: [
    'shipping Flutter · React · FastAPI · Node.js',
    'grounding LLMs in real documents with RAG',
    'crafting premium UI with obsessive micro-interactions',
    'building SaaS products at Kumi Labs',
  ],
  chips: ['Flutter', 'React', 'FastAPI', 'Node.js', 'PostgreSQL', 'RAG + LLMs'],
};

const PROJECTS = [
  {
    slug: 'counselix', accent: C.cyan, icon: 'chat', tag: 'AI · EDTECH', pill: 'LIVE', live: true,
    title: 'Counselix', subtitle: 'AI COUNSELLOR',
    desc: ['Reads a student’s profile, goals and constraints,', 'then returns guidance that actually fits — built', 'to feel like a session, not a chatbot dump.'],
    stack: ['React', 'Node.js', 'PostgreSQL', 'Groq', 'Tailwind'],
    cta: '↗ LIVE ON MAPORTT.NETLIFY.APP',
  },
  {
    slug: 'rag-engine', accent: C.violetHi, icon: 'docs', tag: 'AI · INFRA', pill: 'POWERS COUNSELIX',
    title: 'RAG Knowledge Engine', subtitle: 'GROUNDED GENERATION',
    desc: ['Grounds counsellor answers in verified documents', 'instead of model memory. Chunk → embed →', 'retrieve → generate, with FastAPI in the middle.'],
    stack: ['FastAPI', 'Embeddings', 'PostgreSQL', 'MongoDB', 'Node.js'],
    cta: 'RETRIEVAL FIRST · GENERATION SECOND · HALLUCINATIONS LAST',
  },
  {
    slug: 'lalit', accent: C.pink, icon: 'voice', tag: 'AI · VOICE', pill: 'VOICE-FIRST',
    title: 'Lalit', subtitle: 'AI VOICE ASSISTANT',
    desc: ['Voice-first assistant: intent, context and a', 'product loop that talks back. Same AI thread as', 'Counselix — less dashboard, more conversation.'],
    stack: ['Python', 'FastAPI', 'Speech', 'LLM orchestration'],
    cta: '↗ SOURCE · LALIT-major',
  },
  {
    slug: 'session-booking', accent: C.green, icon: 'calendar', tag: 'FULL STACK', pill: 'FRONT + BACK',
    title: 'Session Booking', subtitle: 'SCHEDULING PLATFORM',
    desc: ['End-to-end booking product: a calendar flow on', 'the frontend, session APIs on the backend. A real', 'scheduling surface, not a form demo.'],
    stack: ['React', 'TypeScript', 'Node.js'],
    cta: '↗ SOURCE · sessionbookingfront',
  },
  {
    slug: 'thrift', accent: C.amber, icon: 'tag', tag: 'MOBILE · COMMERCE', pill: 'APP + API',
    title: 'Thrift Marketplace', subtitle: 'CROSS-PLATFORM COMMERCE',
    desc: ['Cross-platform thrift commerce — listings, auth', 'and a Flutter client talking to a Node backend.', 'Built for people who buy and sell, not scroll.'],
    stack: ['Flutter', 'Node.js', 'MongoDB'],
    cta: '↗ SOURCE · Thrift-app-front-end-',
  },
  {
    slug: 'quick-commerce', accent: C.blue, icon: 'bolt', tag: 'MOBILE · Q-COMMERCE', pill: 'B2C',
    title: 'Quick Commerce', subtitle: 'B2C GROCERY APP',
    desc: ['Blinkit-style grocery experience in Flutter —', 'catalog, cart and the speed-obsessed UX that', 'quick commerce lives or dies on.'],
    stack: ['Flutter', 'Dart'],
    cta: '↗ SOURCE · internship-assignment-B2C',
  },
];

const STACK = [
  { label: 'LANGUAGES', accent: C.cyan, items: ['Dart', 'TypeScript', 'JavaScript', 'Python', 'C++'] },
  { label: 'MOBILE & WEB', accent: C.violetHi, items: ['Flutter', 'React', 'Tailwind CSS', 'HTML5', 'CSS3'] },
  { label: 'BACKEND & APIS', accent: C.green, items: ['FastAPI', 'Node.js', 'Express', 'REST APIs'] },
  { label: 'DATA', accent: C.amber, items: ['PostgreSQL', 'MongoDB', 'Redis', 'Firebase'] },
  { label: 'AI', accent: C.pink, items: ['RAG pipelines', 'Embeddings', 'LLM orchestration', 'Groq'] },
  { label: 'CLOUD & TOOLS', accent: C.blue, items: ['Docker', 'AWS', 'Git', 'Linux', 'Figma'] },
];

const SECTIONS = [
  ['01-about', 'ABOUT ME', 'who I am · what I build'],
  ['02-work', 'FEATURED WORK', 'selected builds, shipped end to end'],
  ['03-stack', 'TECH STACK', 'the tools I reach for'],
  ['04-telemetry', 'GITHUB TELEMETRY', 'live stats, regenerated daily'],
  ['05-grid', 'CONTRIBUTION GRID', 'watch the snake eat my commits'],
  ['06-connect', 'CONNECT', 'open a channel'],
];

const BUTTONS = [
  { slug: 'github', label: 'GITHUB', sub: '@DeveshPant5', accent: C.text, icon: 'branch' },
  { slug: 'linkedin', label: 'LINKEDIN', sub: 'devesh-pant', accent: C.blue, icon: 'in' },
  { slug: 'portfolio', label: 'PORTFOLIO', sub: 'maportt.netlify.app', accent: C.cyan, icon: 'globe' },
  { slug: 'email', label: 'EMAIL', sub: 'dev.deveshpant@gmail.com', accent: C.pink, icon: 'mail' },
];

// ─── helpers ────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const f = (n) => +n.toFixed(2);

function rng(seed) { // mulberry32 — deterministic output between builds
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function doc(w, h, title, defs, body, css = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="svg-title">
<title id="svg-title">${esc(title)}</title>
<style>.m{font-family:${MONO}}.s{font-family:${SANS}}${css}</style>
<defs>${defs}</defs>
${body}
</svg>
`;
}

function write(rel, svg) {
  const p = join(ROOT, 'assets', rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, svg.replace(/\n\s*\n/g, '\n'));
  console.log('  wrote assets/' + rel);
}

// Monospace text forced to an exact width, so layout never depends on which font the viewer has.
function mono(x, y, str, size, fill, attrs = '', track = 1) {
  const w = f(str.length * size * MONO_W * track);
  return `<text x="${x}" y="${y}" class="m" font-size="${size}" fill="${fill}" textLength="${w}" lengthAdjust="${track === 1 ? 'spacingAndGlyphs' : 'spacing'}" ${attrs}>${esc(str)}</text>`;
}
const monoWidth = (str, size) => str.length * size * MONO_W;

// One-shot reveal that starts at t=0 (so non-animating renderers show the final state).
function reveal(attr, from, to, begin, dur, spline = '0.4 0 0.2 1') {
  const total = begin + dur;
  return `<animate attributeName="${attr}" values="${from};${from};${to}" keyTimes="0;${(begin / total).toFixed(4)};1" dur="${total.toFixed(3)}s" calcMode="spline" keySplines="0 0 1 1;${spline}" fill="freeze"/>`;
}

function keyframes(points, total) {
  const out = [];
  for (const [t, v] of points) {
    if (out.length && Math.abs(out[out.length - 1][0] - t) < 1e-6) { out[out.length - 1] = [t, v]; continue; }
    out.push([t, v]);
  }
  return `values="${out.map((p) => f(p[1])).join(';')}" keyTimes="${out.map((p) => (p[0] / total).toFixed(4)).join(';')}"`;
}

const glowFilter = (id, sd = 4, k = 1) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="${sd}" result="b"/><feComponentTransfer in="b" result="bb"><feFuncA type="linear" slope="${k}"/></feComponentTransfer><feMerge><feMergeNode in="bb"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

const brackets = (x0, y0, x1, y1, len, color, sw = 2, op = 0.8) => `<g stroke="${color}" stroke-width="${sw}" fill="none" opacity="${op}" stroke-linecap="square">
<path d="M${x0} ${y0 + len}V${y0}H${x0 + len}"/><path d="M${x1 - len} ${y0}H${x1}V${y0 + len}"/>
<path d="M${x1} ${y1 - len}V${y1}H${x1 - len}"/><path d="M${x0 + len} ${y1}H${x0}V${y1 - len}"/></g>`;

const hex = (r, rot = -90) => Array.from({ length: 6 }, (_, i) => {
  const a = ((rot + i * 60) * Math.PI) / 180;
  return `${f(r * Math.cos(a))},${f(r * Math.sin(a))}`;
}).join(' ');

// Chamfered panel outline: top-right and bottom-left corners cut, the others rounded.
function chamfer(w, h, c, r = 14, i = 0.75) {
  return `M${r + i} ${i}H${w - c - i}L${w - i} ${c + i}V${h - r - i}Q${w - i} ${h - i} ${w - r - i} ${h - i}H${c + i}L${i} ${h - c - i}V${r + i}Q${i} ${i} ${r + i} ${i}Z`;
}

// Glyphs for the wordmark: stroke centre-lines in a 44×60 box, stroke width 8.
const GLYPHS = {
  D: ['M4 4H30L40 14V46L30 56H4Z'],
  E: ['M44 4H4V56H44', 'M4 30H36'],
  V: ['M4 0V36L22 54L40 36V0'],
  S: ['M44 4H14L4 14V22L12 30H32L40 38V46L30 56H0'],
  H: ['M4 0V60', 'M40 0V60', 'M4 30H40'],
  P: ['M4 60V4H30L40 14V24L30 34H4'],
  A: ['M4 60V18L18 4H26L40 18V60', 'M4 38H40'],
  N: ['M4 60V4H12L32 56H40V0'],
  T: ['M0 4H44', 'M22 4V60'],
};

function wordmark(text, advance = 58, space = 40) {
  let x = 0, letter = 0;
  const strokes = [];
  for (const ch of text) {
    if (ch === ' ') { x += space; continue; }
    GLYPHS[ch].forEach((d, j) => strokes.push({ d, x, letter, j }));
    x += advance; letter++;
  }
  return { strokes, width: x - (advance - 44) };
}

function chipRow(items, x, y, { size = 13, h = 30, pad = 14, gap = 10, accent, textFill = C.text, rx = 8 }) {
  let cx = x;
  const parts = items.map((it) => {
    const tw = monoWidth(it, size);
    const w = tw + pad * 2;
    const g = `<g transform="translate(${f(cx)} ${y})"><rect x=".5" y=".5" width="${f(w - 1)}" height="${h - 1}" rx="${rx}" fill="${accent}" fill-opacity=".07" stroke="${accent}" stroke-opacity=".4"/>${mono(pad, f(h / 2 + size * 0.35), it, size, textFill)}</g>`;
    cx += w + gap;
    return g;
  });
  return { svg: parts.join(''), width: cx - gap - x };
}

// ─── hero ───────────────────────────────────────────────────────────────────
function hero() {
  const W = 1200, H = 480, HZ = 380;
  const rnd = rng(11);

  let stars = '';
  for (let i = 0; i < 70; i++) {
    const x = f(rnd() * W), y = f(rnd() * (HZ - 30)), r = f(0.5 + rnd() * 1.1), o = f(0.2 + rnd() * 0.55);
    const tw = i % 4 === 0 ? `<animate attributeName="opacity" values="${o};0.05;${o}" dur="${f(2 + rnd() * 4)}s" begin="${f(rnd() * 4)}s" repeatCount="indefinite"/>` : '';
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#cfe9ff" opacity="${o}">${tw}</circle>`;
  }

  // perspective floor
  const VPY = 300;
  let vlines = '';
  for (let i = -16; i <= 16; i++) {
    const xb = 600 + i * 90, xt = 600 + (i * 90 * (HZ - VPY)) / (H - VPY);
    vlines += `<line x1="${f(xt)}" y1="${HZ}" x2="${xb}" y2="${H}"/>`;
  }
  let hlines = '';
  const NL = 7, DL = 4.2;
  for (let k = 0; k < NL; k++) {
    const b = f((-DL * k) / NL);
    const a = (attr) => `<animate attributeName="${attr}" values="${HZ};${H}" dur="${DL}s" begin="${b}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines="0.6 0 0.95 0.6"/>`;
    hlines += `<line x1="0" x2="${W}" y1="${HZ}" y2="${HZ}">${a('y1')}${a('y2')}</line>`;
  }

  // neon wordmark
  const NAME_X = 70, NAME_Y = 140, NAME_S = 1.06;
  const wm = wordmark('DEVESH PANT');
  const staticName = wm.strokes.map((s) => `<path transform="translate(${s.x} 0)" d="${s.d}"/>`).join('');
  const drawn = (core) => wm.strokes.map((s) => {
    const begin = 0.35 + s.letter * 0.09 + s.j * 0.14;
    return `<path transform="translate(${s.x} 0)" d="${s.d}" pathLength="100" stroke-dasharray="100" stroke-dashoffset="0">${reveal('stroke-dashoffset', 100, 0, begin, core ? 0.8 : 0.75)}</path>`;
  }).join('');

  // pill
  const pillTextW = PROFILE.pill.length * 9;
  const pill = `<g transform="translate(70 80)">
<rect x=".5" y=".5" width="${pillTextW + 50}" height="28" rx="14" fill="${C.panel}" fill-opacity=".85" stroke="${C.lineHi}"/>
<circle cx="18" cy="14.5" r="4" fill="${C.green}"><animate attributeName="opacity" values="1;.35;1" dur="1.8s" repeatCount="indefinite"/></circle>
<circle cx="18" cy="14.5" r="4" fill="none" stroke="${C.green}"><animate attributeName="r" values="4;11" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="1.8s" repeatCount="indefinite"/></circle>
<text x="32" y="19" class="m" font-size="11.5" fill="${C.text2}" textLength="${pillTextW}" lengthAdjust="spacing">${esc(PROFILE.pill)}</text></g>`;

  // typewriter line
  const TX = 96, TY = 290, TS = 16, SLOT = 4, CYCLE = SLOT * PROFILE.phrases.length;
  const cursorPts = [];
  const phrases = PROFILE.phrases.map((p, i) => {
    const w = monoWidth(p, TS), s = i * SLOT;
    const pts = [[0, 0], [s, 0], [s + 1.3, w], [s + 3.2, w], [s + 3.7, 0], [CYCLE, 0]];
    cursorPts.push([s, TX], [s + 1.3, TX + w], [s + 3.2, TX + w], [s + 3.7, TX], [s + SLOT, TX]);
    return `<clipPath id="tw${i}"><rect x="${TX - 2}" y="${TY - 20}" height="28" width="${i === 0 ? f(w + 4) : 0}"><animate attributeName="width" ${keyframes(pts.map(([t, v]) => [t, v ? v + 4 : 0]), CYCLE)} dur="${CYCLE}s" repeatCount="indefinite"/></rect></clipPath>
<text x="${TX}" y="${TY}" class="m" font-size="${TS}" fill="${C.cyanHi}" clip-path="url(#tw${i})" textLength="${f(w)}" lengthAdjust="spacingAndGlyphs">${esc(p)}</text>`;
  }).join('');
  const cursor = `<rect x="${f(TX + monoWidth(PROFILE.phrases[0], TS) + 3)}" y="${TY - 15}" width="9" height="19" fill="${C.cyanHi}"><animate attributeName="x" ${keyframes(cursorPts.map(([t, x]) => [t, x + 3]), CYCLE)} dur="${CYCLE}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.5;1" dur="1s" repeatCount="indefinite"/></rect>`;

  const chips = chipRow(PROFILE.chips, 70, 318, { size: 12, h: 28, pad: 13, gap: 10, accent: C.cyan, textFill: C.text2 });

  // holographic core
  const CX = 968, CY = 220, NR = 108;
  const nodes = [['UI', C.cyan], ['API', C.green], ['LLM', C.pink], ['DB', C.amber], ['RAG', C.violetHi]].map(([label, color], i) => {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    return { label, color, x: f(NR * Math.cos(a)), y: f(NR * Math.sin(a)), lx: f(136 * Math.cos(a)), ly: f(136 * Math.sin(a)) };
  });
  const pent = 'M' + nodes.map((n) => `${n.x} ${n.y}`).join('L') + 'Z';
  const spokes = nodes.map((n, i) => `<line x1="0" y1="0" x2="${n.x}" y2="${n.y}" stroke="${C.violetHi}" stroke-opacity=".28" stroke-dasharray="2 5"/>
<circle r="2.6" fill="${C.ice}" opacity="0"><animateMotion path="M0 0L${n.x} ${n.y}" dur="2.4s" begin="${f(i * 0.48)}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.8;1" dur="2.4s" begin="${f(i * 0.48)}s" repeatCount="indefinite"/></circle>`).join('');
  const nodeMarks = nodes.map((n, i) => {
    const tw = n.label.length * 6.6 + 14;
    return `<g transform="translate(${n.x} ${n.y})">
<circle r="11" fill="${C.bg0}" stroke="${n.color}" stroke-opacity=".55"/>
<circle r="4.5" fill="${n.color}" filter="url(#glow)"/>
<circle r="11" fill="none" stroke="${n.color}"><animate attributeName="r" values="11;20" dur="2.6s" begin="${f(i * 0.5)}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0" dur="2.6s" begin="${f(i * 0.5)}s" repeatCount="indefinite"/></circle></g>
<g transform="translate(${n.lx} ${n.ly})"><rect x="${f(-tw / 2)}" y="-9" width="${f(tw)}" height="18" rx="5" fill="${C.bg0}" fill-opacity=".9" stroke="${n.color}" stroke-opacity=".45"/>${mono(f(-tw / 2 + 7), 4, n.label, 11, n.color)}</g>`;
  }).join('');
  const mono2 = wordmark('DP', 54);

  const defs = `
<clipPath id="card"><rect width="${W}" height="${H}" rx="22"/></clipPath>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050816"/><stop offset=".75" stop-color="#090e22"/><stop offset="1" stop-color="#0b0820"/></linearGradient>
<radialGradient id="gCyan"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".22"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
<radialGradient id="gViolet"><stop offset="0" stop-color="${C.violet}" stop-opacity=".26"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
<radialGradient id="gPink"><stop offset="0" stop-color="${C.pink}" stop-opacity=".14"/><stop offset="1" stop-color="${C.pink}" stop-opacity="0"/></radialGradient>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".7"/><stop offset=".45" stop-color="${C.lineHi}" stop-opacity=".6"/><stop offset="1" stop-color="${C.violet}" stop-opacity=".8"/></linearGradient>
<linearGradient id="neon" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${wm.width}" y2="0" spreadMethod="reflect">
<stop offset="0" stop-color="${C.cyanHi}"/><stop offset=".38" stop-color="${C.ice}"/><stop offset=".7" stop-color="${C.violetHi}"/><stop offset="1" stop-color="${C.cyan}"/>
<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="${wm.width * 2} 0" dur="10s" repeatCount="indefinite"/></linearGradient>
<linearGradient id="monoGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${mono2.width}" y2="60"><stop offset="0" stop-color="${C.ice}"/><stop offset=".5" stop-color="${C.cyanHi}"/><stop offset="1" stop-color="${C.violetHi}"/></linearGradient>
<linearGradient id="hz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".3" stop-color="${C.cyan}"/><stop offset=".7" stop-color="${C.violetHi}"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></linearGradient>
<radialGradient id="hzGlow" cx="600" cy="${HZ}" r="520" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 ${HZ * 0.88}) scale(1 .12)"><stop offset="0" stop-color="${C.violet}" stop-opacity=".55"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
<linearGradient id="fadeV" gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff"/></linearGradient>
<linearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<linearGradient id="fadeR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<mask id="floor"><rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#fadeV)"/><rect y="${HZ}" width="260" height="${H - HZ}" fill="url(#fadeL)"/><rect x="${W - 260}" y="${HZ}" width="260" height="${H - HZ}" fill="url(#fadeR)"/></mask>
<linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".85" stop-color="${C.cyan}" stop-opacity=".07"/><stop offset="1" stop-color="${C.cyanHi}" stop-opacity=".18"/></linearGradient>
<pattern id="crt" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" opacity=".022"/></pattern>
<linearGradient id="underline" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan}"/><stop offset=".6" stop-color="${C.violetHi}"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></linearGradient>
<linearGradient id="sweep" gradientUnits="userSpaceOnUse" x1="110" y1="0" x2="80" y2="-95"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".32"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
<radialGradient id="coreGlow"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".16"/><stop offset=".6" stop-color="${C.violet}" stop-opacity=".06"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
<linearGradient id="hexEdge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cyanHi}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>
<filter id="neonGlow" x="-15%" y="-70%" width="130%" height="240%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b1"/><feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b2"/><feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
${glowFilter('glow', 3, 1.2)}
${glowFilter('soft', 6, 0.9)}
<g id="nm">${staticName}</g>`;

  const body = `<g clip-path="url(#card)">
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<circle cx="190" cy="70" r="420" fill="url(#gCyan)"><animate attributeName="cx" values="190;260;190" dur="14s" repeatCount="indefinite"/></circle>
<circle cx="1010" cy="380" r="460" fill="url(#gViolet)"><animate attributeName="cy" values="380;330;380" dur="12s" repeatCount="indefinite"/></circle>
<circle cx="720" cy="90" r="260" fill="url(#gPink)"><animate attributeName="opacity" values=".6;1;.6" dur="9s" repeatCount="indefinite"/></circle>
<g>${stars}</g>
<ellipse cx="600" cy="${HZ}" rx="560" ry="70" fill="url(#hzGlow)"/>
<g mask="url(#floor)" stroke-width="1">
<g stroke="${C.cyan}" stroke-opacity=".45">${vlines}</g>
<g stroke="${C.violetHi}" stroke-opacity=".55">${hlines}</g>
</g>
<rect y="${HZ - 1}" width="${W}" height="2" fill="url(#hz)" filter="url(#soft)"/>
<rect y="${HZ - 0.5}" width="${W}" height="1" fill="url(#hz)"/>

<g class="m" font-size="11" letter-spacing="2.5" fill="${C.text3}">
<text x="60" y="44">DEVESH.PANT <tspan fill="${C.cyan}">//</tspan> SYS.PROFILE v3.0</text>
<text x="1140" y="44" text-anchor="end">28.67°N · 77.45°E <tspan fill="${C.cyan}">//</tspan> GHAZIABAD, IN</text>
<text x="60" y="458"><tspan fill="${C.green}">◢</tspan> ALL SYSTEMS NOMINAL</text>
<text x="1140" y="458" text-anchor="end">SCROLL <tspan fill="${C.cyan}">▾</tspan> TO EXPLORE</text>
</g>
<line x1="60" y1="56" x2="1140" y2="56" stroke="${C.line}"/>
<rect x="60" y="55" width="90" height="2" fill="${C.cyanHi}" opacity=".8"><animate attributeName="x" values="60;1050;60" dur="9s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".6 0 .4 1;.6 0 .4 1"/></rect>

${pill}

<g transform="translate(${NAME_X} ${NAME_Y}) scale(${NAME_S})" fill="none" stroke-width="8" stroke-linejoin="miter" stroke-miterlimit="4">
<use href="#nm" x="-3.5" stroke="#ff3dcb" opacity="0"><animate attributeName="opacity" values="0;0;.75;0;.55;0;0" keyTimes="0;.9;.91;.925;.94;.955;1" dur="7s" begin="3s" repeatCount="indefinite"/></use>
<use href="#nm" x="3.5" stroke="#22f0ff" opacity="0"><animate attributeName="opacity" values="0;0;.75;0;.55;0;0" keyTimes="0;.9;.91;.925;.94;.955;1" dur="7s" begin="3s" repeatCount="indefinite"/></use>
<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;3 0;-2 0;0 0;0 0" keyTimes="0;.9;.91;.925;.94;1" dur="7s" begin="3s" repeatCount="indefinite" calcMode="discrete"/>
<g stroke="url(#neon)" filter="url(#neonGlow)">${drawn(false)}</g>
<g stroke="${C.ice}" stroke-width="1.4" opacity=".55">${drawn(true)}</g>
</g>
</g>
<rect x="70" y="219" width="330" height="2" rx="1" fill="url(#underline)">${reveal('width', 0, 330, 1.4, 1.1)}</rect>
<text x="410" y="223" class="m" font-size="10" letter-spacing="2" fill="${C.text3}" opacity="1">ID::0x4450<animate attributeName="opacity" values="0;0;1" keyTimes="0;.8;1" dur="2.6s" fill="freeze"/></text>

<text x="70" y="257" class="s" font-size="22" font-weight="600" fill="${C.text}">${esc(PROFILE.role)}<tspan fill="${C.text3}" dx="10">·</tspan><tspan fill="${C.violetHi}" dx="10">${esc(PROFILE.tagline)}</tspan></text>

<text x="70" y="${TY}" class="m" font-size="${TS}" fill="${C.pink}">❯</text>
${phrases}
${cursor}
${chips.svg}

<g transform="translate(${CX} ${CY})">
<circle r="170" fill="url(#coreGlow)"/>
<g><path d="M0 0L150 0A150 150 0 0 0 ${f(150 * Math.cos(Math.PI * 50 / 180))} ${f(-150 * Math.sin(Math.PI * 50 / 180))}Z" fill="url(#sweep)"/><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="7s" repeatCount="indefinite"/></g>
<circle r="150" fill="none" stroke="${C.lineHi}"/>
<circle r="144" fill="none" stroke="${C.cyan}" stroke-opacity=".35" stroke-width="6" stroke-dasharray="1.2 8.85"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="120s" repeatCount="indefinite"/></circle>
<circle r="126" fill="none" stroke="${C.cyan}" stroke-width="2" stroke-linecap="round" stroke-dasharray="140 50 30 50 90 432" opacity=".85"><animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="40s" repeatCount="indefinite"/></circle>
<circle r="${NR}" fill="none" stroke="${C.violetHi}" stroke-opacity=".35" stroke-dasharray="3 6"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="60s" repeatCount="indefinite"/></circle>
<path d="${pent}" fill="none" stroke="${C.lineHi}"/>
<path d="${pent}" fill="none" stroke="${C.cyanHi}" stroke-width="1.5" pathLength="100" stroke-dasharray="5 15"><animate attributeName="stroke-dashoffset" from="0" to="-100" dur="6s" repeatCount="indefinite"/></path>
${spokes}
<circle r="58" fill="${C.cyan}" opacity=".1" filter="url(#soft)"><animate attributeName="opacity" values=".06;.18;.06" dur="3.2s" repeatCount="indefinite"/></circle>
<polygon points="${hex(46)}" fill="${C.panel}" fill-opacity=".92" stroke="url(#hexEdge)" stroke-width="1.6"/>
<polygon points="${hex(37)}" fill="none" stroke="${C.cyan}" stroke-opacity=".3" stroke-dasharray="4 4"><animateTransform attributeName="transform" type="rotate" from="0" to="-360" dur="30s" repeatCount="indefinite"/></polygon>
<g transform="translate(${f(-mono2.width * 0.2)} -12) scale(.4)" fill="none" stroke="url(#monoGrad)" stroke-width="8" filter="url(#glow)">${mono2.strokes.map((s) => `<path transform="translate(${s.x} 0)" d="${s.d}"/>`).join('')}</g>
${nodeMarks}
<circle r="2" fill="${C.cyanHi}"><animateMotion path="M150 0A150 150 0 1 1 -150 0A150 150 0 1 1 150 0" dur="16s" repeatCount="indefinite"/></circle>
<circle r="1.6" fill="${C.violetHi}"><animateMotion path="M-126 0A126 126 0 1 0 126 0A126 126 0 1 0 -126 0" dur="11s" repeatCount="indefinite"/></circle>
</g>

<rect y="-140" width="${W}" height="140" fill="url(#scan)"><animate attributeName="y" values="-140;${H}" dur="7s" repeatCount="indefinite"/></rect>
<rect width="${W}" height="${H}" fill="url(#crt)"/>
${brackets(22, 22, W - 22, H - 22, 26, C.cyanHi, 2, 0.7)}
</g>
<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="21.5" fill="none" stroke="url(#edge)" stroke-width="1.5"/>`;

  write('hero.svg', doc(W, H, 'Devesh Pant — Full Stack Developer building AI products that ship', defs, body));
}

// ─── section headers ───────────────────────────────────────────────────────
const SECTION_THEMES = {
  dark: { suffix: '', t0: C.ice, t1: C.cyanHi, t2: C.violetHi, cyan: C.cyan, violet: C.violetHi, tick: C.lineHi, glint: '#fff', sub: C.text3, glow: true },
  light: { suffix: '-light', t0: '#0e7490', t1: '#0891b2', t2: '#7c3aed', cyan: '#0891b2', violet: '#7c3aed', tick: '#d0d7de', glint: '#06b6d4', sub: '#6e7781', glow: false },
};

function sections() {
  const W = 1200, H = 120;
  for (const [theme, P] of Object.entries(SECTION_THEMES)) SECTIONS.forEach(([slug, title, sub], idx) => {
    const n = String(idx + 1).padStart(2, '0');
    // Fixed title width (≈ bold caps + tracking) so the side rails always meet it cleanly.
    const tw = [...title].reduce((w, ch) => w + (ch === ' ' ? 16 : 27), -7);
    const gapL = 600 - tw / 2 - 34, gapR = 600 + tw / 2 + 34;
    const label = `SECTION ${n} / 0${SECTIONS.length}`;
    const defs = `
<linearGradient id="title" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.t0}"/><stop offset=".55" stop-color="${P.t1}"/><stop offset="1" stop-color="${P.t2}"/></linearGradient>
<linearGradient id="railL" gradientUnits="userSpaceOnUse" x1="70" y1="0" x2="${f(gapL)}" y2="0"><stop offset="0" stop-color="${P.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${P.cyan}" stop-opacity=".9"/></linearGradient>
<linearGradient id="railR" gradientUnits="userSpaceOnUse" x1="${f(gapR)}" y1="0" x2="1130" y2="0"><stop offset="0" stop-color="${P.violet}" stop-opacity=".9"/><stop offset="1" stop-color="${P.violet}" stop-opacity="0"/></linearGradient>
<linearGradient id="glint" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.glint}" stop-opacity="0"/><stop offset=".5" stop-color="${P.glint}"/><stop offset="1" stop-color="${P.glint}" stop-opacity="0"/></linearGradient>
${glowFilter('glow', 5, 0.8)}`;
    const body = `
${mono(f(600 - monoWidth(label, 11) * 1.4 / 2), 30, label, 11, P.cyan, 'opacity=".9"', 1.4)}
<line x1="70" y1="62" x2="${f(gapL)}" y2="62" stroke="url(#railL)" stroke-width="1.5"/>
<line x1="${f(gapR)}" y1="62" x2="1130" y2="62" stroke="url(#railR)" stroke-width="1.5"/>
<g fill="none" stroke-width="1.5"><path d="M${f(gapL + 4)} 62l6-6 6 6-6 6z" stroke="${P.cyan}"/><path d="M${f(gapR - 16)} 62l6-6 6 6-6 6z" stroke="${P.violet}"/></g>
<g stroke="${P.tick}" stroke-width="1">${[0, 1, 2, 3].map((i) => `<line x1="${f(gapL - 60 - i * 10)}" y1="56" x2="${f(gapL - 60 - i * 10)}" y2="68"/><line x1="${f(gapR + 60 + i * 10)}" y1="56" x2="${f(gapR + 60 + i * 10)}" y2="68"/>`).join('')}</g>
<rect y="61" width="70" height="2" fill="url(#glint)" opacity=".9"><animate attributeName="x" values="${f(gapL - 70)};70" dur="3.6s" begin="${idx * 0.3}s" repeatCount="indefinite"/></rect>
<rect y="61" width="70" height="2" fill="url(#glint)" opacity=".9"><animate attributeName="x" values="${f(gapR)};1060" dur="3.6s" begin="${idx * 0.3}s" repeatCount="indefinite"/></rect>
<text x="600" y="74" text-anchor="middle" class="s" font-size="31" font-weight="800" fill="url(#title)" textLength="${tw}" lengthAdjust="spacing"${P.glow ? ' filter="url(#glow)"' : ''}>${esc(title)}</text>
${mono(f(600 - monoWidth(sub, 13) / 2), 104, sub, 13, P.sub)}`;
    write(`sections/${slug}${P.suffix}.svg`, doc(W, H, `${n} — ${title[0]}${title.slice(1).toLowerCase()}`, defs, body));
  });
}

// ─── about: terminal + operator ID ─────────────────────────────────────────
function about() {
  const W = 1200, H = 460, TW = 780;
  const col = { p: C.pink, c: C.text, k: '#c4b5fd', v: C.ice, key: C.cyanHi, s: '#86efac', x: '#7c8aa5', d: C.text2, a: C.amber };
  // Each line: list of [colorKey, text]; `typed` lines are typed out, the rest print as output.
  const L = [
    { typed: true, seg: [['p', '❯ '], ['c', 'cat '], ['a', 'devesh.ts']] },
    { seg: [['k', 'const '], ['v', 'devesh'], ['x', ' = {']] },
    { seg: [['key', '  role'], ['x', ': '], ['s', '"Full Stack Developer"'], ['x', ',']] },
    { seg: [['key', '  building'], ['x', ': '], ['s', '"SaaS @ Kumi Labs"'], ['x', ',']] },
    { seg: [['key', '  stack'], ['x', ': ['], ['s', '"Flutter"'], ['x', ', '], ['s', '"React"'], ['x', ', '], ['s', '"FastAPI"'], ['x', ', '], ['s', '"Node.js"'], ['x', ', '], ['s', '"PostgreSQL"'], ['x', ', '], ['s', '"MongoDB"'], ['x', '],']] },
    { seg: [['key', '  focus'], ['x', ': ['], ['s', '"AI counsellors"'], ['x', ', '], ['s', '"RAG systems"'], ['x', ', '], ['s', '"premium UI/UX"'], ['x', '],']] },
    { seg: [['key', '  currently'], ['x', ': '], ['s', '"turning messy ideas into shippable interfaces"'], ['x', ',']] },
    { seg: [['x', '};']] },
    { seg: [] },
    { typed: true, seg: [['p', '❯ '], ['c', 'devesh '], ['a', '--status']] },
    { seg: [['p', '  ▸ '], ['key', 'building  '], ['d', ' SaaS products & AI-assisted product surfaces']] },
    { seg: [['p', '  ▸ '], ['key', 'learning  '], ['d', ' retrieval pipelines, evals, production LLM patterns']] },
    { seg: [['p', '  ▸ '], ['key', 'open to   '], ['d', ' Flutter, React & AI-backed full-stack collabs']] },
    { seg: [['p', '  ▸ '], ['key', 'fun fact  '], ['d', ' micro-interactions matter as much as API contracts']] },
  ];
  const FS = 14, LH = 24, X0 = 28, Y0 = 82, CW = FS * MONO_W;
  let t = 0.25;
  let lines = '', clips = '';
  L.forEach((ln, i) => {
    const y = Y0 + i * LH;
    const text = ln.seg.map((s) => s[1]).join('');
    const w = text.length * CW;
    let x = X0;
    const spans = ln.seg.map(([k, s]) => {
      const lead = s.length - s.trimStart().length, core = s.trim();
      const out = core ? `<text x="${f(x + lead * CW)}" y="${y}" fill="${col[k]}" textLength="${f(core.length * CW)}" lengthAdjust="spacingAndGlyphs">${esc(core)}</text>` : '';
      x += s.length * CW;
      return out;
    }).join('');
    if (!text) { t += 0.15; return; }
    const dur = ln.typed ? Math.max(0.5, text.length * 0.045) : 0.18;
    if (ln.typed) t += 0.35;
    clips += `<clipPath id="ln${i}"><rect x="${X0 - 2}" y="${y - 17}" height="${LH}" width="${f(w + 6)}">${reveal('width', 0, f(w + 6), t, dur, '0 0 1 1')}</rect></clipPath>`;
    if (ln.typed) {
      lines += `<rect x="${f(X0 + w + 4)}" y="${y - 14}" width="8.4" height="17" fill="${C.cyanHi}" opacity="0"><animate attributeName="x" values="${X0 + 2 * CW};${X0 + 2 * CW};${f(X0 + w + 4)}" keyTimes="0;${(t / (t + dur)).toFixed(4)};1" dur="${f(t + dur)}s" fill="freeze"/><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${((t - 0.3) / (t + dur + 0.3)).toFixed(4)};${((t - 0.29) / (t + dur + 0.3)).toFixed(4)};${((t + dur + 0.2) / (t + dur + 0.3)).toFixed(4)};1" dur="${f(t + dur + 0.3)}s" fill="freeze"/></rect>`;
    }
    lines += `<g clip-path="url(#ln${i})">${spans}</g>`;
    t += dur + (ln.typed ? 0.25 : 0.06);
  });
  const lastY = Y0 + L.length * LH;
  const promptEnd = t + 0.2;
  lines += `<text x="${X0}" y="${lastY}" fill="${C.pink}" opacity="1">❯<animate attributeName="opacity" values="0;0;1" keyTimes="0;${(promptEnd / (promptEnd + 0.01)).toFixed(4)};1" dur="${f(promptEnd + 0.01)}s" fill="freeze"/></text>
<rect x="${f(X0 + 2 * CW)}" y="${lastY - 14}" width="8.4" height="17" fill="${C.cyanHi}"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.5;1" dur="1.05s" begin="${f(promptEnd)}s" repeatCount="indefinite"/></rect>`;

  // operator ID panel
  const IX = 800, IW = 400, AX = IX + IW / 2, AY = 118;
  const mono2 = wordmark('DP', 54);
  const rows = [
    ['BASE', 'Ghaziabad, India'],
    ['EDU', 'B.Tech · Gautam Buddha University'],
    ['NOW', 'Building SaaS at Kumi Labs'],
    ['PREV', 'Full-stack intern · Haze Media IT'],
  ];
  const rnd = rng(5);
  let bars = '', bx = IX + 28;
  while (bx < IX + IW - 30) { const w = [1, 1, 2, 3][Math.floor(rnd() * 4)]; bars += `<rect x="${bx}" y="428" width="${w}" height="14"/>`; bx += w + 2 + Math.floor(rnd() * 3); }

  const defs = `
<linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1226"/><stop offset="1" stop-color="#070b18"/></linearGradient>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".55"/><stop offset=".5" stop-color="${C.lineHi}" stop-opacity=".7"/><stop offset="1" stop-color="${C.violet}" stop-opacity=".7"/></linearGradient>
<linearGradient id="edge2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.violet}" stop-opacity=".8"/><stop offset=".5" stop-color="${C.lineHi}" stop-opacity=".7"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".7"/></linearGradient>
<radialGradient id="halo"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".28"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
<radialGradient id="tglow" cx="1" cy="0" r="1"><stop offset="0" stop-color="${C.violet}" stop-opacity=".14"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
<linearGradient id="monoGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${mono2.width}" y2="60"><stop offset="0" stop-color="${C.ice}"/><stop offset=".5" stop-color="${C.cyanHi}"/><stop offset="1" stop-color="${C.violetHi}"/></linearGradient>
<linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".1"/></linearGradient>
<clipPath id="idclip"><path d="${chamfer(IW, H, 30)}"/></clipPath>
<pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${C.cyan}" opacity=".12"/></pattern>
${glowFilter('glow', 3, 1.1)}
${clips}`;

  const body = `
<g>
<rect x=".75" y=".75" width="${TW - 1.5}" height="${H - 1.5}" rx="18" fill="url(#panel)" stroke="url(#edge)" stroke-width="1.5"/>
<rect x=".75" y=".75" width="${TW - 1.5}" height="${H - 1.5}" rx="18" fill="url(#tglow)"/>
<path d="M1 44H${TW - 1}" stroke="${C.line}"/>
<g><circle cx="26" cy="22" r="6" fill="#ff5f57"/><circle cx="46" cy="22" r="6" fill="#febc2e"/><circle cx="66" cy="22" r="6" fill="#28c840"/></g>
${mono(f(TW / 2 - monoWidth('devesh@kumi-labs: ~/profile — zsh', 12) / 2), 26, 'devesh@kumi-labs: ~/profile — zsh', 12, C.text3)}
<g class="m" font-size="${FS}">${lines}</g>
</g>

<g transform="translate(${IX} 0)">
<g clip-path="url(#idclip)">
<rect width="${IW}" height="${H}" fill="url(#panel)"/>
<rect width="${IW}" height="${H}" fill="url(#dots)"/>
<rect y="-120" width="${IW}" height="120" fill="url(#scan)"><animate attributeName="y" values="-120;${H}" dur="5s" repeatCount="indefinite"/></rect>
</g>
<path d="${chamfer(IW, H, 30)}" fill="none" stroke="url(#edge2)" stroke-width="1.5"/>
${mono(26, 36, 'OPERATOR PROFILE', 11, C.cyan, '', 1.3)}
${mono(f(IW - 26 - monoWidth('ID // 0x4450', 11)), 36, 'ID // 0x4450', 11, C.text3)}
</g>
<g transform="translate(${AX} ${AY})">
<circle r="80" fill="url(#halo)"><animate attributeName="opacity" values=".7;1;.7" dur="4s" repeatCount="indefinite"/></circle>
<circle r="64" fill="none" stroke="${C.cyan}" stroke-width="2" stroke-dasharray="80 30 20 30 60 182.1" stroke-linecap="round" opacity=".8"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="18s" repeatCount="indefinite"/></circle>
<circle r="72" fill="none" stroke="${C.violetHi}" stroke-opacity=".4" stroke-dasharray="1.5 6"><animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="40s" repeatCount="indefinite"/></circle>
<polygon points="${hex(48)}" fill="${C.panel}" stroke="${C.cyanHi}" stroke-opacity=".6" stroke-width="1.5"/>
<polygon points="${hex(40)}" fill="none" stroke="${C.violetHi}" stroke-opacity=".35"/>
<g transform="translate(${f(-mono2.width * 0.24)} -14.4) scale(.48)" fill="none" stroke="url(#monoGrad)" stroke-width="8" filter="url(#glow)">${mono2.strokes.map((s) => `<path transform="translate(${s.x} 0)" d="${s.d}"/>`).join('')}</g>
</g>
<text x="${AX}" y="236" text-anchor="middle" class="s" font-size="25" font-weight="700" fill="${C.text}">Devesh Pant</text>
${mono(f(AX - monoWidth('FULL STACK DEVELOPER', 12) * 1.3 / 2), 260, 'FULL STACK DEVELOPER', 12, C.cyanHi, '', 1.3)}
<path d="M${IX + 26} 282H${IX + IW - 26}" stroke="${C.line}"/>
${rows.map(([k, v], i) => `${mono(IX + 26, 310 + i * 27, k, 11, C.text3)}<text x="${IX + 92}" y="${310 + i * 27}" class="s" font-size="14" fill="${C.text}">${esc(v)}</text>`).join('\n')}
${mono(IX + 26, 310 + 4 * 27, 'STATUS', 11, C.text3)}
<circle cx="${IX + 98}" cy="${310 + 4 * 27 - 4.5}" r="4" fill="${C.green}" filter="url(#glow)"><animate attributeName="opacity" values="1;.4;1" dur="1.8s" repeatCount="indefinite"/></circle>
<text x="${IX + 110}" y="${310 + 4 * 27}" class="s" font-size="14" font-weight="600" fill="${C.green}">Open to collaboration</text>
<g fill="${C.text3}" opacity=".55">${bars}</g>`;

  write('about.svg', doc(W, H, 'About Devesh — profile terminal and operator card', defs, body));
}

// ─── project cards ──────────────────────────────────────────────────────────
const ICONS = {
  chat: (a) => `<path d="M14 18a5 5 0 0 1 5-5h20a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5H24l-7 6v-6.4A5 5 0 0 1 14 30z" stroke="${a}" stroke-width="2" fill="${a}" fill-opacity=".08"/>
${[22, 29, 36].map((x, i) => `<circle cx="${x}" cy="24" r="2.2" fill="${a}"><animate attributeName="opacity" values=".2;1;.2" dur="1.2s" begin="${i * 0.2}s" repeatCount="indefinite"/></circle>`).join('')}
<path d="M34 39h11a4 4 0 0 0 4-4v-9" stroke="${a}" stroke-opacity=".5" stroke-width="2" fill="none"/>`,
  docs: (a) => `<rect x="24" y="10" width="26" height="34" rx="3" stroke="${a}" stroke-opacity=".35" stroke-width="2" fill="none"/>
<rect x="19" y="15" width="26" height="34" rx="3" stroke="${a}" stroke-opacity=".6" stroke-width="2" fill="${C.panel}"/>
<rect x="14" y="20" width="26" height="34" rx="3" stroke="${a}" stroke-width="2" fill="${C.panel}"/>
<path d="M20 30h14M20 36h14M20 42h9" stroke="${a}" stroke-opacity=".7" stroke-width="2"/>
<rect x="11" y="22" width="32" height="2" fill="${a}" filter="url(#glow)"><animate attributeName="y" values="22;50;22" dur="2.6s" repeatCount="indefinite"/></rect>`,
  voice: (a) => [14, 20, 26, 32, 38, 44, 50].map((x, i) => `<g transform="translate(${x} 32)"><rect x="-1.75" y="-13" width="3.5" height="26" rx="1.75" fill="${a}"><animateTransform attributeName="transform" type="scale" values="1 .25;1 ${[0.7, 1, 0.55, 0.9, 0.6, 1, 0.45][i]};1 .35;1 ${[0.5, 0.65, 1, 0.4, 0.95, 0.5, 0.8][i]};1 .25" dur="${f(1.1 + (i % 3) * 0.25)}s" repeatCount="indefinite"/></rect></g>`).join(''),
  calendar: (a) => {
    const cells = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) cells.push([17 + c * 8, 28 + r * 7.5]);
    const seq = [5, 2, 10, 7, 0, 9];
    return `<rect x="12" y="15" width="40" height="36" rx="5" stroke="${a}" stroke-width="2" fill="${a}" fill-opacity=".06"/>
<path d="M12 24h40M22 11v8M42 11v8" stroke="${a}" stroke-width="2"/>
${cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="6" height="5" rx="1.2" fill="${a}" opacity=".22"/>`).join('')}
<rect x="${cells[seq[0]][0]}" y="${cells[seq[0]][1]}" width="6" height="5" rx="1.2" fill="${a}" filter="url(#glow)"><animate attributeName="x" values="${seq.map((s) => cells[s][0]).join(';')}" dur="4.8s" calcMode="discrete" repeatCount="indefinite"/><animate attributeName="y" values="${seq.map((s) => cells[s][1]).join(';')}" dur="4.8s" calcMode="discrete" repeatCount="indefinite"/></rect>`;
  },
  tag: (a) => `<g><animateTransform attributeName="transform" type="rotate" values="-9 32 8;9 32 8;-9 32 8" dur="3s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1"/>
<path d="M32 8v7" stroke="${a}" stroke-opacity=".6" stroke-width="2"/>
<path d="M23 24l9-9 9 9v24a3 3 0 0 1-3 3H26a3 3 0 0 1-3-3z" stroke="${a}" stroke-width="2" stroke-linejoin="round" fill="${a}" fill-opacity=".08"/>
<circle cx="32" cy="24" r="2.6" stroke="${a}" stroke-width="2" fill="none"/>
<path d="M28 34h8M28 40h6" stroke="${a}" stroke-opacity=".75" stroke-width="2" stroke-linecap="round"/></g>`,
  bolt: (a) => `<path d="M38 9L19 35h12l-4 20 20-27H35l3-19z" stroke="${a}" stroke-width="2" stroke-linejoin="round" fill="${a}" fill-opacity=".15" filter="url(#glow)"><animate attributeName="fill-opacity" values=".1;.45;.1" dur="1.6s" repeatCount="indefinite"/></path>
${[[8, 24, 14], [6, 32, 10], [9, 40, 12]].map(([x, y, w], i) => `<path d="M${x} ${y}h${w}" stroke="${a}" stroke-width="2" stroke-linecap="round"><animate attributeName="opacity" values="0;1;0" dur="1.1s" begin="${i * 0.25}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="4 0;-3 0" dur="1.1s" begin="${i * 0.25}s" repeatCount="indefinite"/></path>`).join('')}`,
};

function projectCard(p, idx) {
  const W = 600, H = 350, a = p.accent;
  const n = String(idx + 1).padStart(2, '0');
  const shape = chamfer(W, H, 28, 16);
  const pillW = monoWidth(p.pill, 11) * 1.2 + (p.live ? 36 : 24);
  const chips = chipRow(p.stack, 36, 256, { size: 13, h: 30, pad: 13, gap: 9, accent: a });
  const ctaSize = monoWidth(p.cta, 12.5) > 470 ? 11 : 12.5;
  const defs = `
<clipPath id="shape"><path d="${shape}"/></clipPath>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1329"/><stop offset="1" stop-color="#060a16"/></linearGradient>
<radialGradient id="aura" cx="1" cy="0" r="1"><stop offset="0" stop-color="${a}" stop-opacity=".2"/><stop offset=".6" stop-color="${a}" stop-opacity=".03"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
<linearGradient id="edge" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}" stop-opacity=".85"/><stop offset=".5" stop-color="${C.lineHi}" stop-opacity=".7"/><stop offset="1" stop-color="${a}" stop-opacity=".35"/></linearGradient>
<pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${a}" stroke-opacity=".06"/></pattern>
<linearGradient id="gridFade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
<mask id="gm"><rect width="${W}" height="${H}" fill="url(#gridFade)"/></mask>
${glowFilter('glow', 2.5, 1.2)}`;
  const body = `
<g clip-path="url(#shape)">
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gm)"/>
<rect width="${W}" height="${H}" fill="url(#aura)"/>
</g>
<path d="${shape}" fill="none" stroke="url(#edge)" stroke-width="1.5"/>
<path d="${shape}" fill="none" stroke="${a}" stroke-width="2" pathLength="1000" stroke-dasharray="70 930" filter="url(#glow)"><animate attributeName="stroke-dashoffset" from="1000" to="0" dur="7s" begin="${f(-idx * 1.1)}s" repeatCount="indefinite"/></path>
<path d="M${W - 27} 6l21 21" stroke="${a}" stroke-width="2" opacity=".9"/>

${mono(36, 44, `PRJ_${n}`, 12.5, a)}${mono(f(36 + monoWidth(`PRJ_${n} `, 12.5)), 44, `// ${p.tag}`, 12.5, C.text3)}
<g transform="translate(${f(W - 44 - pillW)} 26)">
<rect x=".5" y=".5" width="${f(pillW)}" height="25" rx="12.5" fill="${a}" fill-opacity=".1" stroke="${a}" stroke-opacity=".5"/>
${p.live ? `<circle cx="15" cy="13" r="3.5" fill="${C.green}" filter="url(#glow)"><animate attributeName="opacity" values="1;.3;1" dur="1.6s" repeatCount="indefinite"/></circle>` : ''}
<text x="${p.live ? 27 : 12}" y="17.5" class="m" font-size="11" fill="${a}" textLength="${f(monoWidth(p.pill, 11) * 1.2)}" lengthAdjust="spacing">${esc(p.pill)}</text>
</g>

<g transform="translate(36 70)">
<rect x=".75" y=".75" width="62.5" height="62.5" rx="14" fill="${a}" fill-opacity=".06" stroke="${a}" stroke-opacity=".45" stroke-width="1.5"/>
${ICONS[p.icon](a)}
</g>
<text x="118" y="104" class="s" font-size="28" font-weight="800" fill="${C.text}" letter-spacing=".3">${esc(p.title)}</text>
<text x="118" y="128" class="m" font-size="12.5" fill="${a}" letter-spacing="2.5">${esc(p.subtitle)}</text>

<g class="s" font-size="16.5" fill="${C.text2}">${p.desc.map((l, i) => `<text x="36" y="${172 + i * 25}">${esc(l)}</text>`).join('')}</g>
${chips.svg}
<path d="M36 306H${W - 36}" stroke="${C.line}"/>
${mono(36, 331, p.cta, ctaSize, a)}
${mono(f(W - 36 - monoWidth(`${n} / 0${PROJECTS.length}`, 12)), 331, `${n} / 0${PROJECTS.length}`, 12, C.text3)}`;
  write(`projects/${p.slug}.svg`, doc(W, H, `${p.title} — ${p.subtitle.toLowerCase()}`, defs, body));
}

// ─── tech stack matrix ─────────────────────────────────────────────────────
function stack() {
  const W = 1200, CW = 590, RH = 108, G = 12;
  const H = Math.ceil(STACK.length / 2) * (RH + G) - G;
  const cells = STACK.map((s, i) => {
    const x = (i % 2) * (CW + 20), y = Math.floor(i / 2) * (RH + G);
    const label = `${String(i + 1).padStart(2, '0')} · ${s.label}`;
    const chips = chipRow(s.items, 26, 54, { size: 14, h: 34, pad: 14, gap: 10, accent: s.accent });
    const count = `${String(s.items.length).padStart(2, '0')} MODULES`;
    return `<g transform="translate(${x} ${y})">
<rect x=".75" y=".75" width="${CW - 1.5}" height="${RH - 1.5}" rx="14" fill="url(#cell)" stroke="${C.line}" stroke-width="1.5"/>
<rect x="0" y="18" width="3" height="${RH - 36}" rx="1.5" fill="${s.accent}" filter="url(#glow)"><animate attributeName="opacity" values=".5;1;.5" dur="3s" begin="${f(i * 0.4)}s" repeatCount="indefinite"/></rect>
${mono(26, 36, label, 12, s.accent, '', 1.25)}
${mono(f(CW - 24 - monoWidth(count, 10.5)), 36, count, 10.5, C.text3)}
${chips.svg}
</g>`;
  }).join('\n');
  const defs = `
<linearGradient id="cell" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c1329"/><stop offset="1" stop-color="#070b18"/></linearGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="${C.cyanHi}" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
${glowFilter('glow', 3, 1)}`;
  const body = `${cells}
<rect y="0" width="220" height="${H}" fill="url(#sheen)" transform="skewX(-12)"><animate attributeName="x" values="-300;1500" dur="6s" repeatCount="indefinite"/></rect>`;
  write('stack.svg', doc(W, H, 'Tech stack — languages, mobile & web, backend, data, AI, cloud & tools', defs, body));
}

// ─── buttons ────────────────────────────────────────────────────────────────
const BTN_ICONS = {
  branch: (a) => `<g stroke="${a}" stroke-width="2.2" fill="none" stroke-linecap="round"><circle cx="15" cy="12" r="3.5"/><circle cx="15" cy="34" r="3.5"/><circle cx="31" cy="16" r="3.5"/><path d="M15 15.5v15M31 19.5c0 7-16 5-16 11"/></g>`,
  in: (a) => `<rect x="7" y="7" width="32" height="32" rx="7" stroke="${a}" stroke-width="2.2" fill="none"/><text x="23" y="30" text-anchor="middle" class="s" font-size="17" font-weight="800" fill="${a}">in</text>`,
  globe: (a) => `<g stroke="${a}" stroke-width="2" fill="none"><circle cx="23" cy="23" r="15"/><path d="M8 23h30M23 8v30"/><ellipse cx="23" cy="23" rx="7" ry="15"><animate attributeName="rx" values="7;13;1;7" dur="5s" repeatCount="indefinite"/></ellipse></g>`,
  mail: (a) => `<g stroke="${a}" stroke-width="2.2" fill="none" stroke-linejoin="round"><rect x="7" y="11" width="32" height="24" rx="4"/><path d="M8 13l15 12 15-12"/></g>`,
};

function buttons() {
  const W = 300, H = 76;
  BUTTONS.forEach((b, i) => {
    const a = b.accent;
    const shape = chamfer(W, H, 16, 12);
    const subSize = monoWidth(b.sub, 12) > 190 ? 10.5 : 12;
    const defs = `
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1530"/><stop offset="1" stop-color="#060a16"/></linearGradient>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${a}" stop-opacity=".8"/><stop offset="1" stop-color="${C.violet}" stop-opacity=".5"/></linearGradient>
<radialGradient id="aura" cx="0" cy=".5" r=".8"><stop offset="0" stop-color="${a}" stop-opacity=".16"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
<clipPath id="shape"><path d="${shape}"/></clipPath>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".09"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
${glowFilter('glow', 3, 0.9)}`;
    const body = `
<g clip-path="url(#shape)"><rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#aura)"/>
<rect y="0" width="70" height="${H}" fill="url(#sheen)" transform="skewX(-20)"><animate attributeName="x" values="-120;420;420" keyTimes="0;.45;1" dur="4.5s" begin="${f(i * 0.6)}s" repeatCount="indefinite"/></rect></g>
<path d="${shape}" fill="none" stroke="url(#edge)" stroke-width="1.5"/>
<g transform="translate(16 15)" filter="url(#glow)">${BTN_ICONS[b.icon](a)}</g>
<line x1="72" y1="18" x2="72" y2="58" stroke="${C.line}"/>
<text x="88" y="35" class="s" font-size="17" font-weight="800" letter-spacing="2.5" fill="${C.text}">${esc(b.label)}</text>
${mono(88, 56, b.sub, subSize, C.text2)}
<path d="M${W - 34} 30l8 8-8 8" stroke="${a}" stroke-width="2" fill="none"><animateTransform attributeName="transform" type="translate" values="0 0;4 0;0 0" dur="1.6s" repeatCount="indefinite"/></path>`;
    write(`buttons/${b.slug}.svg`, doc(W, H, `${b.label[0]}${b.label.slice(1).toLowerCase()} — ${b.sub}`, defs, body));
  });
}

// ─── call to action ────────────────────────────────────────────────────────
function cta() {
  const W = 1200, H = 280;
  const email = 'dev.deveshpant@gmail.com';
  const btnW = monoWidth(email + '  ↗', 16) + 48;
  const defs = `
<clipPath id="card"><rect width="${W}" height="${H}" rx="22"/></clipPath>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a1024"/><stop offset="1" stop-color="#05070f"/></linearGradient>
<radialGradient id="gA" cx="160" cy="140" r="320" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.pink}" stop-opacity=".2"/><stop offset="1" stop-color="${C.pink}" stop-opacity="0"/></radialGradient>
<radialGradient id="gB" cx="1050" cy="140" r="340" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".18"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.pink}" stop-opacity=".75"/><stop offset=".5" stop-color="${C.lineHi}"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".75"/></linearGradient>
<linearGradient id="head" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.text}"/><stop offset=".6" stop-color="${C.ice}"/><stop offset="1" stop-color="${C.cyanHi}"/></linearGradient>
<linearGradient id="btn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.pink}" stop-opacity=".22"/><stop offset="1" stop-color="${C.violet}" stop-opacity=".22"/></linearGradient>
<pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#fff" stroke-opacity=".035"/></pattern>
${glowFilter('glow', 4, 1)}`;
  const waves = [0, 1, 2, 3].map((i) => `<circle cx="150" cy="140" r="20" fill="none" stroke="${C.pink}" stroke-width="1.5"><animate attributeName="r" values="22;100" dur="3.2s" begin="${f(i * 0.8)}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="3.2s" begin="${f(i * 0.8)}s" repeatCount="indefinite"/></circle>`).join('');
  const meridians = [0, 1, 2].map((i) => `<ellipse rx="70" ry="70" fill="none" stroke="${C.cyan}" stroke-opacity=".55"><animate attributeName="rx" values="70;0;70" dur="6s" begin="${-i * 2}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".4 0 .6 1;.4 0 .6 1"/></ellipse>`).join('');
  const body = `
<g clip-path="url(#card)">
<rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#grid)"/>
<rect width="${W}" height="${H}" fill="url(#gA)"/><rect width="${W}" height="${H}" fill="url(#gB)"/>
${waves}
<circle cx="150" cy="140" r="26" fill="${C.panel}" stroke="${C.pink}" stroke-width="1.5"/>
<g transform="translate(131 121) scale(.82)" filter="url(#glow)">${BTN_ICONS.mail(C.pink)}</g>
<g transform="translate(1050 140)">
<circle r="70" fill="${C.cyan}" fill-opacity=".04" stroke="${C.cyan}" stroke-opacity=".7" stroke-width="1.5"/>
${meridians}
${[-35, 0, 35].map((y) => `<ellipse cy="${y}" rx="${f(Math.sqrt(70 * 70 - y * y))}" ry="${f(Math.sqrt(70 * 70 - y * y) * 0.18)}" fill="none" stroke="${C.cyan}" stroke-opacity=".35"/>`).join('')}
<circle r="86" fill="none" stroke="${C.violetHi}" stroke-opacity=".35" stroke-dasharray="2 7"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="50s" repeatCount="indefinite"/></circle>
<circle r="3" fill="${C.pink}" filter="url(#glow)"><animateMotion path="M86 0A86 86 0 1 1 -86 0A86 86 0 1 1 86 0" dur="8s" repeatCount="indefinite"/></circle>
</g>
${mono(260, 82, '◉ CHANNEL OPEN', 12, C.pink, '', 1.4)}
<text x="260" y="128" class="s" font-size="36" font-weight="800" fill="url(#head)">Have an idea worth shipping?</text>
<text x="260" y="162" class="s" font-size="18" fill="${C.text2}">Products, roles, or a wild AI experiment — my inbox is open.</text>
<g transform="translate(260 188)">
<rect x=".75" y=".75" width="${f(btnW)}" height="46" rx="12" fill="url(#btn)" stroke="${C.pink}" stroke-opacity=".6" stroke-width="1.5"/>
${mono(24, 29, email + '  ↗', 16, C.text)}
</g>
${brackets(18, 18, W - 18, H - 18, 22, C.pink, 2, 0.6)}
</g>
<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="21.5" fill="none" stroke="url(#edge)" stroke-width="1.5"/>`;
  write('cta.svg', doc(W, H, `Have an idea worth shipping? Email ${email}`, defs, body));
}

// ─── footer ─────────────────────────────────────────────────────────────────
function footer() {
  const W = 1200, H = 210, HZ = 120, VPY = 70;
  let v = '';
  for (let i = -18; i <= 18; i++) v += `<line x1="${f(600 + (i * 80 * (HZ - VPY)) / (H - VPY))}" y1="${HZ}" x2="${600 + i * 80}" y2="${H}"/>`;
  let h = '';
  for (let k = 0; k < 6; k++) {
    const b = f((-3.6 * k) / 6);
    const a = (attr) => `<animate attributeName="${attr}" values="${HZ};${H}" dur="3.6s" begin="${b}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines="0.6 0 0.95 0.6"/>`;
    h += `<line x1="0" x2="${W}" y1="${HZ}" y2="${HZ}">${a('y1')}${a('y2')}</line>`;
  }
  const end = '— END OF TRANSMISSION —';
  const defs = `
<clipPath id="card"><rect width="${W}" height="${H}" rx="22"/></clipPath>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050816"/><stop offset="1" stop-color="#0b0820"/></linearGradient>
<linearGradient id="hz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".3" stop-color="${C.cyan}"/><stop offset=".7" stop-color="${C.violetHi}"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></linearGradient>
<radialGradient id="sun" cx="600" cy="${HZ}" r="300" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 ${HZ * 0.75}) scale(1 .25)"><stop offset="0" stop-color="${C.violet}" stop-opacity=".6"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
<linearGradient id="fadeV" gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff"/></linearGradient>
<linearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<linearGradient id="fadeR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<mask id="floor"><rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#fadeV)"/><rect y="${HZ}" width="300" height="${H - HZ}" fill="url(#fadeL)"/><rect x="${W - 300}" y="${HZ}" width="300" height="${H - HZ}" fill="url(#fadeR)"/></mask>
<linearGradient id="title" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyanHi}"/><stop offset=".5" stop-color="${C.ice}"/><stop offset="1" stop-color="${C.violetHi}"/></linearGradient>
${glowFilter('glow', 5, 0.8)}
${glowFilter('soft', 6, 0.9)}`;
  const body = `
<g clip-path="url(#card)">
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<ellipse cx="600" cy="${HZ}" rx="420" ry="70" fill="url(#sun)"/>
<g mask="url(#floor)"><g stroke="${C.cyan}" stroke-opacity=".45">${v}</g><g stroke="${C.violetHi}" stroke-opacity=".55">${h}</g></g>
<rect y="${HZ - 1}" width="${W}" height="2" fill="url(#hz)" filter="url(#soft)"/>
<rect y="${HZ - 0.5}" width="${W}" height="1" fill="url(#hz)"/>
<text x="600" y="62" text-anchor="middle" class="s" font-size="24" font-weight="800" fill="url(#title)" textLength="500" lengthAdjust="spacing" filter="url(#glow)">THANKS FOR STOPPING BY</text>
${mono(f(600 - monoWidth(end, 12) * 1.3 / 2), 92, end, 12, C.text3, '', 1.3)}
<rect x="${f(600 + monoWidth(end, 12) * 1.3 / 2 + 8)}" y="82" width="8" height="12" fill="${C.cyanHi}"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.5;1" dur="1.1s" repeatCount="indefinite"/></rect>
</g>
<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="21.5" fill="none" stroke="${C.line}" stroke-width="1.5"/>`;
  write('footer.svg', doc(W, H, "Thanks for stopping by — let's build something that ships", defs, body));
}

console.log('Building profile artwork…');
hero();
sections();
about();
PROJECTS.forEach(projectCard);
stack();
buttons();
cta();
footer();
console.log('Done.');
