import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compare, midRate, corridors, PEG } from '../src/lib/compare.js';
import { parseQuotesCsv } from '../scripts/import-quotes.mjs';
import { parseEcbXml } from '../scripts/fetch-ecb.mjs';

const ecb = { rates: { USD: 1.1, GBP: 0.85, CAD: 1.6 } };
const providers = [
  { id: 'a', name: 'A', delayMin: 5, coverage: { CM: ['mtn', 'orange'], CI: ['wave'] } },
  { id: 'b', name: 'B', delayMin: 1, coverage: { CM: ['bank'] } },
  { id: 'c', name: 'C', delayMin: 30, coverage: { CM: ['mtn', 'cash'] } }
];
const quotes = [
  { provider: 'a', ccy: 'EUR', dest: 'CM', rate: 655, fee: 0, promoRate: null },
  { provider: 'b', ccy: 'EUR', dest: 'CM', rate: 650, fee: 0, promoRate: 670 },
  { provider: 'c', ccy: 'EUR', dest: 'CM', rate: 656, fee: 2, promoRate: null }
];
const base = { providers, quotes, ecb, ccy: 'EUR', dest: 'CM', amount: 100 };

test('le taux de référence EUR est la parité fixe', () => {
  assert.equal(midRate(ecb, 'EUR'), PEG);
  assert.equal(midRate(ecb, 'USD'), PEG / 1.1);
});

test('le meilleur est celui qui donne le plus reçu, frais déduits', () => {
  const r = compare(base);
  assert.equal(r.best.provider.id, 'a'); // 65 500 contre 64 288 (C, frais 2 €) et 65 000 (B)
  assert.equal(r.best.received, 65500);
  assert.equal(r.second.provider.id, 'b');
  assert.equal(r.total, 3);
});

test('le filtre opérateur ne garde que les services compatibles', () => {
  const r = compare({ ...base, op: 'bank' });
  assert.deepEqual([r.best.provider.id], ['b']);
  assert.equal(r.others.length, 0);
  assert.equal(r.counts.mtn, 2);
});

test('un opérateur absent du pays retombe sur « tous »', () => {
  assert.equal(compare({ ...base, op: 'wave' }).op, 'all');
});

test('le mode premier envoi applique les offres de bienvenue et calcule leur gain réel', () => {
  const r = compare({ ...base, kind: 'first' });
  assert.equal(r.best.provider.id, 'b');
  assert.equal(r.best.promo, true);
  assert.equal(compare(base).promos[0].gain, 2000); // (670 − 650) × 100
});

test('le tri par délai ne change pas le n° 1', () => {
  const r = compare({ ...base, sort: 'speed' });
  assert.equal(r.best.provider.id, 'a');
  assert.deepEqual(r.others.map((x) => x.provider.id), ['b', 'c']);
});

test('montant nul ou négatif : rien de reçu, pas de plantage', () => {
  const r = compare({ ...base, amount: -5 });
  assert.equal(r.amount, 0);
  assert.equal(r.best.received, 0);
});

test('10 couloirs : 5 pays d\'envoi × 2 destinations', () => {
  assert.equal(corridors().length, 10);
  assert.ok(corridors().some((c) => c.slug === 'france-cameroun'));
});

test('import CSV : lignes valides gardées, erreurs signalées', () => {
  const csv = 'provider,ccy,dest,rate,fee,promo_rate,observed_at,sample\n' +
    'a,EUR,CM,655,0,,2026-10-22T09:00:00Z,0\n' +
    'zzz,EUR,CM,655,0,,2026-10-22T09:00:00Z,0\n' +
    'a,EUR,CM,abc,0,,2026-10-22T09:00:00Z,0\n';
  const { quotes: q, errors } = parseQuotesCsv(csv, ['a']);
  assert.equal(q.length, 1);
  assert.equal(q[0].sample, false);
  assert.equal(errors.length, 2);
});

test('lecture du flux BCE', () => {
  const xml = "<Cube time='2026-10-21'><Cube currency='USD' rate='1.1612'/><Cube currency='GBP' rate='0.8701'/><Cube currency='CAD' rate='1.6302'/></Cube>";
  assert.deepEqual(parseEcbXml(xml), { date: '2026-10-21', rates: { USD: 1.1612, GBP: 0.8701, CAD: 1.6302 } });
});
