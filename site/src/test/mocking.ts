import { vi } from 'vitest';

export function mock<T>(obj: Partial<T>): T {
  return new Proxy({}, {
    get(_target, prop, _receiver) {
      return obj[prop] ?? vi.fn();
    }
  }) as unknown as T;
}