import { describe, expect, it, vi } from 'vitest';
import { ArticlePropertyKey, OutputFile, SiteContext, SiteGenerator } from './site-generator';
import { FileService, InputFile } from './file-service';
import { mock } from './test/mocking';
import { Reporter } from './reporter';

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
        { path: 'one.html', content: '##URL##' },
        { path: 'two.html', content: '##URL##' },
      ];

      const generator = new SiteGenerator({
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
      expect(outputFilesLookup.get('blog.html')).toEqual(`Site blog/one.html\nblog/two.html`);
      expect(outputFilesLookup.get('blog/one.html')).toEqual(`Site blog/one.html`);
      expect(outputFilesLookup.get('blog/two.html')).toEqual(`Site blog/two.html`);
    });
  });

  describe('generateSection', () => {
    it('should generate section, including possible warnings', async () => {
      const reporter = new Reporter();
      const reportTracker = reporter.trackReports();

      const generator = new SiteGenerator({
        reporter,
        fileService: mock<FileService>({
          readDirectory: vi.fn().mockResolvedValue([{ path: 'foo.html', content: 'FOO' }]),
        }),
      });

      const results = await generator.generateSection('blog', '##CHILD##');

      expect(results.summary).toEqual('FOO');
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
