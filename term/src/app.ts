import { textEditClear, textEditCreate, textEditInput } from "./text";
import { tuiBegin, tuiCursorTo, tuiEnd, tuiPrompt, tuiSendKey, tuiText } from "./tui";

const assert = require("assert");

export class App {
  private textEdit = textEditCreate();
  private history = new Array<string>();

  constructor(private width: number, private height: number) {
    this.render();
  }

  render() {
    tuiBegin();
    if (tuiPrompt(this.textEdit.text)) {
      this.history.push(this.textEdit.text);
      textEditClear(this.textEdit);
    }

    for (let i = 0; i < Math.min(this.history.length, this.height - 3); i++) {
      tuiText(this.history[this.history.length - i - 1]);
    }

    tuiCursorTo(3 + this.textEdit.cursorLocation, 1);
    tuiEnd();
  }

  sendKey(key: string) {
    switch (key) {
      case "\u0003":
        process.exit();
      default:
        textEditInput(this.textEdit, key);
        tuiSendKey(key);
    }

    this.render();
  }
}
