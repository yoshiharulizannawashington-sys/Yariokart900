JavaScript
// ════════════════════════════════════════════════════════════
//  audio.js  –  Web Audio API sound engine
// ════════════════════════════════════════════════════════════
'use strict';

const AUDIO = (() => {
    let ctx = null;
    let musicGain = null;
    let sfxGain = null;
    let musicNode = null;
    let musicPlaying = false;
    let musicVol = 0.6;
    let sfxVol = 0.8;
    let initialized = false;

    function init() {
        if (initialized) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        musicGain = ctx.createGain(); musicGain.gain.value = musicVol;
        sfxGain = ctx.createGain(); sfxGain.gain.value = sfxVol;
        musicGain.connect(ctx.destination);
        sfxGain.connect(ctx.destination);
        initialized = true;
    }

    function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

    // ── Synthesised SFX ──────────────────────────────────────
    function makeTone(freq, type, duration, vol = 0.3, fadeOut = true) {
        if (!initialized) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        if (fadeOut) gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain); gain.connect(sfxGain);
        osc.start(); osc.stop(ctx.currentTime + duration + 0.01);
    }

    function makeNoise(duration, vol = 0.2) {
        if (!initialized) return;
        const bufLen = ctx.sampleRate * duration;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        src.connect(gain); gain.connect(sfxGain);
        src.start();
    }

    // ── Named sounds ──────────────────────────────────────────
    const SFX = {
        boost() { makeTone(300, 'sawtooth', 0.15, 0.4); makeTone(600, 'sine', 0.25, 0.3); },
        hit() { makeNoise(0.25, 0.5); makeTone(100, 'square', 0.2, 0.5); },
        shell() { makeTone(800, 'square', 0.08, 0.3); makeTone(400, 'square', 0.08, 0.2); },
        shell_bounce() { makeTone(600, 'sine', 0.1, 0.25); },
        explosion() { makeNoise(0.5, 0.8); makeTone(80, 'sawtooth', 0.4, 0.6); },
        item_use() { makeTone(440, 'sine', 0.1, 0.3); makeTone(660, 'sine', 0.1, 0.3); },
        item_get() { [440, 550, 660, 880].forEach((f, i) => setTimeout(() => makeTone(f, 'sine', 0.1, 0.25), i * 60)); },
        lap() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => makeTone(f, 'sine', 0.15, 0.35), i * 80)); },
        countdown() { makeTone(220, 'square', 0.18, 0.5); },
        go() { makeTone(880, 'sine', 0.4, 0.6); makeTone(1100, 'sine', 0.3, 0.5); },
        finish() { [523, 659, 784, 880, 1047, 1319].forEach((f, i) => setTimeout(() => makeTone(f, 'sine', 0.3, 0.4), i * 100)); },
        star() { makeTone(1000, 'square', 0.5, 0.3); },
        lightning() { makeNoise(0.6, 0.7); makeTone(150, 'sawtooth', 0.5, 0.4); },
    };

    // ── Background music (generative) ─────────────────────────
    function startMusic(trackId) {
        if (!initialized || musicPlaying) return;
        musicPlaying = true;
        const melody = [
            [523, 0.2], [523, 0.2], [0, 0.2], [523, 0.2], [0, 0.2], [415, 0.2], [523, 0.4],
            [659, 0.4], [0, 0.4], [392, 0.4], [0, 0.4], [330, 0.4], [0, 0.4],
            [440, 0.3], [494, 0.3], [466, 0.25], [440, 0.3], [392, 0.25],
            [659, 0.25], [784, 0.25], [880, 0.25], [698, 0.25], [784, 0.2],
            [659, 0.25], [523, 0.25], [587, 0.2], [494, 0.3], [0, 0.1],
        ];
        let time = ctx.currentTime;
        const loop = () => {
            if (!musicPlaying) return;
            melody.forEach(([freq, dur]) => {
                if (freq > 0) {
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.value = freq;
                    g.gain.setValueAtTime(0.12, time);
                    g.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.9);
                    osc.connect(g); g.connect(musicGain);
                    osc.start(time); osc.stop(time + dur);
                }
                timeHere is the code for **`public/js/audio.js`**. 

On GitHub, click **Add file** $\rightarrow$ **Create new file**, type `public/js/audio.js` in the file name box, paste this code, and click **Commit changes...**:

```javascript
// ════════════════════════════════════════════════════════════
//  audio.js  –  Web Audio API sound engine
// ════════════════════════════════════════════════════════════
'use strict';
const AUDIO = (() => {
    let ctx = null;
    let musicGain = null;
    let sfxGain = null;
    let musicNode = null;
    let musicPlaying = false;
    let musicVol = 0.6;
    let sfxVol = 0.8;
    let initialized = false;

    function init() {
        if (initialized) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        musicGain = ctx.createGain(); musicGain.gain.value = musicVol;
        sfxGain = ctx.createGain(); sfxGain.gain.value = sfxVol;
        musicGain.connect(ctx.destination);
        sfxGain.connect(ctx.destination);
        initialized = true;
    }

    function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

    // ── Synthesised SFX ──────────────────────────────────────
    function makeTone(freq, type, duration, vol = 0.3, fadeOut = true) {
        if (!initialized) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        if (fadeOut) gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain); gain.connect(sfxGain);
        osc.start(); osc.stop(ctx.currentTime + duration + 0.01);
    }

    function makeNoise(duration, vol = 0.2) {
        if (!initialized) return;
        const bufLen = ctx.sampleRate * duration;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        src.connect(gain); gain.connect(sfxGain);
        src.start();
    }

    // ── Named sounds ──────────────────────────────────────────
    const SFX = {
        boost() { makeTone(300, 'sawtooth', 0.15, 0.4); makeTone(600, 'sine', 0.25, 0.3); },
        hit() { makeNoise(0.25, 0.5); makeTone(100, 'square', 0.2, 0.5); },
        shell() { makeTone(800, 'square', 0.08, 0.3); makeTone(400, 'square', 0.08, 0.2); },
        shell_bounce() { makeTone(600, 'sine', 0.1, 0.25); },
        explosion() { makeNoise(0.5, 0.8); makeTone(80, 'sawtooth', 0.4, 0.6); },
        item_use() { makeTone(440, 'sine', 0.1, 0.3); makeTone(660, 'sine', 0.1, 0.3); },
        item_get() { [440, 550, 660, 880].forEach((f, i) => setTimeout(() => makeTone(f, 'sine', 0.1, 0.25), i * 60)); },
        lap() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => makeTone(f, 'sine', 0.15, 0.35), i * 80)); },
        countdown() { makeTone(220, 'square', 0.18, 0.5); },
        go() { makeTone(880, 'sine', 0.4, 0.6); makeTone(1100, 'sine', 0.3, 0.5); },
        finish() { [523, 659, 784, 880, 1047, 1319].forEach((f, i) => setTimeout(() => makeTone(f, 'sine', 0.3, 0.4), i * 100)); },
        star() { makeTone(1000, 'square', 0.5, 0.3); },
        lightning() { makeNoise(0.6, 0.7); makeTone(150, 'sawtooth', 0.5, 0.4); },
    };

    // ── Background music (generative) ─────────────────────────
    function startMusic(trackId) {
        if (!initialized || musicPlaying) return;
        musicPlaying = true;
        const melody = [
            [523, 0.2], [523, 0.2], [0, 0.2], [523, 0.2], [0, 0.2], [415, 0.2], [523, 0.4],
            [659, 0.4], [0, 0.4], [392, 0.4], [0, 0.4], [330, 0.4], [0, 0.4],
            [440, 0.3], [494, 0.3], [466, 0.25], [440, 0.3], [392, 0.25],
            [659, 0.25], [784, 0.25], [880, 0.25], [698, 0.25], [784, 0.2],
            [659, 0.25], [523, 0.25], [587, 0.2], [494, 0.3], [0, 0.1],
        ];
        let time = ctx.currentTime;
        const loop = () => {
            if (!musicPlaying) return;
            melody.forEach(([freq, dur]) => {
                if (freq > 0) {
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.value = freq;
                    g.gain.setValueAtTime(0.12, time);
                    g.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.9);
                    osc.connect(g); g.connect(musicGain);
                    osc.start(time); osc.stop(time + dur);
                }
                time += dur;
            });
            const melodyDur = melody.reduce((a, [, d]) => a + d, 0);
            setTimeout(loop, melodyDur * 1000 - 200);
        };
        loop();
    }

    function stopMusic() { musicPlaying = false; }
    function setMusicVol(v) {
        musicVol = v;
        if (musicGain) musicGain.gain.value = v;
    }
    function setSfxVol(v) {
        sfxVol = v;
        if (sfxGain) sfxGain.gain.value = v;
    }

    return {
        init, resume, startMusic, stopMusic, setMusicVol, setSfxVol,
        play(name) {
            resume();
            if (SFX[name]) SFX[name]();
        }
    };
})();
