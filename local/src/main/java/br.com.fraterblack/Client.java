package br.com.fraterblack;

import io.socket.client.Socket;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Client {
    private Socket socket = null;
    private boolean alreadySendingRecords = false;

    public Client() {

        Thread executionThread = new Thread(new Runnable() {
            public void run() {
                try {
                    while (!Thread.currentThread().isInterrupted()) {

                        // Before continue, disconnect existent connection
                        if (socket != null) {
                            continue;
                        }

                        // Socket Connection
                        socket = new SocketConnector("http", "localhost", "4010").socket();

                        // On Connect
                        socket.on(Socket.EVENT_CONNECT, args -> {
                            System.out.println("Connected license 12345678");

                            JSONObject data = new JSONObject();
                            try {
                                data.put("licenseId", "12345678");
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            socket.emit("connected", data);
                        });

                        // On Disconnect
                        socket.on(Socket.EVENT_DISCONNECT, args -> {
                            System.out.println("Disconnected");
                        });

                        // On Ping
                        socket.on("check-ping", args -> {
                            try {
                                JSONObject obj = (JSONObject)args[0];
                                System.out.println(obj);

                                socket.emit("check-pong", obj);
                            } catch (Exception e) {
                                System.out.println("Erro ao responder ping: " + e.getMessage());
                            }
                        });

                        // On Command
                        socket.on("command", args -> {
                            try {
                                JSONObject data = (JSONObject)args[0];
                                String commandType = data.getString("type");
                                String licenseId = data.getString("licenseId");
                                String origin = data.getString("origin");

                                System.out.println("Command \"" + commandType + "\" received");

                                switch (commandType) {
                                    case "get-machine-status":
                                        TimeHelper.setTimeout(() -> {
                                            JSONObject response = new JSONObject();
                                            try {
                                                response.put("type", "get-machine-status");
                                                response.put("licenseId", licenseId);
                                                response.put("origin", origin);

                                                JSONObject responseData = new JSONObject();
                                                responseData.put("serialNumber", "qwq23asd3fdfasdqqww233dc");
                                                responseData.put("lastNsr", "64855");
                                                responseData.put("employees", "45");

                                                response.put("response", responseData);
                                            } catch (JSONException e) {
                                                e.printStackTrace();
                                            }

                                            socket.emit("command-finished", response);
                                        }, 3000);
                                        break;
                                    case "activate-receive-records":
                                        JSONObject response = new JSONObject();
                                        try {
                                            response.put("type", "activate-receive-records");
                                            response.put("licenseId", licenseId);
                                            response.put("origin", origin);

                                            // Handle registed records
                                            if (!alreadySendingRecords) {
                                                sendRegisteredRecords(socket);
                                                alreadySendingRecords = true;
                                            }

                                            response.put("response", true);
                                        } catch (JSONException e) {
                                            e.printStackTrace();
                                        }

                                        socket.emit("command-finished", response);
                                        break;
                                }



                            } catch (Exception e) {
                                System.out.println("Erro ao executar socket comando: " + e.getMessage());
                            }
                        });

                        // Connect with websocket service
                        socket.connect();

                        try {
                            Thread.sleep(2000);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                } catch (Exception e) {
                    System.out.println("Erro ao inicializar: " + e.getMessage());
                }
            }
        });
        executionThread.start();
    }

    private void sendRegisteredRecords(Socket socket) {
        TimeHelper.setTimeout(() -> {
            JSONObject response = new JSONObject();

            JSONArray recordsData = new JSONArray();
            for (int i = 1; i < 15; i++) {
                try {
                    JSONObject record = new JSONObject();
                    record.put("record", i);
                    recordsData.put(record);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

            try {
                response.put("licenseId", "12345678");
                response.put("records", recordsData);
            } catch (JSONException e) {
                e.printStackTrace();
            }

            socket.emit("registered-records", response);

            sendRegisteredRecords(socket);
        }, 15000);
    }

    public static void main(String[] args) {
        Client client = new Client();
    }
}
