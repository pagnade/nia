import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateFiche, sortFiches, oldestCheck, hasTracking, isHttpsUrl, STATUTS } from '../src/lib/guide.js';
import { GUIDE } from '../src/lib/i18n.js';

const data = JSON.parse(readFileSync(new URL('../src/data/guide-diaspora.json', import.meta.url), 'utf8'));

test('guide : chaque fiche a ses champs obligatoires, des énumérations et une date ISO valides', () => {
  for (const f of data.fiches) assert.deepEqual(validateFiche(f), [], `fiche ${f.id}`);
});

test('guide : identifiants uniques', () => {
  const ids = data.fiches.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('guide : chaque source est une URL https absolue, sans paramètre de suivi', () => {
  for (const f of data.fiches) {
    for (const u of [f.source_url, ...(f.sources_complementaires || []).map((s) => s.url)]) {
      assert.ok(isHttpsUrl(u), `${f.id} : ${u}`);
      assert.ok(!hasTracking(u), `${f.id} : ${u}`);
    }
  }
  for (const r of data.meta.regulateurs) if (r.url) assert.ok(isHttpsUrl(r.url), r.id);
});

test('guide : la validation repère les fiches incorrectes', () => {
  const bad = { id: 'Mauvais Id', nom: 'X', categorie: 'crypto', pays: ['SN'], zone: 'UE', statut: 'ouvert', acces_etranger: 'peut-être', source_url: 'http://x.org/?utm_source=a', source_type: 'blog', derniere_verification: '2026-13-40', description_fr: 'a', description_en: 'b' };
  const e = validateFiche(bad);
  for (const k of ['id', 'categorie', 'pays', 'zone', 'statut', 'acces_etranger', 'source_type', 'date', 'https', 'suivi']) assert.ok(e.some((x) => x.includes(k)), `erreur attendue : ${k}`);
  assert.ok(validateFiche({ ...bad, description_fr: '' }).some((x) => x.includes('description_fr')));
});

test('guide : paramètres de suivi détectés', () => {
  for (const u of ['https://a.com/?ref=nia', 'https://a.com/?utm_source=x', 'https://a.com/?aff=1', 'https://a.com/?affiliate=1']) assert.ok(hasTracking(u), u);
  assert.ok(!hasTracking('https://www.brvm.org/pt/societes-de-gestion-d-opcvm?page=1'));
});

test('guide : ordre neutre — statut, puis ordre alphabétique', () => {
  const s = sortFiches([
    { nom: 'Zeta', statut: 'disponible' }, { nom: 'Alpha', statut: 'annonce' },
    { nom: 'beta', statut: 'disponible' }, { nom: 'Gamma', statut: 'en_preparation' }
  ]);
  assert.deepEqual(s.map((f) => f.nom), ['beta', 'Zeta', 'Gamma', 'Alpha']);
  const real = sortFiches(data.fiches);
  for (let i = 1; i < real.length; i++) assert.ok(STATUTS.indexOf(real[i - 1].statut) <= STATUTS.indexOf(real[i].statut));
});

test('guide : la date globale est la plus ancienne vérification', () => {
  assert.equal(oldestCheck([{ derniere_verification: '2026-10-23' }, { derniere_verification: '2026-03-01' }, { derniere_verification: '2026-07-15' }]), '2026-03-01');
  assert.equal(oldestCheck([]), null);
});

test('guide : méta-descriptions de 150 à 160 caractères', () => {
  for (const l of ['fr', 'en']) {
    const n = GUIDE[l].description.length;
    assert.ok(n >= 150 && n <= 160, `${l} : ${n} caractères`);
  }
});
