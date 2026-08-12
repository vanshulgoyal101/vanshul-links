import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import { ROOT } from './helpers.js';

describe('404 page', () => {
  const html = readFileSync(join(ROOT, '404.html'), 'utf8');
  const { document } = parseHTML(html);

  it('is a complete, titled HTML document', () => {
    expect(html.trimStart().slice(0, 15).toLowerCase()).toBe('<!doctype html>');
    expect(document.querySelector('title').textContent).toMatch(/404/);
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('is noindex so soft-404s never get indexed', () => {
    expect(document.querySelector('meta[name="robots"]').getAttribute('content')).toMatch(/noindex/);
  });

  it('canonicalises to the home page and offers a way back', () => {
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe('https://links.vanshul.com/');
    const home = document.querySelector('a.home');
    expect(home).toBeTruthy();
    expect(home.getAttribute('href')).toBe('/');
  });
});

describe('.well-known/security.txt', () => {
  const txt = readFileSync(join(ROOT, '.well-known', 'security.txt'), 'utf8');

  it('exposes a contact channel', () => {
    expect(txt).toMatch(/^Contact:\s*mailto:/m);
  });

  it('has a non-expired Expires field', () => {
    const m = txt.match(/^Expires:\s*(.+)$/m);
    expect(m).toBeTruthy();
    const expires = new Date(m[1].trim());
    expect(Number.isNaN(expires.getTime())).toBe(false);
    expect(expires.getTime()).toBeGreaterThan(Date.now());
  });

  it('declares its canonical location and language', () => {
    expect(txt).toMatch(/^Canonical:\s*https:\/\/links\.vanshul\.com\/\.well-known\/security\.txt$/m);
    expect(txt).toMatch(/^Preferred-Languages:\s*en$/m);
  });
});
