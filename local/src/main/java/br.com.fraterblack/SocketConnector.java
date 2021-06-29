package br.com.fraterblack;

import io.socket.client.IO;
import io.socket.client.Socket;
import java.net.URISyntaxException;

public class SocketConnector {
    private Socket socket;

    public SocketConnector(String protocol, String host, String port) {
        try {
            IO.Options opts = new IO.Options();
            opts.forceNew = false;
            // opts.transports = new String[]{ "websocket", "polling" };

            System.out.println("Connecting to webservice: " + protocol + "://" + host + ":" + port + ": ");

            this.socket = IO.socket(protocol + "://" + host + ":" + port + "?", opts);
        } catch (Error | URISyntaxException e) {
            e.printStackTrace();
            System.out.println("Erro on connecting to webservice: " + e.getMessage());
        }
    }

    public Socket socket() {
        return this.socket;
    }
}