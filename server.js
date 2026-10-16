JavaScript
// ════════════════════════════════════════════════════════════
//  server.js – Node.js Express + Socket.io Multiplayer Server
// ════════════════════════════════════════════════════════════
const express = require('express');
const app = express();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Store active lobbies: roomCode -> { code, hostId, circuit, status, players: [] }
const lobbies = new Map();

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create Room
  socket.on('create_lobby', ({ playerName, character, kart }) => {
    let roomCode = generateRoomCode();
    while (lobbies.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const player = {
      id: socket.id,
      name: playerName || 'Player 1',
      character: character || 'mario',
      kart: kart || 'standard',
      isHost: true,
      ready: false,
      slot: 0
    };

    const lobby = {
      code: roomCode,
      hostId: socket.id,
      circuit: 'figure8',
      status: 'lobby',
      players: [player]
    };

    lobbies.set(roomCode, lobby);
    socket.join(roomCode);
    socket.roomCode = roomCode;

    socket.emit('lobby_created', { roomCode, lobby });
  });

  // Join Room
  socket.on('join_lobby', ({ roomCode, playerName, character, kart }) => {
    const lobby = lobbies.get(roomCode);
    if (!lobby) {
      return socket.emit('error_message', 'Lobby not found.');
    }
    if (lobby.players.length >= 8) {
      return socket.emit('error_message', 'Lobby is full (max 8 players).');
    }
    if (lobby.status !== 'lobby') {
      return socket.emit('error_message', 'Race already in progress.');
    }

    const player = {
      id: socket.id,
      name: playerName || `Player ${lobby.players.length + 1}`,
      character: character || 'luigi',
      kart: kart || 'standardHere is the complete code for **`server.js`**:

```javascript
// ════════════════════════════════════════════════════════════
//  server.js – Node.js Express + Socket.io Multiplayer Server
// ════════════════════════════════════════════════════════════
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Store active lobbies: roomCode -> { code, hostId, circuit, status, players: [] }
const lobbies = new Map();

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create Room
  socket.on('create_lobby', ({ playerName, character, kart }) => {
    let roomCode = generateRoomCode();
    while (lobbies.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const player = {
      id: socket.id,
      name: playerName || 'Player 1',
      character: character || 'mario',
      kart: kart || 'standard',
      isHost: true,
      ready: false,
      slot: 0
    };

    const lobby = {
      code: roomCode,
      hostId: socket.id,
      circuit: 'figure8',
      status: 'lobby',
      players: [player]
    };

    lobbies.set(roomCode, lobby);
    socket.join(roomCode);
    socket.roomCode = roomCode;

    socket.emit('lobby_created', { roomCode, lobby });
  });

  // Join Room
  socket.on('join_lobby', ({ roomCode, playerName, character, kart }) => {
    const lobby = lobbies.get(roomCode);
    if (!lobby) {
      return socket.emit('error_message', 'Lobby not found.');
    }
    if (lobby.players.length >= 8) {
      return socket.emit('error_message', 'Lobby is full (max 8 players).');
    }
    if (lobby.status !== 'lobby') {
      return socket.emit('error_message', 'Race already in progress.');
    }

    const player = {
      id: socket.id,
      name: playerName || `Player ${lobby.players.length + 1}`,
      character: character || 'luigi',
      kart: kart || 'standard',
      isHost: false,
      ready: false,
      slot: lobby.players.length
    };

    lobby.players.push(player);
    socket.join(roomCode);
    socket.roomCode = roomCode;

    io.to(roomCode).emit('lobby_updated', lobby);
  });

  // Host Circuit Selection
  socket.on('select_circuit', ({ circuitId }) => {
    const roomCode = socket.roomCode;
    const lobby = lobbies.get(roomCode);
    if (lobby && lobby.hostId === socket.id) {
      lobby.circuit = circuitId;
      io.to(roomCode).emit('lobby_updated', lobby);
    }
  });

  // Player Ready Toggle
  socket.on('player_ready', () => {
    const roomCode = socket.roomCode;
    const lobby = lobbies.get(roomCode);
    if (lobby) {
      const player = lobby.players.find(p => p.id === socket.id);
      if (player) {
        player.ready = !player.ready;
        io.to(roomCode).emit('lobby_updated', lobby);
      }
    }
  });

  // Start Race (Host only)
  socket.on('start_race', () => {
    const roomCode = socket.roomCode;
    const lobby = lobbies.get(roomCode);
    if (lobby && lobby.hostId === socket.id) {
      lobby.status = 'racing';
      io.to(roomCode).emit('race_started', { circuit: lobby.circuit, players: lobby.players });
    }
  });

  // Position & State Syncing
  socket.on('update_position', (data) => {
    if (socket.roomCode) {
      socket.to(socket.roomCode).emit('player_moved', { id: socket.id, ...data });
    }
  });

  // Item Usage Syncing
  socket.on('use_item', (itemData) => {
    if (socket.roomCode) {
      io.to(socket.roomCode).emit('item_spawned', { ownerId: socket.id, ...itemData });
    }
  });

  // Lobby Chat Syncing
  socket.on('send_chat', (msg) => {
    if (socket.roomCode) {
      const lobby = lobbies.get(socket.roomCode);
      const player = lobby?.players.find(p => p.id === socket.id);
      io.to(socket.roomCode).emit('chat_message', { sender: player?.name || 'Player', text: msg });
    }
  });

  // Disconnect Handling
  socket.on('disconnect', () => {
    const roomCode = socket.roomCode;
    if (roomCode && lobbies.has(roomCode)) {
      const lobby = lobbies.get(roomCode);
      lobby.players = lobby.players.filter(p => p.id !== socket.id);

      if (lobby.players.length === 0) {
        lobbies.delete(roomCode);
      } else {
        if (lobby.hostId === socket.id) {
          lobby.hostId = lobby.players[0].id;
          lobby.players[0].isHost = true;
        }
        io.to(roomCode).emit('lobby_updated', lobby);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
