import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { _readSiteFile, _writeSiteFile, loadSite } from '../src/site-generator';
import * as path from 'path';
import { existsSync } from 'fs';
import * as fs from 'fs/promises';
import { givenContext, givenSite } from './site-generation.unit.test';

describe('Loading Site', () => {
  it('should load test site and match unit test givens', async () => {
    const actualSite = await loadSite(path.join(__dirname, 'data', 'site'), givenContext);
    expect(actualSite).toEqual(givenSite);
  });
});

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
    const givenContent = 'StartBase ##CONTENT## EndBase';

    const ok = await _writeSiteFile(testFile, givenContent);
    expect(ok).toBeTruthy();

    const actualContent = await _readSiteFile(testFile);
    expect(actualContent).toBe('StartBase ##CONTENT## EndBase');
  });
});
