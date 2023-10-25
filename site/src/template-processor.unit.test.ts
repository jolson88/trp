import { describe, it, expect } from 'vitest';
import { processTemplate } from './template-processor';

describe('processTemplate', () => {
  it('should be case-insensitive for input values', () => {
    const result = processTemplate('Hello, ##name##');
    expect(result.inputMarkers).toEqual(['NAME']);
  });

  it('should detect multiple input values', () => {
    const text = 'Hello, ##FIRST_NAME## ##LAST_NAME##';

    const result = processTemplate('Hello, ##FIRST_NAME## ##LAST_NAME##');

    expect(result).toEqual(
      expect.objectContaining({
        text,
        inputMarkers: ['FIRST_NAME', 'LAST_NAME'],
      })
    );
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

    expect(result).toEqual(
      expect.objectContaining({
        text: 'Hello, World',
        outputMarkers: [
          ['TITLE', 'Foo'],
          ['AGE', '43'],
        ],
      })
    );
  });
});