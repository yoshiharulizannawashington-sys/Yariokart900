JavaScript
// ════════════════════════════════════════════════════════════
//  game.js  –  Main Three.js game loop & scene management
// ════════════════════════════════════════════════════════════
'use strict';

class Game {
    constructor() {
        this.running = false;
        this.paused = false;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.localKart = null;
        this.remoteKarts = {};   // socketId → Kart
        this.allKarts = [];
        this.collidables = [];
        this.itemBoxMeshes = [];
        this.itemManager = null;
        this.hud = null;
        this.physics = null;
        this.circuit = null;
        this.isMulti = false;
        this._animId = null;
        this._keys = {};
        this._lastSendTime = 0;
        this._minimapPath = [];

        // Input states
        this.inputs = { accel: false, brake: false, left: false, right: false, drift: false };
    }

    // ── Init Three.js renderer ─────────────────────────────────
    initRenderer() {
        const canvas = document.getElementById('game-canvas');
        const W = window.innerWidth, H = window.innerHeight;
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(W, H);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 1000);

        window.addEventListener('resize', () => {
            const W2 = window.innerWidth, H2 = window.innerHeight;
            this.renderer.setSize(W2, H2);
            this.camera.aspect = W2 / H2;
            this.camera.updateProjectionMatrix();
        });
    }

    // ── Build scene for a circuit ──────────────────────────────
    initScene(circuitId) {
        if (this.scene) {
            while (this.scene.children.length) this.scene.remove(this.scene.children[0]);
        }
        this.scene = new THREE.Scene();
        this.circuit = CIRCUITS[circuitId] || CIRCUITS.figure8;
        const meta = this.circuit.meta;

        // Sky & Fog
        this.scene.background = new THREE.Color(meta.bgColor);
        this.scene.fog = new THREE.FogExp2(meta.bgColor, 0.008);

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 1.0);
        sun.position.set(50, 100, 50);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        this.scene.add(sun);

        // Build circuit geometry
        const result = this.circuit.build(this.scene);
        this.collidables = result.collidables || [];
        this._minimapPath = result.minimapPath || [];
        this.itemBoxMeshes = this.scene.children.filter(m => m.userData && m.userData.isItemBox);

        this.itemManager = new ItemManager(this.scene);
        this.hud = new HUD();
    }

    // ── Spawn Karts ────────────────────────────────────────────
    spawnLocalKart(charKey, kartKey, slotIndex = 0) {
        if (this.localKart) { this.localKart.destroy(); }
        this.localKart = new Kart(this.scene, charKey, kartKey, true);
        const sp = this.circuit.startPos[slotIndex] || this.circuit.startPos[0];
        this.localKart.setPosition(sp.x, sp.y || 0.5, sp.z);
        this.localKart.setHeading(sp.ry || 0);

        this.physics = new PhysicsEngine(this.localKart, this.collidables);
        this.allKarts = [this.localKart, ...Object.values(this.remoteKarts)];
        return this.localKart;
    }

    spawnRemoteKart(playerId, charKey, kartKey, slotIndex = 0) {
        if (this.remoteKarts[playerId]) { this.remoteKarts[playerId].destroy(); }
        const k = new Kart(this.scene, charKey, kartKey, false);
        const sp = this.circuit.startPos[slotIndex] || this.circuit.startPos[0];
        k.setPosition(sp.x, sp.y || 0.5, sp.z);
        k.setHeading(sp.ry || 0);
        this.remoteKarts[playerId] = k;
        this.allKarts = [this.localKart, ...Object.values(this.remoteKarts)];
        return k;
    }

    // ── Keyboard Input Handlers ────────────────────────────────
    setupInput() {
        const updateKeys = () => {
            this.inputs.accel = !!(this._keys['ArrowUp'] || this._keys['KeyW']);
            this.inputs.brake = !!(this._keys['ArrowDown'] || this._keys['KeyS']);
            this.inputs.left = !!(this._keys['ArrowLeft'] || this._keys['KeyA']);
            this.inputs.right = !!(this._keys['ArrowRight'] || this._keys['KeyD']);
            this.inputs.drift = !!(this._keys['KeyZ'] || this._keys['ShiftLeft'] || this._keys['ShiftRight']);
        };

        window.addEventListener('keydown', (e) => {
            this._keys[e.code] = true;
            updateKeys();

            if (e.code === 'Space') {
                e.preventDefault();
                this._onUseItem();
            }
            if (e.code === 'Escape') {
                this.togglePause();
            }
        });

        window.addEventListener('keyup', (e) => {
            this._keys[e.code] = false;
            updateKeys();
        });
    }

    _onUseItem() {
        if (!this.hud || !this.hud.heldItem) return;
        const itemType = this.hud.useHeldItem();
        if (itemType && this.itemManager && this.localKart) {
            this.itemManager.useItem(this.localKart, itemType);
        }
    }

    togglePause() {
        this.paused = !this.paused;
        const overlay = document.getElementById('pause-overlay');
        if (overlay) overlay.classList.toggle('hidden', !this.paused);
    }

    // ── Main Game Loop ─────────────────────────────────────────
    startRaceLoop() {
        this.running = true;
        this.paused = false;

        let lastTime = performance.now();

        const loop = (now) => {
            if (!this.running) return;
            this._animId = requestAnimationFrame(loop);

            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            if (!this.paused) {
                this._update(dt, now);
                this._render();
            }
        };

        this._animId = requestAnimationFrame(loop);
    }

    _update(dt, now) {
        // 1. Update Physics Engine
        if (this.physics) {
            this.physics.update(this.inputs, dt);
        }

        // 2. Rotate Item Boxes
        this.itemBoxMeshes.forEach(box => {
            box.rotation.y += MK.ITEM_BOX_SPIN_SPEED;

            // Simple item box pickup check
            if (this.localKart && !this.hud.heldItem) {
                const dist = box.position.distanceTo(this.localKart.position);
                if (dist < 1.8) {
                    const item = getRandomItem(1);
                    this.hud.setHeldItem(item);
                    AUDIO.play('item_get');
                }
            }
        });

        // 3. Update Active Track Items
        if (this.itemManager) {
            this.itemManager.update(this.allKarts, dt);
        }

        // 4. Update Chase Camera
        if (this.localKart) {
            const pos = this.localKart.position;
            const rotY = this.localKart.rotation.y;

            const targetCamX = pos.x + Math.sin(rotY) * MK.CAM_BEHIND;
            const targetCamZ = pos.z + Math.cos(rotY) * MK.CAM_BEHIND;
            const targetCamY = pos.y + MK.CAM_Every code file for your Mario Kart project—including `server.js`, `package.json`, `index.html`, `style.css`, and all JavaScript modules (`constants.js`, `audio.js`, `characters.js`, `circuits.js`, `physics.js`, `kart.js`, `items.js`, `hud.js`, `network.js`, `game.js`, and `main.js`)—has been provided in the conversation above.

