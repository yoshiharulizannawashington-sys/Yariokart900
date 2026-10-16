JavaScript
// ════════════════════════════════════════════════════════════
//  constants.js  –  Shared game constants
// ════════════════════════════════════════════════════════════
'use strict';

const MK = {
    // Physics
    GRAVITY: -25,
    DRIFT_FACTOR: 0.92,
    SLIP_FACTOR: 0.85,
    MINI_TURBO_THRESHOLD: 90,   // drift frames for mini-turbo
    MINI_TURBO_BOOST: 22,       // boost speed added
    MINI_TURBO_DURATION: 50,    // frames
    WALL_BOUNCE: 0.35,
    OFFTRACK_FRICTION: 0.92,    // extra friction off-road
    KART_RADIUS: 0.7,

    // Laps
    TOTAL_LAPS: 3,

    // Camera
    CAM_BEHIND: 7,
    CAM_HEIGHT: 3.5,
    CAM_LOOK_AHEAD: 6,
    CAM_LERP: 0.08,

    // Items
    ITEM_BOX_SPIN_SPEED: 0.03,
    ITEM_BOX_RESPAWN: 8000,  // ms
    SHELL_SPEED: 30,
    SHELL_BOUNCE: 3,
    MUSHROOM_BOOST: 25,
    MUSHROOM_DURATION: 60,
    STAR_DURATION: 300,
    BOB_OMB_FUSE: 180,
    BOB_OMB_RADIUS: 5,
    BANANA_SLIP_FRAMES: 80,

    // Network
    POSITION_SEND_RATE: 20,    // per second

    // Colors (hex numbers for Three.js)
    COL: {
        SKY_TOP: 0x1a80cc,
        SKY_BTM: 0x70c8ff,
        ROAD: 0x444466,
        GRASS: 0x2d8c3e,
        BARRIER: 0xdddddd,
        ITEM_BOX: 0xffd700,
        FINISHLINE: 0xffffff,
    }
};

// Item type enum
const ITEM = {
    BANANA: 'banana',
    GREEN_SHELL: 'green_shell',
    RED_SHELL: 'red_shell',
    MUSHROOM: 'mushroom',
    TRIPLE_MUSHROOM: 'triple_mushroom',
    STAR: 'star',
    BOB_OMB: 'bob_omb',
    BLUE_SHELL: 'blue_shell',
    LIGHTNING: 'lightning',
    FAKE_ITEM: 'fake_item',
};

// Item rarity table: [rank_range, items_possible]
const ITEM_TABLE = [
    { maxRank: 1, items: [ITEM.MUSHROOM, ITEM.RED_SHELL, ITEM.STAR, ITEM.LIGHTNING, ITEM.BLUE_SHELL, ITEM.TRIPLE_MUSHROOM] },
    { maxRank: 3, items: [ITEM.MUSHROOM, ITEM.RED_SHELL, ITEM.GREEN_SHELL, ITEM.BANANA, ITEM.TRIPLE_MUSHROOM] },
    { maxRank: 5, items: [ITEM.MUSHROOM, ITEM.GREEN_SHELL, ITEM.BANANA, ITEM.BOB_OMB] },
    { maxRank: 8, items: [ITEM.GREEN_SHELL, ITEM.BANANA, ITEM.FAKE_ITEM, ITEM.MUSHROOM, ITEM.BOB_OMB] },
];

function getRandomItem(rank) {
    const row = ITEM_TABLE.find(r => rank <= r.maxRank) || ITEM_TABLE[ITEM_TABLE.length - 1];
    return row.items[Math.floor(Math.random() * row.items.length)];
}

const ITEM_ICONS = {
    [ITEM.BANANA]: '🍌',
    [ITEM.GREEN_SHELL]: '🟢',
    [ITEM.RED_SHELL]: '🔴',
    [ITEM.MUSHROOM]: '🍄',
    [ITEM.TRIPLE_MUSHROOM]: '🍄🍄🍄',
    [ITEM.STAR]: '⭐',
    [ITEM.BOB_OMB]: '💣',
    [ITEM.BLUE_SHELL]: '💙',
    [ITEM.LIGHTNING]: '⚡',
    [ITEM.FAKE_ITEM]: '❓',
};
