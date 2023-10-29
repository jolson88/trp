import * as path from 'path';
import { existsSync } from 'fs';
import * as fs from 'fs/promises';
import { generateSite } from './site-generator';

async function main(args: Array<string>): Promise<void> {
  if (args.length < 2) {
    console.error(
      'Must specify the relative template directory and output directory to write files into'
    );
    return process.exit(1);
  }

  const inputDir = path.join(process.cwd(), args[0]);
  const outputDir = path.join(process.cwd(), args[1]);

  console.log('Resetting output directory:', outputDir);
  if (existsSync(outputDir)) {
    await fs.rm(outputDir, { recursive: true });
  }

  console.log('Copying public files to output directory');
  const publicDir = path.join(process.cwd(), 'public');
  await fs.cp(publicDir, outputDir, { recursive: true, force: true });

  console.log('Generating site...\n');
  await generateSite(inputDir, outputDir);
}

main(process.argv.slice(2)).catch(console.error);
