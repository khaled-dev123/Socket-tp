
import java.io.*;
import java.net.*;
import java.util.ArrayList;

class Item {
    public int id;
    public String name;
    public double price;
    public int quantity;

    public Item(int id, String name, double price, int quantity) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }
}

class Stock {
    private ArrayList<Item> items = new ArrayList<>();

    public Stock(String filename) throws IOException {
        try (BufferedReader br = new BufferedReader(new FileReader(filename))) {
            String line = br.readLine(); // Skip header

            while ((line = br.readLine()) != null) {
                String[] values = line.split(",");

                if (values.length >= 4) {
                    items.add(new Item(
                        Integer.parseInt(values[0].trim()),
                        values[1].trim(),
                        Double.parseDouble(values[2].trim()),
                        Integer.parseInt(values[3].trim())
                    ));
                }
            }
        }
    }

    private Item find(int id) {
        for (Item item : items) {
            if (item.id == id) return item;
        }
        return null;
    }

    public String process(String command) {
        String[] parts = command.trim().split("\\s+");

        try {
            if (parts.length == 2 && parts[0].equals("name")) {
                Item item = find(Integer.parseInt(parts[1]));
                return item != null ? item.name : "Item not found";
            }

            if (parts.length == 2 && parts[0].equals("quantity")) {
                Item item = find(Integer.parseInt(parts[1]));
                return item != null
                    ? String.valueOf(item.quantity)
                    : "Item not found";
            }

            if (parts.length == 3 && parts[0].equals("price")) {
                Item item = find(Integer.parseInt(parts[1]));
                int qty = Integer.parseInt(parts[2]);

                return item != null
                    ? String.valueOf(item.price * qty)
                    : "Item not found";
            }

            return "Unknown command";

        } catch (NumberFormatException e) {
            return "Invalid command or ID";
        }
    }
}

public class Server {
    public static void main(String[] args) {
        try {
            Stock stock = new Stock("data.cdv");

            try (ServerSocket server = new ServerSocket(5000)) {
                System.out.println("Java server listening on port 5000");

                while (true) {
                    try (Socket socket = server.accept();
                         BufferedReader in = new BufferedReader(
                             new InputStreamReader(
                                 socket.getInputStream(), "UTF-8"
                             )
                         );
                         PrintWriter out = new PrintWriter(
                             new OutputStreamWriter(
                                 socket.getOutputStream(), "UTF-8"
                             ),
                             true
                         )) {

                        System.out.println("Client connected.");

                        String command;

                        while ((command = in.readLine()) != null) {
                            System.out.println("Command: " + command);

                            if (command.trim().equals("end")) {
                                out.println("Goodbye");
                                break;
                            }

                            out.println(stock.process(command));
                        }

                        System.out.println("Client disconnected.");
                    } catch (IOException e) {
                        System.out.println("Client error: " + e.getMessage());
                    }
                }
            }
        } catch (IOException e) {
            System.out.println("Server error: " + e.getMessage());
        }
    }
}
