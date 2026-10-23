// Tests sur le site construit : on le construit une fois dans un dossier temporaire, avec une URL de site
// (sans elle, ni hreflang ni sitemap ne sont générés).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORBIDDEN, hasTracking, oldestCheck } from '../src/lib/guide.js';
import { GUIDE, T, dateLong } from '../src/lib/i18n.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://nia.test';
const data = JSON.parse(readFileSync(join(ROOT, 'src/data/guide-diaspora.json'), 'utf8'));
let out;
const page = (p) => readFileSync(join(out, p, 'index.html'), 'utf8');

before(() => {
  out = mkdtempSync(join(tmpdir(), 'nia-build-'));
  if (!existsSync(join(ROOT, 'src/data/quotes.json'))) execFileSync(process.execPath, ['scripts/import-quotes.mjs'], { cwd: ROOT });
  execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', out], {
    cwd: ROOT, env: { ...process.env, SITE_URL: SITE }, stdio: 'pipe'
  });
});
after(() => rmSync(out, { recursive: true, force: true }));

const visibleText = (html) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
const hrefs = (html) => [...html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
const wordRe = (w) => new RegExp(`(?<![\\p{L}\\p{N}])${w.replace(/\s+/g, '\\s+')}(?![\\p{L}\\p{N}])`, 'iu');

test('les pages /guide-diaspora et /en/diaspora-guide se construisent', () => {
  assert.match(page('guide-diaspora'), /<html lang="fr">/);
  assert.match(page('en/diaspora-guide'), /<html lang="en">/);
});

test('aucun lien du guide ne contient de paramètre affilié ou de suivi', () => {
  for (const p of ['guide-diaspora', 'en/diaspora-guide']) {
    for (const h of hrefs(page(p))) {
      assert.ok(!hasTracking(h), `${p} : ${h}`);
      assert.ok(!h.startsWith('/go/'), `${p} : lien de redirection affiliée ${h}`);
    }
  }
});

test('les liens sources s\'ouvrent dans un nouvel onglet avec rel="nofollow noopener noreferrer"', () => {
  const html = page('guide-diaspora');
  for (const f of data.fiches) {
    const tag = html.match(new RegExp(`<a[^>]*href="${f.source_url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`))?.[0];
    assert.ok(tag, `lien source de ${f.id}`);
    assert.match(tag, /target="_blank"/);
    assert.match(tag, /rel="nofollow noopener noreferrer"/);
  }
});

test('aucun mot interdit dans le HTML rendu des deux versions (mots entiers, sans casse)', () => {
  for (const p of ['guide-diaspora', 'en/diaspora-guide']) {
    const text = visibleText(page(p));
    for (const w of [...FORBIDDEN.fr, ...FORBIDDEN.en]) assert.ok(!wordRe(w).test(text), `${p} contient « ${w} »`);
  }
});

test('le sous-titre d\'indépendance est présent dans les deux langues', () => {
  assert.ok(visibleText(page('guide-diaspora')).includes(GUIDE.fr.independence));
  assert.ok(visibleText(page('en/diaspora-guide')).includes(GUIDE.en.independence));
});

test('pas de texte de l\'autre langue sur chaque version du guide', () => {
  const fr = visibleText(page('guide-diaspora')), en = visibleText(page('en/diaspora-guide'));
  for (const k of ['independence', 'h1']) {
    assert.ok(!fr.includes(GUIDE.en[k]), `anglais sur la page française : ${k}`);
    assert.ok(!en.includes(GUIDE.fr[k]), `français sur la page anglaise : ${k}`);
  }
  for (const f of data.fiches) {
    assert.ok(!en.includes(f.description_fr), `description française sur la page anglaise : ${f.id}`);
    assert.ok(!fr.includes(f.description_en), `description anglaise sur la page française : ${f.id}`);
  }
});

test('la date globale affichée est la plus ancienne des dates de vérification', () => {
  const oldest = oldestCheck(data.fiches);
  assert.ok(visibleText(page('guide-diaspora')).includes(GUIDE.fr.checked(dateLong(oldest, 'fr'))));
  assert.ok(visibleText(page('en/diaspora-guide')).includes(GUIDE.en.checked(dateLong(oldest, 'en'))));
});

test('hreflang réciproques et présence dans le plan du site', () => {
  const fr = page('guide-diaspora'), en = page('en/diaspora-guide');
  for (const html of [fr, en]) {
    assert.ok(html.includes(`<link rel="alternate" hreflang="fr" href="${SITE}/guide-diaspora">`));
    assert.ok(html.includes(`<link rel="alternate" hreflang="en" href="${SITE}/en/diaspora-guide">`));
  }
  const sitemap = readFileSync(join(out, 'sitemap.xml'), 'utf8');
  assert.ok(sitemap.includes(`<loc>${SITE}/guide-diaspora</loc>`));
  assert.ok(sitemap.includes(`<loc>${SITE}/en/diaspora-guide</loc>`));
});

test('le sélecteur de langue mène d\'une version du guide à l\'autre', () => {
  assert.match(page('guide-diaspora'), /class="lang-switch" href="\/en\/diaspora-guide"/);
  assert.match(page('en/diaspora-guide'), /class="lang-switch" href="\/guide-diaspora"/);
});

test('l\'onglet du guide est le dernier du menu, avant le sélecteur de langue', () => {
  for (const [p, l] of [['guide-diaspora', 'fr'], ['envoyer/france-cameroun', 'fr'], ['en/diaspora-guide', 'en'], ['en', 'en']]) {
    const nav = page(p).match(/<div class="nav__links">([\s\S]*?)<\/div>/)[1];
    const links = hrefs(nav);
    assert.equal(links.at(-2), l === 'fr' ? '/guide-diaspora' : '/en/diaspora-guide', p);
  }
});

test('le bloc « Aller plus loin » est sur chaque page de couloir, dans la bonne langue', () => {
  const check = (dir, lang, guide) => {
    const slugs = readdirSync(join(out, dir), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
    assert.equal(slugs.length, 10, dir);
    for (const s of slugs) {
      const html = page(`${dir}/${s}`);
      const text = visibleText(html);
      assert.ok(text.includes(T[lang].further.text), `${dir}/${s}`);
      assert.ok(!text.includes(T[lang === 'fr' ? 'en' : 'fr'].further.text), `${dir}/${s} : autre langue`);
      assert.match(html, new RegExp(`data-further[\\s\\S]*?href="${guide}"`), `${dir}/${s} : lien`);
    }
  };
  check('envoyer', 'fr', '/guide-diaspora');
  check('en/send-money', 'en', '/en/diaspora-guide');
});

test('pas de schéma FinancialProduct sur le guide', () => {
  for (const p of ['guide-diaspora', 'en/diaspora-guide']) assert.ok(!page(p).includes('FinancialProduct'));
});
