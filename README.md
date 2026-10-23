# nia — comparateur de transferts vers le Cameroun et la Côte d'Ivoire

Site bilingue : français (`/`, `/envoyer/…`) et anglais (`/en`, `/en/send-money/…`).

Site statique (Astro) : comparateur interactif, 10 pages de couloirs (5 pays d'envoi × 2 destinations), pages méthode et légales, sitemap, redirections affiliées `/go/<service>`.

## Démarrer en local

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # tests du moteur de comparaison et des imports
npm run build      # données + site statique dans dist/
```

Node **22.23.4 ou plus** (Node 24 recommandé).

## Mettre en ligne (Netlify, gratuit pour démarrer)

1. Mettre ce dossier dans un dépôt GitHub.
2. Sur netlify.com : *Add new site › Import an existing project* › choisir le dépôt. `netlify.toml` règle tout (commande, dossier, Node 24, en‑têtes de sécurité).
3. *Site configuration › Environment variables* :
   - `SITE_URL` = `https://www.votre-domaine.com` (liens canoniques, sitemap)
   - `QUOTES_CSV_URL` = lien CSV de votre Google Sheet de relevés (voir plus bas)
   - `PUBLIC_PLAUSIBLE_DOMAIN` = votre domaine, si vous utilisez Plausible (facultatif)
4. *Domain management* : brancher votre nom de domaine (HTTPS automatique).
5. Mise à jour quotidienne : *Build hooks* › créer un hook, puis dans GitHub › *Settings › Secrets › Actions*, ajouter `NETLIFY_BUILD_HOOK` avec l'URL du hook. Le fichier `.github/workflows/refresh.yml` reconstruit le site chaque jour ouvré.

## Les données

| Donnée | Fichier | Mise à jour |
|---|---|---|
| Taux BCE (USD, GBP, CAD) | `src/data/ecb.json` | Automatique à chaque construction (`scripts/fetch-ecb.mjs`). Si la BCE est injoignable, le dernier fichier est conservé. |
| Parité FCFA | `src/lib/compare.js` | Fixe : 1 EUR = 655,957 XAF / XOF. |
| Services (couverture, portefeuilles, liens affiliés, agréments) | `src/data/providers.json` | À la main. |
| Relevés des services (taux, frais, offres) | Google Sheet → `QUOTES_CSV_URL`, sinon `data/quotes.csv` | À chaque relevé. |

### Format des relevés (une ligne par service × devise × destination)

```
provider,ccy,dest,rate,fee,promo_rate,observed_at,sample
taptap-send,EUR,CM,655.10,0,,2026-10-23T09:00:00Z,0
```

- `provider` : l'`id` du service dans `providers.json`
- `ccy` : EUR, GBP, USD ou CAD — `dest` : CM ou CI
- `rate` : FCFA reçus pour 1 unité envoyée, **hors** offre de bienvenue
- `fee` : frais dans la devise d'envoi
- `promo_rate` : taux du premier envoi s'il existe, sinon vide
- `observed_at` : date et heure du relevé (ISO 8601)
- `sample` : `1` pour une donnée d'exemple, `0` pour un vrai relevé
- `origin` (colonne facultative) : `FR`, `BE`, `GB`, `US` ou `CA` si le taux ne vaut que depuis ce pays. Sans elle, le relevé vaut pour tous les pays qui envoient dans cette devise (France et Belgique pour l'euro). Un relevé avec `origin` l'emporte sur le relevé général.

Google Sheets : *Fichier › Partager › Publier sur le web › format CSV* → copier le lien dans `QUOTES_CSV_URL`. Les lignes invalides sont ignorées et signalées dans le journal de construction.

**Tant qu'une seule ligne a `sample = 1`, le site affiche un bandeau « données d'exemple » et demande à Google de ne pas l'indexer (`noindex`).** L'indexation s'ouvre automatiquement dès que tous les relevés sont réels. `data/quotes.csv` ne contient aujourd'hui que des données d'exemple.

## Liens affiliés

Dans `providers.json`, remplacer chaque `url` par le lien de suivi fourni par le programme d'affiliation (`null` = pas de lien : le bouton est masqué et `/go/<id>` renvoie vers la page méthode). Les redirections sont générées dans `public/_redirects` à chaque construction.

## Avant d'ouvrir au public

- [ ] Vrais relevés (`sample = 0`) et date de relevé à jour — tant que ce n'est pas fait, le site n'est pas indexé par Google
- [ ] Inscrire le site sur Google Search Console et y déclarer `/sitemap.xml` (après avoir défini `SITE_URL`)
- [ ] Liens affiliés réels, liste des partenaires dans `src/pages/comment-ca-marche.astro`
- [ ] Agréments des services non vérifiés (`licence` dans `providers.json`)
- [ ] Mentions légales et confidentialité : remplacer les passages surlignés `[…]`
- [ ] Vérifier avec un juriste l'information sur le classement et la rémunération (Code de la consommation, art. L111‑7)
- [ ] Marque « nia » (INPI, EUIPO) et nom de domaine
- [ ] Guide Diaspora : URL officielles de l'AMF-UMOA et de la COBAC (`url: null` dans `src/data/guide-diaspora.json`), fiches `a_verifier`, relecture de l'anglais par une personne de langue maternelle anglaise, validation du texte par un juriste

## Structure

```
src/lib/compare.js      moteur de comparaison (partagé navigateur / génération)
src/lib/view.js         rendu HTML des résultats
src/lib/i18n.js         tous les textes FR / EN, noms de pays, adresses des pages
src/lib/seo.js          textes propres à chaque couloir, titres et descriptions
src/lib/guide.js        Guide Diaspora : validation des fiches, tri neutre, date globale
src/data/guide-diaspora.json  fiches du Guide Diaspora (sources, dates de vérification)
src/components/         Landing (page comparateur), GuidePage, Header, Footer, Logo
src/pages/              accueil, /envoyer/<couloir>, méthode, légal, /go/<service>, sitemap, robots
scripts/                fetch-ecb, import-quotes, build-redirects
test/                   tests (node --test)
```

## Version anglaise

- Tous les textes sont dans `src/lib/i18n.js` (`T.fr` et `T.en`) : pour changer une phrase, la modifier dans les deux langues.
- Adresses anglaises : `/en`, `/en/send-money`, `/en/send-money/uk-to-cameroon`, `/en/how-it-works`, `/en/legal-notice`, `/en/privacy`.
- Chaque page déclare sa traduction (balises `hreflang`) : Google montre la bonne langue au bon public.
- L'accueil anglais part du couloir Royaume-Uni → Cameroun ; l'accueil français, de France → Cameroun.
- Les mentions légales anglaises renvoient à la version française, qui fait foi.

## Guide Diaspora

Pages `/guide-diaspora` et `/en/diaspora-guide` : information indépendante sur l'épargne et l'investissement depuis l'étranger. Aucun lien affilié, aucun paramètre de suivi, aucun bouton d'action : le seul lien d'une fiche est sa source.

- Les fiches sont dans `src/data/guide-diaspora.json`, les textes de la page dans `GUIDE` (`src/lib/i18n.js`).
- Champs d'une fiche : `id`, `nom`, `categorie`, `pays`, `zone`, `statut`, `acces_etranger`, `minimum` (`{ montant, devise }` ou `null`), `source_url`, `source_type`, `derniere_verification` (AAAA-MM-JJ), `description_fr/en`, `a_savoir_fr/en`. Ajouts : `sources_complementaires` (`[{ url, type }]`), `renvois` (catégories où la fiche est aussi signalée), `echeance_fr/en` (pour « À surveiller »).
- La date affichée en haut de page est la plus ancienne des `derniere_verification` : mettre à jour la date d'une fiche seulement après avoir relu sa source.
- Ordre d'affichage : statut, puis ordre alphabétique — jamais de classement.
- `npm test` vérifie les fiches (`test/guide.test.mjs`) et le HTML construit (`test/site.test.mjs`, qui construit le site dans un dossier temporaire) : mots interdits, liens de suivi, hreflang, sitemap, menu, bloc « Aller plus loin » sur les couloirs.
