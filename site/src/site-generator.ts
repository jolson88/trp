import * as path from 'path';
import { processPage, processTemplate } from './template-processor';
import { FileService, SiteFile, parseInfoFromFileName } from './file-service';
import { Reporter } from './reporter';

export interface BlogPost {
  fileName: string;
  content: string;
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
  image = 'IMAGE',
  title = 'TITLE',
}

export function generateOpenGraphSlug(
  context: SiteContext,
  outputMarkers: Map<string, string>
): string {
  const imageUrl = new URL(outputMarkers.get(MetadataField.image) ?? '', context.url);

  return `
<meta property="og:image" content="${imageUrl}" />
<meta property="og:title" content="Foo" />
<meta property="og:type" content="article" />
  `.trim();
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
    const blogContent = processTemplate(blogPost.content, context);

    if (!blogContent.outputMarkers.has(MetadataField.title)) {
      reporter.report(
        'warning',
        `${blogPost.path} does not have a title. Add "##${MetadataField.title}: My Title##" to fix`
      );
    }
    if (!blogContent.outputMarkers.has(MetadataField.image)) {
      reporter.report(
        'warning',
        `${blogPost.path} does not have an image. Add "##${MetadataField.image}: /img/blog/something.jpg##" to fix`
      );
    }

    blogPosts.push({
      fileName: fileInfo.fileName,
      content: blogContent.text,
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
      content: processPage(siteTemplate, blogPost.content, context).text,
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
