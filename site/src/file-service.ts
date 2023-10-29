import * as path from "path";
import * as fs from "fs/promises";
import { Dirent } from "fs";

export interface SiteFiles {
  siteTemplate: SiteFile;
  about: SiteFile;
  blogPosts: Array<SiteFile>;
  contact: SiteFile;
}

export interface SiteFile {
  path: string;
  content: string;
}

export class FileService {
  public parseInfoFromFileName(fileName: string): { date: Date, fileName: string } {
    const today = new Date();
    const defaultInfo = {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      fileName,
    };

    const fileParts = fileName.split("-");
    if (fileParts.length < 4) {
      return defaultInfo;
    }

    try {
      const year = Number.parseInt(fileParts[0]);
      const month = Number.parseInt(fileParts[1]);
      const day = Number.parseInt(fileParts[2]);
      return {
        date: new Date(year, month, day),
        fileName: fileParts.slice(3).join('-'),
      };
    } catch {
      return defaultInfo;
    }
  }

  public async readFiles(inputDir: string): Promise<SiteFiles> {
    return {
      siteTemplate: await this.readFile(path.join(inputDir, "_site.html")),
      about: await this.readFile(path.join(inputDir, "about.html")),
      blogPosts: await this.readDirectory(path.join(inputDir, "posts")),
      contact: await this.readFile(path.join(inputDir, "contact.html")),
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

  async readDirectory(inputDir: string): Promise<Array<SiteFile>> {
    const files: Array<SiteFile> = [];

    const dir = await fs.opendir(inputDir);
    let entry = await dir.read();
    while (entry != null) {
      if (entry.isFile()) {
        files.push(await this.readFile(path.join(inputDir, entry.name)));
      }
      entry = await dir.read();
    }

    return files;
  }

  async readFile(fullPath: string): Promise<SiteFile> {
    return {
      path: fullPath,
      content: await fs.readFile(fullPath, { encoding: "utf8" }),
    };
  }
}
