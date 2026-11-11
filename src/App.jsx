import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

const OZ = 31.1034768;
const COUNTRY_ORDER = ['IN', 'GB', 'AE', 'US'];
const COUNTRY_META = {
  IN: { id: 'IN', badge: 'IN', name: 'India', short: 'India', city: 'Hyderabad', cur: 'INR', locale: 'en-IN' },
  GB: { id: 'GB', badge: 'UK', name: 'United Kingdom', short: 'UK', city: 'England', cur: 'GBP', locale: 'en-GB' },
  AE: { id: 'AE', badge: 'AE', name: 'Dubai (UAE)', short: 'Dubai', city: 'Dubai', cur: 'AED', locale: 'en-US' },
  US: { id: 'US', badge: 'US', name: 'United States', short: 'US', city: 'United States', cur: 'USD', locale: 'en-US' }
};

// Initial/last-loaded values from published 10 Nov 2026 goodreturns.in country pages
const INITIAL_RATES_DATA = {
  fetchedAt: '2026-11-10T11:20:00.000Z',
  source: 'goodreturns.in',
  errors: [],
  countries: {
    IN: {
      id: 'IN',
      city: 'Hyderabad',
      cur: 'INR',
      rates: { 24: { p: 14411, c: -49 }, 22: { p: 13210, c: -45 }, 18: { p: 10808, c: -37 } },
      inr: null,
      history: [
        { date: '2026-11-01', 24: 13888, 22: 12730, c24: 0, c22: 0 },
        { date: '2026-11-02', 24: 13937, 22: 12775, c24: 49, c22: 45 },
        { date: '2026-11-03', 24: 13964, 22: 12800, c24: 27, c22: 25 },
        { date: '2026-11-04', 24: 14280, 22: 13090, c24: 316, c22: 290 },
        { date: '2026-11-05', 24: 14602, 22: 13385, c24: 322, c22: 295 },
        { date: '2026-11-06', 24: 14346, 22: 13150, c24: -256, c22: -235 },
        { date: '2026-11-07', 24: 14357, 22: 13160, c24: 11, c22: 10 },
        { date: '2026-11-08', 24: 14357, 22: 13160, c24: 0, c22: 0 },
        { date: '2026-11-09', 24: 14460, 22: 13255, c24: 103, c22: 95 },
        { date: '2026-11-10', 24: 14411, 22: 13210, c24: -49, c22: -45 }
      ]
    },
    GB: {
      id: 'GB',
      city: 'England',
      cur: 'GBP',
      rates: { 24: { p: 98.54, c: -0.54 }, 22: { p: 90.33, c: -0.49 }, 18: { p: 73.90, c: -0.40 } },
      inr: { 24: { p: 12412, c: -68 }, 22: { p: 11337, c: -61 }, 18: { p: 9293, c: -50 } },
      history: [
        { date: '2026-11-01', 24: 93.39, 22: 85.61, c24: 0, c22: 0 },
        { date: '2026-11-02', 24: 93.80, 22: 85.98, c24: 0.41, c22: 0.37 },
        { date: '2026-11-03', 24: 94.57, 22: 86.69, c24: 0.77, c22: 0.71 },
        { date: '2026-11-04', 24: 94.21, 22: 86.36, c24: -0.36, c22: -0.33 },
        { date: '2026-11-05', 24: 98.59, 22: 90.37, c24: 4.38, c22: 4.01 },
        { date: '2026-11-06', 24: 97.00, 22: 88.92, c24: -1.59, c22: -1.45 },
        { date: '2026-11-07', 24: 98.38, 22: 90.18, c24: 1.38, c22: 1.26 },
        { date: '2026-11-08', 24: 98.38, 22: 90.18, c24: 0, c22: 0 },
        { date: '2026-11-09', 24: 99.08, 22: 90.82, c24: 0.70, c22: 0.64 },
        { date: '2026-11-10', 24: 98.54, 22: 90.33, c24: -0.54, c22: -0.49 }
      ]
    },
    AE: {
      id: 'AE',
      city: 'Dubai',
      cur: 'AED',
      rates: { 24: { p: 497.25, c: 6.75 }, 22: { p: 460.50, c: 6.25 }, 18: { p: 378.50, c: 5.25 } },
      inr: { 24: { p: 12676, c: 172 }, 22: { p: 11718, c: 159 }, 18: { p: 9649, c: 134 } },
      history: [
        { date: '2026-11-01', 24: 467.00, 22: 432.50, c24: -1.75, c22: -1.50 },
        { date: '2026-11-02', 24: 467.00, 22: 432.50, c24: 0, c22: 0 },
        { date: '2026-11-03', 24: 478.00, 22: 442.50, c24: 11, c22: 10 },
        { date: '2026-11-04', 24: 473.25, 22: 438.25, c24: -4.75, c22: -4.25 },
        { date: '2026-11-05', 24: 487.50, 22: 451.50, c24: 14.25, c22: 13.25 },
        { date: '2026-11-06', 24: 493.25, 22: 456.75, c24: 5.75, c22: 5.25 },
        { date: '2026-11-07', 24: 487.75, 22: 451.50, c24: -5.50, c22: -5.25 },
        { date: '2026-11-08', 24: 490.50, 22: 454.25, c24: 2.75, c22: 2.75 },
        { date: '2026-11-09', 24: 490.50, 22: 454.25, c24: 0, c22: 0 },
        { date: '2026-11-10', 24: 497.25, 22: 460.50, c24: 6.75, c22: 6.25 }
      ]
    },
    US: {
      id: 'US',
      city: 'United States',
      cur: 'USD',
      rates: { 24: { p: 136.00, c: 2 }, 22: { p: 131.50, c: 2 }, 18: { p: 107.60, c: 1.60 } },
      inr: { 24: { p: 12714, c: 188 }, 22: { p: 12292, c: 187 }, 18: { p: 10083, c: 150 } },
      history: [
        { date: '2026-11-01', 24: 128.00, 22: 123.50, c24: -1, c22: -1 },
        { date: '2026-11-02', 24: 128.00, 22: 123.50, c24: 0, c22: 0 },
        { date: '2026-11-03', 24: 130.50, 22: 126.00, c24: 2.50, c22: 2.50 },
        { date: '2026-11-04', 24: 130.00, 22: 125.50, c24: -0.50, c22: -0.50 },
        { date: '2026-11-05', 24: 133.50, 22: 129.00, c24: 3.50, c22: 3.50 },
        { date: '2026-11-06', 24: 135.50, 22: 131.00, c24: 2, c22: 2 },
        { date: '2026-11-07', 24: 134.00, 22: 129.50, c24: -1.50, c22: -1.50 },
        { date: '2026-11-08', 24: 134.00, 22: 129.50, c24: 0, c22: 0 },
        { date: '2026-11-09', 24: 134.00, 22: 129.50, c24: 0, c22: 0 },
        { date: '2026-11-10', 24: 136.00, 22: 131.50, c24: 2, c22: 2 }
      ]
    }
  }
};

function buildFallbackSpotHistory() {
  const map = {};
  const baseUsdOz = [
    ['2026-10-11', 4155], ['2026-10-12', 4148], ['2026-10-13', 4135],
    ['2026-10-14', 4120], ['2026-10-15', 4128], ['2026-10-16', 4110],
    ['2026-10-17', 4095], ['2026-10-18', 4092], ['2026-10-19', 4080],
    ['2026-10-20', 4065], ['2026-10-21', 4050], ['2026-10-22', 4038],
    ['2026-10-23', 4025], ['2026-10-24', 4018], ['2026-10-25', 4012],
    ['2026-10-26', 3998], ['2026-10-27', 3985], ['2026-10-28', 3972],
    ['2026-10-29', 3960], ['2026-10-30', 3948], ['2026-10-31', 3935],
    ['2026-11-01', 3930], ['2026-11-02', 3942], ['2026-11-03', 3975],
    ['2026-11-04', 4010], ['2026-11-05', 4115], ['2026-11-06', 4088],
    ['2026-11-07', 4075], ['2026-11-08', 4078], ['2026-11-09', 4098]
  ];
  for (const [d, usd] of baseUsdOz) {
    map[d] = {
      USD: usd,
      INR: usd * 93.70,
      GBP: usd * 0.7465,
      AED: usd * 3.6725
    };
  }
  return map;
}

function getLocale(cur) {
  if (cur === 'INR') return 'en-IN';
  if (cur === 'GBP') return 'en-GB';
  return 'en-US';
}

function fmtMoney(val, cur) {
  if (val == null || Number.isNaN(val)) return '—';
  const abs = Math.abs(val);
  const digits = abs >= 1000 ? 0 : 2;
  return new Intl.NumberFormat(getLocale(cur), {
    style: 'currency',
    currency: cur,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(val);
}

function fmtWholeINR(val) {
  if (val == null || Number.isNaN(val)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(val));
}

function fmtSignedMoney(val, cur, withArrow) {
  if (val == null || Number.isNaN(val)) return '—';
  const abs = Math.abs(val);
  const formatted = fmtMoney(abs, cur);
  if (abs < 1e-9) {
    return formatted;
  }
  const sign = val > 0 ? '+' : '−';
  const arrow = withArrow ? (val > 0 ? '▲ ' : '▼ ') : '';
  return arrow + sign + formatted;
}

function fmtSignedPercent(pct) {
  if (pct == null || Number.isNaN(pct)) return '0.00%';
  if (Math.abs(pct) < 1e-9) return '0.00%';
  const sign = pct > 0 ? '+' : '−';
  return sign + Math.abs(pct).toFixed(2) + '%';
}

function fmtHistoryParenChange(val, cur) {
  if (val == null || Number.isNaN(val) || Math.abs(val) < 1e-9) {
    return { text: '(0)', cls: 'muted' };
  }
  const abs = Math.abs(val);
  const isInt = Math.abs(abs - Math.round(abs)) < 1e-6;
  const formatted = new Intl.NumberFormat(getLocale(cur), {
    minimumFractionDigits: isInt ? 0 : 2,
    maximumFractionDigits: 2
  }).format(abs);
  const sign = val > 0 ? '+' : '-';
  return {
    text: `(${sign}${formatted})`,
    cls: val > 0 ? 'up' : 'down'
  };
}

function fmtCompactAxis(val, cur) {
  const sym = cur === 'INR' ? '₹' : cur === 'GBP' ? '£' : cur === 'AED' ? 'AED ' : '$';
  const abs = Math.abs(val);
  if (cur === 'INR' && abs >= 100000) {
    return sym + (val / 100000).toFixed(2).replace(/\.00$/, '') + 'L';
  }
  if (abs >= 10000) {
    return sym + (val / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  if (abs >= 1000) {
    return sym + Math.round(val).toLocaleString(getLocale(cur));
  }
  return sym + val.toFixed(1).replace(/\.0$/, '');
}

function fmtShortDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function fmtMonthDay(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

function median(values) {
  if (!values || values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

const STYLES = `
  :root {
    --bg: #faf8f3;
    --surface: #ffffff;
    --surface-subtle: #f4efe4;
    --text: #1f1b12;
    --text-muted: #6e6552;
    --border: #e4dccb;
    --gold: #b8860b;
    --gold-strong: #9a6f04;
    --gold-soft: #f5ebd1;
    --gold-outline: #c9971c;
    --up: #157347;
    --down: #c92a2a;
    --err-bg: #fdecec;
    --err-border: #f5c2c7;
    --err-text: #842029;
    --shadow: 0 2px 8px rgba(31, 27, 18, 0.05);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #14120d;
      --surface: #1e1b14;
      --surface-subtle: #27231a;
      --text: #f3efe6;
      --text-muted: #a69c88;
      --border: #332d21;
      --gold: #e0ac2b;
      --gold-strong: #f0c14b;
      --gold-soft: #2e2615;
      --gold-outline: #e0ac2b;
      --up: #40c057;
      --down: #ff6b6b;
      --err-bg: #2c1517;
      --err-border: #5c262a;
      --err-text: #f8b4b9;
      --shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
    }
  }

  .gt-root {
    min-height: 100vh;
    background-color: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.45;
    -webkit-font-smoothing: antialiased;
  }

  .gt-container {
    max-width: 1040px;
    margin: 0 auto;
    padding: 20px 16px 44px;
  }

  .gt-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 16px;
  }

  .gt-header-titles h1 {
    margin: 0 0 4px 0;
    font-size: 1.65rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .gt-header-titles p {
    margin: 0;
    font-size: 0.92rem;
    color: var(--text-muted);
  }

  .gt-header-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .gt-seg-group {
    display: inline-flex;
    background: var(--surface-subtle);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 2px;
  }

  .gt-seg-btn {
    appearance: none;
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 0.84rem;
    font-weight: 600;
    padding: 6px 11px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .gt-seg-btn:hover {
    color: var(--text);
  }

  .gt-seg-btn[aria-pressed="true"] {
    background: var(--gold);
    color: #ffffff;
  }

  @media (prefers-color-scheme: dark) {
    .gt-seg-btn[aria-pressed="true"] {
      color: #14120d;
    }
  }

  .gt-refresh-btn {
    appearance: none;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 0.84rem;
    font-weight: 600;
    padding: 7px 13px;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: var(--shadow);
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .gt-refresh-btn:hover:not(:disabled) {
    border-color: var(--gold-outline);
    background: var(--gold-soft);
  }

  .gt-refresh-btn:disabled {
    opacity: 0.65;
    cursor: wait;
  }

  .gt-error-banner {
    background: var(--err-bg);
    border: 1px solid var(--err-border);
    color: var(--err-text);
    padding: 11px 14px;
    border-radius: 10px;
    font-size: 0.88rem;
    margin-bottom: 14px;
  }

  .gt-error-banner code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    background: rgba(0, 0, 0, 0.08);
    padding: 2px 5px;
    border-radius: 4px;
  }

  .gt-spot-bar {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 15px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    font-size: 0.88rem;
    margin-bottom: 16px;
    box-shadow: var(--shadow);
  }

  .gt-spot-left {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    color: var(--text-muted);
  }

  .gt-spot-left strong {
    color: var(--text);
    font-weight: 600;
  }

  .gt-spot-right {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--text-muted);
    font-size: 0.84rem;
  }

  .gt-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--up);
    display: inline-block;
    flex-shrink: 0;
  }

  .gt-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-bottom: 22px;
  }

  .gt-country-card {
    appearance: none;
    text-align: left;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 15px;
    cursor: pointer;
    color: var(--text);
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: var(--shadow);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    font-family: inherit;
  }

  .gt-country-card:hover {
    border-color: var(--gold-outline);
  }

  .gt-country-card[aria-pressed="true"] {
    border: 2px solid var(--gold-outline);
    box-shadow: 0 0 0 3px var(--gold-soft), var(--shadow);
  }

  .gt-card-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 2px;
  }

  .gt-badge-circle {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--gold-soft);
    color: var(--gold-strong);
    font-weight: 700;
    font-size: 0.8rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid var(--border);
  }

  .gt-card-title-group {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .gt-card-country-name {
    font-weight: 700;
    font-size: 0.98rem;
    line-height: 1.2;
  }

  .gt-card-cur-karat {
    font-size: 0.76rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .gt-card-price-line {
    font-size: 1.48rem;
    font-weight: 750;
    letter-spacing: -0.02em;
    margin-top: 2px;
    display: flex;
    align-items: baseline;
    gap: 5px;
    flex-wrap: wrap;
  }

  .gt-card-price-unit {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--text-muted);
  }

  .gt-card-change {
    font-size: 0.84rem;
    font-weight: 600;
  }

  .gt-card-sub-inr {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .gt-card-sub-inr strong {
    color: var(--text);
    font-weight: 650;
  }

  .gt-card-spot-prem {
    font-size: 0.78rem;
    color: var(--text-muted);
    min-height: 1.1em;
  }

  .gt-card-divider {
    height: 1px;
    background: var(--border);
    width: 100%;
    margin: 5px 0 3px;
  }

  .gt-card-compare {
    font-size: 0.82rem;
    line-height: 1.35;
  }

  .gt-card-compare-working {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .up { color: var(--up); }
  .down { color: var(--down); }
  .muted { color: var(--text-muted); }

  .gt-detail-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .gt-detail-heading {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .gt-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }

  .gt-stat-box {
    background: var(--surface-subtle);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .gt-stat-label {
    font-size: 0.78rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  .gt-stat-main {
    font-size: 1.05rem;
    font-weight: 700;
  }

  .gt-stat-sub {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .gt-section-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .gt-section-title {
    margin: 0;
    font-size: 1.02rem;
    font-weight: 700;
  }

  .gt-table-wrap {
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow-x: auto;
  }

  table.gt-gold-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;
  }

  table.gt-gold-table thead tr {
    background: var(--gold-soft);
  }

  table.gt-gold-table th,
  table.gt-gold-table td {
    padding: 9px 13px;
    text-align: left;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }

  table.gt-gold-table th {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--text);
  }

  table.gt-gold-table tbody tr:last-child td {
    border-bottom: none;
  }

  table.gt-gold-table tbody tr:hover {
    background: var(--surface-subtle);
  }

  .gt-chart-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .gt-svg-wrap {
    width: 100%;
    background: var(--surface-subtle);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 8px;
    position: relative;
    touch-action: pan-y;
  }

  .gt-chart-svg {
    width: 100%;
    height: auto;
    display: block;
    user-select: none;
    cursor: crosshair;
  }

  .gt-chart-legend {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .gt-footer-note {
    margin-top: 20px;
    font-size: 0.78rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  @media (max-width: 600px) {
    .gt-header {
      flex-direction: column;
      align-items: stretch;
    }
    .gt-detail-panel {
      padding: 14px;
    }
    .gt-card-price-line {
      font-size: 1.32rem;
    }
  }
`;

export default function App() {
  const [rates, setRates] = useState(INITIAL_RATES_DATA.countries);
  const [fetchedAt, setFetchedAt] = useState(INITIAL_RATES_DATA.fetchedAt);
  const [serverErrors, setServerErrors] = useState([]);
  const [serverUnreachable, setServerUnreachable] = useState(false);

  const [spot, setSpot] = useState({ price: 4111.00, updatedAt: '2026-11-10T11:20:00Z' });
  const [fx, setFx] = useState({ USD: 1, INR: 93.70, GBP: 0.7465, AED: 3.6725 });
  const [spotHist, setSpotHist] = useState(() => buildFallbackSpotHistory());

  const [selected, setSelected] = useState('IN');
  const [karat, setKarat] = useState(24);
  const [unit, setUnit] = useState(1);
  const [chartCur, setChartCur] = useState('local');
  const [isLoading, setIsLoading] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);

  const loadingRef = useRef(false);
  const spotHistoryFetchedRef = useRef(0);
  const svgRef = useRef(null);

  const spotLocalPerGramNow = useCallback(
    (cur) => {
      if (!spot || !spot.price || !fx || !fx[cur]) return null;
      return ((spot.price * fx[cur]) / OZ) * 0.999;
    },
    [spot, fx]
  );

  const spotLocalPerGramOnDate = useCallback(
    (date, cur) => {
      const entry = spotHist[date];
      if (!entry || !entry[cur]) return null;
      return (entry[cur] / OZ) * 0.999;
    },
    [spotHist]
  );

  const computeNow = useCallback(
    (countryId) => {
      const c = rates[countryId];
      if (!c || !c.rates || !c.rates[karat]) return null;
      const g = unit;
      const localPerGram = c.rates[karat].p;
      const changePerGram = c.rates[karat].c;
      const local = localPerGram * g;
      const change = changePerGram * g;

      let inrPerGram;
      if (countryId === 'IN') {
        inrPerGram = localPerGram;
      } else if (c.inr && c.inr[karat] && typeof c.inr[karat].p === 'number') {
        inrPerGram = c.inr[karat].p;
      } else if (fx && fx.INR && fx[c.cur]) {
        inrPerGram = localPerGram * (fx.INR / fx[c.cur]);
      } else {
        inrPerGram = localPerGram;
      }
      const inr = inrPerGram * g;

      let prem = null;
      if (karat === 24) {
        const sp = spotLocalPerGramNow(c.cur);
        if (sp && sp > 0) {
          prem = (c.rates[24].p / sp - 1) * 100;
        }
      }

      return { local, change, inrPerGram, inr, prem };
    },
    [rates, karat, unit, fx, spotLocalPerGramNow]
  );

  const computeSeries = useCallback(
    (countryId) => {
      const c = rates[countryId];
      if (!c) return [];
      const g = unit;
      const cur = c.cur;
      const currentNow = computeNow(countryId);
      if (!currentNow) return [];

      const ratio18 = c.rates[24].p > 0 ? c.rates[18].p / c.rates[24].p : 0.75;
      const karatRatio =
        karat === 24
          ? 1
          : karat === 22
          ? c.rates[24].p > 0
            ? c.rates[22].p / c.rates[24].p
            : 0.916
          : ratio18;

      const todayInrPerLocal =
        currentNow.local > 0 ? (currentNow.inrPerGram * g) / currentNow.local : 1;

      function inrFactorForDate(date, isToday) {
        if (countryId === 'IN') return 1;
        if (!isToday && spotHist[date] && spotHist[date].INR && spotHist[date][cur]) {
          return spotHist[date].INR / spotHist[date][cur];
        }
        return todayInrPerLocal;
      }

      const realHistory = (c.history || []).slice().sort((a, b) => a.date.localeCompare(b.date));
      const firstRealDate = realHistory.length > 0 ? realHistory[0].date : '9999-12-31';
      const lastRealDate = realHistory.length > 0 ? realHistory[realHistory.length - 1].date : '';

      const ratios = [];
      for (const row of realHistory) {
        const sp = spotLocalPerGramOnDate(row.date, cur);
        if (sp && sp > 0 && row[24] > 0) {
          ratios.push(row[24] / sp);
        }
      }
      let premiumFactor = median(ratios);
      if (!premiumFactor) {
        const spNow = spotLocalPerGramNow(cur);
        premiumFactor = spNow && spNow > 0 ? c.rates[24].p / spNow : 1;
      }

      const points = [];
      const spotDates = Object.keys(spotHist).sort();
      for (const d of spotDates) {
        if (d < firstRealDate) {
          const sp = spotLocalPerGramOnDate(d, cur);
          if (sp && sp > 0) {
            const localVal = sp * premiumFactor * karatRatio * g;
            const inrVal = countryId === 'IN' ? localVal : localVal * inrFactorForDate(d, false);
            points.push({ date: d, local: localVal, inr: inrVal, est: true, isNow: false });
          }
        }
      }

      for (let i = 0; i < realHistory.length; i++) {
        const row = realHistory[i];
        const isLastReal = i === realHistory.length - 1;
        const basePerGram =
          karat === 24 ? row[24] : karat === 22 ? row[22] : row[24] * ratio18;
        const localVal = basePerGram * g;
        const inrVal =
          countryId === 'IN' ? localVal : localVal * inrFactorForDate(row.date, isLastReal);
        points.push({ date: row.date, local: localVal, inr: inrVal, est: false, isNow: false });
      }

      const trimmed = points.slice(-30);
      const todayIso = new Date().toISOString().slice(0, 10);
      if (trimmed.length > 0 && lastRealDate >= todayIso) {
        const lastPt = { ...trimmed[trimmed.length - 1] };
        lastPt.local = currentNow.local;
        lastPt.inr = currentNow.inr;
        lastPt.est = false;
        lastPt.isNow = true;
        trimmed[trimmed.length - 1] = lastPt;
      } else {
        trimmed.push({
          date: lastRealDate && lastRealDate > todayIso ? lastRealDate : todayIso,
          local: currentNow.local,
          inr: currentNow.inr,
          est: false,
          isNow: true
        });
      }

      return trimmed;
    },
    [rates, unit, karat, spotHist, computeNow, spotLocalPerGramOnDate, spotLocalPerGramNow]
  );

  const computeStats = useCallback(
    (countryId) => {
      const pts = computeSeries(countryId);
      if (pts.length === 0) return null;
      const first = pts[0];
      const last = pts[pts.length - 1];

      const diffLocal = last.local - first.local;
      const pctLocal = first.local > 0 ? (diffLocal / first.local) * 100 : 0;
      const diffInr = last.inr - first.inr;
      const pctInr = first.inr > 0 ? (diffInr / first.inr) * 100 : 0;

      const realPts = pts.filter((p) => !p.est);
      const firstReal = realPts.length > 0 ? realPts[0] : last;
      const actualDiffLocal = last.local - firstReal.local;
      const actualPctLocal = firstReal.local > 0 ? (actualDiffLocal / firstReal.local) * 100 : 0;
      const actualDiffInr = last.inr - firstReal.inr;
      const actualPctInr = firstReal.inr > 0 ? (actualDiffInr / firstReal.inr) * 100 : 0;

      let lowLocal = Infinity;
      let highLocal = -Infinity;
      let lowInr = Infinity;
      let highInr = -Infinity;
      for (const p of pts) {
        if (p.local < lowLocal) lowLocal = p.local;
        if (p.local > highLocal) highLocal = p.local;
        if (p.inr < lowInr) lowInr = p.inr;
        if (p.inr > highInr) highInr = p.inr;
      }

      return {
        points: pts,
        first,
        last,
        estStart: first.est,
        diffLocal,
        pctLocal,
        diffInr,
        pctInr,
        firstReal,
        actualDays: realPts.length,
        actualDiffLocal,
        actualPctLocal,
        actualDiffInr,
        actualPctInr,
        lowLocal,
        highLocal,
        lowInr,
        highInr
      };
    },
    [computeSeries]
  );

  const loadSpotHistory30Days = useCallback(async () => {
    const dates = [];
    const nowUtc = new Date();
    for (let i = 30; i >= 1; i--) {
      const d = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate() - i));
      dates.push({ iso: d.toISOString().slice(0, 10), daysAgo: i });
    }

    const newEntries = {};
    let loadedCount = 0;

    await Promise.allSettled(
      dates.map(async ({ iso, daysAgo }) => {
        const storageKey = 'gold_hist_' + iso;
        if (daysAgo > 2) {
          try {
            const cached = localStorage.getItem(storageKey);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (parsed && parsed.USD && parsed.INR) {
                newEntries[iso] = parsed;
                loadedCount++;
                return;
              }
            }
          } catch (_e) {
            // Ignore localStorage read errors
          }
        }

        const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${iso}/v1/currencies/xau.json`;
        try {
          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();
          if (data && data.xau && data.xau.usd) {
            const entry = {
              USD: data.xau.usd,
              INR: data.xau.inr,
              GBP: data.xau.gbp,
              AED: data.xau.aed
            };
            newEntries[iso] = entry;
            loadedCount++;
            if (daysAgo > 2) {
              try {
                localStorage.setItem(storageKey, JSON.stringify(entry));
              } catch (_e) {
                // Ignore localStorage write errors
              }
            }
          }
        } catch (_e) {
          // Ignore network errors for individual days
        }
      })
    );

    if (loadedCount > 0) {
      spotHistoryFetchedRef.current += loadedCount;
      setSpotHist((prev) => ({ ...prev, ...newEntries }));
    }
  }, []);

  const refreshAll = useCallback(
    async (force) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setIsLoading(true);

      try {
        const apiPath = ['/api', 'rates'].join('/') + (force ? '?force=1' : '');
        const res = await fetch(apiPath, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data && data.countries && Object.keys(data.countries).length > 0) {
          setRates(data.countries);
          setFetchedAt(data.fetchedAt || new Date().toISOString());
          setServerErrors(Array.isArray(data.errors) ? data.errors : []);
          setServerUnreachable(false);
        } else {
          setServerUnreachable(true);
        }
      } catch (_err) {
        setServerUnreachable(true);
      }

      try {
        const spotUrl = 'https://api.gold-api.com/price/XAU';
        const fxLatestUrl = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json';

        const [spotRes, fxRes] = await Promise.allSettled([
          fetch(spotUrl, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : Promise.reject())),
          fetch(fxLatestUrl).then((r) => (r.ok ? r.json() : Promise.reject()))
        ]);

        if (spotRes.status === 'fulfilled' && spotRes.value && typeof spotRes.value.price === 'number') {
          setSpot({
            price: spotRes.value.price,
            updatedAt: spotRes.value.updatedAt || new Date().toISOString()
          });
        }

        if (fxRes.status === 'fulfilled' && fxRes.value && fxRes.value.xau && fxRes.value.xau.usd > 0) {
          const xau = fxRes.value.xau;
          setFx((prev) => ({
            USD: 1,
            INR: xau.inr ? xau.inr / xau.usd : prev.INR,
            GBP: xau.gbp ? xau.gbp / xau.usd : prev.GBP,
            AED: xau.aed ? xau.aed / xau.usd : prev.AED
          }));
        }

        if (spotHistoryFetchedRef.current < 15) {
          await loadSpotHistory30Days();
        }
      } catch (_err) {
        // Non-fatal
      }

      loadingRef.current = false;
      setIsLoading(false);
    },
    [loadSpotHistory30Days]
  );

  useEffect(() => {
    refreshAll(true);
    const timer = setInterval(() => {
      refreshAll(false);
    }, 60000);
    return () => clearInterval(timer);
  }, [refreshAll]);

  const indiaNow = useMemo(() => computeNow('IN'), [computeNow]);
  const selectedMeta = COUNTRY_META[selected];
  const selectedStats = useMemo(() => computeStats(selected), [computeStats, selected]);
  const allCountryStats = useMemo(() => {
    const map = {};
    for (const id of COUNTRY_ORDER) {
      map[id] = computeStats(id);
    }
    return map;
  }, [computeStats]);

  const unitLabel = `${unit} g`;
  const isIndia = selected === 'IN';
  const activeChartCur = isIndia ? 'INR' : chartCur === 'inr' ? 'INR' : selectedMeta.cur;

  // Chart geometry calculations
  const chartData = useMemo(() => {
    if (!selectedStats || !selectedStats.points || selectedStats.points.length === 0) return null;
    const pts = selectedStats.points;
    const useInr = activeChartCur === 'INR' && !isIndia;
    const vals = pts.map((p) => (useInr ? p.inr : p.local));
    let minVal = Math.min(...vals);
    let maxVal = Math.max(...vals);
    if (maxVal - minVal < 1e-6) {
      minVal *= 0.98;
      maxVal *= 1.02;
    } else {
      const pad = (maxVal - minVal) * 0.08;
      minVal -= pad;
      maxVal += pad;
    }

    const W = 800;
    const H = 280;
    const padL = 68;
    const padR = 24;
    const padT = 22;
    const padB = 36;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const xOf = (i) => (pts.length === 1 ? padL + plotW / 2 : padL + (i / (pts.length - 1)) * plotW);
    const yOf = (v) => padT + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;

    const ticks = [0, 1, 2, 3].map((t) => {
      const v = minVal + (t / 3) * (maxVal - minVal);
      return { v, y: yOf(v), label: fmtCompactAxis(v, activeChartCur) };
    });

    const coords = pts.map((p, i) => ({
      x: xOf(i),
      y: yOf(useInr ? p.inr : p.local),
      val: useInr ? p.inr : p.local,
      date: p.date,
      est: p.est,
      isNow: i === pts.length - 1
    }));

    const firstRealIdx = pts.findIndex((p) => !p.est);
    let estPath = '';
    let realPath = '';
    if (firstRealIdx === -1) {
      estPath = coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    } else {
      if (firstRealIdx > 0) {
        const estSlice = coords.slice(0, firstRealIdx + 1);
        estPath = estSlice.map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
      }
      const realSlice = coords.slice(firstRealIdx);
      realPath = realSlice.map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    }

    const areaPoints =
      coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ') +
      ` ${coords[coords.length - 1].x.toFixed(1)},${(padT + plotH).toFixed(1)} ${coords[0].x.toFixed(1)},${(padT + plotH).toFixed(1)}`;

    const midIdx = Math.floor((pts.length - 1) / 2);

    return {
      W,
      H,
      padL,
      padR,
      padT,
      padB,
      plotW,
      plotH,
      ticks,
      coords,
      estPath,
      realPath,
      areaPoints,
      firstLabel: fmtMonthDay(pts[0].date) + (pts[0].est ? '*' : ''),
      midLabel: fmtMonthDay(pts[midIdx].date) + (pts[midIdx].est ? '*' : ''),
      midX: xOf(midIdx)
    };
  }, [selectedStats, activeChartCur, isIndia]);

  const handleSvgPointer = (e) => {
    if (!svgRef.current || !chartData) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width) return;
    const relX = ((e.clientX - rect.left) / rect.width) * chartData.W;
    let closest = 0;
    let bestDist = Infinity;
    chartData.coords.forEach((c, idx) => {
      const d = Math.abs(c.x - relX);
      if (d < bestDist) {
        bestDist = d;
        closest = idx;
      }
    });
    setHoverIdx(closest);
  };

  const descHistory = useMemo(() => {
    const c = rates[selected];
    if (!c || !c.history) return [];
    return c.history.slice().sort((a, b) => a.date.localeCompare(b.date)).reverse();
  }, [rates, selected]);

  const latestDateStr = useMemo(() => {
    const inC = rates.IN;
    if (inC && inC.history && inC.history.length > 0) {
      return inC.history[inC.history.length - 1].date;
    }
    return new Date().toISOString().slice(0, 10);
  }, [rates]);

  const fetchedTimeStr = useMemo(() => {
    if (!fetchedAt) return '';
    const d = new Date(fetchedAt);
    if (Number.isNaN(d.getTime())) return '';
    return d.toTimeString().slice(0, 8);
  }, [fetchedAt]);

  const hoveredCoord =
    chartData && hoverIdx != null && chartData.coords[hoverIdx]
      ? chartData.coords[hoverIdx]
      : null;

  return (
    <div className="gt-root">
      <style>{STYLES}</style>
      <div className="gt-container">
        {/* Header */}
        <header className="gt-header">
          <div className="gt-header-titles">
            <h1>Gold Price Tracker</h1>
            <p>Today&apos;s actual gold rate in India, UK, Dubai and US — in local currency and INR</p>
          </div>
          <div className="gt-header-controls">
            <div className="gt-seg-group" role="group" aria-label="Gold purity">
              {[24, 22, 18].map((k) => (
                <button
                  key={k}
                  type="button"
                  className="gt-seg-btn"
                  aria-pressed={karat === k}
                  onClick={() => setKarat(k)}
                >
                  {k}K
                </button>
              ))}
            </div>
            <div className="gt-seg-group" role="group" aria-label="Gold weight">
              {[1, 8, 10, 100].map((u) => (
                <button
                  key={u}
                  type="button"
                  className="gt-seg-btn"
                  aria-pressed={unit === u}
                  onClick={() => setUnit(u)}
                >
                  {u} g
                </button>
              ))}
            </div>
            <button
              type="button"
              className="gt-refresh-btn"
              disabled={isLoading}
              onClick={() => refreshAll(true)}
            >
              {isLoading ? '↻ Refreshing...' : '↻ Refresh'}
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {(serverUnreachable || serverErrors.length > 0) && (
          <div className="gt-error-banner" role="alert">
            {serverUnreachable && (
              <span>
                Could not reach the local rates server. Run <code>npm start</code> (or <code>node server.js</code>) and open <code>http://localhost:3000</code>.{' '}
              </span>
            )}
            {serverErrors.length > 0 && (
              <span>Some countries failed to refresh: {serverErrors.join('; ')}. </span>
            )}
            <span>Showing the last loaded values.</span>
          </div>
        )}

        {/* Spot Bar */}
        <section className="gt-spot-bar" aria-label="World spot reference">
          <div className="gt-spot-left">
            <span>
              World spot (reference) <strong>{spot?.price ? `${fmtMoney(spot.price, 'USD')} / oz` : '—'}</strong>
            </span>
            <span>
              USD→INR <strong>{fx?.INR ? fx.INR.toFixed(2) : '—'}</strong>
            </span>
          </div>
          <div className="gt-spot-right">
            <span className="gt-status-dot" aria-hidden="true" />
            <span>
              Rates for {latestDateStr}
              {fetchedTimeStr ? ` · fetched ${fetchedTimeStr}` : ''}
            </span>
          </div>
        </section>

        {/* Four Country Cards */}
        <section className="gt-cards-grid" aria-label="Country gold rates">
          {COUNTRY_ORDER.map((id) => {
            const meta = COUNTRY_META[id];
            const curNow = computeNow(id);
            if (!curNow) return null;
            const isSelected = selected === id;
            const changeCls = curNow.change > 0 ? 'up' : curNow.change < 0 ? 'down' : 'muted';
            const changeText =
              Math.abs(curNow.change) < 1e-9
                ? `${fmtMoney(0, meta.cur)} today`
                : `${fmtSignedMoney(curNow.change, meta.cur, true)} today`;

            let diff = 0;
            let pct = 0;
            let isCheaper = true;
            if (id !== 'IN' && indiaNow) {
              diff = Math.round(indiaNow.inr) - Math.round(curNow.inr);
              pct = indiaNow.inr > 0 ? (Math.abs(diff) / indiaNow.inr) * 100 : 0;
              isCheaper = diff >= 0;
            }

            return (
              <button
                key={id}
                type="button"
                className="gt-country-card"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelected(id);
                  if (id === 'IN') setChartCur('local');
                }}
              >
                <div className="gt-card-top">
                  <span className="gt-badge-circle">{meta.badge}</span>
                  <span className="gt-card-title-group">
                    <span className="gt-card-country-name">{meta.name}</span>
                    <span className="gt-card-cur-karat">
                      {meta.cur} · {karat}K
                    </span>
                  </span>
                </div>

                <div className="gt-card-price-line">
                  <span>{fmtMoney(curNow.local, meta.cur)}</span>
                  <span className="gt-card-price-unit">/ {unitLabel}</span>
                </div>

                <div className={`gt-card-change ${changeCls}`}>{changeText}</div>

                <div className="gt-card-sub-inr">
                  {id === 'IN' ? (
                    `Rates for ${meta.city}`
                  ) : (
                    <>
                      ≈ <strong>{fmtWholeINR(curNow.inr)}</strong> in INR
                    </>
                  )}
                </div>

                <div className="gt-card-spot-prem">
                  {karat === 24 && curNow.prem != null
                    ? `${curNow.prem >= 0 ? '+' : '−'}${Math.abs(curNow.prem).toFixed(1)}% vs world spot`
                    : ''}
                </div>

                <div className="gt-card-divider" />

                {id === 'IN' ? (
                  <div className="gt-card-compare muted">
                    Base price — other countries are compared to this
                  </div>
                ) : (
                  <div className="gt-card-compare">
                    <strong className={isCheaper ? 'up' : 'down'}>
                      {fmtWholeINR(Math.abs(diff))} {isCheaper ? 'cheaper' : 'costlier'}
                    </strong>{' '}
                    than India ({pct.toFixed(1)}%)
                    <div className="gt-card-compare-working">
                      India {fmtWholeINR(indiaNow?.inr)} − {meta.short} {fmtWholeINR(curNow.inr)} ={' '}
                      {diff < 0 ? '−' : ''}
                      {fmtWholeINR(Math.abs(diff))}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </section>

        {/* Detail Panel */}
        {selectedStats && (
          <main className="gt-detail-panel">
            <h2 className="gt-detail-heading">
              {selectedMeta.name} · {karat}K gold, per {unitLabel}
            </h2>

            {/* Stat Boxes */}
            <div className="gt-stats-grid">
              <div className="gt-stat-box">
                <div className="gt-stat-label">
                  Price on {fmtMonthDay(selectedStats.first.date)}
                  {selectedStats.estStart ? '*' : ''}
                </div>
                <div className="gt-stat-main">
                  {fmtMoney(selectedStats.first.local, selectedMeta.cur)}
                </div>
                {!isIndia && (
                  <div className="gt-stat-sub">≈ {fmtMoney(selectedStats.first.inr, 'INR')}</div>
                )}
              </div>

              <div className="gt-stat-box">
                <div className="gt-stat-label">Price now</div>
                <div className="gt-stat-main">
                  {fmtMoney(selectedStats.last.local, selectedMeta.cur)}
                </div>
                {!isIndia && (
                  <div className="gt-stat-sub">≈ {fmtMoney(selectedStats.last.inr, 'INR')}</div>
                )}
              </div>

              <div className="gt-stat-box">
                <div className="gt-stat-label">1-month difference</div>
                <div
                  className={`gt-stat-main ${
                    selectedStats.diffLocal > 0 ? 'up' : selectedStats.diffLocal < 0 ? 'down' : 'muted'
                  }`}
                >
                  {fmtSignedMoney(selectedStats.diffLocal, selectedMeta.cur, true)} (
                  {fmtSignedPercent(selectedStats.pctLocal)})
                </div>
                {!isIndia && (
                  <div
                    className={`gt-stat-sub ${
                      selectedStats.diffInr > 0 ? 'up' : selectedStats.diffInr < 0 ? 'down' : 'muted'
                    }`}
                  >
                    {fmtSignedMoney(selectedStats.diffInr, 'INR', false)} (
                    {fmtSignedPercent(selectedStats.pctInr)})
                  </div>
                )}
              </div>

              <div className="gt-stat-box">
                <div className="gt-stat-label">
                  Actual, last {selectedStats.actualDays} days (since{' '}
                  {fmtMonthDay(selectedStats.firstReal.date)})
                </div>
                <div
                  className={`gt-stat-main ${
                    selectedStats.actualDiffLocal > 0
                      ? 'up'
                      : selectedStats.actualDiffLocal < 0
                      ? 'down'
                      : 'muted'
                  }`}
                >
                  {fmtSignedMoney(selectedStats.actualDiffLocal, selectedMeta.cur, true)} (
                  {fmtSignedPercent(selectedStats.actualPctLocal)})
                </div>
                {!isIndia && (
                  <div
                    className={`gt-stat-sub ${
                      selectedStats.actualDiffInr > 0
                        ? 'up'
                        : selectedStats.actualDiffInr < 0
                        ? 'down'
                        : 'muted'
                    }`}
                  >
                    {fmtSignedMoney(selectedStats.actualDiffInr, 'INR', false)} (
                    {fmtSignedPercent(selectedStats.actualPctInr)})
                  </div>
                )}
              </div>

              <div className="gt-stat-box">
                <div className="gt-stat-label">30-day low / high</div>
                <div className="gt-stat-main">
                  {fmtMoney(selectedStats.lowLocal, selectedMeta.cur)} –{' '}
                  {fmtMoney(selectedStats.highLocal, selectedMeta.cur)}
                </div>
                {!isIndia && (
                  <div className="gt-stat-sub">
                    {fmtMoney(selectedStats.lowInr, 'INR')} – {fmtMoney(selectedStats.highInr, 'INR')}
                  </div>
                )}
              </div>
            </div>

            {/* History Table */}
            <section>
              <div className="gt-section-header">
                <h3 className="gt-section-title">
                  Gold Rate in {selectedMeta.name} for Last {descHistory.length} Days ({unitLabel})
                </h3>
              </div>
              <div className="gt-table-wrap">
                <table className="gt-gold-table">
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>24K</th>
                      <th>22K</th>
                    </tr>
                  </thead>
                  <tbody>
                    {descHistory.map((row, i) => {
                      const prevRow = i + 1 < descHistory.length ? descHistory[i + 1] : null;
                      const p24 = row[24] * unit;
                      const p22 = row[22] * unit;
                      const rawC24 =
                        typeof row.c24 === 'number'
                          ? row.c24
                          : prevRow
                          ? row[24] - prevRow[24]
                          : 0;
                      const rawC22 =
                        typeof row.c22 === 'number'
                          ? row.c22
                          : prevRow
                          ? row[22] - prevRow[22]
                          : 0;
                      const chg24 = fmtHistoryParenChange(rawC24 * unit, selectedMeta.cur);
                      const chg22 = fmtHistoryParenChange(rawC22 * unit, selectedMeta.cur);

                      return (
                        <tr key={row.date}>
                          <td>{fmtShortDate(row.date)}</td>
                          <td>
                            {fmtMoney(p24, selectedMeta.cur)}{' '}
                            <span className={chg24.cls}>{chg24.text}</span>
                          </td>
                          <td>
                            {fmtMoney(p22, selectedMeta.cur)}{' '}
                            <span className={chg22.cls}>{chg22.text}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 30-Day Price Chart */}
            <section className="gt-chart-container">
              <div className="gt-section-header">
                <h3 className="gt-section-title">Price chart - last 30 days</h3>
                {!isIndia && (
                  <div className="gt-seg-group" role="group" aria-label="Chart currency">
                    <button
                      type="button"
                      className="gt-seg-btn"
                      aria-pressed={chartCur === 'local'}
                      onClick={() => setChartCur('local')}
                    >
                      {selectedMeta.cur}
                    </button>
                    <button
                      type="button"
                      className="gt-seg-btn"
                      aria-pressed={chartCur === 'inr'}
                      onClick={() => setChartCur('inr')}
                    >
                      INR
                    </button>
                  </div>
                )}
              </div>

              <div className="gt-svg-wrap">
                {chartData && (
                  <svg
                    ref={svgRef}
                    className="gt-chart-svg"
                    viewBox="0 0 800 280"
                    role="img"
                    aria-label="30-day gold price chart"
                    onPointerMove={handleSvgPointer}
                    onPointerDown={handleSvgPointer}
                    onPointerLeave={() => setHoverIdx(null)}
                  >
                    <defs>
                      <linearGradient id="gtGoldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {chartData.ticks.map((t, idx) => (
                      <g key={idx}>
                        <line
                          x1={chartData.padL}
                          y1={t.y}
                          x2={chartData.W - chartData.padR}
                          y2={t.y}
                          stroke="var(--border)"
                          strokeDasharray="3,3"
                          strokeWidth="1"
                        />
                        <text
                          x={chartData.padL - 8}
                          y={t.y + 4}
                          textAnchor="end"
                          fill="var(--text-muted)"
                          fontSize="11"
                        >
                          {t.label}
                        </text>
                      </g>
                    ))}

                    <polygon points={chartData.areaPoints} fill="url(#gtGoldAreaGrad)" />

                    {chartData.estPath && (
                      <path
                        d={chartData.estPath}
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="2.2"
                        strokeDasharray="6,5"
                        opacity="0.65"
                      />
                    )}

                    {chartData.realPath && (
                      <path
                        d={chartData.realPath}
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {chartData.coords.length > 0 && (
                      <circle
                        cx={chartData.coords[chartData.coords.length - 1].x}
                        cy={chartData.coords[chartData.coords.length - 1].y}
                        r="4.5"
                        fill="var(--gold)"
                        stroke="var(--surface)"
                        strokeWidth="2"
                      />
                    )}

                    <text
                      x={chartData.coords[0].x}
                      y={chartData.H - 10}
                      textAnchor="start"
                      fill="var(--text-muted)"
                      fontSize="11"
                    >
                      {chartData.firstLabel}
                    </text>
                    <text
                      x={chartData.midX}
                      y={chartData.H - 10}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="11"
                    >
                      {chartData.midLabel}
                    </text>
                    <text
                      x={chartData.coords[chartData.coords.length - 1].x}
                      y={chartData.H - 10}
                      textAnchor="end"
                      fill="var(--text)"
                      fontWeight="600"
                      fontSize="11"
                    >
                      Now
                    </text>

                    {hoveredCoord && (() => {
                      const priceText = fmtMoney(hoveredCoord.val, activeChartCur);
                      const tag = hoveredCoord.isNow
                        ? ' (today)'
                        : hoveredCoord.est
                        ? ' (estimated)'
                        : '';
                      const dateText = fmtShortDate(hoveredCoord.date) + tag;
                      const boxW = Math.max(155, Math.max(priceText.length, dateText.length) * 7.2 + 20);
                      const boxH = 44;
                      let boxX = hoveredCoord.x + 12;
                      if (boxX + boxW > chartData.W - chartData.padR) {
                        boxX = hoveredCoord.x - boxW - 12;
                      }
                      let boxY = hoveredCoord.y - boxH - 8;
                      if (boxY < chartData.padT) {
                        boxY = hoveredCoord.y + 10;
                      }
                      return (
                        <g style={{ pointerEvents: 'none' }}>
                          <line
                            x1={hoveredCoord.x}
                            y1={chartData.padT}
                            x2={hoveredCoord.x}
                            y2={chartData.padT + chartData.plotH}
                            stroke="var(--text-muted)"
                            strokeWidth="1"
                            strokeDasharray="3,3"
                          />
                          <circle
                            cx={hoveredCoord.x}
                            cy={hoveredCoord.y}
                            r="5"
                            fill="var(--gold-strong)"
                            stroke="var(--surface)"
                            strokeWidth="2"
                          />
                          <rect
                            x={boxX}
                            y={boxY}
                            width={boxW}
                            height={boxH}
                            rx="6"
                            fill="var(--surface)"
                            stroke="var(--gold-outline)"
                            strokeWidth="1.2"
                          />
                          <text
                            x={boxX + 10}
                            y={boxY + 18}
                            fill="var(--text)"
                            fontSize="12"
                            fontWeight="700"
                          >
                            {priceText}
                          </text>
                          <text
                            x={boxX + 10}
                            y={boxY + 35}
                            fill="var(--text-muted)"
                            fontSize="11"
                          >
                            {dateText}
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                )}
              </div>

              <p className="gt-chart-legend">
                Solid line = actual published rates (→ now). Dashed line = estimated from world spot × this country&apos;s usual premium. Hover the chart for exact values.
              </p>
            </section>

            {/* All-Countries Comparison Table */}
            <section>
              <div className="gt-section-header">
                <h3 className="gt-section-title">
                  All countries — 1-month comparison ({karat}K, {unitLabel})
                </h3>
              </div>
              <div className="gt-table-wrap">
                <table className="gt-gold-table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>
                        {allCountryStats.IN
                          ? `${fmtMonthDay(allCountryStats.IN.first.date)}${
                              allCountryStats.IN.estStart ? '*' : ''
                            }`
                          : '1 month ago'}
                      </th>
                      <th>Now</th>
                      <th>1-month change (local)</th>
                      <th>1-month change (in INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COUNTRY_ORDER.map((id) => {
                      const meta = COUNTRY_META[id];
                      const st = allCountryStats[id];
                      if (!st) return null;
                      const localCls =
                        st.diffLocal > 0 ? 'up' : st.diffLocal < 0 ? 'down' : 'muted';
                      const inrCls = st.diffInr > 0 ? 'up' : st.diffInr < 0 ? 'down' : 'muted';

                      return (
                        <tr key={id}>
                          <td>
                            <strong>{meta.name}</strong>
                          </td>
                          <td>
                            {fmtMoney(st.first.local, meta.cur)}
                            {st.estStart ? '*' : ''}
                          </td>
                          <td>
                            {fmtMoney(st.last.local, meta.cur)}
                            {id !== 'IN' && (
                              <span className="muted"> ({fmtWholeINR(st.last.inr)})</span>
                            )}
                          </td>
                          <td className={localCls}>
                            {fmtSignedMoney(st.diffLocal, meta.cur, true)} (
                            {fmtSignedPercent(st.pctLocal)})
                          </td>
                          <td className={inrCls}>
                            {fmtSignedMoney(st.diffInr, 'INR', true)} ({fmtSignedPercent(st.pctInr)}
                            )
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        )}

        {/* Footer Note */}
        <footer className="gt-footer-note">
          Rates shown are each country&apos;s retail rate from goodreturns.in (India = Hyderabad, UK = England, Dubai = UAE, US = United States) read by the local server so each country has its own real price; INR equivalents use the same site&apos;s conversion. Prices exclude GST/VAT and making charges. Because goodreturns.in publishes only 10 days of history at a time, the server saves each day it sees to <code>data/history.json</code> so real history grows to a full month over time; days older than the saved history are estimates from world spot (marked <code>*</code>). For personal reference only, not financial advice. Auto-refreshes every 60 s.
        </footer>
      </div>
    </div>
  );
}
