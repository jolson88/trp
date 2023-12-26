import { textEditClear, textEditCreate, textEditInput } from "./text";
import {
  TuiColor,
  tuiBegin,
  tuiClearColor,
  tuiCursorTo,
  tuiEnd,
  tuiPrompt,
  tuiRuleHorizontal,
  tuiSendKey,
  tuiSetBackgroundColor,
  tuiSetForegroundColor,
  tuiText,
} from "./tui";

const headerDebug = `     ┴─└┴|                 TTTTT  EEEEE  XX  XX               ┬┬─┘┬┬─┘
       ─│├┬┼┌                TT   EEE      XX                   ├┬┼┌
   ┬┬─┘└┐│┘├─┴┘ │            TT   EEEEE  XX  XX               ┤─┐└│┬┘┴└ │┐┴─└
    │─┬┤┌└┤┬                                                 ┬┌┬─┘┤ ┬┌┬─┘┤ ┬
  └┐│┘├─┴┘                     <DEBUGGER>                      ┴─└│┬┘┴└ │┐┴─└┴|
`;
const headerNeural = `     ┴─└┴|                 TTTTT  EEEEE  XX  XX               ┬┬─┘┬┬─┘
       ─│├┬┼┌                TT   EEE      XX                   ├┬┼┌
   ┬┬─┘└┐│┘├─┴┘ │            TT   EEEEE  XX  XX               ┤─┐└│┬┘┴└ │┐┴─└
    │─┬┤┌└┤┬                                                 ┬┌┬─┘┤ ┬┌┬─┘┤ ┬
    ┴─┴                                                           ┴┴┴┴┘┴ ┴
  └┐│┘├─┴┘                  <Neural Interface>                 ┴─└│┬┘┴└ │┐┴─└┴|
    ─│├┬┼┌                                                           ├┬┼┌
`;

export class App {
  private textEdit = textEditCreate();
  private showDebug = false;

  constructor(private width: number, private height: number) {
    this.render();
  }

  render() {
    tuiBegin(this.width, this.height);
    if (!this.showDebug) {
      tuiSetBackgroundColor(TuiColor.Red);
      tuiSetForegroundColor(TuiColor.White);
      const headerLines = headerDebug.split("\n");
      for(const headerLine of headerLines) {
        tuiText(headerLine, { fullWidth: true });
      }
      tuiText(" [TEX]: I certainly hope you know what you are doing!", { fullWidth: true });
      tuiRuleHorizontal();

      tuiText("\n\n\n");
      for (let bgColor = 0; bgColor < 8; bgColor++) {
        tuiSetBackgroundColor(bgColor);
        for (let fgColor = 0; fgColor < 8; fgColor++) {
          tuiSetForegroundColor(fgColor);
          tuiText(" Hellorld ");
        }
        tuiText("\n");
      }
    } else {
      tuiSetForegroundColor(TuiColor.Green);
      tuiText(headerNeural);
      tuiRuleHorizontal();
    }

    tuiClearColor();
    tuiCursorTo(1, this.height - 1);
    if (tuiPrompt(this.textEdit.text)) {
      // TODO: Handle command
      textEditClear(this.textEdit);
    }

    tuiCursorTo(3 + this.textEdit.cursorLocation, this.height - 1);
    tuiEnd();
  }

  sendKey(key: string) {
    switch (key) {
      case "\u0003":
        process.exit();
      case "\u001b[24~": // F12
        this.showDebug = !this.showDebug;
        tuiClearColor();
        break;
      default:
        textEditInput(this.textEdit, key);
        tuiSendKey(key);
    }

    this.render();
  }
}
