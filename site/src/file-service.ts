import * as path from "path";
import * as fs from "fs/promises";

export interface SiteFiles {
  siteTemplate: SiteFile;
  about: SiteFile;
  blog: SiteFile;
  contact: SiteFile;
}

export interface SiteFile {
  path: string;
  content: string;
}

export class FileService {
  public async readFiles(inputDir: string): Promise<SiteFiles> {
    return {
      siteTemplate: await this.readFile(path.join(inputDir, "_site.html")),
      about: await this.readFile(path.join(inputDir, "about.html")),
      blog: await this.readFile(path.join(inputDir, "blog.html")),
      contact: await this.readFile(path.join(inputDir, "contact.html")),
    };
  }

  public async readFile(path: string): Promise<SiteFile> {
    return {
      path,
      content: await fs.readFile(path, { encoding: "utf8" }),
    };
  }

  public async writeFile(
    filePath: string,
    content: string
  ): Promise<boolean> {
    const outputDir = path.parse(filePath).dir;
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, content);
    return true;
  }
}

export async function readSiteFiles(inputDir: string): Promise<SiteFiles> {
  const service = new FileService();
  return service.readFiles(inputDir);
}

export async function writeSiteFile(filePath: string, content: string): Promise<boolean> {
  const service = new FileService();
  return service.writeFile(filePath, content);
}