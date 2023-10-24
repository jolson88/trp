import { describe, expect, it, vi } from 'vitest';
import { Site, SiteContext, _processTemplate, createSite } from '../src/site-generator';

export const givenContext: SiteContext = {
  title: 'The Reasonable Programmer',
  year: new Date().getFullYear(),
}

export const givenSite: Site = {
  about: `${givenContext.title} StartBase ${givenContext.title} EndBase ${givenContext.year}`,
  blog: `${givenContext.title} StartBase BlogContent EndBase ${givenContext.year}`,
  contact: `${givenContext.title} StartBase ContactContent EndBase ${givenContext.year}`,
}

export const givenSiteFiles = [
  ['blog.html', givenSite.blog],
  ['contact.html', givenSite.contact],
  ['index.html', givenSite.about],
];

describe('createSite', () => {
  it('should output site files', async () => {
    const writeSiteFileMock = vi.fn().mockResolvedValue(true);

    const actualSiteFiles = await createSite(givenSite, '', writeSiteFileMock);

    expect(actualSiteFiles.sort()).toEqual(givenSiteFiles.sort());
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
