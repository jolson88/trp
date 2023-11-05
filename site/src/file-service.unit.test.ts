import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import * as path from 'path';
import { existsSync } from 'fs';
import * as fs from 'fs/promises';
import { FileService, parseInfoFromFileName } from './file-service';

describe('parseInfoFromFileName', () => {
  it('should use default if no date in file name', () => {
    const fileInfo = parseInfoFromFileName('foo.html');
    expect(fileInfo.date).toEqual(new Date(1970, 1, 1));
  });

  it('should use default if first three parts are not numbers', () => {
    const fileInfo = parseInfoFromFileName('foo-bar-baz-quux-quuz.html');
    expect(fileInfo.date).toEqual(new Date(1970, 1, 1));
  });
});

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
    const postDir = 'src/test/data/site/blog';

    const files = await fileService.readDirectory(postDir);

    expect(files).toEqual([
      { path: path.join(postDir, '2023-01-01-foo.html'), content: 'Foo' },
      { path: path.join(postDir, '2023-02-02-bar.html'), content: 'Bar' },
      { path: path.join(postDir, '2023-03-03-baz.html'), content: 'Baz' },
    ]);
  });
});
