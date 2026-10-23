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
  fr: { home: '/', hub: '/envoyer', how: '/comment-ca-marche', legal: '/mentions-legales', privacy: '/confidentialite', guide: '/guide-diaspora' },
  en: { home: '/en', hub: '/en/send-money', how: '/en/how-it-works', legal: '/en/legal-notice', privacy: '/en/privacy', guide: '/en/diaspora-guide' }
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
    nav: { label: 'Navigation principale', ranking: 'Classement', rates: 'Taux de référence', how: 'Comment ça marche', faq: 'FAQ', guide: 'Guide Diaspora', home: 'nia, accueil' },
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
    further: { title: 'Aller plus loin', text: "Vous envoyez régulièrement de l'argent ? Découvrez comment épargner et investir au pays depuis l'étranger.", link: 'Lire le Guide Diaspora →' },
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
    nav: { label: 'Main navigation', ranking: 'Rankings', rates: 'Reference rates', how: 'How it works', faq: 'FAQ', guide: 'Diaspora Guide', home: 'nia, home' },
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
    further: { title: 'Go further', text: 'Do you send money regularly? Find out how to save and invest back home from abroad.', link: 'Read the Diaspora Guide →' },
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

// Guide Diaspora : textes de la page. Information indépendante, jamais de recommandation
// (liste de mots interdits vérifiée par test/site.test.mjs).
export const GUIDE = {
  fr: {
    title: "Épargner et investir au Cameroun et en Côte d'Ivoire depuis l'étranger, guide indépendant",
    description: "Guide indépendant et sourcé pour épargner et investir au Cameroun et en Côte d'Ivoire depuis l'étranger : épargne, obligations, bourse, fonds, immobilier.",
    h1: "Épargner et investir au Cameroun et en Côte d'Ivoire depuis l'étranger",
    independence: 'Information indépendante, pas un conseil en investissement. NIA ne perçoit aucune rémunération des établissements cités.',
    checked: (d) => `Informations vérifiées le ${d}`,
    tocLabel: 'Sommaire',
    before: {
      title: 'Avant de commencer',
      tax: ['Fiscalité', "Les exonérations annoncées par les émetteurs concernent souvent les seuls résidents du pays. Si vous résidez en France, au Canada, aux États-Unis ou au Royaume-Uni, vous êtes imposé selon les règles de votre pays de résidence et les conventions fiscales applicables. Renseignez-vous auprès de l'administration fiscale de votre pays de résidence (par exemple la DGFiP en France, l'Agence du revenu du Canada, l'IRS aux États-Unis ou le HMRC au Royaume-Uni)."],
      fx: ['Change', "Les francs CFA (XOF en Côte d'Ivoire, XAF au Cameroun) sont arrimés à l'euro : 1 € = 655,957 FCFA. Pour un investisseur en dollar ou en livre, le taux de change varie et modifie la valeur du placement dans sa monnaie."],
      licence: ['Agrément', "Avant d'investir, vérifiez qu'un établissement est agréé par le régulateur compétent :"],
      risk: ['Risque', 'Tout investissement comporte un risque de perte en capital. Les rendements passés ne garantissent pas les rendements futurs.']
    },
    cats: {
      epargne: ['Épargner', "Les caisses de dépôts et plusieurs banques proposent des produits destinés à la diaspora. Certains sont encore en préparation. Les conditions d'ouverture depuis l'étranger varient selon l'établissement et sont indiquées « À vérifier » quand la source ne les précise pas."],
      obligations: ["Obligations d'État", "Les États émettent des emprunts obligataires ouverts au public, par exemple avec une valeur nominale de 10 000 FCFA par obligation pour le Trésor ivoirien. Les avantages fiscaux annoncés visent en général les résidents du pays émetteur. Un emprunt destiné à la diaspora est annoncé en Côte d'Ivoire."],
      bourse: ['Investir en bourse', "La Côte d'Ivoire fait partie de la BRVM, bourse commune à l'UEMOA, et le Cameroun de la BVMAC, bourse de la CEMAC. L'accès passe par une société de gestion et d'intermédiation (SGI) ou une société de bourse agréée. Les montants minimums publiés varient selon l'intermédiaire."],
      fonds: ['Fonds collectifs', "Un fonds commun de placement (FCP) regroupe l'épargne de plusieurs personnes, gérée par une société de gestion. Les fonds cités ici sont présentés par la presse comme agréés dans la CEMAC. Leur valeur peut baisser comme monter."],
      immobilier: ['Immobilier', "L'immobilier est souvent le premier projet d'épargne de la diaspora. Ce guide ne recense pas de promoteurs immobiliers. Le produit présenté ci-dessous vise l'accession à la propriété ; sa fiche complète figure dans la section Épargner."],
      plateformes: ['Plateformes et capital-investissement', "Des plateformes en ligne permettent de placer à distance, en bourse ou dans des entreprises non cotées. Plusieurs sont récentes ou seulement annoncées. Les informations proviennent souvent du site de la plateforme elle-même, signalé comme source tiers."]
    },
    seeAlso: (name) => `Voir la fiche « ${name} » dans la section Épargner.`,
    filter: { label: 'Filtrer par pays', all: 'Tous', CM: 'Cameroun', CI: "Côte d'Ivoire" },
    empty: 'Aucune fiche pour ce pays dans cette section.',
    statut: { disponible: 'Disponible', en_preparation: 'En préparation', annonce: 'Annoncé' },
    acces: { label: "Depuis l'étranger", oui: 'oui', non: 'non', a_verifier: 'À vérifier' },
    sourceBadge: { officielle: 'Source officielle', presse: 'Source presse / tiers', tiers: 'Source presse / tiers' },
    sourceType: { officielle: 'officielle', presse: 'presse', tiers: 'tiers' },
    country: { CM: 'Cameroun', CI: "Côte d'Ivoire" },
    zoneLabel: 'Zone',
    countryLabel: 'Pays',
    minimum: (m, type) => `Minimum publié : ${m} (source ${type})`,
    sources: 'Sources',
    sourceLink: (host, type) => `${host} (${type}, nouvel onglet)`,
    verified: (d) => `Vérifié le ${d}`,
    attention: 'À savoir',
    watch: { title: 'À surveiller', intro: 'Produits annoncés ou en préparation. Les dates sont celles avancées par les sources et peuvent changer.', noDate: 'échéance non communiquée' },
    method: {
      title: 'Comment nous établissons ce guide',
      items: [
        ['Sources', "Nous utilisons en priorité les sources officielles : régulateurs, Trésor, bourses, caisses de dépôts. À défaut, nous citons la presse ou des sites tiers, y compris le site d'une plateforme. Chaque fiche indique le type de source."],
        ['Vérification', (freq) => `Chaque fiche porte la date de sa dernière vérification. Nous revérifions les fiches ${freq}. La date en haut de page est la plus ancienne des fiches affichées.`],
        ['Indépendance', "NIA ne perçoit aucune rémunération des établissements cités. Ce guide ne contient aucun lien affilié ni paramètre de suivi. Les fiches sont classées par statut, puis par ordre alphabétique."],
        ['Une erreur ?', "Signalez-la à l'adresse indiquée dans les mentions légales."]
      ],
      legal: 'Mentions légales'
    },
    faqTitle: 'Questions fréquentes',
    faq: [
      ['Peut-on investir à la BRVM depuis la France ?', "Oui, en passant par une société de gestion et d'intermédiation (SGI) ou une plateforme qui travaille avec une SGI. Certaines SGI proposent l'ouverture de compte à distance, selon les sources citées dans ce guide. Vérifiez l'agrément de l'intermédiaire auprès de l'AMF-UMOA."],
      ['Les intérêts des emprunts ivoiriens sont-ils imposés en France ?', "L'exonération annoncée par le Trésor ivoirien vise les résidents en Côte d'Ivoire. Un résident en France est imposé selon les règles françaises et la convention fiscale applicable. Renseignez-vous auprès de la DGFiP ou d'un conseiller fiscal."],
      ["Qu'est-ce qu'un diaspora bond ?", "C'est un emprunt émis par un État et destiné à ses ressortissants vivant à l'étranger. La Côte d'Ivoire en a annoncé un pour le 1er trimestre 2027, selon la presse."],
      ['Où en est le produit Diasdev au Cameroun ?', "Selon la presse, la Caisse des dépôts et consignations du Cameroun (CDEC) conçoit ce produit d'épargne réglementé. Il n'est pas encore commercialisé, et la CDEC ne le vendra pas elle-même."],
      ["Comment vérifier qu'une société de bourse est agréée ?", "Consultez la liste des intervenants agréés publiée par le régulateur : l'AMF-UMOA pour l'UEMOA (BRVM), la COSUMAF pour la CEMAC (BVMAC). Pour une banque de la CEMAC, le régulateur est la COBAC."],
      ['NIA est-il rémunéré par ces établissements ?', "Non. NIA ne perçoit aucune rémunération des établissements cités dans ce guide, qui ne contient aucun lien affilié. Le comparateur de transferts de NIA, lui, utilise des liens affiliés signalés comme tels."]
    ],
    back: { title: 'Comparer le coût de vos envois', text: "Avant d'épargner au pays, comparez ce que votre famille reçoit vraiment selon le service de transfert.", link: 'Voir les couloirs de transfert →' },
    crumbs: 'Guide Diaspora'
  },
  en: {
    title: "Saving and investing in Cameroon and Côte d'Ivoire from abroad: independent guide",
    description: "Independent, sourced guide to saving and investing in Cameroon and Côte d'Ivoire from abroad: savings, government bonds, stock markets, funds and real estate.",
    h1: "Saving and investing in Cameroon and Côte d'Ivoire from abroad",
    independence: 'Independent information, not investment advice. NIA receives no payment from the institutions listed.',
    checked: (d) => `Information checked on ${d}`,
    tocLabel: 'Contents',
    before: {
      title: 'Before you start',
      tax: ['Tax', "Tax exemptions announced by issuers often apply only to residents of the country. If you live in France, Canada, the United States or the United Kingdom, you are taxed under the rules of your country of residence and the applicable tax treaties. Check with the tax authority where you live (for example the DGFiP in France, the Canada Revenue Agency, the IRS in the US or HMRC in the UK)."],
      fx: ['Currency', "CFA francs (XOF in Côte d'Ivoire, XAF in Cameroon) are pegged to the euro: €1 = 655.957 FCFA. For an investor in US dollars or pounds, the exchange rate moves and changes the value of the investment in their own currency."],
      licence: ['Licensing', 'Before investing, check that an institution is licensed by the relevant regulator:'],
      risk: ['Risk', 'Every investment carries a risk of capital loss. Past returns do not guarantee future returns.']
    },
    cats: {
      epargne: ['Saving', "Deposit funds and several banks offer products for the diaspora. Some are still in preparation. Conditions for opening an account from abroad vary by institution and are shown as \"To be checked\" when the source does not specify them."],
      obligations: ['Government bonds', "Governments issue bonds open to the public, for example with a nominal value of 10,000 FCFA per bond for the Ivorian Treasury. Announced tax benefits usually apply to residents of the issuing country. A bond aimed at the diaspora has been announced in Côte d'Ivoire."],
      bourse: ['Stock markets', "Côte d'Ivoire belongs to the BRVM, the shared UEMOA stock exchange, and Cameroon to the BVMAC, the CEMAC exchange. Access goes through a licensed broker (SGI or brokerage firm). Published minimum amounts vary by broker."],
      fonds: ['Investment funds', 'A mutual fund (FCP) pools the savings of many people, managed by an asset management company. The press presents the funds listed here as approved in the CEMAC. Their value can go down as well as up.'],
      immobilier: ['Real estate', 'Real estate is often the diaspora\'s first savings project. This guide does not list property developers. The product shown below is aimed at home ownership; its full entry is in the Saving section.'],
      plateformes: ['Platforms and private equity', 'Online platforms let you place money remotely, on the stock market or in unlisted companies. Several are recent or only announced. The information often comes from the platform\'s own website, flagged as a third-party source.']
    },
    seeAlso: (name) => `See the "${name}" entry in the Saving section.`,
    filter: { label: 'Filter by country', all: 'All', CM: 'Cameroon', CI: "Côte d'Ivoire" },
    empty: 'No entry for this country in this section.',
    statut: { disponible: 'Available', en_preparation: 'In preparation', annonce: 'Announced' },
    acces: { label: 'From abroad', oui: 'yes', non: 'no', a_verifier: 'To be checked' },
    sourceBadge: { officielle: 'Official source', presse: 'Press / third-party source', tiers: 'Press / third-party source' },
    sourceType: { officielle: 'official', presse: 'press', tiers: 'third party' },
    country: { CM: 'Cameroon', CI: "Côte d'Ivoire" },
    zoneLabel: 'Zone',
    countryLabel: 'Country',
    minimum: (m, type) => `Published minimum: ${m} (${type} source)`,
    sources: 'Sources',
    sourceLink: (host, type) => `${host} (${type}, new tab)`,
    verified: (d) => `Checked on ${d}`,
    attention: 'Good to know',
    watch: { title: 'Coming up', intro: 'Products announced or in preparation. Dates are those given by the sources and may change.', noDate: 'no date given' },
    method: {
      title: 'How we build this guide',
      items: [
        ['Sources', 'We use official sources first: regulators, treasuries, stock exchanges, deposit funds. Otherwise we cite the press or third-party websites, including a platform\'s own site. Each entry shows its source type.'],
        ['Checks', (freq) => `Each entry shows the date it was last checked. We check entries again ${freq}. The date at the top of the page is the oldest of the entries shown.`],
        ['Independence', 'NIA receives no payment from the institutions listed. This guide contains no affiliate links and no tracking parameters. Entries are sorted by status, then alphabetically.'],
        ['Spotted an error?', 'Report it to the address given in the legal notice.']
      ],
      legal: 'Legal notice'
    },
    faqTitle: 'Frequently asked questions',
    faq: [
      ['Can I invest on the BRVM from France?', 'Yes, through a licensed broker (SGI) or a platform that works with one. Some brokers offer remote account opening, according to the sources cited in this guide. Check the broker\'s licence with the AMF-UMOA.'],
      ['Is interest on Ivorian government bonds taxed in France?', 'The exemption announced by the Ivorian Treasury applies to residents of Côte d\'Ivoire. A French resident is taxed under French rules and the applicable tax treaty. Check with the DGFiP or a tax adviser.'],
      ['What is a diaspora bond?', 'A bond issued by a government for its citizens living abroad. Côte d\'Ivoire has announced one for the first quarter of 2027, according to press reports.'],
      ['What is the status of the Diasdev product in Cameroon?', 'According to press reports, Cameroon\'s Caisse des dépôts et consignations (CDEC) is designing this regulated savings product. It is not on sale yet, and the CDEC will not sell it itself.'],
      ['How do I check that a broker is licensed?', 'Look at the list of licensed firms published by the regulator: the AMF-UMOA for the UEMOA (BRVM), the COSUMAF for the CEMAC (BVMAC). For a CEMAC bank, the regulator is the COBAC.'],
      ['Is NIA paid by these institutions?', 'No. NIA receives no payment from the institutions listed in this guide, which contains no affiliate links. NIA\'s transfer comparison tool does use affiliate links, which are disclosed as such.']
    ],
    back: { title: 'Compare the cost of your transfers', text: 'Before saving back home, compare what your family really receives depending on the transfer provider.', link: 'See the transfer corridors →' },
    crumbs: 'Diaspora Guide'
  }
};
