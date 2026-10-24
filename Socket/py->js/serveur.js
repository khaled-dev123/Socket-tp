
const net = require("net");
const fs = require("fs");

class Item {
    constructor(id, name, price, quantity) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }
}

class Stock {
    constructor(filename) {
        this.items = [];

        const content = fs.readFileSync(filename, "utf8");
        const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");

        // Skip CSV header
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",");

            if (values.length < 4) continue;

            const id = Number(values[0].trim());
            const name = values[1].trim();
            const price = Number(values[2].trim());
            const quantity = Number(values[3].trim());

            if (
                !Number.isInteger(id) ||
                !Number.isFinite(price) ||
                !Number.isInteger(quantity)
            ) {
                throw new Error(`Invalid data on line ${i + 1}`);
            }

            this.items.push(new Item(id, name, price, quantity));
        }

        console.log(`Loaded ${this.items.length} items.`);
    }

    find(id) {
        return this.items.find(item => item.id === id) || null;
    }

    process(command) {
        const parts = command.trim().split(/\s+/);

        if (parts[0] === "name" && parts.length === 2) {
            const id = Number(parts[1]);
            if (!Number.isInteger(id)) return "Invalid command or ID";

            const item = this.find(id);
            return item ? item.name : "Item not found";
        }

        if (parts[0] === "quantity" && parts.length === 2) {
            const id = Number(parts[1]);
            if (!Number.isInteger(id)) return "Invalid command or ID";

            const item = this.find(id);
            return item ? String(item.quantity) : "Item not found";
        }

        if (parts[0] === "price" && parts.length === 3) {
            const id = Number(parts[1]);
            const qty = Number(parts[2]);

            if (!Number.isInteger(id) || !Number.isInteger(qty)) {
                return "Invalid command or ID";
            }

            const item = this.find(id);
            return item ? String(item.price * qty) : "Item not found";
        }

        return "Unknown command";
    }
}

function main() {
    const stock = new Stock("data.cdv");

    const server = net.createServer(socket => {
        console.log("Python client connected:", socket.remoteAddress);
        socket.setEncoding("utf8");

        let buffer = "";

        socket.on("data", data => {
            buffer += data;
            let index;

            while ((index = buffer.indexOf("\n")) !== -1) {
                const command = buffer.slice(0, index).trim();
                buffer = buffer.slice(index + 1);

                console.log("Command:", command);

                if (command === "end") {
                    socket.write("Goodbye\n");
                    socket.end();
                    return;
                }

                socket.write(stock.process(command) + "\n");
            }
        });

        socket.on("end", () => {
            console.log("Client disconnected.");
        });

        socket.on("error", error => {
            console.error("Socket error:", error.message);
        });
    });

    server.on("error", error => {
        console.error("Server error:", error.message);
    });

    server.listen(5000, "127.0.0.1", () => {
        console.log("JavaScript server listening on port 5000");
    });
}

try {
    main();
} catch (error) {
    console.error("Startup error:", error.message);
    process.exitCode = 1;
}
