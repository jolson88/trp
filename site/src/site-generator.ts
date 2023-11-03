import * as path from 'path';
import { processPage } from './template-processor';
import { FileService, SiteFile, parseInfoFromFileName } from './file-service';
import { Reporter } from './reporter';

export interface BlogPost {
  fileName: string;
  content: string;
  metadata: Map<string, string>;
  originalDate: Date;
}

export interface Site {
  about: string;
  blog: string;
  blogPosts: Array<BlogPost>;
  contact: string;
}

export interface SiteContext {
  title: string;
  url: string;
  year: number;
}

export const defaultContext: SiteContext = {
  year: new Date().getFullYear(),
  title: 'The Reasonable Programmer',
  url: 'https://www.jolson88.com/',
};

export enum MetadataField {
  description = 'DESCRIPTION',
  image = 'IMAGE',
  imageType = 'IMAGE-TYPE',
  imageWidth = 'IMAGE-WIDTH',
  imageHeight = 'IMAGE-HEIGHT',
  pageUrl = 'URL',
  title = 'TITLE',
}

export function generateBlog(
  siteTemplate: string,
  inputBlogPosts: Array<SiteFile>,
  context: SiteContext = defaultContext,
  reporter: Reporter = new Reporter()
): { blog: string; blogPosts: Array<BlogPost> } {
  const blogPosts: Array<BlogPost> = [];
  for (const blogPost of inputBlogPosts) {
    const fileName = path.parse(blogPost.path).name;
    const fileInfo = parseInfoFromFileName(fileName);
    const blogContent = processPage(blogPost.content, '', context);
    
    if (!blogContent.outputMarkers.has(MetadataField.title)) {
      reporter.report(
        'warning',
        `${blogPost.path} does not have a title. Add "##${MetadataField.title}: My Title##" to fix`
      );
    }
    if (!blogContent.outputMarkers.has(MetadataField.description)) {
      reporter.report(
        'warning',
        `${blogPost.path} does not have a description. Add "##${MetadataField.description}: My Description##" to fix`
      );
    }
    if (!blogContent.outputMarkers.has(MetadataField.image)) {
      reporter.report(
        'warning',
        `${blogPost.path} does not have an image. Add "##${MetadataField.image}: /img/blog/something.jpg##" to fix`
      );
    }
    if (!blogContent.outputMarkers.has(MetadataField.pageUrl)) {
      reporter.report(
        'warning',
        `${blogPost.path} does not have a url. Add "##${MetadataField.pageUrl}: /posts/foo.html##" to fix`
      );
    }

    blogPosts.push({
      fileName: fileInfo.fileName,
      content: blogContent.text,
      metadata: blogContent.outputMarkers,
      originalDate: fileInfo.date,
    });
  }

  return {
    blog: processPage(
      siteTemplate,
      inputBlogPosts.map((blogPost) => blogPost.content).join('\n'),
      context
    ).text,
    blogPosts: blogPosts.map((blogPost) => ({
      ...blogPost,
      content: processPage(siteTemplate, blogPost.content, {
        ...context,
        ogCard: generateOpenGraphSlug(context, blogPost.metadata),
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
): Promise<{ site: Site; siteFiles: Array<SiteFile> }> {
  const inputFiles = await fileService.readFiles(inputDir);

  const site: Site = {
    ...generateBlog(inputFiles.siteTemplate.content, inputFiles.blogPosts, context, reporter),
    about: processPage(inputFiles.siteTemplate.content, inputFiles.about.content, context).text,
    contact: processPage(inputFiles.siteTemplate.content, inputFiles.contact.content, context).text,
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
): Promise<Array<SiteFile>> {
  const siteFiles = [
    { path: 'blog.html', content: site.blog },
    { path: 'contact.html', content: site.contact },
    { path: 'index.html', content: site.about },
  ];
  siteFiles.push(
    ...site.blogPosts.map((blogPost) => {
      return {
        content: blogPost.content,
        path: `posts/${blogPost.fileName}.html`,
      };
    })
  );
  for (const siteFile of siteFiles) {
    await fileService.writeFile(path.join(outputDir, siteFile.path), siteFile.content);
  }
  return siteFiles;
}

function generateOpenGraphSlug(
  context: SiteContext,
  outputMarkers: Map<string, string>
): string {
  const imageUrl = new URL(outputMarkers.get(MetadataField.image) ?? '', context.url);
  const pageUrl = new URL(outputMarkers.get(MetadataField.pageUrl) ?? '', context.url);
  const title = outputMarkers.get(MetadataField.title) ?? '';
  const description = outputMarkers.get(MetadataField.description) ?? '';

  let slug = `
<meta property="og:image" content="${imageUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${pageUrl}" />
  `.trim();

  const imageType = outputMarkers.get(MetadataField.imageType);
  if (imageType) {
    slug = `${slug}\n<meta property="og:image:type" content="${imageType}" />`
  }

  const imageWidth = outputMarkers.get(MetadataField.imageWidth);
  if (imageWidth) {
    slug = `${slug}\n<meta property="og:image:width" content="${imageWidth}" />`
  }

  const imageHeight = outputMarkers.get(MetadataField.imageHeight);
  if (imageHeight) {
    slug = `${slug}\n<meta property="og:image:height" content="${imageHeight}" />`
  }

  return slug;
}
