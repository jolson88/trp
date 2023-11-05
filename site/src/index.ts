import * as path from 'path';
import { existsSync } from 'fs';
import liveServer from 'live-server';
import * as fs from 'fs/promises';
import { SiteContext, SiteGenerator } from './site-generator';
import { Reporter } from './reporter';
import { FileService } from './file-service';

const serverParams: liveServer.LiveServerParams = {
  port: 8080,
  host: '127.0.0.1',
  file: 'index.html',
  open: true,
  wait: 300,
  logLevel: 2,
};

const siteContext: SiteContext = {
  siteTitle: 'The Reasonable Programmer',
  siteUrl: 'https://www.jolson88.com/',
  year: new Date().getFullYear(),
};

async function main(args: Array<string>): Promise<void> {
  if (args.length < 2) {
    console.error(
      'Must specify the relative template directory and output directory to write files into'
    );
    return process.exit(1);
  }

  const inputDir = args[0];
  const outputDir = args[1];
  const flag = args[2] ?? '';
  const isWatching = flag.toUpperCase() === '--WATCH';

  console.log('Resetting output directory:', outputDir);
  if (existsSync(outputDir)) {
    await fs.rm(outputDir, { recursive: true });
  }

  console.log('Copying public files to output directory');
  const publicDir = path.join(process.cwd(), 'public');
  await fs.cp(publicDir, outputDir, { recursive: true, force: true });

  await outputSite(inputDir, outputDir);
  if (!isWatching) {
    return;
  }

  console.log('Running live server');
  liveServer.start({
    ...serverParams,
    root: outputDir,
  });

  const watcher = fs.watch(inputDir, { recursive: true });
  for await (const _ of watcher) {
    console.log(`[${new Date()}] Changes detected in input files. Regenerating site.`);
    await outputSite(inputDir, outputDir);
  }

  console.log('Shutting down live server');
  liveServer.shutdown();
}

async function outputSite(inputDir: string, outputDir: string): Promise<void> {
  console.log('Generating site...\n');
  const reporter = new Reporter();
  const reportTracker = reporter.trackReports();
  const fileService = new FileService();
  const generator = new SiteGenerator({ inputDir, fileService, reporter });
  const siteFiles = await generator.generateSite(siteContext);

  const reportCount = reportTracker.data.length;
  if (reportCount > 0) {
    console.log(`There were ${reportCount} warning(s) or error(s) reported during generation:`);
    console.log(
      reportTracker.data.map((report) => `[${report.level}] ${report.message}`).join('\n')
    );
  }

  for (const siteFile of siteFiles) {
    await fileService.writeFile(path.join(outputDir, siteFile.path), siteFile.content);
  }
}

main(process.argv.slice(2)).catch(console.error);
