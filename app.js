(function () {
'use strict';

var FADE = 1.0, CACHE_KEY = 'yellowChartsPreviews.v1', ACCEPT = 0.62, MAX_CAND = 6;
/* A match has to agree on the title AND the artist. Niche songs are often
   missing from Apple's catalogue, and without these floors the best of a bad
   set of results wins and plays the wrong song. */
var TITLE_FLOOR = 0.60, ARTIST_FLOOR = 0.50;
/* Every chart this site can show. The theme and the preview cache are shared;
   everything that differs between charts lives here. */
var CHARTS = {
  personal: {
    id: 'personal', name: 'The Personal Charts', brand: 'THE PERSONAL CHARTS',
    words: ['THE PERSONAL', 'CHARTS'], hub: true, scene: 'earth', size: 0,
    swatch: '#FFFFFF', line: { light: '#111111', dark: '#FFFFFF' },
    links: [], profile: 'https://www.crownnote.com/charts',
    blurb: 'Weekly charts from across Crownnote, gathered in one place with previews. ',
    apply: 'https://docs.google.com/forms/d/e/1FAIpQLSfiKxFp3wWdky5BtaB2MA4qZnmxR_PogSbzAppFn34Mc73clw/viewform?usp=dialog',
    feedback: 'https://docs.google.com/forms/d/e/1FAIpQLScEQbKuIZehQX3AgngjlInnxPYh_xFjmkBQXeh9UmUIuNgGjA/viewform?usp=publish-editor',
    /* What went in this update. Add a row on top each time. */
    log: [
      ['Site launched', 'Two charts, every week since 2020, with previews throughout.']
    ]
  },
  yellow: {
    id: 'yellow', name: 'Yellow Charts', brand: 'YELLOW CHARTS', words: ['YELLOW', 'CHARTS'],
    size: 25, scene: 'galaxy', swatch: '#FFD100',
    line: { light: '#B58200', dark: '#FFD100' },
    crownnote: 'https://www.crownnote.com/charts/yellowsmithereen/yellow-charts-top-25',
    profile: 'https://www.crownnote.com/users/yellowsmithereen',
    blurb: 'A weekly countdown of my 25 favourite songs, published every Friday since ',
    links: [['@yellowcharts', 'https://www.youtube.com/@yellowcharts', 'yt'],
            ['theyellowsmithereen', 'https://discord.com/users/theyellowsmithereen', 'dc']],
    notice: { date: '2024-08-02',
      body: 'This is the first official week of the Yellow Charts Top 25. The peak and weeks ' +
            'on chart may seem a little messy. This is because some songs are predicted to have ' +
            'charted prior to this week. For instance, \u201cLose Control\u201d has a projected ' +
            '17 weeks at the top before this week took place.',
      sign: '\u2014 Yellow, 15/09/2026' }
  },
  jay: {
    id: 'jay', name: 'Jaycharts', brand: 'JAYCHARTS', words: ['JAY', 'CHARTS'],
    pending: true, size: 100, scene: 'bigalaxy', swatch: '#B6A6FF',
    line: { light: '#5B45C9', dark: '#B6A6FF' },
    links: [], profile: 'https://www.crownnote.com/users/j4yy',
    crownnote: 'https://www.crownnote.com/users/j4yy',
    blurb: "Jay's weekly Top 100, published every Friday since ", notice: null
  },
  sergej: {
    id: 'sergej', name: "Sergej's Charts", brand: "SERGEJ'S CHARTS", words: ["SERGEJ'S", 'CHARTS'],
    pending: true, size: 100, scene: 'sunset', swatch: '#FF6B6B',
    line: { light: '#C2342F', dark: '#FF8A8A' },
    links: [], profile: 'https://www.crownnote.com/users/sergejdordij',
    crownnote: 'https://www.crownnote.com/users/sergejdordij',
    blurb: "Sergej's weekly chart, running since ", notice: null,
    heavy: 'This chart goes back to January 1980 and carries far more weeks than ' +
           'the others here, so it is a bigger download. Give it a moment the first time.'
  },
  macie: {
    id: 'macie', name: 'Macie Charts', brand: 'MACIE CHARTS', words: ['MACIE', 'CHARTS'],
    pending: true, size: 100, scene: 'none', swatch: '#FF5FA8',
    line: { light: '#C01B68', dark: '#FF8FC4' },
    banner: 'macie',
    links: [], profile: 'https://www.crownnote.com/charts',
    blurb: "Macie's weekly Top 100, published since ", notice: null,
    from: 'Buzzjack'
  },
  oliver: {
    id: 'oliver', name: "Violet Stallion's Week of Winners 3.0",
    brand: 'WEEK OF WINNERS 3.0', words: ["VIOLET STALLION'S", 'WEEK OF WINNERS 3.0'],
    pending: true, size: 50, scene: 'none', swatch: '#4ADE80',
    line: { light: '#15803D', dark: '#6EE7A0' },
    banner: 'oliver',
    links: [], profile: 'https://www.crownnote.com/charts',
    blurb: "Oliver's weekly Top 50, published since ", notice: null,
    from: 'Buzzjack'
  },
  henessy: {
    id: 'henessy', name: "Henessy's Chart", brand: "HENESSY'S CHART",
    words: ["HENESSY'S", 'CHART'],
    pending: true, size: 100, scene: 'dragons', swatch: '#2FD4C4',
    line: { light: '#0E7C72', dark: '#5FE3D6' },
    links: [], profile: 'https://www.crownnote.com/charts',
    blurb: "Henessy's weekly Top 100, published since ", notice: null
  },
  piran: {
    id: 'piran', name: "Piran's Charts", brand: "PIRAN'S CHARTS", words: ["PIRAN'S", 'CHARTS'],
    size: 50, scene: 'penguins', swatch: '#8FD3FF',
    line: { light: '#1971C2', dark: '#8FD3FF' },
    crownnote: 'https://www.crownnote.com/charts/piran/pirans-top-50',
    profile: 'https://www.crownnote.com/users/piran',
    blurb: "Piran's weekly Top 50, charted every Wednesday since ",
    links: [], notice: null
  }
};
/* ?chart=<id> wins so a link can point at one, otherwise the last one chosen. */
function pickChart() {
  var m = /[?&]chart=([a-z]+)/i.exec(location.search), id = m && m[1].toLowerCase();
  /* No memory of the last chart: a bare address always lands on the home page. */
  if (!id || !CHARTS[id] || (!(window.CHART_INDEX || {})[id] && !CHARTS[id].hub && !CHARTS[id].pending)) id = 'personal';
  return id;
}
var CH = CHARTS[pickChart()];
var ART = (CHART_DATA[CH.id] || {}).ART || {}, WEEKS = (CHART_DATA[CH.id] || {}).WEEKS || [];
/* Sergej's chart was a Top 40 in 1980 and is a Top 100 now, so the size comes
   from the data rather than the registry whenever the two disagree. */
/* The order charts appear in, everywhere. Live ones first. */
var CHART_ORDER = ['yellow', 'piran', 'jay', 'sergej', 'macie', 'oliver', 'henessy'];
function orderedCharts() {
  var seen = {}, out = [];
  CHART_ORDER.concat(Object.keys(CHARTS)).forEach(function (id) {
    if (CHARTS[id] && !CHARTS[id].hub && !seen[id]) { seen[id] = 1; out.push(id); }
  });
  return out;
}
var SIZE = CH.size, UNKNOWN = 'Unknown artist';
(function () {
  var d = CHART_DATA[CH.id];
  if (!d || !d.WEEKS.length) return;
  var big = 0, small = 1e9;
  d.WEEKS.forEach(function (w) {
    if (w.chart.length > big) big = w.chart.length;
    if (w.chart.length < small) small = w.chart.length;
  });
  SIZE = big;
  CH.size = big;
  CH.varies = small !== big;
})();
var ACCENT_LINE = CH.line.dark;
document.documentElement.setAttribute('data-chart', CH.id);
document.title = CH.name;

var app = document.getElementById('app');

/* Points a song earns for each week it spends at a position. */
var POINTS = [0, 10000, 7071, 5774, 5000, 4472, 4082, 3780, 3536, 3333, 3162, 3015, 2887,
              2774, 2673, 2582, 2500, 2425, 2357, 2294, 2236, 2182, 2132, 2085, 2041, 2000];
while (POINTS.length <= SIZE) POINTS.push(Math.round(10000 / Math.sqrt(POINTS.length)));
function ptsFor(rank) { return POINTS[rank] || 0; }
/* Year-end and all-time totals stop at the last week of November. December is
   left out entirely so Christmas records don't distort them. */
function counts(date) { return date.slice(5, 7) !== '12'; }

/* Artist banner images. Add "Artist Name": "https://..." and it replaces the
   blurred-artwork default on their page. */
var ARTIST_BANNER = {
};

/* ---------------- helpers ---------------- */
function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function svg(paths, w) {
  var s = '<svg viewBox="0 0 24 24" aria-hidden="true">' + paths + '</svg>';
  var d = document.createElement('span');
  d.innerHTML = s;
  return d.firstChild;
}
function stripDia(s) { try { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { return s; } }
function norm(s) {
  s = stripDia(String(s || '').toLowerCase());
  s = s.replace(/&/g, ' and ').replace(/\$/g, 's').replace(/[\u2018\u2019\u00b4`]/g, "'");
  s = s.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ');
  s = s.replace(/\s-\s*(remaster|remastered|single version|radio edit|explicit|clean).*$/, ' ');
  s = s.replace(/[^a-z0-9']+/g, ' ').replace(/'/g, '');
  return s.trim().replace(/\s+/g, ' ');
}
function loose(s) { return stripDia(String(s || '').toLowerCase()).replace(/[^a-z0-9]+/g, ' ').trim(); }
/* Keeping the separators lets the artist line be rebuilt with each name as its
   own link. \bft\b\.? rather than \bft\.?\b, or the full stop is left behind. */
var SEPRE = /(\s*(?:\bfeaturing\b|\bfeat\b\.?|\bft\b\.?|\bwith\b|&|,)\s*)/i;
/* Acts whose own name contains a separator, shielded before splitting. */
var BANDS = ['Earth, Wind & Fire', 'Tyler, The Creator', 'Chase & Status',
             'Royal & the Serpent', 'The Mamas & The Papas'];
function artistBits(a) {
  var s = String(a || ''), keep = [];
  BANDS.forEach(function (b) {
    var i = s.toLowerCase().indexOf(b.toLowerCase());
    if (i < 0) return;
    keep.push(s.substr(i, b.length));
    s = s.slice(0, i) + '\u0001' + (keep.length - 1) + '\u0002' + s.slice(i + b.length);
  });
  return s.split(SEPRE).map(function (bit) {
    return bit.replace(/\u0001(\d+)\u0002/g, function (_, n) { return keep[+n]; });
  });
}
function splitArtists(a) {
  return artistBits(a).filter(function (_, i) { return i % 2 === 0; })
    .map(function (x) { return x.trim(); }).filter(Boolean);
}
function artistLine(str, cls) {
  var wrap = el('div', cls);
  artistBits(str).forEach(function (bit, i) {
    if (i % 2) { wrap.appendChild(document.createTextNode(bit)); return; }
    var name = bit.trim();
    if (!name) return;
    if (name === UNKNOWN) { wrap.appendChild(document.createTextNode(name)); return; }
    var a = document.createElement('a');
    a.className = 'a-link';
    a.href = '#/artist/' + ARTIST_SLUG[name];
    a.textContent = name;
    a.title = name;
    wrap.appendChild(a);
  });
  return wrap;
}
function bigrams(s) { var o = [], i; for (i = 0; i < s.length - 1; i++) o.push(s.slice(i, i + 2)); return o; }
function dice(a, b) {
  if (a === b) return 1;
  if (!a || !b || a.length < 2 || b.length < 2) return 0;
  var A = bigrams(a), B = bigrams(b), m = Object.create(null), i, g, hit = 0;
  for (i = 0; i < A.length; i++) { g = A[i]; m[g] = (m[g] || 0) + 1; }
  for (i = 0; i < B.length; i++) { g = B[i]; if (m[g] > 0) { hit++; m[g]--; } }
  return (2 * hit) / (A.length + B.length);
}
function fmt(t) {
  if (!isFinite(t) || t < 0) t = 0;
  var m = Math.floor(t / 60), s = Math.floor(t % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}
/* Crownnote sometimes has no cover for a song. When its preview resolves,
   iTunes' artwork fills the gap, and anything already on screen is repainted. */
function setArt(im, t, px) {
  im.src = thumb(t.img, px);
  if (!t.img) (t.imgs || (t.imgs = [])).push([im, px]);
}
function adoptArt(t) {
  if (t.img || !t.cands || !t.cands.length) return;
  var url = (t.cands[t.pick || 0] || {}).art;
  if (!url) return;
  t.img = url;
  (t.imgs || []).forEach(function (p) { p[0].src = thumb(url, p[1]); });
  t.imgs = null;
}

function thumb(u, px) {
  if (!u) return '';
  if (/mzstatic\.com/.test(u)) return u.replace(/\/\d+x\d+bb\./, '/' + px + 'x' + px + 'bb.');
  if (/genius\.com\/unsafe\//.test(u)) return u.replace(/\/unsafe\/\d+x\d+\//, '/unsafe/' + px + 'x' + px + '/');
  return u;
}
var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function ymd(d) { return [+d.slice(0, 4), +d.slice(5, 7), +d.slice(8, 10)]; }
function pretty(d) { var p = ymd(d); return p[2] + ' ' + MONTHS[p[1] - 1] + ' ' + p[0]; }
function shortDate(d) { var p = ymd(d); return p[2] + ' ' + MONTHS[p[1] - 1].slice(0, 3) + ' ' + p[0]; }

/* ---------------- theme ---------------- */
var SUN = '<path d="M12 17a5 5 0 110-10 5 5 0 010 10zm0-13.2a1 1 0 01-1-1V1.5a1 1 0 112 0v1.3a1 1 0 01-1 1zm0 19.7a1 1 0 01-1-1v-1.3a1 1 0 112 0v1.3a1 1 0 01-1 1zM3.8 12a1 1 0 01-1 1H1.5a1 1 0 010-2h1.3a1 1 0 011 1zm19.7 0a1 1 0 01-1 1h-1.3a1 1 0 010-2h1.3a1 1 0 011 1zM5.6 5.6a1 1 0 01-1.4 0l-.9-.9a1 1 0 011.4-1.4l.9.9a1 1 0 010 1.4zm14.1 14.1a1 1 0 01-1.4 0l-.9-.9a1 1 0 011.4-1.4l.9.9a1 1 0 010 1.4zM5.6 18.4a1 1 0 010 1.4l-.9.9a1 1 0 01-1.4-1.4l.9-.9a1 1 0 011.4 0zm14.1-14.1a1 1 0 010 1.4l-.9.9a1 1 0 11-1.4-1.4l.9-.9a1 1 0 011.4 0z"/>';
var MOON = '<path d="M21 14.2A9 9 0 119.8 3a7.2 7.2 0 1011.2 11.2z"/>';
var themeBtn;
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('ycTheme', t); } catch (e) {}
  ACCENT_LINE = CH.line[t] || CH.line.dark;
  document.querySelectorAll('.ring-p').forEach(function (p) { p.setAttribute('stroke', ACCENT_LINE); });
  if (seekFill) seekFill.style.background = ACCENT_LINE;
  if (themeBtn) {
    themeBtn.innerHTML = '';
    themeBtn.appendChild(svg(t === 'dark' ? SUN : MOON));
    themeBtn.title = t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    themeBtn.setAttribute('aria-label', themeBtn.title);
  }
}

/* ---------------- cache ---------------- */
var storageOK = true;
try { localStorage.setItem('__yc', '1'); localStorage.removeItem('__yc'); } catch (e) { storageOK = false; }
var cache = {};
try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {}; } catch (e) { cache = {}; }
var saveTimer = null;
function writeNow() { try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) { storageOK = false; } }
function saveCache() { clearTimeout(saveTimer); saveTimer = setTimeout(writeNow, 400); }
function flushCache() { clearTimeout(saveTimer); saveTimer = null; writeNow(); }
window.addEventListener('pagehide', flushCache);
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flushCache(); });

/* ---------------- JSONP ---------------- */
var jseq = 0;
function jsonp(url, ms) {
  return new Promise(function (res, rej) {
    var cb = 'ycjp' + (++jseq) + '_' + (Date.now() % 100000);
    var sc = document.createElement('script'), done = false;
    var timer = setTimeout(function () { fin(null, new Error('timeout')); }, ms || 12000);
    function fin(d, e) {
      if (done) return;
      done = true; clearTimeout(timer);
      try { delete window[cb]; } catch (x) { window[cb] = undefined; }
      if (sc.parentNode) sc.parentNode.removeChild(sc);
      e ? rej(e) : res(d);
    }
    window[cb] = function (d) { fin(d, null); };
    sc.onerror = function () { fin(null, new Error('network')); };
    sc.src = url + '&callback=' + cb;
    document.head.appendChild(sc);
  });
}

/* ---------------- matching ---------------- */
function scoreCand(c, want) {
  if (!c || !c.previewUrl) return -1;
  if (c.kind && c.kind !== 'song') return -1;
  var ct = norm(c.trackName), ca = norm(c.artistName);
  var t = dice(ct, want.t);
  if (ct === want.t) t = 1;
  else if (ct.indexOf(want.t) === 0 || want.t.indexOf(ct) === 0) t = Math.max(t, 0.9);
  var a = Math.max(dice(ca, want.a), dice(ca, want.prim));
  if (ca === want.prim || ca === want.a) a = 1;
  else if (ca.indexOf(want.prim) >= 0 || want.prim.indexOf(ca) >= 0) a = Math.max(a, 0.88);
  var s = 0.60 * t + 0.40 * a;
  var blob = ((c.trackName || '') + ' ' + (c.artistName || '') + ' ' + (c.collectionName || '')).toLowerCase();
  var src = want.raw.toLowerCase();
  if (/karaoke|tribute|made famous|originally performed|instrumental/.test(blob) &&
      !/karaoke|tribute|instrumental/.test(src)) s -= 0.55;
  if (/\bremix\b|sped up|slowed|nightcore/.test(blob) && !/\bremix\b|sped up|slowed|nightcore/.test(src)) s -= 0.18;
  if (/\blive\b/.test(blob) && !/\blive\b/.test(src)) s -= 0.12;
  return s;
}
function art200(u) { return u ? String(u).replace(/\/\d+x\d+bb/, '/200x200bb') : ''; }
function toCand(c, s) {
  return { id: c.trackId, name: c.trackName, artist: c.artistName, album: c.collectionName,
           url: c.previewUrl, art: art200(c.artworkUrl100 || c.artworkUrl60 || ''),
           score: Math.round((s || 0) * 1000) / 1000 };
}
function pickCands(results, want) {
  var out = [];
  for (var i = 0; i < (results || []).length; i++) {
    var s = scoreCand(results[i], want);
    if (s > 0) out.push({ s: s, c: results[i] });
  }
  out.sort(function (x, y) { return y.s - x.s; });
  return out.slice(0, MAX_CAND).map(function (o) { return toCand(o.c, o.s); });
}

/* ---------------- catalogue ---------------- */
var catalog = Object.create(null);
var songs = [];

function trackFor(r, artMap, quiet, img) {
  var ak = r.title + '|' + r.artist;
  if (catalog[ak]) return catalog[ak];
  var key = norm(r.title) + '|' + norm(r.artist);
  var e = cache[key], p = splitArtists(r.artist);
  var t = {
    title: r.title, artist: r.artist, key: key, artKey: ak, img: img || (artMap || ART)[ak] || '',
    want: { t: norm(r.title), a: norm(r.artist), prim: norm(p[0] || r.artist), raw: r.title + ' ' + r.artist },
    hay: loose(r.title + ' ' + r.artist),
    run: [],
    unknown: r.artist === UNKNOWN,
    cands: (e && e.c) ? e.c : null,
    pick: (e && e.p) ? e.p : 0,
    manual: (e && e.m) ? e.m : null,
    weak: !!(e && e.w && !(e && e.m)),
    state: r.artist === UNKNOWN ? 'dead'
      : (e && (e.m || (e.c && e.c.length))) ? 'ready' : 'idle',
    tries: 0, rank: 0,
    peak: 99, wks: 0, atPeak: 0, runs: 0, first: '9999', last: '0000'
  };
  applyPin(t);
  catalog[ak] = t;
  if (!quiet) songs.push(t);   /* the archive only lists this chart's songs */
  return t;
}
WEEKS.forEach(function (w) {
  w.chart.forEach(function (r, ri) {
    var t = trackFor(r);
    t.run.push({ d: w.date, r: r.rank || ri + 1 });
    t.peak = Math.min(t.peak, r.peak);
    if (r.atPeak && r.atPeak > (t.atPeak || 0)) t.atPeak = r.atPeak;
    t.wks = Math.max(t.wks, r.weeks);
    if (r.peak === 1 && r.atPeak) t.atPeak = Math.max(t.atPeak, r.atPeak);
    t.runs++;
    if (w.date < t.first) t.first = w.date;
    if (w.date > t.last) t.last = w.date;
  });
});
var ARTISTS = [], ARTIST_BY = {}, ARTIST_SLUG = {}, SLUG_ARTIST = {};
(function () {
  var seen = {};

  function slugify(n) {
    var b = loose(n).replace(/\s+/g, '-') || 'artist';
    var sgl = b, k = 2;
    while (seen[sgl]) sgl = b + '-' + (k++);
    seen[sgl] = 1;
    return sgl;
  }
  WEEKS.forEach(function (w) {
    w.chart.forEach(function (r, ri) {
      var rank = r.rank || ri + 1, key = r.title + '|' + r.artist;
      splitArtists(r.artist).forEach(function (name) {
        if (name === UNKNOWN) return;
        var a = ARTIST_BY[name];
        if (!a) {
          a = ARTIST_BY[name] = { name: name, songKeys: {}, songs: 0, weeks: 0, weeksAt1: 0,
                                  no1s: 0, top10s: 0, points: 0, best: 99,
                                  first: '9999', last: '0000', ranks: {} };
          ARTISTS.push(a);
          ARTIST_SLUG[name] = slugify(name);
          SLUG_ARTIST[ARTIST_SLUG[name]] = name;
        }
        a.songKeys[key] = 1;
        a.weeks++;
        a.points += ptsFor(rank);
        if (rank === 1) a.weeksAt1++;
        if (rank < a.best) a.best = rank;
        if (w.date < a.first) a.first = w.date;
        if (w.date > a.last) a.last = w.date;
      });
    });
  });
  ARTISTS.forEach(function (a) {
    a.songs = Object.keys(a.songKeys).length;
    Object.keys(a.songKeys).forEach(function (k) {
      var t = catalog[k];
      if (!t) return;
      if (t.peak === 1) a.no1s++;
      if (t.peak <= 10) a.top10s++;
    });
  });
  [['songs', 0], ['no1s', 0], ['top10s', 0], ['weeks', 0], ['weeksAt1', 0],
   ['points', 0], ['best', 1]].forEach(function (m) {
    var key = m[0], asc = m[1];
    var sorted = ARTISTS.slice().sort(function (x, y) { return asc ? x[key] - y[key] : y[key] - x[key]; });
    var rank = 0, prev = null;
    sorted.forEach(function (a, i) {
      if (a[key] !== prev) { rank = i + 1; prev = a[key]; }
      a.ranks[key] = rank;
    });
  });
})();

var WEEK_BY_DATE = {};
WEEKS.forEach(function (w, i) { WEEK_BY_DATE[w.date] = i; });
/* Charts land on Fridays; the six days before one belong to that same week, so
   any day in the calendar can be clicked. */
var WEEK_OF = {}, WEEK_SPAN = {};
WEEKS.forEach(function (w) { WEEK_OF[w.date] = w.date; });
WEEKS.forEach(function (w) {
  var end = new Date(w.date + 'T00:00:00Z'), start = w.date;
  for (var k = 1; k < 7; k++) {
    var iso = new Date(end.getTime() - k * 86400000).toISOString().slice(0, 10);
    if (WEEK_OF[iso]) break;            /* another chart already claims that day */
    WEEK_OF[iso] = w.date;
    start = iso;
  }
  WEEK_SPAN[w.date] = { start: start, end: w.date };
});

/* ---------------- resolver ---------------- */
var interval = 900, floorInt = 900, MAXINT = 15000, resolved = 0, inFlight = false;
var urgent = [], autoList = [], playhead = 0;
function needs(t) { return t && (t.state === 'idle' || t.state === 'retry'); }
function nextTarget() {
  var i;
  while (urgent.length) { var u = urgent.shift(); if (needs(u)) return u; }
  for (i = playhead; i < autoList.length; i++) if (needs(autoList[i])) return autoList[i];
  for (i = 0; i < playhead && i < autoList.length; i++) if (needs(autoList[i])) return autoList[i];
  return null;
}
function termFor(t) {
  var p = splitArtists(t.artist)[0] || t.artist;
  if (t.tries === 0) return t.title + ' ' + p;
  if (t.tries === 1) return loose(t.title) + ' ' + loose(p);   /* AD\u00c9LA -> adela */
  return t.title;
}
function sure(c, want) {
  if (!c) return false;
  var ct = norm(c.name), ca = norm(c.artist);
  var t = ct === want.t ? 1 : dice(ct, want.t);
  if (ct.indexOf(want.t) === 0 || want.t.indexOf(ct) === 0) t = Math.max(t, 0.9);
  var a = Math.max(dice(ca, want.a), dice(ca, want.prim));
  if (ca === want.prim || ca === want.a) a = 1;
  else if (ca.indexOf(want.prim) >= 0 || want.prim.indexOf(ca) >= 0) a = Math.max(a, 0.88);
  return c.score >= ACCEPT && t >= TITLE_FLOOR && a >= ARTIST_FLOOR;
}
function resolve(t) {
  t.state = 'fetching'; busy(t, true);
  var u = 'https://itunes.apple.com/search?media=music&entity=song&limit=25&term=' + encodeURIComponent(termFor(t));
  return jsonp(u, 12000).then(function (d) {
    var c = pickCands(d && d.results, t.want);
    if (c.length && sure(c[0], t.want)) {
      t.cands = c; t.pick = 0; t.state = 'ready'; t.weak = false;
      adoptArt(t);
      var e = cache[t.key] || {}; e.c = c; e.p = 0; e.w = 0; cache[t.key] = e; saveCache();
      resolved++; if (resolved === 12) floorInt = 3100;
      interval = Math.max(floorInt, interval * 0.92);
    } else if (t.tries < 3) { t.tries++; t.state = 'retry'; }
    else if (c.length) {
      /* Nothing convincing. Keep the near misses so "Wrong track?" can cycle
         them, but flag it rather than pretending it is the right song. */
      t.cands = c; t.pick = 0; t.state = 'ready'; t.weak = true;
      adoptArt(t);
      var e2 = cache[t.key] || {}; e2.c = c; e2.p = 0; e2.w = 1; cache[t.key] = e2; saveCache();
    } else t.state = 'dead';
    busy(t, false); paintBtn(t);
    if (t === cur()) updateDock();
  }).catch(function () {
    interval = Math.min(MAXINT, interval * 1.8);
    t.tries++; t.state = t.tries >= 5 ? 'dead' : 'retry';
    busy(t, false); paintBtn(t);
  });
}
function pump() {
  if (inFlight) return;
  var t = nextTarget();
  if (!t) return;
  inFlight = true;
  resolve(t).then(function () { inFlight = false; setTimeout(pump, interval); });
}
function prioritise(list, from) {
  for (var k = from; k < Math.min(from + 4, list.length); k++) {
    var t = list[k];
    if (needs(t) && urgent.indexOf(t) < 0) urgent.push(t);
  }
  pump();
}

/* ---------------- play buttons ---------------- */
var SVGNS = 'http://www.w3.org/2000/svg';
var btnRefs = Object.create(null);
function resetButtons() { btnRefs = Object.create(null); }
function refs(t) { return btnRefs[t.artKey] || []; }
function busy(t, on) { refs(t).forEach(function (r) { r.pw.classList.toggle('busy', !!on); }); }
function paintBtn(t) {
  var c = chosen(t);
  refs(t).forEach(function (r) {
    r.pw.classList.toggle('dead', t.state === 'dead' && !t.manual);
    r.pw.classList.toggle('weak', !!t.weak && !t.manual);
    r.btn.title = (t.state === 'dead' && !t.manual) ? 'No preview found'
      : (t.weak && !t.manual && c) ? 'Best guess \u2014 ' + c.name + ' \u00b7 ' + c.artist +
          '. Play it and use \u201cWrong track?\u201d if it is not right.'
      : (c ? 'Play preview \u2014 ' + c.name + ' \u00b7 ' + c.artist : 'Play 30 second preview');
  });
}
function setRing(t, f) {
  refs(t).forEach(function (r) {
    r.ring.setAttribute('stroke-dashoffset', String(125.664 * (1 - Math.max(0, Math.min(1, f)))));
  });
}
function setGlyph(t, playing) {
  refs(t).forEach(function (r) {
    r.gp.style.display = playing ? 'none' : '';
    r.gz.style.display = playing ? '' : 'none';
  });
}
function markCur(t, on) {
  refs(t).forEach(function (r) { r.pw.classList.toggle('cur', !!on); });
  if (!on) { setRing(t, 0); setGlyph(t, false); }
}
function playButton(track, getList, ctx) {
  var pw = el('div', 'pw');
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'pb';
  btn.setAttribute('aria-label', 'Play 30 second preview of ' + track.title);
  var s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', '0 0 44 44'); s.setAttribute('aria-hidden', 'true');
  function circ(cls, stroke) {
    var c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('class', cls);
    c.setAttribute('cx', '22'); c.setAttribute('cy', '22'); c.setAttribute('r', '20');
    c.setAttribute('fill', 'none'); c.setAttribute('stroke', stroke); c.setAttribute('stroke-width', '2.4');
    return c;
  }
  var tr = circ('ring-t', 'currentColor'), pr = circ('ring-p', ACCENT_LINE);
  pr.setAttribute('stroke-linecap', 'round');
  pr.setAttribute('transform', 'rotate(-90 22 22)');
  pr.setAttribute('stroke-dasharray', '125.664');
  pr.setAttribute('stroke-dashoffset', '125.664');
  var gp = document.createElementNS(SVGNS, 'path');
  gp.setAttribute('d', 'M18 14 L30.5 22 L18 30 Z'); gp.setAttribute('fill', 'currentColor');
  var gz = document.createElementNS(SVGNS, 'g');
  gz.setAttribute('fill', 'currentColor'); gz.style.display = 'none';
  ['17.5', '23.5'].forEach(function (x) {
    var r = document.createElementNS(SVGNS, 'rect');
    r.setAttribute('x', x); r.setAttribute('y', '15');
    r.setAttribute('width', '3'); r.setAttribute('height', '14');
    gz.appendChild(r);
  });
  s.appendChild(tr); s.appendChild(pr); s.appendChild(gp); s.appendChild(gz);
  btn.appendChild(s);
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    clickTrack(track, getList(), ctx);
  });
  pw.appendChild(btn);
  (btnRefs[track.artKey] = btnRefs[track.artKey] || []).push({ pw: pw, btn: btn, ring: pr, gp: gp, gz: gz });
  paintBtn(track);
  return pw;
}

/* ---------------- audio ---------------- */
var audio = new Audio();
audio.preload = 'auto';
var canVol = true;
try { audio.volume = 0.42; canVol = Math.abs(audio.volume - 0.42) < 0.02; audio.volume = 1; } catch (e) { canVol = false; }
var queue = [], qi = -1, qctx = { kind: 'week' };
var rafId = null, mFade = 0, started = false, errStreak = 0, quiet = false;
function cur() { return qi >= 0 ? queue[qi] : null; }
function chosen(t) { return t ? (t.manual || (t.cands && t.cands[t.pick]) || null) : null; }

function tick() {
  rafId = requestAnimationFrame(tick);
  document.documentElement.classList.toggle('playing', !audio.paused);
  var t = cur();
  if (!t) return;
  var d = audio.duration;
  if (!isFinite(d) || d <= 0) d = 30;
  var p = audio.currentTime;
  setRing(t, p / d);
  if (seekFill) seekFill.style.width = (100 * Math.max(0, Math.min(1, p / d))) + '%';
  if (dTime) dTime.textContent = fmt(p) + ' / ' + fmt(d);
  envelope();
}
/* requestAnimationFrame stops in a hidden tab, so the volume envelope rides on
   timeupdate as well, which keeps firing. Without this the next preview starts
   at whatever volume the last fade-out left behind, which is silence. */
function envelope() {
  if (!canVol || mFade || audio.paused) return;
  var d = audio.duration;
  if (!isFinite(d) || d <= 0) d = 30;
  var p = audio.currentTime;
  audio.volume = Math.max(0, Math.min(1, Math.min(p / FADE, (d - p) / FADE, 1)));
}
audio.addEventListener('timeupdate', envelope);
function startRaf() { if (!rafId) rafId = requestAnimationFrame(tick); }
function stopRaf() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }
function fadeOut(ms) {
  return new Promise(function (done) {
    if (!canVol || audio.paused || document.hidden) { audio.pause(); return done(); }
    mFade = 1;
    var v0 = audio.volume, t0 = (window.performance || Date).now();
    var guard = setTimeout(function () { mFade = 0; audio.pause(); done(); }, ms + 400);
    (function step() {
      var k = ((window.performance || Date).now() - t0) / ms;
      if (k >= 1) { clearTimeout(guard); audio.pause(); mFade = 0; return done(); }
      audio.volume = Math.max(0, v0 * (1 - k));
      requestAnimationFrame(step);
    })();
  });
}
function stopAll() {
  quiet = true;
  audio.pause(); stopRaf();
  var t = cur();
  if (t) markCur(t, false);
  qi = -1; errStreak = 0; started = false;
  hideDock();
  setTimeout(function () { quiet = false; }, 700);
}
function startTrack(t, list, ctx) {
  if (!t || (t.state === 'dead' && !t.manual)) return;
  if (!chosen(t)) {                       /* resolve first, swap the queue only once it plays */
    busy(t, true);
    if (needs(t) && urgent.indexOf(t) < 0) urgent.unshift(t);
    pump();
    var waited = 0;
    var poll = setInterval(function () {
      waited += 150;
      if (chosen(t)) { clearInterval(poll); busy(t, false); startTrack(t, list, ctx); }
      else if (t.state === 'dead' || waited > 20000) { clearInterval(poll); busy(t, false); paintBtn(t); }
    }, 150);
    return;
  }
  var prev = cur();
  if (prev && prev !== t) markCur(prev, false);
  queue = list; qctx = ctx || qctx; qi = list.indexOf(t);
  playhead = Math.max(0, autoList.indexOf(t));
  started = false;
  markCur(t, true); setGlyph(t, true); setRing(t, 0);
  if (canVol) audio.volume = 0;
  audio.src = chosen(t).url;
  try { audio.currentTime = 0; } catch (e) {}
  var pr = audio.play();
  if (pr && pr.catch) pr.catch(function () { setGlyph(t, false); updateDock(); });
  startRaf(); showDock(); updateDock();
  prioritise(queue, qi + 1);
}
function playAt(i) {
  if (i < 0 || i >= queue.length) { stopAll(); return; }
  startTrack(queue[i], queue, qctx);
}
function advance(dir) {
  dir = dir || 1;
  var n = qi + dir;
  while (n >= 0 && n < queue.length && queue[n].state === 'dead' && !queue[n].manual) n += dir;
  if (n < 0 || n >= queue.length) { stopAll(); return; }
  playAt(n);
}
audio.addEventListener('ended', function () { advance(1); });
audio.addEventListener('playing', function () { started = true; errStreak = 0; });
audio.addEventListener('error', function () {
  if (quiet || qi < 0) return;
  if (!audio.error) return;
  if (started) { started = false; advance(1); return; }
  if (++errStreak > 3) { errStreak = 0; stopAll(); return; }
  advance(1);
});
function togglePlay() {
  var t = cur();
  if (!t) return;
  if (audio.paused) {
    var pr = audio.play();
    if (pr && pr.catch) pr.catch(function () {});
    setGlyph(t, true); startRaf(); updateDock();
  } else fadeOut(140).then(function () { setGlyph(t, false); updateDock(); });
}
function clickTrack(track, list, ctx) {
  errStreak = 0;
  if (track.state === 'dead' && !track.manual) return;
  if (cur() === track) { togglePlay(); return; }
  var start = function () { startTrack(track, list, ctx || { kind: 'week' }); };
  if (cur() && !audio.paused) {
    var from = cur();
    fadeOut(140).then(function () { markCur(from, false); start(); });
  } else start();
}
function prevTrack() {
  if (qi < 0) return;
  if (audio.currentTime > 3 || qi === 0) { try { audio.currentTime = 0; } catch (e) {} return; }
  advance(-1);
}

/* ---------------- corrections ---------------- */
function nextMatch() {
  var t = cur();
  if (!t) return;
  if (t.manual) {
    t.manual = null;
    var e0 = cache[t.key] || {}; delete e0.m; cache[t.key] = e0; saveCache();
    if (t.cands && t.cands.length) { playAt(qi); msg('Pinned song removed.'); return; }
  }
  if (!t.cands || !t.cands.length) return;
  var e = cache[t.key] || { c: t.cands, p: 0 };
  if (t.pick + 1 < t.cands.length) {
    t.pick++; e.p = t.pick; e.c = t.cands; cache[t.key] = e; saveCache();
    playAt(qi); msg('Trying match ' + (t.pick + 1) + ' of ' + t.cands.length + '.');
  } else {
    t.cands = null; t.pick = 0; t.tries = 2; t.state = 'idle';
    delete cache[t.key]; saveCache();
    msg('Out of matches \u2014 searching again.');
    if (urgent.indexOf(t) < 0) urgent.unshift(t);
    pump();
  }
}
function parseAppleId(s) {
  s = String(s || '').trim();
  if (!s) return null;
  if (/^\d{6,}$/.test(s)) return s;
  var m = /[?&]i=(\d+)/.exec(s); if (m) return m[1];
  m = /\/(?:id)?(\d{6,})(?:[?#]|$)/.exec(s); if (m) return m[1];
  m = /(\d{8,})/.exec(s); return m ? m[1] : null;
}
function applyLink(raw) {
  var t = cur();
  if (!t) return;
  var id = parseAppleId(raw);
  if (!id) { msg('That does not look like an Apple Music link.', 1); return; }
  msg('Looking it up\u2026');
  jsonp('https://itunes.apple.com/lookup?id=' + encodeURIComponent(id) + '&entity=song', 12000)
    .then(function (d) {
      var r = ((d && d.results) || []).filter(function (x) { return x.previewUrl; })[0];
      if (!r) { msg('No preview on that one \u2014 link the song, not the album.', 1); return; }
      var c = toCand(r, 1);
      t.manual = c;
      var e = cache[t.key] || {}; e.m = c; cache[t.key] = e; saveCache();
      if (t.state === 'dead') t.state = 'ready';
      paintBtn(t); playAt(qi);
      msg('Pinned \u2014 saved for next time.');
      if (linkInp) linkInp.value = '';
    })
    .catch(function () { msg('Lookup failed \u2014 check the link and try again.', 1); });
}

/* ---------------- dock ---------------- */
var dock, seekFill, dTime, dArt, dTitle, dSub, dNum, dToggle, dPrev, dNext, linkInp, msgEl, saysEl;
var msgTimer = null;
var I_PREV = '<path d="M7 6h2.2v12H7z"/><path d="M19.5 6v12l-9.2-6z"/>';
var I_NEXT = '<path d="M14.8 6H17v12h-2.2z"/><path d="M4.5 6v12l9.2-6z"/>';
var I_PLAY = '<path d="M7.5 5v14l11.5-7z"/>';
var I_PAUSE = '<rect x="6.6" y="5" width="3.6" height="14"/><rect x="13.8" y="5" width="3.6" height="14"/>';
var I_X = '<path d="M18.3 6.7l-1-1-5.3 5.3-5.3-5.3-1 1 5.3 5.3-5.3 5.3 1 1 5.3-5.3 5.3 5.3 1-1-5.3-5.3z"/>';
var I_ARROW = '<path d="M13.2 5.6l-1.4 1.4 4 4H4v2h11.8l-4 4 1.4 1.4L19.6 12z"/>';
function cbtn(paths, cls) {
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'cb' + (cls ? ' ' + cls : '');
  b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + paths + '</svg>';
  return b;
}
function msg(text, warn) {
  if (!msgEl) return;
  msgEl.textContent = '';
  msgEl.appendChild(el('b', null, text));
  clearTimeout(msgTimer);
  msgTimer = setTimeout(function () { if (msgEl) msgEl.textContent = ''; }, warn ? 7000 : 4000);
}
function buildDock() {
  if (dock) return;
  dock = el('div', 'dock');
  dock.setAttribute('role', 'region');
  dock.setAttribute('aria-label', 'Preview player');

  var panel = el('div', 'panel'), pin = el('div', 'pin');
  var closeP = el('button', 'panel-close');
  closeP.type = 'button';
  closeP.appendChild(svg(I_X));
  closeP.appendChild(document.createTextNode('Close'));
  closeP.addEventListener('click', function () { dock.classList.remove('open'); padBody(); });

  var says = el('div'); says.style.cssText = 'flex:1 1 180px;min-width:0';
  says.appendChild(el('span', 'lab', 'Chart entry'));
  saysEl = el('div', 'says'); says.appendChild(saysEl);

  var tryB = el('button', 'btn ghost', 'Try next match');
  tryB.type = 'button'; tryB.addEventListener('click', nextMatch);

  var fld = el('div', 'fld');
  fld.appendChild(el('span', 'lab', 'Or pin the right song'));
  linkInp = document.createElement('input');
  linkInp.className = 'inp'; linkInp.type = 'text';
  linkInp.placeholder = 'Paste an Apple Music song link';
  linkInp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyLink(linkInp.value); } });
  fld.appendChild(linkInp);

  var pinB = el('button', 'btn', 'Pin'); pinB.type = 'button';
  pinB.addEventListener('click', function () { applyLink(linkInp.value); });

  msgEl = el('div', 'msg');
  pin.appendChild(closeP); pin.appendChild(says); pin.appendChild(tryB);
  pin.appendChild(fld); pin.appendChild(pinB); pin.appendChild(msgEl);
  panel.appendChild(pin);

  var seek = el('div', 'seek');
  seekFill = document.createElement('i');
  seekFill.style.background = ACCENT_LINE;
  seek.appendChild(seekFill);
  seek.addEventListener('click', function (e) {
    if (qi < 0) return;
    var r = seek.getBoundingClientRect();
    var d = (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : 30;
    try { audio.currentTime = Math.max(0, Math.min(d - 0.05, ((e.clientX - r.left) / r.width) * d)); } catch (x) {}
  });

  var main = el('div', 'dmain');
  dArt = document.createElement('img'); dArt.className = 'dart'; dArt.alt = '';
  var dm = el('div', 'dmeta'), l1 = el('div', 'dl1');
  dNum = el('span', 'dnum'); dTitle = el('span', 'dtitle');
  l1.appendChild(dNum); l1.appendChild(dTitle);
  dSub = el('div', 'dsub');
  dm.appendChild(l1); dm.appendChild(dSub);

  var ctl = el('div', 'dctl');
  dPrev = cbtn(I_PREV); dPrev.title = 'Previous';
  dToggle = cbtn(I_PLAY, 'big'); dToggle.title = 'Play or pause';
  dNext = cbtn(I_NEXT); dNext.title = 'Next';
  dPrev.addEventListener('click', prevTrack);
  dToggle.addEventListener('click', togglePlay);
  dNext.addEventListener('click', function () { advance(1); });
  ctl.appendChild(dPrev); ctl.appendChild(dToggle); ctl.appendChild(dNext);

  dTime = el('div', 'dtime', '0:00 / 0:30');
  var flag = el('button', 'tb flagb', 'Wrong track?');
  flag.type = 'button';
  flag.addEventListener('click', function () { dock.classList.toggle('open'); setTimeout(padBody, 300); });
  var x = cbtn(I_X, 'closeb');
  x.title = 'Close player'; x.setAttribute('aria-label', 'Close player');
  x.addEventListener('click', function () { fadeOut(140).then(stopAll); });

  main.appendChild(dArt); main.appendChild(dm); main.appendChild(ctl);
  main.appendChild(dTime); main.appendChild(flag); main.appendChild(x);
  main.appendChild(flagButton());
  dock.appendChild(panel); dock.appendChild(seek); dock.appendChild(main);
  document.body.appendChild(dock);
}
function dockUp() { return !!dock && dock.classList.contains('up'); }
function padBody() { document.body.style.paddingBottom = dockUp() ? (dock.offsetHeight + 'px') : ''; }
function showDock() {
  buildDock();
  if (dockUp()) return;
  void dock.offsetHeight;
  dock.classList.add('up');
  setTimeout(padBody, 380);
}
function hideDock() {
  if (!dock) return;
  dock.classList.remove('up'); dock.classList.remove('open');
  document.body.style.paddingBottom = '';
}
function updateDock() {
  var t = cur();
  if (!dock || !t) return;
  var c = chosen(t);
  if (!c) return;
  var src = c.art || thumb(t.img, 200);
  if (dArt.getAttribute('src') !== src) dArt.setAttribute('src', src);
  if (qctx.kind === 'week' && t.rank) { dNum.style.display = ''; dNum.textContent = 'No.' + t.rank; }
  else { dNum.style.display = 'none'; }
  dTitle.textContent = c.name;
  dSub.textContent = (c.artist || '') + (c.album ? '  \u00b7  ' + c.album : '') + (t.manual ? '  \u00b7  pinned' : '');
  dToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + (audio.paused ? I_PLAY : I_PAUSE) + '</svg>';
  dNext.disabled = qi >= queue.length - 1;
  if (saysEl) saysEl.textContent = t.title + ' \u2014 ' + t.artist;
}
audio.addEventListener('play', updateDock);
audio.addEventListener('pause', updateDock);
window.addEventListener('resize', padBody);

/* ================= views ================= */
function clearView() {
  closeRun(1);
  closeModal();
  VIEW_DATE = null;
  resetButtons();
  app.textContent = '';
  autoList = []; urgent.length = 0; playhead = 0;
}
function restoreCurrent() {
  var t = cur();
  if (t) { markCur(t, true); setGlyph(t, !audio.paused); }
}

/* ---------------- home ---------------- */
function penguins(canvas) {
  var ctx = canvas.getContext && canvas.getContext('2d'), raf = 0, w = 0, h = 0, dpr = 1;
  var birds = [], puffs = [], flakes = [], last = 0;
  /* The hill: a smooth S from high on the left to the bottom right. */
  function hillY(u) { return h * (0.34 + 0.56 * (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, u)))) / 2); }
  function slope(u) { var d = 0.004; return Math.atan2(hillY(u + d) - hillY(u - d), 2 * d * w); }
  function size() {
    if (!ctx) return;
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function fresh(i) {
    return { u: -0.12 - Math.random() * 1.5, v: 0.03 + Math.random() * 0.075,
             r: 8 + Math.random() * 8, wob: Math.random() * 6,
             g: 0.10 + Math.random() * 0.13 };          /* its own eagerness downhill */
  }
  function seed() {
    birds = [];
    for (var i = 0; i < 11; i++) birds.push(fresh(i));
    birds[0].u = 0.3;  birds[0].v = 0.16;   /* someone is always mid-slide on arrival */
    birds[1].u = 0.06; birds[1].v = 0.1;
    flakes = [];
    for (var k = 0; k < 55; k++) flakes.push({ x: Math.random(), y: Math.random(),
      s: 0.5 + Math.random() * 1.4, d: 0.008 + Math.random() * 0.02, p: Math.random() * 6 });
    puffs = [];
  }
  function penguin(b) {
    var x = b.u * w, y = hillY(b.u), a = slope(b.u), r = b.r;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.translate(0, Math.sin(b.wob) * 0.8);
    ctx.fillStyle = '#16212E';                       /* body, lying on its belly */
    ctx.beginPath(); ctx.ellipse(0, -r * 0.52, r * 1.15, r * 0.52, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#FFFFFF';                       /* belly against the snow */
    ctx.beginPath(); ctx.ellipse(r * 0.08, -r * 0.34, r * 0.92, r * 0.3, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#16212E';                       /* flipper swept back */
    ctx.save(); ctx.rotate(-0.35);
    ctx.beginPath(); ctx.ellipse(-r * 0.15, -r * 0.92, r * 0.5, r * 0.15, 0, 0, 6.2832); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#FF9F43';                       /* feet trailing */
    ctx.beginPath(); ctx.ellipse(-r * 1.16, -r * 0.3, r * 0.26, r * 0.11, -0.3, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#16212E';                       /* head */
    ctx.beginPath(); ctx.arc(r * 1.06, -r * 0.78, r * 0.44, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(r * 1.2, -r * 0.86, r * 0.13, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#16212E';
    ctx.beginPath(); ctx.arc(r * 1.23, -r * 0.86, r * 0.06, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#FF9F43';                       /* beak */
    ctx.beginPath();
    ctx.moveTo(r * 1.42, -r * 0.82); ctx.lineTo(r * 1.8, -r * 0.72); ctx.lineTo(r * 1.42, -r * 0.62);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function frame(now) {
    if (!ctx) return;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    var sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#BFE4FF'); sky.addColorStop(1, '#EEF8FF');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

    flakes.forEach(function (f) {
      f.y += f.d * dt * 12; f.p += dt;
      if (f.y > 1) { f.y = -0.05; f.x = Math.random(); }
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.beginPath();
      ctx.arc((f.x + Math.sin(f.p) * 0.012) * w, f.y * h, f.s, 0, 6.2832);
      ctx.fill();
    });

    ctx.fillStyle = '#D8EEFF';                        /* far hill */
    ctx.beginPath(); ctx.moveTo(0, h);
    for (var u = 0; u <= 1.001; u += 0.02) ctx.lineTo(u * w, hillY(u) + h * 0.13);
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#FFFFFF';                        /* the hill they slide down */
    ctx.beginPath(); ctx.moveTo(0, h);
    for (u = 0; u <= 1.001; u += 0.02) ctx.lineTo(u * w, hillY(u));
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(120,180,225,.55)'; ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (u = 0; u <= 1.001; u += 0.02) (u ? ctx.lineTo : ctx.moveTo).call(ctx, u * w, hillY(u));
    ctx.stroke();

    puffs = puffs.filter(function (p) { return p.life > 0; });
    puffs.forEach(function (p) {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 40 * dt;
      ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, p.life * 1.6).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    });

    birds.forEach(function (b) {
      b.v += Math.sin(slope(b.u)) * b.g * dt * 6;     /* steeper hill, faster slide */
      b.v = Math.min(b.v, 0.5);
      b.u += b.v * dt;
      b.wob += dt * 9;
      if (Math.random() < 0.5) puffs.push({ x: b.u * w - b.r, y: hillY(b.u) + 1,
        vx: -20 - Math.random() * 30, vy: -14 - Math.random() * 16,
        r: 1 + Math.random() * 2.2, life: 0.35 + Math.random() * 0.3 });
      if (b.u > 1.2) { var n = fresh(); b.u = -0.05 - Math.random() * 0.45; b.v = n.v; b.r = n.r; b.g = n.g; }
      penguin(b);
    });
    raf = requestAnimationFrame(frame);
  }
  return {
    start: function () { if (raf || !ctx) return; size(); if (!birds.length) seed(); last = 0; raf = requestAnimationFrame(frame); },
    stop: function () { if (raf) cancelAnimationFrame(raf); raf = 0; if (ctx) ctx.clearRect(0, 0, w, h); },
    resize: size
  };
}

function galaxy(canvas) {
  var ctx = null;
  try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
  if (!ctx) { var noop = function () {}; return { start: noop, stop: noop, size: noop }; }
  var w = 0, h = 0, raf = null, tt = 0, stars = [];
  function size() {
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function build() {
    stars = [];
    for (var i = 0; i < 300; i++) {
      var arm = i % 3;
      var d = Math.pow(Math.random(), 0.62);
      stars.push({
        d: d,
        a: d * 4.6 + arm * (Math.PI * 2 / 3) + (Math.random() - 0.5) * 0.6,
        r: Math.random() * 1.5 + 0.35,
        tw: Math.random() * 6.28,
        sp: 0.12 + Math.random() * 0.3
      });
    }
  }
  function frame() {
    tt += 0.0042;
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2, R = Math.max(w, h) * 0.62;
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.6);
    g.addColorStop(0, 'rgba(255,225,120,.34)');
    g.addColorStop(0.4, 'rgba(255,190,0,.11)');
    g.addColorStop(1, 'rgba(255,209,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = s.a + tt * (1.15 - s.d * 0.8);
      var x = cx + Math.cos(a) * s.d * R * 1.2;
      var y = cy + Math.sin(a) * s.d * R * 0.5;
      var tw = 0.45 + 0.55 * Math.sin(s.tw + tt * 11 * s.sp);
      ctx.globalAlpha = tw * (1 - s.d * 0.4);
      ctx.fillStyle = s.d < 0.22 ? '#FFF4C4' : '#FFD100';
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  return {
    start: function () { if (raf) return; size(); if (!stars.length) build(); frame(); },
    stop: function () { if (raf) { cancelAnimationFrame(raf); raf = null; } ctx.clearRect(0, 0, w, h); },
    size: size
  };
}
function viewHome() {
  clearView();
  var wrap = el('div', 'wrap');
  var hero = el('div', 'hero');

  var mark = document.createElement('button');
  mark.type = 'button'; mark.className = 'wordmark';
  mark.setAttribute('aria-label', CH.name);
  var cv = document.createElement('canvas');
  mark.appendChild(cv);
  var wm = el('span', 'wm');
  wm.appendChild(el('span', null, CH.words[0]));
  wm.appendChild(el('span', null, CH.words[1]));
  mark.appendChild(wm);
  mark.appendChild(el('span', 'tagline', WEEKS.length + ' weeks \u00b7 ' + songs.length + ' songs \u00b7 since ' +
    shortDate(WEEKS[WEEKS.length - 1].date)));
  hero.appendChild(mark);
  wrap.appendChild(hero);

  var gx = sceneFor(cv);
  function lit(on) {
    mark.classList.toggle('lit', on);
    if (on) gx.start(); else setTimeout(function () { if (!mark.classList.contains('lit')) gx.stop(); }, 560);
  }
  mark.addEventListener('mouseenter', function () { lit(true); });
  mark.addEventListener('mouseleave', function () { lit(false); });
  mark.addEventListener('focus', function () { lit(true); });
  mark.addEventListener('blur', function () { lit(false); });
  mark.addEventListener('click', function () { lit(!mark.classList.contains('lit')); });
  window.addEventListener('resize', gx.size);

  var w0 = WEEKS[0];
  var h2 = el('div', 'home-h');
  var hh = el('h2', null, 'This week\u2019s Top 10');
  h2.appendChild(hh);
  h2.appendChild(el('span', null, w0.label));
  wrap.appendChild(h2);

  var ten = w0.chart.slice(0, 10).map(function (r, i) {
    var t = trackFor(r); t.rank = r.rank || i + 1; return t;
  });
  autoList = ten;
  var strip = el('div', 'strip');
  ten.forEach(function (t) {
    var cell = el('div', 't10w');
    var a = document.createElement('a');
    a.className = 't10';
    a.href = '#/week/' + w0.date;
    a.title = 'No.' + t.rank + '  ' + t.title + ' \u2014 ' + t.artist;
    a.addEventListener('click', function () { FLASH = t.artKey; });
    var im = document.createElement('img');
    im.loading = 'lazy'; im.alt = '';
    setArt(im, t, 300);
    a.appendChild(im);
    a.appendChild(el('b', null, String(t.rank)));
    a.appendChild(el('span', 'nm', t.title));
    cell.appendChild(a);
    cell.appendChild(playButton(t, function () { return ten; }, { kind: 'home' }));
    strip.appendChild(cell);
  });
  wrap.appendChild(strip);

  var cta = document.createElement('a');
  cta.className = 'cta'; cta.href = '#/week/' + w0.date;
  cta.appendChild(document.createTextNode('View the full Top ' + SIZE));
  cta.appendChild(svg(I_ARROW));
  wrap.appendChild(cta);

  if (CH.heavy) wrap.appendChild(el('div', 'heavy-note', CH.heavy));

  var grid = el('div', 'home-grid');
  [['#/charts', 'Every chart', WEEKS.length + ' weekly editions going back to ' +
    shortDate(WEEKS[WEEKS.length - 1].date) + '. Browse by year and month.'],
   ['#/archive', 'The archive', 'All ' + songs.length + ' songs that have ever charted, with peaks, ' +
    'weeks on chart and previews. Search and sort however you like.'],
   ['#/records', 'Records', 'Longest runs at No.1, the biggest climbs and falls, and the highest debuts.']]
   .forEach(function (p) {
    var a = document.createElement('a');
    a.className = 'panel-link'; a.href = p[0];
    var strip = el('div', 'pl-strip');
    a.appendChild(strip);
    (function (href) {                     /* built on first hover, not on load */
      var filled = false;
      a.addEventListener('mouseenter', function () {
        if (filled) return;
        filled = true;
        var pics = panelArt(href);
        var reel = el('div', 'pl-reel');
        pics.concat(pics).forEach(function (u) {
          var im = document.createElement('img');
          im.loading = 'lazy'; im.alt = '';
          im.src = thumb(u, 200);
          reel.appendChild(im);
        });
        strip.appendChild(reel);
      });
    })(p[0]);
    a.appendChild(el('b', null, p[1]));
    a.appendChild(el('span', null, p[2]));
    grid.appendChild(a);
  });
  wrap.appendChild(grid);

  var hist = historyBlock();
  if (hist) wrap.appendChild(hist);

  var longs = songs.filter(function (t) { return t.run.length >= 52; })
    .sort(function (x, y) { return y.run.length - x.run.length; });
  if (longs.length) {
    var lh = el('div', 'home-h');
    lh.appendChild(el('h2', null, 'A year or more on the chart'));
    lh.appendChild(el('span', null, longs.length + (longs.length === 1 ? ' song has' : ' songs have') +
      ' spent 52 weeks or more here'));
    wrap.appendChild(lh);
    var lg = el('div', 'long-grid');
    longs.forEach(function (t) {
      var c = el('div', 'long-card');
      var im = document.createElement('img');
      im.className = 'art'; im.loading = 'lazy'; im.alt = '';
      setArt(im, t, 300);
      c.appendChild(im);
      var m = el('div', 'meta');
      m.appendChild(el('div', 'title', t.title));
      m.appendChild(artistLine(t.artist, 'artist'));
      c.appendChild(m);
      var st = el('div', 'long-st');
      function bit(v, lab, sup) {
        var x = el('span', null);
        var b2 = el('b', null, v);
        if (sup) b2.appendChild(el('i', 'x', '\u00d7' + sup));
        x.appendChild(b2);
        x.appendChild(el('i', 'l', lab));
        return x;
      }
      st.appendChild(bit(String(t.peak), 'Peak', t.atPeak));
      st.appendChild(bit(String(t.run.length), 'Weeks'));
      var yrs = t.run.length / 52;
      st.appendChild(bit(yrs.toFixed(1), 'Years'));
      c.appendChild(st);
      c.appendChild(playButton(t, function () { return longs; }, { kind: 'long' }));
      wireRun(c, t);
      lg.appendChild(c);
    });
    wrap.appendChild(lg);
  }

  app.appendChild(wrap);
  restoreCurrent();
  pump();
}

/* A handful of covers from whatever that page is actually made of. */
function panelArt(href) {
  var out = [], i;
  function pick(arr, n, get) {
    var pool = arr.slice(), r;
    for (i = 0; i < n && pool.length; i++) {
      r = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      var u = get(r);
      if (u) out.push(u);
    }
  }
  if (href === '#/charts') {
    pick(WEEKS, 12, function (w) { return ART[w.chart[0].title + '|' + w.chart[0].artist]; });
  } else if (href === '#/records') {
    var R = records(), seen = {};
    ['one', 'weeks', 'climb', 'fall', 'debut'].forEach(function (k) {
      R[k].forEach(function (x) {
        var key = x.r.title + '|' + x.r.artist;
        if (seen[key] || !ART[key]) return;
        seen[key] = 1;
        out.push(ART[key]);
      });
    });
    out = out.slice(0, 12);
  } else {
    pick(songs, 12, function (t) { return t.img; });
  }
  return out.filter(Boolean);
}

/* ---------------- chart index ---------------- */
var chartsYear = null;
function viewCharts() {
  clearView();
  var wrap = el('div', 'wrap');
  var head = el('div', 'home-h');
  head.appendChild(el('h2', null, 'Every Top ' + SIZE));
  head.appendChild(el('span', null, WEEKS.length + ' weeks \u00b7 newest first'));
  wrap.appendChild(head);

  var years = [];
  WEEKS.forEach(function (w) {
    var y = w.date.slice(0, 4);
    if (years.indexOf(y) < 0) years.push(y);
  });
  years.sort().reverse();
  if (years.indexOf(chartsYear) < 0) chartsYear = years[0];
  var yi = years.indexOf(chartsYear);
  var ybar = el('div', 'yr-nav');
  var yb = el('button', 'yr-arrow', '\u2039');
  yb.type = 'button'; yb.title = 'Later year'; yb.disabled = yi <= 0;
  yb.addEventListener('click', function () { chartsYear = years[yi - 1]; viewCharts(); });
  var yf = el('button', 'yr-arrow', '\u203a');
  yf.type = 'button'; yf.title = 'Earlier year'; yf.disabled = yi >= years.length - 1;
  yf.addEventListener('click', function () { chartsYear = years[yi + 1]; viewCharts(); });
  var ylab = el('div', 'yr', chartsYear);
  var n = WEEKS.filter(function (x) { return x.date.slice(0, 4) === chartsYear; }).length;
  ylab.appendChild(el('small', null, n + (n === 1 ? ' week' : ' weeks')));
  ybar.appendChild(yb); ybar.appendChild(ylab); ybar.appendChild(yf);
  wrap.appendChild(ybar);

  var month = null, tiles = null;
  WEEKS.filter(function (w) { return w.date.slice(0, 4) === chartsYear; }).forEach(function (w) {
    var p = ymd(w.date), mo = MONTHS[p[1] - 1];
    if (mo !== month) {
      month = mo;
      wrap.appendChild(el('div', 'mo', mo));
      tiles = el('div', 'tiles');
      wrap.appendChild(tiles);
    }
    var top = w.chart[0];
    var box = el('div', 'tile-wrap');
    var a = document.createElement('a');
    a.className = 'tile'; a.href = '#/week/' + w.date;
    var im = document.createElement('img');
    im.loading = 'lazy'; im.alt = '';
    im.src = thumb(ART[top.title + '|' + top.artist] || '', 300);
    a.appendChild(im);
    var cap = el('div', 'cap');
    cap.appendChild(el('small', null, 'View chart for'));
    cap.appendChild(el('b', null, w.label));
    cap.appendChild(svg(I_ARROW));
    a.appendChild(cap);
    box.appendChild(a);
    tiles.appendChild(box);
  });
  app.appendChild(wrap);
  restoreCurrent();
}

/* ---------------- archive ---------------- */
var arcState = { q: '', sort: 'peak', no1: false, shown: 120 };
function viewArchive() {
  clearView();
  var wrap = el('div', 'wrap');
  var head = el('div', 'home-h');
  head.appendChild(el('h2', null, 'The archive'));
  head.appendChild(el('span', null, 'Every song that has ever charted'));
  wrap.appendChild(head);

  var tools = el('div', 'arc-tools');
  var q = document.createElement('input');
  q.className = 'srch'; q.type = 'search';
  q.placeholder = 'Search ' + songs.length + ' songs by title or artist\u2026';
  q.value = arcState.q;
  tools.appendChild(q);

  var sel = document.createElement('select');
  sel.className = 'sel';
  [['peak', 'Highest peak'], ['weeks', 'Most weeks on chart'], ['no1', 'Most weeks at No.1'],
   ['runs', 'Most appearances'], ['recent', 'Most recent'], ['first', 'First charted'],
   ['title', 'Title A\u2013Z'], ['artist', 'Artist A\u2013Z']].forEach(function (o) {
    var op = document.createElement('option');
    op.value = o[0]; op.textContent = o[1];
    sel.appendChild(op);
  });
  sel.value = arcState.sort;
  tools.appendChild(sel);

  var chip = el('button', 'chip' + (arcState.no1 ? ' on' : ''), 'No.1s only');
  chip.type = 'button';
  tools.appendChild(chip);
  wrap.appendChild(tools);

  var count = el('div', 'arc-count');
  var cards = el('div', 'cards');
  var moreWrap = el('div');
  wrap.appendChild(count); wrap.appendChild(cards); wrap.appendChild(moreWrap);
  app.appendChild(wrap);

  var list = [];
  function compute() {
    var needle = loose(arcState.q);
    list = songs.filter(function (t) {
      if (arcState.no1 && t.peak !== 1) return false;
      return !needle || t.hay.indexOf(needle) >= 0;
    });
    var s = arcState.sort;
    list.sort(function (a, b) {
      if (s === 'peak') return a.peak - b.peak || b.wks - a.wks || a.title.localeCompare(b.title);
      if (s === 'weeks') return b.wks - a.wks || a.peak - b.peak;
      if (s === 'no1') return b.atPeak - a.atPeak || a.peak - b.peak || b.wks - a.wks;
      if (s === 'runs') return b.runs - a.runs || a.peak - b.peak;
      if (s === 'recent') return b.last.localeCompare(a.last) || a.peak - b.peak;
      if (s === 'first') return a.first.localeCompare(b.first) || a.peak - b.peak;
      if (s === 'title') return a.title.localeCompare(b.title);
      return a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title);
    });
  }
  function render() {
    resetButtons();
    cards.textContent = ''; moreWrap.textContent = '';
    count.textContent = list.length + (list.length === 1 ? ' song' : ' songs');
    if (!list.length) {
      cards.appendChild(el('div', 'empty', 'Nothing matches that search.'));
      return;
    }
    var n = Math.min(arcState.shown, list.length);
    for (var i = 0; i < n; i++) cards.appendChild(card(list[i]));
    if (n < list.length) {
      var b = el('button', 'more', 'Show ' + Math.min(120, list.length - n) + ' more');
      b.type = 'button';
      b.addEventListener('click', function () {
        var y = (window.pageYOffset || window.scrollY || 0);
        arcState.shown += 120;
        render();
        if (window.scrollTo) window.scrollTo(0, y);   /* stay where you were */
      });
      moreWrap.appendChild(b);
    }
    restoreCurrent();
  }
  function card(t) {
    var c = el('div', 'card');
    var im = document.createElement('img');
    im.loading = 'lazy'; im.alt = '';
    setArt(im, t, 200);
    c.appendChild(im);
    var m = el('div', 'cm');
    m.appendChild(el('div', 'ct', t.title));
    m.appendChild(artistLine(t.artist, 'ca'));
    var st = el('div', 'cs');
    var pk = el('b', t.peak === 1 ? 'p1' : null, 'No.' + t.peak);
    st.appendChild(pk);
    st.appendChild(document.createTextNode(' peak \u00b7 '));
    st.appendChild(el('b', null, String(t.wks)));
    st.appendChild(document.createTextNode(t.wks === 1 ? ' week' : ' weeks'));
    if (t.atPeak) st.appendChild(document.createTextNode(' \u00b7 ' + t.atPeak + ' at No.1'));
    m.appendChild(st);
    c.appendChild(m);
    c.appendChild(playButton(t, function () { return list; }, { kind: 'archive' }));
    return c;
  }
  var deb = null;
  q.addEventListener('input', function () {
    clearTimeout(deb);
    deb = setTimeout(function () {
      arcState.q = q.value; arcState.shown = 120; compute(); render();
    }, 160);
  });
  sel.addEventListener('change', function () {
    arcState.sort = sel.value; arcState.shown = 120; compute(); render();
  });
  chip.addEventListener('click', function () {
    arcState.no1 = !arcState.no1;
    chip.classList.toggle('on', arcState.no1);
    arcState.shown = 120; compute(); render();
  });
  compute(); render();
}

/* ---------------- one chart week ---------------- */
function rankCell(rank, lw, i) {
  var cell = el('div', 'rank');
  cell.appendChild(el('span', 'n', String(rank)));
  var node = null, label = '';
  if (lw === 'NE') { node = el('span', 'tag new', 'NEW'); label = 'New entry'; }
  else if (lw === 'RE') { node = el('span', 'tag re', 'RE'); label = 'Re-entry'; }
  else if (typeof lw === 'number' && lw !== rank) {
    var d = lw - rank, n = Math.abs(d);
    node = el('i', 'mvb ' + (d > 0 ? 'up' : 'down'));
    node.setAttribute('aria-hidden', 'true');
    label = (d > 0 ? 'Up ' : 'Down ') + n + (n === 1 ? ' place' : ' places');
    node.title = label;
    node.style.setProperty('--d', (i * 45) + 'ms');
    cell.appendChild(node);
    cell.appendChild(el('span', 'sr', label));
    return cell;
  }
  if (node) {
    node.title = label;
    node.style.setProperty('--d', (i * 45) + 'ms');
    cell.appendChild(node);
  }
  return cell;
}
function titleFor(t, isOne) {
  var node = el('div', 'title'), tier = 1;
  if (!isOne) { node.textContent = t.title; return { node: node, tier: tier }; }
  var m = /^(.+?)\s*([(\[][^)\]]*[)\]])$/.exec(t.title);
  var main = m ? m[1] : t.title;
  node.appendChild(document.createTextNode(main));
  if (m) node.appendChild(el('span', 'paren', ' ' + m[2]));
  var n = main.length;
  tier = n <= 20 ? 1 : n <= 30 ? 2 : n <= 42 ? 3 : n <= 58 ? 4 : 5;
  return { node: node, tier: tier };
}
function viewWeek(date) {
  var wi = WEEK_BY_DATE[date];
  if (wi === undefined) { location.hash = '#/charts'; return; }
  clearView();
  var w = WEEKS[wi];
  VIEW_DATE = date;
  var wrap = el('div', 'wrap');

  var head = el('div', 'week-head');
  var lede = el('div', 'lede');
  var h1 = el('h1', null, w.label);
  lede.appendChild(h1);
  var p = el('p');
  var src = document.createElement('a');
  src.href = CH.crownnote + (w.id && w.id !== '0' ? '-' + w.id : '');
  src.target = '_blank'; src.rel = 'noopener';
  src.textContent = 'View on Crownnote';
  p.appendChild(src);
  lede.appendChild(p);
  head.appendChild(lede);

  if (CH.notice && w.date === CH.notice.date) {
    var nb = el('button', 'notice-btn', '!');
    nb.type = 'button';
    nb.title = 'Read the notice for this week';
    nb.setAttribute('aria-label', 'Read the notice for this week');
    head.appendChild(nb);
  }

  var filtSlot = el('div', 'filt-slot');
  head.appendChild(filtSlot);

  var nav = el('div', 'wknav');
  var older = el('button', 'wbtn', '\u2039');
  older.type = 'button'; older.title = 'Older week';
  older.disabled = wi >= WEEKS.length - 1;
  var calWrap = el('div', 'cal-wrap');
  var calBtn = el('button', 'cal-btn');
  calBtn.type = 'button';
  calBtn.appendChild(svg('<path d="M7 2v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm12 7v10H5V9h14z"/>'));
  calBtn.appendChild(document.createTextNode(w.label));
  var cal = el('div', 'cal');
  calWrap.appendChild(calBtn); calWrap.appendChild(cal);
  var newer = el('button', 'wbtn', '\u203a');
  newer.type = 'button'; newer.title = 'Newer week';
  newer.disabled = wi <= 0;
  nav.appendChild(older); nav.appendChild(calWrap); nav.appendChild(newer);
  head.appendChild(nav);
  wrap.appendChild(head);

  older.addEventListener('click', function () { location.hash = '#/week/' + WEEKS[wi + 1].date; });
  newer.addEventListener('click', function () { location.hash = '#/week/' + WEEKS[wi - 1].date; });
  buildCalendar(cal, calBtn, w.date);

  if (CH.notice && w.date === CH.notice.date) {
    var box = el('div', 'notice');
    var inner = el('div', 'notice-in');
    inner.appendChild(el('b', null, 'Notice'));
    inner.appendChild(el('p', null, CH.notice.body));
    inner.appendChild(el('div', 'sig', CH.notice.sign));
    box.appendChild(inner);
    wrap.appendChild(box);
    head.querySelector('.notice-btn').addEventListener('click', function () {
      box.classList.toggle('open');
    });
  }

  var chart = el('div', 'chart');
  var topTen = el('div', 'top10');
  chart.appendChild(topTen);
  var list = w.chart.map(function (r, i) {
    var t = trackFor(r); t.rank = r.rank || i + 1; return t;
  });
  autoList = list;
  var rowsInfo = [];
  w.chart.forEach(function (r, i) {
    var row = buildRow(list[i], i, r, list);
    rowsInfo.push({ el: row, tags: tagsFor(r, list[i].rank, list[i]) });
    (i < 10 ? topTen : chart).appendChild(row);
  });
  filtSlot.appendChild(buildFilters(rowsInfo));
  wrap.appendChild(chart);

  var drops = dropoutsFor(wi);
  if (drops.length) {
    var db = el('button', 'drop-btn', 'View ' + drops.length + ' dropout' + (drops.length === 1 ? '' : 's'));
    db.type = 'button';
    db.addEventListener('click', function () { showDropouts(w, drops); });
    wrap.appendChild(db);
  }
  app.appendChild(wrap);
  restoreCurrent();
  settleFlash();
  pump();
}

/* Songs on last week's chart that are not on this one. Their peak and weeks are
   whatever they stood at then, which is what Crownnote prints too. */
function dropoutsFor(wi) {
  var prev = WEEKS[wi + 1];
  if (!prev) return [];
  var here = {};
  WEEKS[wi].chart.forEach(function (r) { here[r.title + '|' + r.artist] = 1; });
  var out = [];
  prev.chart.forEach(function (r, i) {
    if (!here[r.title + '|' + r.artist]) out.push({ r: r, lw: r.rank || i + 1 });
  });
  return out;
}
function showDropouts(w, drops) {
  var body = openModal('Dropouts', drops.length + ' left the chart on ' + shortDate(w.date));
  var grid = el('div', 'drop-grid');
  drops.forEach(function (d) {
    var t = trackFor(d.r);
    var c = el('div', 'drop-card');
    var im = document.createElement('img');
    im.className = 'art'; im.loading = 'lazy'; im.alt = '';
    setArt(im, t, 200);
    c.appendChild(im);
    var m = el('div', 'meta');
    m.appendChild(el('div', 'title', t.title));
    m.appendChild(artistLine(t.artist, 'artist'));
    var st = el('div', 'drop-st');
    function bit(v, lab) {
      var x = el('span', null);
      x.appendChild(el('b', null, v));
      x.appendChild(el('i', null, lab));
      return x;
    }
    st.appendChild(bit('No.' + d.lw, 'Last week'));
    var pk = String(d.r.peak) + (d.r.atPeak ? ' \u00d7' + d.r.atPeak : '');
    st.appendChild(bit(pk, 'Peak'));
    st.appendChild(bit(String(d.r.weeks), 'Weeks'));
    m.appendChild(st);
    c.appendChild(m);
    c.appendChild(playButton(t, function () { return drops.map(function (x) { return trackFor(x.r); }); }, { kind: 'drop' }));
    grid.appendChild(c);
  });
  body.appendChild(grid);
  restoreCurrent();
}

/* Include, exclude, or ignore each category. */
var FUNNEL = '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5z"/>';
function buildFilters(rowsInfo) {
  var state = {};
  var btn = el('button', 'filt-btn');
  btn.type = 'button';
  btn.appendChild(svg(FUNNEL));
  btn.appendChild(document.createTextNode('Filters'));
  var badge = el('i', 'filt-b');
  btn.appendChild(badge);
  var count = el('span', 'filt-n');
  function live() {
    var n = 0, k;
    for (k in state) if (state[k]) n++;
    return n;
  }
  function apply() {
    var inc = [], exc = [], k;
    for (k in state) { if (state[k] === 1) inc.push(k); else if (state[k] === -1) exc.push(k); }
    var shown = 0;
    rowsInfo.forEach(function (ri) {
      var ok = !inc.length || inc.some(function (c) { return ri.tags.indexOf(c) >= 0; });
      if (ok && exc.some(function (c) { return ri.tags.indexOf(c) >= 0; })) ok = false;
      ri.el.classList.toggle('hid', !ok);
      if (ok) shown++;
    });
    closeRun(1);
    count.textContent = shown + ' of ' + rowsInfo.length + ' songs shown';
    badge.textContent = live() ? String(live()) : '';
    btn.classList.toggle('on', !!live());
  }
  function chip(key, label, glyph, small) {
    var b = el('button', 'chip' + (small ? ' sm' : '') +
      (state[key] === 1 ? ' inc' : state[key] === -1 ? ' exc' : ''));
    b.type = 'button';
    if (glyph) b.appendChild(el('i', 'g', glyph));
    b.appendChild(document.createTextNode(label));
    b.addEventListener('click', function () {
      state[key] = state[key] === 1 ? -1 : state[key] === -1 ? 0 : 1;
      b.classList.toggle('inc', state[key] === 1);
      b.classList.toggle('exc', state[key] === -1);
      b.title = state[key] === 1 ? 'Showing only these \u2014 click to exclude'
              : state[key] === -1 ? 'Hiding these \u2014 click to clear' : 'Click to show only these';
      apply();
    });
    b.title = 'Click to show only these';
    return b;
  }
  btn.addEventListener('click', function () {
    var body = openModal('Filter this chart',
      'Click once to show only those, again to hide them');
    var pop = el('div', 'filt-pop');
    var main = el('div', 'filt-row');
    CATS.forEach(function (c) { main.appendChild(chip(c[0], c[1], c[2])); });
    pop.appendChild(main);
    var more = el('div', 'filt-row sm');
    CATS2.forEach(function (c) { more.appendChild(chip(c[0], c[1], null, 1)); });
    pop.appendChild(more);
    var foot = el('div', 'filt-foot');
    foot.appendChild(count);
    var clr = el('button', 'filt-clear', 'Clear all');
    clr.type = 'button';
    clr.addEventListener('click', function () {
      state = {};
      [].forEach.call(pop.querySelectorAll('.chip'), function (b) {
        b.classList.remove('inc'); b.classList.remove('exc');
      });
      apply();
    });
    foot.appendChild(clr);
    pop.appendChild(foot);
    body.appendChild(pop);
    apply();
  });
  return btn;
}
function buildRow(t, i, data, list) {
  var row = el('div', 'row' + (t.rank === 1 ? ' one' : ''));
  row.setAttribute('data-k', t.artKey);
  row.appendChild(rankCell(t.rank, data.lw, i));

  var img = document.createElement('img');
  img.className = 'art'; img.loading = 'lazy'; img.alt = '';
  if (t.img) {
    setArt(img, t, t.rank === 1 ? 600 : 300);
    img.addEventListener('error', function () { if (img.src !== t.img) img.src = t.img; });
  }
  row.appendChild(img);

  var meta = el('div', 'meta');
  var ti = titleFor(t, t.rank === 1);
  if (ti.tier > 1) row.classList.add('t' + ti.tier);
  meta.appendChild(ti.node);
  meta.appendChild(artistLine(t.artist, 'artist'));
  if (t.rank === 1 && data.atPeak) {
    meta.appendChild(el('span', 'crown', data.atPeak + (data.atPeak === 1 ? ' week' : ' weeks') + ' at No.1'));
  }
  meta.appendChild(el('div', 'sub',
    (typeof data.lw === 'number' ? 'LW ' + data.lw : data.lw === 'NE' ? 'New' : 'Re-entry') +
    ' \u00b7 Peak ' + data.peak + ' \u00b7 ' + data.weeks + (data.weeks === 1 ? ' week' : ' weeks')));
  row.appendChild(meta);

  function stat(val, label, x) {
    var d = el('div', 'stat st');
    var b = el('b', null, String(val));
    if (x) b.appendChild(el('span', 'x', '\u00d7' + x));
    d.appendChild(b); d.appendChild(el('span', null, label));
    return d;
  }
  row.appendChild(stat(typeof data.lw === 'number' ? data.lw : data.lw === 'NE' ? '\u2013' : 'RE', 'Last wk'));
  row.appendChild(stat(data.peak, 'Peak', data.atPeak));
  row.appendChild(stat(data.weeks, 'Weeks'));
  row.appendChild(playButton(t, function () { return list; }, { kind: 'week' }));
  wireRun(row, t);
  return row;
}

/* ---------------- calendar ---------------- */
function buildCalendar(cal, btn, activeDate) {
  var months = false;
  var p = ymd(activeDate);
  var view = { y: p[0], m: p[1] };
  cal.addEventListener('wheel', function (e) {
    if (!months) return;
    e.preventDefault();
    var ny = view.y + (e.deltaY < 0 ? -1 : 1);
    if (ny >= +first.slice(0, 4) && ny <= +last.slice(0, 4)) { view.y = ny; draw(); }
  }, { passive: false });
  var first = WEEKS[WEEKS.length - 1].date, last = WEEKS[0].date;
  function draw() {
    cal.textContent = '';
    var top = el('div', 'cal-top');
    var back = el('button', 'cal-nav', '\u2039'); back.type = 'button';
    var fwd = el('button', 'cal-nav', '\u203a'); fwd.type = 'button';
    var y0 = +first.slice(0, 4), y1 = +last.slice(0, 4);
    var lbl = el('button', 'cal-lbl', months ? String(view.y) : MONTHS[view.m - 1] + ' ' + view.y);
    lbl.type = 'button';
    lbl.title = months ? 'Back to the days' : 'Pick a month or year';
    lbl.addEventListener('click', function (e) { e.stopPropagation(); months = !months; draw(); });
    var cursor = view.y * 12 + view.m;
    if (months) {
      back.disabled = view.y <= y0;
      fwd.disabled = view.y >= y1;
    } else {
      back.disabled = cursor <= y0 * 12 + (+first.slice(5, 7));
      fwd.disabled = cursor >= y1 * 12 + (+last.slice(5, 7));
    }
    /* draw() empties the popover, which detaches the button that was just
       clicked — without this the outside-click handler then sees the target as
       outside and shuts the calendar instead of changing month. */
    back.addEventListener('click', function (e) {
      e.stopPropagation();
      if (months) view.y--;
      else { view.m--; if (view.m < 1) { view.m = 12; view.y--; } }
      draw();
    });
    fwd.addEventListener('click', function (e) {
      e.stopPropagation();
      if (months) view.y++;
      else { view.m++; if (view.m > 12) { view.m = 1; view.y++; } }
      draw();
    });
    top.appendChild(back); top.appendChild(lbl); top.appendChild(fwd);
    cal.appendChild(top);

    if (months) {
      var mg = el('div', 'cal-months');
      for (var mi = 1; mi <= 12; mi++) {
        var iso0 = view.y + '-' + String(mi).padStart(2, '0');
        var any = WEEKS.some(function (w) { return w.date.slice(0, 7) === iso0; });
        var mb = el('button', 'cal-m' + (mi === view.m ? ' now' : '') + (any ? ' has' : ''),
          MONTHS[mi - 1].slice(0, 3));
        mb.type = 'button';
        mb.disabled = !any;
        (function (m) {
          mb.addEventListener('click', function (e) {
            e.stopPropagation();
            view.m = m; months = false; draw();
          });
        })(mi);
        mg.appendChild(mb);
      }
      cal.appendChild(mg);
      cal.appendChild(el('div', 'cal-hint', 'Scroll here to change year'));
      return;
    }

    var grid = el('div', 'cal-grid');
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(function (d) {
      grid.appendChild(el('div', 'cal-dow', d));
    });
    var firstDay = new Date(Date.UTC(view.y, view.m - 1, 1));
    var lead = (firstDay.getUTCDay() + 6) % 7;
    var days = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate();
    var i;
    for (i = 0; i < lead; i++) grid.appendChild(el('div', 'cal-d'));
    for (i = 1; i <= days; i++) {
      var iso = view.y + '-' + String(view.m).padStart(2, '0') + '-' + String(i).padStart(2, '0');
      var owner = WEEK_OF[iso];                 /* the chart week this day belongs to */
      var has = WEEK_BY_DATE[iso] !== undefined;
      var cls = 'cal-d';
      if (owner) {
        cls += has ? ' has' : ' inweek';
        if (WEEK_SPAN[owner] && WEEK_SPAN[owner].start === iso) cls += ' wstart';
        if (has) cls += ' wend';
      }
      if (iso === activeDate) cls += ' now';
      var d = el(owner ? 'button' : 'div', cls, String(i));
      if (owner) {
        d.type = 'button';
        d.title = has ? 'Chart for ' + pretty(iso)
                      : 'Part of the week ending ' + pretty(owner);
        (function (date) {
          d.addEventListener('click', function (e) {
            e.stopPropagation();
            cal.classList.remove('open');
            location.hash = '#/week/' + date;
          });
        })(owner);
      }
      grid.appendChild(d);
    }
    cal.appendChild(grid);
    cal.appendChild(el('div', 'cal-hint', 'Pick any day \u2014 it opens that week\u2019s chart'));
  }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = cal.classList.toggle('open');
    if (open) { view.y = p[0]; view.m = p[1]; draw(); }
  });
  document.addEventListener('click', function (e) {
    if (cal.classList.contains('open') && !cal.contains(e.target) && e.target !== btn) {
      cal.classList.remove('open');
    }
  });
}

/* ---------------- chrome ---------------- */
function buildHeader() {
  var head = el('header', 'site-head');
  var inner = el('div', 'head-in');
  var brand = document.createElement('a');
  brand.className = 'brand'; brand.href = '#/'; brand.textContent = CH.brand;
  var bwrap = el('div', 'brand-wrap');
  bwrap.appendChild(brand);

  var swBtn = el('button', 'brand-sw', '\u25be');
  swBtn.type = 'button';
  swBtn.title = 'Switch chart';
  swBtn.setAttribute('aria-label', 'Switch chart');
  swBtn.setAttribute('aria-haspopup', 'true');
  swBtn.setAttribute('aria-expanded', 'false');
  var menu = el('div', 'sw-menu');
  menu.appendChild(el('div', 'sw-h', 'Charts'));
  orderedCharts().forEach(function (id) {
    var c = CHARTS[id], d = (window.CHART_INDEX || {})[id];
    if (!d && !c.pending) return;   /* home has its own button */
    var a = document.createElement('a');
    a.className = 'sw-item' + (id === CH.id ? ' on' : '') + (d ? '' : ' soon');
    a.href = '?chart=' + id + '#/';
    var dot = el('span', 'sw-dot');
    dot.style.background = c.swatch;
    a.appendChild(dot);
    var txt = el('span', 'sw-txt');
    txt.appendChild(el('b', null, c.name));
    txt.appendChild(el('i', null, d
      ? (d.varies ? 'Every chart' : 'Top ' + d.size) + ' \u00b7 ' + d.weeks + ' weeks'
      : 'Coming soon'));
    a.appendChild(txt);
    if (id === CH.id) a.appendChild(el('span', 'sw-tick', '\u2713'));
    menu.appendChild(a);
  });
  bwrap.appendChild(swBtn);
  bwrap.appendChild(menu);
  function shut() { menu.classList.remove('open'); swBtn.setAttribute('aria-expanded', 'false'); }
  swBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = menu.classList.toggle('open');
    swBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) { if (!bwrap.contains(e.target)) shut(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });
  var homeBtn = document.createElement('a');
  homeBtn.className = 'home-btn' + (CH.hub ? ' on' : '');
  homeBtn.href = '?chart=personal#/';
  homeBtn.title = 'The Personal Charts';
  homeBtn.setAttribute('aria-label', 'The Personal Charts');
  homeBtn.appendChild(svg('<path d="M12 3 2 11h3v9h6v-6h2v6h6v-9h3L12 3z"/>'));
  bwrap.appendChild(homeBtn);
  inner.appendChild(bwrap);
  var srch = el('button', 'icon-btn srch-btn');
  srch.type = 'button';
  srch.title = 'Search  ( / )';
  srch.setAttribute('aria-label', 'Search');
  srch.appendChild(svg(I_SEARCH));
  srch.addEventListener('click', openSearch);
  inner.appendChild(srch);
  var nav = el('nav', 'nav');
  /* Two chartmakers overlap so heavily that the page says little. It comes back
     on its own once a third chart joins. */
  ((CH.hub || !WEEKS.length) ? (dataCharts().length > 2 && CH.hub ? [['#/overlap', 'On Every Chart', 0]] : []) :
   [['#/week/' + WEEKS[0].date, 'This week', 0], ['#/charts', CH.varies ? 'Every chart' : 'Top ' + SIZE + 's', 0],
   ['#/archive', 'Archive', 0]]
   .concat(dataCharts().length > 2 ? [['#/overlap', 'On Every Chart', 0]] : [])
   .concat([['#/year-end', 'Year End', 1], ['#/all-time', 'All-Time', 1]]))
    .forEach(function (n) {
      var a = document.createElement('a');
      a.href = n[0];
      if (n[2]) { a.className = 'starred'; a.appendChild(el('span', 'star', '\u2605')); }
      a.appendChild(document.createTextNode(n[1]));
      a.setAttribute('data-nav', n[0].split('/')[1]);
      nav.appendChild(a);
    });
  inner.appendChild(nav);
  inner.appendChild(buildShuffle());
  themeBtn = el('button', 'icon-btn theme-btn');
  themeBtn.type = 'button';
  themeBtn.addEventListener('click', function () {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  inner.appendChild(themeBtn);
  head.appendChild(inner);
  document.body.insertBefore(head, document.body.firstChild);
}
function buildFooter() {
  var f = el('footer', 'foot');
  var inner = el('div', 'foot-in');

  var about = el('div');
  about.appendChild(el('span', 'mark2', CH.brand));
  if (WEEKS.length) about.appendChild(el('p', null,
    CH.blurb + shortDate(WEEKS[WEEKS.length - 1].date) + '. ' + WEEKS.length +
    ' editions and counting, with ' + songs.length + ' songs having charted so far.'));
  inner.appendChild(about);

  function col(title, links) {
    var c = el('div');
    c.appendChild(el('h4', null, title));
    var ul = document.createElement('ul');
    links.forEach(function (l) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = l[1];
      if (l[2]) { a.target = '_blank'; a.rel = 'noopener'; }
      if (l[3]) a.appendChild(svg(l[3]));
      a.appendChild(document.createTextNode(l[0]));
      li.appendChild(a); ul.appendChild(li);
    });
    c.appendChild(ul);
    return c;
  }
  var YT = '<path d="M23 12s0-3.8-.5-5.6a2.9 2.9 0 00-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4a2.9 2.9 0 00-2 2C1 8.2 1 12 1 12s0 3.8.5 5.6a2.9 2.9 0 002 2C5.3 20 12 20 12 20s6.7 0 8.5-.4a2.9 2.9 0 002-2C23 15.8 23 12 23 12zM9.8 15.4V8.6l5.9 3.4-5.9 3.4z"/>';
  var DC = '<path d="M19.6 5.6A16.8 16.8 0 0015.4 4.3l-.2.4a15.6 15.6 0 00-6.4 0l-.2-.4a16.8 16.8 0 00-4.2 1.3C1.7 9.3 1 12.9 1.3 16.4a16.9 16.9 0 005.1 2.6l1-1.7a11 11 0 01-1.7-.8l.4-.3a12.1 12.1 0 0011.8 0l.4.3a11 11 0 01-1.7.8l1 1.7a16.9 16.9 0 005.1-2.6c.4-4.1-.7-7.7-2.1-10.8zM8.6 14.3c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1zm6.8 0c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1z"/>';
  inner.appendChild(col('Browse', [
    !WEEKS.length ? ['Home', '?chart=personal#/'] : ['This week', '#/week/' + WEEKS[0].date],
    !WEEKS.length ? ['Shuffle', '?chart=personal#/shuffle'] : ['Every Top ' + SIZE, '#/charts'],
    !WEEKS.length ? ['Add your chart', CHARTS.personal.apply, true] : ['Song archive', '#/archive'],
    !WEEKS.length ? ['Send feedback', CHARTS.personal.feedback, true]
           : ['First ever chart', '#/week/' + WEEKS[WEEKS.length - 1].date]
  ]));
  var out = CH.links.map(function (l) {
    return [l[0], l[1], true, l[2] === 'yt' ? YT : DC];
  });
  out.push(['Charts on Crownnote', CH.profile, true]);
  inner.appendChild(col('Elsewhere', out));
  inner.appendChild(col('About', [
    ['Chart data on Crownnote', CH.profile, true],
    ['Add your chart', CHARTS.personal.apply, true],
    ['Send feedback', CHARTS.personal.feedback, true],
    ['Previews via Apple Music', 'https://music.apple.com', true]
  ]));
  f.appendChild(inner);

  var base = el('div', 'foot-base');
  var bin = el('div');
  bin.appendChild(el('span', null, '\u00a9 ' + new Date().getFullYear() + ' ' + CH.name));
  bin.appendChild(el('span', null,
    'Artwork and chart data from Crownnote \u00b7 30 second previews from the iTunes Search API'));
  base.appendChild(bin);
  f.appendChild(base);
  document.body.appendChild(f);
}


/* ---------------- year end / all time ---------------- */
var ELIGIBLE = WEEKS.filter(function (w) { return counts(w.date); });
var YEARS = [];
ELIGIBLE.forEach(function (w) {
  var y = w.date.slice(0, 4);
  if (YEARS.indexOf(y) < 0) YEARS.push(y);
});
YEARS.sort().reverse();
var LIVE_YEAR = YEARS[0];
function weeksOf(year) {
  return ELIGIBLE.filter(function (w) { return w.date.slice(0, 4) === year; })
    .map(function (w) { return w.date; }).sort();
}
var stCache = {};
function standings(year, upto) {
  var ck = (year || 'all') + '|' + (upto || '');
  if (stCache[ck]) return stCache[ck];
  var acc = Object.create(null);
  ELIGIBLE.forEach(function (w) {
    if (year && w.date.slice(0, 4) !== year) return;
    if (upto && w.date > upto) return;
    w.chart.forEach(function (r, i) {
      var t = catalog[r.title + '|' + r.artist];
      if (!t) return;
      var e = acc[t.artKey] || (acc[t.artKey] = { t: t, pts: 0, weeks: 0, peak: 99 });
      var rk = r.rank || i + 1;
      e.pts += ptsFor(rk);
      e.weeks++;
      if (rk < e.peak) e.peak = rk;
    });
  });
  var list = Object.keys(acc).map(function (k) { return acc[k]; });
  list.sort(function (a, b) { return b.pts - a.pts || a.peak - b.peak || b.weeks - a.weeks; });
  var byKey = {};
  list.forEach(function (e, i) { e.pos = i + 1; byKey[e.t.artKey] = e; });
  list.byKey = byKey;
  stCache[ck] = list;
  return list;
}
function fmtPts(n) { return n.toLocaleString ? n.toLocaleString('en-GB') : String(n); }

function ptsRow(e, i, list, prev, showMove) {
  var row = el('div', 'ye-row' + (showMove ? ' live' : ''));
  var was = prev && prev.byKey[e.t.artKey];

  var pc = el('div', 'ye-pos');
  pc.appendChild(el('span', 'n', String(e.pos)));
  if (showMove) {
    if (!was) {
      var tag = el('span', 'tag', 'NEW');
      tag.style.setProperty('--d', (i * 28) + 'ms');
      pc.appendChild(tag);
    } else if (was.pos !== e.pos) {
      var d = was.pos - e.pos;
      var mv = el('i', 'mvb ' + (d > 0 ? 'up' : 'down'));
      mv.setAttribute('aria-hidden', 'true');
      mv.title = (d > 0 ? 'Up ' : 'Down ') + Math.abs(d) + ' from No.' + was.pos;
      mv.style.setProperty('--d', (i * 28) + 'ms');
      pc.appendChild(mv);
      pc.appendChild(el('span', 'sr', mv.title));
    }
  }
  row.appendChild(pc);

  var im = document.createElement('img');
  im.className = 'art'; im.loading = 'lazy'; im.alt = '';
  im.src = thumb(e.t.img, 200);
  row.appendChild(im);

  var m = el('div', 'meta');
  m.appendChild(el('div', 'title', e.t.title));
  m.appendChild(artistLine(e.t.artist, 'artist'));
  m.appendChild(el('div', 'sub', 'Peak No.' + e.peak + ' \u00b7 ' + e.weeks +
    (e.weeks === 1 ? ' week' : ' weeks') + ' \u00b7 ' + fmtPts(e.pts) + ' pts'));
  row.appendChild(m);

  if (showMove) {
    var g = el('div', 'ye-gain st');
    if (!was) g.appendChild(el('span', 'gain new', 'NEW'));
    else {
      var pct = was.pts ? (e.pts - was.pts) / was.pts * 100 : 0;
      var pill = el('span', 'gain' + (pct > 0 ? ' up' : ''),
        (pct > 0 ? '+' : '') + pct.toFixed(1) + '%');
      if (pct > 0) pill.style.background = 'rgba(66,209,124,' +
        Math.min(0.12 + pct / 55, 0.42).toFixed(3) + ')';
      pill.title = 'Points this week: +' + fmtPts(e.pts - was.pts);
      g.appendChild(pill);
    }
    row.appendChild(g);
  }
  function stat(v, lab) {
    var d = el('div', 'stat st');
    d.appendChild(el('b', null, String(v)));
    d.appendChild(el('span', null, lab));
    return d;
  }
  row.appendChild(stat('No.' + e.peak, 'Peak'));
  row.appendChild(stat(e.weeks, 'Weeks'));
  row.appendChild(stat(fmtPts(e.pts), 'Points'));
  row.appendChild(playButton(e.t, function () { return list; }, { kind: 'points' }));
  wireRun(row, e.t);
  return row;
}

function ptsList(wrap, list, prev, showMove, shown) {
  var tracks = list.map(function (e) { return e.t; });
  autoList = tracks.slice(0, 25);
  var box = el('div', 'rows');
  var n = 0;
  function add(count) {
    var end = Math.min(n + count, list.length);
    for (; n < end; n++) box.appendChild(ptsRow(list[n], n, tracks, prev, showMove));
  }
  add(shown);
  wrap.appendChild(box);
  var more = el('button', 'more');
  more.type = 'button';
  function label() {
    var left = list.length - n;
    if (left <= 0) { if (more.parentNode) more.parentNode.removeChild(more); return; }
    more.textContent = 'Show ' + Math.min(100, left) + ' more';
  }
  more.addEventListener('click', function () {
    add(100);            /* appending leaves the page exactly where it was */
    label();
    restoreCurrent();
  });
  label();
  if (n < list.length) wrap.appendChild(more);
}

function viewYearEnd(year, upto) {
  clearView();
  if (YEARS.indexOf(year) < 0) year = LIVE_YEAR;
  var live = year === LIVE_YEAR;
  var ws = weeksOf(year);
  if (!upto || ws.indexOf(upto) < 0) upto = ws[ws.length - 1];
  var wrap = el('div', 'wrap');

  var head = el('div', 'home-h');
  head.appendChild(el('h2', null, 'Year End ' + year));
  head.appendChild(el('span', null, live ? 'In progress \u00b7 building week by week'
    : 'Final \u00b7 ' + ws.length + ' weeks counted'));
  wrap.appendChild(head);

  var tabs = el('div', 'ytabs');
  YEARS.forEach(function (y) {
    var a = document.createElement('a');
    a.className = 'ytab' + (y === year ? ' on' : '');
    a.href = '#/year-end/' + y;
    a.textContent = y + (y === LIVE_YEAR ? ' \u00b7 in progress' : '');
    tabs.appendChild(a);
  });
  wrap.appendChild(tabs);

  var note = el('div', 'ye-note',
    'Counted from ' + shortDate(ws[0]) + ' to ' + shortDate(upto) +
    '. December is never counted, so Christmas records do not distort the year.');
  wrap.appendChild(note);

  var prev = null;
  if (live) {
    var idx = ws.indexOf(upto);
    if (idx > 0) prev = standings(year, ws[idx - 1]);
    var nav = el('div', 'wknav ye-nav');
    var back = el('button', 'wbtn', '\u2039');
    back.type = 'button'; back.title = 'Previous week';
    back.disabled = idx <= 0;
    back.addEventListener('click', function () { location.hash = '#/year-end/' + year + '/' + ws[idx - 1]; });
    var pick = el('div', 'wpick');
    var pbtn = el('button', 'wsel');
    pbtn.type = 'button';
    pbtn.appendChild(document.createTextNode('As it stood on ' + shortDate(upto)));
    pbtn.appendChild(el('i', 'cv', '\u25be'));
    var pmenu = el('div', 'wmenu');
    ws.slice().reverse().forEach(function (d) {
      var o = el('button', 'wopt' + (d === upto ? ' on' : ''), shortDate(d));
      o.type = 'button';
      o.addEventListener('click', function (e) {
        e.stopPropagation();
        location.hash = '#/year-end/' + year + '/' + d;
      });
      pmenu.appendChild(o);
    });
    pbtn.addEventListener('click', function (e) { e.stopPropagation(); pmenu.classList.toggle('open'); });
    document.addEventListener('click', function () { pmenu.classList.remove('open'); });
    pick.appendChild(pbtn); pick.appendChild(pmenu);
    var fwd = el('button', 'wbtn', '\u203a');
    fwd.type = 'button'; fwd.title = 'Next week';
    fwd.disabled = idx >= ws.length - 1;
    fwd.addEventListener('click', function () { location.hash = '#/year-end/' + year + '/' + ws[idx + 1]; });
    nav.appendChild(back); nav.appendChild(pick); nav.appendChild(fwd);
    wrap.appendChild(nav);
  }

  ptsList(wrap, standings(year, upto), prev, live, 100);
  app.appendChild(wrap);
  restoreCurrent();
  pump();
}

function viewAllTime() {
  clearView();
  var wrap = el('div', 'wrap');
  var head = el('div', 'home-h');
  head.appendChild(el('h2', null, 'All-Time List'));
  head.appendChild(el('span', null, ELIGIBLE.length + ' weeks counted since ' +
    shortDate(ELIGIBLE[ELIGIBLE.length - 1].date)));
  wrap.appendChild(head);
  wrap.appendChild(el('div', 'ye-note',
    'Every week from ' + shortDate(ELIGIBLE[ELIGIBLE.length - 1].date) + ' to ' +
    shortDate(ELIGIBLE[0].date) + ', December excluded.'));
  ptsList(wrap, standings(null, null), null, false, 100);
  app.appendChild(wrap);
  restoreCurrent();
  pump();
}

/* ---------------- top artists in one category ---------------- */
var METRICS = { songs: 'Songs charted', no1s: 'Number ones', top10s: 'Top 10 hits',
                weeks: 'Weeks on chart', weeksAt1: 'Weeks at No.1', points: 'Chart points' };
function topList(metric) {
  return ARTISTS.slice().sort(function (a, b) {
    return b[metric] - a[metric] || a.name.localeCompare(b.name);
  }).filter(function (a) { return a[metric] > 0; }).slice(0, 25);
}
function topRows(metric) {
  var box = el('div', 'rows');
  topList(metric).forEach(function (a) {
    var r = el('div', 'top-row');
    r.appendChild(el('div', 'idx', String(a.ranks[metric])));
    var nm = document.createElement('a');
    nm.className = 'a-link top-name';
    nm.href = '#/artist/' + ARTIST_SLUG[a.name];
    nm.textContent = a.name;
    nm.addEventListener('click', closeModal);
    r.appendChild(nm);
    r.appendChild(el('div', 'top-val', metric === 'points' ? fmtPts(a[metric]) : String(a[metric])));
    box.appendChild(r);
  });
  return box;
}
function showTop(metric) {
  if (!METRICS[metric]) return;
  var body = openModal(METRICS[metric], 'Top 25 artists');
  body.appendChild(topRows(metric));
}
function viewTop(metric) {
  if (!METRICS[metric]) { location.hash = '#/archive'; return; }
  clearView();
  var wrap = el('div', 'wrap');
  var head = el('div', 'home-h');
  head.appendChild(el('h2', null, METRICS[metric]));
  head.appendChild(el('span', null, 'Top 25 artists'));
  wrap.appendChild(head);
  var list = ARTISTS.slice().sort(function (a, b) {
    return b[metric] - a[metric] || a.name.localeCompare(b.name);
  }).filter(function (a) { return a[metric] > 0; }).slice(0, 25);
  var box = el('div', 'rows');
  list.forEach(function (a) {
    var r = el('div', 'top-row');
    r.appendChild(el('div', 'idx', String(a.ranks[metric])));
    var nm = document.createElement('a');
    nm.className = 'a-link top-name';
    nm.href = '#/artist/' + ARTIST_SLUG[a.name];
    nm.textContent = a.name;
    r.appendChild(nm);
    r.appendChild(el('div', 'top-val', metric === 'points' ? fmtPts(a[metric]) : String(a[metric])));
    box.appendChild(r);
  });
  wrap.appendChild(box);
  if (!list.length) wrap.appendChild(el('div', 'empty', 'Nothing to rank yet.'));
  var back = document.createElement('a');
  back.className = 'back'; back.href = '#/archive';
  back.textContent = '\u2039  Back to the archive';
  wrap.appendChild(back);
  app.appendChild(wrap);
}

/* ---------------- the personal charts ---------------- */
var peakCache = {};
function chartPeaks(id) {
  if (peakCache[id]) return peakCache[id];
  var d = CHART_DATA[id], m = {};
  if (d) d.WEEKS.forEach(function (w) {
    w.chart.forEach(function (r, i) {
      var k = r.title + '|' + r.artist, rank = r.rank || i + 1;
      var e = m[k] || (m[k] = { p: 99, w: 0, n: 0, first: w.date, last: w.date, art: d.ART[k] || '' });
      if (rank < e.p) e.p = rank;
      if (r.weeks > e.w) e.w = r.weeks;
      e.n++;
      if (w.date < e.first) e.first = w.date;
      if (w.date > e.last) e.last = w.date;
    });
  });
  peakCache[id] = m;
  return m;
}
/* the same wash the top ten gets on a chart page, in that chart's colour */
function fade(hex) {
  var n = parseInt(hex.slice(1), 16);
  var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
  return 'linear-gradient(180deg,rgba(' + c + ',.20) 0%,rgba(' + c + ',.10) 40%,' +
    'rgba(' + c + ',.03) 72%,rgba(' + c + ',0) 100%)';
}
/* Every chart that has data, whether or not this page has fetched it yet. */
function dataCharts() {
  var ix = window.CHART_INDEX || {};
  return Object.keys(CHARTS).filter(function (i) { return ix[i]; });
}
function loaded(id) { return !!CHART_DATA[id]; }
/* Fetch whole charts on demand, for the pages that reach across all of them. */
function needData(ids, done) {
  var todo = ids.filter(function (i) { return (window.CHART_INDEX || {})[i] && !CHART_DATA[i]; });
  if (!todo.length) { done(); return; }
  var left = todo.length, failed = [];
  todo.forEach(function (id) {
    var sc = document.createElement('script');
    sc.src = (window.DATA_DIR || 'data/') + id + '.js';
    sc.onload = function () { if (!--left) done(failed); };
    sc.onerror = function () { failed.push(id); if (!--left) done(failed); };
    document.head.appendChild(sc);
  });
}

/* Earth turning in a sky of coloured stars, with the sound rolling underneath. */
/* A chart can drop an image into banners/ and it covers the animation.
   If the file is not there the animation simply stays, so nothing breaks. */
/* NEW, RE, or how far a song moved since last week. */
function moveChip(lw, rank) {
  var c = el('span', 'mv');
  if (lw === 'NE') { c.className = 'mv new'; c.textContent = 'NEW'; return c; }
  if (lw === 'RE') { c.className = 'mv re'; c.textContent = 'RE'; return c; }
  if (typeof lw !== 'number') { c.className = 'mv flat'; c.textContent = '\u2013'; return c; }
  var d = lw - rank;
  if (d === 0) { c.className = 'mv flat'; c.textContent = '\u2013'; return c; }
  c.className = 'mv ' + (d > 0 ? 'up' : 'down');
  c.textContent = (d > 0 ? '\u25b2' : '\u25bc') + Math.abs(d);
  return c;
}

/* Pictures in banners/ become the title card and rotate slowly. Name them
   <chart>.<ext> or <chart>-1.<ext> upward; whichever exist get used, and if
   none do the card simply stays its own colour. */
var BANNER_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
/* Published in the last eight days, i.e. this week's chart. */
/* Corrections to preview matches.
   Anyone can report one; only the owner sees the controls to change it, and a
   change only becomes real for everyone once it is folded into the data files
   in the repository. Locally it lives in this browser and nowhere else. */
var PIN_KEY = 'tpcPins', OWNER_KEY = 'tpcOwner';
var PINS = null;
function pins() {                 /* read lazily: the catalog is built before this point */
  if (!PINS) {
    try { PINS = JSON.parse(localStorage.getItem(PIN_KEY) || '{}'); } catch (e) { PINS = {}; }
  }
  return PINS;
}
function isOwner() {
  try { return localStorage.getItem(OWNER_KEY) === '1'; } catch (e) { return false; }
}
function setOwner(on) {
  try { on ? localStorage.setItem(OWNER_KEY, '1') : localStorage.removeItem(OWNER_KEY); } catch (e) {}
}
function pinKey(t) { return CH.id + '|' + t.artKey; }
function savePins() {
  try { localStorage.setItem(PIN_KEY, JSON.stringify(pins())); } catch (e) {}
}
function applyPin(t) {
  var p = pins()[pinKey(t)];
  if (p && p.url) t.manual = p;
}

var I_FLAG = '<path d="M5 3v18h2v-7h9.2l-1.6-3.5L16.2 7H7V3z"/>';
function flagButton() {
  var b = el('button', 'icon-btn flag-btn');
  b.type = 'button';
  b.title = 'Wrong preview?';
  b.setAttribute('aria-label', 'Report or fix this preview');
  b.appendChild(svg(I_FLAG));
  b.addEventListener('click', function () { openFix(cur()); });
  return b;
}

function openFix(t) {
  if (!t) return;
  var c = chosen(t) || {};
  var body = openModal('This preview', t.title + ' \u2014 ' + t.artist);
  var now = el('div', 'fix-now');
  now.appendChild(el('b', null, 'Currently playing'));
  now.appendChild(el('span', null, (c.name || '\u2014') + (c.artist ? ' \u2014 ' + c.artist : '')));
  body.appendChild(now);

  var report = el('button', 'cta fix-report');
  report.type = 'button';
  report.appendChild(document.createTextNode('Report this as wrong'));
  report.addEventListener('click', function () {
    var line = [CH.name, t.title, t.artist, 'matched to: ' + (c.name || 'nothing') +
                (c.artist ? ' by ' + c.artist : '')].join(' | ');
    var form = CHARTS.personal.fixForm;
    if (form) {
      window.open(form + (form.indexOf('?') < 0 ? '?' : '&') +
                  'usp=pp_url&entry.1=' + encodeURIComponent(line), '_blank', 'noopener');
      report.textContent = 'Thanks \u2014 the form is open';
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(line).then(function () {
        report.textContent = 'Copied \u2014 paste it to the chart owner';
      }, function () { report.textContent = line; });
    } else {
      report.textContent = line;
    }
    report.disabled = true;
  });
  body.appendChild(report);

  if (!isOwner()) {
    body.appendChild(el('p', 'fix-note',
      'Reports go to whoever runs the site, who can correct the match for everyone.'));
    return;
  }
  var pick = el('div', 'fix-pick');
  pick.appendChild(el('b', null, 'Choose a different match'));
  (t.cands || []).forEach(function (cd, i) {
    var b = el('button', 'fix-row' + (chosen(t) === cd ? ' on' : ''));
    b.type = 'button';
    b.appendChild(el('span', 'ft', cd.name || '\u2014'));
    b.appendChild(el('span', 'fa', cd.artist || ''));
    b.addEventListener('click', function () {
      pins()[pinKey(t)] = { url: cd.url, name: cd.name, artist: cd.artist, art: cd.art || '' };
      savePins();
      t.manual = pins()[pinKey(t)];
      t.pick = i;
      closeModal();
      startTrack(t, queue.length ? queue : [t], qctx);
    });
    pick.appendChild(b);
  });
  if (!(t.cands || []).length) pick.appendChild(el('p', 'fix-note', 'No other matches were found.'));
  body.appendChild(pick);
  if (pins()[pinKey(t)]) {
    var undo = el('button', 'fix-undo', 'Undo this correction');
    undo.type = 'button';
    undo.addEventListener('click', function () {
      delete pins()[pinKey(t)];
      savePins();
      t.manual = null;
      closeModal();
    });
    body.appendChild(undo);
  }
}

function viewFixes() {
  clearView();
  var wrap = el('div', 'wrap');
  var h = el('div', 'home-h');
  h.appendChild(el('h2', null, 'Preview corrections'));
  var keys = Object.keys(pins());
  h.appendChild(el('span', null, keys.length
    ? keys.length + (keys.length === 1 ? ' correction' : ' corrections') + ' saved in this browser'
    : 'Nothing corrected yet'));
  wrap.appendChild(h);
  if (!isOwner()) {
    wrap.appendChild(el('p', 'fix-note',
      'This page is for whoever runs the site. Open #/owner on your own machine to turn ' +
      'the controls on.'));
  }
  keys.forEach(function (k) {
    var p = pins()[k], cut = k.indexOf('|'), rest = k.slice(cut + 1);
    var row = el('div', 'fix-listrow');
    var m = el('div', 'meta');
    m.appendChild(el('div', 'title', rest.slice(0, rest.lastIndexOf('|'))));
    m.appendChild(el('div', 'artist', (CHARTS[k.slice(0, cut)] || {}).name + ' \u2192 ' +
      (p.name || '') + (p.artist ? ' \u2014 ' + p.artist : '')));
    row.appendChild(m);
    var x = el('button', 'fix-undo', 'Remove');
    x.type = 'button';
    x.addEventListener('click', function () { delete pins()[k]; savePins(); viewFixes(); });
    row.appendChild(x);
    wrap.appendChild(row);
  });
  if (keys.length) {
    wrap.appendChild(el('p', 'fix-note',
      'These live in this browser only. Paste the block below into the site\u2019s data to ' +
      'make them true for everyone.'));
    var ta = document.createElement('textarea');
    ta.className = 'fix-out';
    ta.readOnly = true;
    ta.value = 'var PREVIEW_FIXES = ' + JSON.stringify(pins(), null, 2) + ';';
    wrap.appendChild(ta);
  }
  app.appendChild(wrap);
  restoreCurrent();
}

function isFresh(date) {
  if (!date) return false;
  var d = new Date(date + 'T00:00:00Z').getTime();
  return (Date.now() - d) < 8 * 86400000 && d <= Date.now() + 86400000;
}

function bannerLayer(mark) {
  if (!CH.banner) return;
  var names = [CH.banner];
  for (var k = 1; k <= 8; k++) names.push(CH.banner + '-' + k);
  var box = el('div', 'bnr-wrap');
  mark.insertBefore(box, mark.firstChild.nextSibling);
  var found = [];
  names.forEach(function (nm) {
    var e = 0;
    var im = document.createElement('img');
    im.className = 'bnr';
    im.alt = '';
    im.addEventListener('error', function () {
      if (++e < BANNER_EXT.length) im.src = 'banners/' + nm + BANNER_EXT[e];
    });
    im.addEventListener('load', function () {
      if (found.indexOf(im) >= 0) return;
      found.push(im);
      box.appendChild(im);
      if (found.length === 1) im.classList.add('on');
      if (found.length === 2 && !box.spin) {
        var at = 0;
        box.spin = setInterval(function () {
          found[at].classList.remove('on');
          at = (at + 1) % found.length;
          found[at].classList.add('on');
        }, 5200);
      }
    });
    im.src = 'banners/' + nm + BANNER_EXT[0];
  });
}

function sceneFor(cv) {
  return CH.scene === 'penguins' ? penguins(cv)
       : CH.scene === 'earth' ? earth(cv)
       : CH.scene === 'bigalaxy' ? bigalaxy(cv)
       : CH.scene === 'waves' ? waves(cv)
       : CH.scene === 'sunset' ? sunset(cv)
       : CH.scene === 'dragons' ? dragons(cv)
       : CH.scene === 'none' ? { start: function () {}, stop: function () {}, resize: function () {} }
       : galaxy(cv);
}

/* Shared plumbing for the newer title cards: sizing, the frame loop and a
   per-scene state bag, so each scene is only its own seed and draw. */
function sceneBase(canvas, seed, draw) {
  var ctx = canvas.getContext && canvas.getContext('2d');
  var raf = 0, w = 0, h = 0, dpr = 1, t0 = 0, st = {};
  function size() {
    if (!ctx) return;
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function frame(now) {
    if (!ctx) return;
    if (!t0) t0 = now;
    draw(ctx, w, h, (now - t0) / 1000, st);
    raf = requestAnimationFrame(frame);
  }
  return {
    start: function () {
      if (raf || !ctx) return;
      size();
      if (!st.ready) { seed(st, w, h); st.ready = 1; }
      t0 = 0;
      raf = requestAnimationFrame(frame);
    },
    stop: function () { if (raf) cancelAnimationFrame(raf); raf = 0; if (ctx) ctx.clearRect(0, 0, w, h); },
    resize: size
  };
}

/* Sergej: a sunset with a rainbow over it and flowers nodding in the field. */
function sunset(canvas) {
  return sceneBase(canvas, function (st) {
    st.flowers = [];
    for (var i = 0; i < 26; i++) st.flowers.push({
      x: Math.random(), hgt: 0.10 + Math.random() * 0.16,
      sway: Math.random() * 6, sp: 0.6 + Math.random() * 0.7,
      col: ['#FF6B6B', '#FFD166', '#FF8FC4', '#FFFFFF', '#FFA24D'][Math.floor(Math.random() * 5)],
      pet: 5 + Math.floor(Math.random() * 2)
    });
    st.birds = [];
    for (var b = 0; b < 5; b++) st.birds.push({ x: Math.random(), y: 0.12 + Math.random() * 0.25,
      sp: 0.012 + Math.random() * 0.02, ph: Math.random() * 6 });
  }, function (ctx, w, h, tt, st) {
    var sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#2B1055');
    sky.addColorStop(0.34, '#8E2C6B');
    sky.addColorStop(0.62, '#FF6B6B');
    sky.addColorStop(0.82, '#FFA24D');
    sky.addColorStop(1, '#FFD166');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    var hz = h * 0.80;                                   /* the sun, sinking */
    var sy = hz - h * 0.10 + Math.sin(tt * 0.18) * h * 0.05;
    var glow = ctx.createRadialGradient(w * 0.5, sy, 0, w * 0.5, sy, h * 0.55);
    glow.addColorStop(0, 'rgba(255,238,170,.95)');
    glow.addColorStop(0.18, 'rgba(255,190,110,.55)');
    glow.addColorStop(1, 'rgba(255,150,90,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#FFE9A8';
    ctx.beginPath(); ctx.arc(w * 0.5, sy, h * 0.11, 0, 6.2832); ctx.fill();

    var band = ['#FF4D4D', '#FF9A3D', '#FFD93D', '#5FD98A', '#4DA6FF', '#8A6BFF'];
    ctx.lineWidth = Math.max(3, h * 0.022);              /* the rainbow */
    band.forEach(function (c, i) {
      ctx.strokeStyle = c;
      ctx.globalAlpha = 0.34 + 0.03 * Math.sin(tt * 0.5 + i);
      ctx.beginPath();
      ctx.arc(w * 0.5, hz + h * 0.10, h * (0.52 - i * 0.022), Math.PI * 1.04, Math.PI * 1.96);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    st.birds.forEach(function (b) {                      /* a few birds */
      b.x += b.sp * 0.016;
      if (b.x > 1.15) b.x = -0.15;
      var bx = b.x * w, by = b.y * h, f = Math.sin(tt * 4 + b.ph) * h * 0.012;
      ctx.strokeStyle = 'rgba(40,10,40,.5)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(bx - h * 0.02, by); ctx.quadraticCurveTo(bx - h * 0.01, by - f, bx, by);
      ctx.quadraticCurveTo(bx + h * 0.01, by - f, bx + h * 0.02, by);
      ctx.stroke();
    });

    var fld = ctx.createLinearGradient(0, hz, 0, h);     /* the field */
    fld.addColorStop(0, '#2E6B3A');
    fld.addColorStop(1, '#14351E');
    ctx.fillStyle = fld;
    ctx.beginPath();
    ctx.moveTo(0, hz);
    for (var x = 0; x <= w; x += 10) ctx.lineTo(x, hz + Math.sin(x / 90 + 1) * h * 0.012);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();

    st.flowers.forEach(function (f) {                    /* flowers, nodding */
      var bx = f.x * w, by = h * 0.995, top = by - f.hgt * h;
      var lean = Math.sin(tt * f.sp + f.sway) * h * 0.022;
      ctx.strokeStyle = '#2F7D43';
      ctx.lineWidth = Math.max(1.4, h * 0.006);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + lean * 0.4, (by + top) / 2, bx + lean, top);
      ctx.stroke();
      var r = h * 0.016;
      ctx.fillStyle = f.col;
      for (var k = 0; k < f.pet; k++) {
        var a2 = (k / f.pet) * 6.2832 + tt * 0.2;
        ctx.beginPath();
        ctx.ellipse(bx + lean + Math.cos(a2) * r, top + Math.sin(a2) * r, r * 0.66, r * 0.46, a2, 0, 6.2832);
        ctx.fill();
      }
      ctx.fillStyle = '#FFE9A8';
      ctx.beginPath(); ctx.arc(bx + lean, top, r * 0.5, 0, 6.2832); ctx.fill();
    });
  });
}

/* Henessy: dragons crossing a dark sky, breathing fire as they go.
   The outlines below are the same paths the design was drawn and checked as,
   walked straight onto the canvas. */
function tracePath(ctx, d, L) {
  var segs = d.match(/[MLQZ][^MLQZ]*/g) || [];
  ctx.beginPath();
  for (var i = 0; i < segs.length; i++) {
    var op = segs[i][0];
    var n = (segs[i].slice(1).match(/-?\d*\.?\d+/g) || []).map(Number);
    if (op === 'M') ctx.moveTo(n[0] * L, n[1] * L);
    else if (op === 'L') ctx.lineTo(n[0] * L, n[1] * L);
    else if (op === 'Q') ctx.quadraticCurveTo(n[0] * L, n[1] * L, n[2] * L, n[3] * L);
    else ctx.closePath();
  }
  ctx.fill();
}
function dragonParts(f) {
  function wing(sc, lift) {
    var k = lift * (1 + f * 0.26);
    return 'M 0.22,-0.04 Q ' + (0.34 * sc) + ',' + (-0.70 * k) + ' ' + (0.10 * sc) + ',' + (-1.26 * k) +
           ' L ' + (-0.34 * sc) + ',' + (-0.98 * k) +
           ' Q ' + (-0.12 * sc) + ',' + (-0.86 * k) + ' ' + (-0.40 * sc) + ',' + (-0.66 * k) +
           ' Q ' + (-0.14 * sc) + ',' + (-0.54 * k) + ' ' + (-0.44 * sc) + ',' + (-0.32 * k) +
           ' Q ' + (-0.06 * sc) + ',' + (-0.18 * k) + ' 0.22,-0.04 Z';
  }
  var t = f * 0.12;
  var body = 'M 1.26,-0.31 L 1.08,-0.45 Q 0.92,-0.53 0.80,-0.47 Q 0.62,-0.38 0.52,-0.14 ' +
             'Q 0.42,0.06 0.18,0.10 Q -0.20,0.16 -0.60,0.10 Q -1.00,0.04 -1.30,' + t +
             ' L -1.60,' + (t - 0.24) + ' L -1.46,' + t + ' L -1.60,' + (t + 0.22) +
             ' L -1.28,' + (t + 0.06) + ' Q -0.95,0.28 -0.55,0.32 Q -0.15,0.36 0.20,0.28 ' +
             'Q 0.46,0.22 0.56,0.04 Q 0.66,-0.14 0.84,-0.22 L 1.06,-0.24 L 1.26,-0.31 Z';
  var legs = 'M 0.30,0.24 L 0.40,0.46 L 0.30,0.44 L 0.22,0.52 L 0.16,0.30 Z ' +
             'M -0.42,0.30 L -0.34,0.54 L -0.44,0.52 L -0.52,0.58 L -0.56,0.32 Z';
  var horn = 'M 0.86,-0.50 L 0.56,-0.80 L 0.60,-0.54 L 0.74,-0.47 Z ' +
             'M 0.80,-0.44 L 0.58,-0.60 L 0.64,-0.40 Z';
  var jaw = 'M 1.26,-0.31 L 1.04,-0.30 L 0.88,-0.25 L 1.06,-0.24 Z';
  var eye = 'M 1.00,-0.40 L 1.08,-0.37 L 1.00,-0.34 Z';
  var sp = '';
  [-1.05, -0.80, -0.55, -0.30, -0.05, 0.20].forEach(function (x) {
    var d = 0.15 - Math.abs(x) * 0.045, y = 0.10 - Math.abs(x) * 0.03;
    sp += 'M ' + (x - 0.09) + ',' + y + ' L ' + (x - 0.02) + ',' + (y - d) +
          ' L ' + (x + 0.07) + ',' + y + ' Z ';
  });
  return [[wing(0.80, 0.72), '#04231F'], [body, '#04201D'], [legs, '#04201D'],
          [jaw, '#0B3A35'], [sp, '#0B3A35'], [horn, '#0B3A35'],
          [eye, '#5FE3D6'], [wing(1, 1), '#07332E']];
}
function dragons(canvas) {
  return sceneBase(canvas, function (st) {
    st.drag = [];
    for (var i = 0; i < 3; i++) st.drag.push({
      x: Math.random() * 1.4 - 0.2, y: 0.20 + Math.random() * 0.42,
      sp: (0.05 + Math.random() * 0.06) * (Math.random() < 0.5 ? 1 : -1),
      sc: 0.75 + Math.random() * 0.5, ph: Math.random() * 6,
      next: 0.6 + Math.random() * 3, fire: 0
    });
    st.spark = [];
    st.stars = [];
    for (var k = 0; k < 60; k++) st.stars.push({ x: Math.random(), y: Math.random() * 0.8,
      r: Math.random() * 1.2 + 0.3 });
  }, function (ctx, w, h, tt, st) {
    var sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#03201F'); sky.addColorStop(0.55, '#074742'); sky.addColorStop(1, '#0B6C61');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    st.stars.forEach(function (s2) {
      ctx.fillStyle = 'rgba(180,255,246,' + (0.25 + 0.4 * Math.abs(Math.sin(tt + s2.x * 9))).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(s2.x * w, s2.y * h, s2.r, 0, 6.2832); ctx.fill();
    });

    st.drag.forEach(function (d) {
      d.x += d.sp * 0.016;
      if (d.sp > 0 && d.x > 1.35) d.x = -0.35;
      if (d.sp < 0 && d.x < -0.35) d.x = 1.35;
      d.next -= 0.016;
      if (d.next <= 0) { d.fire = 0.85; d.next = 2.5 + Math.random() * 4; }
      var flap = Math.sin(tt * 2.6 + d.ph);
      var x = d.x * w, y = d.y * h + Math.sin(tt * 1.1 + d.ph) * h * 0.05;
      var L = h * 0.16 * d.sc, dir = d.sp > 0 ? 1 : -1;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(dir, 1);
      dragonParts(flap).forEach(function (pc) { ctx.fillStyle = pc[1]; tracePath(ctx, pc[0], L); });
      ctx.restore();
      if (d.fire > 0) {
        d.fire -= 0.016;
        for (var n = 0; n < 4; n++) st.spark.push({
          x: x + dir * L * 1.3, y: y - L * 0.3,
          vx: dir * (70 + Math.random() * 170), vy: (Math.random() - 0.4) * 70,
          life: 0.45 + Math.random() * 0.6, age: 0, r: 1.6 + Math.random() * 3.6
        });
      }
    });

    for (var i = st.spark.length - 1; i >= 0; i--) {
      var s3 = st.spark[i];
      s3.age += 0.016;
      if (s3.age > s3.life) { st.spark.splice(i, 1); continue; }
      s3.x += s3.vx * 0.016; s3.y += s3.vy * 0.016; s3.vy += 26 * 0.016;
      var k2 = 1 - s3.age / s3.life;
      ctx.fillStyle = k2 > 0.6 ? 'rgba(255,245,190,' + k2.toFixed(2) + ')'
                   : k2 > 0.3 ? 'rgba(255,160,50,' + k2.toFixed(2) + ')'
                              : 'rgba(210,60,30,' + k2.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(s3.x, s3.y, s3.r * (0.5 + k2), 0, 6.2832); ctx.fill();
    }
  });
}

/* Jay: a blue/purple/pink galaxy with constellations floating up through it. */
function bigalaxy(canvas) {
  var ctx = canvas.getContext && canvas.getContext('2d'), raf = 0, w = 0, h = 0, dpr = 1, t0 = 0;
  var stars = [], groups = [], GLYPH = ['\u2605', '\u2665', '\u2726', '\u2665', '\u2605'];
  function size() {
    if (!ctx) return;
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function seed() {
    stars = [];
    for (var i = 0; i < 110; i++) stars.push({ x: Math.random(), y: Math.random(),
      r: 0.4 + Math.random() * 1.3, tw: Math.random() * 6 });
    groups = [];
    for (var g = 0; g < 7; g++) {
      var pts = [], n = 3 + Math.floor(Math.random() * 4);
      for (var k = 0; k < n; k++) pts.push({
        dx: (Math.random() - 0.5) * 0.09, dy: (Math.random() - 0.5) * 0.26,
        ch: GLYPH[Math.floor(Math.random() * GLYPH.length)],
        sz: 14 + Math.random() * 11
      });
      /* spread over the canvas from the start, and quick enough to watch:
         a group crosses in about eight to sixteen seconds */
      groups.push({ x: 0.06 + Math.random() * 0.88, y: -0.15 + Math.random() * 1.45,
                    sp: 0.10 + Math.random() * 0.11, sway: Math.random() * 6, pts: pts });
    }
  }
  function frame(now) {
    if (!ctx) return;
    if (!t0) t0 = now;
    var tt = (now - t0) / 1000, i;

    /* blue -> purple -> pink, on a gradient line that slowly turns while the
       bands themselves drift along it */
    var ang = tt * 0.07;
    var ox = Math.cos(ang) * w * 0.85, oy = Math.sin(ang) * h * 1.7;
    var bg = ctx.createLinearGradient(w / 2 - ox, h / 2 - oy, w / 2 + ox, h / 2 + oy);
    bg.addColorStop(0, '#0B1240');
    bg.addColorStop(0.32 + 0.11 * Math.sin(tt * 0.19), '#3A1A6B');
    bg.addColorStop(0.70 + 0.11 * Math.cos(tt * 0.13), '#7B2A86');
    bg.addColorStop(1, '#C24A94');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'lighter';            /* drifting nebula */
    [[80, 130, 255, 0.16, 0.22, 0.30], [170, 90, 230, 0.20, 0.62, 0.45],
     [255, 110, 190, 0.16, 0.88, 0.62]].forEach(function (c, k) {
      var cx = (c[4] + Math.sin(tt * 0.12 + k * 2) * 0.07) * w;
      var cy = (c[5] + Math.cos(tt * 0.09 + k) * 0.10) * h;
      var rr = h * (0.75 + 0.14 * Math.sin(tt * 0.2 + k));
      var g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      g2.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + c[3] + ')');
      g2.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);
    });
    ctx.globalCompositeOperation = 'source-over';

    for (i = 0; i < stars.length; i++) {                 /* star field */
      var st = stars[i], a = 0.3 + 0.55 * Math.abs(Math.sin(st.tw + tt));
      ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(st.x * w, st.y * h, st.r, 0, 6.2832); ctx.fill();
    }

    ctx.textAlign = 'center';                            /* constellations, rising */
    ctx.textBaseline = 'middle';
    groups.forEach(function (gr) {
      gr.y -= gr.sp * 0.016;
      if (gr.y < -0.45) { gr.y = 1.2 + Math.random() * 0.35; gr.x = 0.06 + Math.random() * 0.88; }
      var gx = (gr.x + Math.sin(tt * 0.5 + gr.sway) * 0.012) * w;
      ctx.strokeStyle = 'rgba(255,220,245,.42)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      gr.pts.forEach(function (pt, k) {
        var px = gx + pt.dx * w, py = (gr.y + pt.dy) * h;
        if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      });
      ctx.stroke();
      gr.pts.forEach(function (pt) {
        ctx.font = pt.sz.toFixed(1) + 'px serif';
        ctx.fillStyle = pt.ch === '\u2665' ? 'rgba(255,160,210,.96)' : 'rgba(224,235,255,.98)';
        ctx.fillText(pt.ch, gx + pt.dx * w, (gr.y + pt.dy) * h);
      });
    });
    raf = requestAnimationFrame(frame);
  }
  return {
    start: function () { if (raf || !ctx) return; size(); if (!stars.length) seed(); t0 = 0; raf = requestAnimationFrame(frame); },
    stop: function () { if (raf) cancelAnimationFrame(raf); raf = 0; if (ctx) ctx.clearRect(0, 0, w, h); },
    resize: size
  };
}

/* Sergej: red and white rolling over each other. */
function waves(canvas) {
  var ctx = canvas.getContext && canvas.getContext('2d'), raf = 0, w = 0, h = 0, dpr = 1, t0 = 0;
  function size() {
    if (!ctx) return;
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function frame(now) {
    if (!ctx) return;
    if (!t0) t0 = now;
    var tt = (now - t0) / 1000;
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#6E0A10');
    bg.addColorStop(1, '#B3131B');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    for (var i = 8; i >= 0; i--) {
      var white = i % 2 === 0;
      var a = white ? 0.1 + i * 0.03 : 0.12 + i * 0.02;
      ctx.fillStyle = white ? 'rgba(255,255,255,' + a.toFixed(3) + ')'
                            : 'rgba(255,90,90,' + a.toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (var x = 0; x <= w; x += 7) {
        var y = h * (0.26 + i * 0.075) +
          Math.sin(x / (90 + i * 26) + tt * (0.5 + i * 0.09)) * h * (0.09 + i * 0.008) +
          Math.cos(x / 210 - tt * 0.3) * h * 0.04;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  return {
    start: function () { if (raf || !ctx) return; size(); t0 = 0; raf = requestAnimationFrame(frame); },
    stop: function () { if (raf) cancelAnimationFrame(raf); raf = 0; if (ctx) ctx.clearRect(0, 0, w, h); },
    resize: size
  };
}

function earth(canvas) {
  var ctx = canvas.getContext && canvas.getContext('2d'), raf = 0, w = 0, h = 0, dpr = 1, t0 = 0;
  var stars = [], HUES = [0, 35, 55, 120, 190, 220, 280, 320];
  function size() {
    if (!ctx) return;
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function seed() {
    stars = [];
    for (var i = 0; i < 150; i++) stars.push({
      x: Math.random(), y: Math.random(), r: 0.5 + Math.random() * 1.6,
      hue: HUES[Math.floor(Math.random() * HUES.length)],
      tw: Math.random() * 6, sp: 0.6 + Math.random() * 1.8
    });
  }
  function frame(now) {
    if (!ctx) return;
    if (!t0) t0 = now;
    var tt = (now - t0) / 1000;
    ctx.fillStyle = '#05060C';
    ctx.fillRect(0, 0, w, h);

    stars.forEach(function (s) {
      var a = 0.35 + 0.65 * Math.abs(Math.sin(s.tw + tt * s.sp));
      ctx.fillStyle = 'hsla(' + s.hue + ',95%,72%,' + a.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, 6.2832);
      ctx.fill();
    });

    /* soundwaves rolling across the whole width */
    [[0.30, 0.55, 26], [0.16, 0.9, 40], [0.10, 1.4, 62]].forEach(function (p, i) {
      ctx.strokeStyle = 'hsla(' + ((tt * 40 + i * 90) % 360) + ',90%,68%,' + p[0] + ')';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var x = 0; x <= w; x += 6) {
        var y = h * 0.5 + Math.sin(x / p[2] + tt * p[1] * 2) * h * 0.16 * Math.sin(x / w * Math.PI);
        if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
    });

    /* the earth, turning, on a slow orbit of its own */
    var cx = w / 2 + Math.cos(tt * 0.35) * w * 0.035;
    var cy = h / 2 + Math.sin(tt * 0.35) * h * 0.06;
    var R = Math.min(w, h) * 0.2;
    var glow = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 2.1);
    glow.addColorStop(0, 'rgba(90,170,255,.35)');
    glow.addColorStop(1, 'rgba(90,170,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, R * 2.1, 0, 6.2832); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.clip();
    ctx.fillStyle = '#12508C';
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.fillStyle = '#2E9E5B';
    for (var k = 0; k < 7; k++) {                      /* land drifting round */
      var a2 = (tt * 0.5 + k * 0.9) % 6.2832;
      var lx = cx + Math.sin(a2) * R * 0.75;
      var ly = cy - R * 0.55 + (k % 4) * R * 0.38;
      var sq = Math.max(0.12, Math.cos(a2));
      ctx.beginPath();
      ctx.ellipse(lx, ly, R * 0.3 * sq, R * 0.19, 0, 0, 6.2832);
      ctx.fill();
    }
    var shade = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    shade.addColorStop(0, 'rgba(255,255,255,.22)');
    shade.addColorStop(0.55, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,.5)');
    ctx.fillStyle = shade;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.restore();
    raf = requestAnimationFrame(frame);
  }
  return {
    start: function () { if (raf || !ctx) return; size(); if (!stars.length) seed(); t0 = 0; raf = requestAnimationFrame(frame); },
    stop: function () { if (raf) cancelAnimationFrame(raf); raf = 0; if (ctx) ctx.clearRect(0, 0, w, h); },
    resize: size
  };
}

function viewPending() {
  clearView();
  var wrap = el('div', 'wrap');
  var hero = el('div', 'hero');
  var mark = document.createElement('button');
  mark.type = 'button'; mark.className = 'wordmark';
  mark.setAttribute('aria-label', CH.name);
  var cv = document.createElement('canvas');
  mark.appendChild(cv);
  var wm = el('span', 'wm');
  wm.appendChild(el('span', null, CH.words[0]));
  wm.appendChild(el('span', null, CH.words[1]));
  mark.appendChild(wm);
  bannerLayer(mark);
  mark.appendChild(el('span', 'tagline', 'Coming soon'));
  hero.appendChild(mark);
  wrap.appendChild(hero);
  var sc = sceneFor(cv);
  function lit(on) {
    mark.classList.toggle('lit', on);
    if (on) sc.start(); else setTimeout(function () { if (!mark.classList.contains('lit')) sc.stop(); }, 560);
  }
  mark.addEventListener('mouseenter', function () { lit(true); });
  mark.addEventListener('mouseleave', function () { lit(false); });
  mark.addEventListener('focus', function () { lit(true); });
  mark.addEventListener('blur', function () { lit(false); });
  window.addEventListener('resize', sc.resize);

  var box = el('div', 'pending');
  box.appendChild(el('b', null, CH.name + ' is on the way'));
  if (CH.heavy) box.appendChild(el('div', 'heavy-note', CH.heavy));
  box.appendChild(el('p', null,
    'The chart is being brought over from ' + (CH.from || 'Crownnote') + '. Once the ' +
    'weeks are in, this page works like the others: every edition, chart runs, records ' +
    'and previews throughout.'));
  var back = document.createElement('a');
  back.className = 'cta';
  back.href = '?chart=personal#/';
  back.appendChild(document.createTextNode('Back to the other charts'));
  box.appendChild(back);
  wrap.appendChild(box);
  app.appendChild(wrap);
  restoreCurrent();
}

function viewHub() {
  clearView();
  var wrap = el('div', 'wrap');
  var hero = el('div', 'hero');
  var mark = document.createElement('button');
  mark.type = 'button'; mark.className = 'wordmark';
  mark.setAttribute('aria-label', CH.name);
  var cv = document.createElement('canvas');
  mark.appendChild(cv);
  var wm = el('span', 'wm');
  wm.appendChild(el('span', null, CH.words[0]));
  wm.appendChild(el('span', null, CH.words[1]));
  mark.appendChild(wm);
  var ids = dataCharts();
  var IX = window.CHART_INDEX || {};
  var total = ids.reduce(function (n, i) { return n + IX[i].weeks; }, 0);
  mark.appendChild(el('span', 'tagline', 'Because your taste deserves to be shared'));
  hero.appendChild(mark);
  wrap.appendChild(hero);
  var sc = sceneFor(cv);
  function lit(on) {
    mark.classList.toggle('lit', on);
    if (on) sc.start(); else setTimeout(function () { if (!mark.classList.contains('lit')) sc.stop(); }, 560);
  }
  mark.addEventListener('mouseenter', function () { lit(true); });
  mark.addEventListener('mouseleave', function () { lit(false); });
  mark.addEventListener('focus', function () { lit(true); });
  mark.addEventListener('blur', function () { lit(false); });
  window.addEventListener('resize', sc.resize);

  var picks = el('div', 'hub-picks');
  var soonRow = el('div', 'hub-picks soon-row');
  orderedCharts().forEach(function (id) {
    var c = CHARTS[id], d = (window.CHART_INDEX || {})[id];
    var a = document.createElement('a');
    a.className = 'hub-pick';
    a.href = '?chart=' + id + '#/';
    var dot = el('span', 'sw-dot');
    dot.style.background = c.swatch;
    a.appendChild(dot);
    if (!d) a.className += ' soon';
    a.appendChild(el('b', null, c.name));
    a.appendChild(el('span', 'n', d
      ? (d.varies ? 'Every chart' : 'Top ' + d.size) + ' \u00b7 ' + d.weeks + ' weeks'
      : 'Coming soon'));
    (d ? picks : soonRow).appendChild(a);
  });
  wrap.appendChild(picks);

  if (dataCharts().length > 2) {
    var ov = document.createElement('a');
    ov.className = 'hub-ov';
    ov.href = '#/overlap';
    ov.appendChild(el('b', null, 'On every chart \u203a'));
    ov.appendChild(el('span', null, 'The songs everyone charted, with where each of them peaked.'));
    wrap.appendChild(ov);
  }

  var five = el('div', 'hub-fives');
  ids.forEach(function (id) {
    var c = CHARTS[id], ix = IX[id];
    var col = el('div', 'five');
    var h = el('div', 'five-h');
    var dot = el('span', 'sw-dot');
    dot.style.background = c.swatch;
    h.appendChild(dot);
    h.appendChild(el('b', null, c.name));
    var dt = el('span', null);
    if (isFresh(ix.last)) dt.appendChild(el('i', 'new-pill', 'NEW'));
    dt.appendChild(document.createTextNode(shortDate(ix.last)));
    h.appendChild(dt);
    col.appendChild(h);
    var list5 = el('div', 'five-list');
    list5.style.background = fade(c.swatch);
    var top5 = ix.top.map(function (x) {
      return trackFor({ title: x.t, artist: x.a }, { }, true, x.i);
    });
    ix.top.forEach(function (r, i) {
      var t = top5[i];
      var row = el('div', 'five-row');
      var pos = el('div', 'idx');
      pos.appendChild(el('span', 'n', String(r.r || i + 1)));
      pos.appendChild(moveChip(r.lw, r.r || i + 1));
      row.appendChild(pos);
      var im = document.createElement('img');
      im.className = 'art'; im.loading = 'lazy'; im.alt = '';
      setArt(im, t, 200);
      row.appendChild(im);
      var m = el('div', 'meta');
      m.appendChild(el('div', 'title', t.title));
      m.appendChild(artistLine(t.artist, 'artist'));
      row.appendChild(m);
      var st = el('div', 'five-st');
      function fig(v, lab, sup) {
        var x = el('span', null);
        var b2 = el('b', null, v);
        if (sup) b2.appendChild(el('i', 'x', '\u00d7' + sup));
        x.appendChild(b2);
        x.appendChild(el('i', 'l', lab));
        return x;
      }
      st.appendChild(fig(typeof r.lw === 'number' ? String(r.lw) : (r.lw || '\u2013'), 'LW'));
      st.appendChild(fig(String(r.p), 'PK', r.x));
      st.appendChild(fig(String(r.w), 'WK'));
      row.appendChild(st);
      row.appendChild(playButton(t, function () { return top5; }, { kind: 'hub' }));
      list5.appendChild(row);
    });
    col.appendChild(list5);
    autoList = autoList.concat(top5);
    var more = document.createElement('a');
    more.className = 'five-more';
    more.href = '?chart=' + id + '#/week/' + ix.last;
    more.textContent = 'See the full chart \u203a';
    col.appendChild(more);
    five.appendChild(col);
  });
  wrap.appendChild(five);

  if (soonRow.children.length) {
    var sh = el('div', 'home-h soon-h');
    sh.appendChild(el('h2', null, 'Coming soon'));
    sh.appendChild(el('span', null, 'Charts on their way to the site'));
    wrap.appendChild(sh);
    wrap.appendChild(soonRow);
  }

  var forms = el('div', 'hub-forms');
  [['Add your chart', 'Send in your own weekly chart and it can live here too.', CH.apply, 1],
   ['Suggest something', 'Anonymous feedback \u2014 ideas, corrections, anything missing.', CH.feedback, 0]]
  .forEach(function (f) {
    var a = document.createElement('a');
    a.className = 'hub-form' + (f[3] ? ' lead' : '');
    a.href = f[2]; a.target = '_blank'; a.rel = 'noopener';
    a.appendChild(el('b', null, f[0]));
    a.appendChild(el('span', null, f[1]));
    forms.appendChild(a);
  });
  wrap.appendChild(forms);

  var log = el('div', 'hub-log');
  log.appendChild(el('h3', null, 'Update log'));
  CH.log.forEach(function (e) {
    var r = el('div', 'log-row');
    r.appendChild(el('b', null, e[0]));
    r.appendChild(el('span', null, e[1]));
    log.appendChild(r);
  });
  wrap.appendChild(log);

  app.appendChild(wrap);
  restoreCurrent();
  pump();
}

/* ---------------- records ---------------- */
var recCache = null;
function records() {
  if (recCache) return recCache;
  var best = { one: [], weeks: [], climb: [], fall: [], debut: [] }, byKey = {};
  WEEKS.forEach(function (w) {
    w.chart.forEach(function (r, i) {
      var rank = r.rank || i + 1, k = r.title + '|' + r.artist;
      var e = byKey[k] || (byKey[k] = { r: r, one: 0, weeks: 0 });
      if (r.peak === 1 && r.atPeak > e.one) e.one = r.atPeak;
      if (r.weeks > e.weeks) e.weeks = r.weeks;
      if (typeof r.lw === 'number') {
        var d = r.lw - rank;
        if (d > 0) best.climb.push({ r: r, v: d, date: w.date, rank: rank, from: r.lw });
        if (d < 0) best.fall.push({ r: r, v: -d, date: w.date, rank: rank, from: r.lw });
      } else if (r.lw === 'NE') best.debut.push({ r: r, v: rank, date: w.date, rank: rank });
    });
  });
  Object.keys(byKey).forEach(function (k) {
    var e = byKey[k];
    if (e.one) best.one.push({ r: e.r, v: e.one });
    best.weeks.push({ r: e.r, v: e.weeks });
  });
  function top(a, asc) {
    a.sort(function (x, y) { return asc ? x.v - y.v : y.v - x.v; });
    return a.slice(0, 5);
  }
  recCache = {
    one: top(best.one), weeks: top(best.weeks),
    climb: top(best.climb), fall: top(best.fall), debut: top(best.debut, 1)
  };
  return recCache;
}
function viewRecords() {
  clearView();
  var R = records();
  var wrap = el('div', 'wrap');
  var head = el('div', 'home-h');
  head.appendChild(el('h2', null, 'Records'));
  head.appendChild(el('span', null, 'Across all ' + WEEKS.length + ' weeks'));
  wrap.appendChild(head);
  var grid = el('div', 'rec-grid');
  [['one', 'Most weeks at No.1', function (x) { return x.v + (x.v === 1 ? ' week' : ' weeks'); }],
   ['weeks', 'Most weeks on chart', function (x) { return x.v + ' weeks'; }],
   ['climb', 'Biggest climb', function (x) { return '+' + x.v + ' \u00b7 ' + x.from + ' to ' + x.rank; }],
   ['fall', 'Biggest fall', function (x) { return '\u2212' + x.v + ' \u00b7 ' + x.from + ' to ' + x.rank; }],
   ['debut', 'Highest debut', function (x) { return 'in at No.' + x.rank; }]]
  .forEach(function (sec) {
    var card = el('div', 'rec');
    card.appendChild(el('h3', null, sec[1]));
    R[sec[0]].forEach(function (x, i) {
      var t = trackFor(x.r);
      var row = el('div', 'rec-row');
      row.appendChild(el('div', 'idx', String(i + 1)));
      var im = document.createElement('img');
      im.className = 'art'; im.loading = 'lazy'; im.alt = '';
      setArt(im, t, 200);
      row.appendChild(im);
      var m = el('div', 'meta');
      m.appendChild(el('div', 'title', t.title));
      m.appendChild(el('div', 'artist', t.artist));
      row.appendChild(m);
      row.appendChild(el('div', 'rec-v', sec[2](x)));
      if (x.date) {
        row.classList.add('go');
        row.title = 'Open ' + pretty(x.date);
        row.addEventListener('click', function () { goToWeek(x.date, t.artKey); });
      }
      card.appendChild(row);
    });
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  app.appendChild(wrap);
  restoreCurrent();
}

/* ---------------- songs on more than one chart ---------------- */
function viewOverlap() {
  clearView();
  var want = dataCharts();
  if (want.some(function (i) { return !loaded(i); })) {
    var wait = el('div', 'wrap');
    wait.appendChild(el('div', 'loading', 'Loading every chart\u2026'));
    app.appendChild(wait);
    needData(want, function () { if (/^#\/overlap/.test(location.hash)) viewOverlap(); });
    return;
  }
  var ids = want;
  var maps = ids.map(function (id) { return chartPeaks(id); });
  var keys = Object.keys(maps[0]).filter(function (k) {
    return maps.every(function (m) { return m[k]; });
  });
  keys.sort(function (a, b) {
    var pa = Math.min.apply(null, maps.map(function (m) { return m[a].p; }));
    var pb = Math.min.apply(null, maps.map(function (m) { return m[b].p; }));
    return pa - pb || a.localeCompare(b);
  });
  var wrap = el('div', 'wrap');
  var head = el('div', 'home-h');
  head.appendChild(el('h2', null, 'On every chart'));
  head.appendChild(el('span', null, keys.length + ' songs charted by all ' + ids.length + ' chartmakers'));
  wrap.appendChild(head);
  var box = el('div', 'rows');
  var shownTracks = [];
  keys.forEach(function (k) {
    var cut = k.lastIndexOf('|');
    var fake = { title: k.slice(0, cut), artist: k.slice(cut + 1) };
    var first = maps.find(function (m) { return m[k].art; });
    var t = trackFor(fake, first ? { } : null, true);
    if (!t.img && first) t.img = first[k].art;
    shownTracks.push(t);
    var r = el('div', 'ov-row');
    var im = document.createElement('img');
    im.className = 'art'; im.loading = 'lazy'; im.alt = '';
    setArt(im, t, 200);
    r.appendChild(im);
    var m = el('div', 'meta');
    m.appendChild(el('div', 'title', t.title));
    m.appendChild(artistLine(t.artist, 'artist'));
    r.appendChild(m);
    var pk = el('div', 'ov-pk');
    ids.forEach(function (id, i) {
      var e = maps[i][k];
      var b = el('span', 'pk-b');
      var dt = el('i', null);
      dt.style.background = CHARTS[id].swatch;
      b.appendChild(dt);
      b.appendChild(document.createTextNode('No.' + e.p + ' \u00b7 ' + e.n + 'w'));
      b.title = CHARTS[id].name + ': peaked at No.' + e.p + ' over ' + e.n + ' weeks';
      pk.appendChild(b);
    });
    r.appendChild(pk);
    r.appendChild(playButton(t, function () { return shownTracks; }, { kind: 'overlap' }));
    box.appendChild(r);
  });
  wrap.appendChild(box);
  if (!keys.length) wrap.appendChild(el('div', 'empty', 'No songs in common yet.'));
  autoList = shownTracks.slice(0, 25);
  app.appendChild(wrap);
  restoreCurrent();
  pump();
}

/* ---------------- this week, in other years ---------------- */
function historyBlock() {
  if (WEEKS.length < 60) return null;
  var now = new Date(WEEKS[0].date + 'T00:00:00Z');
  var oldest = new Date(WEEKS[WEEKS.length - 1].date + 'T00:00:00Z');
  var out = [];
  for (var y = 1; y <= 40; y++) {
    var want = new Date(now.getTime());
    want.setUTCFullYear(want.getUTCFullYear() - y);
    if (want.getTime() < oldest.getTime() - 5 * 86400000) break;
    var best = null, bd = 9e9;
    WEEKS.forEach(function (w) {
      var d = Math.abs(new Date(w.date + 'T00:00:00Z').getTime() - want.getTime());
      if (d < bd) { bd = d; best = w; }
    });
    if (best && bd <= 5 * 86400000) out.push({ y: y, w: best });
  }
  if (!out.length) return null;
  var sec = el('div', 'hist');
  var h = el('div', 'home-h hist-h');
  h.appendChild(el('h2', null, 'This week in previous years'));
  h.appendChild(el('span', null, 'What was No.1 on the same week in other years'));
  var row = el('div', 'hist-row');
  var arrows = el('div', 'hist-nav');
  [['\u2039', -1], ['\u203a', 1]].forEach(function (a) {
    var b = el('button', 'yr-arrow sm', a[0]);
    b.type = 'button';
    b.title = a[1] < 0 ? 'Earlier' : 'Later';
    b.addEventListener('click', function () {
      var step = a[1] * (row.clientWidth ? row.clientWidth * 0.8 : 330);
      if (row.scrollBy) row.scrollBy({ left: step, behavior: 'smooth' });
      else row.scrollLeft += step;
    });
    arrows.appendChild(b);
  });
  h.appendChild(arrows);
  sec.appendChild(h);
  out.forEach(function (o) {
    var top = o.w.chart[0];
    var t = trackFor(top);
    var a = document.createElement('a');
    a.className = 'hist-card';
    a.href = '#/week/' + o.w.date;
    a.addEventListener('click', function () { FLASH = t.artKey; });
    var im = document.createElement('img');
    im.loading = 'lazy'; im.alt = '';
    setArt(im, t, 300);
    a.appendChild(im);
    a.appendChild(el('b', null, o.y + (o.y === 1 ? ' year ago' : ' years ago')));
    a.appendChild(el('span', 'nt', t.title));
    a.appendChild(el('span', 'na', t.artist));
    a.appendChild(el('span', 'nd', shortDate(o.w.date)));
    row.appendChild(a);
  });
  sec.appendChild(row);
  /* the arrows only earn their place once the row actually overflows */
  setTimeout(function () {
    if (row.scrollWidth && row.scrollWidth <= row.clientWidth + 4) arrows.style.display = 'none';
  }, 0);
  return sec;
}

/* ---------------- search ---------------- */
var I_SEARCH = '<path d="M10 2a8 8 0 105 14.3l5.3 5.4 1.4-1.4-5.4-5.3A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/>';
/* The home page holds no chart of its own, so searching from there works
   across every live chart once their data is in. */
var hubIx = null;
function buildHubIndex() {
  if (hubIx) return hubIx;
  var songs = [], weeks = [], byArtist = {};
  dataCharts().forEach(function (id) {
    var d = CHART_DATA[id];
    if (!d) return;
    var best = {};
    d.WEEKS.forEach(function (w) {
      weeks.push({ label: w.label, date: w.date, chart: id, hay: loose(w.label),
                   top: w.chart[0] });
      w.chart.forEach(function (r, i) {
        var k = r.title + '|' + r.artist, rank = r.rank || i + 1;
        var e = best[k];
        if (!e) best[k] = { title: r.title, artist: r.artist, peak: rank, chart: id,
                            date: w.date, hay: loose(r.title + ' ' + r.artist) };
        else {
          if (rank < e.peak) e.peak = rank;
          if (w.date > e.date) e.date = w.date;
        }
      });
    });
    Object.keys(best).forEach(function (k) {
      songs.push(best[k]);
      splitArtists(best[k].artist).forEach(function (nm) {
        var key = id + '|' + nm;
        if (!byArtist[key]) byArtist[key] = { name: nm, chart: id, n: 0, hay: loose(nm) };
        byArtist[key].n++;
      });
    });
  });
  hubIx = { songs: songs, weeks: weeks,
            artists: Object.keys(byArtist).map(function (k) { return byArtist[k]; }) };
  return hubIx;
}

function openSearch() {
  var body = openModal('Search', CH.hub ? 'Songs and artists across every chart' :
    songs.length + ' songs \u00b7 ' + ARTISTS.length + ' artists \u00b7 ' + WEEKS.length + ' weeks');
  var inp = document.createElement('input');
  inp.className = 'srch-in';
  inp.type = 'search';
  inp.placeholder = 'Song, artist or date\u2026';
  inp.setAttribute('aria-label', 'Search');
  body.appendChild(inp);
  var out = el('div', 'srch-out');
  body.appendChild(out);
  function go(href) { closeModal(); location.hash = href; }
  function jump(chart, hash) {
    if (chart === CH.id) { go(hash); return; }
    closeModal();
    location.href = '?chart=' + chart + hash;
  }
  function run() {
    var q = loose(inp.value);
    out.textContent = '';
    if (q.length < 2) { out.appendChild(el('div', 'srch-hint', 'Type at least two letters.')); return; }
    if (CH.hub) { runHub(q); return; }
    var hits = 0;
    function group(name, items) {
      if (!items.length) return;
      hits += items.length;
      out.appendChild(el('div', 'srch-h', name));
      items.forEach(function (it) {
        var b = el('button', 'srch-row');
        b.type = 'button';
        b.appendChild(el('b', null, it[0]));
        if (it[1]) b.appendChild(el('span', null, it[1]));
        b.addEventListener('click', function () { it[2](); });
        out.appendChild(b);
      });
    }
    group('Artists', ARTISTS.filter(function (a) { return loose(a.name).indexOf(q) >= 0; })
      .slice(0, 6).map(function (a) {
        return [a.name, a.songs + (a.songs === 1 ? ' song' : ' songs'),
                function () { go('#/artist/' + ARTIST_SLUG[a.name]); }];
      }));
    group('Songs', songs.filter(function (t) { return t.hay.indexOf(q) >= 0; })
      .sort(function (x, y) { return x.peak - y.peak; }).slice(0, 8).map(function (t) {
        var last = t.run.length ? t.run[0].d : null;
        return [t.title, t.artist + ' \u00b7 peak No.' + t.peak,
                function () { if (last) { closeModal(); goToWeek(last, t.artKey); } }];
      }));
    group('Weeks', WEEKS.filter(function (w) { return loose(w.label).indexOf(q) >= 0; })
      .slice(0, 5).map(function (w) {
        return [w.label, 'No.1: ' + w.chart[0].title, function () { go('#/week/' + w.date); }];
      }));
    if (!hits) out.appendChild(el('div', 'srch-hint', 'Nothing found.'));
  }
  function runHub(q) {
    var want = dataCharts();
    if (want.some(function (i) { return !loaded(i); })) {
      out.appendChild(el('div', 'srch-hint', 'Loading the charts\u2026'));
      needData(want, function () { hubIx = null; if (document.body.contains(inp)) run(); });
      return;
    }
    var ix = buildHubIndex(), hits = 0;
    function group(name, items) {
      if (!items.length) return;
      hits += items.length;
      out.appendChild(el('div', 'srch-h', name));
      items.forEach(function (it) {
        var b = el('button', 'srch-row');
        b.type = 'button';
        b.appendChild(el('b', null, it[0]));
        if (it[1]) b.appendChild(el('span', null, it[1]));
        b.addEventListener('click', it[2]);
        out.appendChild(b);
      });
    }
    /* artists are left to each chart's own page, where the slugs are built */
    group('Songs', ix.songs.filter(function (t) { return t.hay.indexOf(q) >= 0; })
      .sort(function (x, y) { return x.peak - y.peak; }).slice(0, 8).map(function (t) {
        return [t.title, t.artist + ' \u00b7 ' + CHARTS[t.chart].name + ' \u00b7 peak No.' + t.peak,
                function () { jump(t.chart, '#/week/' + t.date); }];
      }));
    group('Weeks', ix.weeks.filter(function (w) { return w.hay.indexOf(q) >= 0; })
      .slice(0, 5).map(function (w) {
        return [w.label, CHARTS[w.chart].name + ' \u00b7 No.1: ' + w.top.title,
                function () { jump(w.chart, '#/week/' + w.date); }];
      }));
    if (!hits) out.appendChild(el('div', 'srch-hint', 'Nothing found.'));
  }
  inp.addEventListener('input', run);
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var f = out.querySelector('.srch-row');
      if (f) f.click();
    }
  });
  run();
  setTimeout(function () { try { inp.focus(); } catch (e) {} }, 30);
}

/* ---------------- keyboard ---------------- */
function togglePlay() {
  var t = cur();
  if (!t) return;
  if (audio.paused) { var pr = audio.play(); if (pr && pr.catch) pr.catch(function () {}); startRaf(); }
  else audio.pause();
  setGlyph(t, !audio.paused);
  updateDock();
}
document.addEventListener('keydown', function (e) {
  var tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === '/') { e.preventDefault(); openSearch(); }
  else if (e.key === ' ' && cur()) { e.preventDefault(); togglePlay(); }
  else if (e.key === 'ArrowRight' && cur()) { e.preventDefault(); advance(1); }
  else if (e.key === 'ArrowLeft' && cur()) { e.preventDefault(); advance(-1); }
});

/* ---------------- shuffle ---------------- */
var altCache = {};
function chartTracks(id) {
  if (id === CH.id && loaded(id)) return songs.slice();
  if (altCache[id]) return altCache[id];
  var d = CHART_DATA[id];
  if (!d) return [];
  var seen = {}, out = [];
  d.WEEKS.forEach(function (w) {
    w.chart.forEach(function (r) {
      var ak = r.title + '|' + r.artist;
      if (seen[ak]) return;
      seen[ak] = 1;
      out.push(trackFor(r, d.ART, true));
    });
  });
  altCache[id] = out;
  return out;
}
function shuffled(a) {
  var x = a.slice(), i, j, tmp;
  for (i = x.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    tmp = x[i]; x[i] = x[j]; x[j] = tmp;
  }
  return x;
}
var NOTE = '<path d="M12 3v10.6a3.4 3.4 0 10 2 3.1V7h5V3h-7z"/>';
var shufPick = null;
function buildShuffle() {
  var a = document.createElement('a');
  a.className = 'note-btn';
  a.href = '#/shuffle';
  a.title = 'Shuffle previews';
  a.setAttribute('aria-label', 'Shuffle previews');
  a.appendChild(svg(NOTE));
  return a;
}
function viewShuffle() {
  clearView();
  var ids = dataCharts();
  if (!shufPick) { shufPick = {}; shufPick[loaded(CH.id) ? CH.id : ids[0]] = 1; }
  var wrap = el('div', 'wrap');

  var head = el('div', 'shuf-head');
  var viz = el('div', 'viz');
  for (var v = 0; v < 9; v++) viz.appendChild(el('i', null));
  head.appendChild(viz);
  head.appendChild(el('h1', null, 'Shuffle'));
  head.appendChild(el('p', null,
    'Every song that has ever charted, in a random order, 30 seconds at a time. ' +
    'It keeps going on its own \u2014 skip with the player at the bottom.'));
  wrap.appendChild(head);

  var picks = el('div', 'shuf-cards');
  var cards = [];
  function paint() {
    cards.forEach(function (c) { c.el.classList.toggle('on', !!shufPick[c.id]); });
  }
  ids.forEach(function (id) {
    var c = CHARTS[id];
    var b = el('button', 'shuf-card');
    b.type = 'button';
    var dot = el('span', 'sw-dot');
    dot.style.background = c.swatch;
    b.appendChild(dot);
    b.appendChild(el('b', null, c.name));
    b.appendChild(el('span', 'n', chartTracks(id).length + ' songs'));
    b.addEventListener('click', function () {
      shufPick[id] = !shufPick[id];
      if (!ids.some(function (k) { return shufPick[k]; })) shufPick[id] = 1;
      paint();
    });
    cards.push({ id: id, el: b });
    picks.appendChild(b);
  });
  paint();
  wrap.appendChild(picks);

  var go = el('button', 'shuf-go', 'Shuffle play');
  go.type = 'button';
  /* a chart the page has not fetched yet is pulled in before the queue is built */
  function withPicked(run) {
    var want = Object.keys(shufPick).filter(function (i) { return shufPick[i]; });
    var absent = want.filter(function (i) { return !loaded(i); });
    if (!absent.length) { run(); return; }
    var was = go.textContent;
    go.disabled = true;
    go.textContent = 'Loading ' + absent.map(function (i) { return CHARTS[i].name; }).join(' and ') + '\u2026';
    needData(want, function (bad) {
      go.disabled = false;
      go.textContent = was;
      if (bad && bad.length) { go.textContent = 'Could not load that chart'; return; }
      run();
    });
  }
  var queue = el('div', 'queue');
  go.addEventListener('click', function () { withPicked(function () {
    var pool = [];
    ids.forEach(function (id) { if (shufPick[id]) pool = pool.concat(chartTracks(id)); });
    pool = pool.filter(function (t) { return t.state !== 'dead'; });
    if (!pool.length) return;
    var list = shuffled(pool);
    autoList = list.slice(0, 60);
    startTrack(list[0], list, { kind: 'shuffle' });
    prioritise(list, 0);
    queue.textContent = '';
    queue.appendChild(el('h3', null, 'Up next'));
    var rows = el('div', 'rows');
    list.slice(0, 25).forEach(function (t, i) {
      var r = el('div', 'q-row');
      r.appendChild(el('div', 'idx', String(i + 1)));
      var im = document.createElement('img');
      im.className = 'art'; im.loading = 'lazy'; im.alt = '';
      setArt(im, t, 200);
      r.appendChild(im);
      var m2 = el('div', 'meta');
      m2.appendChild(el('div', 'title', t.title));
      m2.appendChild(artistLine(t.artist, 'artist'));
      r.appendChild(m2);
      var pk = el('div', 'q-pk');
      dataCharts().forEach(function (cid) {
        var e = chartPeaks(cid)[t.artKey];
        if (!e) return;
        var p = e.p;
        var b = el('span', 'pk-b', 'No.' + p);
        b.style.borderColor = CHARTS[cid].swatch;
        b.title = 'Peaked at No.' + p + ' on ' + CHARTS[cid].name;
        var dt = el('i', null);
        dt.style.background = CHARTS[cid].swatch;
        b.insertBefore(dt, b.firstChild);
        pk.appendChild(b);
      });
      r.appendChild(pk);
      r.appendChild(playButton(t, function () { return list; }, { kind: 'shuffle' }));
      rows.appendChild(r);
    });
    queue.appendChild(rows);
    restoreCurrent();
  }); });
  wrap.appendChild(go);
  wrap.appendChild(queue);
  app.appendChild(wrap);
  restoreCurrent();
}

/* ---------------- popups ---------------- */
var modalEl = null;
function closeModal() { if (modalEl && modalEl.parentNode) modalEl.parentNode.removeChild(modalEl); modalEl = null; }
function openModal(title, sub) {
  closeModal();
  var back = el('div', 'modal-back');
  var box = el('div', 'modal');
  var head = el('div', 'modal-h');
  var ttl = el('div', 'modal-t');
  ttl.appendChild(el('b', null, title));
  if (sub) ttl.appendChild(el('span', null, sub));
  head.appendChild(ttl);
  var x = el('button', 'modal-x', '\u2715');
  x.type = 'button'; x.title = 'Close'; x.setAttribute('aria-label', 'Close');
  x.addEventListener('click', closeModal);
  head.appendChild(x);
  box.appendChild(head);
  var body = el('div', 'modal-b');
  box.appendChild(body);
  back.appendChild(box);
  back.addEventListener('click', function (e) { if (e.target === back) closeModal(); });
  document.body.appendChild(back);
  modalEl = back;
  return body;
}
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

/* Jumping to a week from a chart run: land on the song, not just the page. */
var FLASH = null;
function goToWeek(date, artKey) {
  FLASH = artKey || null;
  closeModal();
  location.hash = '#/week/' + date;
}
function settleFlash() {
  if (!FLASH) return;
  var want = FLASH; FLASH = null;
  var rows = app.querySelectorAll('.row'), i;
  for (i = 0; i < rows.length; i++) {
    if (rows[i].getAttribute('data-k') !== want) continue;
    var row = rows[i];
    if (row.scrollIntoView) { try { row.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { row.scrollIntoView(); } }
    row.classList.add('flash');
    setTimeout(function () { row.classList.remove('flash'); }, 1900);
    return;
  }
}

/* ---------------- chart run ---------------- */
var openRun = null, openRunRow = null, VIEW_DATE = null;
/* What each row counts as, for the filter bar. */
var CATS = [['up', 'Climbers', '\u25b2'], ['down', 'Fallers', '\u25bc'], ['same', 'Static', '\u2013'],
            ['new', 'Debuts', '\u2605'], ['re', 'Re-entries', '\u21ba']];
var CATS2 = [['peak', 'At its peak'], ['top10', 'Top 10'], ['long', '10+ weeks'], ['solo', 'No features']];
function tagsFor(data, rank, t) {
  var g = [];
  if (data.lw === 'NE') g.push('new');
  else if (data.lw === 'RE') g.push('re');
  else if (data.lw > rank) g.push('up');
  else if (data.lw < rank) g.push('down');
  else g.push('same');
  if (rank === data.peak) g.push('peak');
  if (rank <= 10) g.push('top10');
  if (data.weeks >= 10) g.push('long');
  if (splitArtists(t.artist).length === 1) g.push('solo');
  return g;
}
function dm(iso) { var p = ymd(iso); return p[2] + '/' + p[1]; }
function closeRun(instant) {
  if (!openRun) return;
  var p = openRun, r = openRunRow;
  openRun = null; openRunRow = null;
  if (r) r.classList.remove('open');
  if (instant) { if (p.parentNode) p.parentNode.removeChild(p); return; }
  p.classList.remove('open');
  setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 340);
}
function runChart(t) {
  var box = el('div', 'run-in');
  var h = el('div', 'run-h');
  h.appendChild(el('b', null, 'Chart run'));
  h.appendChild(el('span', null, t.run.length + (t.run.length === 1 ? ' week' : ' weeks') +
    ' \u00b7 peak No.' + t.peak + (t.atPeak ? ' for ' + t.atPeak : '')));
  var tabs = el('div', 'run-tabs');
  var body = el('div', 'run-body');
  var made = {};
  function show(which) {
    [].forEach.call(tabs.children, function (b) { b.classList.toggle('on', b.getAttribute('data-v') === which); });
    body.textContent = '';
    if (!made[which]) made[which] = which === 'graph' ? runGraph(t) : runCells(t);
    body.appendChild(made[which]);
  }
  [['graph', 'Graph'], ['cells', 'Positions']].forEach(function (v) {
    var b = el('button', 'run-tab', v[1]);
    b.type = 'button';
    b.setAttribute('data-v', v[0]);
    b.addEventListener('click', function (e) { e.stopPropagation(); show(v[0]); });
    tabs.appendChild(b);
  });
  h.appendChild(tabs);
  box.appendChild(h);
  box.appendChild(body);
  show('graph');
  return box;
}

/* Every position it has held, in order, grouped by unbroken spells. */
function runCells(t) {
  var box = el('div', 'cells');
  var pts = t.run.map(function (p) {
    return { i: WEEKS.length - 1 - WEEK_BY_DATE[p.d], r: p.r, d: p.d };
  }).sort(function (a, b) { return a.i - b.i; });
  if (!pts.length) { box.appendChild(el('div', 'run-empty', 'No chart run recorded.')); return box; }

  var key = el('div', 'cells-key');
  var k1 = el('span', null); k1.appendChild(el('i', 'kc pk')); k1.appendChild(document.createTextNode('Peak position'));
  var k2 = el('span', null); k2.appendChild(el('i', 'kc now')); k2.appendChild(document.createTextNode('This week'));
  key.appendChild(k1); key.appendChild(k2);
  box.appendChild(key);

  var runs = [], cur = [pts[0]], k;
  for (k = 1; k < pts.length; k++) {
    if (pts[k].i === pts[k - 1].i + 1) cur.push(pts[k]);
    else { runs.push(cur); cur = [pts[k]]; }
  }
  runs.push(cur);
  runs.forEach(function (sp) {
    box.appendChild(el('div', 'cells-h', sp.length + (sp.length === 1 ? ' week \u00b7 ' : ' weeks \u00b7 ') +
      shortDate(sp[0].d) + ' to ' + shortDate(sp[sp.length - 1].d)));
    var grid = el('div', 'cells-grid');
    sp.forEach(function (p) {
      var c = el('button', 'cell' + (p.r === t.peak ? ' pk' : '') + (p.d === VIEW_DATE ? ' now' : ''),
        String(p.r));
      c.type = 'button';
      c.title = 'No.' + p.r + ' on ' + pretty(p.d) + ' \u2014 open that week';
      c.addEventListener('click', function (e) { e.stopPropagation(); goToWeek(p.d, t.artKey); });
      grid.appendChild(c);
    });
    box.appendChild(grid);
  });
  return box;
}

function runGraph(t) {
  var box = el('div', 'run-graph');
  var pts = t.run.map(function (p) {
    return { i: WEEKS.length - 1 - WEEK_BY_DATE[p.d], r: p.r, d: p.d };
  }).sort(function (a, b) { return a.i - b.i; });
  if (!pts.length) { box.appendChild(el('div', 'run-empty', 'No chart run recorded.')); return box; }

  var W = 720, H = 200, L = 30, R = 12, T = 14, B = 26;
  var i0 = pts[0].i, i1 = pts[pts.length - 1].i, span = Math.max(1, i1 - i0);
  function X(i) { return pts.length === 1 ? L + (W - L - R) / 2 : L + (i - i0) / span * (W - L - R); }
  function Y(r) { return T + (r - 1) / (SIZE - 1) * (H - T - B); }

  var wrapBox = el('div', 'run-box');
  var svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Chart run for ' + t.title);

  [1, Math.round(1 + (SIZE - 1) / 3), Math.round(1 + 2 * (SIZE - 1) / 3), SIZE].forEach(function (r) {
    var ln = document.createElementNS(SVGNS, 'line');
    ln.setAttribute('class', 'run-grid');
    ln.setAttribute('x1', L); ln.setAttribute('x2', W - R);
    ln.setAttribute('y1', Y(r)); ln.setAttribute('y2', Y(r));
    svg.appendChild(ln);
    var lab = document.createElementNS(SVGNS, 'text');
    lab.setAttribute('class', 'run-lab');
    lab.setAttribute('x', L - 7); lab.setAttribute('y', Y(r) + 3);
    lab.setAttribute('text-anchor', 'end');
    lab.textContent = String(r);
    svg.appendChild(lab);
  });

  var segs = [], cur = [pts[0]], k;
  for (k = 1; k < pts.length; k++) {
    if (pts[k].i === pts[k - 1].i + 1) cur.push(pts[k]);
    else { segs.push(cur); cur = [pts[k]]; }
  }
  segs.push(cur);
  segs.forEach(function (sg) {
    if (sg.length < 2) return;
    var pl = document.createElementNS(SVGNS, 'polyline');
    pl.setAttribute('class', 'run-line');
    pl.setAttribute('points', sg.map(function (p) { return X(p.i) + ',' + Y(p.r); }).join(' '));
    svg.appendChild(pl);
  });

  var nLab = Math.min(6, pts.length);
  for (k = 0; k < nLab; k++) {
    var pt = pts[nLab === 1 ? 0 : Math.round(k * (pts.length - 1) / (nLab - 1))];
    var xl = document.createElementNS(SVGNS, 'text');
    xl.setAttribute('class', 'run-lab');
    xl.setAttribute('x', X(pt.i)); xl.setAttribute('y', H - 6);
    xl.setAttribute('text-anchor', k === 0 ? 'start' : k === nLab - 1 ? 'end' : 'middle');
    xl.textContent = dm(pt.d);
    svg.appendChild(xl);
  }

  var tip = el('div', 'run-tip');
  pts.forEach(function (p) {
    var dot = document.createElementNS(SVGNS, 'circle');
    dot.setAttribute('class', 'run-dot');
    dot.setAttribute('cx', X(p.i)); dot.setAttribute('cy', Y(p.r)); dot.setAttribute('r', '3.4');
    var hit = document.createElementNS(SVGNS, 'circle');
    hit.setAttribute('class', 'run-hit');
    hit.setAttribute('cx', X(p.i)); hit.setAttribute('cy', Y(p.r)); hit.setAttribute('r', '11');
    hit.setAttribute('tabindex', '0');
    hit.setAttribute('role', 'button');
    hit.setAttribute('aria-label', 'No.' + p.r + ' on ' + pretty(p.d) + ' \u2014 open that week');
    function show() {
      tip.textContent = '';
      tip.appendChild(document.createTextNode('No.' + p.r));
      tip.appendChild(el('i', null, pretty(p.d)));
      tip.style.left = (X(p.i) / W * 100) + '%';
      tip.style.top = (Y(p.r) / H * 100) + '%';
      tip.classList.add('on');
      dot.classList.add('hi');
    }
    function hide() { tip.classList.remove('on'); dot.classList.remove('hi'); }
    hit.addEventListener('mouseenter', show);
    hit.addEventListener('focus', show);
    hit.addEventListener('mouseleave', hide);
    hit.addEventListener('blur', hide);
    hit.addEventListener('click', function (e) {
      e.stopPropagation();
      goToWeek(p.d, t.artKey);
    });
    svg.appendChild(hit);
    svg.appendChild(dot);
  });
  wrapBox.appendChild(svg);
  wrapBox.appendChild(tip);
  box.appendChild(wrapBox);
  return box;
}
function wireRun(row, t) {
  row.addEventListener('click', function (e) {
    if (e.target.closest && (e.target.closest('.pw') || e.target.closest('.a-link'))) return;
    if (openRunRow === row) { closeRun(); return; }
    closeRun(1);
    var panel = el('div', 'run');
    panel.appendChild(runChart(t));
    row.parentNode.insertBefore(panel, row.nextSibling);
    void panel.offsetHeight;
    panel.classList.add('open');
    row.classList.add('open');
    openRun = panel; openRunRow = row;
  });
}

/* ---------------- one artist ---------------- */
function viewArtist(slug) {
  var name = SLUG_ARTIST[slug];
  if (!name) { location.hash = '#/archive'; return; }
  clearView();
  var a = ARTIST_BY[name];
  var wrap = el('div', 'wrap');

  var mine = songs.filter(function (t) { return splitArtists(t.artist).indexOf(name) >= 0; });
  mine.sort(function (x, y) { return x.peak - y.peak || y.wks - x.wks || x.title.localeCompare(y.title); });

  var ban = el('div', 'a-ban');
  var custom = ARTIST_BANNER[name];
  if (custom) {
    ban.classList.add('has');
    ban.style.backgroundImage = 'url("' + custom + '")';
  } else if (mine.length) {
    ban.style.backgroundImage = 'url("' + thumb(mine[0].img, 600) + '")';
  }
  ban.appendChild(el('div', 'a-ban-veil'));
  wrap.appendChild(ban);

  var head = el('div', 'a-head');
  head.appendChild(el('div', 'eyebrow', 'Artist'));
  head.appendChild(el('h1', null, name));
  head.appendChild(el('p', null,
    'First charted ' + shortDate(a.first) + ' \u00b7 most recently ' + shortDate(a.last) +
    ' \u00b7 best position No.' + a.best));
  wrap.appendChild(head);

  var grid = el('div', 'a-stats');
  [['songs', 'Songs charted'], ['no1s', 'Number ones'], ['top10s', 'Top 10 hits'],
   ['weeks', 'Weeks on chart'], ['weeksAt1', 'Weeks at No.1'], ['points', 'Chart points']]
  .forEach(function (m) {
    var c = el('button', 'a-stat');
    c.type = 'button';
    c.title = 'See the top 25 artists for ' + m[1].toLowerCase();
    c.addEventListener('click', function () { showTop(m[0]); });
    c.appendChild(el('b', null, m[0] === 'points' ? fmtPts(a[m[0]]) : String(a[m[0]])));
    c.appendChild(el('span', null, m[1]));
    var r = a.ranks[m[0]];
    c.appendChild(el('i', a[m[0]] ? null : 'none',
      a[m[0]] ? 'No.' + r + ' of ' + ARTISTS.length + ' artists' : '\u2014'));
    grid.appendChild(c);
  });
  wrap.appendChild(grid);

  autoList = mine.slice(0, 25);

  var sec = el('div', 'sec');
  sec.appendChild(el('h3', null, 'Every charted song'));
  sec.appendChild(el('span', null, mine.length + (mine.length === 1 ? ' song' : ' songs')));
  wrap.appendChild(sec);

  var list = el('div', 'rows');
  mine.forEach(function (t, i) {
    var r = el('div', 'a-row');
    r.appendChild(el('div', 'idx', String(i + 1)));
    var im = document.createElement('img');
    im.className = 'art'; im.loading = 'lazy'; im.alt = '';
    setArt(im, t, 200);
    r.appendChild(im);
    var m = el('div', 'meta');
    m.appendChild(el('div', 'title', t.title));
    m.appendChild(artistLine(t.artist, 'artist'));
    r.appendChild(m);
    function stat(v, lab) {
      var d = el('div', 'stat st');
      d.appendChild(el('b', null, String(v)));
      d.appendChild(el('span', null, lab));
      return d;
    }
    var pk = el('div', 'stat st');
    var pb = el('b', null, String(t.peak));
    if (t.atPeak) pb.appendChild(el('i', 'x', '\u00d7' + t.atPeak));
    pk.appendChild(pb);
    pk.appendChild(el('span', null, 'Peak'));
    r.appendChild(pk);
    r.appendChild(stat(t.run.length, 'Weeks'));
    r.appendChild(playButton(t, function () { return mine; }, { kind: 'artist' }));
    wireRun(r, t);
    list.appendChild(r);
  });
  wrap.appendChild(list);

  var back = document.createElement('a');
  back.className = 'back'; back.href = '#/archive';
  back.textContent = '\u2039  Back to the archive';
  wrap.appendChild(back);
  app.appendChild(wrap);
  restoreCurrent();
  pump();
}

/* ---------------- router ---------------- */
function setNav(kind) {
  document.querySelectorAll('.nav a').forEach(function (a) {
    a.classList.toggle('on', a.getAttribute('data-nav') === kind);
  });
}
function route() {
  var keepScroll = !!FLASH;
  var h = location.hash.replace(/^#/, '') || '/';
  if (CH.hub || CH.pending) {
    closeModal();
    if (CH.pending) { setNav(''); viewPending(); }
    else if (h === '/fixes') { setNav(''); viewFixes(); }
    else if (h === '/shuffle') { setNav('shuffle'); viewShuffle(); }
    else if (h === '/overlap') { setNav('overlap'); viewOverlap(); }
    else { setNav(''); viewHub(); }
    window.scrollTo(0, 0);
    padBody();
    return;
  }
  var m;
  if (h === '/charts') { setNav('charts'); viewCharts(); }
  else if (h === '/archive') { setNav('archive'); viewArchive(); }
  else if ((m = /^\/week\/(\d{4}-\d{2}-\d{2})$/.exec(h))) { setNav('week'); viewWeek(m[1]); }
  else if ((m = /^\/artist\/(.+)$/.exec(h))) { setNav(''); viewArtist(decodeURIComponent(m[1])); }
  else if ((m = /^\/year-end(?:\/(\d{4}))?(?:\/(\d{4}-\d{2}-\d{2}))?$/.exec(h))) {
    setNav('year-end'); viewYearEnd(m[1] || LIVE_YEAR, m[2]);
  }
  else if (h === '/all-time') { setNav('all-time'); viewAllTime(); }
  else if (h === '/shuffle') { setNav('shuffle'); viewShuffle(); }
  else if (h === '/records') { setNav('records'); viewRecords(); }
  else if (h === '/fixes') { setNav(''); viewFixes(); }
  else if (h === '/overlap') { setNav('overlap'); viewOverlap(); }
  else if ((m = /^\/top\/(\w+)$/.exec(h))) { setNav(''); viewTop(m[1]); }
  else { setNav(''); viewHome(); }
  if (!keepScroll) window.scrollTo(0, 0);   /* a chart-run jump centres the song itself */
  padBody();
}
/* #/owner toggles the correction controls on this machine only. */
function ownerSwitch() {
  if (location.hash !== '#/owner') return false;
  setOwner(!isOwner());
  location.replace(location.pathname + location.search + '#/fixes');
  return true;
}
window.addEventListener('hashchange', function () { if (!ownerSwitch()) route(); });

buildHeader();
var savedTheme = 'dark';
try { savedTheme = localStorage.getItem('ycTheme') || 'dark'; } catch (e) {}
applyTheme(savedTheme);
if (!ownerSwitch()) route();
buildFooter();

window.yellowCharts = {
  sure: sure, score: scoreCand,   /* for diagnosing a bad preview match */
  art: { set: setArt, adopt: adoptArt },   /* for diagnosing a missing cover */
  weeks: WEEKS, songs: songs, audio: audio,
  stop: stopAll,
  cacheCount: function () { return songs.filter(function (t) { return t.state === 'ready'; }).length; },
  clearCache: function () { cache = {}; try { localStorage.removeItem(CACHE_KEY); } catch (e) {} }
};
})();
