import { describe, it, expect } from 'vitest';
import { document, html } from './helpers.js';

describe('landmark structure', () => {
  it('has a single main, footer, and h1', () => {
    expect(document.querySelectorAll('main').length).toBe(1);
    expect(document.querySelectorAll('footer').length).toBe(1);
    expect(document.querySelectorAll('h1').length).toBe(1);
  });

  it('names the person in the h1', () => {
    expect(document.querySelector('h1').textContent).toBe('Vanshul Goyal');
  });

  it('hides the decorative avatar from assistive tech', () => {
    expect(document.querySelector('.avatar').getAttribute('aria-hidden')).toBe('true');
  });
});

describe('section labelling', () => {
  it('labels the Projects and Connect sections', () => {
    const labels = [...document.querySelectorAll('.section-label')].map((n) => n.textContent.trim());
    expect(labels).toContain('Projects');
    expect(labels).toContain('Connect');
  });
});

describe('project cards', () => {
  it('uses the canonical AdBrain line mark without changing the host palette', () => {
    const mark = document.querySelector('[data-project="adbrain"] svg');
    expect(mark.getAttribute('data-brand')).toBe('adbrain');
    expect(mark.getAttribute('stroke')).toBe('currentColor');
    expect(mark.querySelectorAll('path').length).toBe(8);
    expect(mark.querySelector('path').getAttribute('d')).toBe('M12 18V5');
    expect(mark.closest('.icon').getAttribute('aria-hidden')).toBe('true');
  });

  it('gives every card an icon, label, and sub-text', () => {
    const cards = [...document.querySelectorAll('a.card')];
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.querySelector('.icon')).toBeTruthy();
      expect(card.querySelector('.label')?.textContent.trim()).toBeTruthy();
      expect(card.querySelector('.sub')?.textContent.trim()).toBeTruthy();
    }
  });

  it('uses stable project identities instead of positional styling', () => {
    const cards = [...document.querySelectorAll('a.card')];
    const identities = cards.map((card) => card.getAttribute('data-project'));
    expect(identities).toEqual([
      'games',
      'adbrain',
      'vbrain',
      'solaride',
      'blog',
      'tools',
      'ctx',
      'mcp',
    ]);
    expect(new Set(identities).size).toBe(cards.length);
    expect(html).not.toMatch(/\.card:nth-child\(/);
  });
});

describe('accessible social buttons', () => {
  it('gives each social link a unique, non-empty aria-label', () => {
    const labels = [...document.querySelectorAll('a.social')].map((a) => a.getAttribute('aria-label'));
    expect(labels.every((l) => l && l.trim().length > 0)).toBe(true);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('valid, deduplicated ids', () => {
  it('has no duplicate id attributes', () => {
    const ids = [...document.querySelectorAll('[id]')].map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('wires the dynamic copyright year', () => {
    expect(document.querySelector('#year')).toBeTruthy();
  });
});
