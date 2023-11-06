import { describe, expect, it, vi } from 'vitest';
import { ArticlePropertyKey, SiteContext, SiteGenerator } from './site-generator';
import { FileService, InputFile } from './file-service';
import { mock } from './test/mocking';
import { Reporter } from './reporter';
import { SocialSlugger } from './social-slugger';

export const givenContext: SiteContext = {
  siteTitle: 'My Website',
  siteUrl: 'https://www.foo.com',
  year: new Date().getFullYear(),
};

describe('Site Generation', () => {
  describe('generateSite', () => {
    it('should generate basic site', async () => {
      const basicFiles = new Map<string, InputFile>([
        ['_site.html', { path: '_site.html', content: 'Site ##CHILD##' }],
        ['about.html', { path: 'about.html', content: '##SITE-TITLE##' }],
        ['contact.html', { path: 'contact.html', content: '##SITE-URL##' }],
      ]);
      const blogFiles = [
        { path: '2023-01-01-one.html', content: '##URL##' },
        { path: '2023-02-02-two.html', content: '##URL##' },
      ];

      const reporter = new Reporter();
      const reportTracker = reporter.trackReports();
      const generator = new SiteGenerator({
        reporter,
        socialSlugger: mock<SocialSlugger>({
          generateDisqusSlug: vi.fn().mockReturnValue(''),
        }),
        fileService: mock<FileService>({
          readDirectory: vi.fn().mockResolvedValue(blogFiles),
          readFile: vi.fn((path) => Promise.resolve(basicFiles.get(path)!)),
        }),
      });

      const outputFiles = await generator.generateSite(givenContext);
      const outputFilesLookup = new Map<string, string>();
      outputFiles.forEach((file) => outputFilesLookup.set(file.path, file.content));

      expect(outputFilesLookup.get('contact.html')).toEqual(`Site ${givenContext.siteUrl}`);
      expect(outputFilesLookup.get('index.html')).toEqual(`Site ${givenContext.siteTitle}`);
      expect(outputFilesLookup.get('blog.html')).toEqual(`Site blog/two.html\nblog/one.html`);
      expect(outputFilesLookup.get('blog/one.html')).toEqual(`Site blog/one.html`);
      expect(outputFilesLookup.get('blog/two.html')).toEqual(`Site blog/two.html`);
      expect(reportTracker.data).toEqual([
        {
          level: 'warning',
          message: `2023-01-01-one.html does not have a title. Add "##${ArticlePropertyKey.title}: My Title##" to fix`,
        },
        {
          level: 'warning',
          message: `2023-01-01-one.html does not have a description. Add "##${ArticlePropertyKey.description}: My Description##" to fix`,
        },
        {
          level: 'warning',
          message: `2023-01-01-one.html does not have an image. Add "##${ArticlePropertyKey.image}: /img/blog/something.jpg##" to fix`,
        },
        {
          level: 'warning',
          message: `2023-02-02-two.html does not have a title. Add "##${ArticlePropertyKey.title}: My Title##" to fix`,
        },
        {
          level: 'warning',
          message: `2023-02-02-two.html does not have a description. Add "##${ArticlePropertyKey.description}: My Description##" to fix`,
        },
        {
          level: 'warning',
          message: `2023-02-02-two.html does not have an image. Add "##${ArticlePropertyKey.image}: /img/blog/something.jpg##" to fix`,
        },
      ]);
    });

    it('should include only top five articles in summary', async () => {
      const blogFiles = [
        { path: '2023-01-01-one.html', content: 'FIZZBUZZ!' },
        { path: '2023-02-02-two.html', content: 'TWO' },
        { path: '2023-03-03-three.html', content: 'THREE' },
        { path: '2023-04-04-four.html', content: 'FOUR' },
        { path: '2023-05-05-five.html', content: 'FIVE' },
        { path: '2023-06-06-six.html', content: 'SIX' },
      ];

      const generator = new SiteGenerator({
        socialSlugger: mock<SocialSlugger>({
          generateDisqusSlug: vi.fn().mockReturnValue(''),
        }),
        fileService: mock<FileService>({
          readDirectory: vi.fn().mockResolvedValue(blogFiles),
          readFile: vi.fn((path) => Promise.resolve({ path, content: '##CHILD##' })),
        }),
      });
      const outputFiles = await generator.generateSite(givenContext);

      const blogSummaryFile = outputFiles.find((file) => file.path === 'blog.html');
      expect(blogSummaryFile).toBeDefined();
      expect(blogSummaryFile?.content).toBe('SIX\nFIVE\nFOUR\nTHREE\nTWO');
    });

    it('should include social slugs in individual articles but not summaries', async () => {
      const blogFiles = [{ path: '2023-01-01-one.html', content: 'One' }];

      const generator = new SiteGenerator({
        socialSlugger: mock<SocialSlugger>({
          generateDisqusSlug: vi.fn().mockReturnValue('DISQUS'),
          generateOpenGraphSlug: vi.fn().mockReturnValue('OPENGRAPH BAY BAY!'),
        }),
        fileService: mock<FileService>({
          readDirectory: vi.fn().mockResolvedValue(blogFiles),
          readFile: vi.fn((path) => Promise.resolve({ path, content: '##OG-SLUG## ##CHILD##' })),
        }),
      });
      const outputFiles = await generator.generateSite(givenContext);

      const blogArticleFile = outputFiles.find((file) => file.path === 'blog/one.html');
      const blogSummaryFile = outputFiles.find((file) => file.path === 'blog.html');
      expect(blogArticleFile).toBeDefined();
      expect(blogSummaryFile).toBeDefined();
      expect(blogArticleFile?.content).toBe('OPENGRAPH BAY BAY! OneDISQUS');
      expect(blogSummaryFile?.content).toBe('One');
    });

    it('should filter out draft articles by default', async () => {
      const blogFiles = [
        { path: '2023-01-01-one.html', content: 'One' },
        { path: '2023-02-02-two.html', content: 'Two' },
        { path: '2023-03-03-three.html', content: 'Three' },
        { path: 'draft-one.html', content: 'Draft' },
        { path: 'draft-two.html', content: 'Draft' },
      ];

      const generator = new SiteGenerator({
        socialSlugger: mock<SocialSlugger>({
          generateDisqusSlug: vi.fn().mockReturnValue(''),
        }),
        fileService: mock<FileService>({
          readDirectory: vi.fn().mockResolvedValue(blogFiles),
          readFile: vi.fn((path) => Promise.resolve({ path, content: '##CHILD##' })),
        }),
      });
      const outputFiles = await generator.generateSite(givenContext);

      const blogArticleFiles = outputFiles.filter((file) => file.path.startsWith('blog/'));
      expect(blogArticleFiles).toHaveLength(3);
    });

    it('should include draft articles if requested', async () => {
      const blogFiles = [
        { path: '2023-01-01-one.html', content: 'One' },
        { path: '2023-02-02-two.html', content: 'Two' },
        { path: '2023-03-03-three.html', content: 'Three' },
        { path: 'draft-one.html', content: 'Draft' },
        { path: 'draft-two.html', content: 'Draft' },
      ];

      const generator = new SiteGenerator({
        socialSlugger: mock<SocialSlugger>({
          generateDisqusSlug: vi.fn().mockReturnValue(''),
        }),
        fileService: mock<FileService>({
          readDirectory: vi.fn().mockResolvedValue(blogFiles),
          readFile: vi.fn((path) => Promise.resolve({ path, content: '##CHILD##' })),
        }),
      });
      const outputFiles = await generator.generateSite(givenContext, { includeDrafts: true });

      const blogArticleFiles = outputFiles.filter((file) => file.path.startsWith('blog/'));
      expect(blogArticleFiles).toHaveLength(5);
    });
  });
});
