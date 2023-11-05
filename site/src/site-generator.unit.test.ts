import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArticlePropertyKey, SiteContext, SiteGenerator } from './site-generator';
import * as path from 'path';
import { FileService, InputFile, InputFiles } from './file-service';
import { mock, mockPassthrough } from './test/mocking';
import { Reporter } from './reporter';

export const givenContext: SiteContext = {
  siteTitle: 'The Reasonable Programmer',
  siteUrl: 'https://www.example.com',
  year: new Date().getFullYear(),
};

export const givenInputSiteFiles: InputFiles = {
  aboutFile: {
    path: 'about.html',
    content: 'AboutMe',
  },
  blogFiles: [
    { path: '2023-01-01-foo.html', content: 'Foo' },
    { path: '2023-02-02-bar.html', content: 'Bar' },
    { path: '2023-03-03-baz.html', content: 'Baz' },
  ],
  contactFile: {
    path: 'contact.html',
    content: 'ContactContent',
  },
  siteTemplateFile: {
    path: '_site.html',
    content: '##TITLE## StartBase ##CHILD## EndBase ##YEAR##',
  },
};

export const givenSiteFiles: Array<InputFile> = [
  {
    path: 'blog.html',
    content: `${givenContext.siteTitle} StartBase Baz\nBar\nFoo EndBase ${givenContext.year}`,
  },
  {
    path: 'contact.html',
    content: `${givenContext.siteTitle} StartBase ContactContent EndBase ${givenContext.year}`,
  },
  {
    path: 'index.html',
    content: `${givenContext.siteTitle} StartBase AboutMe EndBase ${givenContext.year}`,
  },
  {
    path: 'blog/baz.html',
    content: `${givenContext.siteTitle} StartBase Baz EndBase ${givenContext.year}`,
  },
  {
    path: 'blog/bar.html',
    content: `${givenContext.siteTitle} StartBase Bar EndBase ${givenContext.year}`,
  },
  {
    path: 'blog/foo.html',
    content: `${givenContext.siteTitle} StartBase Foo EndBase ${givenContext.year}`,
  },
];

describe('Site Generation', () => {
  describe('OpenGraph Slug', () => {
    it('should generate minimal OpenGraph slug', async () => {
      const blogInput = `
        ##${ArticlePropertyKey.title}: My Blog##      
        ##${ArticlePropertyKey.description}: A Grand Description##      
        ##${ArticlePropertyKey.image}: img/blog/foo-bar.jpg##      
        FooContent
      `.trim();

      const generator = new SiteGenerator({
        fileService: mock<FileService>({
          readDirectory: vi.fn().mockResolvedValue([{ path: 'foo.html', content: blogInput }]),
        }),
      });
      const results = await generator.generateSection(
        'blog',
        '##OG-SLUG##\n##CHILD##',
        givenContext
      );

      expect(results.articles[0].content).toEqual(
        `
<meta property="og:image" content="https://www.example.com/img/blog/foo-bar.jpg" />
<meta property="og:title" content="My Blog" />
<meta property="og:description" content="A Grand Description" />
<meta property="og:type" content="article" />
<meta property="og:url" content="https://www.example.com/blog/foo.html" />
<meta property="twitter:card" content="summary" />
<meta property="twitter:title" content="My Blog" />
<meta property="twitter:description" content="A Grand Description" />
<meta property="twitter:image" content="https://www.example.com/img/blog/foo-bar.jpg" />
FooContent`.trim()
      );
    });

    it('should generate fully complete OpenGraph slug', async () => {
      const blogInput = `
        ##${ArticlePropertyKey.title}: My Blog##      
        ##${ArticlePropertyKey.description}: A Grand Description##      
        ##${ArticlePropertyKey.image}: img/blog/foo.jpg##      
        ##${ArticlePropertyKey.imageType}: image/jpg##      
        ##${ArticlePropertyKey.imageWidth}: 1024##      
        ##${ArticlePropertyKey.imageHeight}: 1024##      
        FooContent
      `.trim();

      const generator = new SiteGenerator({
        fileService: mock<FileService>({
          readDirectory: vi.fn().mockResolvedValue([{ path: 'foo.html', content: blogInput }]),
        }),
      });
      const results = await generator.generateSection(
        'blog',
        '##OG-SLUG##\n##CHILD##',
        givenContext
      );

      expect(results.articles[0].content).toEqual(
        `
<meta property="og:image" content="https://www.example.com/img/blog/foo.jpg" />
<meta property="og:title" content="My Blog" />
<meta property="og:description" content="A Grand Description" />
<meta property="og:type" content="article" />
<meta property="og:url" content="https://www.example.com/blog/foo.html" />
<meta property="twitter:card" content="summary" />
<meta property="twitter:title" content="My Blog" />
<meta property="twitter:description" content="A Grand Description" />
<meta property="twitter:image" content="https://www.example.com/img/blog/foo.jpg" />
<meta property="og:image:type" content="image/jpg" />
<meta property="og:image:width" content="1024" />
<meta property="og:image:height" content="1024" />
FooContent
`.trim()
      );
    });
  });

  describe('generateSite', () => {
    it('should complete load and generation of site', async () => {
      const mockFileService = mockPassthrough<FileService>(
        {
          writeFile: vi.fn().mockResolvedValue(true),
        },
        new FileService()
      );
      const inputDir = path.join(__dirname, 'test', 'data', 'site');

      const generator = new SiteGenerator({ inputDir, fileService: mockFileService });
      const actualSiteFiles = await generator.generateSite('', givenContext);

      expect(actualSiteFiles.sort()).toEqual(givenSiteFiles.sort());
    });
  });

  describe('generateBlog', () => {
    it('should generate blog', async () => {
      const reporter = new Reporter();
      const reportTracker = reporter.trackReports();

      const generator = new SiteGenerator({
        reporter,
        fileService: mock<FileService>({
          readDirectory: vi.fn().mockResolvedValue([
            { path: '2023-01-01-foo.html', content: 'FOO' },
            { path: '2023-02-02-bar.html', content: 'BAR' },
          ]),
        }),
      });

      const results = await generator.generateSection('blog', 'Articles:\n##CHILD##');

      expect(results.summary).toEqual('Articles:\nBAR\nFOO');
      expect(reportTracker.data).toEqual([
        {
          level: 'warning',
          message: `2023-01-01-foo.html does not have a title. Add "##${ArticlePropertyKey.title}: My Title##" to fix`,
        },
        {
          level: 'warning',
          message: `2023-01-01-foo.html does not have a description. Add "##${ArticlePropertyKey.description}: My Description##" to fix`,
        },
        {
          level: 'warning',
          message: `2023-01-01-foo.html does not have an image. Add "##${ArticlePropertyKey.image}: /img/blog/something.jpg##" to fix`,
        },
        {
          level: 'warning',
          message: `2023-02-02-bar.html does not have a title. Add "##${ArticlePropertyKey.title}: My Title##" to fix`,
        },
        {
          level: 'warning',
          message: `2023-02-02-bar.html does not have a description. Add "##${ArticlePropertyKey.description}: My Description##" to fix`,
        },
        {
          level: 'warning',
          message: `2023-02-02-bar.html does not have an image. Add "##${ArticlePropertyKey.image}: /img/blog/something.jpg##" to fix`,
        },
      ]);
    });
  });
});
