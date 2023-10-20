import { describe, expect, it } from 'vitest';
import { TemplateProcessor } from './template-processor';

describe('TemplateProcessor', () => {
  const templater = new TemplateProcessor();

  it('should passthrough non-template value', () => {
    const result = templater.process('Hello, World');

    expect(result).toEqual({
      text: 'Hello, World',
      inputMarkers: [],
    });
  });

  it('should detect template values', () => {
    const result = templater.process('Hello, ##NAME##');

    expect(result).toEqual({
      text: 'Hello, ##NAME##',
      inputMarkers: ['NAME'],
    });
  });

  it('should detect multiple template values', () => {
    const text = 'Hello, ##FIRST_NAME## ##LAST_NAME##';

    const result = templater.process(text);

    expect(result).toEqual({
      text,
      inputMarkers: ['FIRST_NAME', 'LAST_NAME'],
    });
  });
});
