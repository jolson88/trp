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

function termClearColor(): string {
  return "\x1b[0m";
}

function termClearLine(): string {
  return "\x1b[2K";
}

function termClearScreen(): string {
  return "\x1b[2J";
}

function termCursorTo(x: number, y: number) {
  return `\x1b[${y};${x}H`;
}

function termSetColor(color: TerminalColor) {
  return `\x1b[${color}m`;
}

const tuiState = {
  lastKey: "",
};

export function tuiBegin() {
  process.stdout.write(`${termClearScreen()}${termCursorTo(1, 1)}`);
}

export function tuiCursorTo(x: number, y: number) {
  process.stdout.write(termCursorTo(x, y));
}

export function tuiEnd() {}

export function tuiSendKey(key: string) {
  tuiState.lastKey = key.replace("\r\n", "\n");
}

export function tuiPrompt(text: string): boolean {
  if (tuiState.lastKey === "\u000d") {
    process.stdout.write(`> \n`);
    return true;
  }

  process.stdout.write(`> ${text}\n`);
  return false;
}

export function tuiText(text: string) {
  process.stdout.write(`${text}\n`);
}
