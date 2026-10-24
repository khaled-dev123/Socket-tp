
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

        with open(filename, "r", newline="", encoding="utf-8") as file:
            reader = csv.reader(file)
            next(reader, None)

            for row in reader:
                self.items.append(
                    Item(
                        int(row[0]),
                        row[1],
                        float(row[2]),
                        int(row[3])
                    )
                )

    def get_element(self, id):
        return next((item for item in self.items if item.id == id), None)

    def get_name(self, id):
        item = self.get_element(id)
        return item.name if item else "Item not found"

    def get_quantity(self, id):
        item = self.get_element(id)
        return item.quantity if item else "Item not found"

    def get_price(self, id, qty):
        item = self.get_element(id)
        return item.price * qty if item else "Item not found"


class Server:
    def __init__(self, stock):
        self.stock = stock

    def serve(self, port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
            server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server.bind(("127.0.0.1", port))
            server.listen(1)

            print("Server started on port", port)
            print("Waiting for a client...")

            conn, addr = server.accept()

            with conn:
                print("Client connected:", addr)

                with conn.makefile("r", encoding="utf-8") as reader:
                    with conn.makefile("w", encoding="utf-8") as writer:
                        for command in reader:
                            command = command.strip()
                            print("Command:", command)

                            try:
                                parts = command.split()

                                if parts[0] == "name" and len(parts) == 2:
                                    response = self.stock.get_name(int(parts[1]))

                                elif parts[0] == "quantity" and len(parts) == 2:
                                    response = self.stock.get_quantity(int(parts[1]))

                                elif parts[0] == "price" and len(parts) == 3:
                                    response = self.stock.get_price(
                                        int(parts[1]), int(parts[2])
                                    )

                                elif command == "end":
                                    writer.write("Goodbye\n")
                                    writer.flush()
                                    break

                                else:
                                    response = "Unknown command"

                            except (ValueError, IndexError):
                                response = "Invalid command or ID"

                            writer.write(str(response) + "\n")
                            writer.flush()

            print("Client disconnected.")


if __name__ == "__main__":
    stock = Stock("data.csv")
    server = Server(stock)
    server.serve(5000)
