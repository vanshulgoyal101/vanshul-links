import { describe, it, expect } from 'vitest';
import { document } from './helpers.js';

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
  it('gives every card an icon, label, and sub-text', () => {
    const cards = [...document.querySelectorAll('a.card')];
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.querySelector('.icon')).toBeTruthy();
      expect(card.querySelector('.label')?.textContent.trim()).toBeTruthy();
      expect(card.querySelector('.sub')?.textContent.trim()).toBeTruthy();
    }
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
