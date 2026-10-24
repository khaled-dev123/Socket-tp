
const net = require("net");
const readline = require("readline");

const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client = net.createConnection(
    { host: "127.0.0.1", port: 5000 },
    () => {
        console.log("Connected to Java server.");
        askCommand();
    }
);

client.setEncoding("utf8");

let buffer = "";
let waitingForResponse = false;

function askCommand() {
    if (client.destroyed || waitingForResponse) return;

    terminal.question("Enter command: ", (command) => {
        waitingForResponse = true;
        client.write(command + "\n");
    });
}

client.on("data", (data) => {
    buffer += data;
    let index;

    while ((index = buffer.indexOf("\n")) !== -1) {
        const response = buffer.slice(0, index).trim();
        buffer = buffer.slice(index + 1);

        console.log("Server response:", response);
        waitingForResponse = false;

        if (response === "Goodbye") {
            terminal.close();
            client.end();
            return;
        }

        askCommand();
    }
});

client.on("end", () => {
    console.log("Connection closed.");
    terminal.close();
});

client.on("error", (error) => {
    console.error("Connection error:", error.message);
    terminal.close();
});
