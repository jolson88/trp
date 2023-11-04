import { describe, expect, it, vi } from 'vitest';
import { ArticlePropertyKey, SiteContext, generateBlog, generateSite } from './site-generator';
import * as path from 'path';
import { FileService, InputFile, InputFiles } from './file-service';
import { mockPassthrough } from './test/mocking';
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
    { path: '2023-01-01-foo.html', content: 'Foo - ##URL##' },
    { path: '2023-02-02-bar.html', content: 'Bar - ##URL##' },
    { path: '2023-03-03-baz.html', content: 'Baz - ##URL##' },
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
    content: `${givenContext.siteTitle} StartBase Baz - posts/baz.html\nBar - posts/bar.html\nFoo - posts/foo.html EndBase ${givenContext.year}`,
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
    path: 'posts/baz.html',
    content: `${givenContext.siteTitle} StartBase Baz - posts/baz.html EndBase ${givenContext.year}`,
  },
  {
    path: 'posts/bar.html',
    content: `${givenContext.siteTitle} StartBase Bar - posts/bar.html EndBase ${givenContext.year}`,
  },
  {
    path: 'posts/foo.html',
    content: `${givenContext.siteTitle} StartBase Foo - posts/foo.html EndBase ${givenContext.year}`,
  },
];

describe('Site Generation', () => {
  describe('OpenGraph Slug', () => {
    it('should generate minimal OpenGraph slug', () => {
      const blogInput = `
        ##${ArticlePropertyKey.title}: My Blog##      
        ##${ArticlePropertyKey.description}: A Grand Description##      
        ##${ArticlePropertyKey.image}: img/blog/foo-bar.jpg##      
        FooContent
      `.trim();

      const blogResults = generateBlog(
        '##OG-CARD##\n##CHILD##',
        [{ path: 'foo.html', content: blogInput }],
        givenContext
      );

      expect(blogResults.blogPosts[0].content).toEqual(
        `
<meta property="og:image" content="https://www.example.com/img/blog/foo-bar.jpg" />
<meta property="og:title" content="My Blog" />
<meta property="og:description" content="A Grand Description" />
<meta property="og:type" content="article" />
<meta property="og:url" content="https://www.example.com/posts/foo.html" />
<meta property="twitter:card" content="summary" />
<meta property="twitter:title" content="My Blog" />
<meta property="twitter:description" content="A Grand Description" />
<meta property="twitter:image" content="https://www.example.com/img/blog/foo-bar.jpg" />
FooContent`.trim()
      );
    });

    it('should generate fully complete OpenGraph slug', () => {
      const blogInput = `
        ##${ArticlePropertyKey.title}: My Blog##      
        ##${ArticlePropertyKey.description}: A Grand Description##      
        ##${ArticlePropertyKey.image}: img/blog/foo.jpg##      
        ##${ArticlePropertyKey.imageType}: image/jpg##      
        ##${ArticlePropertyKey.imageWidth}: 1024##      
        ##${ArticlePropertyKey.imageHeight}: 1024##      
        FooContent
      `.trim();

      const blogResults = generateBlog(
        '##OG-CARD##\n##CHILD##',
        [{ path: 'foo.html', content: blogInput }],
        givenContext
      );

      expect(blogResults.blogPosts[0].content).toEqual(
        `
<meta property="og:image" content="https://www.example.com/img/blog/foo.jpg" />
<meta property="og:title" content="My Blog" />
<meta property="og:description" content="A Grand Description" />
<meta property="og:type" content="article" />
<meta property="og:url" content="https://www.example.com/posts/foo.html" />
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
      const actualSiteFiles = await generateSite(inputDir, '', givenContext, {
        fileService: mockFileService,
      });

      expect(actualSiteFiles.sort()).toEqual(givenSiteFiles.sort());
    });
  });

  describe('generateBlog', () => {
    it('should generate blog', () => {
      const blogResults = generateBlog('Blog Posts:\n##CHILD##', [
        { path: 'foo.html', content: 'FOO' },
        { path: 'bar.html', content: 'BAR' },
      ]);

      expect(blogResults.blog).toEqual('Blog Posts:\nFOO\nBAR');
    });

    it('should report missing metadata warnings', () => {
      const reporter = new Reporter();
      const reportTracker = reporter.trackReports();

      generateBlog('##CONTENT##', [{ path: 'foo.html', content: 'FOO' }], givenContext, reporter);

      expect(reportTracker.data).toEqual([
        {
          level: 'warning',
          message: `foo.html does not have a title. Add "##${ArticlePropertyKey.title}: My Title##" to fix`,
        },
        {
          level: 'warning',
          message: `foo.html does not have a description. Add "##${ArticlePropertyKey.description}: My Description##" to fix`,
        },
        {
          level: 'warning',
          message: `foo.html does not have an image. Add "##${ArticlePropertyKey.image}: /img/blog/something.jpg##" to fix`,
        },
      ]);
    });
  });
});
