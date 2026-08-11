import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT, CANONICAL } from './helpers.js';

describe('committed sitemap.xml + robots.txt', () => {
  const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
  const robots = readFileSync(join(ROOT, 'robots.txt'), 'utf8');

  it('is a urlset whose only URL is the canonical home page', () => {
    expect(sitemap).toContain('<urlset');
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([CANONICAL]);
  });

  it('allows all crawlers and points them at the sitemap', () => {
    expect(robots).toMatch(/User-agent:\s*\*/);
    expect(robots).toMatch(/Allow:\s*\//);
    expect(robots).toContain('Sitemap: https://links.vanshul.com/sitemap.xml');
  });
});

// Exercise the real generator as a black box so its file->URL mapping,
// exclude rules, and og:image extraction stay covered without refactoring
// the shared script.
describe('gen-sitemap.mjs', () => {
  let dir;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'links-sitemap-'));
    writeFileSync(
      join(dir, 'sitemap.config.json'),
      JSON.stringify({ baseUrl: 'https://example.com/', scanDir: '.', include: ['**/*.html'], updateRobots: true }),
    );
    writeFileSync(
      join(dir, 'index.html'),
      '<html><head><meta property="og:image" content="https://example.com/og.png"></head><body>home</body></html>',
    );
    mkdirSync(join(dir, 'sub'));
    writeFileSync(join(dir, 'sub', 'index.html'), '<html><body>sub</body></html>');
    writeFileSync(join(dir, 'page.html'), '<html><body>page</body></html>');
    writeFileSync(join(dir, '404.html'), '<html><body>not found</body></html>');
    execFileSync(process.execPath, [join(ROOT, 'scripts', 'gen-sitemap.mjs')], { cwd: dir });
  });

  it('maps index.html to a directory URL', () => {
    const xml = readFileSync(join(dir, 'sitemap.xml'), 'utf8');
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml).toContain('<loc>https://example.com/sub/</loc>');
  });

  it('drops the .html extension from non-index pages', () => {
    const xml = readFileSync(join(dir, 'sitemap.xml'), 'utf8');
    expect(xml).toContain('<loc>https://example.com/page</loc>');
  });

  it('excludes 404.html by default', () => {
    const xml = readFileSync(join(dir, 'sitemap.xml'), 'utf8');
    expect(xml).not.toContain('404');
  });

  it('carries an og:image into an <image:image> entry', () => {
    const xml = readFileSync(join(dir, 'sitemap.xml'), 'utf8');
    expect(xml).toContain('<image:loc>https://example.com/og.png</image:loc>');
  });

  it('rewrites the robots.txt sitemap line to match the baseUrl', () => {
    const robots = readFileSync(join(dir, 'robots.txt'), 'utf8');
    expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
  });
});
