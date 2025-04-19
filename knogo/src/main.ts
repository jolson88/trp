import net from "node:net";
import { GopherServer } from "./gopher.ts";

const PORT = 7070;

const server = net.createServer((socket: net.Socket) => {
    const port = PORT;
    const host = 'localhost';

    socket.setEncoding("utf-8");

    socket.once("data", (data: string) => {
        const selector = data.trim().replace(/\r?\n/, "");

        const gopher = GopherServer.create(host, port, socket);
        gopher.handleSelector(selector);
    });

    socket.on("error", (err) => {
        console.error("Socket error:", err);
    });
});

server.listen(PORT, () => {
    console.log(`Gopher server listening on port ${PORT}`);
});
