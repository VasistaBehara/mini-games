import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { registerTicTacToeNamespace } from './tictactoe/events';

const app = express();

const PORT = parseInt(process.env.PORT || '5174', 10);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN
  }
});

registerTicTacToeNamespace(io);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
