import * as path from 'path';
import { processPage, processTemplate } from './template-processor';
import { FileService, SiteFile, parseInfoFromFileName } from './file-service';

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
  year: number;
}

const defaultContext: SiteContext = {
  year: new Date().getFullYear(),
  title: 'The Reasonable Programmer',
};

export function generateBlog(
  siteTemplate: string,
  inputBlogPosts: Array<SiteFile>,
  context: SiteContext = defaultContext
): { blog: string; blogPosts: Array<BlogPost> } {
  const blogPosts: Array<BlogPost> = [];
  for (const blogPost of inputBlogPosts) {
    const fileName = path.parse(blogPost.path).name;
    const fileInfo = parseInfoFromFileName(fileName);
    blogPosts.push({
      fileName: fileInfo.fileName,
      content: processTemplate(blogPost.content, context).text,
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

export async function generateSite(
  inputDir: string,
  outputDir: string,
  context: SiteContext = defaultContext,
  fileService: FileService = new FileService()
): Promise<{ site: Site; siteFiles: Array<SiteFile> }> {
  const inputFiles = await fileService.readFiles(inputDir);

  const site: Site = {
    ...generateBlog(inputFiles.siteTemplate.content, inputFiles.blogPosts, context),
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
