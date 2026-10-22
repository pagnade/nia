// Génère public/_redirects (Netlify, Cloudflare Pages) : /go/<service> → lien affilié du service.
// Les services sans lien renvoient vers la page de méthode.
import { readFile, writeFile } from 'node:fs/promises';

const providers = JSON.parse(await readFile(new URL('../src/data/providers.json', import.meta.url), 'utf8'));
// « 302! » : la règle passe avant la page de repli /go/<service> générée par Astro (syntaxe Netlify).
const lines = providers.map((p) => `/go/${p.id}  ${p.url || '/comment-ca-marche#partenaires'}  302!`);
await writeFile(new URL('../public/_redirects', import.meta.url), lines.join('\n') + '\n');
console.log(`[redirects] ${lines.length} redirections /go/*`);
