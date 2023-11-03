import * as path from 'path';
import * as fs from 'fs/promises';

export interface InputFiles {
  siteTemplateFile: InputFile;
  aboutFile: InputFile;
  blogFiles: Array<InputFile>;
  contactFile: InputFile;
}

export interface InputFile {
  path: string;
  content: string;
}

export function parseInfoFromFileName(fileName: string): {
  date: Date;
  fileName: string;
} {
  const defaultInfo = {
    date: new Date(1970, 1, 1),
    fileName,
  };

  const fileParts = fileName.split('-');
  if (fileParts.length < 4) {
    return defaultInfo;
  }

  const year = Number.parseInt(fileParts[0]);
  const month = Number.parseInt(fileParts[1]);
  const day = Number.parseInt(fileParts[2]);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return defaultInfo;
  }

  return {
    date: new Date(year, month, day),
    fileName: fileParts.slice(3).join('-'),
  };
}

export class FileService {
  public async readFiles(inputDir: string): Promise<InputFiles> {
    return {
      siteTemplateFile: await this.readFile(path.join(inputDir, '_site.html')),
      aboutFile: await this.readFile(path.join(inputDir, 'about.html')),
      blogFiles: await this.readDirectory(path.join(inputDir, 'posts')),
      contactFile: await this.readFile(path.join(inputDir, 'contact.html')),
    };
  }

  public async writeFile(filePath: string, content: string): Promise<boolean> {
    const outputDir = path.parse(filePath).dir;
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, content);
    return true;
  }

  async readDirectory(inputDir: string): Promise<Array<InputFile>> {
    const files: Array<InputFile> = [];

    const dir = await fs.opendir(inputDir);
    let entry = await dir.read();
    while (entry != null) {
      if (entry.isFile()) {
        files.push(await this.readFile(path.join(inputDir, entry.name)));
      }
      entry = await dir.read();
    }

    return files.sort((first, second) => first.path.localeCompare(second.path));
  }

  async readFile(fullPath: string): Promise<InputFile> {
    return {
      path: fullPath,
      content: await fs.readFile(fullPath, { encoding: 'utf8' }),
    };
  }
}
