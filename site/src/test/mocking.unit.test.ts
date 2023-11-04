import { describe, expect, it, vi } from "vitest";
import { mock } from "./mocking";

interface FooService {
  foo(): string;
  bar(): string;
}

describe("mock", () => {
  it("should be mockable and not fail unmocked methods", () => {
    const myMock = mock<FooService>({
      foo: vi.fn().mockReturnValue("Forks!"),
    });

    expect(myMock.foo()).toBe("Forks!");
    expect(() => myMock.bar()).not.toThrow();
  });
});
