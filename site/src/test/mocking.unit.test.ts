import { describe, expect, it, vi } from 'vitest';
import { mock, mockPassthrough } from './mocking';

interface FooService {
  foo(): string;
  bar(): string;
}

describe('mock', () => {
  it('should be mockable and not fail unmocked methods', () => {
    const myMock = mock<FooService>({
      foo: vi.fn().mockReturnValue('Forks!'),
    });

    expect(myMock.foo()).toBe('Forks!');
    expect(() => myMock.bar()).not.toThrow();
  });

  it('should be mockable and passthrough other methods', () => {
    const myMock = mockPassthrough<FooService>(
      {
        foo: vi.fn().mockReturnValue('Forks!'),
      },
      {
        foo: () => 'foo',
        bar: () => 'bar',
      }
    );

    expect(myMock.foo()).toBe('Forks!');
    expect(myMock.bar()).toBe('bar');
  });
});
