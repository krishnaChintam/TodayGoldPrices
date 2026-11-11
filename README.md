# Gold Price Tracker (React + Node)

Local-only React application that displays today's retail gold rate for **India (Hyderabad)**, **United Kingdom (England)**, **Dubai (UAE)**, and **United States** in each country's local currency and in INR, complete with a 1-month price difference, last-10-days history table, interactive 30-day SVG chart, and comparison against India's retail rate.

## Quick Start

1. Install dependencies:
   ```bash
   npm i
   ```
2. Start both the local GoodReturns scraper API (`server.js` on `:3001`) and the Vite React app (`http://localhost:3000`):
   ```bash
   npm start
   ```
3. Open **http://localhost:3000** in your browser.

## Production Build (Single-Port Mode)

If you prefer to build the static React bundle and serve everything from `server.js` on port `3000`:

```bash
npm run build
npm run serve
```
