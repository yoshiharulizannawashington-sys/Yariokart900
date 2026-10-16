JavaScript
// ════════════════════════════════════════════════════════════
//  main.js  –  UI Router, Menu Controller & App Entrypoint
// ════════════════════════════════════════════════════════════
'use strict';

const MAIN = (() => {
  let selectedChar = 'mario';
  let selectedKart = 'standard';
  let selectedCircuit = 'figure8';

  function init() {
    AUDIO.init();
    NET.init();

    // Bind Screen Navigation Buttons
    document.getElementById('btn-solo').addEventListener('click', () => showScreen('char-select'));
    document.getElementById('btn-multi').addEventListener('click', () => showScreen('multi-menu'));
    document.getElementById('btn-options').addEventListener('click', () => showScreen('options-screen'));

    // Back Buttons
    document.getElementById('btn-back-main').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('btn-back-char').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('btn-back-circuit').addEventListener('click', () => showScreen('char-select'));
    document.getElementById('btn-back-options').addEventListener('click', () => showScreen('main-menu'));

    // Character -> Circuit Selection Step
    document.getElementById('btn-go-circuit').addEventListener('click', () => {
      showScreen('circuit-select');
    });

    // Start Solo Race
    document.getElementById('btn-start-race').addEventListener('click', () => {
      startSoloRace();
    });

    // Multiplayer Lobby Actions
    document.getElementById('btn-create-lobby').addEventListener('click', () => {
      const name = document.getElementById('mp-name').value.trim() || 'Player 1';
      NET.createLobby(name, selectedChar, selectedKart);
    });

    document.getElementById('btn-join-lobby').addEventListener('click', () => {
      const code = document.getElementById('mp-code').value.trim();
      const name = document.getElementById('mp-name').value.trim() || 'Player 2';
      if (!code) return alert('Please enter a 6-digit lobby code.');
      NET.joinLobby(code, name, selectedChar, selectedKart);
    });

    document.getElementById('btn-ready').addEventListener('click', () => {
      NET.toggleReady();
    });

    document.getElementById('btn-leave-lobby').addEventListener('click', () => {
      location.reload();
    });

    // Chat
    document.getElementById('btn-chat-send').addEventListener('click', sendChatMsg);
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChatMsg();
    });

    // Audio & Options controls
    document.getElementById('opt-music').addEventListener('input', (e) => {
      AUDIO.setMusicVol(e.target.value / 100);
    });
    document.getElementById('opt-sfx').addEventListener('input', (e) => {
      AUDIO.setSfxVol(e.target.value / 100);
    });
    document.getElementById('btn-save-options').addEventListener('click', () => {
      showScreen('main-menu');
    });

    // Pause overlay buttons
    document.getElementById('btn-resume').addEventListener('click', () => {
      if (window.gameInstance) window.gameInstance.togglePause();
    });
    document.getElementById('btn-restart').addEventListener('click', () => {
      startSoloRace();
    });
    document.getElementById('btn-quit-race').addEventListener('click', () => {
      if (window.gameInstance) window.gameInstance.running = false;
      showScreen('main-menu');
    });

    // Render character selection grid
    renderCharGrid();
    renderKartGrid();
    renderCircuitGrid();

    // Hide loader & show menu
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      showScreen('main-menu');
    }, 600);
  }

  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
  }

  // ── Render Selection Menus ──────────────────────────────────
  function renderCharGrid() {
    const grid = document.getElementById('char-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(CHARACTERS).forEach((key) => {
      const c = CHARACTERS[key];
      const card = document.createElement('div');
      card.className = `char-card ${key === selectedChar ? 'selected' : ''}`;
      card.innerHTML = `<div class="char-emoji">${c.emoji}</div><div class="char-name">${c.name}</div>`;
      card.addEventListener('click', () => {
        selectedChar = key;
        document.querySelectorAll('.char-card').forEach(el => el.classList.remove('selected'));
        card.classList.add('selected');
      });
      grid.appendChild(card);
    });
  }

  function renderKartGrid() {
    const grid = document.getElementById('kart-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(KARTS).forEach((key) => {
      const k = KARTS[key];
      const card = document.createElement('div');
      card.className = `kart-card ${key === selectedKart ? 'selected' : ''}`;
      card.innerHTML = `<div class="kart-icon">${k.icon}</div><div class="kart-name">${k.name}</div>`;
      card.addEventListener('click', () => {
        selectedKart = key;
        document.querySelectorAll('.kart-card').forEach(el => el.classList.remove('selected'));
        card.classList.add('selected');
      });
      grid.appendChild(card);
    });
  }

  function renderCircuitGrid() {
    const grid = document.getElementById('circuit-select-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(CIRCUITS).forEach((key) => {
      const circ = CIRCUITS[key];
      const card = document.createElement('div');
      card.className = `circuit-card ${key === selectedCircuit ? 'selected' : ''}`;
      card.innerHTML = `<h3>${circ.name}</h3><p>Difficulty: ${circ.difficulty || '⭐'}</p>`;
      card.addEventListener('click', () => {
        selectedCircuit = key;
        document.querySelectorAll('.circuit-card').forEach(el => el.classList.remove('selected'));
        card.classList.add('selected');
      });
      grid.appendChild(card);
    });
  }

  // ── Multiplayer UI Updates ─────────────────────────────────
  function showLobbyScreen(roomCode, lobby) {
    showScreen('lobby-screen');
    const badge = document.getElementById('lobby-code-display');
    if (badge) badge.textContent = roomCode;
    updateLobbyUI(lobby);
  }

  function updateLobbyUI(lobby) {
    const container = document.getElementById('lobby-players');
    if (!container) return;
    container.innerHTML = '';

    lobby.players.forEach((p) => {
      const div = document.createElement('div');
      div.className = 'lobby-player-slot';
      div.innerHTML = `
        <span class="p-name">${p.name} ${p.isHost ? '👑' : ''}</span>
        <span class="p-status">${p.ready ? '✅ Ready' : '⏳ Waiting'}</span>
      `;
      container.appendChild(div);
    });
  }

  function sendChatMsg() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (text) {
      NET.sendChat(text);
      input.value = '';
    }
  }

  function addChatMessage(sender, text) {
    const box = document.getElementById('lobby-chat');
    if (!box) return;
    const msg = document.createElement('div');
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
  }

  // ── Launch Races ──────────────────────────────────────────
  function startSoloRace() {
    showScreen('game-screen');
    if (!window.gameInstance) {
      window.gameInstance = new Game();
      window.gameInstance.initRenderer();
    }
    window.gameInstance.isMulti = false;
    window.gameInstance.initScene(selectedCircuit);
    window.gameInstance.spawnLocalKart(selectedChar, selectedKart, 0);
    window.gameInstance.setupInput();
    window.gameInstance.startRaceLoop();
    AUDIO.startMusic(selectedCircuit);
  }

  function startMultiplayerRace(circuitId, players) {
    showScreen('game-screen');
    if (!window.gameInstance) {
      window.gameInstance = new Game();
      window.gameInstance.initRenderer();
    }
    window.gameInstance.isMulti = true;
    window.gameInstance.initScene(circuitId);

    players.forEach((p, idx) => {
      if (p.id === NET.playerId) {
        window.gameInstance.spawnLocalKart(p.character, p.kart, idx);
      } else {
        window.gameInstance.spawnRemoteKart(p.id, p.character, p.kart, idx);
      }
    });

    window.gameInstance.setupInput();
    window.gameInstance.startRaceLoop();
    AUDIO.startMusic(circuitId);
  }

  return {
    init,
    showLobbyScreen,
    updateLobbyUI,
    addChatMessage,
    startMultiplayerRace
  };
})();

// Boot app on DOM ready
window.addEventListener('DOMContentLoaded', MAIN.init);
