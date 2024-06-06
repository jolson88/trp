import { App } from "./app";

async function main() {
  const [columnCount, rowCount] = process.stdout.getWindowSize();

  const height = rowCount;
  const width = columnCount;

  const app = new App(width, height);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (key: string) => {
    app.sendKey(key);
  });
}

main().catch(console.error);