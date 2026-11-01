#!/usr/bin/env node
// Renders the "GitHub telemetry" card from the GitHub GraphQL API. No dependencies.
// CI:     run by .github/workflows/snake.yml, published to the `output` branch.
// Local:  GITHUB_TOKEN=$(gh auth token) node .github/scripts/github-stats.mjs out.svg
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const LOGIN = process.env.GITHUB_USER || process.env.GITHUB_REPOSITORY_OWNER || 'DeveshPant5';
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = process.argv[2] || 'dist/github-stats.svg';
const IGNORED_LANGS = new Set(['CMake', 'Batchfile', 'Dockerfile', 'Makefile', 'Procfile']);

const QUERY = `query($login: String!) {
  user(login: $login) {
    repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100) {
      totalCount
      nodes { languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name } } } }
    }
    contributionsCollection {
      contributionCalendar { totalContributions weeks { contributionDays { contributionCount date } } }
    }
  }
}`;

async function fetchUser() {
  if (!TOKEN) throw new Error('GITHUB_TOKEN is required');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-telemetry' },
    body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors || !json.data?.user) throw new Error(JSON.stringify(json.errors || json));
  return json.data.user;
}

function metrics(user) {
  const cal = user.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays);

  let longest = 0, run = 0;
  for (const d of days) { run = d.contributionCount > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  // Today may simply not have contributions *yet*, so a streak survives until tomorrow.
  let i = days.length - 1, current = 0;
  if (days[i]?.contributionCount === 0) i--;
  for (; i >= 0 && days[i].contributionCount > 0; i--) current++;

  const weeks = cal.weeks.slice(-52).map((w) => ({
    start: w.contributionDays[0].date,
    count: w.contributionDays.reduce((s, d) => s + d.contributionCount, 0),
  }));

  const bytes = {};
  for (const repo of user.repositories.nodes) {
    for (const { size, node } of repo.languages.edges) {
      if (!IGNORED_LANGS.has(node.name)) bytes[node.name] = (bytes[node.name] || 0) + size;
    }
  }
  const totalBytes = Object.values(bytes).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(bytes).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, size]) => ({ name, share: size / totalBytes }));

  return {
    total: cal.totalContributions,
    firstDay: days[0].date, lastDay: days[days.length - 1].date, dayCount: days.length,
    activeDays: days.filter((d) => d.contributionCount > 0).length,
    current, longest, weeks,
    bestWeek: Math.max(0, ...weeks.map((w) => w.count)),
    repos: user.repositories.totalCount,
    languages,
  };
}

// ─── rendering ──────────────────────────────────────────────────────────────
const C = {
  surface: '#0b132a', line: '#1a2644', lineHi: '#2a3a63', grid: '#16223d',
  text: '#e6edf7', text2: '#9aa8c0', text3: '#5d6b86',
  cyan: '#22d3ee', violet: '#8b5cf6',
  bar: '#0aa2c2', barPeak: '#67e8f9', lang: '#8b5cf6',
};
const MONO = `'JetBrains Mono','Fira Code','SF Mono',SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace`;
const SANS = `'Inter','Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const f = (n) => +n.toFixed(2);
const fmt = (n) => n.toLocaleString('en-US');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthYear = (iso) => { const [y, m] = iso.split('-'); return `${MONTHS[+m - 1]} ${y}`; };
const plural = (n, word) => `${word}${n === 1 ? '' : 's'}`;

function niceMax(v) {
  if (v <= 4) return 4;
  const mag = 10 ** Math.floor(Math.log10(v));
  for (const step of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (step * mag >= v) return step * mag;
  return 10 * mag;
}

// Bar with a rounded data end and a square end on its baseline.
function vbar(x, yBase, w, h, r) {
  r = Math.min(r, h, w / 2);
  return `M${f(x)} ${f(yBase)}V${f(yBase - h + r)}Q${f(x)} ${f(yBase - h)} ${f(x + r)} ${f(yBase - h)}H${f(x + w - r)}Q${f(x + w)} ${f(yBase - h)} ${f(x + w)} ${f(yBase - h + r)}V${f(yBase)}Z`;
}
function hbar(x, y, w, h, r) {
  r = Math.min(r, w, h / 2);
  return `M${f(x)} ${f(y)}H${f(x + w - r)}Q${f(x + w)} ${f(y)} ${f(x + w)} ${f(y + r)}V${f(y + h - r)}Q${f(x + w)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)}H${f(x)}Z`;
}
// One-shot grow-in that starts at t=0, so renderers without SMIL still show the final state.
function grow(attr, from, to, begin, dur = 0.7) {
  const total = begin + dur;
  return `<animate attributeName="${attr}" values="${from};${from};${to}" keyTimes="0;${(begin / total).toFixed(4)};1" dur="${total.toFixed(3)}s" calcMode="spline" keySplines="0 0 1 1;.3 0 .2 1" fill="freeze"/>`;
}

function render(m) {
  const W = 1200, H = 470;
  const synced = new Date().toISOString().slice(0, 10);

  const tiles = [
    ['Current streak', fmt(m.current), plural(m.current, 'day')],
    ['Longest streak', fmt(m.longest), plural(m.longest, 'day')],
    ['Active days', fmt(m.activeDays), `of ${m.dayCount}`],
    ['Best week', fmt(m.bestWeek), plural(m.bestWeek, 'contribution')],
    ['Public repos', fmt(m.repos), 'owned, non-fork'],
  ];
  const TX = 360, TW = (W - 40 - TX - 4 * 12) / 5;
  const tileSvg = tiles.map(([label, value, unit], i) => `<g transform="translate(${f(TX + i * (TW + 12))} 76)">
<rect x=".5" y=".5" width="${f(TW - 1)}" height="119" rx="12" fill="${C.surface}" stroke="${C.line}"/>
<rect x="16" y="0" width="22" height="2" fill="${C.cyan}" opacity=".8"/>
<text x="16" y="32" class="s" font-size="13" fill="${C.text2}">${esc(label)}</text>
<text x="16" y="78" class="s" font-size="34" font-weight="600" fill="${C.text}">${esc(value)}</text>
<text x="16" y="102" class="m" font-size="11" fill="${C.text3}">${esc(unit)}</text></g>`).join('\n');

  // weekly contributions
  const PX0 = 92, PX1 = 750, PY0 = 280, PY1 = 404;
  const max = niceMax(m.bestWeek);
  const slot = (PX1 - PX0) / Math.max(m.weeks.length, 1), bw = slot - 2;
  const peak = m.weeks.findIndex((w) => w.count === m.bestWeek && w.count > 0);
  const bars = m.weeks.map((w, i) => {
    if (!w.count) return '';
    const h = Math.max(2, (w.count / max) * (PY1 - PY0));
    const x = PX0 + i * slot + 1;
    const fill = i === peak ? C.barPeak : C.bar;
    const flat = vbar(x, PY1, bw, 0.01, 3), full = vbar(x, PY1, bw, h, 3);
    return `<path d="${full}" fill="${fill}">${grow('d', flat, full, 0.2 + i * 0.012)}</path>`;
  }).join('');
  const peakLabel = peak >= 0
    ? `<text x="${f(PX0 + peak * slot + slot / 2)}" y="${f(PY1 - (m.bestWeek / max) * (PY1 - PY0) - 8)}" text-anchor="middle" class="s" font-size="12" font-weight="600" fill="${C.text}">${fmt(m.bestWeek)}${grow('opacity', 0, 1, 0.9 + peak * 0.012, 0.4)}</text>`
    : '';
  let lastLabelX = -Infinity, prevMonth = null;
  const monthLabels = m.weeks.map((w, i) => {
    const month = w.start.slice(0, 7);
    const isNew = month !== prevMonth;
    prevMonth = month;
    const x = PX0 + i * slot;
    if (!isNew || i === 0 || x - lastLabelX < 34) return '';
    lastLabelX = x;
    return `<text x="${f(x)}" y="${PY1 + 20}" class="m" font-size="10" fill="${C.text3}">${MONTHS[+month.slice(5) - 1]}</text>`;
  }).join('');
  const ticks = [0, max / 2, max].map((v) => {
    const y = PY1 - (v / max) * (PY1 - PY0);
    return `<text x="${PX0 - 10}" y="${f(y + 3.5)}" text-anchor="end" class="m" font-size="10" fill="${C.text3}">${fmt(v)}</text>` +
      (v ? `<line x1="${PX0}" y1="${f(y)}" x2="${PX1}" y2="${f(y)}" stroke="${C.grid}"/>` : '');
  }).join('');

  // languages, ranked
  const LX = 810, LB0 = 912, LB1 = 1080;
  const topShare = m.languages[0]?.share || 1;
  const langs = m.languages.map((l, i) => {
    const y = 292 + i * 28;
    const w = Math.max(3, (l.share / topShare) * (LB1 - LB0));
    return `<text x="${LX}" y="${y + 4}" class="s" font-size="13.5" fill="${C.text}">${esc(l.name)}</text>
<path d="${hbar(LB0, y - 4, w, 9, 4)}" fill="${C.lang}">${grow('opacity', 0, 1, 0.3 + i * 0.08, 0.5)}</path>
<text x="1140" y="${y + 4}" text-anchor="end" class="m" font-size="12" fill="${C.text2}">${(l.share * 100).toFixed(1)}%</text>`;
  }).join('\n');

  const desc = `${fmt(m.total)} contributions between ${m.firstDay} and ${m.lastDay}. Current streak ${m.current} days, longest ${m.longest} days, ${m.activeDays} active days, best week ${m.bestWeek} contributions, ${m.repos} public repositories. Top languages: ${m.languages.map((l) => `${l.name} ${(l.share * 100).toFixed(1)}%`).join(', ')}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="svg-title svg-desc">
<title id="svg-title">GitHub telemetry for @${esc(LOGIN)}</title>
<desc id="svg-desc">${esc(desc)}</desc>
<style>.m{font-family:${MONO}}.s{font-family:${SANS}}</style>
<defs>
<clipPath id="card"><rect width="${W}" height="${H}" rx="22"/></clipPath>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1024"/><stop offset="1" stop-color="#05070f"/></linearGradient>
<radialGradient id="aura" cx="0" cy="0" r="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".14"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>
<radialGradient id="aura2" cx="1" cy="1" r="1"><stop offset="0" stop-color="${C.violet}" stop-opacity=".16"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".7"/><stop offset=".5" stop-color="${C.lineHi}"/><stop offset="1" stop-color="${C.violet}" stop-opacity=".8"/></linearGradient>
<linearGradient id="scan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".12"/></linearGradient>
<clipPath id="plot"><rect x="${PX0}" y="${PY0 - 30}" width="${PX1 - PX0}" height="${PY1 - PY0 + 30}"/></clipPath>
</defs>
<g clip-path="url(#card)">
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#aura)"/>
<rect width="${W}" height="${H}" fill="url(#aura2)"/>

<text x="40" y="42" class="m" font-size="12" fill="${C.cyan}" letter-spacing="2">◉ LIVE TELEMETRY <tspan fill="${C.text3}">// @${esc(LOGIN)}</tspan></text>
<text x="1160" y="42" text-anchor="end" class="m" font-size="11" fill="${C.text3}" letter-spacing="1.5">SYNCED ${synced} · UTC</text>
<line x1="40" y1="56" x2="1160" y2="56" stroke="${C.line}"/>

<text x="40" y="98" class="s" font-size="15" fill="${C.text2}">Contributions in the last year</text>
<text x="38" y="164" class="s" font-size="64" font-weight="600" fill="${C.text}">${fmt(m.total)}</text>
<text x="40" y="190" class="m" font-size="11" fill="${C.text3}" letter-spacing="1">${monthYear(m.firstDay).toUpperCase()} → ${monthYear(m.lastDay).toUpperCase()}</text>
${tileSvg}

<rect x="40.5" y="220.5" width="729" height="219" rx="14" fill="${C.surface}" fill-opacity=".6" stroke="${C.line}"/>
<text x="60" y="252" class="s" font-size="15" font-weight="600" fill="${C.text}">Weekly contributions</text>
<text x="750" y="252" text-anchor="end" class="m" font-size="11" fill="${C.text3}" letter-spacing="1">LAST 52 WEEKS</text>
${ticks}
<line x1="${PX0}" y1="${PY1}" x2="${PX1}" y2="${PY1}" stroke="${C.lineHi}"/>
<g clip-path="url(#plot)">${bars}
<rect x="${PX0 - 120}" y="${PY0 - 30}" width="120" height="${PY1 - PY0 + 30}" fill="url(#scan)"><animate attributeName="x" values="${PX0 - 120};${PX1}" dur="5s" begin="1.2s" repeatCount="indefinite"/></rect></g>
${peakLabel}
${monthLabels}

<rect x="790.5" y="220.5" width="369" height="219" rx="14" fill="${C.surface}" fill-opacity=".6" stroke="${C.line}"/>
<text x="${LX}" y="252" class="s" font-size="15" font-weight="600" fill="${C.text}">Top languages</text>
<text x="1140" y="252" text-anchor="end" class="m" font-size="11" fill="${C.text3}" letter-spacing="1">BY CODE SIZE</text>
<line x1="${LB0}" y1="276" x2="${LB0}" y2="420" stroke="${C.grid}"/>
${langs}
</g>
<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="21.5" fill="none" stroke="url(#edge)" stroke-width="1.5"/>
</svg>
`;
}

try {
  const m = metrics(await fetchUser());
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, render(m));
  console.log(`wrote ${OUT}: ${m.total} contributions, streak ${m.current}/${m.longest}, langs ${m.languages.map((l) => l.name).join(', ')}`);
} catch (err) {
  console.error('Failed to build telemetry card:', err.message);
  process.exit(1);
}
