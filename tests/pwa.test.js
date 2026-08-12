import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, document, metaName } from './helpers.js';

const read = (f) => readFileSync(join(ROOT, f), 'utf8');
const manifest = JSON.parse(read('manifest.webmanifest'));

describe('web app manifest', () => {
  it('is valid JSON with the core installability fields', () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#0e1116');
  });

  it('keeps the manifest theme-color in sync with the page', () => {
    expect(manifest.theme_color).toBe(metaName('theme-color'));
  });

  it('declares svg + 192 + 512 icons that all exist on disk', () => {
    const bySize = Object.fromEntries(manifest.icons.map((i) => [i.sizes, i]));
    expect(bySize['any'].src).toBe('/icon.svg');
    expect(bySize['192x192'].src).toBe('/icon-192.png');
    expect(bySize['512x512'].src).toBe('/icon-512.png');
    for (const icon of manifest.icons) {
      expect(existsSync(join(ROOT, icon.src.replace(/^\//, ''))), `${icon.src} missing`).toBe(true);
    }
  });

  it('ships at least one maskable icon', () => {
    expect(manifest.icons.some((i) => (i.purpose ?? '').includes('maskable'))).toBe(true);
  });
});

describe('icon assets', () => {
  const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  it.each(['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'])(
    '%s is a real, non-empty PNG',
    (file) => {
      const buf = readFileSync(join(ROOT, file));
      expect(buf.length).toBeGreaterThan(0);
      expect(buf.subarray(0, 8).equals(PNG_SIG)).toBe(true);
    },
  );

  it('icon.svg is valid, square SVG source', () => {
    const svg = read('icon.svg');
    expect(svg).toMatch(/<svg[^>]*viewBox="0 0 512 512"/);
    expect(svg).toContain('</svg>');
  });
});

describe('service worker', () => {
  const sw = read('sw.js');

  it('handles install, activate, and fetch', () => {
    for (const ev of ['install', 'activate', 'fetch']) {
      expect(sw).toContain(`addEventListener('${ev}'`);
    }
  });

  it('uses a versioned cache name', () => {
    expect(sw).toMatch(/const CACHE = '[^']+'/);
  });

  it('never intercepts cross-origin requests', () => {
    expect(sw).toContain('url.origin !== self.location.origin');
  });
});

describe('PWA wiring in the document head', () => {
  it('links the manifest and apple-touch-icon', () => {
    expect(document.querySelector('link[rel="manifest"]').getAttribute('href')).toBe('/manifest.webmanifest');
    expect(document.querySelector('link[rel="apple-touch-icon"]').getAttribute('href')).toBe('/apple-touch-icon.png');
  });

  it('declares the mobile web-app meta tags', () => {
    expect(metaName('apple-mobile-web-app-capable')).toBe('yes');
    expect(metaName('mobile-web-app-capable')).toBe('yes');
    expect(metaName('application-name')).toBeTruthy();
  });

  it('registers the service worker', () => {
    const html = read('index.html');
    expect(html).toContain("serviceWorker' in navigator");
    expect(html).toContain("register('/sw.js')");
  });
});
