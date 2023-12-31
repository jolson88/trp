import { vi } from 'vitest';

export function mock<T>(obj: Partial<T>): T {
  return new Proxy({}, {
    get(_target, prop, _receiver) {
      return obj[prop] ?? vi.fn();
    }
  }) as unknown as T;
}

export function mockPassthrough<T>(obj: Partial<T>, passthrough: T): T {
  return new Proxy({}, {
    get(_target, prop, _receiver) {
      return obj[prop] ?? passthrough[prop];
    }
  }) as unknown as T;
}