JavaScript
// ════════════════════════════════════════════════════════════
//  hud.js  –  In-Game Overlay & Minimap Interface
// ════════════════════════════════════════════════════════════
'use strict';

class HUD {
  constructor() {
    this.elRank = document.getElementById('hud-rank');
    this.elLap = document.getElementById('hud-lap-num');
    this.elTime = document.getElementById('hud-time');
    this.elSpeed = document.getElementById('hud-speed-num');
    this.elItemIcon = document.getElementById('hud-item-icon');
    this.elItemHint = document.getElementById('hud-item-hint');
    this.canvasMinimap = document.getElementById('hud-minimap');
    this.ctxMinimap = this.canvasMinimap ? this.canvasMinimap.getContext('2d') : null;

    this.heldItem = null;
  }

  setHeldItem(itemType) {
    this.heldItem = itemType;
    if (this.elItemIcon) {
      this.elItemIcon.textContent = itemType ? (ITEM_ICONS[itemType] || '❓') : '—';
    }
    if (this.elItemHint) {
      this.elItemHint.classList.toggle('hidden', !itemType);
    }
  }

  useHeldItem() {
    const item = this.heldItem;
    this.setHeldItem(null);
    return item;
  }

  update(speed, rank, currentLap, totalLaps, timeMs, karts = [], minimapPath = []) {
    // 1. Speedometer & Numbers
    if (this.elSpeed) {
      this.elSpeed.textContent = Math.abs(Math.round(speed * 3.6)); // m/s to km/h scale
    }

    // 2. Rank Ordinal
    if (this.elRank) {
      const suffixes = ['st', 'nd', 'rd', 'th'];
      const s = rank <= 3 ? suffixes[rank - 1] : 'th';
      this.elRank.innerHTML = `${rank}<sup>${s}</sup>`;
    }

    // 3. Lap Counter
    if (this.elLap) {
      this.elLap.textContent = currentLap;
    }

    // 4. Timer Format
    if (this.elTime) {
      const mins = Math.floor(timeMs / 60000);
      const secs = Math.floor((timeMs % 60000) / 1000);
      const ms = Math.floor((timeMs % 1000) / 10);
      this.elTime.textContent = 
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    }

    // 5. Draw 2D Minimap
    this.drawMinimap(karts, minimapPath);
  }

  drawMinimap(karts, path) {
    if (!this.ctxMinimap) return;
    const ctx = this.ctxMinimap;
    const W = this.canvasMinimap.width;
    const H = this.canvasMinimap.height;

    ctx.clearRect(0, 0, W, H);

    // Background circle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, W / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    if (path.length === 0) return;

    // Scale track points to canvas
    const scale = 0.8;
    const center = W / 2;

    // Draw track line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    path.forEach((pt, i) => {
      const px = center + pt.x * scale;
      const py = center + pt.z * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.stroke();

    // Draw kart dots
    karts.forEach((k) => {
      if (!k || !k.position) return;
      const px = center + k.position.x * scale;
      const py = center + k.position.z * scale;

      ctx.fillStyle = k.isLocal ? '#ff0000' : '#00a550';
      ctx.beginPath();
      ctx.arc(px, py, k.isLocal ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
