// Récupère les taux de référence quotidiens de la BCE (USD, GBP, CAD pour 1 EUR).
// En cas d'échec réseau, garde le dernier fichier connu : la construction du site ne doit jamais casser.
import { readFile, writeFile } from 'node:fs/promises';

const ECB_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
const OUT = new URL('../src/data/ecb.json', import.meta.url);
const WANTED = ['USD', 'GBP', 'CAD'];

export function parseEcbXml(xml) {
  const date = xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1];
  const rates = {};
  for (const m of xml.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) {
    if (WANTED.includes(m[1])) rates[m[1]] = Number(m[2]);
  }
  if (!date || WANTED.some((c) => !(rates[c] > 0))) throw new Error('Réponse BCE incomplète');
  return { date, rates };
}

async function main() {
  try {
    const res = await fetch(ECB_URL, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { date, rates } = parseEcbXml(await res.text());
    const data = { date, source: "BCE — taux de référence de l'euro", fetchedAt: new Date().toISOString(), rates };
    await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
    console.log(`[ecb] taux du ${date} enregistrés`);
  } catch (err) {
    const prev = JSON.parse(await readFile(OUT, 'utf8'));
    console.warn(`[ecb] échec (${err.message}) — on garde les taux du ${prev.date}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
