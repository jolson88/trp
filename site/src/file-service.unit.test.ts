import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import * as path from 'path';
import { existsSync } from 'fs';
import * as fs from 'fs/promises';
import { FileService } from './file-service';

describe('File Services', () => {
  const testFile = path.join(__dirname, 'foo/bar/baz/output.txt');
  let fileService: FileService;

  afterAll(async () => {
    if (existsSync(testFile)) {
      await fs.rm(path.join(__dirname, 'foo'), { recursive: true });
    }
  });

  beforeEach(async () => {
    fileService = new FileService();

    if (existsSync('foo')) {
      await fs.rm(path.join(__dirname, 'foo'), { recursive: true });
    }
  });

  it('should read and write a file', async () => {
    const givenContent = 'StartBase ##CONTENT## EndBase';

    const ok = await fileService.writeFile(testFile, givenContent);
    expect(ok).toBeTruthy();

    const actualContent = await fileService.readFile(testFile);
    expect(actualContent.content).toBe('StartBase ##CONTENT## EndBase');
  });

  it('should read a directory non-recursively', async () => {
    const postDir = 'src/test/data/site/posts';

    const files = await fileService.readDirectory(postDir);

    expect(files).toEqual([
      { path: path.join(postDir, '2023-01-01-foo.html'), content: 'Foo' },
      { path: path.join(postDir, '2023-02-02-bar.html'), content: 'Bar' },
      { path: path.join(postDir, '2023-03-03-baz.html'), content: 'Baz' },
    ])
  });

});
