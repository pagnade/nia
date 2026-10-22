import { defineConfig } from 'astro/config';

// URL publique du site (liens canoniques, sitemap). À définir chez l'hébergeur :
// SITE_URL=https://www.votre-domaine.com
const site = process.env.SITE_URL || undefined;
if (!site) console.warn('[nia] SITE_URL non définie : pas d\'URL canonique ni de sitemap complet.');

export default defineConfig({
  site,
  trailingSlash: 'never',
  build: { format: 'directory' }
});
