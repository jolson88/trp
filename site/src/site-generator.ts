import * as path from 'path';
import { processPage } from './template-processor';
import { FileService, InputFile, parseInfoFromFileName } from './file-service';
import { Reporter } from './reporter';
import { generateOpenGraphSlug } from './social-slugger';

export interface OutputFile {
  path: string;
  content: string;
}

export interface Article {
  fileName: string;
  content: string;
  properties: Map<string, string>;
  originalDate: Date;
  url: string;
}

export interface SiteContext {
  siteTitle: string;
  siteUrl: string;
  year: number;
}

export const defaultContext: SiteContext = {
  siteTitle: 'The Reasonable Programmer',
  siteUrl: 'https://www.jolson88.com/',
  year: new Date().getFullYear(),
};

export enum ArticlePropertyKey {
  title = 'TITLE',
  description = 'DESCRIPTION',
  image = 'IMAGE',
  imageType = 'IMAGE-TYPE',
  imageWidth = 'IMAGE-WIDTH',
  imageHeight = 'IMAGE-HEIGHT',
}

export interface SiteGeneratorOptions {
  fileService: FileService;
  reporter: Reporter;
}

export class SiteGenerator {
  private fileService: FileService;
  private reporter: Reporter;

  public constructor({
    fileService = new FileService(),
    reporter = new Reporter(),
  }: Partial<SiteGeneratorOptions> = {}) {
    this.fileService = fileService;
    this.reporter = reporter;
  }

  public async generateSite(
    inputDir: string,
    outputDir: string,
    context: SiteContext = defaultContext
  ): Promise<Array<OutputFile>> {
    const inputFiles = await this.fileService.readFiles(inputDir);

    const about = processPage(
      inputFiles.siteTemplateFile.content,
      inputFiles.aboutFile.content,
      context,
      { removeUnusedInputs: true }
    ).text;
    const contact = processPage(
      inputFiles.siteTemplateFile.content,
      inputFiles.contactFile.content,
      context,
      { removeUnusedInputs: true }
    ).text;
    const { blog, blogPosts } = this.generateBlog(
      inputFiles.siteTemplateFile.content,
      inputFiles.blogFiles,
      context
    );

    const siteFiles = [
      { path: 'blog.html', content: blog },
      { path: 'contact.html', content: contact },
      { path: 'index.html', content: about },
    ];

    siteFiles.push(...blogPosts.map((post) => ({ content: post.content, path: post.url })));
    for (const siteFile of siteFiles) {
      await this.fileService.writeFile(path.join(outputDir, siteFile.path), siteFile.content);
    }
    return siteFiles;
  }

  public generateBlog(
    siteTemplate: string,
    inputPostFiles: Array<InputFile>,
    context: SiteContext = defaultContext
  ): { blog: string; blogPosts: Array<Article> } {
    const posts: Array<Article> = [];
    for (const post of inputPostFiles) {
      const fileName = path.parse(post.path).name;
      const fileInfo = parseInfoFromFileName(fileName);
      const url = `blog/${fileInfo.fileName}.html`;
      const processedPage = processPage(post.content, '', { ...context, url });

      if (!processedPage.properties.has(ArticlePropertyKey.title)) {
        this.reporter.report(
          'warning',
          `${post.path} does not have a title. Add "##${ArticlePropertyKey.title}: My Title##" to fix`
        );
      }
      if (!processedPage.properties.has(ArticlePropertyKey.description)) {
        this.reporter.report(
          'warning',
          `${post.path} does not have a description. Add "##${ArticlePropertyKey.description}: My Description##" to fix`
        );
      }
      if (!processedPage.properties.has(ArticlePropertyKey.image)) {
        this.reporter.report(
          'warning',
          `${post.path} does not have an image. Add "##${ArticlePropertyKey.image}: /img/blog/something.jpg##" to fix`
        );
      }

      posts.push({
        fileName: fileInfo.fileName,
        content: processedPage.text,
        properties: processedPage.properties,
        originalDate: fileInfo.date,
        url,
      });
    }

    const processedPosts = posts
      .sort((first, second) => second.originalDate.getTime() - first.originalDate.getTime())
      .map((blogPost) => blogPost.content)
      .join('\n');

    return {
      blog: processPage(siteTemplate, processedPosts, context, { removeUnusedInputs: true }).text,
      blogPosts: posts.map((blogPost) => ({
        ...blogPost,
        content: processPage(siteTemplate, blogPost.content, {
          ...context,
          ogSlug: generateOpenGraphSlug(context, blogPost),
        }).text,
      })),
    };
  }
}
