import { describe, expect, it, vi } from 'vitest';
import { Site, SiteContext, generateSite } from './site-generator';
import * as path from 'path';
import { FileService, SiteFile } from './file-service';
import { mock } from './test/mocking';

export const givenContext: SiteContext = {
  title: 'The Reasonable Programmer',
  year: new Date().getFullYear(),
}

export const givenSite: Site = {
  about: `${givenContext.title} StartBase ${givenContext.title} EndBase ${givenContext.year}`,
  blog: `${givenContext.title} StartBase BlogContent EndBase ${givenContext.year}`,
  contact: `${givenContext.title} StartBase ContactContent EndBase ${givenContext.year}`,
}

export const givenSiteFiles: Array<SiteFile> = [
  { path: 'blog.html', content: givenSite.blog },
  { path: 'contact.html', content: givenSite.contact },
  { path: 'index.html', content: givenSite.about },
];

describe('Site Generation', () => {
  it('should complete load and generation of site', async () => {
    const fileService = new FileService();

    const inputDir = path.join(__dirname, "test", "data", "site");
    const actualSiteFiles = await generateSite(inputDir, '', givenContext, mock<FileService>({
      readFiles: vi.fn().mockImplementation((inputDir) => fileService.readFiles(inputDir)),
      writeFile: vi.fn().mockResolvedValue(true),
    }));

    expect(actualSiteFiles.sort()).toEqual(givenSiteFiles.sort());
  });
});
