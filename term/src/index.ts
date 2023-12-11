const assert = require("assert");

enum TerminalColor {

  ForegroundBegin = 30,
  ForegroundBlack = 30,
  ForegroundRed = 31,
  ForegroundGreen = 32,
  ForegroundYellow = 33,
  ForegroundBlue = 34,
  ForegroundMagenta = 35,
  ForegroundCyan = 36,
  ForegroundWhite = 37,
  ForegroundEnd = 37,

  BackgroundBegin = 40,
  BackgroundBlack = 40,
  BackgroundRed = 41,
  BackgroundGreen = 42,
  BackgroundYellow = 43,
  BackgroundBlue = 44,
  BackgroundMagenta = 45,
  BackgroundCyan = 46,
  BackgroundWhite = 47,
  BackgroundEnd = 47,
}

class Terminal {
  private buffer: Array<string>;
  private commands: string;

  constructor(private width: number, private height: number) {
    this.buffer = [];
    this.commands = "";
  }

  clearColor() {
    this.commands += "\x1b[0m";
  }

  clearTerminal() {
    this.commands += "\x1b[2J";
  }

  cursorTo(x: number, y: number) {
    assert(x >= 1 && x <= this.width, `x must be between 1 and ${this.width}, but was ${x}`);
    assert(y >= 1 && y <= this.height, `y must be between 1 and ${this.height}, but was ${y}`);

    this.commands += `\x1b[${y};${x}H`;
  }

  setColor(color: TerminalColor) {
    this.commands += `\x1b[${color}m`;
  }

  read() {
    const buffer = [...this.buffer];
    this.buffer = [];
    return buffer;
  }

  write(text: string) {
    this.buffer.push(`${this.commands}${text}`);
    this.commands = "";
  }
}

async function main() {
  const text = "Hello, World!";
  const [columnCount, rowCount] = process.stdout.getWindowSize();

  const terminal = new Terminal(columnCount, rowCount);
  terminal.clearTerminal();
  terminal.write("");
  console.log(terminal.read().join(""));

  let x = 1;
  let xOffset = 1;
  let y = 1;
  let yOffset = 1;
  let colorOffset = 0;
  for (let i = 0; i < rowCount * 4; i ++) {
    terminal.cursorTo(x, y);
    terminal.setColor(TerminalColor.ForegroundBegin + colorOffset);
    terminal.write(text);
    terminal.clearColor();

    if (x === 1) {
      xOffset = 1;
    } else if (x + text.length === columnCount) {
      xOffset = -1;
    }
    if (y === 1) {
      yOffset = 1;
    } else if (y  === rowCount - 1) {
      yOffset = -1;
    }

    x += xOffset;
    y += yOffset;
    colorOffset = (colorOffset + 1) % (TerminalColor.ForegroundEnd - TerminalColor.ForegroundBegin + 1);
  }

  const bufferedCommands = terminal.read();
  for (let i = 0; i < bufferedCommands.length; i++) {
    console.log(bufferedCommands[i]);

    if (i < bufferedCommands.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 / 30));
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 3000));
  terminal.clearTerminal();
  terminal.write("");
  console.log(terminal.read().join(""));
}

main().catch(console.error);