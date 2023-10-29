import * as path from "path";
import { processTemplate } from "./template-processor";
import { FileService, SiteFile } from "./file-service";

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
): Promise<{ site: Site, siteFiles: Array<SiteFile> }> {
  const inputFiles = await fileService.readFiles(inputDir);
  
  const siteTemplate = processTemplate(inputFiles.siteTemplate.content, context);
  const aboutContent = processTemplate(inputFiles.about.content, context);
  const blogContent = processTemplate(inputFiles.blog.content, context);
  const contactContent = processTemplate(inputFiles.contact.content, context);

  const blogPosts: Array<BlogPost> = [];
  const blogFiles = await fileService.readDirectory(path.join(inputDir, "posts"));

  for (const blogFile of blogFiles) {
    const fileName = path.parse(blogFile.path).name;
    const fileInfo = fileService.parseInfoFromFileName(fileName);
    blogPosts.push({
      fileName: fileInfo.fileName,
      content: processTemplate(blogFile.content, context).text,
      originalDate: fileInfo.date,
    })
  }
  const site: Site = {
    about: processTemplate(siteTemplate.text, { ...context, content: aboutContent.text }).text,
    blog: processTemplate(siteTemplate.text, { ...context, content: blogContent.text }).text,
    blogPosts,
    contact: processTemplate(siteTemplate.text, { ...context, content: contactContent.text }).text,
  };

  const siteFiles = [
    { path: "blog.html", content: site.blog },
    { path: "contact.html", content: site.contact },
    { path: "index.html", content: site.about },
  ];
  for (const siteFile of siteFiles) {
    await fileService.writeFile(path.join(outputDir, siteFile.path), siteFile.content);
  }
  return { site, siteFiles };
}
