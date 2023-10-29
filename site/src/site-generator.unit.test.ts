import { describe, expect, it, vi } from 'vitest';
import { Site, SiteContext, generateSite } from './site-generator';
import * as path from 'path';
import { FileService, SiteFile, SiteFiles } from './file-service';
import { mockPassthrough } from './test/mocking';

export const givenContext: SiteContext = {
  title: 'The Reasonable Programmer',
  year: new Date().getFullYear(),
};

export const givenInputSiteFiles: SiteFiles = {
  about: {
    path: 'about.html',
    content: 'AboutMe',
  },
  blogPosts: [
    { path: '2023-01-01-foo.html', content: 'foo' },
    { path: '2023-02-02-bar.html', content: 'bar' },
    { path: '2023-03-03-baz.html', content: 'baz' },
  ],
  contact: {
    path: 'contact.html',
    content: 'ContactContent',
  },
  siteTemplate: {
    path: '_site.html',
    content: '##TITLE## StartBase ##CONTENT## EndBase ##YEAR##',
  },
};

export const givenSite: Site = {
  about: `${givenContext.title} StartBase AboutMe EndBase ${givenContext.year}`,
  blog: `${givenContext.title} StartBase Foo\nBar\nBaz EndBase ${givenContext.year}`,
  blogPosts: [
    {
      fileName: 'foo',
      content: `${givenContext.title} StartBase Foo EndBase ${givenContext.year}`,
      originalDate: new Date(2023, 1, 1),
    },
    {
      fileName: 'bar',
      content: `${givenContext.title} StartBase Bar EndBase ${givenContext.year}`,
      originalDate: new Date(2023, 2, 2),
    },
    {
      fileName: 'baz',
      content: `${givenContext.title} StartBase Baz EndBase ${givenContext.year}`,
      originalDate: new Date(2023, 3, 3),
    },
  ],
  contact: `${givenContext.title} StartBase ContactContent EndBase ${givenContext.year}`,
};

export const givenSiteFiles: Array<SiteFile> = [
  { path: 'blog.html', content: givenSite.blog },
  { path: 'contact.html', content: givenSite.contact },
  { path: 'index.html', content: givenSite.about },
  { path: 'posts/foo.html', content: givenSite.blogPosts[0].content },
  { path: 'posts/bar.html', content: givenSite.blogPosts[1].content },
  { path: 'posts/baz.html', content: givenSite.blogPosts[2].content },
];

describe('Site Generation', () => {
  it('should complete load and generation of site', async () => {
    const mockFileService = mockPassthrough<FileService>(
      {
        writeFile: vi.fn().mockResolvedValue(true),
      },
      new FileService()
    );

    const inputDir = path.join(__dirname, 'test', 'data', 'site');
    const siteResults = await generateSite(inputDir, '', givenContext, mockFileService);

    expect(siteResults.site).toEqual(givenSite);
    expect(siteResults.siteFiles.sort()).toEqual(givenSiteFiles.sort());
  });
});
