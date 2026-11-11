const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes
const DATA_DIR = path.join(__dirname, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_FILE = path.join(__dirname, 'index.html');

const PAGES = [
  {
    id: 'IN',
    url: 'https://www.goodreturns.in/gold-rates/hyderabad.html',
    city: 'Hyderabad',
    cur: 'INR',
  },
  {
    id: 'GB',
    url: 'https://www.goodreturns.in/gold-rates/england.html',
    city: 'England',
    cur: 'GBP',
  },
  {
    id: 'AE',
    url: 'https://www.goodreturns.in/gold-rates/dubai.html',
    city: 'Dubai',
    cur: 'AED',
  },
  {
    id: 'US',
    url: 'https://www.goodreturns.in/gold-rates/united-states.html',
    city: 'United States',
    cur: 'USD',
  },
];

const SEED_RATES = {
  IN: {
    id: 'IN',
    city: 'Hyderabad',
    cur: 'INR',
    rates: {
      24: { p: 14411, c: -49 },
      22: { p: 13210, c: -45 },
      18: { p: 10808, c: -37 },
    },
    inr: null,
  },
  GB: {
    id: 'GB',
    city: 'England',
    cur: 'GBP',
    rates: {
      24: { p: 98.54, c: -0.54 },
      22: { p: 90.33, c: -0.49 },
      18: { p: 73.90, c: -0.40 },
    },
    inr: {
      24: { p: 12412, c: -68 },
      22: { p: 11337, c: -61 },
      18: { p: 9293, c: -50 },
    },
  },
  AE: {
    id: 'AE',
    city: 'Dubai',
    cur: 'AED',
    rates: {
      24: { p: 497.25, c: 6.75 },
      22: { p: 460.50, c: 6.25 },
      18: { p: 378.50, c: 5.25 },
    },
    inr: {
      24: { p: 12676, c: 172 },
      22: { p: 11718, c: 159 },
      18: { p: 9649, c: 134 },
    },
  },
  US: {
    id: 'US',
    city: 'United States',
    cur: 'USD',
    rates: {
      24: { p: 136.00, c: 2 },
      22: { p: 131.50, c: 2 },
      18: { p: 107.60, c: 1.60 },
    },
    inr: {
      24: { p: 12714, c: 188 },
      22: { p: 12292, c: 187 },
      18: { p: 10083, c: 150 },
    },
  },
};

function loadHistoryStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(HISTORY_FILE)) {
      const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read history store:', err.message);
  }
  return { IN: {}, GB: {}, AE: {}, US: {} };
}

function saveHistoryStore(store) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write history store:', err.message);
  }
}

function pruneAndFormatHistory(countryMap) {
  const cutoffMs = Date.now() - 400 * 24 * 60 * 60 * 1000;
  const dates = Object.keys(countryMap || {}).sort();
  const result = [];
  for (const date of dates) {
    const ts = Date.parse(date + 'T00:00:00Z');
    if (!Number.isNaN(ts) && ts < cutoffMs) {
      delete countryMap[date];
      continue;
    }
    const row = countryMap[date];
    if (row && typeof row['24'] === 'number' && typeof row['22'] === 'number') {
      result.push({
        date,
        24: row['24'],
        22: row['22'],
        c24: typeof row.c24 === 'number' ? row.c24 : 0,
        c22: typeof row.c22 === 'number' ? row.c22 : 0,
      });
    }
  }
  return result;
}

function cleanCellText(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x20b9;|&#8377;/gi, '₹')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTables(html) {
  const tables = [];
  const tableRegex = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch;
  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tableMatch[1];
    const rows = [];
    const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1];
      const cells = [];
      const cellRegex = /<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        cells.push(cleanCellText(cellMatch[1]));
      }
      if (cells.length > 0) {
        rows.push(cells);
      }
    }
    if (rows.length > 0) {
      tables.push(rows);
    }
  }
  return tables;
}

function parsePriceCell(text) {
  const raw = String(text || '');
  let change = 0;

  const parenMatch = raw.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const inner = parenMatch[1].replace(/,/g, '').trim();
    const isNeg = /[-−\u2212]/.test(inner);
    const numMatch = inner.match(/\d+(?:\.\d+)?/);
    if (numMatch) {
      const val = parseFloat(numMatch[0]);
      change = isNeg && val !== 0 ? -val : val;
    }
  }

  const withoutParens = raw.replace(/\([^)]*\)/g, ' ');
  const priceMatch = withoutParens.match(/\d[\d,]*(?:\.\d+)?/);
  if (!priceMatch) {
    throw new Error(`Unable to parse price from cell "${raw}" (page layout changed?)`);
  }
  const price = parseFloat(priceMatch[0].replace(/,/g, ''));
  if (Number.isNaN(price)) {
    throw new Error(`Invalid numeric price in cell "${raw}" (page layout changed?)`);
  }
  return { p: price, c: change };
}

function parseGramTableRow(table) {
  const oneGramRow = table.find((r) => r[0] === '1');
  if (!oneGramRow || oneGramRow.length < 4) {
    throw new Error('1-gram row missing in Gram table (page layout changed?)');
  }
  return {
    24: parsePriceCell(oneGramRow[1]),
    22: parsePriceCell(oneGramRow[2]),
    18: parsePriceCell(oneGramRow[3]),
  };
}

function parseDateToISO(dateText) {
  const cleaned = String(dateText || '').trim();
  const d = new Date(cleaned + ' UTC');
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toISOString().slice(0, 10);
}

function parseCountryHtml(html, meta) {
  const tables = extractTables(html);

  const gramTables = tables.filter(
    (t) => t.length > 1 && String(t[0][0] || '').toLowerCase() === 'gram'
  );
  if (gramTables.length === 0) {
    throw new Error(`Price table not found for ${meta.id} (page layout changed?)`);
  }

  const rates = parseGramTableRow(gramTables[0]);
  let inr = null;
  if (meta.id !== 'IN') {
    if (gramTables.length >= 2) {
      inr = parseGramTableRow(gramTables[1]);
    }
  }

  const historyTable = tables.find(
    (t) => t.length > 1 && String(t[0][0] || '').toLowerCase() === 'date'
  );
  const historyRows = [];
  if (historyTable) {
    for (let i = 1; i < historyTable.length; i++) {
      const row = historyTable[i];
      if (!row || row.length < 3) continue;
      const isoDate = parseDateToISO(row[0]);
      if (!isoDate) continue;
      try {
        const r24 = parsePriceCell(row[1]);
        const r22 = parsePriceCell(row[2]);
        historyRows.push({
          date: isoDate,
          24: r24.p,
          22: r22.p,
          c24: r24.c,
          c22: r22.c,
        });
      } catch (_e) {
        // Ignore malformed row
      }
    }
  }

  return { rates, inr, historyRows };
}

let historyStore = loadHistoryStore();
let cachedCountries = {};
for (const page of PAGES) {
  const histMap = historyStore[page.id] || (historyStore[page.id] = {});
  if (SEED_RATES[page.id]) {
    cachedCountries[page.id] = {
      id: page.id,
      city: page.city,
      cur: page.cur,
      rates: SEED_RATES[page.id].rates,
      inr: SEED_RATES[page.id].inr,
      history: pruneAndFormatHistory(histMap),
    };
  }
}

let cachedResponse = null;
let cacheTimestamp = 0;
let inFlightPromise = null;

async function fetchSingleCountry(page) {
  const res = await fetch(page.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; personal-gold-tracker)',
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    throw new Error(`${page.id} HTTP ${res.status}`);
  }
  const html = await res.text();
  return parseCountryHtml(html, page);
}

async function refreshAllRates() {
  const results = await Promise.allSettled(
    PAGES.map((page) => fetchSingleCountry(page))
  );

  const errors = [];
  const countries = {};
  let anyHistoryUpdated = false;

  results.forEach((res, idx) => {
    const page = PAGES[idx];
    const id = page.id;
    if (!historyStore[id]) {
      historyStore[id] = {};
    }

    if (res.status === 'fulfilled') {
      const { rates, inr, historyRows } = res.value;
      for (const hRow of historyRows) {
        historyStore[id][hRow.date] = {
          24: hRow[24],
          22: hRow[22],
          c24: hRow.c24,
          c22: hRow.c22,
        };
        anyHistoryUpdated = true;
      }
      const mergedHistory = pruneAndFormatHistory(historyStore[id]);
      const countryPayload = {
        id,
        city: page.city,
        cur: page.cur,
        rates,
        inr: id === 'IN' ? null : inr,
        history: mergedHistory,
      };
      cachedCountries[id] = countryPayload;
      countries[id] = countryPayload;
    } else {
      const reasonMsg =
        res.reason && res.reason.message ? res.reason.message : String(res.reason);
      errors.push(`${page.city} (${id}): ${reasonMsg}`);
      if (cachedCountries[id]) {
        cachedCountries[id].history = pruneAndFormatHistory(historyStore[id]);
        countries[id] = cachedCountries[id];
      }
    }
  });

  if (anyHistoryUpdated) {
    saveHistoryStore(historyStore);
  }

  const payload = {
    fetchedAt: new Date().toISOString(),
    source: 'goodreturns.in',
    errors,
    countries,
  };

  cachedResponse = payload;
  cacheTimestamp = Date.now();
  return payload;
}

async function getRatesData(force) {
  const now = Date.now();
  if (!force && cachedResponse && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedResponse;
  }
  if (inFlightPromise) {
    return inFlightPromise;
  }
  inFlightPromise = refreshAllRates().finally(() => {
    inFlightPromise = null;
  });
  return inFlightPromise;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET' && pathname === '/api/rates') {
      const force = parsedUrl.searchParams.get('force') === '1';
      const data = await getRatesData(force);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify(data));
      return;
    }

    // Serve built production React bundle from dist/ if available
    if (req.method === 'GET' && fs.existsSync(DIST_DIR)) {
      const relPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
      const candidate = path.resolve(DIST_DIR, relPath);
      if (candidate.startsWith(DIST_DIR) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        const ext = path.extname(candidate).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Cache-Control': 'no-store',
        });
        res.end(fs.readFileSync(candidate));
        return;
      }
    }

    if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
      const html = fs.readFileSync(INDEX_FILE, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(html);
      return;
    }

    res.writeHead(404, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err) {
    res.writeHead(502, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    res.end(
      JSON.stringify({
        error: err && err.message ? err.message : 'Unexpected server error',
      })
    );
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Gold tracker running at http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  cleanCellText,
  extractTables,
  parsePriceCell,
  parseCountryHtml,
};
