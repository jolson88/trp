import { describe, expect, it, vi } from 'vitest';
import { ArticlePropertyKey, SiteContext, SiteGenerator } from './site-generator';
import { FileService } from './file-service';
import { mock } from './test/mocking';
import { Reporter } from './reporter';

export const givenContext: SiteContext = {
  siteTitle: 'My Website',
  siteUrl: 'https://www.foo.com',
  year: new Date().getFullYear(),
};

describe('Site Generation', () => {
  describe('generateSection', () => {
    it('should generate section', async () => {
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

      const results = await generator.generateSection('blog', '##CHILD##');

      expect(results.summary).toEqual('BAR\nFOO');
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
