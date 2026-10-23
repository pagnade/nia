// Guide Diaspora : règles sur les fiches (validation, ordre, dates). Partagé entre les pages et les tests.

export const CATEGORIES = ['epargne', 'obligations', 'bourse', 'fonds', 'immobilier', 'plateformes'];
export const PAYS = ['CM', 'CI'];
export const ZONES = ['UEMOA', 'CEMAC', 'international'];
export const STATUTS = ['disponible', 'en_preparation', 'annonce'];
export const ACCES = ['oui', 'non', 'a_verifier'];
export const SOURCE_TYPES = ['officielle', 'presse', 'tiers'];
export const REQUIRED = ['id', 'nom', 'categorie', 'pays', 'zone', 'statut', 'acces_etranger', 'source_url', 'source_type', 'derniere_verification', 'description_fr', 'description_en'];

// Indépendance : aucun lien affilié ni paramètre de suivi dans le guide.
export const TRACKING_PARAM = /^(ref|aff|affiliate|affid|promo|promocode|coupon|code)$|^utm_/i;
export const FORBIDDEN = {
  fr: ['meilleur', 'meilleure', 'meilleurs', 'rendement garanti', 'opportunité', 'opportunités', 'investissez', 'placement sûr', 'sans risque', 'recommandé', 'nous recommandons'],
  en: ['best', 'guaranteed return', 'opportunity', 'opportunities', 'invest now', 'safe investment', 'risk-free', 'recommended', 'we recommend']
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isIsoDate = (s) => typeof s === 'string' && ISO_DATE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);

export function isHttpsUrl(u) {
  try { return new URL(u).protocol === 'https:'; } catch { return false; }
}

export function hasTracking(u) {
  try { return [...new URL(u, 'https://nia.invalid').searchParams.keys()].some((k) => TRACKING_PARAM.test(k)); } catch { return false; }
}

/** Liste des problèmes d'une fiche (vide si elle est valide). */
export function validateFiche(f) {
  const e = [];
  for (const k of REQUIRED) if (f[k] === undefined || f[k] === null || f[k] === '' || (Array.isArray(f[k]) && !f[k].length)) e.push(`${k} manquant`);
  if (f.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.id)) e.push('id : minuscules et tirets uniquement');
  if (f.categorie && !CATEGORIES.includes(f.categorie)) e.push(`categorie invalide : ${f.categorie}`);
  if (Array.isArray(f.pays) && f.pays.some((p) => !PAYS.includes(p))) e.push(`pays invalide : ${f.pays}`);
  if (f.zone && !ZONES.includes(f.zone)) e.push(`zone invalide : ${f.zone}`);
  if (f.statut && !STATUTS.includes(f.statut)) e.push(`statut invalide : ${f.statut}`);
  if (f.acces_etranger && !ACCES.includes(f.acces_etranger)) e.push(`acces_etranger invalide : ${f.acces_etranger}`);
  if (f.source_type && !SOURCE_TYPES.includes(f.source_type)) e.push(`source_type invalide : ${f.source_type}`);
  if (f.derniere_verification && !isIsoDate(f.derniere_verification)) e.push(`date invalide : ${f.derniere_verification}`);
  for (const s of [{ url: f.source_url, type: f.source_type }, ...(f.sources_complementaires || [])]) {
    if (!isHttpsUrl(s.url)) e.push(`URL non https : ${s.url}`);
    if (hasTracking(s.url)) e.push(`paramètre de suivi : ${s.url}`);
    if (!SOURCE_TYPES.includes(s.type)) e.push(`type de source invalide : ${s.type}`);
  }
  if (f.minimum != null && !(f.minimum.montant > 0 && f.minimum.devise)) e.push('minimum : montant et devise attendus');
  if ((f.renvois || []).some((c) => !CATEGORIES.includes(c))) e.push(`renvoi invalide : ${f.renvois}`);
  return e;
}

/** Ordre neutre : statut (disponible, en préparation, annoncé), puis ordre alphabétique. Jamais un ordre de préférence. */
export function sortFiches(fiches, locale = 'fr') {
  return [...fiches].sort((a, b) => STATUTS.indexOf(a.statut) - STATUTS.indexOf(b.statut) || a.nom.localeCompare(b.nom, locale, { sensitivity: 'base' }));
}

/** Date annoncée en haut de page : la plus ancienne vérification des fiches affichées (fraîcheur garantie, pas la meilleure). */
export function oldestCheck(fiches) {
  return fiches.map((f) => f.derniere_verification).sort()[0] ?? null;
}

export const byCategory = (fiches, cat) => fiches.filter((f) => f.categorie === cat);
export const crossRefs = (fiches, cat) => fiches.filter((f) => (f.renvois || []).includes(cat));
export const upcoming = (fiches) => fiches.filter((f) => f.statut !== 'disponible');
export const hostOf = (u) => new URL(u).hostname.replace(/^www\./, '');
