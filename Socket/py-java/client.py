
import socket


def main():
    try:
        with socket.create_connection(("127.0.0.1", 5000)) as client:
            print("Connected to Java server.")

            with client.makefile("r", encoding="utf-8") as reader:
                with client.makefile("w", encoding="utf-8") as writer:
                    while True:
                        command = input("Enter command: ").strip()

                        writer.write(command + "\n")
                        writer.flush()

                        response = reader.readline()

                        if not response:
                            print("Server disconnected.")
                            break

                        print("Server response:", response.strip())

                        if command == "end":
                            break

    except (OSError, EOFError) as e:
        print("Connection error:", e)


if __name__ == "__main__":
    main()
