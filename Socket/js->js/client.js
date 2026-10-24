
const net = require("net");
const readline = require("readline");

const client = net.createConnection(
    { host: "127.0.0.1", port: 5000 },
    () => {
        console.log("Connected to server.");
        askCommand();
    }
);

const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let responseBuffer = "";

client.setEncoding("utf8");

function askCommand() {
    terminal.question("Enter command: ", (command) => {
        client.write(command + "\n");
    });
}

client.on("data", (data) => {
    responseBuffer += data;

    let newlineIndex;

    while ((newlineIndex = responseBuffer.indexOf("\n")) !== -1) {
        const response = responseBuffer.slice(0, newlineIndex).trim();
        responseBuffer = responseBuffer.slice(newlineIndex + 1);

        console.log("Server response:", response);

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
