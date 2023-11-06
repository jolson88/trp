import { ArticlePropertyKey, Article, SiteContext } from './site-generator';

export class SocialSlugger {
  public generateOpenGraphSlug(context: SiteContext, post: Article): string {
    const { properties } = post;
    const imageUrl = new URL(properties.get(ArticlePropertyKey.image) ?? '', context.siteUrl);
    const pageUrl = new URL(post.url, context.siteUrl);
    const title = properties.get(ArticlePropertyKey.title) ?? '';
    const description = properties.get(ArticlePropertyKey.description) ?? '';

    let slug = `
<meta property="og:image" content="${imageUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${pageUrl}" />
<meta property="twitter:card" content="summary" />
<meta property="twitter:title" content="${title}" />
<meta property="twitter:description" content="${description}" />
<meta property="twitter:image" content="${imageUrl}" />
  `.trim();

    const imageType = properties.get(ArticlePropertyKey.imageType);
    if (imageType) {
      slug = `${slug}\n<meta property="og:image:type" content="${imageType}" />`;
    }

    const imageWidth = properties.get(ArticlePropertyKey.imageWidth);
    if (imageWidth) {
      slug = `${slug}\n<meta property="og:image:width" content="${imageWidth}" />`;
    }

    const imageHeight = properties.get(ArticlePropertyKey.imageHeight);
    if (imageHeight) {
      slug = `${slug}\n<meta property="og:image:height" content="${imageHeight}" />`;
    }

    return slug;
  }
}
