
import java.io.*;
import java.net.*;

public class Client {
    public static void main(String[] args) {
        try (
            Socket socket = new Socket("127.0.0.1", 5000);
            BufferedReader serverInput = new BufferedReader(
                new InputStreamReader(socket.getInputStream(), "UTF-8")
            );
            PrintWriter serverOutput = new PrintWriter(
                new OutputStreamWriter(socket.getOutputStream(), "UTF-8"),
                true
            );
            BufferedReader keyboard = new BufferedReader(
                new InputStreamReader(System.in)
            )
        ) {
            System.out.println("Connected to Python server.");

            while (true) {
                System.out.print("Enter command: ");
                String command = keyboard.readLine();

                if (command == null) break;

                serverOutput.println(command);

                String response = serverInput.readLine();
                if (response == null) {
                    System.out.println("Server disconnected.");
                    break;
                }

                System.out.println("Server response: " + response);

                if (command.trim().equals("end")) break;
            }
        } catch (IOException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
