import * as path from 'path';
import { existsSync } from 'fs';
import * as fs from 'fs/promises';
import { createSite, loadSite } from './site-generator';

async function main(args: Array<string>): Promise<void> {
  if (args.length < 2) {
    console.error('Must specify the relative template directory and output directory to write files into');
    return process.exit(1);
  }

  const inputDir = path.join(process.cwd(), args[0]);
  const outputDir = path.join(process.cwd(), args[1]);

  console.log('Loading site from template directory:', inputDir);
  const site = await loadSite(inputDir);

  console.log('Resetting output directory:', outputDir);
  if (existsSync(outputDir)) {
    await fs.rm(outputDir, { recursive: true, });
  }

  console.log('Writing to output directory');
  const files = await createSite(site, outputDir);
  console.log('Site files', files);
}

main(process.argv.slice(2)).catch(console.error);