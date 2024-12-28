import { io } from "socket.io-client";

// Replace with your backend URL
const SOCKET_URL = "https://api.denverbartenders.online/ws";

const socket = io(SOCKET_URL, {
    transports: ["websocket"], // Ensure WebSocket transport is used
});

export default socket;
