// Moteur de comparaison : partagé entre la génération des pages et le navigateur.

export const PEG = 655.957; // 1 EUR = 655,957 XAF / XOF (BEAC, BCEAO)

export const OPS = {
  mtn: 'MTN MoMo',
  orange: 'Orange Money',
  wave: 'Wave',
  moov: 'Moov Money',
  bank: 'Banque',
  cash: 'Espèces'
};

export const DESTS = {
  CM: { code: 'CM', name: 'Cameroun', slug: 'cameroun', prep: 'au Cameroun', fcfa: 'XAF', bank: 'BEAC', ops: ['mtn', 'orange', 'bank', 'cash'] },
  CI: { code: 'CI', name: "Côte d'Ivoire", slug: 'cote-divoire', prep: "en Côte d'Ivoire", fcfa: 'XOF', bank: 'BCEAO', ops: ['orange', 'mtn', 'wave', 'moov', 'bank', 'cash'] }
};

export const ORIGINS = [
  { code: 'FR', name: 'France', slug: 'france', ccy: 'EUR' },
  { code: 'BE', name: 'Belgique', slug: 'belgique', ccy: 'EUR' },
  { code: 'GB', name: 'Royaume‑Uni', slug: 'royaume-uni', ccy: 'GBP' },
  { code: 'US', name: 'États‑Unis', slug: 'etats-unis', ccy: 'USD' },
  { code: 'CA', name: 'Canada', slug: 'canada', ccy: 'CAD' }
];

export const CCY = {
  EUR: { sym: '€', name: 'euro' },
  GBP: { sym: '£', name: 'livre sterling' },
  USD: { sym: '$', name: 'dollar US' },
  CAD: { sym: 'C$', name: 'dollar canadien' }
};

// Repères Banque mondiale (Remittance Prices Worldwide, T1 2025) et ONU (ODD 10.c).
export const WB_GLOBAL_AVG = 6.49;
export const SDG_TARGET = 3;

export const corridorSlug = (origin, dest) => `${origin.slug}-${dest.slug}`;

export function corridors() {
  return ORIGINS.flatMap((o) => Object.values(DESTS).map((d) => ({ origin: o, dest: d, slug: corridorSlug(o, d) })));
}

export function midRate(ecb, ccy) {
  return ccy === 'EUR' ? PEG : PEG / ecb.rates[ccy];
}

export function compare({ providers, quotes, ecb, ccy, dest, amount, op = 'all', kind = 'usual', sort = 'received' }) {
  const D = DESTS[dest];
  const mid = midRate(ecb, ccy);
  const amt = Math.max(0, Number(amount) || 0);
  const opEff = D.ops.includes(op) ? op : 'all';

  const inCorridor = [];
  for (const p of providers) {
    const ops = p.coverage[dest] || [];
    const q = quotes.find((x) => x.provider === p.id && x.ccy === ccy && x.dest === dest);
    if (q && ops.length) inCorridor.push({ p, q, ops });
  }

  const calc = ({ p, q, ops }, first) => {
    const promo = first && q.promoRate != null;
    const rate = promo ? q.promoRate : q.rate;
    const received = Math.max(0, (amt - q.fee) * rate);
    const cost = amt > 0 ? (1 - received / (amt * mid)) * 100 : 0;
    return { provider: p, quote: q, ops, rate, fee: q.fee, promo, received, cost };
  };

  const pool = inCorridor
    .filter((r) => opEff === 'all' || r.ops.includes(opEff))
    .map((r) => calc(r, kind === 'first'));

  const byReceived = [...pool].sort((a, b) => b.received - a.received);
  const best = byReceived[0] || null;
  const second = byReceived[1] || null;
  const sorters = {
    received: (a, b) => b.received - a.received,
    fee: (a, b) => a.fee - b.fee || b.received - a.received,
    speed: (a, b) => a.provider.delayMin - b.provider.delayMin || b.received - a.received
  };
  const others = pool.filter((r) => r !== best).sort(sorters[sort] || sorters.received);

  // Gain réel d'une offre de bienvenue = écart avec le taux habituel du même service, une seule fois.
  const promos = inCorridor
    .filter((r) => r.q.promoRate != null && (opEff === 'all' || r.ops.includes(opEff)))
    .map((r) => ({ provider: r.p, gain: calc(r, true).received - calc(r, false).received }))
    .filter((x) => x.gain > 0)
    .sort((a, b) => b.gain - a.gain);

  const counts = { all: inCorridor.length };
  for (const o of D.ops) counts[o] = inCorridor.filter((r) => r.ops.includes(o)).length;

  return { dest: D, ccy, mid, amount: amt, op: opEff, kind, sort, best, second, others, promos, counts, total: pool.length };
}
