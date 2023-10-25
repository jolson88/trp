import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import * as path from 'path';
import { existsSync } from 'fs';
import * as fs from 'fs/promises';
import { FileService } from './file-service';

describe('File Services', () => {
  const testFile = path.join(__dirname, 'foo/bar/baz/output.txt');

  afterAll(async () => {
    if (existsSync(testFile)) {
      await fs.rm(path.join(__dirname, 'foo'), { recursive: true });
    }
  });

  beforeEach(async () => {
    if (existsSync('foo')) {
      await fs.rm(path.join(__dirname, 'foo'), { recursive: true });
    }
  });

  it('should read and write a file', async () => {
    const fileService = new FileService();
    const givenContent = 'StartBase ##CONTENT## EndBase';

    const ok = await fileService.writeFile(testFile, givenContent);
    expect(ok).toBeTruthy();

    const actualContent = await fileService.readFile(testFile);
    expect(actualContent.content).toBe('StartBase ##CONTENT## EndBase');
  });
});
