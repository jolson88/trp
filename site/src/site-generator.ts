import * as path from "path";
import { processTemplate } from "./template-processor";
import {
  FileService,
  SiteFile,
  SiteFiles,
  parseInfoFromFileName,
} from "./file-service";

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
  title: "The Reasonable Programmer",
};

export async function generateSite(
  inputDir: string,
  outputDir: string,
  context: SiteContext = defaultContext,
  fileService: FileService = new FileService()
): Promise<{ site: Site; siteFiles: Array<SiteFile> }> {
  const inputFiles = await fileService.readFiles(inputDir);

  const site: Site = processSiteFromInputSiteFiles(inputFiles, context);
  return {
    site,
    siteFiles: await processOutputSiteFiles(site, fileService, outputDir),
  };
}

export async function generateAboutFromSiteFiles(
  inputSiteFiles: SiteFiles,
  fileService: FileService = new FileService()
): Promise<string> {
  return "";
}

async function processOutputSiteFiles(
  site: Site,
  fileService: FileService,
  outputDir: string
): Promise<Array<SiteFile>> {
  const siteFiles = [
    { path: "blog.html", content: site.blog },
    { path: "contact.html", content: site.contact },
    { path: "index.html", content: site.about },
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
    await fileService.writeFile(
      path.join(outputDir, siteFile.path),
      siteFile.content
    );
  }
  return siteFiles;
}

function processSiteFromInputSiteFiles(
  inputFiles: SiteFiles,
  context: SiteContext
) {
  const siteTemplate = processTemplate(
    inputFiles.siteTemplate.content,
    context
  );
  const aboutContent = processTemplate(inputFiles.about.content, context);
  const contactContent = processTemplate(inputFiles.contact.content, context);

  const blogPosts: Array<BlogPost> = [];
  for (const blogPost of inputFiles.blogPosts) {
    const fileName = path.parse(blogPost.path).name;
    const fileInfo = parseInfoFromFileName(fileName);
    blogPosts.push({
      fileName: fileInfo.fileName,
      content: processTemplate(blogPost.content, context).text,
      originalDate: fileInfo.date,
    });
  }

  const about = processTemplate(siteTemplate.text, {
    ...context,
    content: aboutContent.text,
  }).text;
  const blog = processTemplate(siteTemplate.text, {
    ...context,
    content: blogPosts
      .map((blogPost) => {
        return blogPost.content;
      })
      .join(" "),
  }).text;
  const finalBlogPosts = blogPosts.map((blogPost) => {
    return {
      ...blogPost,
      content: processTemplate(siteTemplate.text, {
        ...context,
        content: blogPost.content,
      }).text,
    };
  });
  const contact = processTemplate(siteTemplate.text, {
    ...context,
    content: contactContent.text,
  }).text;

  const site: Site = {
    about,
    blog,
    blogPosts: finalBlogPosts,
    contact,
  };
  return site;
}
