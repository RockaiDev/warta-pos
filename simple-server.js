const { Server } = require("socket.io");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

console.log("🚀 بدء تشغيل السيرفر...");

io.on("connection", (socket) => {
    console.log("✅ عميل متصل:", socket.id);

    // إرسال رسالة ترحيب
    socket.emit("welcome", {
        message: "مرحباً بك في السيرفر!",
        socketId: socket.id,
        timestamp: new Date().toISOString()
    });

    socket.on("newOrder", (orderData) => {
        console.log("🆕 طلب جديد مستلم:", orderData);
        
        // إرسال إشعار للجميع
        socket.broadcast.emit("newOrderNotification", {
            message: `طلب جديد! رقم الهاتف: ${orderData.phone}`,
            order: orderData,
            timestamp: new Date().toLocaleString('ar-EG')
        });
        
        // تأكيد الطلب للمرسل
        socket.emit("orderConfirmation", {
            message: "تم إرسال طلبك بنجاح!",
            orderId: orderData.id || Date.now(),
            timestamp: new Date().toISOString()
        });
    });

    socket.on("disconnect", (reason) => {
        console.log("❌ عميل منفصل:", socket.id, "- السبب:", reason);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`✅ السيرفر يعمل على المنفذ ${PORT}`);
    console.log(`🌐 يمكن الوصول عبر: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket متاح على: ws://localhost:${PORT}`);
}); 