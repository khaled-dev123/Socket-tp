
import socket
import csv


class Item:
    def __init__(self, id, name, price, quantity):
        self.id = id
        self.name = name
        self.price = price
        self.quantity = quantity


class Stock:
    def __init__(self, filename):
        self.items = []
        with open(filename, newline="", encoding="utf-8") as f:
            reader = csv.reader(f)
            next(reader, None)
            for row in reader:
                if len(row) >= 4:
                    self.items.append(Item(
                        int(row[0]), row[1],
                        float(row[2]), int(row[3])
                    ))

    def find(self, id):
        return next((x for x in self.items if x.id == id), None)

    def process(self, command):
        parts = command.split()

        try:
            if len(parts) == 2 and parts[0] == "name":
                item = self.find(int(parts[1]))
                return item.name if item else "Item not found"

            if len(parts) == 2 and parts[0] == "quantity":
                item = self.find(int(parts[1]))
                return str(item.quantity) if item else "Item not found"

            if len(parts) == 3 and parts[0] == "price":
                item = self.find(int(parts[1]))
                if not item:
                    return "Item not found"
                return str(item.price * int(parts[2]))

            return "Unknown command"
        except ValueError:
            return "Invalid command or ID"


def main():
    stock = Stock("data.csv")

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind(("127.0.0.1", 5000))
        server.listen(1)

        print("Python server listening on port 5000")

        while True:
            conn, addr = server.accept()
            print("Client connected:", addr)

            with conn:
                reader = conn.makefile("r", encoding="utf-8")
                writer = conn.makefile("w", encoding="utf-8")

                with reader, writer:
                    for line in reader:
                        command = line.strip()
                        print("Command:", command)

                        if command == "end":
                            writer.write("Goodbye\n")
                            writer.flush()
                            break

                        writer.write(stock.process(command) + "\n")
                        writer.flush()

            print("Client disconnected")


if __name__ == "__main__":
    main()
