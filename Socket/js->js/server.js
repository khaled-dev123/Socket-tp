
const net = require("net");
const fs = require("fs");
const readline = require("readline");

// Business logic
class Item {
    constructor(id, name, price, quantity) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }

    toString() {
        return `Item(id=${this.id}, name="${this.name}", price=${this.price}, quantity=${this.quantity})`;
    }
}

class Stock {
    constructor(filename) {
        this.items = [];

        try {
            const content = fs.readFileSync(filename, "utf8");
            const lines = content.trim().split(/\r?\n/);

            // Skip the CSV header
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(",");

                if (values.length < 4) continue;

                this.items.push(
                    new Item(
                        parseInt(values[0]),
                        values[1],
                        parseFloat(values[2]),
                        parseInt(values[3])
                    )
                );
            }

            console.log(`Loaded ${this.items.length} items.`);
        } catch (error) {
            console.error("Error loading stock:", error.message);
        }
    }

    getElement(id) {
        return this.items.find(item => item.id === id) || null;
    }

    getName(id) {
        const item = this.getElement(id);
        return item ? item.name : "Item not found";
    }

    getQuantity(id) {
        const item = this.getElement(id);
        return item ? item.quantity : "Item not found";
    }

    getPrice(id, qty) {
        const item = this.getElement(id);
        return item ? item.price * qty : "Item not found";
    }
}

// TCP server
class Server {
    constructor(stock) {
        this.stock = stock;
    }

    serve(port) {
        const server = net.createServer((socket) => {
            console.log("Client connected:", socket.remoteAddress);

            let buffer = "";

            socket.setEncoding("utf8");

            socket.on("data", (data) => {
                buffer += data;

                // TCP is a byte stream, so process complete lines.
                let newlineIndex;

                while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
                    const command = buffer.slice(0, newlineIndex).trim();
                    buffer = buffer.slice(newlineIndex + 1);

                    console.log("Command:", command);

                    const parts = command.split(/\s+/);
                    let response;

                    if (parts[0] === "end") {
                        socket.write("Goodbye\n");
                        socket.end();
                        return;
                    }

                    try {
                        if (parts[0] === "name" && parts.length === 2) {
                            const id = Number(parts[1]);

                            if (!Number.isInteger(id)) throw new Error();
                            response = this.stock.getName(id);

                        } else if (parts[0] === "quantity" && parts.length === 2) {
                            const id = Number(parts[1]);

                            if (!Number.isInteger(id)) throw new Error();
                            response = this.stock.getQuantity(id);

                        } else if (parts[0] === "price" && parts.length === 3) {
                            const id = Number(parts[1]);
                            const qty = Number(parts[2]);

                            if (!Number.isInteger(id) || !Number.isInteger(qty)) {
                                throw new Error();
                            }

                            response = this.stock.getPrice(id, qty);

                        } else {
                            response = "Unknown command";
                        }
                    } catch {
                        response = "Invalid command or ID";
                    }

                    socket.write(String(response) + "\n");
                }
            });

            socket.on("end", () => {
                console.log("Client disconnected.");
            });

            socket.on("error", (error) => {
                console.error("Socket error:", error.message);
            });
        });

        server.listen(port, "127.0.0.1", () => {
            console.log(`Server started on port ${port}`);
            console.log("Waiting for a client...");
        });
    }
}

const stock = new Stock("data.cdv");
const server = new Server(stock);

server.serve(5000);
