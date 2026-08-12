import { describe, it, expect } from 'vitest';
import { extractLinks, checkable, SKIP_HOSTS } from '../scripts/check-links.mjs';
import { html } from './helpers.js';

describe('extractLinks', () => {
  it('collects http(s) hrefs, deduped, ignoring mailto and anchors', () => {
    const sample =
      '<a href="https://a.com">a</a>' +
      '<a href="mailto:x@y.z">m</a>' +
      '<a href="#s">s</a>' +
      '<a class="x" href="https://a.com">dup</a>';
    expect(extractLinks(sample)).toEqual(['https://a.com']);
  });

  it('finds every external destination in index.html', () => {
    const links = extractLinks(html);
    expect(links).toContain('https://vanshul.com');
    expect(links).toContain('https://github.com/vanshulgoyal101');
    expect(links.length).toBeGreaterThanOrEqual(9);
  });
});

describe('checkable', () => {
  it('drops bot-hostile social hosts', () => {
    const urls = [
      'https://vanshul.com',
      'https://x.com/goyal_vanshul',
      'https://www.linkedin.com/in/vanshul-goyal00/',
      'https://www.instagram.com/vanshul_goyal/',
    ];
    expect(checkable(urls)).toEqual(['https://vanshul.com']);
  });

  it('keeps owned domains and GitHub', () => {
    const urls = ['https://games.vanshul.com', 'https://github.com/vanshulgoyal101'];
    expect(checkable(urls)).toEqual(urls);
  });

  it('every skipped host is a known social platform', () => {
    for (const host of SKIP_HOSTS) expect(host).toMatch(/x\.com|twitter|linkedin|instagram/);
  });
});
