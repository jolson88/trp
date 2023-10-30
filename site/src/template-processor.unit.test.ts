import { describe, it, expect } from 'vitest';
import { processPage, processTemplate } from './template-processor';

describe('processPage', () => {
  it('should generate page given templates and context', () => {
    const page = processPage('SITE ##CONTENT##', 'CHILD_CONTENT', {});

    expect(page.text).toBe('SITE CHILD_CONTENT');
  });

  it('should return output metadata', () => {
    const page = processPage('SITE ##CONTENT##', '##TITLE: Foo##', {});

    expect([...page.outputMarkers.entries()]).toEqual([['TITLE', 'Foo']]);
  });

  it('should contain output metadata from template and child', () => {
    const page = processPage('SITE ##TAG: Bar## ##CONTENT##', '##TITLE: Foo##', {});

    expect([...page.outputMarkers.entries()].sort()).toEqual(
      [
        ['TAG', 'Bar'],
        ['TITLE', 'Foo'],
      ].sort()
    );
  });

  it('should prioritize site template metadata over child metadata', () => {
    const page = processPage('SITE ##TITLE: Bar## ##CONTENT##', '##TITLE: Foo##', {});

    expect([...page.outputMarkers.entries()]).toEqual([['TITLE', 'Bar']].sort());
  });
});

describe('processTemplate', () => {
  it('should be case-insensitive for input values', () => {
    const result = processTemplate('Hello, ##name##');
    expect([...result.inputMarkers.keys()]).toEqual(['NAME']);
  });

  it('should remove unprovided input values', () => {
    const result = processTemplate('Hello##FOO##');
    expect(result.text).toEqual('Hello');
  });

  it('should detect multiple input values', () => {
    const result = processTemplate('Hello, ##FIRST## ##LAST##', { first: 'Hugh', last: 'Grant' });

    expect(result.text).toEqual('Hello, Hugh Grant');
    expect([...result.inputMarkers].sort()).toEqual(['FIRST', 'LAST']);
  });

  it('should substitute different values', () => {
    const result = processTemplate('##greETing##, ##NAME##', {
      greeting: 'Hello',
      name: 'Jason',
    });

    expect(result.text).toBe('Hello, Jason');
  });

  it('should substitute all values', () => {
    const result = processTemplate('##NAME## ##NAME## ##NAME##', {
      name: 'Malkovich',
    });

    expect(result.text).toBe('Malkovich Malkovich Malkovich');
  });

  it('should detect output values', () => {
    const result = processTemplate('Hello, World\n##TITLE: Foo##\n##age: 43##');

    expect(result.text).toEqual('Hello, World');
    expect([...result.outputMarkers.entries()].sort()).toEqual(
      [
        ['TITLE', 'Foo'],
        ['AGE', '43'],
      ].sort()
    );
  });
});
