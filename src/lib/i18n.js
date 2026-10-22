// Textes du site en français et en anglais. Les données (codes, devises, portefeuilles) restent dans compare.js.
import { ORIGINS, DESTS } from './compare.js';

export const LANGS = ['fr', 'en'];
export const LOCALE = { fr: 'fr-FR', en: 'en-GB' };

const NAMES = {
  fr: {
    origin: { FR: ['France', 'de France', 'france', 'en France'], BE: ['Belgique', 'de Belgique', 'belgique', 'en Belgique'], GB: ['Royaume-Uni', 'du Royaume-Uni', 'royaume-uni', 'au Royaume-Uni'], US: ['États-Unis', 'des États-Unis', 'etats-unis', 'aux États-Unis'], CA: ['Canada', 'du Canada', 'canada', 'au Canada'] },
    dest: { CM: ['Cameroun', 'au Cameroun', 'cameroun'], CI: ["Côte d'Ivoire", "en Côte d'Ivoire", 'cote-divoire'] }
  },
  en: {
    origin: { FR: ['France', 'from France', 'france', 'in France'], BE: ['Belgium', 'from Belgium', 'belgium', 'in Belgium'], GB: ['United Kingdom', 'from the UK', 'uk', 'in the UK', 'UK'], US: ['United States', 'from the US', 'usa', 'in the US', 'USA'], CA: ['Canada', 'from Canada', 'canada', 'in Canada'] },
    dest: { CM: ['Cameroon', 'to Cameroon', 'cameroon'], CI: ["Côte d'Ivoire", "to Côte d'Ivoire", 'ivory-coast'] }
  }
};

export function origin(lang, code) {
  const [name, from, slug, inside, short = name] = NAMES[lang].origin[code];
  return { ...ORIGINS.find((x) => x.code === code), name, from, slug, in: inside, short };
}
export function dest(lang, code) {
  const [name, to, slug] = NAMES[lang].dest[code];
  return { ...DESTS[code], name, prep: to, slug };
}
export const origins = (lang) => ORIGINS.map((o) => origin(lang, o.code));
export const dests = (lang) => Object.keys(DESTS).map((c) => dest(lang, c));

export const PATHS = {
  fr: { home: '/', hub: '/envoyer', how: '/comment-ca-marche', legal: '/mentions-legales', privacy: '/confidentialite' },
  en: { home: '/en', hub: '/en/send-money', how: '/en/how-it-works', legal: '/en/legal-notice', privacy: '/en/privacy' }
};
export function corridorPath(lang, o, d) {
  return lang === 'fr'
    ? `/envoyer/${origin('fr', o).slug}-${dest('fr', d).slug}`
    : `/en/send-money/${origin('en', o).slug}-to-${dest('en', d).slug}`;
}
export function corridorList(lang) {
  return ORIGINS.flatMap((o) => Object.keys(DESTS).map((d) => ({ o: o.code, d, path: corridorPath(lang, o.code, d) })));
}

// Paramètres d'adresse (comparaison partageable) dans la langue de la page.
export const PARAMS = {
  fr: { amount: 'montant', op: 'reception', kind: 'envoi', first: 'premier', sort: 'tri' },
  en: { amount: 'amount', op: 'receive', kind: 'transfer', first: 'first', sort: 'sort' }
};

export const OPS_L = {
  fr: { mtn: 'MTN MoMo', orange: 'Orange Money', wave: 'Wave', moov: 'Moov Money', bank: 'Banque', cash: 'Espèces' },
  en: { mtn: 'MTN MoMo', orange: 'Orange Money', wave: 'Wave', moov: 'Moov Money', bank: 'Bank account', cash: 'Cash pickup' }
};
export const CCY_L = {
  fr: { EUR: 'euro', GBP: 'livre sterling', USD: 'dollar US', CAD: 'dollar canadien' },
  en: { EUR: 'euro', GBP: 'pound sterling', USD: 'US dollar', CAD: 'Canadian dollar' }
};

// Nombres : en français, l'espace fine des milliers est presque invisible en Outfit → espace insécable normale.
export function fmt(v, d = 0, lang = 'fr') {
  const s = v.toLocaleString(LOCALE[lang], { minimumFractionDigits: d, maximumFractionDigits: d });
  return lang === 'fr' ? s.replace(/ /g, ' ') : s;
}
export const dateLong = (iso, lang, time = false) => new Date(iso).toLocaleString(LOCALE[lang], time
  ? { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' }
  : { dateStyle: 'long', timeZone: 'UTC' });
export const list = (xs, lang) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${lang === 'fr' ? 'et' : 'and'} ${xs.at(-1)}`);
const plural = (n, one, many) => (n > 1 ? many : one);

export const T = {
  fr: {
    htmlLang: 'fr', ogLocale: 'fr_FR', switchTo: 'English', switchLabel: 'Read this page in English',
    sampleBanner: "Démonstration : les taux des services affichés sont des données d'exemple, pas des offres réelles.",
    sampleBannerLabel: 'Avertissement',
    nav: { label: 'Navigation principale', ranking: 'Classement', rates: 'Taux de référence', how: 'Comment ça marche', faq: 'FAQ', home: 'nia, accueil' },
    footer: { about: "Comparateur indépendant des transferts vers le Cameroun et la Côte d'Ivoire. Taux indicatifs, non contractuels : vérifiez le montant final chez le service avant d'envoyer.", label: 'Pied de page', legal: 'Mentions légales', privacy: 'Confidentialité' },
    crumbs: { label: "Fil d'Ariane", home: 'Accueil', hub: "Envoyer de l'argent" },
    kicker: 'Afrique subsaharienne',
    homeH1: ['Même envoi, ', 'pas le même montant reçu !'],
    homeLead: "Comparez les services de transfert d'argent vers le Cameroun et la Côte d'Ivoire : ce que votre famille reçoit vraiment en francs CFA, frais inclus, sur MTN MoMo, Orange Money, Wave ou en banque.",
    corridorH1: (o) => `Envoyer de l'argent ${o.from} `,
    corridorLead: (o, d) => `Comparatif ${o.ccy} → ${d.fcfa} : ce que votre famille reçoit vraiment ${d.prep}, frais inclus, selon le service et le portefeuille de réception.`,
    bullets: ['Filtre par portefeuille : MTN MoMo, Orange Money, Wave, Moov', 'Offres de bienvenue séparées du taux habituel', 'Chaque taux daté, chaque lien affilié signalé'],
    w: {
      label: 'Paramètres de comparaison', from: 'De', to: 'Vers', change: 'Changer de pays', fromAria: "Pays d'envoi", send: "J'envoie", quick: 'Montants rapides',
      receivesOn: 'Votre proche reçoit sur', all: 'Tous', kind: "Type d'envoi", usual: 'Envoi habituel', first: 'Premier envoi',
      cta: (n) => `Voir les ${n} offres`, upTo: (x) => `jusqu'à ${x} reçus`, none: 'aucune offre pour ce choix', enter: 'saisissez un montant'
    },
    r: {
      eyebrow: 'Classement', sortLabel: 'Trier les autres offres par', sort: { received: 'Montant reçu', fee: 'Frais', speed: 'Délai' },
      sortName: { received: 'montant reçu', fee: 'frais', speed: 'délai' },
      meta: (n, op, kind) => `${n} services · ${op} · ${kind}`, allWallets: 'tous portefeuilles', kindUsual: 'envoi habituel', kindFirst: 'premier envoi',
      excluded: (n) => ` · ${n} ${plural(n, 'exclu', 'exclus')} (frais supérieurs au montant)`,
      observed: (d, sample) => `Taux relevés le ${d}${sample ? " — valeurs d'exemple" : ''}`,
      status: (n, x, name) => `${n} offres. Meilleur montant reçu : ${x} avec ${name}.`, statusNone: 'Aucune offre pour ce choix.', statusEnter: 'Saisissez un montant.',
      note: "Coût total = frais + écart avec la parité officielle, en % du montant (méthode Banque mondiale ; moyenne mondiale 6,49 % au T1 2025, objectif ONU ≤ 3 %). Les boutons ↗ sont des liens affiliés. Couverture vérifiée pour Taptap Send et LemFi (centres d'aide, 21/10/2026)."
    },
    v: {
      firstMode: 'Mode premier envoi : les taux au-dessus de 655,957 FCFA pour 1 € sont des offres financées par les services, valables une fois et plafonnées. Vérifiez les conditions chez le service.',
      promos: (n, gain, name) => `${n} ${plural(n, 'offre', 'offres')} de bienvenue sur ce couloir : jusqu'à +${gain} au premier envoi avec ${name}, puis retour au taux habituel.`,
      backUsual: "Revenir à l'envoi habituel", seeFirst: 'Voir en mode premier envoi',
      enter: 'Saisissez le montant que vous envoyez pour voir le classement.', belowFees: 'Ce montant est inférieur aux frais de tous les services suivis. Essayez un montant plus élevé.',
      noCombo: 'Aucun service suivi ne propose cette combinaison. Essayez « Tous » les portefeuilles.',
      vsSecond: (x, name) => `+${x} de plus qu'avec ${name}, le n° 2`, only: 'Seul service sur ce critère',
      sendWith: (name) => `Envoyer avec ${name}`, noLink: (name) => `Pas de lien direct : cherchez « ${name} » dans votre magasin d'applications.`,
      bestLabel: 'Meilleur montant reçu', welcomeTag: 'Offre de bienvenue · 1er envoi', firstTag: '1er envoi', receives: 'Votre proche reçoit',
      noFee: 'Sans frais', fee: (x) => `Frais ${x}`, free: 'Gratuit', cost: 'Coût total', rate: 'Taux', feeL: 'Frais', delay: 'Délai', reception: 'Réception',
      disclose: 'Lien affilié : nia peut être rémunéré si vous envoyez. Cela ne change ni ce classement ni votre prix.',
      affiliate: '(lien affilié, nouvel onglet)', seeOffer: (name) => `Voir l'offre ${name}`, vsFirst: (x) => `−${x} vs n° 1`, others: (s) => `Autres offres · triées par ${s}`
    },
    s: {
      eyebrow: 'À savoir', h2: (o, d) => `Envoyer de l'argent ${o.from} ${d.prep} : l'essentiel`,
      caption: 'Meilleur montant reçu selon la somme envoyée', cols: ['Vous envoyez', 'Meilleur service', 'Votre proche reçoit'],
      calc: (d, sample) => `Calcul au relevé du ${d}${sample ? " (valeurs d'exemple)" : ''}, envoi habituel, tous portefeuilles.`
    },
    hub: {
      eyebrow: 'Tous les couloirs', h2: 'Meilleur montant reçu pour 100, couloir par couloir', caption: 'Meilleur service par couloir pour 100 unités envoyées',
      cols: ['Couloir', 'Vous envoyez', 'Meilleur service', 'Votre proche reçoit'],
      note: (d, sample) => `Relevé du ${d}${sample ? " (valeurs d'exemple)" : ''}.`, all: 'Voir tous les couloirs →',
      pageTitle: "Envoyer de l'argent au Cameroun et en Côte d'Ivoire : tous les couloirs | nia",
      pageDesc: "France, Belgique, Royaume-Uni, États-Unis, Canada : comparez les services pour envoyer de l'argent au Cameroun (XAF) et en Côte d'Ivoire (XOF), couloir par couloir.",
      pageH1: "Envoyer de l'argent au Cameroun et en Côte d'Ivoire",
      pageLead: "Choisissez votre pays d'envoi et la destination : nia compare ce que votre famille reçoit vraiment en francs CFA, frais inclus, selon le service et le portefeuille (MTN MoMo, Orange Money, Wave, Moov ou banque).",
      pageNote: (d, sample) => `Relevé du ${d}${sample ? " (valeurs d'exemple)" : ''}, envoi habituel.`, method: 'Notre méthode →'
    },
    ref: {
      eyebrow: 'Taux de référence', h2: '1 € = 655,957 FCFA. Toujours.',
      p: "XAF (BEAC, Cameroun) et XOF (BCEAO, Côte d'Ivoire) sont arrimés à l'euro. Depuis l'euro, la différence entre services n'est donc pas le marché : c'est la marge de chacun. Depuis la livre, le dollar ou le dollar canadien, le taux suit en plus l'euro.",
      caption: 'Taux de référence vers le franc CFA', country: 'Pays',
      note: (d) => `Parité BEAC / BCEAO croisée avec les taux de référence de la BCE du ${d}, mis à jour automatiquement chaque jour ouvré.`
    },
    how: {
      eyebrow: 'Transparence', h2: 'Comment nia fonctionne', lead: "Un comparateur ne vaut que par sa neutralité. Voici tout ce qu'il faut savoir, sans astérisque.",
      cards: [
        ["Par montant reçu, rien d'autre", '(Montant − frais) × taux appliqué. Vous pouvez aussi trier par frais ou par délai. Aucun service ne peut payer pour monter.'],
        ['Des liens affiliés, signalés', 'Certains services nous versent une commission quand vous envoyez via nos liens. Vous ne payez pas plus. Un service sans accord avec nous reste classé à sa place.'],
        ["Vérifiez l'agrément vous-même", "nia ne détient jamais votre argent. Avant d'envoyer, vérifiez que le service est agréé (ACPR en France, ou autorité d'un autre pays de l'UE / du Royaume-Uni)."]
      ],
      fca: 'Registre FCA', more: 'Méthode complète, partenaires et agréments →'
    },
    popular: 'Couloirs populaires', popularSub: (a, ccy, fcfa) => `${a} ${ccy} vers ${fcfa}`,
    faqTitle: 'Questions fréquentes',
    faq: [
      ["Comment nia gagne-t-il de l'argent ?", "Par des liens affiliés : certains services nous versent une commission quand vous envoyez via nia. Vous ne payez rien de plus, et le classement reste calculé uniquement sur le montant reçu (ou le critère que vous choisissez)."],
      ['Comment le montant reçu est-il calculé ?', "(Montant envoyé − frais) × taux appliqué par le service. Le coût total ajoute frais et écart avec la parité officielle, en % du montant, comme le fait la Banque mondiale."],
      ['Pourquoi certains taux dépassent 655,957 FCFA pour 1 € ?', "Le franc CFA est arrimé à l'euro : 1 € vaut toujours 655,957 FCFA. Un taux plus élevé est une promotion payée par le service, souvent limitée au premier envoi et plafonnée. Activez « Premier envoi » pour la voir, « Envoi habituel » pour la suite."],
      ['Puis-je envoyer directement depuis nia ?', "Non. Le bouton « Envoyer avec… » vous emmène chez le service, où vous finalisez l'envoi. nia ne détient jamais vos fonds."],
      ['Les taux sont-ils à jour ?', "Chaque relevé est daté en haut du classement. Le montant final est celui que le service affiche au moment de l'envoi : vérifiez-le toujours avant de payer."]
    ],
    meta: {
      homeTitle: "Envoyer de l'argent au Cameroun et en Côte d'Ivoire : comparez les taux | nia",
      homeDesc: "Combien votre famille reçoit vraiment en francs CFA ? Comparez Taptap Send, LemFi, Remitly, WorldRemit, Western Union et d'autres : frais, délais, MTN MoMo, Orange Money, Wave. Taux datés, comparateur gratuit.",
      corridorTitle: (o, d) => `Envoyer de l'argent ${o.from} ${d.prep} : meilleur taux ${o.ccy} → ${d.fcfa} | nia`,
      corridorDesc: (o, d, best, x) => `${best ? `Pour 100 ${o.ccy} envoyés ${o.from} ${d.prep}, le meilleur service donnait ${x} ${d.fcfa} (${best}) au dernier relevé.` : `Comparez les services pour envoyer de l'argent ${o.from} ${d.prep}.`} Comparez frais, délais et réception sur ${d.code === 'CI' ? 'Wave, Orange Money, MTN, Moov' : 'MTN MoMo, Orange Money'}.`
    }
  },

  en: {
    htmlLang: 'en', ogLocale: 'en_GB', switchTo: 'Français', switchLabel: 'Lire cette page en français',
    sampleBanner: 'Demo: the provider rates shown are sample data, not real offers.',
    sampleBannerLabel: 'Notice',
    nav: { label: 'Main navigation', ranking: 'Rankings', rates: 'Reference rates', how: 'How it works', faq: 'FAQ', home: 'nia, home' },
    footer: { about: "Independent comparison of money transfers to Cameroon and Côte d'Ivoire. Indicative rates only: always check the final amount with the provider before you send.", label: 'Footer', legal: 'Legal notice', privacy: 'Privacy' },
    crumbs: { label: 'Breadcrumb', home: 'Home', hub: 'Send money' },
    kicker: 'Sub-Saharan Africa',
    homeH1: ['Same transfer, ', 'not the same amount received!'],
    homeLead: "Compare money transfer services to Cameroon and Côte d'Ivoire: what your family really receives in CFA francs, fees included, on MTN MoMo, Orange Money, Wave or a bank account.",
    corridorH1: (o) => `Send money ${o.from} `,
    corridorLead: (o, d) => `${o.ccy} → ${d.fcfa} comparison: what your family really receives in ${d.name}, fees included, by provider and mobile wallet.`,
    bullets: ['Filter by wallet: MTN MoMo, Orange Money, Wave, Moov', 'Welcome offers shown separately from regular rates', 'Every rate dated, every affiliate link disclosed'],
    w: {
      label: 'Comparison settings', from: 'From', to: 'To', change: 'Change country', fromAria: 'Sending country', send: 'I send', quick: 'Quick amounts',
      receivesOn: 'Your recipient receives on', all: 'All', kind: 'Transfer type', usual: 'Regular transfer', first: 'First transfer',
      cta: (n) => `See ${n} offers`, upTo: (x) => `up to ${x} received`, none: 'no offer for this choice', enter: 'enter an amount'
    },
    r: {
      eyebrow: 'Rankings', sortLabel: 'Sort the other offers by', sort: { received: 'Amount received', fee: 'Fees', speed: 'Speed' },
      sortName: { received: 'amount received', fee: 'fees', speed: 'speed' },
      meta: (n, op, kind) => `${n} providers · ${op} · ${kind}`, allWallets: 'all wallets', kindUsual: 'regular transfer', kindFirst: 'first transfer',
      excluded: (n) => ` · ${n} excluded (fees higher than the amount)`,
      observed: (d, sample) => `Rates collected on ${d}${sample ? ' — sample values' : ''}`,
      status: (n, x, name) => `${n} offers. Best amount received: ${x} with ${name}.`, statusNone: 'No offer for this choice.', statusEnter: 'Enter an amount.',
      note: 'Total cost = fees + gap with the official parity, as a % of the amount sent (World Bank method; global average 6.49% in Q1 2025, UN target ≤ 3%). ↗ buttons are affiliate links. Coverage verified for Taptap Send and LemFi (help centres, 21 Oct 2026).'
    },
    v: {
      firstMode: 'First-transfer mode: rates above 655.957 CFA francs per €1 are offers funded by the providers, valid once and capped. Check the terms with the provider.',
      promos: (n, gain, name) => `${n} welcome ${plural(n, 'offer', 'offers')} on this corridor: up to +${gain} on your first transfer with ${name}, then back to the regular rate.`,
      backUsual: 'Back to regular transfer', seeFirst: 'See first-transfer mode',
      enter: 'Enter the amount you send to see the rankings.', belowFees: 'This amount is lower than the fees of every provider we track. Try a higher amount.',
      noCombo: 'No provider we track offers this combination. Try "All" wallets.',
      vsSecond: (x, name) => `+${x} more than with ${name}, the runner-up`, only: 'Only provider for this choice',
      sendWith: (name) => `Send with ${name}`, noLink: (name) => `No direct link: search for "${name}" in your app store.`,
      bestLabel: 'Best amount received', welcomeTag: 'Welcome offer · 1st transfer', firstTag: '1st transfer', receives: 'Your recipient receives',
      noFee: 'No fees', fee: (x) => `Fee ${x}`, free: 'Free', cost: 'Total cost', rate: 'Rate', feeL: 'Fees', delay: 'Speed', reception: 'Payout',
      disclose: 'Affiliate link: nia may earn a commission if you send. It changes neither these rankings nor your price.',
      affiliate: '(affiliate link, new tab)', seeOffer: (name) => `See the ${name} offer`, vsFirst: (x) => `−${x} vs #1`, others: (s) => `Other offers · sorted by ${s}`
    },
    s: {
      eyebrow: 'Good to know', h2: (o, d) => `Sending money ${o.from} ${d.prep}: the essentials`,
      caption: 'Best amount received by amount sent', cols: ['You send', 'Best provider', 'Your recipient receives'],
      calc: (d, sample) => `Based on rates collected on ${d}${sample ? ' (sample values)' : ''}, regular transfer, all wallets.`
    },
    hub: {
      eyebrow: 'All corridors', h2: 'Best amount received for 100, corridor by corridor', caption: 'Best provider per corridor for 100 units sent',
      cols: ['Corridor', 'You send', 'Best provider', 'Your recipient receives'],
      note: (d, sample) => `Rates collected on ${d}${sample ? ' (sample values)' : ''}.`, all: 'See all corridors →',
      pageTitle: "Send money to Cameroon and Côte d'Ivoire (Ivory Coast): all corridors | nia",
      pageDesc: "UK, USA, Canada, France, Belgium: compare providers to send money to Cameroon (XAF) and Côte d'Ivoire (XOF), corridor by corridor.",
      pageH1: "Send money to Cameroon and Côte d'Ivoire",
      pageLead: 'Pick your sending country and destination: nia compares what your family really receives in CFA francs, fees included, by provider and wallet (MTN MoMo, Orange Money, Wave, Moov or bank account).',
      pageNote: (d, sample) => `Rates collected on ${d}${sample ? ' (sample values)' : ''}, regular transfer.`, method: 'Our method →'
    },
    ref: {
      eyebrow: 'Reference rates', h2: '€1 = 655.957 CFA francs. Always.',
      p: "XAF (BEAC, Cameroon) and XOF (BCEAO, Côte d'Ivoire) are pegged to the euro. From euros, the difference between providers is not the market: it is each provider's margin. From pounds, US dollars or Canadian dollars, the rate also follows the euro.",
      caption: 'Reference rates to the CFA franc', country: 'Country',
      note: (d) => `BEAC / BCEAO parity crossed with the European Central Bank reference rates of ${d}, updated automatically every business day.`
    },
    how: {
      eyebrow: 'Transparency', h2: 'How nia works', lead: 'A comparison site is only worth its neutrality. Here is everything you need to know, no small print.',
      cards: [
        ['By amount received, nothing else', '(Amount − fees) × rate applied. You can also sort by fees or speed. No provider can pay to rank higher.'],
        ['Affiliate links, disclosed', 'Some providers pay us a commission when you send through our links. You do not pay more. A provider with no deal with us keeps its rank.'],
        ['Check the licence yourself', 'nia never holds your money. Before you send, check the provider is licensed (FCA in the UK, FinCEN and state licences in the US, FINTRAC in Canada, ACPR in France).']
      ],
      fca: 'FCA register', more: 'Full method, partners and licences →'
    },
    popular: 'Popular corridors', popularSub: (a, ccy, fcfa) => `${a} ${ccy} to ${fcfa}`,
    faqTitle: 'Frequently asked questions',
    faq: [
      ['How does nia make money?', 'Through affiliate links: some providers pay us a commission when you send through nia. You pay nothing extra, and the rankings are calculated only on the amount received (or the criterion you choose).'],
      ['How is the amount received calculated?', '(Amount sent − fees) × rate applied by the provider. Total cost adds fees and the gap with the official parity, as a % of the amount, the way the World Bank measures it.'],
      ['Why are some rates above 655.957 CFA francs per €1?', 'The CFA franc is pegged to the euro: €1 is always worth 655.957 CFA francs. A higher rate is a promotion paid by the provider, usually limited to your first transfer and capped. Switch to "First transfer" to see it, and "Regular transfer" for the next ones.'],
      ['Can I send money directly from nia?', 'No. The "Send with…" button takes you to the provider, where you complete the transfer. nia never holds your funds.'],
      ['Are the rates up to date?', 'Every set of rates is dated at the top of the rankings. The final amount is the one the provider shows when you send: always check it before you pay.']
    ],
    meta: {
      homeTitle: "Send money to Cameroon & Côte d'Ivoire (Ivory Coast): compare rates | nia",
      homeDesc: "How much does your family really receive in CFA francs? Compare Taptap Send, LemFi, Remitly, WorldRemit, Western Union and more: fees, speed, MTN MoMo, Orange Money, Wave. Dated rates, free to use.",
      corridorTitle: (o, d) => `Send money ${o.from} ${d.prep}${d.code === 'CI' ? ' (Ivory Coast)' : ''}: best ${o.ccy} to ${d.fcfa} rate | nia`,
      corridorDesc: (o, d, best, x) => `${best ? `For 100 ${o.ccy} sent ${o.from} ${d.prep}, the best provider gave ${x} ${d.fcfa} (${best}) at the latest check.` : `Compare providers to send money ${o.from} ${d.prep}.`} Compare fees, speed and payout on ${d.code === 'CI' ? 'Wave, Orange Money, MTN, Moov' : 'MTN MoMo, Orange Money'}.`
    }
  }
};
