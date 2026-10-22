// Rendu HTML des résultats : utilisé à la génération (SEO) et dans le navigateur (interactions).
import { SDG_TARGET, WB_GLOBAL_AVG } from './compare.js';
import { T, OPS_L, fmt as fmtL } from './i18n.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const fmt = (v, d = 0, lang = 'fr') => fmtL(v, d, lang);

const ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"></path><path d="M8 7h9v9"></path></svg>';
const GIFT = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2"></rect><path d="M12 8v13"></path><path d="M3 12h18"></path><path d="M12 8c-2-4-6-4-6-1.5S10 8 12 8c2 0 6 1 6-1.5S14 4 12 8z"></path></svg>';

const costClass = (c) => (c <= SDG_TARGET ? 'cost-good' : c <= WB_GLOBAL_AVG ? '' : 'cost-bad');

function ctx(lang) {
  const t = T[lang].v;
  return {
    t,
    n: (v, d = 0) => fmt(v, d, lang),
    money: (v, cur) => `${fmt(v, 0, lang)} ${cur}`,
    ops: (r) => r.ops.map((o) => OPS_L[lang][o]).join(' · '),
    cost: (c) => (c < 0 ? '−' : '') + fmt(Math.abs(c), 2, lang) + (lang === 'fr' ? ' %' : '%'),
    go: (r, cls, inner, label) => `<a class="${cls}" href="/go/${esc(r.provider.id)}" target="_blank" rel="sponsored nofollow noopener" aria-label="${esc(label)} ${t.affiliate}">${inner}</a>`
  };
}

export function renderPromoBar(res, lang = 'fr') {
  const { t, money } = ctx(lang);
  const { promos, kind, dest } = res;
  if (res.amount <= 0 || (kind !== 'first' && !promos.length)) return '';
  const text = kind === 'first' ? t.firstMode : t.promos(promos.length, money(promos[0].gain, dest.fcfa), esc(promos[0].provider.name));
  return `<div class="promo-bar"><div class="promo-bar__text">${GIFT}<span>${text}</span></div><button type="button" class="btn-amber" data-toggle-kind>${kind === 'first' ? t.backUsual : t.seeFirst}</button></div>`;
}

export function renderFeatured(res, lang = 'fr') {
  const { t, n, money, ops, cost, go } = ctx(lang);
  const { best: b, second, dest, ccy } = res;
  if (res.amount <= 0) return `<div class="empty">${t.enter}</div>`;
  if (!b) return `<div class="empty">${res.excluded ? t.belowFees : t.noCombo}</div>`;
  const vs = second ? t.vsSecond(money(b.received - second.received, dest.fcfa), esc(second.provider.name)) : t.only;
  const cta = b.provider.url
    ? go(b, 'btn-white btn-lg', `${esc(t.sendWith(b.provider.name))}${ARROW}`, t.sendWith(b.provider.name))
    : `<p class="btn-placeholder">${esc(t.noLink(b.provider.name))}</p>`;
  return `<article class="featured" aria-label="${t.bestLabel}">
  <svg class="featured__mark" aria-hidden="true"><use href="#nia-mark"></use></svg>
  <div class="featured__main">
    <div class="tags"><span class="tag tag--white">${t.bestLabel}</span>${b.promo ? `<span class="tag tag--amber">${t.welcomeTag}</span>` : ''}</div>
    <div class="featured__name"><span class="avatar avatar--white">${esc(b.provider.initials)}</span><h3>${esc(b.provider.name)}</h3></div>
    <div><div class="muted-on-violet">${t.receives}</div><div class="featured__amount">${money(b.received, dest.fcfa)}</div><div class="muted-on-violet">${vs}</div></div>
    <div class="chips"><span class="chip">1 ${ccy} = ${n(b.rate, 2)}</span><span class="chip">${b.fee === 0 ? t.noFee : t.fee(`${n(b.fee, 2)} ${ccy}`)}</span><span class="chip">${t.cost} ${cost(b.cost)}</span><span class="chip">${esc(b.provider.delay)}</span></div>
    <div class="muted-on-violet">${t.reception}${lang === 'fr' ? ' :' : ':'} ${ops(b)}</div>
  </div>
  <div class="featured__side">${cta}<p class="featured__disclose">${t.disclose}</p></div>
</article>`;
}

export function renderOthers(res, lang = 'fr') {
  const { t, n, money, ops, cost, go } = ctx(lang);
  const { others, best, dest, ccy } = res;
  if (!others.length || !best || res.amount <= 0) return '';
  const sortName = T[lang].r.sortName[res.sort] || T[lang].r.sortName.received;
  const rows = others.map((r) => `<article class="offer">
  <div class="offer__id"><span class="avatar">${esc(r.provider.initials)}</span><div><div class="offer__title"><h4>${esc(r.provider.name)}</h4>${r.promo ? `<span class="tag tag--amber tag--sm">${t.firstTag}</span>` : ''}</div><div class="offer__ops">${ops(r)}</div></div></div>
  <dl class="offer__stats"><div><dt>${t.rate}</dt><dd>${n(r.rate, 2)}</dd></div><div><dt>${t.feeL}</dt><dd>${r.fee === 0 ? t.free : `${n(r.fee, 2)} ${ccy}`}</dd></div><div><dt>${t.delay}</dt><dd>${esc(r.provider.delay)}</dd></div><div><dt>${t.cost}</dt><dd class="${costClass(r.cost)}">${cost(r.cost)}</dd></div></dl>
  <div class="offer__end"><div class="offer__amount"><strong>${money(r.received, dest.fcfa)}</strong><span>${t.vsFirst(n(best.received - r.received, 0))}</span></div>${r.provider.url ? go(r, 'icon-btn', ARROW, t.seeOffer(r.provider.name)) : ''}</div>
</article>`).join('\n');
  return `<h3 class="others-title">${t.others(sortName)}</h3><div class="offers">${rows}</div>`;
}

export function renderResults(res, lang = 'fr') {
  return renderPromoBar(res, lang) + renderFeatured(res, lang) + renderOthers(res, lang);
}
