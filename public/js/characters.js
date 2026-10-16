JavaScript
// ════════════════════════════════════════════════════════════
//  characters.js  –  Characters & karts data
// ════════════════════════════════════════════════════════════
'use strict';

const CHARACTERS = {
    mario: {
        name: 'Mario',
        emoji: '🧑',
        color: '#E8001D',
        weight: 'medium',
        stats: { speed: 7, accel: 7, handling: 7, weight: 5, drift: 6, items: 6 },
        karts: ['standard', 'bullet', 'brute'],
    },
    luigi: {
        name: 'Luigi',
        emoji: '🟢',
        color: '#00A550',
        weight: 'medium',
        stats: { speed: 6, accel: 8, handling: 7, weight: 5, drift: 7, items: 7 },
        karts: ['standard', 'poltergust', 'brute'],
    },
    peach: {
        name: 'Peach',
        emoji: '👸',
        color: '#FF69B4',
        weight: 'light',
        stats: { speed: 6, accel: 9, handling: 8, weight: 3, drift: 7, items: 8 },
        karts: ['royal', 'standard', 'light'],
    },
    yoshi: {
        name: 'Yoshi',
        emoji: '🦕',
        color: '#7FBF00',
        weight: 'light',
        stats: { speed: 10, accel: 10, handling:10, weight: 3, drift: 10, items: 10 },
        karts: ['egg', 'standard', 'light'],
    },
    toad: {
        name: 'Toad',
        emoji: '🍄',
        color: '#4169E1',
        weight: 'light',
        stats: { speed: 5, accel: 10, handling: 9, weight: 2, drift: 9, items: 9 },
        karts: ['mushmellow', 'light', 'standard'],
    },
    dk: {
        name: 'Donkey Kong',
        emoji: '🦍',
        color: '#8B4513',
        weight: 'heavy',
        stats: { speed: 9, accel: 5, handling: 5, weight: 8, drift: 4, items: 4 },
        karts: ['barrel', 'brute', 'standard'],
    },
    wario: {
        name: 'Wario',
        emoji: '💛',
        color: '#FFD700',
        weight: 'heavy',
        stats: { speed: 9, accel: 4, handling: 4, weight: 9, drift: 3, items: 3 },
        karts: ['brute', 'barrel', 'standard'],
    },
    bowser: {
        name: 'Bowser',
        emoji: '🐢',
        color: '#228B22',
        weight: 'heavy',
        stats: { speed: 10, accel: 3, handling: 3, weight: 10, drift: 3, items: 3 },
        karts: ['brute', 'standard', 'barrel'],
    },
};

const KARTS = {
    standard: {
        name: 'Standard',
        icon: '🏎️',
        modifiers: { speed: 0, accel: 0, handling: 0, weight: 0, drift: 0 },
        color: 0xff3333,
    },
    light: {
        name: 'Light',
        icon: '🚗',
        modifiers: { speed: -1, accel: 2, handling: 2, weight: -1, drift: 2 },
        color: 0x44ccff,
    },
    brute: {
        name: 'Brute',
        icon: '🚙',
        modifiers: { speed: 2, accel: -2, handling: -1, weight: 2, drift: -1 },
        color: 0x888888,
    },
    barrel: {
        name: 'Barrel',
        icon: '🛻',
        modifiers: { speed: 1, accel: -1, handling: 0, weight: 1, drift: 0 },
        color: 0x8B4513,
    },
    egg: {
        name: 'Egg 1',
        icon: '🥚',
        modifiers: { speed: -1, accel: 3, handling: 3, weight: -2, drift: 3 },
        color: 0x90ee90,
    },
    royal: {
        name: 'Royal Racer',
        icon: '👑',
        modifiers: { speed: 1, accel: 1, handling: 3, weight: -1, drift: 3 },
        color: 0xff69b4,
    },
    poltergust: {
        name: 'Poltergust',
        icon: '👻',
        modifiers: { speed: 0, accel: 2, handling: 1, weight: 0, drift: 2 },
        color: 0x228b22,
    },
    mushmellow: {
        name: 'Mushmellow',
        icon: '🍄',
        modifiers: { speed: -2, accel: 3, handling: 4, weight: -3, drift: 4 },
        color: 0x4169e1,
    },
    bullet: {
        name: 'B-Dasher',
        icon: '💨',
        modifiers: { speed: 3, accel: -1, handling: -1, weight: 1, drift: -1 },
        color: 0xe8001d,
    },
};

function getEffectiveStats(charKey, kartKey) {
    const char = CHARACTERS[charKey];
    const kart = KARTS[kartKey] || KARTS.standard;
    const s = { ...char.stats };
    for (const k in kart.modifiers) {
        s[k] = Math.max(1, Math.min(10, (s[k] || 5) + kart.modifiers[k]));
    }
    // Convert to gameplay units
    return {
        maxSpeed: 18 + s.speed * 1.6,        // 13.6 – 28
        acceleration: 0.04 + s.accel * 0.018, // 0.058 – 0.22
        handling: 0.025 + s.handling * 0.004, // 0.029 – 0.065
        weight: s.weight,
        drift: s.drift,
        raw: s,
    };
}
