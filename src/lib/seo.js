// Textes propres à chaque couloir, calculés à partir des données : chaque page dit quelque chose d'unique et de daté.
import { compare, midRate, corridorSlug, CCY, DESTS, OPS, ORIGINS, PEG } from './compare.js';
import { fmt } from './view.js';

export const AMOUNTS = [100, 250, 500, 1000];

// Qui agrée les services de transfert dans chaque pays d'envoi (à vérifier sur le registre cité).
const REGULATOR = {
  FR: "En France, un service de transfert doit être agréé par l'ACPR (Banque de France), ou agréé dans un autre pays de l'Union européenne et « passeporté » : vérifiez-le sur REGAFI avant d'envoyer.",
  BE: "En Belgique, les établissements de paiement sont contrôlés par la Banque nationale de Belgique, ou agréés dans un autre pays de l'Union européenne et « passeportés » : vérifiez-le avant d'envoyer.",
  GB: "Au Royaume-Uni, le service doit figurer au registre de la FCA (Financial Conduct Authority) : vérifiez-le avant d'envoyer.",
  US: "Aux États-Unis, les services de transfert doivent être enregistrés auprès du FinCEN et détenir une licence de « money transmitter » dans l'État où vous vivez : vérifiez-le avant d'envoyer.",
  CA: "Au Canada, les entreprises de services monétaires doivent être inscrites auprès du CANAFE (FINTRAC) ; au Québec, une licence de Revenu Québec est aussi exigée : vérifiez-le avant d'envoyer."
};

const list = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} et ${xs.at(-1)}`);

export function pageMeta(origin, dest, best) {
  const title = `Envoyer de l'argent ${origin.from} ${dest.prep} : meilleur taux ${origin.ccy} → ${dest.fcfa} | nia`;
  const ops = dest.code === 'CI' ? 'Wave, Orange Money, MTN, Moov' : 'MTN MoMo, Orange Money';
  const lead = best
    ? `Pour 100 ${origin.ccy} envoyés ${origin.from} ${dest.prep}, le meilleur service donnait ${fmt(best.received)} ${dest.fcfa} (${best.provider.name}) au dernier relevé.`
    : `Comparez les services pour envoyer de l'argent ${origin.from} ${dest.prep}.`;
  return { title, description: `${lead} Comparez frais, délais et réception sur ${ops}.` };
}

export function corridorContent({ providers, quotes, ecb, origin, dest }) {
  const ccy = origin.ccy;
  const base = { providers, quotes, ecb, ccy, dest: dest.code, origin: origin.code };
  const r100 = compare({ ...base, amount: 100 });
  const all = [r100.best, ...r100.others].filter(Boolean);
  const byAmount = AMOUNTS.map((a) => {
    const r = compare({ ...base, amount: a });
    return { amount: `${fmt(a)} ${ccy}`, name: r.best?.provider.name ?? '—', received: r.best ? `${fmt(r.best.received)} ${dest.fcfa}` : '—' };
  });
  const free = all.filter((r) => r.fee === 0).map((r) => r.provider.name);
  const fastest = [...all].sort((a, b) => a.provider.delayMin - b.provider.delayMin)[0];
  const wallets = dest.ops.filter((o) => !['bank', 'cash'].includes(o));
  const walletCounts = wallets.map((o) => `${OPS[o]} (${r100.counts[o]} service${r100.counts[o] > 1 ? 's' : ''})`);
  const mid = midRate(ecb, ccy);

  const rateLine = ccy === 'EUR'
    ? `Depuis l'euro, le taux de référence ne bouge jamais : 1 € = ${fmt(PEG, 3)} ${dest.fcfa}, parité fixe garantie par la ${dest.bank}. La différence entre services vient uniquement de leur marge de change et de leurs frais.`
    : `Depuis le ${CCY[ccy].name}, le taux suit le cours de l'euro : 1 ${ccy} vaut ${fmt(mid, 2)} ${dest.fcfa} au taux de référence (BCE du ${new Date(ecb.date).toLocaleDateString('fr-FR', { dateStyle: 'long' })}, croisé avec la parité ${dest.bank}).`;

  const servicesLine = r100.best
    ? `${all.length} services suivis par nia couvrent ce couloir. Pour 100 ${ccy}, ${r100.best.provider.name} donne le plus (${fmt(r100.best.received)} ${dest.fcfa})${r100.second ? `, devant ${r100.second.provider.name} (${fmt(r100.second.received)} ${dest.fcfa})` : ''}.${free.length ? ` Sans frais d'envoi : ${list(free)}.` : ''}${fastest ? ` Le plus rapide annoncé : ${fastest.provider.name} (${fastest.provider.delay}).` : ''}`
    : `Aucun service suivi ne couvre encore ce couloir.`;

  const walletLine = dest.code === 'CI'
    ? `En Côte d'Ivoire, l'argent arrive le plus souvent sur un portefeuille mobile : ${list(walletCounts)}. Wave est très utilisé ; vérifiez que le service choisi verse bien sur le portefeuille de votre proche.`
    : `Au Cameroun, l'argent arrive le plus souvent sur MTN Mobile Money ou Orange Money : ${list(walletCounts)}. Vérifiez que le service choisi verse bien sur le portefeuille de votre proche.`;

  const faq = [
    [`Quel est le meilleur service pour envoyer de l'argent ${origin.from} ${dest.prep} ?`,
      r100.best ? `Au dernier relevé, pour 100 ${ccy}, ${r100.best.provider.name} donne le plus : ${fmt(r100.best.received)} ${dest.fcfa}, coût total ${fmt(Math.max(0, r100.best.cost), 2)} %. Le classement change selon le montant et le portefeuille : utilisez le comparateur ci-dessus.` : `Aucun service suivi ne couvre encore ce couloir.`],
    [`Combien reçoit-on ${dest.prep} pour 100 ${CCY[ccy].sym} envoyés ?`,
      r100.best ? `Au mieux ${fmt(r100.best.received)} ${dest.fcfa} au dernier relevé, contre ${fmt(100 * mid)} ${dest.fcfa} au taux de référence. L'écart correspond aux frais et à la marge du service.` : `Pas de service suivi sur ce couloir.`],
    [`Peut-on envoyer ${origin.from} vers ${dest.code === 'CI' ? 'Wave ou Orange Money' : 'MTN MoMo ou Orange Money'} ?`,
      `Oui. ${list(walletCounts)}. Choisissez le portefeuille dans le comparateur pour ne voir que les services compatibles.`],
    [`Comment savoir si un service est fiable ${origin.code === 'FR' ? 'en France' : origin.code === 'BE' ? 'en Belgique' : origin.code === 'GB' ? 'au Royaume-Uni' : origin.code === 'US' ? 'aux États-Unis' : 'au Canada'} ?`, REGULATOR[origin.code]],
    [`Y a-t-il des frais pour envoyer ${origin.from} ${dest.prep} ?`,
      free.length ? `Plusieurs services n'en prennent pas : ${list(free)}. Attention : sans frais ne veut pas dire sans coût, la marge de change compte aussi. Regardez le coût total.` : `Tous les services suivis prennent des frais sur ce couloir : comparez le coût total.`]
  ];

  const regulatorLine = REGULATOR[origin.code];
  return { rateLine, servicesLine, walletLine, regulatorLine, byAmount, faq };
}

export function hubRows({ providers, quotes, ecb }) {
  return ORIGINS.flatMap((o) => Object.values(DESTS).map((d) => {
    const r = compare({ providers, quotes, ecb, ccy: o.ccy, dest: d.code, origin: o.code, amount: 100 });
    return { href: `/envoyer/${corridorSlug(o, d)}`, label: `${o.name} → ${d.name}`, amount: `100 ${o.ccy}`, best: r.best ? `${fmt(r.best.received)} ${d.fcfa}` : '—', name: r.best?.provider.name ?? '—' };
  }));
}
