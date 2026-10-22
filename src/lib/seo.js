// Textes propres à chaque couloir, calculés à partir des données : chaque page dit quelque chose d'unique et de daté.
import { compare, midRate, PEG } from './compare.js';
import { T, OPS_L, CCY_L, origin as originOf, dest as destOf, corridorList, fmt, list, dateLong } from './i18n.js';

export const AMOUNTS = [100, 250, 500, 1000];

// Qui agrée les services de transfert dans chaque pays d'envoi (à vérifier sur le registre cité).
const REGULATOR = {
  fr: {
    FR: "En France, un service de transfert doit être agréé par l'ACPR (Banque de France), ou agréé dans un autre pays de l'Union européenne et « passeporté » : vérifiez-le sur REGAFI avant d'envoyer.",
    BE: "En Belgique, les établissements de paiement sont contrôlés par la Banque nationale de Belgique, ou agréés dans un autre pays de l'Union européenne et « passeportés » : vérifiez-le avant d'envoyer.",
    GB: "Au Royaume-Uni, le service doit figurer au registre de la FCA (Financial Conduct Authority) : vérifiez-le avant d'envoyer.",
    US: "Aux États-Unis, les services de transfert doivent être enregistrés auprès du FinCEN et détenir une licence de « money transmitter » dans l'État où vous vivez : vérifiez-le avant d'envoyer.",
    CA: "Au Canada, les entreprises de services monétaires doivent être inscrites auprès du CANAFE (FINTRAC) ; au Québec, une licence de Revenu Québec est aussi exigée : vérifiez-le avant d'envoyer."
  },
  en: {
    FR: 'In France, a money transfer provider must be authorised by the ACPR (Banque de France), or authorised in another EU country and "passported": check it on REGAFI before you send.',
    BE: 'In Belgium, payment institutions are supervised by the National Bank of Belgium, or authorised in another EU country and "passported": check it before you send.',
    GB: 'In the UK, the provider must appear on the FCA (Financial Conduct Authority) register: check it before you send.',
    US: 'In the US, money transfer providers must be registered with FinCEN and hold a money transmitter licence in the state where you live: check it before you send.',
    CA: 'In Canada, money services businesses must be registered with FINTRAC; in Quebec, a Revenu Québec licence is also required: check it before you send.'
  }
};

export function pageMeta(lang, originCode, destCode, best) {
  const o = originOf(lang, originCode), d = destOf(lang, destCode), m = T[lang].meta;
  return {
    title: m.corridorTitle(o, d),
    description: m.corridorDesc(o, d, best?.provider.name, best ? fmt(best.received, 0, lang) : '')
  };
}

export function corridorContent({ providers, quotes, ecb, originCode, destCode, lang = 'fr' }) {
  const o = originOf(lang, originCode), d = destOf(lang, destCode);
  const fr = lang === 'fr';
  const ccy = o.ccy;
  const n = (v, k = 0) => fmt(v, k, lang);
  const base = { providers, quotes, ecb, ccy, dest: destCode, origin: originCode };
  const r100 = compare({ ...base, amount: 100 });
  const all = [r100.best, ...r100.others].filter(Boolean);
  const byAmount = AMOUNTS.map((a) => {
    const r = compare({ ...base, amount: a });
    return { amount: `${n(a)} ${ccy}`, name: r.best?.provider.name ?? '—', received: r.best ? `${n(r.best.received)} ${d.fcfa}` : '—' };
  });
  const free = all.filter((r) => r.fee === 0).map((r) => r.provider.name);
  const fastest = [...all].sort((a, b) => a.provider.delayMin - b.provider.delayMin)[0];
  const wallets = d.ops.filter((x) => !['bank', 'cash'].includes(x));
  const walletCounts = wallets.map((x) => `${OPS_L[lang][x]} (${r100.counts[x]} ${fr ? (r100.counts[x] > 1 ? 'services' : 'service') : (r100.counts[x] > 1 ? 'providers' : 'provider')})`);
  const mid = midRate(ecb, ccy);
  const ecbDate = dateLong(ecb.date, lang);
  const best = r100.best, second = r100.second;
  const pct = (c) => n(Math.max(0, c), 2) + (fr ? ' %' : '%');
  const wl = list(walletCounts, lang);

  const rateLine = ccy === 'EUR'
    ? (fr
      ? `Depuis l'euro, le taux de référence ne bouge jamais : 1 € = ${n(PEG, 3)} ${d.fcfa}, parité fixe garantie par la ${d.bank}. La différence entre services vient uniquement de leur marge de change et de leurs frais.`
      : `From euros, the reference rate never moves: €1 = ${n(PEG, 3)} ${d.fcfa}, a fixed parity guaranteed by the ${d.bank}. The difference between providers comes only from their exchange margin and fees.`)
    : (fr
      ? `Depuis le ${CCY_L.fr[ccy]}, le taux suit le cours de l'euro : 1 ${ccy} vaut ${n(mid, 2)} ${d.fcfa} au taux de référence (BCE du ${ecbDate}, croisé avec la parité ${d.bank}).`
      : `From ${{ GBP: 'pounds sterling', USD: 'US dollars', CAD: 'Canadian dollars' }[ccy]}, the rate follows the euro: 1 ${ccy} is worth ${n(mid, 2)} ${d.fcfa} at the reference rate (European Central Bank, ${ecbDate}, crossed with the ${d.bank} parity).`);

  const servicesLine = !best
    ? (fr ? 'Aucun service suivi ne couvre encore ce couloir.' : 'No provider we track covers this corridor yet.')
    : fr
      ? `${all.length} services suivis par nia couvrent ce couloir. Pour 100 ${ccy}, ${best.provider.name} donne le plus (${n(best.received)} ${d.fcfa})${second ? `, devant ${second.provider.name} (${n(second.received)} ${d.fcfa})` : ''}.${free.length ? ` Sans frais d'envoi : ${list(free, lang)}.` : ''}${fastest ? ` Le plus rapide annoncé : ${fastest.provider.name} (${fastest.provider.delay}).` : ''}`
      : `${all.length} providers tracked by nia cover this corridor. For 100 ${ccy}, ${best.provider.name} gives the most (${n(best.received)} ${d.fcfa})${second ? `, ahead of ${second.provider.name} (${n(second.received)} ${d.fcfa})` : ''}.${free.length ? ` No transfer fee: ${list(free, lang)}.` : ''}${fastest ? ` Fastest advertised: ${fastest.provider.name} (${fastest.provider.delay}).` : ''}`;

  const walletLine = destCode === 'CI'
    ? (fr
      ? `En Côte d'Ivoire, l'argent arrive le plus souvent sur un portefeuille mobile : ${wl}. Wave est très utilisé ; vérifiez que le service choisi verse bien sur le portefeuille de votre proche.`
      : `In Côte d'Ivoire, money usually lands in a mobile wallet: ${wl}. Wave is widely used; make sure the provider pays out to your recipient's wallet.`)
    : (fr
      ? `Au Cameroun, l'argent arrive le plus souvent sur MTN Mobile Money ou Orange Money : ${wl}. Vérifiez que le service choisi verse bien sur le portefeuille de votre proche.`
      : `In Cameroon, money usually lands on MTN Mobile Money or Orange Money: ${wl}. Make sure the provider pays out to your recipient's wallet.`);

  const regulatorLine = REGULATOR[lang][originCode];
  const walletsQ = destCode === 'CI' ? (fr ? 'Wave ou Orange Money' : 'Wave or Orange Money') : (fr ? 'MTN MoMo ou Orange Money' : 'MTN MoMo or Orange Money');

  const faq = fr ? [
    [`Quel est le meilleur service pour envoyer de l'argent ${o.from} ${d.prep} ?`,
      best ? `Au dernier relevé, pour 100 ${ccy}, ${best.provider.name} donne le plus : ${n(best.received)} ${d.fcfa}, coût total ${pct(best.cost)}. Le classement change selon le montant et le portefeuille : utilisez le comparateur ci-dessus.` : 'Aucun service suivi ne couvre encore ce couloir.'],
    [`Combien reçoit-on ${d.prep} pour 100 ${o.ccy === 'EUR' ? '€' : o.ccy} envoyés ?`,
      best ? `Au mieux ${n(best.received)} ${d.fcfa} au dernier relevé, contre ${n(100 * mid)} ${d.fcfa} au taux de référence. L'écart correspond aux frais et à la marge du service.` : 'Pas de service suivi sur ce couloir.'],
    [`Peut-on envoyer ${o.from} vers ${walletsQ} ?`, `Oui. ${wl}. Choisissez le portefeuille dans le comparateur pour ne voir que les services compatibles.`],
    [`Comment savoir si un service est fiable ${o.in} ?`, regulatorLine],
    [`Y a-t-il des frais pour envoyer ${o.from} ${d.prep} ?`,
      free.length ? `Plusieurs services n'en prennent pas : ${list(free, lang)}. Attention : sans frais ne veut pas dire sans coût, la marge de change compte aussi. Regardez le coût total.` : 'Tous les services suivis prennent des frais sur ce couloir : comparez le coût total.']
  ] : [
    [`What is the best way to send money ${o.from} ${d.prep}?`,
      best ? `At the latest check, for 100 ${ccy}, ${best.provider.name} gives the most: ${n(best.received)} ${d.fcfa}, total cost ${pct(best.cost)}. The ranking changes with the amount and the wallet: use the comparison tool above.` : 'No provider we track covers this corridor yet.'],
    [`How much does my family receive in ${d.name} for 100 ${ccy}?`,
      best ? `At best ${n(best.received)} ${d.fcfa} at the latest check, versus ${n(100 * mid)} ${d.fcfa} at the reference rate. The gap is the provider's fees and margin.` : 'No provider tracked on this corridor.'],
    [`Can I send money ${o.from} to ${walletsQ}?`, `Yes. ${wl}. Pick the wallet in the comparison tool to see only compatible providers.`],
    [`How do I know a provider is safe ${o.in}?`, regulatorLine],
    [`Are there fees to send money ${o.from} ${d.prep}?`,
      free.length ? `Several providers charge none: ${list(free, lang)}. But no fee does not mean no cost: the exchange margin counts too. Look at the total cost.` : 'Every provider we track charges a fee on this corridor: compare the total cost.']
  ];

  return { rateLine, servicesLine, walletLine, regulatorLine, byAmount, faq };
}

export function hubRows({ providers, quotes, ecb, lang = 'fr' }) {
  return corridorList(lang).map(({ o, d, path }) => {
    const oo = originOf(lang, o), dd = destOf(lang, d);
    const r = compare({ providers, quotes, ecb, ccy: oo.ccy, dest: d, origin: o, amount: 100 });
    return { href: path, label: `${oo.name} → ${dd.name}`, amount: `100 ${oo.ccy}`, best: r.best ? `${fmt(r.best.received, 0, lang)} ${dd.fcfa}` : '—', name: r.best?.provider.name ?? '—' };
  });
}
