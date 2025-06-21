// lib/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3002", {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000
}); 



export default socket;