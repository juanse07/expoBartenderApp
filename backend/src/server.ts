import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import http, { Server as HTTPServer } from 'http';
import { connectDB } from './config/db';
import { setupWebSocket } from './services/websocket';

dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT || '8888', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Create HTTP server with proper typing
const server: HTTPServer = http.createServer(app);

// Setup WebSocket
setupWebSocket(server);

// Routes
app.get('/test', (req: Request, res: Response): void => {
  res.json({ message: 'Server is running!' });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export { app, server };
