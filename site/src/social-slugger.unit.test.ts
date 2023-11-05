import { describe, expect, it, vi } from 'vitest';
import { Article, ArticlePropertyKey, SiteContext } from './site-generator';
import { generateOpenGraphSlug } from './social-slugger';

export const givenContext: SiteContext = {
  siteTitle: 'The Reasonable Programmer',
  siteUrl: 'https://www.example.com',
  year: new Date().getFullYear(),
};

describe('Social Slugger', () => {
  describe('OpenGraph', () => {
    it('should generate minimal OpenGraph slug', async () => {
      const article: Article = {
        fileName: 'foo.html',
        content: 'FooContent',
        properties: new Map<string, string>([
          [ArticlePropertyKey.title, 'My Blog'],
          [ArticlePropertyKey.description, 'A Grand Description'],
          [ArticlePropertyKey.image, 'img/blog/foo-bar.jpg'],
        ]),
        originalDate: new Date(),
        url: 'blog/foo.html',
      };

      const slug = generateOpenGraphSlug(givenContext, article);

      expect(slug).toEqual(
        `
<meta property="og:image" content="https://www.example.com/img/blog/foo-bar.jpg" />
<meta property="og:title" content="My Blog" />
<meta property="og:description" content="A Grand Description" />
<meta property="og:type" content="article" />
<meta property="og:url" content="https://www.example.com/blog/foo.html" />
<meta property="twitter:card" content="summary" />
<meta property="twitter:title" content="My Blog" />
<meta property="twitter:description" content="A Grand Description" />
<meta property="twitter:image" content="https://www.example.com/img/blog/foo-bar.jpg" />`.trim()
      );
    });

    it('should generate maximal OpenGraph slug', async () => {
      const article: Article = {
        fileName: 'foo.html',
        content: 'FooContent',
        properties: new Map<string, string>([
          [ArticlePropertyKey.title, 'My Blog'],
          [ArticlePropertyKey.description, 'A Grand Description'],
          [ArticlePropertyKey.image, 'img/blog/foo-bar.jpg'],
          [ArticlePropertyKey.imageType, 'image/jpg'],
          [ArticlePropertyKey.imageWidth, '1900'],
          [ArticlePropertyKey.imageHeight, '1020'],
        ]),
        originalDate: new Date(),
        url: 'blog/foo.html',
      };

      const slug = generateOpenGraphSlug(givenContext, article);

      expect(slug).toEqual(
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
<meta property="og:image:type" content="image/jpg" />
<meta property="og:image:width" content="1900" />
<meta property="og:image:height" content="1020" />`.trim()
      );
    });
  });
});
