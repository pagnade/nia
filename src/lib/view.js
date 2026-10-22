// Rendu HTML des résultats : utilisé à la génération (SEO) et dans le navigateur (interactions).
import { OPS, SDG_TARGET, WB_GLOBAL_AVG } from './compare.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Le séparateur de milliers français (espace fine) est presque invisible en Outfit : on utilise une espace insécable normale.
export const fmt = (v, d = 0) => v.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/ /g, ' ');

const ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"></path><path d="M8 7h9v9"></path></svg>';
const GIFT = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2"></rect><path d="M12 8v13"></path><path d="M3 12h18"></path><path d="M12 8c-2-4-6-4-6-1.5S10 8 12 8c2 0 6 1 6-1.5S14 4 12 8z"></path></svg>';

const opsText = (r) => r.ops.map((o) => OPS[o]).join(' · ');
const costText = (c) => (c < 0 ? '−' : '') + fmt(Math.abs(c), 2) + ' %';
const costClass = (c) => (c <= SDG_TARGET ? 'cost-good' : c <= WB_GLOBAL_AVG ? '' : 'cost-bad');
const money = (v, cur) => `${fmt(v, 0)} ${cur}`;

function goLink(r, cls, inner, label) {
  return `<a class="${cls}" href="/go/${esc(r.provider.id)}" target="_blank" rel="sponsored nofollow noopener" aria-label="${esc(label)} (lien affilié, nouvel onglet)">${inner}</a>`;
}

export function renderPromoBar(res) {
  const { promos, kind, dest } = res;
  if (res.amount <= 0 || (kind !== 'first' && !promos.length)) return '';
  const text = kind === 'first'
    ? 'Mode premier envoi : les taux au-dessus de 655,957 FCFA pour 1 € sont des offres financées par les services, valables une fois et plafonnées. Vérifiez les conditions chez le service.'
    : `${promos.length} offre${promos.length > 1 ? 's' : ''} de bienvenue sur ce couloir : jusqu'à +${money(promos[0].gain, dest.fcfa)} au premier envoi avec ${esc(promos[0].provider.name)}, puis retour au taux habituel.`;
  const cta = kind === 'first' ? "Revenir à l'envoi habituel" : 'Voir en mode premier envoi';
  return `<div class="promo-bar"><div class="promo-bar__text">${GIFT}<span>${text}</span></div><button type="button" class="btn-amber" data-toggle-kind>${cta}</button></div>`;
}

export function renderFeatured(res) {
  const { best: b, second, dest, ccy } = res;
  if (res.amount <= 0) return `<div class="empty">Saisissez le montant que vous envoyez pour voir le classement.</div>`;
  if (!b) {
    return res.excluded
      ? `<div class="empty">Ce montant est inférieur aux frais de tous les services suivis. Essayez un montant plus élevé.</div>`
      : `<div class="empty">Aucun service suivi ne propose cette combinaison. Essayez « Tous » les portefeuilles.</div>`;
  }
  const vs = second
    ? `+${money(b.received - second.received, dest.fcfa)} de plus qu'avec ${esc(second.provider.name)}, le n° 2`
    : 'Seul service sur ce critère';
  const cta = b.provider.url
    ? goLink(b, 'btn-white btn-lg', `Envoyer avec ${esc(b.provider.name)}${ARROW}`, `Envoyer avec ${b.provider.name}`)
    : `<p class="btn-placeholder">Pas de lien direct : cherchez « ${esc(b.provider.name)} » dans votre magasin d'applications.</p>`;
  return `<article class="featured" aria-label="Meilleur montant reçu">
  <svg class="featured__mark" aria-hidden="true"><use href="#nia-mark"></use></svg>
  <div class="featured__main">
    <div class="tags"><span class="tag tag--white">Meilleur montant reçu</span>${b.promo ? '<span class="tag tag--amber">Offre de bienvenue · 1er envoi</span>' : ''}</div>
    <div class="featured__name"><span class="avatar avatar--white">${esc(b.provider.initials)}</span><h3>${esc(b.provider.name)}</h3></div>
    <div><div class="muted-on-violet">Votre proche reçoit</div><div class="featured__amount">${money(b.received, dest.fcfa)}</div><div class="muted-on-violet">${vs}</div></div>
    <div class="chips"><span class="chip">1 ${ccy} = ${fmt(b.rate, 2)}</span><span class="chip">${b.fee === 0 ? 'Sans frais' : `Frais ${fmt(b.fee, 2)} ${ccy}`}</span><span class="chip">Coût total ${costText(b.cost)}</span><span class="chip">${esc(b.provider.delay)}</span></div>
    <div class="muted-on-violet">Réception : ${opsText(b)}</div>
  </div>
  <div class="featured__side">${cta}<p class="featured__disclose">Lien affilié : nia peut être rémunéré si vous envoyez. Cela ne change ni ce classement ni votre prix.</p></div>
</article>`;
}

export function renderOthers(res) {
  const { others, best, dest, ccy } = res;
  if (!others.length || !best || res.amount <= 0) return '';
  const sortName = { received: 'montant reçu', fee: 'frais', speed: 'délai' }[res.sort] || 'montant reçu';
  const rows = others.map((r) => `<article class="offer">
  <div class="offer__id"><span class="avatar">${esc(r.provider.initials)}</span><div><div class="offer__title"><h4>${esc(r.provider.name)}</h4>${r.promo ? '<span class="tag tag--amber tag--sm">1er envoi</span>' : ''}</div><div class="offer__ops">${opsText(r)}</div></div></div>
  <dl class="offer__stats"><div><dt>Taux</dt><dd>${fmt(r.rate, 2)}</dd></div><div><dt>Frais</dt><dd>${r.fee === 0 ? 'Gratuit' : `${fmt(r.fee, 2)} ${ccy}`}</dd></div><div><dt>Délai</dt><dd>${esc(r.provider.delay)}</dd></div><div><dt>Coût total</dt><dd class="${costClass(r.cost)}">${costText(r.cost)}</dd></div></dl>
  <div class="offer__end"><div class="offer__amount"><strong>${money(r.received, dest.fcfa)}</strong><span>−${fmt(best.received - r.received, 0)} vs n° 1</span></div>${r.provider.url ? goLink(r, 'icon-btn', ARROW, `Voir l'offre ${r.provider.name}`) : ''}</div>
</article>`).join('\n');
  return `<h3 class="others-title">Autres offres · triées par ${sortName}</h3><div class="offers">${rows}</div>`;
}

export function renderResults(res) {
  return renderPromoBar(res) + renderFeatured(res) + renderOthers(res);
}
