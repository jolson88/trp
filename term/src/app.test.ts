import { describe, it, expect } from 'vitest';
import { App, OsService } from "./app";

describe("App", () => {
    it("should exit the app when ctrl+c", () => {
        const commands: Array<string> = [];
        const os = OsService.createNull();
        const app = new App(80, 24, os);
    
        os.onCommand(cmd => commands.push(cmd));
        app.sendKey("\u0003");
    
        expect(commands).toEqual(["exit()"]);
    });
});