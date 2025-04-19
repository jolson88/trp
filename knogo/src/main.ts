import net from "node:net";

const PORT = 7070;

const server = net.createServer((socket: net.Socket) => {
    socket.setEncoding("utf-8");

    socket.once("data", (data: string) => {
        const selector = data.trim().replace(/\r?\n/, "");
        console.log("Selector received: ", selector);

        if (selector === "") {
            socket.write(`1About\t/about\tlocalhost\t${PORT}\r\n`);
            socket.write(`1Contact\t/contact\tlocalhost\t${PORT}\r\n`);
        } else if (selector === "/about") {
            socket.write(`iWelcome to the TypeScript Gopher Server!\tfake\t(NULL)\t0\r\n`);
            socket.write(`1Back\t/\tlocalhost\t${PORT}\r\n`);
        } else {
            socket.write(`3Unknown selector: ${selector}\tfake\t(NULL)\t0\r\n`);
            socket.write(`1Back\t/\tlocalhost\t${PORT}\r\n`);
        }

        socket.write(".\r\n");
        socket.end();
    });

    socket.on("error", (err) => {
        console.error("Socket error:", err);
    });
});

server.listen(PORT, () => {
    console.log(`Gopher server listening on port ${PORT}`);
});
