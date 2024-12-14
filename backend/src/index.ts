import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

wss.on("connection", (ws) => {
    console.log("New connection established.");

    ws.on("message", (data: string) => {
        try {
            const message = JSON.parse(data);
            console.log("Received message:", message);

            switch (message.type) {
                case "sender":
                    console.log("Sender set.");
                    senderSocket = ws;
                    break;

                case "receiver":
                    console.log("Receiver set.");
                    receiverSocket = ws;
                    break;

                case "createOffer":
                    console.log("Offer received.");
                    if (receiverSocket) {
                        receiverSocket.send(JSON.stringify({ type: "createOffer", sdp: message.sdp }));
                    } else {
                        console.error("No receiver socket to forward offer.");
                    }
                    break;

                case "createAnswer":
                    console.log("Answer received.");
                    if (senderSocket) {
                        senderSocket.send(JSON.stringify({ type: "createAnswer", sdp: message.sdp }));
                    } else {
                        console.error("No sender socket to forward answer.");
                    }
                    break;

                case "iceCandidate":
                    if (ws === senderSocket && receiverSocket) {
                        receiverSocket.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
                    } else if (ws === receiverSocket && senderSocket) {
                        senderSocket.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
                    } else {
                        console.error("Cannot forward ICE candidate - socket not set.");
                    }
                    break;

                default:
                    console.warn("Unknown message type:", message.type);
            }
        } catch (err) {
            console.error("Error processing message:", err);
        }
    });

    ws.on("close", () => {
        if (ws === senderSocket) {
            console.log("Sender disconnected.");
            senderSocket = null;
        } else if (ws === receiverSocket) {
            console.log("Receiver disconnected.");
            receiverSocket = null;
        }
    });

    ws.on("error", (err) => {
        console.error("WebSocket error:", err);
    });
});

console.log("WebSocket signaling server running on ws://localhost:8080");
