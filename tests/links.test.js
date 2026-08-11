import { describe, it, expect } from 'vitest';
import { html, document, anchors, FORBIDDEN_DOMAINS } from './helpers.js';

const href = (el) => el.getAttribute('href');

const FEATURED = 'https://vanshul.com';
const PROJECTS = new Set([
  'https://games.vanshul.com',
  'https://blog.vanshul.com',
  'https://tools.vanshul.com',
  'https://ctx.vanshul.com',
  'https://mcp.vanshul.com',
  'https://solaride.in',
]);
const SOCIALS = new Set([
  'https://github.com/vanshulgoyal101',
  'https://x.com/goyal_vanshul',
  'https://www.linkedin.com/in/vanshul-goyal00/',
  'https://www.instagram.com/vanshul_goyal/',
  'mailto:vanshulg101@gmail.com',
]);

describe('link safety', () => {
  it('opens every new-tab link with rel=noopener', () => {
    for (const a of anchors()) {
      if (a.getAttribute('target') === '_blank') {
        expect(a.getAttribute('rel') ?? '', `${href(a)} missing rel`).toContain('noopener');
      }
    }
  });

  it('uses only https (or mailto) — never insecure http', () => {
    expect(html).not.toMatch(/href="http:\/\//);
    expect(html).not.toMatch(/src="http:\/\//);
    for (const a of anchors()) {
      const h = href(a);
      expect(h === '' || h.startsWith('https://') || h.startsWith('mailto:')).toBe(true);
    }
  });
});

describe('link inventory', () => {
  it('features the portfolio as the first, highlighted link', () => {
    const featured = document.querySelector('a.featured');
    expect(featured).toBeTruthy();
    expect(href(featured)).toBe(FEATURED);
  });

  it('lists exactly the expected live project cards', () => {
    const cards = new Set([...document.querySelectorAll('a.card')].map(href));
    expect(cards).toEqual(PROJECTS);
  });

  it('lists exactly the expected social profiles', () => {
    const socials = new Set([...document.querySelectorAll('a.social')].map(href));
    expect(socials).toEqual(SOCIALS);
  });

  it('marks self-owned profiles with rel=me for identity verification', () => {
    for (const a of document.querySelectorAll('a.social')) {
      expect((a.getAttribute('rel') ?? '').split(/\s+/)).toContain('me');
    }
  });
});

describe('no dead or unlaunched destinations', () => {
  it('never links a domain that is not live', () => {
    for (const domain of FORBIDDEN_DOMAINS) {
      expect(html, `${domain} must not be linked`).not.toContain(domain);
    }
  });
});
