// Importe les relevés de taux des services depuis un CSV
// (Google Sheets publié en CSV via QUOTES_CSV_URL, sinon data/quotes.csv) et écrit src/data/quotes.json.
// Colonnes : provider,ccy,dest,rate,fee,promo_rate,observed_at,sample
import { readFile, writeFile } from 'node:fs/promises';

const LOCAL = new URL('../data/quotes.csv', import.meta.url);
const OUT = new URL('../src/data/quotes.json', import.meta.url);
const PROVIDERS = new URL('../src/data/providers.json', import.meta.url);
const CCYS = ['EUR', 'GBP', 'USD', 'CAD'];
const DESTS = ['CM', 'CI'];

export function parseQuotesCsv(text, providerIds) {
  const lines = text.trim().split(/\r?\n/);
  const head = lines.shift().split(',').map((h) => h.trim());
  const col = (name) => {
    const i = head.indexOf(name);
    if (i < 0) throw new Error(`Colonne manquante : ${name}`);
    return i;
  };
  const idx = Object.fromEntries(['provider', 'ccy', 'dest', 'rate', 'fee', 'promo_rate', 'observed_at', 'sample'].map((n) => [n, col(n)]));
  const quotes = [];
  const errors = [];
  lines.forEach((line, n) => {
    if (!line.trim()) return;
    const c = line.split(',').map((v) => v.trim());
    const q = {
      provider: c[idx.provider],
      ccy: c[idx.ccy].toUpperCase(),
      dest: c[idx.dest].toUpperCase(),
      rate: Number(c[idx.rate]),
      fee: Number(c[idx.fee] || 0),
      promoRate: c[idx.promo_rate] ? Number(c[idx.promo_rate]) : null,
      observedAt: c[idx.observed_at],
      sample: ['1', 'true', 'oui'].includes((c[idx.sample] || '').toLowerCase())
    };
    const where = `ligne ${n + 2}`;
    if (!providerIds.includes(q.provider)) errors.push(`${where} : service inconnu « ${q.provider} »`);
    else if (!CCYS.includes(q.ccy)) errors.push(`${where} : devise inconnue « ${q.ccy} »`);
    else if (!DESTS.includes(q.dest)) errors.push(`${where} : destination inconnue « ${q.dest} »`);
    else if (!(q.rate > 0) || !(q.fee >= 0) || (q.promoRate !== null && !(q.promoRate > 0))) errors.push(`${where} : nombre invalide`);
    else if (Number.isNaN(Date.parse(q.observedAt))) errors.push(`${where} : date invalide « ${q.observedAt} »`);
    else quotes.push(q);
  });
  return { quotes, errors };
}

async function loadCsv() {
  const url = process.env.QUOTES_CSV_URL;
  if (url) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log('[quotes] relevés chargés depuis QUOTES_CSV_URL');
      return await res.text();
    } catch (err) {
      console.warn(`[quotes] QUOTES_CSV_URL injoignable (${err.message}) — repli sur data/quotes.csv`);
    }
  }
  return readFile(LOCAL, 'utf8');
}

async function main() {
  const providerIds = JSON.parse(await readFile(PROVIDERS, 'utf8')).map((p) => p.id);
  const { quotes, errors } = parseQuotesCsv(await loadCsv(), providerIds);
  errors.forEach((e) => console.warn(`[quotes] ignoré — ${e}`));
  if (!quotes.length) throw new Error('Aucun relevé valide : construction arrêtée.');
  const observedAt = quotes.map((q) => q.observedAt).sort().at(-1);
  const data = { generatedAt: new Date().toISOString(), observedAt, sample: quotes.some((q) => q.sample), quotes };
  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
  console.log(`[quotes] ${quotes.length} relevés (dernier : ${observedAt})${data.sample ? ' — DONNÉES D\'EXEMPLE' : ''}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
