import { describe, expect, it, vi } from 'vitest';
import { Site, SiteContext, loadSite, writeSite } from './site-generator';
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
  it('should output site files', async () => {
    const actualSiteFiles = await writeSite(givenSite, '', mock<FileService>({
      writeFile: vi.fn().mockResolvedValue(true),
    }));

    expect(actualSiteFiles.sort()).toEqual(givenSiteFiles.sort());
  });

  it('should load test site and match unit test givens', async () => {
    const actualSite = await loadSite(path.join(__dirname, 'test', 'data', 'site'), givenContext);
    expect(actualSite).toEqual(givenSite);
  });
});
