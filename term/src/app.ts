import { EventEmitter } from "node:events";
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
  private commands: string;

  constructor(private width: number, private height: number) {
    this.commands = "";
  }

  clearColor() {
    this.commands += "\x1b[0m";
  }

  clearLine() {
    this.commands += "\x1b[2K";
  }

  clearTerminal() {
    this.commands += "\x1b[2J";
  }

  cursorTo(x: number, y: number) {
    assert(x >= 1 && x <= this.width, `x must be between 1 and ${this.width}, but was ${x}`);
    assert(y >= 1 && y <= this.height, `y must be between 1 and ${this.height}, but was ${y}`);

    this.commands += `\x1b[${y};${x}H`;
  }

  setSlowBlink() {
    this.commands += "\x1b[5m";
  }

  setColor(color: TerminalColor) {
    this.commands += `\x1b[${color}m`;
  }

  setBackgroundColor(color: number) {
    assert(color >= 0 && color <= 255, `color must be between 0 and 255, but was ${color}`);

    this.commands += `\x1b[48:5:${color}m`;
  }

  setForegroundColor(color: number) {
    assert(color >= 0 && color <= 255, `color must be between 0 and 255, but was ${color}`);

    this.commands += `\x1b[38:5:${color}m`;
  }

  write(text: string): string {
    return `${this.commands}${text}`;
  }
}

interface Process {
    exit(): void;
    write(text: string): void;
}

class NodeProcess implements Process {
    exit() {
        process.exit();
    }

    write(text: string) {
        process.stdout.write(text);
    }
}

class StubProcess implements Process {
    exit() {
        return;
    }

    write(text: string) {
        return;
    }
}

export class OsService {
    private emitter: EventEmitter;

    constructor(private process: Process = new NodeProcess()) {
        this.emitter = new EventEmitter();
    }

    static createNull(): OsService {
        return new OsService(new StubProcess());
    }

    onCommand(listener: (cmd: string) => void) {
        this.emitter.on("cmd", listener);
    }

    exit() {
        this.process.exit();
        this.emitter.emit("cmd", "exit()");
    }

    write(text: string) {
        this.process.write(text);
        this.emitter.emit("cmd", `write(${text})`);
    }
}


export class App {
    private terminal: Terminal;

    constructor(private width: number, private height: number, private os: OsService = new OsService()) {
        this.terminal = new Terminal(width, height);
        this.terminal.clearTerminal();
        this.terminal.cursorTo(1, 1);
        this.os.write(this.terminal.write(" > "));
    }

    sendKey(key: string) {
        switch (key) {
            case "\u0003":
                this.os.exit();
                break;
            default:

        }
    }
}