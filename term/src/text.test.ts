import { describe, it, expect } from "vitest";
import {
  SpecialKeys,
  textCenter,
  textEditCreate,
  textEditInput,
  textEditMove,
} from "./text";

describe("Text", () => {
  it("should center text", () => {
    expect(textCenter("harry", 10)).toEqual("   harry  ");
    expect(textCenter("potter", 10)).toEqual("  potter  ");
  });
});

describe("TextEdit", () => {
  it("should input new text", () => {
    const editor = textEditCreate();

    textEditInput(editor, "hello");

    expect(editor.text).toEqual("hello");
    expect(editor.cursorLocation).toEqual(5);
  });

  it("should delete text from the end", () => {
    const editor = textEditCreate();

    textEditInput(editor, "hello");
    textEditInput(editor, SpecialKeys.backspace);

    expect(editor.text).toEqual("hell");
    expect(editor.cursorLocation).toEqual(4);
  });

  it("should delete text from the middle", () => {
    const editor = textEditCreate();

    textEditInput(editor, "hello");
    textEditMove(editor, 2);
    textEditInput(editor, SpecialKeys.delete);
    textEditInput(editor, SpecialKeys.backspace);

    expect(editor.text).toEqual("hlo");
    expect(editor.cursorLocation).toEqual(1);
  });
});
