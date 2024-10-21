import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// PostgreSQL database connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());

// Fetch messages from the database
async function fetchMessages() {
  const result = await pool.query('SELECT * FROM messages ORDER BY created_at ASC');
  return result.rows;
}

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New client connected');

  // Fetch and send existing messages to the new client
  fetchMessages()
    .then((messages) => {
      socket.emit('previousMessages', messages);
    })
    .catch((err) => {
      console.error('Error fetching messages:', err);
    });

  // Handle incoming messages
  socket.on('message', async (message) => {
    const { content, sender } = message;
    try {
      // Save message to the database, including sender and content
      await pool.query('INSERT INTO messages (content, sender) VALUES ($1, $2)', [content, sender]);

      // Emit the message to all clients
      io.emit('message', message);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
