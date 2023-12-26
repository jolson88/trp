export enum TuiColor {
  Black = 0,
  Red = 1,
  Green = 2,
  Yellow = 3,
  Blue = 4,
  Magenta = 5,
  Cyan = 6,
  White = 7,
}

const tuiState = {
  lastKey: "",
  width: 0,
  height: 0,
};

export function tuiBegin(width: number, height: number) {
  tuiState.width = width;
  tuiState.height = height;

  process.stdout.write(`\x1b[2J${`\x1b[1;1H`}`);
}

export function tuiCursorTo(x: number, y: number) {
  process.stdout.write(`\x1b[${y};${x}H`);
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

export function tuiClearColor() {
  process.stdout.write("\x1b[0m");
}

export function tuiSetBackgroundColor(color: TuiColor) {
  process.stdout.write(`\x1b[${40 + color}m`);
}

export function tuiSetForegroundColor(color: TuiColor) {
  process.stdout.write(`\x1b[${30 + color}m`);
}

export function tuiText(
  text: string,
  { fullWidth = false }: { fullWidth?: boolean } = {}
) {
  process.stdout.write(
    `${fullWidth ? text.padEnd(tuiState.width) : text}`
  );
}

export enum TuiHorizontalRuleStyle {
  Normal = "\u2500",
  Bold = "\u2501",
  Double = "\u2550",
}

export function tuiRuleHorizontal(
  style: TuiHorizontalRuleStyle = TuiHorizontalRuleStyle.Normal
) {
  process.stdout.write(`${style.repeat(tuiState.width)}\n`);
}
