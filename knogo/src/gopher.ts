export class GopherServer {
    private _host: string;
    private _port: number;
    private _socket;

    static create(host: string, port: number, socket): GopherServer {
        return new GopherServer(host, port, socket);
    }

    constructor(host: string, port: number, socket) {
        this._host = host;
        this._port = port;
        this._socket = socket;
    }

    handleSelector(selector: string) {
        console.log("Selector received: ", selector);
        if (selector === "") {
            this._socket.write(`1About\t/about\t${this._host}\t${this._port}\r\n`);
            this._socket.write(`1Contact\t/contact\t${this._host}\t${this._port}\r\n`);
        } else if (selector === "/about") {
            this._socket.write(`iWelcome to the TypeScript Gopher Server!\tfake\t(NULL)\t0\r\n`);
            this._socket.write(`1Back\t/\t${this._host}\t${this._port}\r\n`);
        } else {
            this._socket.write(`3Unknown selector: ${selector}\tfake\t(NULL)\t0\r\n`);
            this._socket.write(`1Back\t/\t${this._host}\t${this._port}\r\n`);
        }

        this._socket.write(".\r\n");
        this._socket.end();
    }
}