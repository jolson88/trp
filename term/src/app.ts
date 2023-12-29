import { textCenter, textEditClear, textEditCreate, textEditInput } from "./text";
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

const headerDebug = `
     ┴─└┴|                 TTTTT  EEEEE  XX  XX               ┬┬─┘┬┬─┘         
       ─│├┬┼┌                TT   EEE      XX                   ├┬┼┌           
   ┬┬─┘└┐│┘├─┴┘ │            TT   EEEEE  XX  XX               ┤─┐└│┬┘┴└ │┐┴─└  
    │─┬┤┌└┤┬                                                 ┬┌┬─┘┤ ┬┌┬─┘┤ ┬   
  └┐│┘├─┴┘                     <DEBUGGER>                      ┴─└│┬┘┴└ │┐┴─└┴|`;
const headerNeural = `
     ┴─└┴|                 TTTTT  EEEEE  XX  XX               ┬┬─┘┬┬─┘         
       ─│├┬┼┌                TT   EEE      XX                   ├┬┼┌           
   ┬┬─┘└┐│┘├─┴┘ │            TT   EEEEE  XX  XX               ┤─┐└│┬┘┴└ │┐┴─└  
    │─┬┤┌└┤┬                                                 ┬┌┬─┘┤ ┬┌┬─┘┤ ┬    
  └┐│┘├─┴┘                  <Neural Interface>                 ┴─└│┬┘┴└ │┐┴─└┴|`;

export class App {
  private textEdit = textEditCreate();
  private showDebug = false;

  constructor(private width: number, private height: number) {
    this.render();
  }

  renderDebugView() {
    tuiBegin(this.width, this.height);
    tuiSetBackgroundColor(TuiColor.Red);
    tuiSetForegroundColor(TuiColor.White);
    const headerLines = headerDebug.split("\n").splice(1);
    for(const headerLine of headerLines) {
      tuiText(headerLine, { fullWidth: true });
    }
    tuiRuleHorizontal();

    for (let bgColor = 0; bgColor < 8; bgColor++) {
      tuiSetBackgroundColor(bgColor);
      for (let fgColor = 0; fgColor < 8; fgColor++) {
        tuiSetForegroundColor(fgColor);
        tuiText(" Hellorld ");
      }
      tuiText("\n");
    }
    tuiEnd();
  }

  render() {
    if (this.showDebug) {
      this.renderDebugView();
      return;
    }

    tuiBegin(this.width, this.height);

    tuiSetForegroundColor(TuiColor.Green);
    const headerLines = headerNeural.split("\n").splice(1);
    for(const headerLine of headerLines) {
      tuiText(textCenter(headerLine, this.width));
    }

    tuiSetForegroundColor(TuiColor.White);
    const stackCount = 6;
    const cellWidth = Math.floor(this.width / stackCount);
    const cellHeight = 5;
    const activeStack = 1;
    for (let row = 0; row < cellHeight; row++) {
      let buffer = "";
      for (let i = 0; i < stackCount; i++) {
        if (row === 0) {
            buffer += ((i === activeStack) ? "\u2501" : "\u2500").repeat(cellWidth);
            if (i !== stackCount - 1) {
              buffer += (i === activeStack) ? "\u2531" : (i + 1 === activeStack) ? "\u2532" : "\u252C";
            }
        }
        if (row === 1) {
          buffer += textCenter(`[${i + 1}]`, cellWidth);
          if (i !== stackCount - 1) {
            buffer += (i === activeStack || i + 1 === activeStack) ? "\u2503" : "\u2502";
          }
        }
        if (row === (cellHeight - 1)) {
          buffer += ((i === activeStack) ? "\u2501" : "\u2500").repeat(cellWidth);
          if (i !== stackCount - 1) {
            buffer += (i === activeStack) ? "\u2539" : (i + 1 === activeStack) ? "\u253A" : "\u2534";
          }
        }
      }
      tuiText(buffer.substring(0, this.width));
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
