import { describe, expect, it, vi } from 'vitest';
import { calculateSite, processTemplate, createSite } from '../src/site-generator';

export const siteTemplates = {
  base: 'StartBase ##CONTENT## EndBase',
  about: 'AboutContent',
  contact: 'ContactContent',
};

export const site = {
  about: 'StartBase AboutContent EndBase',
  contact: 'StartBase ContactContent EndBase',
}

export const siteFiles = [
  ['index.html', 'StartBase AboutContent EndBase'],
  ['contact.html', 'StartBase ContactContent EndBase'],
];

describe('createSite', () => {
  it('should output site files', async () => {
    const writeSiteFileMock = vi.fn().mockResolvedValue(true);

    await createSite(site, writeSiteFileMock);

    expect(writeSiteFileMock).toHaveBeenNthCalledWith(1, siteFiles[0][0], siteFiles[0][1]);
    expect(writeSiteFileMock).toHaveBeenNthCalledWith(2, siteFiles[1][0], siteFiles[1][1]);
  });
});

describe('calculateSite', () => {
  it('should generate top pages', () => {
    const result = calculateSite(siteTemplates);
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
