import { describe, it, expect } from "vitest";
import { processPage, processTemplate } from "./template-processor";

describe("processPage", () => {
  it("should generate page given templates and context", () => {
    const page = processPage("SITE ##CONTENT##", "CHILD_CONTENT", {});

    expect(page.text).toBe("SITE CHILD_CONTENT");
  });

  it("should return output metadata", () => {
    const page = processPage("SITE ##CONTENT##", "##TITLE: Foo##", {});

    expect(page.outputMarkers).toEqual([["TITLE", "Foo"]]);
  });

  it("should contain output metadata from template and child", () => {
    const page = processPage(
      "SITE ##TAG: Bar## ##CONTENT##",
      "##TITLE: Foo##",
      {}
    );

    expect(page.outputMarkers.sort()).toEqual(
      [
        ["TAG", "Bar"],
        ["TITLE", "Foo"],
      ].sort()
    );
  });

  it("should prioritize site template metadata over child metadata", () => {
    const page = processPage(
      "SITE ##TITLE: Bar## ##CONTENT##",
      "##TITLE: Foo##",
      {}
    );

    expect(page.outputMarkers.sort()).toEqual([["TITLE", "Bar"]].sort());
  });
});

describe("processTemplate", () => {
  it("should be case-insensitive for input values", () => {
    const result = processTemplate("Hello, ##name##");
    expect(result.inputMarkers).toEqual(["NAME"]);
  });

  it("should detect multiple input values", () => {
    const text = "Hello, ##FIRST_NAME## ##LAST_NAME##";

    const result = processTemplate("Hello, ##FIRST_NAME## ##LAST_NAME##");

    expect(result).toEqual(
      expect.objectContaining({
        text,
        inputMarkers: ["FIRST_NAME", "LAST_NAME"],
      })
    );
  });

  it("should substitute different values", () => {
    const result = processTemplate("##greETing##, ##NAME##", {
      greeting: "Hello",
      name: "Jason",
    });

    expect(result.text).toBe("Hello, Jason");
  });

  it("should substitute all values", () => {
    const result = processTemplate("##NAME## ##NAME## ##NAME##", {
      name: "Malkovich",
    });

    expect(result.text).toBe("Malkovich Malkovich Malkovich");
  });

  it("should detect output values", () => {
    const result = processTemplate("Hello, World\n##TITLE: Foo##\n##age: 43##");

    expect(result).toEqual(
      expect.objectContaining({
        text: "Hello, World",
        outputMarkers: [
          ["TITLE", "Foo"],
          ["AGE", "43"],
        ],
      })
    );
  });
});
