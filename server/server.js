// server.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});
app.use(cors());
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('message', (message) => {
        io.emit('message', message); // Broadcast message to all clients
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
