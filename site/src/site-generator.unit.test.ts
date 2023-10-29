import { describe, expect, it, vi } from "vitest";
import { Site, SiteContext, generateSite } from "./site-generator";
import * as path from "path";
import { FileService, SiteFile } from "./file-service";
import { mock, mockPassthrough } from "./test/mocking";

export const givenContext: SiteContext = {
  title: "The Reasonable Programmer",
  year: new Date().getFullYear(),
};

export const givenSite: Site = {
  about: `${givenContext.title} StartBase ${givenContext.title} EndBase ${givenContext.year}`,
  blog: `${givenContext.title} StartBase BlogContent EndBase ${givenContext.year}`,
  blogPosts: [
    { fileName: "foo", content: "Foo", originalDate: new Date(2023, 1, 1) },
    { fileName: "bar", content: "Bar", originalDate: new Date(2023, 2, 2) },
    { fileName: "baz", content: "Baz", originalDate: new Date(2023, 3, 3) },
  ],
  contact: `${givenContext.title} StartBase ContactContent EndBase ${givenContext.year}`,
};

export const givenSiteFiles: Array<SiteFile> = [
  { path: "blog.html", content: givenSite.blog },
  { path: "contact.html", content: givenSite.contact },
  { path: "index.html", content: givenSite.about },
];

describe("Site Generation", () => {
  it("should complete load and generation of site", async () => {
    const mockFileService = mockPassthrough<FileService>({
      writeFile: vi.fn().mockResolvedValue(true),
    }, new FileService());

    const inputDir = path.join(__dirname, "test", "data", "site");
    const siteResults = await generateSite(
      inputDir,
      "",
      givenContext,
      mockFileService
    );

    expect(siteResults.site).toEqual(givenSite);
    expect(siteResults.siteFiles.sort()).toEqual(givenSiteFiles.sort());
  });
});
