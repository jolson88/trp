import { describe, expect, it, vi } from 'vitest';
import {
  MetadataField,
  Site,
  SiteContext,
  generateBlog,
  generateSite,
} from './site-generator';
import * as path from 'path';
import { FileService, SiteFile, SiteFiles } from './file-service';
import { mockPassthrough } from './test/mocking';
import { Reporter } from './reporter';

export const givenContext: SiteContext = {
  title: 'The Reasonable Programmer',
  year: new Date().getFullYear(),
  url: 'https://www.example.com',
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
    content: '##TITLE## StartBase ##CHILD## EndBase ##YEAR##',
  },
};

export const givenSite: Site = {
  about: `${givenContext.title} StartBase AboutMe EndBase ${givenContext.year}`,
  blog: `${givenContext.title} StartBase Foo\nBar\nBaz EndBase ${givenContext.year}`,
  blogPosts: [
    {
      fileName: 'foo',
      content: `${givenContext.title} StartBase Foo EndBase ${givenContext.year}`,
      metadata: new Map<string, string>(),
      originalDate: new Date(2023, 1, 1),
    },
    {
      fileName: 'bar',
      content: `${givenContext.title} StartBase Bar EndBase ${givenContext.year}`,
      metadata: new Map<string, string>(),
      originalDate: new Date(2023, 2, 2),
    },
    {
      fileName: 'baz',
      content: `${givenContext.title} StartBase Baz EndBase ${givenContext.year}`,
      metadata: new Map<string, string>(),
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
  describe('OpenGraph Slug', () => {
    it('should generate minimal OpenGraph slug', () => {
      const blogInput = `
        ##${MetadataField.title}: My Blog##      
        ##${MetadataField.description}: A Grand Description##      
        ##${MetadataField.image}: img/blog/foo-bar.jpg##      
        ##${MetadataField.pageUrl}: posts/foo.html##      
        FooContent
      `.trim();

      const blogResults = generateBlog('##OG-CARD##\n##CHILD##', [
        { path: 'foo.html', content: blogInput },
      ], givenContext);

      expect(blogResults.blogPosts[0].content).toEqual(`
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
        ##${MetadataField.title}: My Blog##      
        ##${MetadataField.description}: A Grand Description##      
        ##${MetadataField.image}: img/blog/foo.jpg##      
        ##${MetadataField.pageUrl}: posts/foo.html##      
        ##${MetadataField.imageType}: image/jpg##      
        ##${MetadataField.imageWidth}: 1024##      
        ##${MetadataField.imageHeight}: 1024##      
        FooContent
      `.trim();

      const blogResults = generateBlog('##OG-CARD##\n##CHILD##', [
        { path: 'foo.html', content: blogInput },
      ], givenContext);

      expect(blogResults.blogPosts[0].content).toEqual(`
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
`.trim());
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
      const siteResults = await generateSite(inputDir, '', givenContext, {
        fileService: mockFileService,
      });

      expect(siteResults.site).toEqual(givenSite);
      expect(siteResults.siteFiles.sort()).toEqual(givenSiteFiles.sort());
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
          message: `foo.html does not have a title. Add "##${MetadataField.title}: My Title##" to fix`,
        },
        {
          level: 'warning',
          message: `foo.html does not have a description. Add "##${MetadataField.description}: My Description##" to fix`,
        },
        {
          level: 'warning',
          message:
            `foo.html does not have an image. Add "##${MetadataField.image}: /img/blog/something.jpg##" to fix`,
        },
        {
          level: 'warning',
          message:
            `foo.html does not have a url. Add "##${MetadataField.pageUrl}: /posts/foo.html##" to fix`,
        },
      ]);
    });
  });
});
