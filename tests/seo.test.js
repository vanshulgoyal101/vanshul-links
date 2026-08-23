import { describe, it, expect } from 'vitest';
import {
  html, document, metaName, metaProp, jsonLd, graphNode, CANONICAL, OG_IMAGE,
} from './helpers.js';

describe('document head basics', () => {
  it('declares the HTML5 doctype', () => {
    expect(html.trimStart().slice(0, 15).toLowerCase()).toBe('<!doctype html>');
  });

  it('sets the document language to English', () => {
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('uses UTF-8 and a responsive viewport', () => {
    expect(document.querySelector('meta[charset]').getAttribute('charset')).toMatch(/utf-8/i);
    expect(metaName('viewport')).toContain('width=device-width');
  });
});

describe('title & description', () => {
  it('has a concise, branded title', () => {
    const title = document.querySelector('title').textContent;
    expect(title).toContain('Vanshul Goyal');
    expect(title.length).toBeLessThanOrEqual(65);
  });

  it('has a description within the ideal SERP length', () => {
    const desc = metaName('description');
    expect(desc).toBeTruthy();
    expect(desc.length).toBeGreaterThanOrEqual(50);
    expect(desc.length).toBeLessThanOrEqual(165);
  });
});

describe('crawl directives & canonical', () => {
  it('is indexable with image/snippet previews', () => {
    const robots = metaName('robots');
    expect(robots).toMatch(/index/);
    expect(robots).toMatch(/follow/);
    expect(robots).not.toMatch(/noindex/);
  });

  it('declares a self-referential canonical URL', () => {
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(CANONICAL);
  });

  it('declares theme-color and color-scheme for dark UAs', () => {
    expect(metaName('theme-color')).toBe('#0e1116');
    expect(metaName('color-scheme')).toBe('dark');
  });
});

describe('Open Graph & Twitter cards', () => {
  it('has the core Open Graph tags', () => {
    expect(metaProp('og:type')).toBe('profile');
    expect(metaProp('og:url')).toBe(CANONICAL);
    expect(metaProp('og:site_name')).toBeTruthy();
    expect(metaProp('og:title')).toContain('Vanshul Goyal');
    expect(metaProp('og:description')).toBeTruthy();
  });

  it('ships an absolute 1200x630 preview image', () => {
    expect(metaProp('og:image')).toBe(OG_IMAGE);
    expect(metaProp('og:image')).toMatch(/^https:\/\//);
    expect(metaProp('og:image:width')).toBe('1200');
    expect(metaProp('og:image:height')).toBe('630');
    expect(metaProp('og:image:alt')).toBeTruthy();
  });

  it('uses a large summary Twitter card with image + alt', () => {
    expect(metaName('twitter:card')).toBe('summary_large_image');
    expect(metaName('twitter:image')).toBe(OG_IMAGE);
    expect(metaName('twitter:image:alt')).toBeTruthy();
  });

  it('attributes the Twitter card to the owner handle', () => {
    expect(metaName('twitter:site')).toBe('@goyal_vanshul');
    expect(metaName('twitter:creator')).toBe('@goyal_vanshul');
  });
});

describe('JSON-LD structured data', () => {
  it('parses and exposes the expected @graph entities', () => {
    const data = jsonLd();
    expect(data['@context']).toBe('https://schema.org');
    const types = data['@graph'].map((n) => n['@type']);
    expect(types).toEqual(
      expect.arrayContaining(['WebSite', 'ProfilePage', 'Person', 'ItemList']),
    );
  });

  it('describes the Person with a rich sameAs profile list', () => {
    const person = graphNode('Person');
    expect(person.name).toBe('Vanshul Goyal');
    expect(person.alternateName).toBe('Curious Ape');
    expect(Array.isArray(person.sameAs)).toBe(true);
    expect(person.sameAs.length).toBeGreaterThanOrEqual(8);
    for (const url of person.sameAs) expect(url).toMatch(/^https:\/\//);
  });

  it('enriches the Person with a knowsAbout topic list for entity SEO', () => {
    const person = graphNode('Person');
    expect(Array.isArray(person.knowsAbout)).toBe(true);
    expect(person.knowsAbout.length).toBeGreaterThanOrEqual(4);
    for (const topic of person.knowsAbout) {
      expect(typeof topic).toBe('string');
      expect(topic.trim().length).toBeGreaterThan(0);
    }
  });

  it('lists projects in sequential, https ItemList order', () => {
    const list = graphNode('ItemList');
    expect(list.itemListElement.length).toBeGreaterThanOrEqual(6);
    list.itemListElement.forEach((item, i) => {
      expect(item['@type']).toBe('ListItem');
      expect(item.position).toBe(i + 1);
      expect(item.url).toMatch(/^https:\/\//);
      expect(item.name).toBeTruthy();
    });
  });

  it('cross-links the page image and internal @id references', () => {
    expect(graphNode('ProfilePage').primaryImageOfPage).toBe(OG_IMAGE);
    expect(graphNode('ProfilePage').about['@id']).toBe(graphNode('Person')['@id']);
    expect(graphNode('WebSite').publisher['@id']).toBe(graphNode('Person')['@id']);
  });
});

describe('performance hints', () => {
  it('preconnects to the analytics origin', () => {
    const pre = document.querySelector('link[rel="preconnect"]');
    expect(pre.getAttribute('href')).toBe('https://vanshul.com');
  });
});
