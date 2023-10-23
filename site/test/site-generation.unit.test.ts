import { describe, expect, it, vi } from 'vitest';
import { _calculateSiteFromTemplates, _processTemplate, createSite } from '../src/site-generator';

export const givenSiteTemplates = {
  base: 'StartBase ##CONTENT## EndBase',
  about: 'AboutContent',
  contact: 'ContactContent',
};

export const givenSite = {
  about: 'StartBase AboutContent EndBase',
  contact: 'StartBase ContactContent EndBase',
}

export const givenSiteFiles =[
  ['index.html', 'StartBase AboutContent EndBase'],
  ['contact.html', 'StartBase ContactContent EndBase'],
];

describe('createSite', () => {
  it('should output site files', async () => {
    const writeSiteFileMock = vi.fn().mockResolvedValue(true);

    await createSite(givenSite, writeSiteFileMock);

    expect(writeSiteFileMock).toHaveBeenNthCalledWith(1, ...givenSiteFiles[0]);
    expect(writeSiteFileMock).toHaveBeenNthCalledWith(2, ...givenSiteFiles[1]);
  });
});

describe('calculateSite', () => {
  it('should generate top pages', () => {
    const result = _calculateSiteFromTemplates(givenSiteTemplates);
    expect(result).toEqual(expect.objectContaining(givenSite));
  });
});

describe('processTemplate', () => {
  it('should be case-insensitive for input values', () => {
    const result = _processTemplate('Hello, ##name##');
    expect(result.inputMarkers).toEqual(['NAME']);
  });

  it('should detect multiple input values', () => {
    const text = 'Hello, ##FIRST_NAME## ##LAST_NAME##';

    const result = _processTemplate('Hello, ##FIRST_NAME## ##LAST_NAME##');

    expect(result).toEqual(
      expect.objectContaining({
        text,
        inputMarkers: ['FIRST_NAME', 'LAST_NAME'],
      })
    );
  });

  it('should substitute different values', () => {
    const result = _processTemplate('##greETing##, ##NAME##', {
      greeting: 'Hello',
      name: 'Jason',
    });

    expect(result.text).toBe('Hello, Jason');
  });

  it('should substitute all values', () => {
    const result = _processTemplate('##NAME## ##NAME## ##NAME##', {
      name: 'Malkovich',
    });

    expect(result.text).toBe('Malkovich Malkovich Malkovich');
  });

  it('should detect output values', () => {
    const result = _processTemplate('Hello, World\n##TITLE: Foo##\n##age: 43##');

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
