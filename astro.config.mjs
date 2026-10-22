import { defineConfig } from 'astro/config';

// URL publique du site (utilisée pour les liens canoniques et le sitemap).
// À définir dans l'hébergeur : SITE_URL=https://www.votre-domaine.com
export default defineConfig({
  site: process.env.SITE_URL || 'https://nia.example',
  trailingSlash: 'never',
  build: { format: 'directory' }
});
