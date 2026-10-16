JavaScript
// ════════════════════════════════════════════════════════════
//  network.js  –  Socket.io Networking Client
// ════════════════════════════════════════════════════════════
'use strict';

const NET = (() => {
  let socket = null;
  let playerId = null;
  let currentLobby = null;

  function init() {
    if (typeof io === 'undefined') {
      console.warn('Socket.io library not loaded. Running in solo mode.');
      return;
    }

    socket = io();

    socket.on('connect', () => {
      playerId = socket.id;
      console.log('Connected to network with ID:', playerId);
    });

    // Lobby Events
    socket.on('lobby_created', ({ roomCode, lobby }) => {
      currentLobby = lobby;
      MAIN.showLobbyScreen(roomCode, lobby);
    });

    socket.on('lobby_updated', (lobby) => {
      currentLobby = lobby;
      MAIN.updateLobbyUI(lobby);
    });

    socket.on('race_started', ({ circuit, players }) => {
      MAIN.startMultiplayerRace(circuit, players);
    });

    // In-Game Real-Time Events
    socket.on('player_moved', (data) => {
      if (window.gameInstance && window.gameInstance.remoteKarts[data.id]) {
        const remoteKart = window.gameInstance.remoteKarts[data.id];
        remoteKart.setPosition(data.x, data.y, data.z);
        remoteKart.setHeading(data.ry);
        remoteKart.updateVisuals(data.speed, data.steer, data.drifting, data.tier);
      }
    });

    socket.on('item_spawned', (itemData) => {
      if (window.gameInstance && window.gameInstance.itemManager) {
        window.gameInstance.itemManager.spawnRemoteItem(itemData);
      }
    });

    socket.on('chat_message', ({ sender, text }) => {
      MAIN.addChatMessage(sender, text);
    });

    socket.on('error_message', (msg) => {
      alert(msg);
    });
  }

  return {
    init,
    get playerId() { return playerId; },
    get lobby() { return currentLobby; },

    createLobby(playerName, character, kart) {
      if (socket) socket.emit('create_lobby', { playerName, character, kart });
    },

    joinLobby(roomCode, playerName, character, kart) {
      if (socket) socket.emit('join_lobby', { roomCode, playerName, character, kart });
    },

    selectCircuit(circuitId) {
      if (socket) socket.emit('select_circuit', { circuitId });
    },

    toggleReady() {
      if (socket) socket.emit('player_ready');
    },

    startRace() {
      if (socket) socket.emit('start_race');
    },

    sendPosition(pos, heading, speed, steer, drifting, tier) {
      if (socket && currentLobby) {
        socket.emit('update_position', {
          x: pos.x,
          y: pos.y,
          z: pos.z,
          ry: heading,
          speed,
          steer,
          drifting,
          tier
        });
      }
    },

    useItem(itemType, pos, heading) {
      if (socket && currentLobby) {
        socket.emit('use_item', { itemType, x: pos.x, y: pos.y, z: pos.z, heading });
      }
    },

    sendChat(msg) {
      if (socket && currentLobby) {
        socket.emit('send_chat', msg);
      }
    }
  };
})();
