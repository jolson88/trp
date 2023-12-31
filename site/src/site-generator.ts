import * as path from 'path';
import { processPage } from './template-processor';
import { FileService, parseInfoFromFileName } from './file-service';
import { Reporter } from './reporter';
import { SocialSlugger } from './social-slugger';

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

export enum ArticlePropertyKey {
  title = 'TITLE',
  description = 'DESCRIPTION',
  image = 'IMAGE',
  imageType = 'IMAGE-TYPE',
  imageWidth = 'IMAGE-WIDTH',
  imageHeight = 'IMAGE-HEIGHT',
}

export interface SiteGeneratorParams {
  inputDir?: string;
  fileService?: FileService;
  reporter?: Reporter;
  socialSlugger?: SocialSlugger;
}

interface GenerateSiteOptions {
  includeDrafts?: boolean;
}

export class SiteGenerator {
  private inputDir: string;
  private fileService: FileService;
  private reporter: Reporter;
  private socialSlugger: SocialSlugger;

  public constructor({
    inputDir = '',
    fileService = new FileService(),
    reporter = new Reporter(),
    socialSlugger = new SocialSlugger(),
  }: SiteGeneratorParams = {}) {
    this.inputDir = inputDir;
    this.fileService = fileService;
    this.reporter = reporter;
    this.socialSlugger = socialSlugger;
  }

  public async generateSite(
    context: SiteContext,
    { includeDrafts = false }: GenerateSiteOptions = {}
  ): Promise<Array<OutputFile>> {
    const siteTemplateFile = await this.fileService.readFile(
      path.join(this.inputDir, '_site.html')
    );
    const aboutFile = await this.fileService.readFile(path.join(this.inputDir, 'about.html'));
    const contactFile = await this.fileService.readFile(path.join(this.inputDir, 'contact.html'));

    const about = processPage(siteTemplateFile.content, aboutFile.content, context, {
      removeUnusedInputs: true,
    }).text;
    const contact = processPage(siteTemplateFile.content, contactFile.content, context, {
      removeUnusedInputs: true,
    }).text;
    const { summary: blog, articles: blogPosts } = await this.generateSection(
      'blog',
      siteTemplateFile.content,
      context,
      includeDrafts
    );

    const siteFiles = [
      { path: 'blog.html', content: blog },
      { path: 'contact.html', content: contact },
      { path: 'index.html', content: about },
    ];

    siteFiles.push(...blogPosts.map((post) => ({ content: post.content, path: post.url })));
    return siteFiles;
  }

  private async generateSection(
    section: string,
    siteTemplate: string,
    context: SiteContext,
    includeDrafts: boolean
  ): Promise<{ summary: string; articles: Array<Article> }> {
    const inputArticleFiles = await this.fileService.readDirectory(
      path.join(this.inputDir, section)
    );

    const articles: Array<Article> = [];
    for (const articleFile of inputArticleFiles) {
      const fileName = path.parse(articleFile.path).name;
      const fileInfo = parseInfoFromFileName(fileName);
      const url = `${section}/${fileInfo.fileName}.html`;
      const processedPage = processPage(articleFile.content, '', {
        ...context,
        url,
      });

      if (!processedPage.properties.has(ArticlePropertyKey.title)) {
        this.reporter.report(
          'warning',
          `${articleFile.path} does not have a title. Add "##${ArticlePropertyKey.title}: My Title##" to fix`
        );
      }
      if (!processedPage.properties.has(ArticlePropertyKey.description)) {
        this.reporter.report(
          'warning',
          `${articleFile.path} does not have a description. Add "##${ArticlePropertyKey.description}: My Description##" to fix`
        );
      }
      if (!processedPage.properties.has(ArticlePropertyKey.image)) {
        this.reporter.report(
          'warning',
          `${articleFile.path} does not have an image. Add "##${ArticlePropertyKey.image}: /img/blog/something.jpg##" to fix`
        );
      }

      if (!this.isDraftArticle(fileInfo.date) || includeDrafts) {
        articles.push({
          fileName: fileInfo.fileName,
          content: processedPage.text,
          properties: processedPage.properties,
          originalDate: fileInfo.date,
          url,
        });
      }
    }

    const summarizedArticles = articles
      .sort((first, second) => second.originalDate.getTime() - first.originalDate.getTime())
      .slice(0, 5)
      .map((blogPost) => blogPost.content)
      .join('\n');

    return {
      summary: processPage(siteTemplate, summarizedArticles, context, { removeUnusedInputs: true })
        .text,
      articles: articles.map((article) => ({
        ...article,
        content: processPage(siteTemplate, article.content, {
          ...context,
          ogSlug: this.socialSlugger.generateOpenGraphSlug(context, article),
        }).text.concat(this.socialSlugger.generateDisqusSlug(context, article.url)),
      })),
    };
  }

  private isDraftArticle(date: Date): boolean {
    return date >= new Date(2200, 1, 1);
  }
}
