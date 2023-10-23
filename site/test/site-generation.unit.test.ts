import { describe, expect, it } from 'vitest';
import { calculateSiteFiles, calculateSiteContent, processTemplate } from '../src/site-generator';

const siteTemplates = {
  base: 'StartBase ##CONTENT## EndBase',
  about: 'AboutContent',
  blog: 'BlogContent',
  contact: 'ContactContent',
};

const site = {
  about: 'StartBase AboutContent EndBase',
  blog: 'StartBase BlogContent EndBase',
  contact: 'StartBase ContactContent EndBase',
}

const siteFiles = [
  ['index.html', 'StartBase AboutContent EndBase'],
  ['contact.html', 'StartBase ContactContent EndBase'],
  ['blog/index.html', 'StartBase BlogContent EndBase'],
];


describe('calculateSiteFiles', () => {
  it('should calculate output files', () => {
    const files = calculateSiteFiles(site);
    expect(files).toEqual(expect.arrayContaining(siteFiles));
  });
});

describe('calculateSiteContent', () => {
  it('should generate top pages', () => {
    const result = calculateSiteContent(siteTemplates);
    expect(result).toEqual(expect.objectContaining(site));
  });
});

describe('processTemplate', () => {
  it('should be case-insensitive for input values', () => {
    const result = processTemplate('Hello, ##name##');
    expect(result.inputMarkers).toEqual(['NAME']);
  });

  it('should detect multiple input values', () => {
    const text = 'Hello, ##FIRST_NAME## ##LAST_NAME##';

    const result = processTemplate('Hello, ##FIRST_NAME## ##LAST_NAME##');

    expect(result).toEqual(
      expect.objectContaining({
        text,
        inputMarkers: ['FIRST_NAME', 'LAST_NAME'],
      })
    );
  });

  it('should substitute different values', () => {
    const result = processTemplate('##greETing##, ##NAME##', {
      greeting: 'Hello',
      name: 'Jason',
    });

    expect(result.text).toBe('Hello, Jason');
  });

  it('should substitute all values', () => {
    const result = processTemplate('##NAME## ##NAME## ##NAME##', {
      name: 'Malkovich',
    });

    expect(result.text).toBe('Malkovich Malkovich Malkovich');
  });

  it('should detect output values', () => {
    const result = processTemplate('Hello, World\n##TITLE: Foo##\n##age: 43##');

    expect(result).toEqual(
      expect.objectContaining({
        text: 'Hello, World',
        outputMarkers: [
          ['TITLE', 'Foo'],
          ['AGE', '43'],
        ],
      })
    );
  });
});
