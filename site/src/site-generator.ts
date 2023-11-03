import * as path from 'path';
import { processPage } from './template-processor';
import { FileService, InputFile, parseInfoFromFileName } from './file-service';
import { Reporter } from './reporter';

export interface OutputFile {
  path: string;
  content: string;
}

export interface BlogPost {
  fileName: string;
  content: string;
  properties: Map<string, string>;
  originalDate: Date;
  url: string;
}

export interface Site {
  about: string;
  blog: string;
  blogPosts: Array<BlogPost>;
  contact: string;
}

export interface SiteContext {
  siteTitle: string;
  siteUrl: string;
  year: number;
}

export const defaultContext: SiteContext = {
  year: new Date().getFullYear(),
  siteTitle: 'The Reasonable Programmer',
  siteUrl: 'https://www.jolson88.com/',
};

export enum ArticlePropertyKey {
  title = 'TITLE',
  description = 'DESCRIPTION',
  image = 'IMAGE',
  imageType = 'IMAGE-TYPE',
  imageWidth = 'IMAGE-WIDTH',
  imageHeight = 'IMAGE-HEIGHT',
}

export function generateBlog(
  siteTemplate: string,
  inputBlogPosts: Array<InputFile>,
  context: SiteContext = defaultContext,
  reporter: Reporter = new Reporter()
): { blog: string; blogPosts: Array<BlogPost> } {
  const blogPosts: Array<BlogPost> = [];
  for (const blogPost of inputBlogPosts) {
    const fileName = path.parse(blogPost.path).name;
    const fileInfo = parseInfoFromFileName(fileName);
    const url = `posts/${fileInfo.fileName}.html`;
    const blogContent = processPage(blogPost.content, '', { ...context, url });

    if (!blogContent.properties.has(ArticlePropertyKey.title)) {
      reporter.report(
        'warning',
        `${blogPost.path} does not have a title. Add "##${ArticlePropertyKey.title}: My Title##" to fix`
      );
    }
    if (!blogContent.properties.has(ArticlePropertyKey.description)) {
      reporter.report(
        'warning',
        `${blogPost.path} does not have a description. Add "##${ArticlePropertyKey.description}: My Description##" to fix`
      );
    }
    if (!blogContent.properties.has(ArticlePropertyKey.image)) {
      reporter.report(
        'warning',
        `${blogPost.path} does not have an image. Add "##${ArticlePropertyKey.image}: /img/blog/something.jpg##" to fix`
      );
    }

    blogPosts.push({
      fileName: fileInfo.fileName,
      content: blogContent.text,
      properties: blogContent.properties,
      originalDate: fileInfo.date,
      url,
    });
  }

  return {
    blog: processPage(
      siteTemplate,
      blogPosts
        .sort((first, second) => second.originalDate.getTime() - first.originalDate.getTime())
        .map((blogPost) => blogPost.content)
        .join('\n'),
      context
    ).text,
    blogPosts: blogPosts.map((blogPost) => ({
      ...blogPost,
      content: processPage(siteTemplate, blogPost.content, {
        ...context,
        ogCard: generateOpenGraphSlug(context, blogPost),
      }).text,
    })),
  };
}

export interface GenerateSiteOptions {
  fileService: FileService;
  reporter: Reporter;
}

export async function generateSite(
  inputDir: string,
  outputDir: string,
  context: SiteContext = defaultContext,
  { reporter = new Reporter(), fileService = new FileService() }: Partial<GenerateSiteOptions> = {}
): Promise<{ site: Site; siteFiles: Array<OutputFile> }> {
  const inputFiles = await fileService.readFiles(inputDir);

  const site: Site = {
    ...generateBlog(inputFiles.siteTemplateFile.content, inputFiles.blogFiles, context, reporter),
    about: processPage(inputFiles.siteTemplateFile.content, inputFiles.aboutFile.content, context)
      .text,
    contact: processPage(
      inputFiles.siteTemplateFile.content,
      inputFiles.contactFile.content,
      context
    ).text,
  };

  return {
    site,
    siteFiles: await processOutputSiteFiles(site, outputDir, fileService),
  };
}

async function processOutputSiteFiles(
  site: Site,
  outputDir: string,
  fileService: FileService
): Promise<Array<OutputFile>> {
  const siteFiles = [
    { path: 'blog.html', content: site.blog },
    { path: 'contact.html', content: site.contact },
    { path: 'index.html', content: site.about },
  ];
  siteFiles.push(
    ...site.blogPosts.map((blogPost) => {
      return {
        content: blogPost.content,
        path: blogPost.url,
      };
    })
  );
  for (const siteFile of siteFiles) {
    await fileService.writeFile(path.join(outputDir, siteFile.path), siteFile.content);
  }
  return siteFiles;
}

function generateOpenGraphSlug(context: SiteContext, blogPost: BlogPost): string {
  const { properties } = blogPost;
  const imageUrl = new URL(properties.get(ArticlePropertyKey.image) ?? '', context.siteUrl);
  const pageUrl = new URL(blogPost.url, context.siteUrl);
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
