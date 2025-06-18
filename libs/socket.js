// lib/socket.js
import { io } from "socket.io-client";

// يمكنك تغيير هذا العنوان حسب موقع السيرفر الخاص بك
const SOCKET_SERVER_URL ="http://localhost:3002";

console.log('🔗 محاولة الاتصال بالسيرفر على:', SOCKET_SERVER_URL);

const socket = io(SOCKET_SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000
}); 


export default socket;