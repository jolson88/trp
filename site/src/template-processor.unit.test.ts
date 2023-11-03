import { describe, it, expect } from 'vitest';
import { processPage } from './template-processor';

describe('processPage', () => {
  it('should generate page given templates and context', () => {
    const page = processPage('SITE ##CHILD##', 'CHILD_CONTENT', {});

    expect(page.text).toBe('SITE CHILD_CONTENT');
  });

  it('should support symbols in input names', () => {
    const page = processPage('##LONG-INPUT##', '', {});

    expect([...page.inputs]).toEqual(['LONG-INPUT']);
  });

  it('should return output metadata', () => {
    const page = processPage('SITE ##CHILD##', '##IMAGE: posts/img/foo-bar.jpg##FooContent', {});

    expect([...page.properties.entries()]).toEqual([['IMAGE', 'posts/img/foo-bar.jpg']]);
    expect(page.text).toEqual('SITE FooContent');
  });

  it('should format key names in metadata', () => {
    const page = processPage(
      'SITE ##CHILD##',
      '##IMAGE_WIDTH: 1024##\n##IMAGE-HEIGHT: 1024##\nFoo',
      {}
    );

    expect([...page.properties.entries()]).toEqual([
      ['IMAGE_WIDTH', '1024'],
      ['IMAGE-HEIGHT', '1024'],
    ]);
    expect(page.text).toEqual('SITE Foo');
  });

  it('should ignore key symbols when looking up into context', () => {
    const page = processPage('SITE ##OG-CARD## ##CHILD##', 'FooContent', {
      ogCard: 'SLUG',
    });

    expect(page.text).toEqual('SITE SLUG FooContent');
  });

  it('should contain output metadata from template and child', () => {
    const page = processPage('SITE ##TAG: Bar## ##CONTENT##', '##TITLE: Foo##', {});

    expect([...page.properties.entries()].sort()).toEqual(
      [
        ['TAG', 'Bar'],
        ['TITLE', 'Foo'],
      ].sort()
    );
  });

  it('should prioritize site template metadata over child metadata', () => {
    const page = processPage('SITE ##TITLE: Bar## ##CONTENT##', '##TITLE: Foo##', {});

    expect([...page.properties.entries()]).toEqual([['TITLE', 'Bar']].sort());
  });

  it('should be case-insensitive for input values', () => {
    const result = processPage('Hello, ##name##', '');
    expect([...result.inputs.keys()]).toEqual(['NAME']);
  });

  it('should detect multiple input values', () => {
    const result = processPage('Hello, ##FIRST## ##LAST##', '', { first: 'Hugh', last: 'Grant' });

    expect(result.text).toEqual('Hello, Hugh Grant');
    expect([...result.inputs].sort()).toEqual(['FIRST', 'LAST']);
  });

  it('should substitute different values', () => {
    const result = processPage('##greETing##, ##NAME##', '', {
      greeting: 'Hello',
      name: 'Jason',
    });

    expect(result.text).toBe('Hello, Jason');
  });

  it('should substitute all values', () => {
    const result = processPage('##NAME## ##NAME## ##NAME##', '', {
      name: 'Malkovich',
    });

    expect(result.text).toBe('Malkovich Malkovich Malkovich');
  });

  it('should substitute a property value for matching input in same page', () => {
    const result = processPage('##LAST-UPDATED: October 23rd, 2023##\n##LAST-UPDATED##', '', {});
    expect(result.text).toBe('October 23rd, 2023');
  });

  it('should detect multiple properties', () => {
    const result = processPage('Hello, World\n##TITLE: Foo##\n##age: 43##', '');

    expect(result.text).toEqual('Hello, World');
    expect([...result.properties.entries()].sort()).toEqual(
      [
        ['TITLE', 'Foo'],
        ['AGE', '43'],
      ].sort()
    );
  });

  it('should parse commas in property values', () => {
    const result = processPage('##LAST-UPDATED: October 23rd, 2023##', '', {});

    expect([...result.properties.entries()]).toEqual([['LAST-UPDATED', 'October 23rd, 2023']]);
  });
});
