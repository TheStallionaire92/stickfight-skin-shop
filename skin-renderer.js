/* ============================================================
   STICKFIGHT ROYALE + DUEL MODE - FULL stickfight.js
   Version:
   - Battle Royale
   - XP pro Treffer
   - Skin-System
   - kleineres Overlay über CSS
   - Duel Mode 1vs1
   - Duel Fight Queue kompatibel mit Streamer.bot
============================================================ */

const wrapper = document.getElementById("stickfight-wrapper");
const canvas = document.getElementById("fightCanvas");
const ctx = canvas.getContext("2d");

const skyline = document.getElementById("skyline");
const eventBanner = document.getElementById("event-banner");
const winnerBanner = document.getElementById("winner-banner");
const winnerNameEl = document.getElementById("winner-name");
const joinTimerEl = document.getElementById("join-timer");
const fightCallout = document.getElementById("fight-callout");
const cityLayer = document.getElementById("city-layer");
const arenaStatus = document.getElementById("arena-status");

const GAME = {
  idle: "idle",
  joining: "joining",
  fighting: "fighting",
  duelIntro: "duelIntro",
  duelFighting: "duelFighting",
  ended: "ended"
};

const MODE = {
  battleRoyale: "battleRoyale",
  duel: "duel"
};

const MAX_ACTIVE_PLAYERS = 20;
const MAX_QUEUE_PLAYERS = 20;
const REFILL_AMOUNT = 5;
const JOIN_SECONDS_DEFAULT = 15;
const SPAWN_PROTECTION_SECONDS = 1;

const HIT_XP_REWARD = 3;
const KILL_XP_REWARD = 25;
const WIN_XP_REWARD = 75;
const KILL_HORSE_REWARD = 500;
const WIN_HORSE_REWARD = 2500;

const DUEL_HIT_XP_REWARD = 3;
const DUEL_WIN_XP_REWARD = 50;

const MAX_LEVEL = 50;

const STREAMERBOT_WS_URL = "ws://127.0.0.1:8080";
const STREAMERBOT_SAVE_ACTION_NAME = "StickFight - Save Result";
const STREAMERBOT_DUEL_SAVE_ACTION_NAME = "StickFight Duel - Save Result";

let streamerbotSocket = null;
let streamerbotReconnectTimer = null;

let gameState = GAME.idle;
let currentMode = MODE.battleRoyale;

let players = [];
let queuedPlayers = [];

let damageTexts = [];
let particles = [];
let slashEffects = [];
let impactRings = [];
let bloodDrops = [];
let spawnPortals = [];
let goldParticles = [];

let joinSeconds = JOIN_SECONDS_DEFAULT;
let joinInterval = null;
let lastTime = performance.now();
let screenShake = 0;
let resultsSent = false;

let duelMeta = {
  active: false,
  challenger: "",
  target: "",
  bet: 0,
  pot: 0,
  startedAt: 0,
  introSeconds: 3,
  resultsSent: false
};

const arena = {
  left: 80,
  right: 1840,
  groundY: 1012,
  minX: 120,
  maxX: 1800
};

const duelArena = {
  leftSpawnX: 470,
  rightSpawnX: 1450,
  leftSlotX: 720,
  rightSlotX: 1200,
  groundY: 1012,
  minX: 320,
  maxX: 1600
};

const neonColors = [
  "#00ff84",
  "#00e5ff",
  "#ff00f7",
  "#ffd000",
  "#ff304f",
  "#7dff00",
  "#814dff",
  "#ffffff",
  "#ff8c00",
  "#00a2ff"
];

/* ============================================================
   SKIN SYSTEM
============================================================ */

const SKINS = {
  default: {
    name: "Default",
    color: null,
    blade: "#ffffff",
    accent: "#ffffff",
    accessory: "none",
    trail: "normal"
  },

  neon_green: {
    name: "Neon Grün",
    color: "#00ff84",
    blade: "#ffffff",
    accent: "#00ff84",
    accessory: "none",
    trail: "normal"
  },
  neon_blue: {
    name: "Neon Blau",
    color: "#00a2ff",
    blade: "#ffffff",
    accent: "#00a2ff",
    accessory: "none",
    trail: "normal"
  },
  neon_pink: {
    name: "Neon Pink",
    color: "#ff36dc",
    blade: "#ffffff",
    accent: "#ff36dc",
    accessory: "none",
    trail: "normal"
  },
  neon_gold: {
    name: "Neon Gold",
    color: "#ffd34a",
    blade: "#fff4b0",
    accent: "#ffd34a",
    accessory: "none",
    trail: "gold"
  },

  street_fighter: {
    name: "Straßenkämpfer",
    color: "#ff8c32",
    blade: "#d7d7d7",
    accent: "#ff8c32",
    accessory: "cap",
    trail: "dust"
  },
  hoodie_shadow: {
    name: "Hoodie Schatten",
    color: "#6b6bff",
    blade: "#c9c9ff",
    accent: "#6b6bff",
    accessory: "hood",
    trail: "shadow"
  },
  comic_hero: {
    name: "Comic-Held",
    color: "#ff4242",
    blade: "#ffffff",
    accent: "#2978ff",
    accessory: "cape",
    trail: "comic"
  },
  tiny_goblin: {
    name: "Kleiner Goblin",
    color: "#8aff00",
    blade: "#eaffc6",
    accent: "#8aff00",
    accessory: "goblin_ears",
    trail: "toxic"
  },
  cute_bunny: {
    name: "Süßer Hase",
    color: "#ffb7e8",
    blade: "#fff1fb",
    accent: "#ffb7e8",
    accessory: "bunny_ears",
    trail: "heart"
  },
  banana_warrior: {
    name: "Bananenkrieger",
    color: "#ffe600",
    blade: "#fff7b0",
    accent: "#ffe600",
    accessory: "banana",
    trail: "comic"
  },

  blood_blade: {
    name: "Blood Blade",
    color: "#ff173b",
    blade: "#ff173b",
    accent: "#8b0015",
    accessory: "blood",
    trail: "blood"
  },
  toxic_fighter: {
    name: "Toxic Fighter",
    color: "#b6ff00",
    blade: "#eaffbf",
    accent: "#b6ff00",
    accessory: "toxic_ring",
    trail: "toxic"
  },
  ice_stickman: {
    name: "Eis-Krieger",
    color: "#8cecff",
    blade: "#eaffff",
    accent: "#8cecff",
    accessory: "ice",
    trail: "ice"
  },
  fire_runner: {
    name: "Feuerläufer",
    color: "#ff7a1a",
    blade: "#fff0c9",
    accent: "#ff304f",
    accessory: "fire",
    trail: "fire"
  },
  storm_slasher: {
    name: "Sturm-Schlitzer",
    color: "#33d8ff",
    blade: "#ffffff",
    accent: "#ffe600",
    accessory: "lightning",
    trail: "lightning"
  },
  shadow_cat: {
    name: "Schattenkatze",
    color: "#b06cff",
    blade: "#eee2ff",
    accent: "#b06cff",
    accessory: "cat_ears",
    trail: "shadow"
  },
  clown_blade: {
    name: "Messer-Clown",
    color: "#ff304f",
    blade: "#ffffff",
    accent: "#ffffff",
    accessory: "clown_hat",
    trail: "comic"
  },
  pumpkin_reaper: {
    name: "Kürbis-Schnitter",
    color: "#ff8a00",
    blade: "#ffd6a1",
    accent: "#ff8a00",
    accessory: "pumpkin",
    trail: "fire"
  },
  plague_doctor: {
    name: "Pestdoktor",
    color: "#c8d0d8",
    blade: "#e5edf5",
    accent: "#c8d0d8",
    accessory: "plague_mask",
    trail: "smoke"
  },
  arcade_knight: {
    name: "Arcade-Ritter",
    color: "#00e5ff",
    blade: "#ffffff",
    accent: "#ff00f7",
    accessory: "pixel_helmet",
    trail: "pixel"
  },

  anime_swordsman: {
    name: "Anime-Schwertkämpfer",
    color: "#7ad7ff",
    blade: "#ffffff",
    accent: "#7ad7ff",
    accessory: "speed_lines",
    trail: "anime"
  },
  demon_student: {
    name: "Dämonenschüler",
    color: "#b94cff",
    blade: "#ffd6ff",
    accent: "#ff304f",
    accessory: "demon_horns",
    trail: "demon"
  },
  masked_ninja: {
    name: "Maskierter Ninja",
    color: "#8e8eff",
    blade: "#f4f4ff",
    accent: "#8e8eff",
    accessory: "ninja_mask",
    trail: "smoke"
  },
  spirit_samurai: {
    name: "Geister-Samurai",
    color: "#7fffd4",
    blade: "#ffffff",
    accent: "#7fffd4",
    accessory: "samurai_helmet",
    trail: "spirit"
  },
  thunder_senpai: {
    name: "Donner-Senpai",
    color: "#ffe600",
    blade: "#ffffff",
    accent: "#ffe600",
    accessory: "lightning",
    trail: "lightning"
  },
  rose_assassin: {
    name: "Rosen-Assassine",
    color: "#ff4f8b",
    blade: "#fff1f7",
    accent: "#ff4f8b",
    accessory: "rose",
    trail: "rose"
  },
  cyber_ninja: {
    name: "Cyber Ninja",
    color: "#00ffee",
    blade: "#ffffff",
    accent: "#00ffee",
    accessory: "cyber_frame",
    trail: "glitch"
  },
  glitch_demon: {
    name: "Glitch Demon",
    color: "#ff304f",
    blade: "#00e5ff",
    accent: "#00e5ff",
    accessory: "glitch",
    trail: "glitch"
  },
  mecha_stick: {
    name: "Mecha Stickfighter",
    color: "#bfc7d5",
    blade: "#ffffff",
    accent: "#00e5ff",
    accessory: "mecha",
    trail: "spark"
  },
  holo_blade: {
    name: "Holo Blade",
    color: "#75fff8",
    blade: "#dffffd",
    accent: "#75fff8",
    accessory: "holo_cage",
    trail: "holo"
  },
  void_walker: {
    name: "Void Walker",
    color: "#7a2cff",
    blade: "#cbb2ff",
    accent: "#7a2cff",
    accessory: "void",
    trail: "void"
  },
  bone_knight: {
    name: "Knochenritter",
    color: "#e5dfcc",
    blade: "#fff8e8",
    accent: "#e5dfcc",
    accessory: "bone_armor",
    trail: "bone"
  },
  vampire_duelist: {
    name: "Vampir-Duellant",
    color: "#d20d36",
    blade: "#ffffff",
    accent: "#d20d36",
    accessory: "cape",
    trail: "blood"
  },
  werewolf_rage: {
    name: "Werwolf-Raserei",
    color: "#b87945",
    blade: "#ffd7b4",
    accent: "#b87945",
    accessory: "wolf",
    trail: "rage"
  },
  angelic_guardian: {
    name: "Himmlischer Wächter",
    color: "#ffffff",
    blade: "#fff6c8",
    accent: "#fff6c8",
    accessory: "angel_wings",
    trail: "holy"
  },

  fallen_angel: {
    name: "Gefallener Engel",
    color: "#9c5cff",
    blade: "#d9c2ff",
    accent: "#1c112d",
    accessory: "fallen_wings",
    trail: "void"
  },
  gold_champion: {
    name: "Gold Champion",
    color: "#ffd34a",
    blade: "#ffffff",
    accent: "#ffd34a",
    accessory: "crown",
    trail: "gold"
  },
  blood_emperor: {
    name: "Blutkaiser",
    color: "#c90025",
    blade: "#ffd6dd",
    accent: "#ffd34a",
    accessory: "blood_crown",
    trail: "blood"
  },
  dragon_soul: {
    name: "Drachenseele",
    color: "#ff6b00",
    blade: "#fff0c6",
    accent: "#ff6b00",
    accessory: "dragon_wings",
    trail: "fire"
  },
  shadow_horseman: {
    name: "Schattenhengst",
    color: "#8d5bff",
    blade: "#d7c8ff",
    accent: "#8d5bff",
    accessory: "horse_ring",
    trail: "shadow"
  },
  cosmic_reaper: {
    name: "Kosmischer Schnitter",
    color: "#6efcff",
    blade: "#ffffff",
    accent: "#6efcff",
    accessory: "stars",
    trail: "cosmic"
  },
  neon_overlord: {
    name: "Neon Overlord",
    color: "#00ffee",
    blade: "#ffffff",
    accent: "#00ffee",
    accessory: "overlord_frame",
    trail: "holo"
  },
  rainbow_madness: {
    name: "Regenbogen-Wahnsinn",
    color: "#ffd34a",
    blade: "#ffffff",
    accent: "#ff36dc",
    accessory: "rainbow_orbit",
    trail: "rainbow"
  },
  kawaii_destroyer: {
    name: "Kawaii Destroyer",
    color: "#ff9fe8",
    blade: "#ffffff",
    accent: "#ffd34a",
    accessory: "kawaii",
    trail: "heart"
  },
  herd_guardian: {
    name: "Wächter der Herde",
    color: "#ffd34a",
    blade: "#ffffff",
    accent: "#ffd34a",
    accessory: "herd_halo",
    trail: "gold"
  },

  red_glitch_king: {
    name: "Roter Glitch-König",
    color: "#ff304f",
    blade: "#00e5ff",
    accent: "#00e5ff",
    accessory: "glitch_crown",
    trail: "glitch"
  },
  nightmare_clown: {
    name: "Albtraum-Clown",
    color: "#ff1747",
    blade: "#ffffff",
    accent: "#ffffff",
    accessory: "nightmare_clown",
    trail: "blood"
  },
  celestial_samurai: {
    name: "Celestial Samurai",
    color: "#ffd34a",
    blade: "#ffffff",
    accent: "#ffffff",
    accessory: "celestial_samurai",
    trail: "cosmic"
  },
  golden_mustang: {
    name: "Goldener Mustang",
    color: "#ffd34a",
    blade: "#fff8d2",
    accent: "#ffd34a",
    accessory: "golden_mustang",
    trail: "gold"
  },
  the_final_boss: {
    name: "The Final Boss",
    color: "#ff003c",
    blade: "#ffffff",
    accent: "#ff003c",
    accessory: "final_boss",
    trail: "boss"
  }
};

/* ============================================================
   HIGH-TIER VISUAL SYSTEM
   Epic, legendary and mystic skins deliberately change the
   fighter silhouette, armor, aura and weapon. These are visual
   upgrades only and do not alter combat values.
============================================================ */

const HIGH_TIER_VISUALS = {
  anime_swordsman: {
    tier: "epic", armor: "samurai", weapon: "katana", emblem: "slash",
    secondary: "#eafaff"
  },
  demon_student: {
    tier: "epic", armor: "demon", weapon: "demon_blade", emblem: "demon",
    secondary: "#ff304f"
  },
  masked_ninja: {
    tier: "epic", armor: "ninja", weapon: "katana", emblem: "mask",
    secondary: "#d8d8ff"
  },
  spirit_samurai: {
    tier: "epic", armor: "spirit_samurai", weapon: "katana", emblem: "spirit",
    secondary: "#ffffff"
  },
  thunder_senpai: {
    tier: "epic", armor: "storm", weapon: "lightning_blade", emblem: "bolt",
    secondary: "#ffffff"
  },
  rose_assassin: {
    tier: "epic", armor: "assassin", weapon: "rapier", emblem: "rose",
    secondary: "#ffe1ee"
  },
  cyber_ninja: {
    tier: "epic", armor: "cyber", weapon: "energy_katana", emblem: "circuit",
    secondary: "#ff36dc"
  },
  glitch_demon: {
    tier: "epic", armor: "glitch", weapon: "glitch_blade", emblem: "glitch",
    secondary: "#00e5ff"
  },
  mecha_stick: {
    tier: "epic", armor: "mecha", weapon: "greatsword", emblem: "core",
    secondary: "#00e5ff"
  },
  holo_blade: {
    tier: "epic", armor: "holo", weapon: "energy_katana", emblem: "holo",
    secondary: "#ffffff"
  },
  void_walker: {
    tier: "epic", armor: "void", weapon: "void_scythe", emblem: "void",
    secondary: "#cbb2ff"
  },
  bone_knight: {
    tier: "epic", armor: "bone", weapon: "greatsword", emblem: "bone",
    secondary: "#fff8e8"
  },
  vampire_duelist: {
    tier: "epic", armor: "vampire", weapon: "rapier", emblem: "fang",
    secondary: "#ffd6dd"
  },
  werewolf_rage: {
    tier: "epic", armor: "beast", weapon: "claws", emblem: "claw",
    secondary: "#ffd7b4"
  },
  angelic_guardian: {
    tier: "epic", armor: "angel", weapon: "holy_blade", emblem: "halo",
    secondary: "#ffd34a"
  },

  fallen_angel: {
    tier: "legendary", armor: "fallen_angel", weapon: "fallen_blade", emblem: "broken_halo",
    secondary: "#9c5cff"
  },
  gold_champion: {
    tier: "legendary", armor: "champion", weapon: "greatsword", emblem: "crown",
    secondary: "#ffffff"
  },
  blood_emperor: {
    tier: "legendary", armor: "emperor", weapon: "royal_blade", emblem: "blood_crown",
    secondary: "#ffd34a"
  },
  dragon_soul: {
    tier: "legendary", armor: "dragon", weapon: "dragon_blade", emblem: "dragon",
    secondary: "#ffd34a"
  },
  shadow_horseman: {
    tier: "legendary", armor: "shadow_horseman", weapon: "lance", emblem: "horseshoe",
    secondary: "#d7c8ff"
  },
  cosmic_reaper: {
    tier: "legendary", armor: "cosmic_reaper", weapon: "cosmic_scythe", emblem: "star",
    secondary: "#ffffff"
  },
  neon_overlord: {
    tier: "legendary", armor: "overlord", weapon: "energy_greatsword", emblem: "overlord",
    secondary: "#ff00f7"
  },
  rainbow_madness: {
    tier: "legendary", armor: "rainbow", weapon: "rainbow_blade", emblem: "rainbow",
    secondary: "#00e5ff"
  },
  kawaii_destroyer: {
    tier: "legendary", armor: "kawaii", weapon: "hammer", emblem: "heart",
    secondary: "#ffffff"
  },
  herd_guardian: {
    tier: "legendary", armor: "herd_guardian", weapon: "lance", emblem: "horseshoe",
    secondary: "#ffffff"
  },

  red_glitch_king: {
    tier: "mystic", armor: "glitch_king", weapon: "glitch_greatsword", emblem: "glitch_crown",
    secondary: "#00e5ff"
  },
  nightmare_clown: {
    tier: "mystic", armor: "nightmare", weapon: "cleaver", emblem: "nightmare",
    secondary: "#ffffff"
  },
  celestial_samurai: {
    tier: "mystic", armor: "celestial", weapon: "celestial_katana", emblem: "sun",
    secondary: "#ffffff"
  },
  golden_mustang: {
    tier: "mystic", armor: "mustang", weapon: "golden_lance", emblem: "mustang",
    secondary: "#fff8d2"
  },
  the_final_boss: {
    tier: "mystic", armor: "final_boss", weapon: "boss_greatsword", emblem: "boss",
    secondary: "#ffffff"
  }
};

function getHighTierVisual(skinId) {
  return skinId && HIGH_TIER_VISUALS[skinId]
    ? HIGH_TIER_VISUALS[skinId]
    : null;
}

function getSkinStyle(skinId, fallbackColor) {
  const safeId = skinId && SKINS[skinId] ? skinId : "default";
  const skin = SKINS[safeId];

  return {
    id: safeId,
    name: skin.name,
    color: skin.color || fallbackColor || "#00ff84",
    blade: skin.blade || "#ffffff",
    accent: skin.accent || skin.color || fallbackColor || "#ffffff",
    accessory: skin.accessory || "none",
    trail: skin.trail || "normal"
  };
}

/* ============================================================
   HELPERS
============================================================ */

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(random(min, max + 1));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function safeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeIncomingText(rawMessage) {
  return String(rawMessage)
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function formatShortNumber(value) {
  const number = Math.max(0, Math.floor(Number(value) || 0));

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 10000) {
    return `${Math.floor(number / 1000)}K`;
  }

  return String(number);
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.floor(Math.random() * 999999)}`;
}

/* ============================================================
   XP / LEVEL SYSTEM
============================================================ */

function getXpNeededForNextLevel(level) {
  const safeLevel = Math.max(1, Math.min(MAX_LEVEL, Math.floor(Number(level) || 1)));
  return safeLevel * 100;
}

function getLevelProgressFromTotalXp(totalXp, level) {
  const safeXp = Math.max(0, Math.floor(Number(totalXp) || 0));
  const safeLevel = Math.max(1, Math.min(MAX_LEVEL, Math.floor(Number(level) || 1)));

  if (safeLevel >= MAX_LEVEL) {
    return {
      currentLevelXp: getXpNeededForNextLevel(MAX_LEVEL),
      neededXp: getXpNeededForNextLevel(MAX_LEVEL),
      progress: 1,
      label: "MAX"
    };
  }

  let xpBeforeCurrentLevel = 0;

  for (let lvl = 1; lvl < safeLevel; lvl++) {
    xpBeforeCurrentLevel += getXpNeededForNextLevel(lvl);
  }

  const neededXp = getXpNeededForNextLevel(safeLevel);
  const currentLevelXp = clamp(safeXp - xpBeforeCurrentLevel, 0, neededXp);
  const progress = neededXp > 0 ? currentLevelXp / neededXp : 0;

  return {
    currentLevelXp,
    neededXp,
    progress,
    label: `${formatShortNumber(currentLevelXp)}/${formatShortNumber(neededXp)} XP`
  };
}

/* ============================================================
   LEVEL / BALANCING
============================================================ */

function getMaxHpByLevel(level) {
  return 100 + Math.max(0, level - 1) * 12;
}

function getAttackDamage(attackerLevel, targetLevel) {
  const levelDiff = attackerLevel - targetLevel;

  let minDamage = 7 + Math.floor(attackerLevel * 1.2);
  let maxDamage = 13 + Math.floor(attackerLevel * 1.7);

  if (levelDiff < 0) {
    const penalty = Math.abs(levelDiff) * 1.8;
    minDamage -= penalty;
    maxDamage -= penalty;
  }

  if (levelDiff > 0) {
    const bonus = levelDiff * 1.1;
    minDamage += bonus;
    maxDamage += bonus;
  }

  minDamage = Math.max(4, Math.floor(minDamage));
  maxDamage = Math.max(minDamage + 2, Math.floor(maxDamage));

  return randomInt(minDamage, maxDamage);
}

function getCritDamage(attackerLevel, targetLevel) {
  const baseDamage = getAttackDamage(attackerLevel, targetLevel);
  const critDamage = Math.floor(baseDamage * 1.55);
  return Math.max(baseDamage + 4, critDamage);
}

function getSpecialDamage(attackerLevel, targetLevel) {
  const levelDiff = attackerLevel - targetLevel;

  let minDamage = 18 + Math.floor(attackerLevel * 1.6);
  let maxDamage = 28 + Math.floor(attackerLevel * 2.1);

  if (levelDiff < 0) {
    const penalty = Math.abs(levelDiff) * 2.4;
    minDamage -= penalty;
    maxDamage -= penalty;
  }

  if (levelDiff > 0) {
    const bonus = levelDiff * 1.5;
    minDamage += bonus;
    maxDamage += bonus;
  }

  minDamage = Math.max(10, Math.floor(minDamage));
  maxDamage = Math.max(minDamage + 4, Math.floor(maxDamage));

  return randomInt(minDamage, maxDamage);
}

function applyOneShotProtection(attacker, target, damage) {
  const targetWasFullHp = target.hp === target.maxHp;
  const attackerMuchStronger = attacker.level >= target.level + 4;

  if (targetWasFullHp && !attackerMuchStronger && damage >= target.hp) {
    return target.hp - 1;
  }

  return damage;
}
/* ============================================================
   SKYLINE
============================================================ */

function createSkyline() {
  if (!skyline) return;

  skyline.innerHTML = "";
  let x = -20;

  while (x < 1960) {
    const building = document.createElement("div");
    building.className = "building";

    const width = randomInt(70, 130);
    const height = randomInt(130, 305);

    building.style.left = `${x}px`;
    building.style.width = `${width}px`;
    building.style.height = `${height}px`;

    const cols = Math.floor(width / 28);
    const rows = Math.floor(height / 34);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.48) continue;

        const win = document.createElement("div");
        win.className = "window";

        if (Math.random() < 0.22) win.classList.add("white");
        if (Math.random() < 0.28) win.classList.add("off");

        win.style.left = `${12 + c * 26}px`;
        win.style.top = `${16 + r * 31}px`;
        win.style.animationDelay = `${random(0, 3)}s`;

        building.appendChild(win);
      }
    }

    skyline.appendChild(building);
    x += width + randomInt(6, 18);
  }
}

/* ============================================================
   STATE HELPERS
============================================================ */

function getAlivePlayers() {
  return players.filter(player => !player.dead && player.hp > 0);
}

function getActiveCount() {
  return getAlivePlayers().length;
}

function isDuelModeActive() {
  return currentMode === MODE.duel || gameState === GAME.duelIntro || gameState === GAME.duelFighting;
}

function updateArenaStatus() {
  if (!arenaStatus) return;

  if (gameState === GAME.idle) {
    arenaStatus.classList.add("hidden");
    return;
  }

  if (isDuelModeActive()) {
    const alive = getAlivePlayers().length;
    const betText = duelMeta.bet > 0 ? ` · POT ${formatShortNumber(duelMeta.pot)} H` : "";
    arenaStatus.innerText = `DUELL ${alive}/2${betText}`;
    arenaStatus.classList.remove("hidden");
    return;
  }

  const active = getActiveCount();
  const queue = queuedPlayers.length;

  arenaStatus.innerText = `FIGHTER ${active}/${MAX_ACTIVE_PLAYERS} · QUEUE ${queue}/${MAX_QUEUE_PLAYERS}`;
  arenaStatus.classList.remove("hidden");
}

function userAlreadyRegistered(username) {
  const normalized = String(username).toLowerCase();

  const inPlayers = players.some(player => {
    return String(player.name).toLowerCase() === normalized && !player.dead;
  });

  const inQueue = queuedPlayers.some(player => {
    return String(player.name).toLowerCase() === normalized;
  });

  return inPlayers || inQueue;
}

/* ============================================================
   GENERAL RESET
============================================================ */

function clearVisuals() {
  damageTexts = [];
  particles = [];
  slashEffects = [];
  impactRings = [];
  bloodDrops = [];
  spawnPortals = [];
  goldParticles = [];
  screenShake = 0;
}

function resetGame() {
  gameState = GAME.idle;
  currentMode = MODE.battleRoyale;

  players = [];
  queuedPlayers = [];

  clearVisuals();

  resultsSent = false;

  duelMeta = {
    active: false,
    challenger: "",
    target: "",
    bet: 0,
    pot: 0,
    startedAt: 0,
    introSeconds: 3,
    resultsSent: false
  };

  if (joinInterval) {
    clearInterval(joinInterval);
    joinInterval = null;
  }

  if (eventBanner) eventBanner.classList.add("hidden");
  if (winnerBanner) winnerBanner.classList.add("hidden");
  if (arenaStatus) arenaStatus.classList.add("hidden");
  if (cityLayer) cityLayer.classList.remove("active");
  if (wrapper) wrapper.classList.remove("active");
  if (fightCallout) fightCallout.classList.remove("active");

  updateArenaStatus();
}

/* ============================================================
   BATTLE ROYALE FLOW
============================================================ */

function startStickFight() {
  resetGame();

  currentMode = MODE.battleRoyale;
  gameState = GAME.joining;
  joinSeconds = JOIN_SECONDS_DEFAULT;
  resultsSent = false;

  if (wrapper) wrapper.classList.add("active");
  if (cityLayer) cityLayer.classList.add("active");

  if (eventBanner) eventBanner.classList.remove("hidden");
  if (winnerBanner) winnerBanner.classList.add("hidden");
  if (fightCallout) fightCallout.classList.remove("active");

  if (joinTimerEl) joinTimerEl.innerText = joinSeconds;

  if (eventBanner) {
    const kicker = eventBanner.querySelector(".banner-kicker");
    const title = eventBanner.querySelector(".banner-title");
    const subtitle = eventBanner.querySelector(".banner-subtitle");

    if (kicker) kicker.innerText = "ARENA ONLINE";
    if (title) title.innerText = "STICKFIGHT ROYALE";
    if (subtitle) subtitle.innerText = "Tippe !fight und betrete die Arena!";
  }

  screenShake = Math.max(screenShake, 5);
  updateArenaStatus();

  joinInterval = setInterval(() => {
    joinSeconds--;

    if (joinTimerEl) joinTimerEl.innerText = joinSeconds;

    if (joinSeconds <= 0) {
      clearInterval(joinInterval);
      joinInterval = null;
      lockJoinAndStartFight();
    }
  }, 1000);
}

function lockJoinAndStartFight() {
  if (eventBanner) {
    const kicker = eventBanner.querySelector(".banner-kicker");
    const title = eventBanner.querySelector(".banner-title");
    const subtitle = eventBanner.querySelector(".banner-subtitle");

    if (kicker) kicker.innerText = "LOCKDOWN";
    if (title) title.innerText = "DIE ARENA SCHLIESST";
    if (subtitle) subtitle.innerText = "Die Kämpfer nehmen ihre Positionen ein...";
  }

  if (joinTimerEl) joinTimerEl.innerText = "⚔️";

  setTimeout(() => {
    if (eventBanner) eventBanner.classList.add("hidden");

    if (getAlivePlayers().length <= 1 && queuedPlayers.length === 0) {
      gameState = GAME.ended;
      showNoContest();
      setTimeout(resetGame, 4500);
      return;
    }

    showFightCallout();

    setTimeout(() => {
      beginBattle();
    }, 750);
  }, 1200);
}

function showFightCallout(text = "FIGHT!") {
  if (fightCallout) {
    fightCallout.innerText = text;
    fightCallout.classList.remove("active");
    void fightCallout.offsetWidth;
    fightCallout.classList.add("active");
  }

  screenShake = Math.max(screenShake, 14);
  spawnImpactRing(960, 820, "#ffd34a", 3.2);
}

function beginBattle() {
  if (eventBanner) eventBanner.classList.add("hidden");

  if (getAlivePlayers().length <= 1 && queuedPlayers.length === 0) {
    gameState = GAME.ended;
    showNoContest();
    setTimeout(resetGame, 4500);
    return;
  }

  gameState = GAME.fighting;

  players.forEach(player => {
    if (player.dead) return;

    player.state = "seeking";
    player.targetId = null;
    player.attackCooldown = random(0.2, 1.2);
    player.specialCooldown = random(4.5, 8.5);
  });

  updateArenaStatus();
}

function showNoContest() {
  finalizeRewards(null);

  spawnDamageText(960, 740, "ZU WENIGE KÄMPFER", false, false, "#ff304f", 54);
  spawnDamageText(960, 800, "RUNDE ABGEBROCHEN", false, false, "#ffffff", 36);
  screenShake = Math.max(screenShake, 9);
  updateArenaStatus();
}

/* ============================================================
   BATTLE ROYALE JOIN / QUEUE
============================================================ */

function getFreeJoinSpot(side) {
  const minDistance = 125;
  let bestX = side === "left" ? random(260, 850) : random(1070, 1660);

  for (let attempt = 0; attempt < 40; attempt++) {
    const candidateX = side === "left" ? random(260, 850) : random(1070, 1660);

    const tooClose = players.some(player => {
      return !player.dead && Math.abs(player.slotX - candidateX) < minDistance;
    });

    if (!tooClose) {
      bestX = candidateX;
      break;
    }
  }

  return bestX;
}

function createPlayerData(username, savedLevel = 1, savedXp = 0, skin = "default") {
  const level = Math.max(1, safeNumber(savedLevel, 1));
  const maxHp = getMaxHpByLevel(level);

  return {
    name: username,
    level,
    xp: safeNumber(savedXp, 0),
    hp: maxHp,
    maxHp,
    skin: skin || "default"
  };
}

function addPlayer(username, savedLevel = 1, savedXp = 0, skin = "default") {
  console.log("[StickFight] addPlayer aufgerufen:", {
    username,
    savedLevel,
    savedXp,
    skin,
    gameState
  });

  if (gameState !== GAME.joining) {
    console.log("[StickFight] Join abgelehnt, gameState ist nicht joining:", gameState);
    return false;
  }

  if (!username) {
    console.log("[StickFight] Join abgelehnt, username leer");
    return false;
  }

  if (userAlreadyRegistered(username)) {
    spawnDamageText(960, 780, `${username} IST SCHON DABEI`, false, false, "#ffffff", 28);
    return false;
  }

  const activeCount = getActiveCount();
  const playerData = createPlayerData(username, savedLevel, savedXp, skin);

  if (activeCount < MAX_ACTIVE_PLAYERS) {
    spawnActivePlayer(playerData, false);
    updateArenaStatus();
    return true;
  }

  if (queuedPlayers.length < MAX_QUEUE_PLAYERS) {
    queuedPlayers.push(playerData);

    spawnDamageText(
      960,
      780,
      `${username} WARTET IN DER QUEUE`,
      false,
      false,
      "#ffd34a",
      30
    );

    updateArenaStatus();
    return true;
  }

  spawnDamageText(960, 780, "ARENA UND QUEUE SIND VOLL", false, false, "#ff304f", 34);
  updateArenaStatus();
  return false;
}

function spawnActivePlayer(playerData, fromQueue = false) {
  const side = Math.random() < 0.5 ? "left" : "right";
  const fallbackColor = neonColors[randomInt(0, neonColors.length - 1)];
  const skinStyle = getSkinStyle(playerData.skin, fallbackColor);

  const slotX = getFreeJoinSpot(side);
  const spawnX = side === "left" ? -80 : 2000;
  const portalX = side === "left" ? 80 : 1840;

  const player = createBasePlayer({
    name: playerData.name,
    level: playerData.level,
    xp: playerData.xp,
    skin: skinStyle.id,
    skinStyle,
    hp: playerData.maxHp,
    maxHp: playerData.maxHp,
    x: spawnX,
    y: arena.groundY,
    baseY: arena.groundY,
    slotX,
    side,
    color: skinStyle.color,
    direction: side === "left" ? 1 : -1,
    state: gameState === GAME.fighting ? "seeking" : "joining",
    spawnProtection: fromQueue ? SPAWN_PROTECTION_SECONDS : 0.6
  });

  players.push(player);

  spawnPortal(portalX, arena.groundY - 65, skinStyle.color, side === "left" ? 1 : -1);

  const text = fromQueue
    ? `${player.name} RÜCKT NACH`
    : `${player.name} BETRITT DIE ARENA`;

  spawnDamageText(portalX, arena.groundY - 185, text, false, false, skinStyle.color, 28);

  updateArenaStatus();

  console.log("[StickFight] Player gespawnt:", player.name, player.skin, "Players:", players.length);

  return player;
}

function tryRefillFromQueue(force = false) {
  if (queuedPlayers.length === 0) return false;
  if (gameState !== GAME.fighting) return false;

  const activeCount = getActiveCount();
  const freeSlots = MAX_ACTIVE_PLAYERS - activeCount;

  if (freeSlots <= 0) return false;

  const shouldRefill = force || freeSlots >= REFILL_AMOUNT || activeCount <= 1;

  if (!shouldRefill) return false;

  const amount = Math.min(REFILL_AMOUNT, freeSlots, queuedPlayers.length);

  for (let i = 0; i < amount; i++) {
    const nextPlayer = queuedPlayers.shift();
    spawnActivePlayer(nextPlayer, true);
  }

  spawnDamageText(960, 760, `${amount} KÄMPFER RÜCKEN NACH`, false, false, "#ffd34a", 38);
  screenShake = Math.max(screenShake, 7);
  updateArenaStatus();

  return true;
}

/* ============================================================
   DUEL MODE FLOW
============================================================ */

function startDuelFromData(data) {
  resetGame();

  currentMode = MODE.duel;
  gameState = GAME.duelIntro;

  resultsSent = false;

  duelMeta = {
    active: true,
    challenger: data.challenger || "UserA",
    target: data.target || "UserB",
    bet: safeNumber(data.bet, 0),
    pot: safeNumber(data.pot, 0),
    startedAt: performance.now(),
    introSeconds: 3,
    resultsSent: false
  };

  if (wrapper) wrapper.classList.add("active");
  if (cityLayer) cityLayer.classList.add("active");
  if (winnerBanner) winnerBanner.classList.add("hidden");
  if (fightCallout) fightCallout.classList.remove("active");

  createDuelPlayers(data);

  showDuelIntroBanner();

  screenShake = Math.max(screenShake, 9);
  updateArenaStatus();

  setTimeout(() => {
    if (currentMode !== MODE.duel || gameState !== GAME.duelIntro) return;

    if (eventBanner) eventBanner.classList.add("hidden");

    showFightCallout("DUELL!");

    setTimeout(() => {
      beginDuelFight();
    }, 900);
  }, 3000);
}

function showDuelIntroBanner() {
  if (!eventBanner) return;

  eventBanner.classList.remove("hidden");

  const kicker = eventBanner.querySelector(".banner-kicker");
  const title = eventBanner.querySelector(".banner-title");
  const subtitle = eventBanner.querySelector(".banner-subtitle");

  if (kicker) kicker.innerText = "DUELL ANGENOMMEN";
  if (title) title.innerText = `${duelMeta.challenger} VS ${duelMeta.target}`;

  if (subtitle) {
    if (duelMeta.bet > 0) {
      subtitle.innerText = `Pot: ${formatShortNumber(duelMeta.pot)} Hufeisen · Auf Leben, Tod und Ruhm`;
    } else {
      subtitle.innerText = "Auf Leben, Tod und Ruhm";
    }
  }

  if (joinTimerEl) joinTimerEl.innerText = "⚔️";
}

function createDuelPlayers(data) {
  const challengerData = createPlayerData(
    data.challenger || "UserA",
    safeNumber(data.challengerLevel, 1),
    safeNumber(data.challengerXp, 0),
    data.challengerSkin || "default"
  );

  const targetData = createPlayerData(
    data.target || "UserB",
    safeNumber(data.targetLevel, 1),
    safeNumber(data.targetXp, 0),
    data.targetSkin || "default"
  );

  const leftSkin = getSkinStyle(challengerData.skin, "#ff304f");
  const rightSkin = getSkinStyle(targetData.skin, "#ffd34a");

  const leftPlayer = createBasePlayer({
    name: challengerData.name,
    level: challengerData.level,
    xp: challengerData.xp,
    skin: leftSkin.id,
    skinStyle: leftSkin,
    hp: challengerData.maxHp,
    maxHp: challengerData.maxHp,
    x: duelArena.leftSpawnX,
    y: duelArena.groundY,
    baseY: duelArena.groundY,
    slotX: duelArena.leftSlotX,
    side: "left",
    color: leftSkin.color,
    direction: 1,
    state: "duelIntro",
    spawnProtection: 1.2
  });

  const rightPlayer = createBasePlayer({
    name: targetData.name,
    level: targetData.level,
    xp: targetData.xp,
    skin: rightSkin.id,
    skinStyle: rightSkin,
    hp: targetData.maxHp,
    maxHp: targetData.maxHp,
    x: duelArena.rightSpawnX,
    y: duelArena.groundY,
    baseY: duelArena.groundY,
    slotX: duelArena.rightSlotX,
    side: "right",
    color: rightSkin.color,
    direction: -1,
    state: "duelIntro",
    spawnProtection: 1.2
  });

  players.push(leftPlayer, rightPlayer);

  spawnPortal(duelArena.leftSpawnX, duelArena.groundY - 65, leftSkin.color, 1);
  spawnPortal(duelArena.rightSpawnX, duelArena.groundY - 65, rightSkin.color, -1);

  spawnDamageText(960, 720, "DUELL WIRD VORBEREITET", false, false, "#ffd34a", 42);
}

function beginDuelFight() {
  if (currentMode !== MODE.duel) return;

  gameState = GAME.duelFighting;

  players.forEach(player => {
    if (player.dead) return;

    player.state = "seeking";
    player.targetId = null;
    player.attackCooldown = random(0.4, 0.9);
    player.specialCooldown = random(5.5, 8.5);
    player.spawnProtection = 0.8;
  });

  updateArenaStatus();
}

function createBasePlayer(config) {
  return {
    id: createId(),
    name: config.name,
    level: config.level,
    xp: config.xp,
    skin: config.skin,
    skinStyle: config.skinStyle,

    hp: config.hp,
    maxHp: config.maxHp,

    x: config.x,
    y: config.y,
    baseY: config.baseY,
    vx: 0,
    vy: 0,

    slotX: config.slotX,

    side: config.side,
    color: config.color,
    direction: config.direction,

    state: config.state,
    targetId: null,

    attackCooldown: random(0.7, 1.4),
    specialCooldown: random(4.5, 8.5),

    walkFrame: random(0, 10),
    attackAnim: 0,
    specialAnim: 0,
    hurtAnim: 0,
    koAnim: 0,
    spawnGlow: 1.2,
    spawnProtection: config.spawnProtection || 0,

    dead: false,
    kills: 0,
    hits: 0,
    xpEarned: 0,
    horsesEarned: 0,
    hasEnteredArena: true
  };
}
/* ============================================================
   TARGETING / UPDATE
============================================================ */

function findNearestTarget(player) {
  let nearest = null;
  let nearestDistance = Infinity;

  for (const other of players) {
    if (other.id === player.id || other.dead || other.hp <= 0) continue;

    const distance = Math.abs(other.x - player.x);

    if (distance < nearestDistance) {
      nearest = other;
      nearestDistance = distance;
    }
  }

  return nearest;
}

function updatePlayer(player, dt) {
  player.walkFrame += dt * 8;

  if (player.spawnProtection > 0) {
    player.spawnProtection -= dt;
    if (player.spawnProtection < 0) player.spawnProtection = 0;
  }

  if (player.spawnGlow > 0) {
    player.spawnGlow -= dt;
    if (player.spawnGlow < 0) player.spawnGlow = 0;
  }

  if (player.hurtAnim > 0) {
    player.hurtAnim -= dt * 4;
    if (player.hurtAnim < 0) player.hurtAnim = 0;
  }

  if (player.attackAnim > 0) {
    player.attackAnim -= dt * 4.8;
    if (player.attackAnim < 0) player.attackAnim = 0;
  }

  if (player.specialAnim > 0) {
    player.specialAnim -= dt * 2.6;
    if (player.specialAnim < 0) player.specialAnim = 0;
  }

  if (player.dead) {
    player.koAnim += dt;
    player.vy += 900 * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    if (player.y > player.baseY + 8) {
      player.y = player.baseY + 8;
      player.vy = 0;
      player.vx *= 0.85;
    }

    return;
  }

  player.vy += 1100 * dt;
  player.y += player.vy * dt;

  if (player.y > player.baseY) {
    player.y = player.baseY;
    player.vy = 0;
  }

  if (gameState === GAME.joining) {
    updatePlayerJoining(player, dt);
    return;
  }

  if (gameState === GAME.duelIntro) {
    updatePlayerDuelIntro(player, dt);
    return;
  }

  if (gameState !== GAME.fighting && gameState !== GAME.duelFighting) return;

  updatePlayerCombat(player, dt);
}

function updatePlayerJoining(player, dt) {
  const distanceToSlot = player.slotX - player.x;

  if (Math.abs(distanceToSlot) > 4) {
    player.direction = distanceToSlot > 0 ? 1 : -1;
    player.x += player.direction * 210 * dt;
    player.state = "moving";
  } else {
    player.x = player.slotX;
    player.state = "waiting";
  }
}

function updatePlayerDuelIntro(player, dt) {
  const distanceToSlot = player.slotX - player.x;

  if (Math.abs(distanceToSlot) > 4) {
    player.direction = distanceToSlot > 0 ? 1 : -1;
    player.x += player.direction * 260 * dt;
    player.state = "moving";
  } else {
    player.x = player.slotX;
    player.state = "waiting";
    player.direction = player.side === "left" ? 1 : -1;
  }
}

function updatePlayerCombat(player, dt) {
  player.specialCooldown -= dt;

  let target = players.find(p => p.id === player.targetId && !p.dead && p.hp > 0);

  if (!target) {
    target = findNearestTarget(player);
    player.targetId = target ? target.id : null;
  }

  if (!target) return;

  const distance = Math.abs(target.x - player.x);
  player.direction = target.x > player.x ? 1 : -1;

  const minX = isDuelModeActive() ? duelArena.minX : arena.minX;
  const maxX = isDuelModeActive() ? duelArena.maxX : arena.maxX;

  if (distance > 85) {
    player.x += player.direction * 135 * dt;
    player.x = clamp(player.x, minX, maxX);
    player.state = "moving";
  } else {
    player.state = "attacking";
    player.attackCooldown -= dt;

    if (player.specialCooldown <= 0 && Math.random() < 0.42) {
      specialAttack(player, target);
      player.specialCooldown = random(5.5, 9.5);
      player.attackCooldown = random(0.8, 1.2);
      return;
    }

    if (player.attackCooldown <= 0) {
      normalAttack(player, target);
      player.attackCooldown = random(0.65, 1.25);
    }
  }
}

function separatePlayers(dt) {
  if (
    gameState !== GAME.fighting &&
    gameState !== GAME.joining &&
    gameState !== GAME.duelIntro &&
    gameState !== GAME.duelFighting
  ) {
    return;
  }

  const minDistance = gameState === GAME.joining || gameState === GAME.duelIntro ? 95 : 62;
  const minX = isDuelModeActive() ? duelArena.minX : arena.minX;
  const maxX = isDuelModeActive() ? duelArena.maxX : arena.maxX;

  for (let i = 0; i < players.length; i++) {
    const a = players[i];
    if (a.dead) continue;

    for (let j = i + 1; j < players.length; j++) {
      const b = players[j];
      if (b.dead) continue;

      const dx = b.x - a.x;
      const distance = Math.abs(dx);

      if (distance > 0 && distance < minDistance) {
        const push = (minDistance - distance) * 0.5;
        const direction = dx > 0 ? 1 : -1;

        a.x -= direction * push * dt * 8;
        b.x += direction * push * dt * 8;

        a.x = clamp(a.x, minX, maxX);
        b.x = clamp(b.x, minX, maxX);
      }
    }
  }
}

/* ============================================================
   COMBAT
============================================================ */

function normalAttack(attacker, target) {
  if (target.dead) return;

  attacker.attackAnim = 1;

  const critChance = attacker.level >= target.level ? 0.12 : 0.07;
  const crit = Math.random() < critChance;

  const damage = crit
    ? getCritDamage(attacker.level, target.level)
    : getAttackDamage(attacker.level, target.level);

  applyDamage(attacker, target, damage, crit, false);

  spawnSlash(
    attacker.x + attacker.direction * 42,
    attacker.y - 58,
    attacker.direction,
    crit ? "#ffd34a" : attacker.skinStyle.blade,
    crit ? 1.4 : 1
  );

  spawnSkinTrail(attacker, target.x, target.y - 55, crit ? 8 : 4);

  if (crit) {
    spawnImpactRing(target.x, target.y - 65, "#ffd34a", 1.4);
    screenShake = Math.max(screenShake, 9);
  }
}

function specialAttack(attacker, target) {
  if (target.dead) return;

  attacker.specialAnim = 1;
  attacker.vy = -520;

  const damage = getSpecialDamage(attacker.level, target.level);

  setTimeout(() => {
    if (gameState !== GAME.fighting && gameState !== GAME.duelFighting) return;
    if (attacker.dead || target.dead) return;

    attacker.x = target.x - attacker.direction * 65;
    attacker.y = attacker.baseY;

    applyDamage(attacker, target, damage, true, true);

    spawnImpactRing(target.x, target.y - 50, attacker.skinStyle.color, 2.1);
    spawnSlash(target.x, target.y - 70, attacker.direction, attacker.skinStyle.blade, 1.8);
    spawnBlood(target.x, target.y - 65, attacker.direction, 18);
    spawnHitParticles(target.x, target.y - 60, attacker.skinStyle.color, 22);
    spawnSkinTrail(attacker, target.x, target.y - 65, 18);

    screenShake = Math.max(screenShake, 16);
  }, 330);
}

function applyDamage(attacker, target, damage, crit, special) {
  if (target.spawnProtection > 0) {
    spawnDamageText(target.x, target.y - 130, "SHIELD", false, false, "#00e5ff", 28);
    spawnImpactRing(target.x, target.y - 70, "#00e5ff", 1.2);
    return;
  }

  const xpReward = isDuelModeActive() ? DUEL_HIT_XP_REWARD : HIT_XP_REWARD;

  attacker.hits++;
  attacker.xpEarned += xpReward;
  attacker.xp += xpReward;

  spawnDamageText(
    attacker.x,
    attacker.y - 230,
    `+${xpReward} XP`,
    false,
    false,
    "#00e5ff",
    22
  );

  damage = applyOneShotProtection(attacker, target, damage);

  target.hp -= damage;
  target.hp = Math.max(0, target.hp);
  target.hurtAnim = 1;

  target.vx = attacker.direction * 130;
  target.x += attacker.direction * 12;

  spawnDamageText(target.x, target.y - 125, damage, crit, special);
  spawnHitParticles(target.x, target.y - 55, attacker.skinStyle.color, crit ? 16 : 9);

  if (crit || special) {
    spawnBlood(target.x, target.y - 62, attacker.direction, special ? 22 : 10);
  } else if (Math.random() < 0.35) {
    spawnBlood(target.x, target.y - 62, attacker.direction, 5);
  }

  if (target.hp <= 0) {
    knockOut(attacker, target);
  }
}

function knockOut(attacker, target) {
  target.dead = true;
  target.state = "dead";
  target.vx = attacker.direction * 240;
  target.vy = -280;
  target.koAnim = 0;

  attacker.kills++;

  if (isDuelModeActive()) {
    spawnDamageText(target.x, target.y - 170, "K.O.", false, false, "#ff304f", 48);
    spawnDamageText(target.x, target.y - 215, `${target.name} FÄLLT`, false, false, "#ffffff", 28);
    spawnImpactRing(target.x, target.y - 55, "#ff304f", 1.7);
    spawnBlood(target.x, target.y - 70, attacker.direction, 24);

    screenShake = Math.max(screenShake, 13);
    updateArenaStatus();

    setTimeout(() => {
      checkDuelEnd();
    }, 500);

    return;
  }

  attacker.xpEarned += KILL_XP_REWARD;
  attacker.horsesEarned += KILL_HORSE_REWARD;
  attacker.xp += KILL_XP_REWARD;

  spawnDamageText(target.x, target.y - 170, "K.O.", false, false, "#ff304f", 48);
  spawnDamageText(target.x, target.y - 215, `${target.name} ELIMINIERT`, false, false, "#ffffff", 28);
  spawnDamageText(attacker.x, attacker.y - 205, `+${KILL_HORSE_REWARD} H`, false, false, "#ffd34a", 30);
  spawnImpactRing(target.x, target.y - 55, "#ff304f", 1.7);
  spawnBlood(target.x, target.y - 70, attacker.direction, 24);

  screenShake = Math.max(screenShake, 13);
  updateArenaStatus();

  setTimeout(() => {
    checkBattleEnd();
  }, 300);
}

function checkBattleEnd() {
  if (gameState !== GAME.fighting) return;

  const refilled = tryRefillFromQueue(false);

  if (refilled) {
    return;
  }

  const alive = getAlivePlayers();

  if (alive.length === 1 && queuedPlayers.length === 0) {
    gameState = GAME.ended;

    const winner = alive[0];
    winner.xpEarned += WIN_XP_REWARD;
    winner.horsesEarned += WIN_HORSE_REWARD;
    winner.xp += WIN_XP_REWARD;

    setTimeout(() => {
      showWinner(winner);
    }, 1300);

    return;
  }

  if (alive.length === 0 && queuedPlayers.length > 0) {
    tryRefillFromQueue(true);
    return;
  }

  if (alive.length === 0 && queuedPlayers.length === 0) {
    gameState = GAME.ended;
    finalizeRewards(null);
    showNoContest();
    setTimeout(resetGame, 4500);
  }
}

function checkDuelEnd() {
  if (currentMode !== MODE.duel || gameState !== GAME.duelFighting) return;

  const alive = getAlivePlayers();

  if (alive.length === 1) {
    const winner = alive[0];
    const loser = players.find(player => player.id !== winner.id);

    winner.xpEarned += DUEL_WIN_XP_REWARD;
    winner.xp += DUEL_WIN_XP_REWARD;

    gameState = GAME.ended;

    setTimeout(() => {
      showDuelWinner(winner, loser);
    }, 900);

    return;
  }

  if (alive.length === 0) {
    gameState = GAME.ended;
    showDuelDraw();
  }
}

function showWinner(player) {
  finalizeRewards(player);

  if (winnerNameEl) {
    winnerNameEl.innerText = player.name.toUpperCase();
  }

  if (winnerBanner) {
    const rewardText = winnerBanner.querySelector(".winner-reward");

    if (rewardText) {
      rewardText.innerText = `${player.horsesEarned} Hufeisen · ${player.xpEarned} XP · ${player.kills} K.O.s`;
    }

    winnerBanner.classList.remove("hidden");
  }

  spawnImpactRing(player.x, player.y - 90, "#ffd34a", 2.8);
  spawnDamageText(player.x, player.y - 185, "WINNER!", false, false, "#ffd34a", 58);
  spawnDamageText(player.x, player.y - 245, `+${WIN_HORSE_REWARD} H SIEG-BONUS`, false, false, "#ffd34a", 34);

  for (let i = 0; i < 80; i++) {
    spawnGoldParticle(random(520, 1400), random(360, 760));
  }

  screenShake = Math.max(screenShake, 15);
  updateArenaStatus();

  window.dispatchEvent(new CustomEvent("stickfightWinner", {
    detail: {
      name: player.name,
      level: player.level,
      xp: player.xp,
      kills: player.kills,
      xpEarned: player.xpEarned,
      horsesEarned: player.horsesEarned,
      skin: player.skin
    }
  }));

  setTimeout(() => {
    resetGame();
  }, 9000);
}

function showDuelWinner(winner, loser) {
  finalizeDuelRewards(winner, loser);

  if (winnerNameEl) {
    winnerNameEl.innerText = winner.name.toUpperCase();
  }

  if (winnerBanner) {
    const smallText = winnerBanner.querySelector(".winner-small");
    const rewardText = winnerBanner.querySelector(".winner-reward");

    if (smallText) {
      smallText.innerText = "DUELL SIEGER";
    }

    if (rewardText) {
      if (duelMeta.pot > 0) {
        rewardText.innerText = `${duelMeta.pot} Hufeisen · ${winner.xpEarned} XP · ${winner.hits} Treffer`;
      } else {
        rewardText.innerText = `${winner.xpEarned} XP · ${winner.hits} Treffer`;
      }
    }

    winnerBanner.classList.remove("hidden");
  }

  spawnImpactRing(winner.x, winner.y - 90, "#ffd34a", 2.8);
  spawnDamageText(winner.x, winner.y - 185, "DUELL SIEGER!", false, false, "#ffd34a", 54);

  if (duelMeta.pot > 0) {
    spawnDamageText(winner.x, winner.y - 245, `+${duelMeta.pot} H`, false, false, "#ffd34a", 34);
  }

  for (let i = 0; i < 60; i++) {
    spawnGoldParticle(random(650, 1270), random(420, 760));
  }

  screenShake = Math.max(screenShake, 15);
  updateArenaStatus();

  setTimeout(() => {
    resetGame();
  }, 7500);
}

function showDuelDraw() {
  finalizeDuelRewards(null, null);

  spawnDamageText(960, 740, "DUELL ENDET UNENTSCHIEDEN", false, false, "#ff304f", 46);
  screenShake = Math.max(screenShake, 10);

  setTimeout(() => {
    resetGame();
  }, 6500);
}
/* ============================================================
   REWARDS SAVE
============================================================ */

function finalizeRewards(winner) {
  if (resultsSent) return;
  resultsSent = true;

  const winnerId = winner ? winner.id : null;

  for (const player of players) {
    if (!player.hasEnteredArena) continue;

    const isWinner = winnerId !== null && player.id === winnerId;
    const xpGained = Number(player.xpEarned) || 0;
    const horsesGained = Number(player.horsesEarned) || 0;
    const kills = Number(player.kills) || 0;

    if (xpGained <= 0 && horsesGained <= 0 && kills <= 0 && !isWinner) {
      continue;
    }

    sendResultToStreamerBot({
      username: player.name,
      xpGained,
      horsesGained,
      kills,
      win: isWinner
    });
  }
}

function finalizeDuelRewards(winner, loser) {
  if (duelMeta.resultsSent) return;
  duelMeta.resultsSent = true;

  if (!winner || !loser) {
    sendDuelResultToStreamerBot({
      winner: "DRAW",
      loser: "DRAW",
      winnerXp: 0,
      loserXp: 0,
      winnerHits: 0,
      loserHits: 0,
      bet: duelMeta.bet,
      pot: 0
    });
    return;
  }

  sendDuelResultToStreamerBot({
    winner: winner.name,
    loser: loser.name,
    winnerXp: Number(winner.xpEarned) || 0,
    loserXp: Number(loser.xpEarned) || 0,
    winnerHits: Number(winner.hits) || 0,
    loserHits: Number(loser.hits) || 0,
    bet: duelMeta.bet,
    pot: duelMeta.pot
  });
}

function sendResultToStreamerBot(result) {
  if (!streamerbotSocket || streamerbotSocket.readyState !== WebSocket.OPEN) {
    console.log("[StickFight] Ergebnis konnte nicht gespeichert werden, WebSocket nicht verbunden:", result);
    return;
  }

  const request = {
    request: "DoAction",
    id: `stickfight-save-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
    action: {
      name: STREAMERBOT_SAVE_ACTION_NAME
    },
    args: {
      username: result.username,
      xpGained: result.xpGained,
      horsesGained: result.horsesGained,
      kills: result.kills,
      win: result.win
    }
  };

  console.log("[StickFight] Sende Ergebnis an Streamer.bot:", request);
  streamerbotSocket.send(JSON.stringify(request));
}

function sendDuelResultToStreamerBot(result) {
  if (!streamerbotSocket || streamerbotSocket.readyState !== WebSocket.OPEN) {
    console.log("[StickFight] Duell-Ergebnis konnte nicht gespeichert werden, WebSocket nicht verbunden:", result);
    return;
  }

  const request = {
    request: "DoAction",
    id: `stickfight-duel-save-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
    action: {
      name: STREAMERBOT_DUEL_SAVE_ACTION_NAME
    },
    args: {
      winner: result.winner,
      loser: result.loser,
      winnerXp: result.winnerXp,
      loserXp: result.loserXp,
      winnerHits: result.winnerHits,
      loserHits: result.loserHits,
      bet: result.bet,
      pot: result.pot
    }
  };

  console.log("[StickFight] Sende Duell-Ergebnis an Streamer.bot:", request);
  streamerbotSocket.send(JSON.stringify(request));
}

/* ============================================================
   EFFECT SPAWNS
============================================================ */

function spawnDamageText(x, y, value, crit = false, special = false, color = null, size = null) {
  let label = typeof value === "number" ? `-${value}` : value;

  if (special && typeof value === "number") {
    label = `SPECIAL! -${value}`;
  } else if (crit && typeof value === "number") {
    label = `CRIT! -${value}`;
  }

  damageTexts.push({
    x,
    y,
    value: label,
    life: 1,
    maxLife: 1,
    vy: -75,
    color: color || (special ? "#ff304f" : crit ? "#ffd34a" : "#ffffff"),
    size: size || (special ? 54 : crit ? 50 : 32),
    crit,
    special
  });
}

function spawnHitParticles(x, y, color, amount = 10) {
  for (let i = 0; i < amount; i++) {
    particles.push({
      x,
      y,
      vx: random(-170, 170),
      vy: random(-190, -20),
      life: random(0.35, 0.8),
      color,
      size: random(3, 8)
    });
  }
}

function spawnSkinTrail(player, x, y, amount = 8) {
  const style = player.skinStyle;
  const trail = style.trail;
  const color = style.accent || style.color;

  if (trail === "normal") return;

  for (let i = 0; i < amount; i++) {
    let particleColor = color;

    if (trail === "blood") particleColor = Math.random() < 0.5 ? "#ff304f" : "#8b0015";
    if (trail === "fire") particleColor = Math.random() < 0.5 ? "#ff7a1a" : "#ffd34a";
    if (trail === "ice") particleColor = Math.random() < 0.5 ? "#8cecff" : "#ffffff";
    if (trail === "rainbow") particleColor = neonColors[randomInt(0, neonColors.length - 1)];
    if (trail === "void") particleColor = Math.random() < 0.5 ? "#7a2cff" : "#000000";
    if (trail === "gold") particleColor = Math.random() < 0.5 ? "#ffd34a" : "#fff4b0";
    if (trail === "glitch") particleColor = Math.random() < 0.5 ? "#ff304f" : "#00e5ff";
    if (trail === "boss") particleColor = Math.random() < 0.5 ? "#ff003c" : "#ffffff";

    particles.push({
      x: x + random(-30, 30),
      y: y + random(-30, 30),
      vx: random(-150, 150),
      vy: random(-160, 40),
      life: random(0.28, 0.75),
      color: particleColor,
      size: random(3, 8),
      shape: trail,
      rotation: random(0, Math.PI * 2)
    });
  }
}

function spawnBlood(x, y, direction, amount = 10) {
  for (let i = 0; i < amount; i++) {
    bloodDrops.push({
      x,
      y,
      vx: direction * random(70, 230) + random(-70, 70),
      vy: random(-190, 80),
      life: random(0.45, 1.1),
      maxLife: 1.1,
      size: random(3, 9),
      color: Math.random() < 0.25 ? "#ff304f" : "#b30019"
    });
  }
}

function spawnSlash(x, y, direction, color, power = 1) {
  slashEffects.push({
    x,
    y,
    direction,
    color,
    power,
    life: 0.28,
    maxLife: 0.28,
    rotation: random(-0.25, 0.25)
  });
}

function spawnImpactRing(x, y, color, power = 1) {
  impactRings.push({
    x,
    y,
    color,
    power,
    radius: 10,
    life: 0.42,
    maxLife: 0.42
  });
}

function spawnPortal(x, y, color, direction) {
  spawnPortals.push({
    x,
    y,
    color,
    direction,
    life: 0.85,
    maxLife: 0.85,
    radius: 12
  });

  for (let i = 0; i < 22; i++) {
    particles.push({
      x,
      y,
      vx: direction * random(40, 170) + random(-50, 50),
      vy: random(-160, 80),
      life: random(0.35, 0.9),
      color,
      size: random(3, 8)
    });
  }
}

function spawnGoldParticle(x, y) {
  goldParticles.push({
    x,
    y,
    vx: random(-80, 80),
    vy: random(-260, -80),
    life: random(1.1, 2.3),
    maxLife: 2.3,
    size: random(4, 10),
    rotation: random(0, Math.PI * 2),
    spin: random(-5, 5)
  });
}

/* ============================================================
   EFFECT UPDATES
============================================================ */

function updateDamageTexts(dt) {
  for (const text of damageTexts) {
    text.life -= dt;
    text.y += text.vy * dt;
    text.vy += 45 * dt;
  }

  damageTexts = damageTexts.filter(t => t.life > 0);
}

function updateParticles(dt) {
  for (const particle of particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 230 * dt;
    particle.rotation = (particle.rotation || 0) + dt * 4.2;
  }

  particles = particles.filter(p => p.life > 0);
}

function updateBlood(dt) {
  for (const drop of bloodDrops) {
    drop.life -= dt;
    drop.x += drop.vx * dt;
    drop.y += drop.vy * dt;
    drop.vy += 430 * dt;

    if (drop.y > arena.groundY + 6) {
      drop.y = arena.groundY + 6;
      drop.vx *= 0.65;
      drop.vy *= -0.18;
    }
  }

  bloodDrops = bloodDrops.filter(b => b.life > 0);
}

function updateSlashes(dt) {
  for (const slash of slashEffects) {
    slash.life -= dt;
  }

  slashEffects = slashEffects.filter(s => s.life > 0);
}

function updateImpactRings(dt) {
  for (const ring of impactRings) {
    ring.life -= dt;
    ring.radius += dt * 280 * ring.power;
  }

  impactRings = impactRings.filter(r => r.life > 0);
}

function updateSpawnPortals(dt) {
  for (const portal of spawnPortals) {
    portal.life -= dt;
    portal.radius += dt * 180;
  }

  spawnPortals = spawnPortals.filter(p => p.life > 0);
}

function updateGoldParticles(dt) {
  for (const gold of goldParticles) {
    gold.life -= dt;
    gold.x += gold.vx * dt;
    gold.y += gold.vy * dt;
    gold.vy += 260 * dt;
    gold.rotation += gold.spin * dt;

    if (gold.y > arena.groundY) {
      gold.y = arena.groundY;
      gold.vy *= -0.25;
      gold.vx *= 0.8;
    }
  }

  goldParticles = goldParticles.filter(g => g.life > 0);
}

/* ============================================================
   DRAWING PLAYER
============================================================ */

function drawPlayer(player) {
  const x = player.x;
  const y = player.y;
  const style = player.skinStyle || getSkinStyle(player.skin, player.color);
  const color = style.color;
  const alive = !player.dead && player.hp > 0;
  const previousIdentityDetail = premiumIdentityDetail;
  premiumIdentityDetail = getHighTierVisual(player.skin) ? getPremiumIdentityDetail() : 1;

  ctx.save();

  if (player.spawnGlow > 0 && alive) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 34 * player.spawnGlow;
  }

  if (player.spawnProtection > 0 && alive) {
    ctx.globalAlpha = 0.78 + Math.sin(performance.now() / 70) * 0.18;
    spawnProtectionVisual(player);
  }

  if (player.hurtAnim > 0 && alive) {
    ctx.translate(random(-4, 4) * player.hurtAnim, random(-3, 3) * player.hurtAnim);
  }

  if (!alive) {
    ctx.globalAlpha = 0.62;
    ctx.translate(x, y);
    ctx.rotate(player.direction * Math.PI / 2.15);
    ctx.translate(-x, -y);
  }

  const bob = Math.sin(player.walkFrame) * 4;
  const attackLean = player.attackAnim * 10 * player.direction;
  const specialStretch = player.specialAnim > 0 ? Math.sin(player.specialAnim * Math.PI) * 10 : 0;

  const headX = x + attackLean * 0.25;
  const headY = y - 95 + bob - specialStretch;
  const bodyTopY = y - 72 + bob - specialStretch;
  const bodyBottomY = y - 34 + bob;

  drawSkinBackLayer(player, headX, headY, bodyTopY, bodyBottomY);

  drawOutlinedCircle(headX, headY, 19, color, 7);

  drawOutlinedLine(x, bodyTopY, x + attackLean * 0.35, bodyBottomY, color, 7);

  const armSwing = Math.sin(player.walkFrame) * 10;
  const legSwing = Math.sin(player.walkFrame) * 12;

  let frontArmX = x + player.direction * (30 + player.attackAnim * 18);
  let frontArmY = y - 50 + bob - player.attackAnim * 18;

  let backArmX = x - player.direction * 24;
  let backArmY = y - 50 - armSwing;

  if (player.specialAnim > 0) {
    frontArmY -= 18;
    backArmY -= 18;
  }

  drawOutlinedLine(x, y - 62 + bob, frontArmX, frontArmY, color, 7);
  drawOutlinedLine(x, y - 62 + bob, backArmX, backArmY, color, 7);

  drawOutlinedLine(x + attackLean * 0.35, bodyBottomY, x - 25, y + legSwing, color, 7);
  drawOutlinedLine(x + attackLean * 0.35, bodyBottomY, x + 25, y - legSwing, color, 7);

  drawSkinFrontLayer(player, headX, headY, bodyTopY, bodyBottomY);

  if (alive) {
    drawSword(player, frontArmX, frontArmY);
  }

  ctx.restore();

  premiumIdentityDetail = previousIdentityDetail;

  if (!player.hideNameplate) drawNameplate(player);
}

function drawOutlinedLine(x1, y1, x2, y2, color, width) {
  ctx.save();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.strokeStyle = "rgba(0,0,0,0.95)";
  ctx.lineWidth = width + 5;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(16);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.restore();
}

function drawOutlinedCircle(x, y, radius, color, width) {
  ctx.save();

  ctx.strokeStyle = "rgba(0,0,0,0.95)";
  ctx.lineWidth = width + 5;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(16);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawSkinBackLayer(player, headX, headY, bodyTopY, bodyBottomY) {
  const style = player.skinStyle;
  const skinId = style && style.id ? style.id : player.skin;
  const x = player.x;
  const y = player.y;
  const dir = player.direction;
  const accent = style.accent;
  const highTierVisual = getHighTierVisual(skinId);

  ctx.save();
  if (highTierVisual) {
    drawHighTierBackLayer(player, skinId, x, y, dir, headX, headY, bodyTopY, bodyBottomY, style);
  } else {
    drawIndividualSkinBack(player, skinId, x, y, dir, headX, headY, bodyTopY, bodyBottomY, accent);
  }
  ctx.restore();
}

function drawSkinFrontLayer(player, headX, headY, bodyTopY, bodyBottomY) {
  const style = player.skinStyle;
  const skinId = style && style.id ? style.id : player.skin;
  const x = player.x;
  const y = player.y;
  const dir = player.direction;
  const accent = style.accent;
  const highTierVisual = getHighTierVisual(skinId);

  ctx.save();
  if (highTierVisual) {
    drawHighTierArmorLayer(player, skinId, x, y, dir, headX, headY, bodyTopY, bodyBottomY, style);
  } else {
    drawIndividualSkinFront(player, skinId, x, y, dir, headX, headY, bodyTopY, bodyBottomY, accent);
  }
  ctx.restore();
}
/* ============================================================
   SKIN DRAW HELPERS
============================================================ */

/* ============================================================
   INDIVIDUAL SKIN RENDERER V1
   Jeder Skin mit Extra wird hier einzeln gezeichnet.
   Ziel: Shop-Feeling statt generischer Accessory-Klumpen.
============================================================ */

function drawIndividualSkinBack(player, skinId, x, y, dir, headX, headY, bodyTopY, bodyBottomY, accent) {
  switch (skinId) {
    case "street_fighter":
      drawSkinStreetFighterBack(x, y, dir, accent);
      break;
    case "hoodie_shadow":
      drawSkinHoodieShadowBack(x, y, dir, accent);
      break;
    case "comic_hero":
      drawSkinComicHeroBack(x, y, dir, accent);
      break;
    case "tiny_goblin":
      drawSkinTinyGoblinBack(x, y, dir, accent);
      break;
    case "cute_bunny":
      drawSkinCuteBunnyBack(x, y, dir, accent);
      break;
    case "banana_warrior":
      drawSkinBananaWarriorBack(x, y, dir, accent);
      break;
    case "blood_blade":
      drawSkinBloodBladeBack(x, y, dir, accent);
      break;
    case "toxic_fighter":
      drawSkinToxicFighterBack(x, y, dir, accent);
      break;
    case "ice_stickman":
      drawSkinIceStickmanBack(x, y, dir, accent);
      break;
    case "fire_runner":
      drawSkinFireRunnerBack(x, y, dir, accent);
      break;
    case "storm_slasher":
      drawSkinStormSlasherBack(x, y, dir, accent);
      break;
    case "shadow_cat":
      drawSkinShadowCatBack(x, y, dir, accent);
      break;
    case "clown_blade":
      drawSkinClownBladeBack(x, y, dir, accent);
      break;
    case "pumpkin_reaper":
      drawSkinPumpkinReaperBack(x, y, dir, accent);
      break;
    case "plague_doctor":
      drawSkinPlagueDoctorBack(x, y, dir, accent);
      break;
    case "arcade_knight":
      drawSkinArcadeKnightBack(x, y, dir, accent);
      break;
    case "anime_swordsman":
      drawSkinAnimeSwordsmanBack(x, y, dir, accent);
      break;
    case "demon_student":
      drawSkinDemonStudentBack(x, y, dir, accent);
      break;
    case "masked_ninja":
      drawSkinMaskedNinjaBack(x, y, dir, accent);
      break;
    case "spirit_samurai":
      drawSkinSpiritSamuraiBack(x, y, dir, accent);
      break;
    case "thunder_senpai":
      drawSkinThunderSenpaiBack(x, y, dir, accent);
      break;
    case "rose_assassin":
      drawSkinRoseAssassinBack(x, y, dir, accent);
      break;
    case "cyber_ninja":
      drawSkinCyberNinjaBack(x, y, dir, accent);
      break;
    case "glitch_demon":
      drawSkinGlitchDemonBack(x, y, dir, accent);
      break;
    case "mecha_stick":
      drawSkinMechaStickBack(x, y, dir, accent);
      break;
    case "holo_blade":
      drawSkinHoloBladeBack(x, y, dir, accent);
      break;
    case "void_walker":
      drawSkinVoidWalkerBack(x, y, dir, accent);
      break;
    case "bone_knight":
      drawSkinBoneKnightBack(x, y, dir, accent);
      break;
    case "vampire_duelist":
      drawSkinVampireDuelistBack(x, y, dir, accent);
      break;
    case "werewolf_rage":
      drawSkinWerewolfRageBack(x, y, dir, accent);
      break;
    case "angelic_guardian":
      drawSkinAngelicGuardianBack(x, y, dir, accent);
      break;
    case "fallen_angel":
      drawSkinFallenAngelBack(x, y, dir, accent);
      break;
    case "gold_champion":
      drawSkinGoldChampionBack(x, y, dir, accent);
      break;
    case "blood_emperor":
      drawSkinBloodEmperorBack(x, y, dir, accent);
      break;
    case "dragon_soul":
      drawSkinDragonSoulBack(x, y, dir, accent);
      break;
    case "shadow_horseman":
      drawSkinShadowHorsemanBack(x, y, dir, accent);
      break;
    case "cosmic_reaper":
      drawSkinCosmicReaperBack(x, y, dir, accent);
      break;
    case "neon_overlord":
      drawSkinNeonOverlordBack(x, y, dir, accent);
      break;
    case "rainbow_madness":
      drawSkinRainbowMadnessBack(x, y, dir, accent);
      break;
    case "kawaii_destroyer":
      drawSkinKawaiiDestroyerBack(x, y, dir, accent);
      break;
    case "herd_guardian":
      drawSkinHerdGuardianBack(x, y, dir, accent);
      break;
    case "red_glitch_king":
      drawSkinRedGlitchKingBack(x, y, dir, accent);
      break;
    case "nightmare_clown":
      drawSkinNightmareClownBack(x, y, dir, accent);
      break;
    case "celestial_samurai":
      drawSkinCelestialSamuraiBack(x, y, dir, accent);
      break;
    case "golden_mustang":
      drawSkinGoldenMustangBack(x, y, dir, accent);
      break;
    case "the_final_boss":
      drawSkinTheFinalBossBack(x, y, dir, accent);
      break;
  }
}

function drawIndividualSkinFront(player, skinId, x, y, dir, headX, headY, bodyTopY, bodyBottomY, accent) {
  switch (skinId) {
    case "street_fighter":
      drawSkinStreetFighterFront(headX, headY, x, y, dir, accent);
      break;
    case "hoodie_shadow":
      drawSkinHoodieShadowFront(headX, headY, x, y, dir, accent);
      break;
    case "comic_hero":
      drawSkinComicHeroFront(headX, headY, x, y, dir, accent);
      break;
    case "tiny_goblin":
      drawSkinTinyGoblinFront(headX, headY, x, y, dir, accent);
      break;
    case "cute_bunny":
      drawSkinCuteBunnyFront(headX, headY, x, y, dir, accent);
      break;
    case "banana_warrior":
      drawSkinBananaWarriorFront(headX, headY, x, y, dir, accent);
      break;
    case "blood_blade":
      drawSkinBloodBladeFront(headX, headY, x, y, dir, accent);
      break;
    case "toxic_fighter":
      drawSkinToxicFighterFront(headX, headY, x, y, dir, accent);
      break;
    case "ice_stickman":
      drawSkinIceStickmanFront(headX, headY, x, y, dir, accent);
      break;
    case "fire_runner":
      drawSkinFireRunnerFront(headX, headY, x, y, dir, accent);
      break;
    case "storm_slasher":
      drawSkinStormSlasherFront(headX, headY, x, y, dir, accent);
      break;
    case "shadow_cat":
      drawSkinShadowCatFront(headX, headY, x, y, dir, accent);
      break;
    case "clown_blade":
      drawSkinClownBladeFront(headX, headY, x, y, dir, accent);
      break;
    case "pumpkin_reaper":
      drawSkinPumpkinReaperFront(headX, headY, x, y, dir, accent);
      break;
    case "plague_doctor":
      drawSkinPlagueDoctorFront(headX, headY, x, y, dir, accent);
      break;
    case "arcade_knight":
      drawSkinArcadeKnightFront(headX, headY, x, y, dir, accent);
      break;
    case "anime_swordsman":
      drawSkinAnimeSwordsmanFront(headX, headY, x, y, dir, accent);
      break;
    case "demon_student":
      drawSkinDemonStudentFront(headX, headY, x, y, dir, accent);
      break;
    case "masked_ninja":
      drawSkinMaskedNinjaFront(headX, headY, x, y, dir, accent);
      break;
    case "spirit_samurai":
      drawSkinSpiritSamuraiFront(headX, headY, x, y, dir, accent);
      break;
    case "thunder_senpai":
      drawSkinThunderSenpaiFront(headX, headY, x, y, dir, accent);
      break;
    case "rose_assassin":
      drawSkinRoseAssassinFront(headX, headY, x, y, dir, accent);
      break;
    case "cyber_ninja":
      drawSkinCyberNinjaFront(headX, headY, x, y, dir, accent);
      break;
    case "glitch_demon":
      drawSkinGlitchDemonFront(headX, headY, x, y, dir, accent);
      break;
    case "mecha_stick":
      drawSkinMechaStickFront(headX, headY, x, y, dir, accent);
      break;
    case "holo_blade":
      drawSkinHoloBladeFront(headX, headY, x, y, dir, accent);
      break;
    case "void_walker":
      drawSkinVoidWalkerFront(headX, headY, x, y, dir, accent);
      break;
    case "bone_knight":
      drawSkinBoneKnightFront(headX, headY, x, y, dir, accent);
      break;
    case "vampire_duelist":
      drawSkinVampireDuelistFront(headX, headY, x, y, dir, accent);
      break;
    case "werewolf_rage":
      drawSkinWerewolfRageFront(headX, headY, x, y, dir, accent);
      break;
    case "angelic_guardian":
      drawSkinAngelicGuardianFront(headX, headY, x, y, dir, accent);
      break;
    case "fallen_angel":
      drawSkinFallenAngelFront(headX, headY, x, y, dir, accent);
      break;
    case "gold_champion":
      drawSkinGoldChampionFront(headX, headY, x, y, dir, accent);
      break;
    case "blood_emperor":
      drawSkinBloodEmperorFront(headX, headY, x, y, dir, accent);
      break;
    case "dragon_soul":
      drawSkinDragonSoulFront(headX, headY, x, y, dir, accent);
      break;
    case "shadow_horseman":
      drawSkinShadowHorsemanFront(headX, headY, x, y, dir, accent);
      break;
    case "cosmic_reaper":
      drawSkinCosmicReaperFront(headX, headY, x, y, dir, accent);
      break;
    case "neon_overlord":
      drawSkinNeonOverlordFront(headX, headY, x, y, dir, accent);
      break;
    case "rainbow_madness":
      drawSkinRainbowMadnessFront(headX, headY, x, y, dir, accent);
      break;
    case "kawaii_destroyer":
      drawSkinKawaiiDestroyerFront(headX, headY, x, y, dir, accent);
      break;
    case "herd_guardian":
      drawSkinHerdGuardianFront(headX, headY, x, y, dir, accent);
      break;
    case "red_glitch_king":
      drawSkinRedGlitchKingFront(headX, headY, x, y, dir, accent);
      break;
    case "nightmare_clown":
      drawSkinNightmareClownFront(headX, headY, x, y, dir, accent);
      break;
    case "celestial_samurai":
      drawSkinCelestialSamuraiFront(headX, headY, x, y, dir, accent);
      break;
    case "golden_mustang":
      drawSkinGoldenMustangFront(headX, headY, x, y, dir, accent);
      break;
    case "the_final_boss":
      drawSkinTheFinalBossFront(headX, headY, x, y, dir, accent);
      break;
  }
}

/* ---------- Kleine Skin-Primitive ---------- */

function skinGlowOrb(x, y, radius, color, alpha = 0.22) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(26);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function skinRing(x, y, radiusX, radiusY, color, lineWidth = 4, alpha = 0.85, rotation = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(18);
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function skinSpike(x1, y1, x2, y2, x3, y3, color, alpha = 0.9) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(12);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function skinSmallStar(x, y, color, size = 7) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(13);
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.32, y - size * 0.32);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size * 0.32, y + size * 0.32);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size * 0.32, y + size * 0.32);
  ctx.lineTo(x - size, y);
  ctx.lineTo(x - size * 0.32, y - size * 0.32);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function skinMaskEye(x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(10);
  ctx.beginPath();
  ctx.ellipse(x - 8, y, 5, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 8, y, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function skinMiniHorseshoe(x, y, color, scale = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4 * scale;
  ctx.lineCap = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(14);
  ctx.beginPath();
  ctx.arc(x, y, 15 * scale, Math.PI * 0.12, Math.PI * 0.88, true);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - 12 * scale, y + 6 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.arc(x + 12 * scale, y + 6 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function skinCrossBladeAura(x, y, dir, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.72;
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(18);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - dir * 42, y + 28);
  ctx.lineTo(x + dir * 42, y - 50);
  ctx.moveTo(x - dir * 38, y - 45);
  ctx.lineTo(x + dir * 40, y + 24);
  ctx.stroke();
  ctx.restore();
}

/* ============================================================
   PREMIUM SILHOUETTES / AURAS
============================================================ */

function getPremiumPalette(style, visual) {
  return {
    primary: style && style.color ? style.color : "#ffffff",
    secondary: visual && visual.secondary
      ? visual.secondary
      : style && style.accent
        ? style.accent
        : "#ffffff",
    blade: style && style.blade ? style.blade : "#ffffff"
  };
}

function premiumPolygon(points, fill, stroke, lineWidth = 2, alpha = 1, blur = 10) {
  if (!points || points.length < 3) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke || fill;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.shadowColor = stroke || fill;
  ctx.shadowBlur = premiumShadowBlur(blur);
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawPremiumOrbitNodes(x, y, radiusX, radiusY, color, count, phase, size = 4) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(9);

  const renderedCount = Math.max(2, Math.round(count * premiumIdentityDetail));
  for (let i = 0; i < renderedCount; i++) {
    const angle = phase + (Math.PI * 2 * i) / renderedCount;
    const px = x + Math.cos(angle) * radiusX;
    const py = y + Math.sin(angle) * radiusY;

    ctx.globalAlpha = 0.55 + 0.35 * Math.sin(angle + phase * 1.7);
    ctx.beginPath();
    ctx.arc(px, py, size + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPremiumRuneWheel(x, y, radius, primary, secondary, phase, marks = 8) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(phase);
  ctx.strokeStyle = primary;
  ctx.lineWidth = 3;
  ctx.shadowColor = primary;
  ctx.shadowBlur = premiumShadowBlur(11);
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = secondary;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.42;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 11, 0, Math.PI * 2);
  ctx.stroke();

  const renderedMarks = Math.max(4, Math.round(marks * premiumIdentityDetail));
  for (let i = 0; i < renderedMarks; i++) {
    const angle = (Math.PI * 2 * i) / renderedMarks;
    const inner = radius - 7;
    const outer = radius + (i % 2 === 0 ? 9 : 4);
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPremiumRays(x, y, radius, color, count, phase, length = 20) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(phase);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(10);
  ctx.globalAlpha = 0.42;

  const renderedCount = Math.max(3, Math.round(count * premiumIdentityDetail));
  for (let i = 0; i < renderedCount; i++) {
    const angle = (Math.PI * 2 * i) / renderedCount;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.lineTo(Math.cos(angle) * (radius + length), Math.sin(angle) * (radius + length));
    ctx.stroke();
  }

  ctx.restore();
}

function drawPremiumTechFrame(x, y, primary, secondary, phase, power = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.setLineDash([11, 6]);
  ctx.lineDashOffset = -phase * 24;
  premiumPolygon(
    [[-48, -64], [32, -64], [52, -42], [52, 45], [30, 66], [-35, 66], [-52, 43], [-52, -42]],
    "rgba(0,0,0,0.08)",
    primary,
    2 * power,
    0.62,
    9
  );
  ctx.setLineDash([]);
  ctx.strokeStyle = secondary;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = secondary;
  ctx.shadowBlur = premiumShadowBlur(9);
  ctx.globalAlpha = 0.38;
  ctx.beginPath();
  ctx.moveTo(-42, -38);
  ctx.lineTo(-56, -26);
  ctx.lineTo(-56, 22);
  ctx.moveTo(42, -38);
  ctx.lineTo(56, -26);
  ctx.lineTo(56, 22);
  ctx.stroke();
  ctx.restore();
}

function drawPremiumShadowCape(x, y, dir, color, secondary, scale = 1) {
  const sway = Math.sin(performance.now() / 260) * 6;
  premiumPolygon(
    [
      [x - dir * 9, y - 79],
      [x - dir * (52 * scale), y - 60 + sway],
      [x - dir * (44 * scale), y + 7],
      [x - dir * (12 * scale), y - 17]
    ],
    color,
    secondary,
    2,
    0.42,
    9
  );
}

/* ============================================================
   PREMIUM CHARACTER IDENTITIES V2
   Every premium skin is constructed from its name first. The
   shared tier glow is deliberately subtle; silhouette, clothing,
   face, weapon and signature effect carry the actual identity.
============================================================ */

let premiumIdentityDetail = 1;

function getPremiumIdentityDetail() {
  const playerCount = Array.isArray(players) ? players.length : 0;
  if (playerCount >= 16) return 0.28;
  if (playerCount >= 10) return 0.52;
  return 1;
}

function premiumShadowBlur(amount) {
  return premiumIdentityDetail < 0.6 ? 0 : amount * premiumIdentityDetail;
}

function premiumDetailCount(amount, minimum = 1) {
  return Math.max(minimum, Math.round(amount * premiumIdentityDetail));
}

function identityStroke(points, color, width = 3, alpha = 1, blur = 8, close = false) {
  if (!points || points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = alpha;
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(blur);
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index++) {
    ctx.lineTo(points[index][0], points[index][1]);
  }
  if (close) ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function identityCircle(x, y, radius, fill, stroke = fill, lineWidth = 2, alpha = 1, blur = 8) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = stroke;
  ctx.shadowBlur = premiumShadowBlur(blur);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  if (lineWidth > 0) ctx.stroke();
  ctx.restore();
}

function identityEllipse(x, y, radiusX, radiusY, rotation, fill, stroke = fill, lineWidth = 2, alpha = 1, blur = 8) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = stroke;
  ctx.shadowBlur = premiumShadowBlur(blur);
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
  ctx.fill();
  if (lineWidth > 0) ctx.stroke();
  ctx.restore();
}

function identityRect(x, y, width, height, radius, fill, stroke, lineWidth = 2, alpha = 1, blur = 7) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke || fill;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = stroke || fill;
  ctx.shadowBlur = premiumShadowBlur(blur);
  roundRect(ctx, x, y, width, height, radius, true, lineWidth > 0);
  ctx.restore();
}

function drawIdentityTierAura(x, y, tier, primary, secondary, phase) {
  const centerY = y - 61;
  const radius = tier === "mystic" ? 84 : tier === "legendary" ? 70 : 56;
  const alpha = tier === "mystic" ? 0.105 : tier === "legendary" ? 0.075 : 0.045;

  if (premiumIdentityDetail >= 0.6) {
    skinGlowOrb(x, centerY, radius, primary, alpha);
  }

  if (tier === "legendary" && premiumIdentityDetail >= 0.8) {
    skinRing(x, centerY, radius - 3, radius * 0.34, secondary, 2, 0.18, phase * 0.08);
  }

  if (tier === "mystic" && premiumIdentityDetail >= 0.8) {
    skinRing(x, centerY, radius, radius * 0.37, secondary, 2.5, 0.25, -phase * 0.1);
    drawPremiumRays(x, centerY, radius - 4, secondary, 8, phase * 0.08, 15);
  }
}

function drawIdentityCape(x, y, dir, fill, edge, spread = 1, torn = false) {
  const sway = Math.sin(performance.now() / 310) * 5;
  const farX = x - dir * 60 * spread;
  const points = torn
    ? [
        [x - dir * 10, y - 76],
        [farX, y - 54 + sway],
        [x - dir * 48 * spread, y - 11],
        [x - dir * 34 * spread, y - 22],
        [x - dir * 20 * spread, y + 4],
        [x - dir * 6, y - 28]
      ]
    : [
        [x - dir * 10, y - 77],
        [farX, y - 52 + sway],
        [x - dir * 44 * spread, y + 7],
        [x - dir * 5, y - 26]
      ];

  premiumPolygon(points, fill, edge, 2.5, 0.88, 11);
}

function drawIdentityCoatTails(x, y, dir, fill, edge, length = 1) {
  const sway = Math.sin(performance.now() / 280) * 4;
  premiumPolygon(
    [[x - 17, y - 55], [x - 2, y - 48], [x - 11 - dir * 9, y + 12 * length + sway], [x - 31, y - 14]],
    fill,
    edge,
    2,
    0.84,
    8
  );
  premiumPolygon(
    [[x + 17, y - 55], [x + 2, y - 48], [x + 12 - dir * 5, y + 9 * length - sway], [x + 31, y - 16]],
    fill,
    edge,
    2,
    0.84,
    8
  );
}

function drawIdentityScarf(headX, headY, dir, fill, edge, length = 1) {
  identityStroke(
    [
      [headX - dir * 12, headY + 16],
      [headX - dir * 37 * length, headY + 21],
      [headX - dir * 58 * length, headY + 9 + Math.sin(performance.now() / 220) * 7]
    ],
    "rgba(0,0,0,0.95)",
    12,
    1,
    0
  );
  identityStroke(
    [
      [headX - dir * 12, headY + 16],
      [headX - dir * 37 * length, headY + 21],
      [headX - dir * 58 * length, headY + 9 + Math.sin(performance.now() / 220) * 7]
    ],
    fill,
    7,
    0.95,
    10
  );
  identityStroke(
    [[headX - dir * 16, headY + 13], [headX - dir * 46 * length, headY + 14]],
    edge,
    2,
    0.9,
    6
  );
}

function drawIdentitySpikyHair(headX, headY, dir, fill, edge, scale = 1, wild = false) {
  const spikes = wild
    ? [
        [-23, -7, -38, -34, -8, -20], [-12, -18, -16, -48, 3, -22],
        [0, -19, 10, -50, 15, -18], [12, -14, 34, -40, 27, -7],
        [18, -5, 43, -18, 24, 8]
      ]
    : [
        [-20, -8, -31, -31, -6, -18], [-9, -18, -8, -42, 6, -20],
        [2, -19, 17, -40, 18, -13], [14, -11, 35, -28, 25, 1]
      ];

  for (const spike of spikes.slice(0, premiumDetailCount(spikes.length, 3))) {
    premiumPolygon(
      [
        [headX + spike[0] * scale, headY + spike[1] * scale],
        [headX + spike[2] * scale * dir, headY + spike[3] * scale],
        [headX + spike[4] * scale, headY + spike[5] * scale]
      ],
      fill,
      edge,
      2,
      0.96,
      9
    );
  }
}

function drawIdentityEyes(headX, headY, color, shape = "sharp", scale = 1) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = premiumShadowBlur(12);
  ctx.lineWidth = 3;

  if (shape === "round") {
    ctx.beginPath();
    ctx.arc(headX - 8 * scale, headY - 1, 4 * scale, 0, Math.PI * 2);
    ctx.arc(headX + 8 * scale, headY - 1, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === "single") {
    ctx.beginPath();
    ctx.moveTo(headX - 12 * scale, headY - 2);
    ctx.lineTo(headX + 12 * scale, headY - 2);
    ctx.stroke();
  } else {
    premiumPolygon(
      [[headX - 14 * scale, headY - 4], [headX - 3 * scale, headY - 1], [headX - 13 * scale, headY + 3]],
      color,
      color,
      1,
      1,
      10
    );
    premiumPolygon(
      [[headX + 14 * scale, headY - 4], [headX + 3 * scale, headY - 1], [headX + 13 * scale, headY + 3]],
      color,
      color,
      1,
      1,
      10
    );
  }

  ctx.restore();
}

function drawIdentityHood(headX, headY, fill, edge, pointed = false) {
  const topY = pointed ? headY - 36 : headY - 26;
  premiumPolygon(
    [
      [headX, topY],
      [headX + 27, headY - 13],
      [headX + 25, headY + 19],
      [headX, headY + 27],
      [headX - 25, headY + 19],
      [headX - 27, headY - 13]
    ],
    fill,
    edge,
    3,
    0.98,
    10
  );
  identityEllipse(headX, headY + 1, 17, 18, 0, "#020207", edge, 2, 1, 6);
}

function drawIdentityMask(headX, headY, fill, edge, eyeColor, hooded = true) {
  if (hooded) drawIdentityHood(headX, headY, fill, edge, false);
  identityRect(headX - 18, headY - 3, 36, 19, 7, fill, edge, 2.5, 1, 8);
  identityStroke([[headX - 15, headY + 4], [headX + 15, headY + 4]], edge, 2, 0.75, 5);
  drawIdentityEyes(headX, headY - 5, eyeColor, "sharp", 0.86);
}

function drawIdentityUniform(x, y, jacket, edge, tie, style = "school") {
  drawPremiumTorso(x, y, jacket, edge, 1.02, 0.95);

  premiumPolygon(
    [[x - 13, y - 70], [x, y - 56], [x - 5, y - 39], [x - 21, y - 67]],
    "#f4f4f8",
    edge,
    1.8,
    0.95,
    5
  );
  premiumPolygon(
    [[x + 13, y - 70], [x, y - 56], [x + 5, y - 39], [x + 21, y - 67]],
    "#f4f4f8",
    edge,
    1.8,
    0.95,
    5
  );
  premiumPolygon(
    [[x, y - 60], [x - 5, y - 52], [x, y - 36], [x + 5, y - 52]],
    tie,
    "#000000",
    1.5,
    1,
    8
  );

  if (style === "senpai") {
    identityStroke([[x - 23, y - 48], [x + 23, y - 48]], tie, 3, 0.9, 7);
  }
}

function drawIdentityArmorPlates(x, y, primary, secondary, bulk = 1, plateCount = 3) {
  drawPremiumTorso(x, y, "#070910", primary, bulk, 0.94);
  drawPremiumShoulders(x, y, primary, secondary, bulk > 1.15 ? "heavy" : "plate", bulk);

  for (let index = 0; index < premiumDetailCount(plateCount, 2); index++) {
    const plateY = y - 64 + index * 10;
    identityRect(
      x - (20 - index * 2) * bulk,
      plateY,
      (40 - index * 4) * bulk,
      6,
      2,
      index % 2 ? secondary : primary,
      "#000000",
      1.5,
      0.78,
      6
    );
  }
}

function drawIdentitySamuraiHelmet(headX, headY, primary, secondary, crest = "crescent") {
  identityEllipse(headX, headY - 4, 24, 19, 0, "#080a12", primary, 3, 1, 9);
  premiumPolygon(
    [[headX - 31, headY - 10], [headX + 31, headY - 10], [headX + 22, headY - 22], [headX - 22, headY - 22]],
    primary,
    secondary,
    2.5,
    0.96,
    10
  );
  identityRect(headX - 22, headY + 9, 8, 22, 2, primary, secondary, 2, 0.9, 8);
  identityRect(headX + 14, headY + 9, 8, 22, 2, primary, secondary, 2, 0.9, 8);

  if (crest === "crescent") {
    ctx.save();
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 5;
    ctx.shadowColor = secondary;
    ctx.shadowBlur = premiumShadowBlur(13);
    ctx.beginPath();
    ctx.arc(headX, headY - 29, 18, 0.12 * Math.PI, 0.88 * Math.PI, true);
    ctx.stroke();
    ctx.restore();
  } else if (crest === "horns") {
    skinSpike(headX - 13, headY - 21, headX - 31, headY - 45, headX - 3, headY - 25, secondary, 0.95);
    skinSpike(headX + 13, headY - 21, headX + 31, headY - 45, headX + 3, headY - 25, secondary, 0.95);
  } else {
    skinSmallStar(headX, headY - 32, secondary, 10);
  }

  drawIdentityEyes(headX, headY - 1, secondary, "sharp", 0.8);
}

function drawIdentityShield(x, y, side, fill, edge, emblem = "none", scale = 1) {
  const sx = x + side * 43 * scale;
  const sy = y - 48;
  premiumPolygon(
    [
      [sx, sy - 28 * scale],
      [sx + side * 22 * scale, sy - 16 * scale],
      [sx + side * 18 * scale, sy + 18 * scale],
      [sx, sy + 32 * scale],
      [sx - side * 18 * scale, sy + 18 * scale],
      [sx - side * 22 * scale, sy - 16 * scale]
    ],
    fill,
    edge,
    3,
    0.96,
    12
  );

  if (emblem === "horseshoe") skinMiniHorseshoe(sx, sy, edge, 0.48 * scale);
  if (emblem === "cross") {
    identityStroke([[sx, sy - 14], [sx, sy + 14]], edge, 4, 1, 8);
    identityStroke([[sx - 11, sy], [sx + 11, sy]], edge, 4, 1, 8);
  }
  if (emblem === "star") skinSmallStar(sx, sy, edge, 9 * scale);
}

function drawIdentityWingPair(x, y, primary, edge, kind = "feather", scale = 1) {
  const centerY = y - 62;

  for (const side of [-1, 1]) {
    if (kind === "bat" || kind === "torn") {
      premiumPolygon(
        [
          [x + side * 8, centerY - 14],
          [x + side * 62 * scale, centerY - 58 * scale],
          [x + side * 52 * scale, centerY - 9],
          [x + side * 75 * scale, centerY + 11],
          [x + side * 41 * scale, centerY + 20],
          [x + side * 30 * scale, centerY + 47 * scale]
        ],
        primary,
        edge,
        3,
        kind === "torn" ? 0.68 : 0.82,
        13
      );
      identityStroke(
        [[x + side * 10, centerY - 12], [x + side * 58 * scale, centerY - 51 * scale]],
        edge,
        3,
        0.82,
        9
      );
    } else {
      for (let feather = 0; feather < premiumDetailCount(4, 2); feather++) {
        const startY = centerY - 22 + feather * 13;
        const length = (76 - feather * 8) * scale;
        premiumPolygon(
          [
            [x + side * 8, startY],
            [x + side * length, startY - 24 + feather * 4],
            [x + side * (length - 15), startY + 11],
            [x + side * 12, startY + 13]
          ],
          feather % 2 ? "rgba(255,255,255,0.82)" : primary,
          edge,
          2,
          0.82,
          12
        );
      }
    }
  }
}

function drawIdentitySkullFace(headX, headY, bone, edge, eyeColor) {
  identityEllipse(headX, headY - 1, 18, 20, 0, bone, edge, 2.5, 1, 8);
  identityEllipse(headX - 8, headY - 5, 6, 7, -0.15, "#050507", eyeColor, 1.5, 1, 8);
  identityEllipse(headX + 8, headY - 5, 6, 7, 0.15, "#050507", eyeColor, 1.5, 1, 8);
  premiumPolygon(
    [[headX, headY - 1], [headX - 4, headY + 7], [headX + 4, headY + 7]],
    "#111111",
    "#111111",
    1,
    1,
    0
  );
  identityRect(headX - 13, headY + 10, 26, 8, 2, bone, edge, 2, 1, 5);
  for (let tooth = -2; tooth <= 2; tooth++) {
    identityStroke([[headX + tooth * 5, headY + 11], [headX + tooth * 5, headY + 17]], "#27231d", 1, 1, 0);
  }
}

function drawIdentityWolfHead(headX, headY, fur, edge, eyeColor, enraged = false) {
  skinSpike(headX - 15, headY - 13, headX - 27, headY - 41, headX - 2, headY - 22, fur, 0.98);
  skinSpike(headX + 15, headY - 13, headX + 27, headY - 41, headX + 2, headY - 22, fur, 0.98);
  identityEllipse(headX, headY, 21, 19, 0, "#24150d", edge, 2.5, 1, 8);
  identityEllipse(headX + 11, headY + 9, 17, 10, 0.1, fur, edge, 2.5, 1, 8);
  identityCircle(headX + 24, headY + 7, 4, "#090909", "#090909", 0, 1, 4);
  drawIdentityEyes(headX, headY - 5, eyeColor, "sharp", 0.75);
  identityStroke([[headX + 8, headY + 14], [headX + 19, headY + 17]], "#ffffff", enraged ? 3 : 2, 1, 5);
  if (enraged) {
    skinSpike(headX + 8, headY + 13, headX + 13, headY + 25, headX + 17, headY + 14, "#ffffff", 1);
    skinSpike(headX + 18, headY + 14, headX + 22, headY + 24, headX + 26, headY + 13, "#ffffff", 1);
  }
}

function drawIdentityHorseHead(headX, headY, dir, coat, edge, mane, royal = false) {
  const muzzleX = headX + dir * 18;
  skinSpike(headX - 11, headY - 12, headX - 15, headY - 39, headX - 1, headY - 19, coat, 1);
  skinSpike(headX + 11, headY - 12, headX + 15, headY - 39, headX + 1, headY - 19, coat, 1);
  identityEllipse(headX, headY - 1, 18, 22, 0, coat, edge, 3, 1, 11);
  identityEllipse(muzzleX, headY + 13, 17, 10, 0.08 * dir, coat, edge, 2.5, 1, 9);
  identityCircle(muzzleX + dir * 7, headY + 12, 2.5, "#1b1207", "#1b1207", 0, 1, 0);
  identityCircle(headX + dir * 8, headY - 5, 4, "#ffffff", edge, 1.5, 1, 8);
  identityCircle(headX + dir * 9, headY - 5, 1.8, "#111111", "#111111", 0, 1, 0);

  for (let index = 0; index < premiumDetailCount(5, 3); index++) {
    skinSpike(
      headX - dir * 12,
      headY - 18 + index * 8,
      headX - dir * (29 + index * 2),
      headY - 23 + index * 9,
      headX - dir * 9,
      headY - 9 + index * 7,
      mane,
      0.9
    );
  }

  if (royal) {
    drawCrown(headX, headY - 28, edge);
  }
}

function drawIdentityDragonHead(headX, headY, dir, scales, edge, eyeColor) {
  identityEllipse(headX, headY, 20, 19, 0, "#1d0904", scales, 3, 1, 10);
  identityEllipse(headX + dir * 18, headY + 7, 18, 9, 0.04 * dir, scales, edge, 2.5, 1, 9);
  skinSpike(headX - 12, headY - 14, headX - 24, headY - 39, headX - 2, headY - 21, edge, 0.95);
  skinSpike(headX + 12, headY - 14, headX + 24, headY - 39, headX + 2, headY - 21, edge, 0.95);
  skinSpike(headX - dir * 16, headY - 3, headX - dir * 31, headY - 11, headX - dir * 17, headY + 9, scales, 0.9);
  drawIdentityEyes(headX + dir * 3, headY - 5, eyeColor, "sharp", 0.72);
  identityStroke([[headX + dir * 12, headY + 10], [headX + dir * 29, headY + 10]], "#0b0200", 2, 1, 0);
  skinSpike(headX + dir * 18, headY + 10, headX + dir * 21, headY + 20, headX + dir * 24, headY + 10, "#ffffff", 1);
}

function drawIdentityClownFace(headX, headY, primary, secondary, nightmare = false) {
  identityCircle(headX, headY, 18, nightmare ? "#e7e0df" : "#ffffff", primary, 3, 1, 10);
  premiumPolygon(
    [[headX - 15, headY - 9], [headX - 3, headY - 5], [headX - 13, headY + 1]],
    primary,
    "#000000",
    1.5,
    1,
    8
  );
  premiumPolygon(
    [[headX + 15, headY - 9], [headX + 3, headY - 5], [headX + 13, headY + 1]],
    secondary,
    "#000000",
    1.5,
    1,
    8
  );
  identityCircle(headX, headY + 2, nightmare ? 6 : 5, primary, "#000000", 1.5, 1, 9);

  ctx.save();
  ctx.strokeStyle = nightmare ? "#160006" : primary;
  ctx.lineWidth = nightmare ? 5 : 3;
  ctx.shadowColor = primary;
  ctx.shadowBlur = premiumShadowBlur(8);
  ctx.beginPath();
  ctx.arc(headX, headY + 3, 14, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();

  if (nightmare) {
    for (let tooth = -2; tooth <= 2; tooth++) {
      skinSpike(
        headX + tooth * 5 - 2,
        headY + 10,
        headX + tooth * 5,
        headY + 18,
        headX + tooth * 5 + 2,
        headY + 10,
        "#ffffff",
        1
      );
    }
  }
}

function drawIdentityBat(x, y, color, scale = 1, flip = 1) {
  premiumPolygon(
    [
      [x, y],
      [x - 13 * scale, y - 7 * scale],
      [x - 8 * scale, y + 5 * scale],
      [x, y + 1],
      [x + 8 * scale, y + 5 * scale],
      [x + 13 * scale, y - 7 * scale]
    ].map(([px, py]) => [x + (px - x) * flip, py]),
    color,
    color,
    1.5,
    0.85,
    8
  );
}

function drawIdentityPetal(x, y, color, rotation, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  identityEllipse(0, 0, 6 * scale, 3 * scale, 0, color, "#ffffff", 1, 0.82, 7);
  ctx.restore();
}

function drawIdentityGlitchChunks(x, y, primary, secondary, amount = 7, spread = 1) {
  const phase = Math.floor(performance.now() / 90);
  const renderedAmount = Math.max(4, Math.round(amount * premiumIdentityDetail));
  for (let index = 0; index < renderedAmount; index++) {
    const side = index % 2 === 0 ? -1 : 1;
    const px = x + side * (31 + ((index * 17 + phase * 3) % 35)) * spread;
    const py = y - 104 + ((index * 29 + phase * 7) % 96);
    const width = 8 + (index % 3) * 5;
    identityRect(px, py, width, 4 + (index % 2) * 4, 0, index % 2 ? primary : secondary, "#000000", 1, 0.75, 8);
  }
}

function drawIdentityOrbitPlanet(x, y, radius, color, phase, size = 6) {
  const px = x + Math.cos(phase) * radius;
  const py = y + Math.sin(phase) * radius * 0.48;
  identityCircle(px, py, size, color, "#ffffff", 1.5, 0.92, 10);
  skinRing(px, py, size + 5, 3, "#ffffff", 1.5, 0.65, phase);
}

function drawPremiumIdentityBack(player, skinId, x, y, dir, headX, headY, style) {
  const visual = getHighTierVisual(skinId);
  if (!visual) return;

  const palette = getPremiumPalette(style, visual);
  const primary = palette.primary;
  const secondary = palette.secondary;
  const phase = performance.now() / 900;
  const previousIdentityDetail = premiumIdentityDetail;
  premiumIdentityDetail = getPremiumIdentityDetail();

  ctx.save();
  drawIdentityTierAura(x, y, visual.tier, primary, secondary, phase);

  switch (skinId) {
    case "anime_swordsman": {
      drawIdentityCoatTails(x, y, dir, "#071525", primary, 1.35);
      drawIdentityScarf(headX, headY, dir, "#eafaff", primary, 1.1);
      drawSpeedLines(x - dir * 20, y - 65, primary);
      identityStroke([[x - dir * 70, y - 112], [x - dir * 20, y - 119]], "#ffffff", 3, 0.62, 10);
      identityStroke([[x - dir * 86, y - 39], [x - dir * 26, y - 47]], primary, 3, 0.58, 10);
      break;
    }
    case "demon_student": {
      drawIdentityCoatTails(x, y, dir, "#18051f", "#ff304f", 1.08);
      drawIdentityWingPair(x, y, "#260018", "#ff304f", "bat", 0.56);
      identityRect(x - dir * 49, y - 67, 31, 39, 6, "#14091b", "#b94cff", 3, 0.96, 9);
      identityStroke([[x - dir * 28, y - 70], [x - dir * 48, y - 45]], "#ff304f", 4, 0.9, 8);
      for (let page = 0; page < 3; page++) {
        const px = x + (page - 1) * 49;
        const py = y - 114 + (page % 2) * 22;
        identityRect(px, py, 18, 12, 1, "#f2edf7", "#ff304f", 1.2, 0.72, 7);
        identityStroke([[px + 4, py + 4], [px + 14, py + 4]], "#3f174b", 1, 0.85, 0);
      }
      break;
    }
    case "masked_ninja": {
      drawIdentityScarf(headX, headY, dir, "#18172e", primary, 1.25);
      drawIdentityCape(x, y, dir, "#05050c", primary, 0.72, true);
      for (let puff = 0; puff < 4; puff++) {
        identityCircle(
          x - dir * (37 + puff * 15),
          y - 24 - (puff % 2) * 15,
          10 + puff * 2,
          "#c9c9e8",
          primary,
          1,
          0.12,
          7
        );
      }
      for (const [sx, sy] of [[x - 58, y - 98], [x + 62, y - 55]]) {
        skinSmallStar(sx, sy, primary, 10);
        identityCircle(sx, sy, 3, "#050507", "#050507", 0, 1, 0);
      }
      break;
    }
    case "spirit_samurai": {
      drawIdentityCoatTails(x, y, dir, "rgba(20,92,80,0.42)", secondary, 1.25);
      drawPremiumRuneWheel(x, y - 63, 58, primary, secondary, -phase * 0.12, 6);
      for (let flame = 0; flame < 6; flame++) {
        const side = flame % 2 === 0 ? -1 : 1;
        const fx = x + side * (42 + (flame % 3) * 15);
        const fy = y - 30 - flame * 16;
        identityCircle(fx, fy, 7 + (flame % 2) * 3, "rgba(127,255,212,0.42)", secondary, 1.5, 0.8, 11);
        skinSpike(fx - 5, fy - 2, fx, fy - 20, fx + 5, fy - 2, primary, 0.58);
      }
      break;
    }
    case "thunder_senpai": {
      drawIdentityCoatTails(x, y, dir, "#101018", primary, 1.18);
      drawIdentityScarf(headX, headY, dir, "#ffe600", "#ffffff", 0.84);
      drawLightning(x - 58, y - 92, "#ffffff");
      drawLightning(x + 60, y - 44, primary);
      drawPremiumRays(x, y - 62, 58, primary, 7, phase * 0.18, 22);
      break;
    }
    case "rose_assassin": {
      drawIdentityCape(x, y, dir, "#16030d", primary, 0.92, true);
      identityStroke(
        [[x - dir * 50, y - 4], [x - dir * 57, y - 45], [x - dir * 39, y - 88], [x - dir * 56, y - 119]],
        "#2d9a50",
        3,
        0.78,
        8
      );
      for (let thorn = 0; thorn < 4; thorn++) {
        const tx = x - dir * (45 + (thorn % 2) * 12);
        const ty = y - 25 - thorn * 23;
        skinSpike(tx, ty, tx + dir * 10, ty - 7, tx + dir * 2, ty + 5, "#ff4f8b", 0.9);
      }
      for (let petal = 0; petal < 6; petal++) {
        drawIdentityPetal(x - 72 + petal * 27, y - 112 + (petal % 3) * 37, primary, phase + petal, 0.8);
      }
      break;
    }
    case "cyber_ninja": {
      drawPremiumTechFrame(x, y - 62, primary, secondary, phase, 0.9);
      drawIdentityScarf(headX, headY, dir, "#00ffee", "#ff36dc", 1.05);
      identityStroke([[x - 55, y - 17], [x - 55, y - 102], [x - 37, y - 118]], secondary, 2.5, 0.62, 8);
      identityStroke([[x + 55, y - 17], [x + 55, y - 102], [x + 37, y - 118]], primary, 2.5, 0.62, 8);
      for (const side of [-1, 1]) {
        identityRect(x + side * 68 - 8, y - 84, 16, 29, 3, "#07151a", side < 0 ? secondary : primary, 2, 0.88, 9);
      }
      break;
    }
    case "glitch_demon": {
      drawIdentityWingPair(x, y, "#33000c", secondary, "torn", 0.72);
      drawIdentityGlitchChunks(x, y, primary, secondary, 10, 1.05);
      identityStroke([[x - 36, y - 119], [x + 24, y - 119]], secondary, 5, 0.54, 10);
      identityStroke([[x - 18, y - 18], [x + 52, y - 18]], primary, 5, 0.5, 10);
      break;
    }
    case "mecha_stick": {
      identityRect(x - 31, y - 86, 62, 62, 9, "#151b26", secondary, 4, 0.98, 11);
      for (const side of [-1, 1]) {
        identityRect(x + side * 47 - 11, y - 96, 22, 45, 5, "#242b38", primary, 3, 0.98, 10);
        identityRect(x + side * 56 - 6, y - 109, 12, 33, 3, "#0b0f17", secondary, 2.5, 0.96, 9);
        skinSpike(x + side * 22, y - 27, x + side * 31, y + 4, x + side * 39, y - 27, primary, 0.82);
        skinSpike(x + side * 23, y - 28, x + side * 31, y - 5, x + side * 36, y - 28, "#ffffff", 0.72);
      }
      identityCircle(x, y - 54, 12, "#001f29", secondary, 3, 0.92, 14);
      break;
    }
    case "holo_blade": {
      drawPremiumTechFrame(x, y - 62, primary, "#ffffff", phase, 0.9);
      drawPremiumOrbitNodes(x, y - 62, 75, 44, primary, 6, phase, 4);
      ctx.save();
      ctx.setLineDash([7, 6]);
      identityStroke([[x - 45, y - 115], [x + 50, y - 13]], "#ffffff", 2, 0.38, 9);
      identityStroke([[x + 47, y - 116], [x - 48, y - 14]], primary, 2, 0.42, 9);
      ctx.restore();
      identityEllipse(x, y - 62, 64, 84, 0, "rgba(0,255,238,0.025)", primary, 2, 0.32, 10);
      break;
    }
    case "void_walker": {
      identityCircle(x, y - 62, 74, "rgba(0,0,0,0.88)", primary, 4, 0.9, 18);
      skinRing(x, y - 62, 79, 68, secondary, 3, 0.62, phase * 0.08);
      drawIdentityCape(x, y, dir, "#030006", primary, 1.25, true);
      for (let rock = 0; rock < 6; rock++) {
        const angle = phase * 0.35 + (Math.PI * 2 * rock) / 6;
        const rx = x + Math.cos(angle) * 86;
        const ry = y - 62 + Math.sin(angle) * 55;
        premiumPolygon(
          [[rx - 5, ry], [rx, ry - 7], [rx + 6, ry - 1], [rx + 2, ry + 7]],
          "#0c0714",
          rock % 2 ? primary : secondary,
          2,
          0.86,
          9
        );
      }
      break;
    }
    case "bone_knight": {
      drawIdentityCape(x, y, dir, "#181713", secondary, 0.7, true);
      for (const offset of [-1, 1]) {
        identityStroke([[x - offset * 58, y - 112], [x + offset * 47, y - 8]], "#080807", 13, 1, 0);
        identityStroke([[x - offset * 58, y - 112], [x + offset * 47, y - 8]], secondary, 7, 0.86, 9);
        identityCircle(x - offset * 58, y - 112, 7, secondary, "#080807", 2, 1, 7);
        identityCircle(x + offset * 47, y - 8, 7, secondary, "#080807", 2, 1, 7);
      }
      break;
    }
    case "vampire_duelist": {
      drawIdentityCape(x, y, dir, "#260007", primary, 1.2, false);
      premiumPolygon(
        [[x - 12, y - 78], [x - 39, y - 103], [x - 29, y - 60]],
        "#130006",
        primary,
        2.5,
        0.96,
        10
      );
      premiumPolygon(
        [[x + 12, y - 78], [x + 39, y - 103], [x + 29, y - 60]],
        "#130006",
        primary,
        2.5,
        0.96,
        10
      );
      drawIdentityBat(x - 64, y - 108, primary, 0.85, 1);
      drawIdentityBat(x + 70, y - 67, "#7a0017", 0.72, -1);
      drawIdentityBat(x - 52, y - 29, "#a90025", 0.55, 1);
      break;
    }
    case "werewolf_rage": {
      for (const side of [-1, 1]) {
        for (let spike = 0; spike < 4; spike++) {
          const sy = y - 86 + spike * 16;
          skinSpike(
            x + side * 10,
            sy,
            x + side * (48 + spike * 5),
            sy - 13,
            x + side * 24,
            sy + 10,
            spike % 2 ? primary : "#5b3219",
            0.82
          );
        }
      }
      for (let slash = 0; slash < 3; slash++) {
        identityStroke(
          [[x - 74, y - 110 + slash * 22], [x + 65, y - 69 + slash * 18]],
          slash === 1 ? "#ff304f" : secondary,
          4,
          0.42,
          11
        );
      }
      break;
    }
    case "angelic_guardian": {
      drawIdentityWingPair(x, y, "#fff6c8", "#ffffff", "feather", 1.18);
      skinRing(x, y - 127, 31, 10, secondary, 5, 0.88, 0);
      drawPremiumRays(x, y - 62, 73, secondary, 12, phase * 0.03, 25);
      break;
    }
    case "fallen_angel": {
      drawIdentityWingPair(x, y, "#0a0610", primary, "torn", 1.28);
      drawIdentityCape(x, y, dir, "#060209", primary, 1.12, true);
      ctx.save();
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 5;
      ctx.setLineDash([22, 12]);
      ctx.shadowColor = primary;
      ctx.shadowBlur = premiumShadowBlur(13);
      ctx.beginPath();
      ctx.ellipse(x, y - 132, 34, 10, -0.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      for (let feather = 0; feather < 5; feather++) {
        drawIdentityPetal(x - 71 + feather * 34, y - 109 + feather * 22, feather % 2 ? primary : "#22152e", phase + feather, 1.1);
      }
      break;
    }
    case "gold_champion": {
      drawIdentityCape(x, y, dir, "#4f3600", primary, 0.95, false);
      drawPremiumRays(x, y - 62, 72, primary, 16, phase * 0.02, 25);
      drawIdentityShield(x, y, -dir, "#3b2a00", primary, "star", 1.18);
      for (let leaf = 0; leaf < 7; leaf++) {
        const angle = -2.65 + leaf * 0.36;
        drawIdentityPetal(x + Math.cos(angle) * 51, y - 106 + Math.sin(angle) * 20, primary, angle, 0.75);
      }
      break;
    }
    case "blood_emperor": {
      drawIdentityCape(x, y, dir, "#3a000b", secondary, 1.3, false);
      identityRect(x - 58, y - 119, 116, 91, 8, "rgba(25,0,6,0.42)", primary, 4, 0.78, 14);
      for (const side of [-1, 1]) {
        skinSpike(x + side * 51, y - 112, x + side * 68, y - 149, x + side * 37, y - 117, secondary, 0.88);
        identityCircle(x + side * 76, y - 64, 10, "#6c0017", primary, 2, 0.88, 14);
      }
      identityCircle(x, y - 10, 8, "#980020", secondary, 2, 0.85, 12);
      break;
    }
    case "dragon_soul": {
      drawIdentityWingPair(x, y, "#4a1400", primary, "bat", 1.25);
      ctx.save();
      ctx.strokeStyle = primary;
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.shadowColor = primary;
      ctx.shadowBlur = premiumShadowBlur(18);
      ctx.beginPath();
      ctx.moveTo(x - dir * 12, y - 20);
      ctx.bezierCurveTo(x - dir * 42, y + 17, x - dir * 77, y + 4, x - dir * 84, y - 23);
      ctx.stroke();
      ctx.restore();
      drawIdentityDragonHead(x - dir * 69, y - 117, -dir, "#7c2300", primary, "#fff0c6");
      skinGlowOrb(x - dir * 69, y - 117, 30, primary, 0.16);
      break;
    }
    case "shadow_horseman": {
      drawIdentityCape(x, y - 4, dir, "#030106", primary, 1.08, true);

      // The rider now sits on a complete spectral horse silhouette instead of
      // an abstract oval. Neck, saddle and four articulated legs stay readable
      // even when the lance crosses the front of the character.
      identityEllipse(x - dir * 17, y - 22, 83, 36, -0.05 * dir, "rgba(13,5,24,0.88)", primary, 5, 0.88, 16);
      identityStroke(
        [[x + dir * 35, y - 35], [x + dir * 52, y - 58], [x + dir * 67, y - 66]],
        "#120b1d",
        25,
        1,
        10
      );
      identityStroke(
        [[x + dir * 35, y - 35], [x + dir * 52, y - 58], [x + dir * 67, y - 66]],
        primary,
        4,
        0.9,
        12
      );
      drawIdentityHorseHead(x + dir * 72, y - 71, dir, "#120b1d", primary, secondary, false);
      identityRect(x - 31, y - 48, 62, 19, 7, "#231435", secondary, 3, 0.95, 10);
      identityStroke([[x - 28, y - 36], [x + 31, y - 36]], primary, 3, 0.9, 8);

      const horseLegs = [
        [[x - dir * 62, y - 14], [x - dir * 72, y + 28], [x - dir * 58, y + 48]],
        [[x - dir * 30, y - 10], [x - dir * 39, y + 34], [x - dir * 27, y + 51]],
        [[x + dir * 24, y - 8], [x + dir * 35, y + 33], [x + dir * 50, y + 44]],
        [[x + dir * 57, y - 12], [x + dir * 69, y + 23], [x + dir * 83, y + 35]]
      ];
      horseLegs.forEach((points, index) => {
        identityStroke(points, "#08040e", 12, 0.96, 6);
        identityStroke(points, index % 2 ? secondary : primary, 6, 0.86, 11);
      });

      identityStroke(
        [[x - dir * 94, y - 30], [x - dir * 115, y - 53], [x - dir * 124, y - 38]],
        secondary,
        7,
        0.72,
        12
      );
      break;
    }
    case "cosmic_reaper": {
      drawIdentityCape(x, y, dir, "#01070b", primary, 1.35, true);
      identityCircle(x, y - 63, 82, "rgba(0,10,20,0.66)", primary, 3, 0.84, 18);
      drawIdentityOrbitPlanet(x, y - 63, 91, "#9c5cff", phase * 0.7, 7);
      drawIdentityOrbitPlanet(x, y - 63, 72, "#ffd34a", -phase * 0.5 + 2, 5);
      drawStars(x, y - 80, secondary);
      break;
    }
    case "neon_overlord": {
      drawIdentityCape(x, y, dir, "#001619", primary, 1.2, false);
      drawPremiumTechFrame(x, y - 62, primary, secondary, phase * 1.3, 1.18);
      for (const side of [-1, 1]) {
        identityRect(x + side * 76 - 16, y - 101, 32, 24, 6, "#06181e", side < 0 ? secondary : primary, 3, 0.94, 12);
        identityCircle(x + side * 76, y - 89, 5, "#ffffff", side < 0 ? secondary : primary, 1.5, 1, 10);
        identityStroke([[x + side * 76, y - 77], [x + side * 63, y - 57]], side < 0 ? secondary : primary, 2, 0.65, 8);
      }
      break;
    }
    case "rainbow_madness": {
      const rainbow = ["#ff304f", "#ff8c32", "#ffe600", "#00ff84", "#00e5ff", "#9c5cff", "#ff36dc"];
      rainbow.forEach((color, index) => {
        skinRing(x, y - 62, 52 + index * 5, 18 + index * 3, color, 3, 0.45, phase * (index % 2 ? -0.2 : 0.2));
        identityCircle(
          x + Math.cos(phase + index) * (68 + index * 2),
          y - 62 + Math.sin(phase * 1.2 + index) * 58,
          4 + (index % 3),
          color,
          color,
          1,
          0.85,
          10
        );
      });
      break;
    }
    case "kawaii_destroyer": {
      drawIdentityCape(x, y, dir, "#5b1e50", primary, 0.78, false);
      premiumPolygon(
        [[x, y - 113], [x - 54, y - 142], [x - 43, y - 96]],
        "#ff9fe8",
        "#ffffff",
        3,
        0.9,
        12
      );
      premiumPolygon(
        [[x, y - 113], [x + 54, y - 142], [x + 43, y - 96]],
        "#ff9fe8",
        "#ffffff",
        3,
        0.9,
        12
      );
      identityCircle(x, y - 113, 13, primary, "#ffffff", 2, 1, 10);
      drawPremiumOrbitNodes(x, y - 63, 82, 52, primary, 7, phase, 6);
      break;
    }
    case "herd_guardian": {
      drawIdentityCape(x, y, dir, "#3b2c08", primary, 1.04, false);
      drawIdentityShield(x, y, -dir, "#281d05", primary, "horseshoe", 1.22);
      for (let herd = 0; herd < 3; herd++) {
        const hx = x - 86 + herd * 86;
        const hy = y - 122 + (herd % 2) * 35;
        identityEllipse(hx, hy, 20, 12, 0, "rgba(255,211,74,0.16)", primary, 2, 0.65, 10);
        skinSpike(hx - 8, hy - 7, hx - 12, hy - 23, hx, hy - 10, primary, 0.7);
        skinSpike(hx + 8, hy - 7, hx + 12, hy - 23, hx, hy - 10, primary, 0.7);
      }
      break;
    }
    case "red_glitch_king": {
      drawIdentityCape(x, y, dir, "#300008", primary, 1.42, true);
      for (let block = 0; block < 7; block++) {
        const bx = x - 73 + (block % 3) * 71;
        const by = y - 130 + Math.floor(block / 3) * 46;
        identityRect(bx, by, 33 + (block % 2) * 12, 23, 2, "rgba(255,48,79,0.17)", block % 2 ? secondary : primary, 2, 0.82, 10);
      }
      drawIdentityGlitchChunks(x, y, primary, secondary, 14, 1.25);
      identityRect(x - 61, y - 125, 122, 101, 4, "rgba(20,0,5,0.35)", primary, 5, 0.7, 15);
      break;
    }
    case "nightmare_clown": {
      drawIdentityCape(x, y, dir, "#190006", primary, 1.3, true);
      for (const side of [-1, 1]) {
        skinSpike(x + side * 17, y - 89, x + side * 73, y - 133, x + side * 37, y - 69, side < 0 ? primary : secondary, 0.82);
        identityCircle(x + side * 73, y - 133, 8, side < 0 ? secondary : primary, "#000000", 2, 0.95, 10);
      }
      identityCircle(x - dir * 79, y - 101, 19, "rgba(255,23,71,0.18)", primary, 3, 0.78, 14);
      identityStroke(
        [[x - dir * 79, y - 82], [x - dir * 68, y - 33], [x - dir * 84, y - 4]],
        "#ffffff",
        2,
        0.52,
        5
      );
      drawPremiumRays(x, y - 62, 78, secondary, 7, phase * 0.08, 34);
      break;
    }
    case "celestial_samurai": {
      drawIdentityCoatTails(x, y, dir, "#101028", primary, 1.42);
      drawPremiumRuneWheel(x, y - 63, 86, secondary, primary, phase * 0.12, 12);
      drawIdentityOrbitPlanet(x, y - 63, 96, "#ffd34a", phase * 0.52, 8);
      drawIdentityOrbitPlanet(x, y - 63, 77, "#9c5cff", -phase * 0.41 + 2.5, 6);
      drawStars(x, y - 84, "#ffffff");
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.shadowColor = primary;
      ctx.shadowBlur = premiumShadowBlur(13);
      ctx.beginPath();
      ctx.arc(x - 68, y - 120, 20, -0.45 * Math.PI, 0.5 * Math.PI);
      ctx.arc(x - 61, y - 125, 20, -0.5 * Math.PI, 0.45 * Math.PI, true);
      ctx.fill();
      ctx.restore();
      break;
    }
    case "golden_mustang": {
      identityEllipse(x - dir * 23, y - 32, 86, 37, -0.05 * dir, "rgba(111,75,0,0.68)", primary, 5, 0.78, 18);
      drawIdentityHorseHead(x + dir * 66, y - 78, dir, "#d89d16", "#fff8d2", primary, true);
      for (const leg of [-1, 1]) {
        identityStroke(
          [[x - dir * (2 + leg * 28), y - 19], [x - dir * (20 + leg * 35), y + 34], [x - dir * (4 + leg * 38), y + 48]],
          "#fff8d2",
          9,
          0.76,
          14
        );
      }
      drawSpeedLines(x - dir * 74, y - 61, primary);
      drawPremiumRays(x, y - 62, 87, primary, 12, phase * 0.025, 29);
      break;
    }
    case "the_final_boss": {
      drawIdentityCape(x, y, dir, "#240006", primary, 1.55, true);
      drawIdentityWingPair(x, y, "#1d0007", primary, "torn", 1.42);
      identityRect(x - 72, y - 134, 144, 116, 10, "rgba(20,0,5,0.35)", primary, 5, 0.68, 18);
      for (let shard = 0; shard < 8; shard++) {
        const angle = phase * 0.16 + (Math.PI * 2 * shard) / 8;
        const sx = x + Math.cos(angle) * 104;
        const sy = y - 65 + Math.sin(angle) * 77;
        premiumPolygon(
          [[sx, sy - 15], [sx + 7, sy], [sx, sy + 15], [sx - 7, sy]],
          shard % 2 ? secondary : primary,
          "#ffffff",
          2,
          0.88,
          13
        );
      }
      for (const side of [-1, 1]) {
        identityCircle(x + side * 87, y - 104, 9, "#080004", secondary, 2, 0.95, 13);
        identityCircle(x + side * 87, y - 104, 3, "#ffffff", "#ffffff", 0, 1, 9);
      }
      drawPremiumRays(x, y - 63, 94, secondary, 12, -phase * 0.11, 36);
      break;
    }
  }

  ctx.restore();
  premiumIdentityDetail = previousIdentityDetail;
}

function drawPremiumIdentityFront(player, skinId, x, y, dir, headX, headY, style) {
  const visual = getHighTierVisual(skinId);
  if (!visual) return;

  const palette = getPremiumPalette(style, visual);
  const primary = palette.primary;
  const secondary = palette.secondary;
  const phase = performance.now() / 900;
  const previousIdentityDetail = premiumIdentityDetail;
  premiumIdentityDetail = getPremiumIdentityDetail();

  ctx.save();

  switch (skinId) {
    case "anime_swordsman": {
      drawPremiumTorso(x, y, "#061521", primary, 0.98, 0.96);
      premiumPolygon([[x - 22, y - 70], [x, y - 48], [x - 5, y - 34], [x - 29, y - 61]], "#eafaff", primary, 2, 0.92, 7);
      premiumPolygon([[x + 22, y - 70], [x, y - 48], [x + 5, y - 34], [x + 29, y - 61]], "#eafaff", primary, 2, 0.92, 7);
      identityStroke([[x - 26, y - 35], [x + 26, y - 35]], "#ffffff", 4, 0.9, 8);
      drawIdentitySpikyHair(headX, headY, dir, "#07131e", primary, 1.05, false);
      identityEllipse(headX, headY, 17, 17, 0, "rgba(5,13,21,0.72)", primary, 2, 0.88, 7);
      drawIdentityEyes(headX, headY - 1, "#ffffff", "sharp", 0.9);
      identityStroke([[headX - 17, headY + 12], [headX + 17, headY + 12]], primary, 3, 0.92, 7);
      break;
    }
    case "demon_student": {
      drawIdentityUniform(x, y, "#21102a", "#b94cff", "#ff304f", "school");
      drawIdentitySpikyHair(headX, headY, dir, "#16051d", "#b94cff", 0.9, false);
      drawHorns(headX, headY, "#ff304f");
      identityEllipse(headX, headY, 17, 17, 0, "#2c1037", "#b94cff", 2.5, 0.96, 9);
      drawIdentityEyes(headX, headY - 1, "#ffd6ff", "round", 0.75);
      identityRect(x - 29, y - 31, 58, 7, 2, "#ff304f", "#16051d", 1.5, 0.9, 7);
      identityRect(x + dir * 27, y - 62, 16, 24, 3, "#f5eff7", "#ff304f", 1.5, 0.88, 7);
      break;
    }
    case "masked_ninja": {
      drawPremiumTorso(x, y, "#07070d", primary, 0.94, 0.95);
      drawIdentityMask(headX, headY, "#0a0913", primary, "#d8d8ff", true);
      identityStroke([[x - 23, y - 70], [x + 22, y - 34]], "#d8d8ff", 5, 0.84, 8);
      identityStroke([[x + 23, y - 70], [x - 19, y - 35]], primary, 3, 0.88, 8);
      for (const side of [-1, 1]) {
        identityStroke([[x + side * 10, y - 51], [x + side * 34, y - 46]], "#c7c7df", 3, 0.72, 5);
        identityStroke([[x + side * 8, y - 17], [x + side * 24, y + 7]], primary, 3, 0.74, 6);
      }
      break;
    }
    case "spirit_samurai": {
      drawIdentityArmorPlates(x, y, "rgba(127,255,212,0.72)", "#ffffff", 1.08, 4);
      drawIdentitySamuraiHelmet(headX, headY, "rgba(55,173,141,0.82)", "#ffffff", "horns");
      identityEllipse(headX, headY + 1, 14, 16, 0, "rgba(3,43,36,0.72)", primary, 2, 0.88, 8);
      drawIdentityEyes(headX, headY, "#ffffff", "sharp", 0.72);
      for (const side of [-1, 1]) {
        identityRect(x + side * 25 - 7, y - 45, 14, 27, 3, "rgba(127,255,212,0.52)", "#ffffff", 2, 0.84, 8);
      }
      break;
    }
    case "thunder_senpai": {
      drawIdentityUniform(x, y, "#141419", "#ffe600", "#ffffff", "senpai");
      drawIdentitySpikyHair(headX, headY, dir, "#ffe600", "#ffffff", 1.08, true);
      identityEllipse(headX, headY, 17, 17, 0, "#191914", "#ffe600", 2.5, 0.98, 11);
      drawIdentityEyes(headX, headY - 1, "#ffffff", "sharp", 0.92);
      premiumPolygon(
        [[x - 3, y - 66], [x + 8, y - 55], [x + 2, y - 52], [x + 7, y - 38], [x - 9, y - 50], [x - 3, y - 53]],
        "#ffe600",
        "#ffffff",
        1.5,
        1,
        10
      );
      break;
    }
    case "rose_assassin": {
      drawPremiumTorso(x, y, "#10050a", primary, 0.94, 0.96);
      drawIdentityHood(headX, headY, "#12050b", primary, true);
      identityRect(headX - 17, headY + 2, 34, 14, 6, "#050204", primary, 2, 0.98, 8);
      drawIdentityEyes(headX, headY - 3, "#ffe1ee", "sharp", 0.8);
      identityStroke([[x - 20, y - 70], [x + 17, y - 36]], "#2d9a50", 4, 0.88, 8);
      identityStroke([[x + 20, y - 70], [x - 17, y - 36]], primary, 3, 0.86, 8);
      drawRose(x - dir * 26, y - 69, primary);
      for (const side of [-1, 1]) {
        skinSpike(x + side * 23, y - 42, x + side * 36, y - 52, x + side * 27, y - 32, "#2d9a50", 0.9);
      }
      break;
    }
    case "cyber_ninja": {
      drawPremiumTorso(x, y, "#031115", primary, 1.02, 0.98);
      drawPremiumShoulders(x, y, primary, secondary, "spike", 1.05);
      premiumPolygon(
        [[headX - 24, headY - 13], [headX - 10, headY - 26], [headX + 20, headY - 20], [headX + 27, headY + 10], [headX, headY + 23], [headX - 23, headY + 10]],
        "#06171c",
        primary,
        3,
        0.98,
        12
      );
      identityRect(headX - 20, headY - 7, 40, 13, 4, "#001014", secondary, 2.5, 1, 11);
      identityStroke([[headX - 15, headY - 2], [headX + 15, headY - 2]], "#ffffff", 3, 1, 12);
      identityCircle(x, y - 55, 9, "#001316", secondary, 3, 1, 13);
      for (const side of [-1, 1]) {
        identityStroke([[x + side * 8, y - 66], [x + side * 20, y - 43], [x + side * 12, y - 34]], side < 0 ? secondary : primary, 3, 0.9, 9);
        identityRect(x + side * 29 - 6, y - 52, 12, 27, 3, "#062129", side < 0 ? secondary : primary, 2, 0.88, 8);
      }
      break;
    }
    case "glitch_demon": {
      drawPremiumTorso(x, y, "#170007", primary, 1.08, 0.95);
      drawPremiumShoulders(x, y, primary, secondary, "spike", 1.15);
      identityEllipse(headX - 4, headY, 17, 18, -0.08, "#26000b", primary, 3, 1, 12);
      skinSpike(headX - 14, headY - 14, headX - 35, headY - 45, headX - 2, headY - 23, primary, 1);
      skinSpike(headX + 9, headY - 15, headX + 20, headY - 52, headX + 21, headY - 18, secondary, 1);
      drawIdentityEyes(headX - 3, headY - 2, secondary, "single", 0.78);
      identityRect(headX + 9, headY + 6, 17, 7, 0, secondary, "#000000", 1, 0.85, 9);
      identityRect(x - 20, y - 67, 39, 13, 0, secondary, "#000000", 1.5, 0.82, 8);
      identityRect(x - 27, y - 47, 34, 10, 0, primary, "#000000", 1.5, 0.86, 8);
      identityRect(x + 8, y - 34, 23, 8, 0, secondary, "#000000", 1.5, 0.8, 8);
      drawIdentityGlitchChunks(x, y, primary, secondary, 6, 0.65);
      break;
    }
    case "mecha_stick": {
      drawPremiumTorso(x, y, "#242a35", secondary, 1.28, 1);
      drawPremiumShoulders(x, y, "#bfc7d5", secondary, "heavy", 1.35);
      identityRect(headX - 23, headY - 20, 46, 40, 7, "#222934", "#bfc7d5", 4, 1, 11);
      identityRect(headX - 17, headY - 7, 34, 12, 3, "#00141c", secondary, 3, 1, 13);
      identityCircle(headX, headY - 1, 4, "#ffffff", secondary, 1, 1, 11);
      identityCircle(x, y - 55, 12, "#002e3d", secondary, 4, 1, 15);
      identityCircle(x, y - 55, 5, "#ffffff", "#ffffff", 0, 1, 11);
      for (const side of [-1, 1]) {
        identityRect(x + side * 31 - 8, y - 61, 16, 34, 4, "#353d4c", side < 0 ? "#bfc7d5" : secondary, 2.5, 0.98, 9);
        identityRect(x + side * 21 - 7, y - 20, 14, 29, 3, "#222934", "#bfc7d5", 2, 0.96, 8);
      }
      break;
    }
    case "holo_blade": {
      drawPremiumTorso(x, y, "rgba(0,35,42,0.42)", primary, 0.98, 0.72);
      identityEllipse(headX, headY, 20, 20, 0, "rgba(10,255,245,0.08)", primary, 2.5, 0.74, 12);
      identityRect(headX - 19, headY - 6, 38, 12, 3, "rgba(255,255,255,0.08)", "#ffffff", 2, 0.76, 10);
      drawIdentityEyes(headX, headY - 1, primary, "single", 0.82);
      for (const side of [-1, 1]) {
        premiumPolygon(
          [[x + side * 8, y - 70], [x + side * 31, y - 65], [x + side * 24, y - 35], [x + side * 7, y - 38]],
          "rgba(117,255,248,0.13)",
          side < 0 ? "#ffffff" : primary,
          2,
          0.72,
          9
        );
      }
      identityCircle(x, y - 54, 9, "rgba(255,255,255,0.12)", "#ffffff", 2, 0.76, 10);
      break;
    }
    case "void_walker": {
      drawIdentityHood(headX, headY, "#030006", primary, true);
      identityEllipse(headX, headY + 2, 16, 18, 0, "#000000", "#000000", 0, 1, 16);
      drawIdentityEyes(headX, headY - 1, secondary, "round", 0.68);
      drawPremiumTorso(x, y, "#020004", primary, 1.03, 0.94);
      identityCircle(x, y - 55, 13, "#000000", primary, 3, 1, 14);
      identityCircle(x, y - 55, 5, secondary, secondary, 0, 0.88, 10);
      for (const side of [-1, 1]) {
        skinSpike(x + side * 15, y - 37, x + side * 35, y - 14, x + side * 8, y - 24, "#08020e", 0.94);
      }
      break;
    }
    case "bone_knight": {
      drawIdentityArmorPlates(x, y, "#c9c1ad", "#fff8e8", 1.18, 3);
      drawIdentitySkullFace(headX, headY, "#e5dfcc", "#302d25", "#fff8e8");
      for (const side of [-1, 1]) {
        skinSpike(headX + side * 13, headY - 16, headX + side * 30, headY - 38, headX + side * 4, headY - 23, "#e5dfcc", 1);
        identityCircle(x + side * 30, y - 68, 9, "#e5dfcc", "#302d25", 2, 1, 7);
      }
      ctx.save();
      ctx.strokeStyle = "#fff8e8";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#e5dfcc";
      ctx.shadowBlur = premiumShadowBlur(8);
      for (let rib = 0; rib < 4; rib++) {
        ctx.beginPath();
        ctx.arc(x, y - 63 + rib * 9, 18 - rib * 2, 0.1, Math.PI - 0.1);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }
    case "vampire_duelist": {
      drawPremiumTorso(x, y, "#130006", primary, 0.98, 0.96);
      premiumPolygon([[x - 19, y - 69], [x, y - 52], [x - 8, y - 35], [x - 27, y - 60]], "#f4e7e7", primary, 2, 0.9, 7);
      premiumPolygon([[x + 19, y - 69], [x, y - 52], [x + 8, y - 35], [x + 27, y - 60]], "#f4e7e7", primary, 2, 0.9, 7);
      premiumPolygon([[x, y - 58], [x - 8, y - 51], [x, y - 43], [x + 8, y - 51]], primary, "#ffffff", 1.5, 1, 9);
      identityEllipse(headX, headY, 17, 18, 0, "#e8d9d9", primary, 2.5, 1, 8);
      drawIdentitySpikyHair(headX, headY, -dir, "#160006", primary, 0.78, false);
      drawIdentityEyes(headX, headY - 3, primary, "sharp", 0.78);
      skinSpike(headX - 8, headY + 8, headX - 5, headY + 17, headX - 2, headY + 8, "#ffffff", 1);
      skinSpike(headX + 2, headY + 8, headX + 5, headY + 17, headX + 8, headY + 8, "#ffffff", 1);
      break;
    }
    case "werewolf_rage": {
      drawPremiumTorso(x, y, "#28160c", primary, 1.13, 0.92);
      drawIdentityWolfHead(headX, headY, primary, "#5b3219", "#ff304f", true);
      for (const side of [-1, 1]) {
        for (let fur = 0; fur < 3; fur++) {
          skinSpike(
            x + side * (12 + fur * 5),
            y - 71 + fur * 13,
            x + side * (42 + fur * 4),
            y - 81 + fur * 8,
            x + side * (27 + fur * 3),
            y - 57 + fur * 11,
            fur % 2 ? "#5b3219" : primary,
            0.94
          );
        }
        identityStroke([[x + side * 13, y - 20], [x + side * 31, y - 2]], secondary, 5, 0.84, 8);
      }
      break;
    }
    case "angelic_guardian": {
      drawIdentityArmorPlates(x, y, "#ffffff", secondary, 1.22, 4);
      identityEllipse(headX, headY - 2, 22, 21, 0, "#f8f8f4", secondary, 3, 1, 11);
      premiumPolygon([[headX - 24, headY - 5], [headX + 24, headY - 5], [headX + 17, headY + 10], [headX - 17, headY + 10]], "#d9d9d5", secondary, 2.5, 1, 9);
      identityStroke([[headX - 12, headY + 1], [headX + 12, headY + 1]], "#ffffff", 3, 1, 10);
      identityStroke([[headX, headY - 11], [headX, headY + 11]], secondary, 3, 0.92, 8);
      drawIdentityShield(x, y, -dir, "#ffffff", secondary, "cross", 1.25);
      skinRing(headX, headY - 30, 27, 8, secondary, 4, 0.82, 0);
      break;
    }
    case "fallen_angel": {
      drawPremiumTorso(x, y, "#08040d", primary, 1.15, 0.96);
      drawPremiumShoulders(x, y, "#1c112d", primary, "spike", 1.22);
      identityEllipse(headX, headY, 18, 19, 0, "#17101e", primary, 2.5, 1, 10);
      drawIdentityEyes(headX, headY - 2, secondary, "sharp", 0.82);
      identityStroke([[headX - 8, headY + 7], [headX - 3, headY + 17]], primary, 2.5, 0.9, 7);
      identityStroke([[headX + 7, headY + 7], [headX + 2, headY + 15]], primary, 2.5, 0.9, 7);
      for (const side of [-1, 1]) {
        skinSpike(headX + side * 11, headY - 15, headX + side * 24, headY - 38, headX + side * 2, headY - 22, "#1c112d", 0.98);
      }
      identityCircle(x, y - 55, 10, "#030105", primary, 3, 1, 12);
      break;
    }
    case "gold_champion": {
      drawIdentityArmorPlates(x, y, "#7a5600", "#ffffff", 1.28, 4);
      identityEllipse(headX, headY, 21, 20, 0, "#3a2a05", primary, 3.5, 1, 12);
      premiumPolygon([[headX - 25, headY - 7], [headX + 25, headY - 7], [headX + 18, headY + 8], [headX - 18, headY + 8]], primary, "#ffffff", 2.5, 0.95, 10);
      drawIdentityEyes(headX, headY - 1, "#ffffff", "sharp", 0.76);
      for (let leaf = 0; leaf < 7; leaf++) {
        const angle = -2.65 + leaf * 0.36;
        drawIdentityPetal(headX + Math.cos(angle) * 28, headY - 19 + Math.sin(angle) * 13, primary, angle, 0.65);
      }
      identityRect(x - 28, y - 34, 56, 12, 5, "#231800", primary, 3, 1, 10);
      identityCircle(x, y - 28, 8, primary, "#ffffff", 2, 1, 10);
      skinSmallStar(x, y - 28, "#ffffff", 5);
      break;
    }
    case "blood_emperor": {
      drawPremiumTorso(x, y, "#33000a", secondary, 1.3, 0.98);
      drawPremiumShoulders(x, y, primary, secondary, "heavy", 1.32);
      identityEllipse(headX, headY, 18, 19, 0, "#710017", secondary, 3, 1, 12);
      drawIdentityEyes(headX, headY - 1, "#ffd6dd", "sharp", 0.9);
      premiumPolygon(
        [
          [headX - 24, headY - 18], [headX - 22, headY - 43], [headX - 10, headY - 28],
          [headX, headY - 50], [headX + 10, headY - 28], [headX + 22, headY - 43],
          [headX + 24, headY - 18]
        ],
        secondary,
        primary,
        3,
        1,
        13
      );
      identityCircle(headX, headY - 30, 5, primary, "#ffffff", 1.5, 1, 10);
      identityStroke([[x - 24, y - 70], [x + 24, y - 35]], primary, 4, 0.9, 9);
      identityStroke([[x + 24, y - 70], [x - 24, y - 35]], secondary, 4, 0.9, 9);
      break;
    }
    case "dragon_soul": {
      drawIdentityArmorPlates(x, y, "#4c1300", primary, 1.28, 4);
      drawIdentityDragonHead(headX, headY, dir, "#7c2300", primary, "#fff0c6");
      for (const side of [-1, 1]) {
        skinSpike(x + side * 22, y - 69, x + side * 48, y - 83, x + side * 28, y - 52, primary, 0.96);
        identityStroke([[x + side * 7, y - 67], [x + side * 19, y - 39]], secondary, 3, 0.82, 8);
      }
      identityCircle(x, y - 54, 10, "#7c2300", "#fff0c6", 2, 1, 12);
      drawFireFlicker(x, y - 56);
      break;
    }
    case "shadow_horseman": {
      drawIdentityArmorPlates(x, y, "#09050e", primary, 1.27, 3);
      identityEllipse(headX, headY, 21, 22, 0, "#0a0610", primary, 3, 1, 12);
      premiumPolygon([[headX - 23, headY - 7], [headX + 23, headY - 7], [headX + 16, headY + 12], [headX - 16, headY + 12]], "#120a1e", primary, 3, 1, 10);
      drawIdentityEyes(headX, headY - 1, secondary, "sharp", 0.85);
      for (let mane = 0; mane < 5; mane++) {
        skinSpike(
          headX - dir * 13,
          headY - 18 + mane * 7,
          headX - dir * (31 + mane * 2),
          headY - 25 + mane * 7,
          headX - dir * 9,
          headY - 9 + mane * 7,
          primary,
          0.88
        );
      }
      skinSpike(headX - 10, headY - 18, headX - 16, headY - 41, headX, headY - 23, primary, 0.94);
      skinSpike(headX + 10, headY - 18, headX + 16, headY - 41, headX, headY - 23, primary, 0.94);
      skinMiniHorseshoe(x, y - 54, secondary, 0.5);
      break;
    }
    case "cosmic_reaper": {
      drawPremiumTorso(x, y, "#01070b", primary, 1.1, 0.94);
      drawIdentityHood(headX, headY, "#01070b", primary, true);
      drawIdentitySkullFace(headX, headY + 1, "#c8fbff", "#06151a", primary);
      identityCircle(x, y - 55, 11, "#001018", primary, 3, 1, 13);
      skinSmallStar(x, y - 55, "#ffffff", 6);
      for (const side of [-1, 1]) {
        skinSmallStar(x + side * 21, y - 43, side < 0 ? primary : "#9c5cff", 4);
      }
      break;
    }
    case "neon_overlord": {
      drawPremiumTorso(x, y, "#001419", primary, 1.38, 1);
      drawPremiumShoulders(x, y, primary, secondary, "heavy", 1.42);
      premiumPolygon(
        [[headX - 26, headY + 16], [headX - 23, headY - 22], [headX, headY - 31], [headX + 23, headY - 22], [headX + 26, headY + 16]],
        "#001419",
        primary,
        4,
        1,
        14
      );
      identityRect(headX - 20, headY - 6, 40, 13, 4, "#001015", secondary, 3, 1, 13);
      drawIdentityEyes(headX, headY - 1, "#ffffff", "single", 0.82);
      premiumPolygon(
        [[headX - 25, headY - 20], [headX - 31, headY - 46], [headX - 10, headY - 33], [headX, headY - 54], [headX + 10, headY - 33], [headX + 31, headY - 46], [headX + 25, headY - 20]],
        primary,
        secondary,
        3,
        1,
        14
      );
      identityCircle(x, y - 54, 12, "#001015", secondary, 3, 1, 14);
      drawPremiumEmblem(x, y, "overlord", primary, secondary);
      break;
    }
    case "rainbow_madness": {
      const rainbow = ["#ff304f", "#ff8c32", "#ffe600", "#00ff84", "#00e5ff", "#9c5cff", "#ff36dc"];
      drawPremiumTorso(x, y, "#141018", "#ffffff", 1.12, 0.95);
      drawIdentitySpikyHair(headX, headY, dir, rainbow[Math.floor(phase) % rainbow.length], "#ffffff", 1.17, true);
      identityEllipse(headX, headY, 18, 18, 0, "#221828", "#ffffff", 2.5, 1, 10);
      identityCircle(headX - 8, headY - 3, 5, rainbow[0], "#ffffff", 1.5, 1, 10);
      identityCircle(headX + 8, headY - 3, 5, rainbow[4], "#ffffff", 1.5, 1, 10);
      ctx.save();
      ctx.strokeStyle = rainbow[2];
      ctx.lineWidth = 3;
      ctx.shadowColor = rainbow[6];
      ctx.shadowBlur = premiumShadowBlur(8);
      ctx.beginPath();
      ctx.arc(headX, headY + 4, 10, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.restore();
      rainbow.slice(0, 5).forEach((color, index) => {
        identityRect(x - 24 + index * 10, y - 69, 8, 37, 2, color, "#ffffff", 1, 0.92, 7);
      });
      break;
    }
    case "kawaii_destroyer": {
      drawPremiumTorso(x, y, "#ff9fe8", "#ffffff", 1.17, 0.96);
      drawBunnyEars(headX, headY, "#ff9fe8");
      identityCircle(headX, headY, 18, "#ffd9f4", primary, 2.5, 1, 10);
      identityCircle(headX - 8, headY - 3, 4, "#211026", "#211026", 0, 1, 5);
      identityCircle(headX + 8, headY - 3, 4, "#211026", "#211026", 0, 1, 5);
      identityCircle(headX - 13, headY + 7, 4, "#ff4f8b", "#ff4f8b", 0, 0.68, 6);
      identityCircle(headX + 13, headY + 7, 4, "#ff4f8b", "#ff4f8b", 0, 0.68, 6);
      identityStroke([[headX - 5, headY + 8], [headX, headY + 11], [headX + 5, headY + 8]], "#211026", 2, 1, 3);
      identityRect(x - 31, y - 34, 62, 10, 5, "#ffd34a", "#ffffff", 2, 1, 9);
      identityCircle(x, y - 54, 10, "#ffffff", primary, 2, 1, 10);
      drawPremiumEmblem(x, y, "heart", primary, "#ffffff");
      break;
    }
    case "herd_guardian": {
      drawIdentityArmorPlates(x, y, "#3b2a04", primary, 1.3, 4);
      drawIdentityHorseHead(headX, headY, dir, "#5b410a", primary, "#fff8d2", true);
      drawIdentityShield(x, y, -dir, "#2b2008", primary, "horseshoe", 1.23);
      skinMiniHorseshoe(x, y - 54, "#ffffff", 0.5);
      identityStroke([[x - 25, y - 33], [x + 25, y - 33]], primary, 4, 0.9, 9);
      break;
    }
    case "red_glitch_king": {
      drawPremiumTorso(x, y, "#260006", primary, 1.46, 1);
      drawPremiumShoulders(x, y, primary, secondary, "heavy", 1.48);
      identityEllipse(headX, headY, 21, 21, 0, "#170004", primary, 4, 1, 15);
      identityRect(headX - 22, headY - 7, 44, 13, 2, "#030609", secondary, 3, 1, 14);
      drawIdentityEyes(headX, headY - 1, "#ffffff", "single", 0.9);
      premiumPolygon(
        [
          [headX - 29, headY - 18], [headX - 30, headY - 50], [headX - 13, headY - 35],
          [headX, headY - 60], [headX + 13, headY - 35], [headX + 30, headY - 50],
          [headX + 29, headY - 18]
        ],
        primary,
        secondary,
        4,
        1,
        16
      );
      identityRect(x - 29, y - 68, 58, 34, 3, "#160004", primary, 3, 1, 12);
      drawPremiumEmblem(x, y, "glitch_crown", primary, secondary);
      drawIdentityGlitchChunks(x, y, primary, secondary, 7, 0.72);
      break;
    }
    case "nightmare_clown": {
      drawPremiumTorso(x, y, "#190006", primary, 1.34, 0.98);
      drawPremiumShoulders(x, y, primary, secondary, "spike", 1.35);
      drawIdentityClownFace(headX, headY, primary, secondary, true);
      for (const side of [-1, 1]) {
        premiumPolygon(
          [[headX + side * 7, headY - 17], [headX + side * 37, headY - 49], [headX + side * 30, headY - 7]],
          side < 0 ? primary : "#f2f2f2",
          "#000000",
          3,
          1,
          11
        );
        identityCircle(headX + side * 37, headY - 49, 6, side < 0 ? "#ffffff" : primary, "#000000", 2, 1, 8);
      }
      for (let stripe = 0; stripe < 4; stripe++) {
        identityRect(x - 24 + stripe * 13, y - 69, 10, 39, 1, stripe % 2 ? "#f0e6e6" : primary, "#000000", 1, 0.9, 7);
      }
      identityCircle(x, y - 53, 6, "#ffffff", primary, 2, 1, 8);
      identityCircle(x, y - 38, 6, primary, "#ffffff", 2, 1, 8);
      break;
    }
    case "celestial_samurai": {
      drawIdentityArmorPlates(x, y, "#1a1730", primary, 1.42, 5);
      drawIdentitySamuraiHelmet(headX, headY, primary, "#ffffff", "crescent");
      identityEllipse(headX, headY + 2, 15, 16, 0, "#090816", primary, 2, 1, 10);
      drawIdentityEyes(headX, headY - 1, "#ffffff", "sharp", 0.84);
      skinSmallStar(x, y - 55, "#ffffff", 9);
      for (const side of [-1, 1]) {
        identityCircle(x + side * 25, y - 55, 6, side < 0 ? "#9c5cff" : "#ffd34a", "#ffffff", 1.5, 0.95, 9);
        identityRect(x + side * 28 - 8, y - 42, 16, 25, 3, "#17142a", primary, 2, 0.92, 8);
      }
      break;
    }
    case "golden_mustang": {
      drawIdentityArmorPlates(x, y, "#664500", "#fff8d2", 1.43, 4);
      drawIdentityHorseHead(headX, headY, dir, "#d89d16", "#fff8d2", primary, true);
      for (const side of [-1, 1]) {
        identityRect(x + side * 29 - 8, y - 52, 16, 31, 4, "#805a08", "#fff8d2", 2.5, 0.96, 10);
      }
      skinMiniHorseshoe(x, y - 54, "#fff8d2", 0.55);
      identityStroke([[x - 27, y - 34], [x + 27, y - 34]], primary, 4, 0.95, 10);
      break;
    }
    case "the_final_boss": {
      drawPremiumTorso(x, y, "#220006", primary, 1.62, 1);
      drawPremiumShoulders(x, y, primary, secondary, "spike", 1.68);
      identityEllipse(headX, headY, 24, 23, 0, "#120003", primary, 4, 1, 16);
      for (const side of [-1, 1]) {
        skinSpike(headX + side * 10, headY - 18, headX + side * 29, headY - 58, headX + side * 2, headY - 29, secondary, 1);
        skinSpike(headX + side * 19, headY - 8, headX + side * 45, headY - 33, headX + side * 23, headY + 5, primary, 1);
      }
      premiumPolygon(
        [[headX - 29, headY - 18], [headX - 23, headY - 48], [headX, headY - 31], [headX + 23, headY - 48], [headX + 29, headY - 18]],
        primary,
        "#ffffff",
        3,
        1,
        16
      );
      drawIdentityEyes(headX, headY - 4, "#ffffff", "sharp", 0.92);
      identityCircle(headX, headY + 7, 4, primary, "#ffffff", 1, 1, 10);
      identityCircle(x, y - 55, 15, "#020002", secondary, 4, 1, 16);
      identityCircle(x, y - 55, 7, "#ffffff", primary, 2, 1, 13);
      for (const side of [-1, 1]) {
        identityRect(x + side * 37 - 10, y - 58, 20, 38, 4, "#2d0009", side < 0 ? secondary : primary, 3, 0.98, 11);
        skinSpike(x + side * 31, y - 26, x + side * 51, y - 3, x + side * 21, y - 13, primary, 0.96);
      }
      break;
    }
  }

  ctx.restore();
  premiumIdentityDetail = previousIdentityDetail;
}

function drawHighTierBackLayer(player, skinId, x, y, dir, headX, headY, bodyTopY, bodyBottomY, style) {
  const visual = getHighTierVisual(skinId);
  if (!visual) return;

  const palette = getPremiumPalette(style, visual);
  const primary = palette.primary;
  const secondary = palette.secondary;
  const phase = performance.now() / 900;
  const centerY = y - 62;

  ctx.save();

  drawPremiumIdentityBack(player, skinId, x, y, dir, headX, headY, style);
  ctx.restore();
  return;

  if (visual.tier === "epic") {
    skinGlowOrb(x, centerY, 52, primary, 0.08);
  }

  if (visual.tier === "legendary") {
    skinGlowOrb(x, centerY, 66, primary, 0.12);
    drawPremiumRuneWheel(x, centerY, 64, primary, secondary, phase * 0.24, 7);
  }

  if (visual.tier === "mystic") {
    skinGlowOrb(x, centerY, 78, primary, 0.16);
    drawPremiumRuneWheel(x, centerY, 73, primary, secondary, phase * 0.3, 8);
    drawPremiumRays(x, centerY, 78, secondary, 8, -phase * 0.16, 20);
  }

  switch (visual.armor) {
    case "samurai":
      drawSpeedLines(x - dir * 8, y - 68, primary);
      break;
    case "spirit_samurai":
      drawPremiumRuneWheel(x, centerY, 50, secondary, primary, -phase * 0.22, 6);
      break;
    case "demon":
    case "glitch":
      drawPremiumRays(x, centerY, 54, secondary, 6, phase * 0.2, 18);
      break;
    case "ninja":
    case "assassin":
      drawPremiumShadowCape(x, y, dir, "#080812", primary, 0.9);
      break;
    case "storm":
      drawLightning(x - 42, y - 82, secondary);
      drawLightning(x + 46, y - 42, primary);
      break;
    case "cyber":
    case "holo":
      drawPremiumTechFrame(x, centerY, primary, secondary, phase, 0.9);
      break;
    case "mecha":
      drawPremiumTechFrame(x, centerY, secondary, primary, phase, 1.05);
      break;
    case "void":
      skinGlowOrb(x, centerY, 76, "#000000", 0.46);
      drawPremiumRuneWheel(x, centerY, 62, primary, secondary, -phase * 0.25, 7);
      break;
    case "bone":
      drawPremiumRays(x, centerY, 50, secondary, 8, phase * 0.08, 14);
      break;
    case "vampire":
      drawPremiumShadowCape(x, y, dir, "#280006", primary, 1.05);
      break;
    case "beast":
      drawPremiumRays(x, centerY, 50, primary, 7, phase * 0.12, 16);
      break;
    case "angel":
      drawWings(x, y - 58, "#fff6c8", "angel_wings");
      drawPremiumRays(x, centerY, 64, secondary, 12, phase * 0.06, 18);
      break;
    case "fallen_angel":
      drawWings(x, y - 58, "#1c112d", "fallen_wings");
      drawPremiumShadowCape(x, y, dir, "#08030f", primary, 1.18);
      drawPremiumRays(x, centerY, 72, primary, 8, phase * 0.1, 22);
      break;
    case "champion":
      drawPremiumRays(x, centerY, 68, secondary, 12, phase * 0.05, 22);
      break;
    case "emperor":
      drawPremiumShadowCape(x, y, dir, "#43000d", secondary, 1.15);
      break;
    case "dragon":
      drawWings(x, y - 58, primary, "dragon_wings");
      drawPremiumRays(x, centerY, 70, primary, 9, phase * 0.13, 24);
      break;
    case "shadow_horseman":
      drawPremiumShadowCape(x, y, dir, "#090412", primary, 1.05);
      skinMiniHorseshoe(x, y - 122, secondary, 1.05);
      break;
    case "cosmic_reaper":
      drawPremiumShadowCape(x, y, dir, "#02070c", primary, 1.2);
      drawStars(x, y - 84, primary);
      break;
    case "overlord":
      drawPremiumTechFrame(x, centerY, primary, secondary, phase, 1.15);
      break;
    case "rainbow":
      drawRainbowOrbit(x, centerY);
      break;
    case "kawaii":
      drawPremiumOrbitNodes(x, centerY, 72, 44, primary, 6, phase, 5);
      break;
    case "herd_guardian":
      skinMiniHorseshoe(x, y - 124, primary, 1.25);
      drawPremiumRays(x, centerY, 70, secondary, 10, phase * 0.05, 20);
      break;
    case "glitch_king":
      drawPremiumTechFrame(x, centerY, secondary, primary, phase * 1.5, 1.2);
      drawGlitchBars(x, y - 72, primary);
      break;
    case "nightmare":
      drawPremiumShadowCape(x, y, dir, "#160006", primary, 1.25);
      drawPremiumRays(x, centerY, 76, secondary, 7, phase * 0.14, 30);
      break;
    case "celestial":
      drawPremiumRuneWheel(x, centerY, 84, secondary, primary, phase * 0.18, 14);
      drawStars(x, y - 86, primary);
      break;
    case "mustang":
      skinMiniHorseshoe(x, y - 126, secondary, 1.35);
      drawPremiumRays(x, centerY, 80, primary, 12, phase * 0.06, 24);
      break;
    case "final_boss":
      drawPremiumTechFrame(x, centerY, primary, secondary, phase * 1.4, 1.35);
      drawPremiumRays(x, centerY, 88, secondary, 12, -phase * 0.22, 34);
      break;
  }

  ctx.restore();
}

function drawPremiumTorso(x, y, primary, secondary, bulk = 1, alpha = 0.72) {
  const shoulder = 27 * bulk;
  const waist = 18 * bulk;

  premiumPolygon(
    [
      [x - shoulder, y - 75],
      [x + shoulder, y - 75],
      [x + waist, y - 31],
      [x - waist, y - 31]
    ],
    "rgba(5,7,12,0.92)",
    primary,
    3,
    alpha,
    8
  );

  ctx.save();
  ctx.strokeStyle = secondary;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = secondary;
  ctx.shadowBlur = premiumShadowBlur(7);
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x, y - 72);
  ctx.lineTo(x, y - 35);
  ctx.moveTo(x - shoulder + 5, y - 67);
  ctx.lineTo(x + shoulder - 5, y - 67);
  ctx.moveTo(x - waist + 3, y - 39);
  ctx.lineTo(x + waist - 3, y - 39);
  ctx.stroke();
  ctx.restore();
}

function drawPremiumShoulders(x, y, primary, secondary, type = "plate", scale = 1) {
  const width = type === "heavy" ? 30 : type === "spike" ? 27 : 24;
  const height = type === "heavy" ? 16 : 12;

  for (const side of [-1, 1]) {
    const sx = x + side * 25 * scale;

    if (type === "spike") {
      premiumPolygon(
        [[sx - side * 5, y - 69], [sx + side * width * scale, y - 78], [sx + side * 14, y - 55]],
        primary,
        secondary,
        2,
        0.82,
        13
      );
    } else {
      ctx.save();
      ctx.fillStyle = "rgba(7,9,15,0.92)";
      ctx.strokeStyle = primary;
      ctx.lineWidth = type === "heavy" ? 4 : 3;
      ctx.shadowColor = secondary;
      ctx.shadowBlur = premiumShadowBlur(8);
      ctx.globalAlpha = 0.82;
      roundRect(ctx, sx - width / 2, y - 75, width, height, 5, true, true);
      ctx.restore();
    }
  }
}

function drawPremiumEmblem(x, y, emblem, primary, secondary) {
  const ey = y - 55;

  ctx.save();
  ctx.strokeStyle = secondary;
  ctx.fillStyle = primary;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = secondary;
  ctx.shadowBlur = premiumShadowBlur(7);

  if (["slash", "claw"].includes(emblem)) {
    ctx.beginPath();
    ctx.moveTo(x - 8, ey + 8);
    ctx.lineTo(x + 8, ey - 8);
    ctx.moveTo(x - 2, ey + 9);
    ctx.lineTo(x + 11, ey - 4);
    ctx.stroke();
  } else if (["bolt", "glitch", "glitch_crown"].includes(emblem)) {
    premiumPolygon(
      [[x - 4, ey - 11], [x + 8, ey - 3], [x + 1, ey], [x + 6, ey + 11], [x - 9, ey + 1], [x - 2, ey - 2]],
      primary,
      secondary,
      2,
      0.95,
      10
    );
  } else if (["rose", "heart"].includes(emblem)) {
    ctx.beginPath();
    ctx.arc(x - 5, ey - 2, 5, 0, Math.PI * 2);
    ctx.arc(x + 5, ey - 2, 5, 0, Math.PI * 2);
    ctx.moveTo(x - 10, ey);
    ctx.lineTo(x, ey + 11);
    ctx.lineTo(x + 10, ey);
    ctx.fill();
  } else if (["crown", "blood_crown", "overlord"].includes(emblem)) {
    premiumPolygon(
      [[x - 10, ey + 7], [x - 9, ey - 6], [x - 3, ey], [x, ey - 9], [x + 4, ey], [x + 10, ey - 6], [x + 9, ey + 7]],
      primary,
      secondary,
      2,
      0.95,
      10
    );
  } else if (["horseshoe", "mustang"].includes(emblem)) {
    skinMiniHorseshoe(x, ey, secondary, 0.38);
  } else if (["star", "sun", "halo"].includes(emblem)) {
    skinSmallStar(x, ey, secondary, 7);
  } else if (emblem === "bone") {
    ctx.beginPath();
    ctx.moveTo(x - 8, ey - 8);
    ctx.lineTo(x + 8, ey + 8);
    ctx.moveTo(x + 8, ey - 8);
    ctx.lineTo(x - 8, ey + 8);
    ctx.stroke();
  } else if (["void", "spirit", "holo", "core"].includes(emblem)) {
    ctx.beginPath();
    ctx.arc(x, ey, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, ey, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (["demon", "dragon", "fang", "nightmare", "boss"].includes(emblem)) {
    premiumPolygon(
      [[x - 9, ey - 7], [x, ey - 1], [x + 9, ey - 7], [x + 5, ey + 9], [x, ey + 5], [x - 5, ey + 9]],
      primary,
      secondary,
      2,
      0.95,
      10
    );
  } else if (["circuit", "mask", "rainbow", "broken_halo"].includes(emblem)) {
    ctx.strokeRect(x - 8, ey - 7, 16, 14);
    ctx.beginPath();
    ctx.moveTo(x - 13, ey);
    ctx.lineTo(x - 8, ey);
    ctx.moveTo(x + 8, ey);
    ctx.lineTo(x + 13, ey);
    ctx.stroke();
  }

  ctx.restore();
}

function drawHighTierArmorLayer(player, skinId, x, y, dir, headX, headY, bodyTopY, bodyBottomY, style) {
  const visual = getHighTierVisual(skinId);
  if (!visual) return;

  const palette = getPremiumPalette(style, visual);
  const primary = palette.primary;
  const secondary = palette.secondary;

  ctx.save();

  drawPremiumIdentityFront(player, skinId, x, y, dir, headX, headY, style);
  ctx.restore();
  return;

  if (["samurai", "spirit_samurai", "celestial"].includes(visual.armor)) {
    drawPremiumTorso(x, y, primary, secondary, visual.tier === "mystic" ? 1.22 : 1.02, 0.78);
    drawPremiumShoulders(x, y, primary, secondary, visual.tier === "mystic" ? "heavy" : "plate", 1.08);

    for (let i = -1; i <= 1; i++) {
      ctx.strokeStyle = i === 0 ? secondary : primary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + i * 12, y - 40);
      ctx.lineTo(x + i * 15, y - 24);
      ctx.stroke();
    }
  } else if (["demon", "glitch", "glitch_king", "nightmare", "dragon", "final_boss"].includes(visual.armor)) {
    const bulk = visual.tier === "mystic" ? 1.34 : visual.tier === "legendary" ? 1.18 : 1.04;
    drawPremiumTorso(x, y, primary, secondary, bulk, 0.82);
    drawPremiumShoulders(x, y, primary, secondary, "spike", bulk);
  } else if (["ninja", "assassin", "vampire", "fallen_angel", "cosmic_reaper"].includes(visual.armor)) {
    drawPremiumTorso(x, y, primary, secondary, visual.tier === "legendary" ? 1.12 : 0.94, 0.72);
    drawPremiumShoulders(x, y, primary, secondary, "plate", 0.88);

    ctx.strokeStyle = secondary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 17, y - 71);
    ctx.lineTo(x + 17, y - 34);
    ctx.moveTo(x + 17, y - 71);
    ctx.lineTo(x - 17, y - 34);
    ctx.stroke();
  } else if (["storm", "cyber", "holo", "overlord", "rainbow"].includes(visual.armor)) {
    const bulk = visual.tier === "legendary" ? 1.18 : 1;
    drawPremiumTorso(x, y, primary, secondary, bulk, 0.74);
    drawPremiumShoulders(x, y, primary, secondary, visual.tier === "legendary" ? "heavy" : "plate", bulk);

    ctx.save();
    ctx.strokeStyle = secondary;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    roundRect(ctx, x - 19 * bulk, y - 67, 38 * bulk, 28, 5, false, true);
    ctx.setLineDash([]);
    ctx.restore();
  } else if (["mecha", "bone", "champion", "emperor", "shadow_horseman", "herd_guardian", "mustang"].includes(visual.armor)) {
    const bulk = visual.tier === "mystic" ? 1.34 : visual.tier === "legendary" ? 1.2 : 1.08;
    drawPremiumTorso(x, y, primary, secondary, bulk, 0.86);
    drawPremiumShoulders(x, y, primary, secondary, "heavy", bulk);
  } else if (visual.armor === "void") {
    drawPremiumTorso(x, y, "#050008", primary, 1.04, 0.9);
    drawPremiumShoulders(x, y, primary, secondary, "spike", 1.04);
    skinGlowOrb(x, y - 55, 22, "#000000", 0.76);
  } else if (visual.armor === "beast") {
    drawPremiumTorso(x, y, "#2b170d", primary, 1.12, 0.84);
    drawPremiumShoulders(x, y, primary, secondary, "spike", 1.15);

    for (const side of [-1, 1]) {
      skinSpike(x + side * 20, y - 44, x + side * 34, y - 58, x + side * 25, y - 29, secondary, 0.75);
    }
  } else if (visual.armor === "angel") {
    drawPremiumTorso(x, y, "#ffffff", secondary, 1.12, 0.78);
    drawPremiumShoulders(x, y, secondary, "#ffffff", "heavy", 1.08);
  } else if (visual.armor === "kawaii") {
    drawPremiumTorso(x, y, "#ff9fe8", secondary, 1.12, 0.78);
    drawPremiumShoulders(x, y, primary, secondary, "plate", 1.08);
  }

  if (visual.armor === "bone") {
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 3;
    ctx.shadowColor = secondary;
    ctx.shadowBlur = premiumShadowBlur(8);

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x, y - 59 + i * 8, 13 - i * 2, 0.15, Math.PI - 0.15);
      ctx.stroke();
    }
  }

  if (visual.armor === "emperor") {
    ctx.fillStyle = secondary;
    ctx.shadowColor = secondary;
    ctx.shadowBlur = premiumShadowBlur(10);
    ctx.fillRect(x - 26, y - 73, 52, 5);
    ctx.fillRect(x - 18, y - 36, 36, 5);
  }

  if (["shadow_horseman", "herd_guardian", "mustang"].includes(visual.armor)) {
    skinMiniHorseshoe(x, y - 55, secondary, visual.tier === "mystic" ? 0.5 : 0.42);
  }

  if (visual.armor === "rainbow") {
    const colors = ["#ff304f", "#ffd34a", "#00e5ff", "#ff36dc"];
    colors.forEach((color, index) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 18 + index * 10, y - 70);
      ctx.lineTo(x - 12 + index * 8, y - 36);
      ctx.stroke();
    });
  }

  drawPremiumEmblem(x, y, visual.emblem, primary, secondary);
  ctx.restore();
}

/* ---------- Individual-Skins: Back ---------- */

function drawSkinStreetFighterBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 45, 50, accent, 0.08);
}

function drawSkinHoodieShadowBack(x, y, dir, accent) {
  skinRing(x, y - 62, 50, 16, accent, 4, 0.35);
  skinGlowOrb(x - dir * 18, y - 62, 58, "#120018", 0.2);
}

function drawSkinComicHeroBack(x, y, dir, accent) {
  drawCape(x, y - 74, dir, accent);
  skinCrossBladeAura(x, y - 58, dir, "#ffffff");
}

function drawSkinTinyGoblinBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 58, 42, accent, 0.10);
}

function drawSkinCuteBunnyBack(x, y, dir, accent) {
  skinRing(x, y - 85, 44, 16, accent, 3, 0.30);
}

function drawSkinBananaWarriorBack(x, y, dir, accent) {
  skinRing(x, y - 52, 50, 18, accent, 4, 0.32);
}

function drawSkinBloodBladeBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 62, 52, "#8b0015", 0.18);
}

function drawSkinToxicFighterBack(x, y, dir, accent) {
  skinRing(x, y - 38, 62, 18, accent, 5, 0.52);
  skinGlowOrb(x, y - 52, 46, accent, 0.12);
}

function drawSkinIceStickmanBack(x, y, dir, accent) {
  skinSpike(x - 46, y - 38, x - 28, y - 88, x - 14, y - 42, "#eaffff", 0.55);
  skinSpike(x + 46, y - 38, x + 28, y - 88, x + 14, y - 42, "#eaffff", 0.55);
}

function drawSkinFireRunnerBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 48, 50, "#ff7a1a", 0.18);
  skinSpike(x - 40, y - 20, x - 22, y - 88, x - 2, y - 20, "#ff7a1a", 0.72);
  skinSpike(x + 40, y - 20, x + 22, y - 88, x + 2, y - 20, "#ffd34a", 0.55);
}

function drawSkinStormSlasherBack(x, y, dir, accent) {
  drawLightning(x + dir * 18, y - 74, "#ffe600");
  skinRing(x, y - 62, 58, 20, "#33d8ff", 3, 0.35, Math.sin(performance.now() / 280) * 0.25);
}

function drawSkinShadowCatBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 62, 58, "#150020", 0.26);
  skinRing(x, y - 58, 46, 14, accent, 3, 0.30);
}

function drawSkinClownBladeBack(x, y, dir, accent) {
  skinRing(x, y - 52, 48, 14, "#ff304f", 3, 0.26);
}

function drawSkinPumpkinReaperBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 62, 52, "#ff8a00", 0.16);
  drawFireFlicker(x, y - 96);
}

function drawSkinPlagueDoctorBack(x, y, dir, accent) {
  skinRing(x, y - 54, 58, 18, "#c8d0d8", 3, 0.22);
}

function drawSkinArcadeKnightBack(x, y, dir, accent) {
  skinRing(x, y - 58, 56, 18, "#ff00f7", 3, 0.38);
  skinRing(x, y - 58, 40, 12, "#00e5ff", 2, 0.42);
}

function drawSkinAnimeSwordsmanBack(x, y, dir, accent) {
  drawSpeedLines(x - dir * 10, y - 68, accent);
}

function drawSkinDemonStudentBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 58, 56, "#4d0038", 0.24);
  skinSpike(x - 42, y - 30, x - 62, y - 78, x - 20, y - 48, "#ff304f", 0.55);
  skinSpike(x + 42, y - 30, x + 62, y - 78, x + 20, y - 48, "#ff304f", 0.55);
}

function drawSkinMaskedNinjaBack(x, y, dir, accent) {
  skinRing(x, y - 50, 58, 16, accent, 3, 0.22);
}

function drawSkinSpiritSamuraiBack(x, y, dir, accent) {
  skinRing(x, y - 78, 62, 18, accent, 4, 0.42);
  skinSmallStar(x - 42, y - 95, accent, 6);
  skinSmallStar(x + 48, y - 58, "#ffffff", 5);
}

function drawSkinThunderSenpaiBack(x, y, dir, accent) {
  drawLightning(x - dir * 34, y - 86, accent);
  skinRing(x, y - 62, 62, 20, accent, 3, 0.32);
}

function drawSkinRoseAssassinBack(x, y, dir, accent) {
  skinRing(x, y - 58, 48, 15, accent, 3, 0.22);
  drawRose(x - dir * 42, y - 92, accent);
}

function drawSkinCyberNinjaBack(x, y, dir, accent) {
  skinRing(x, y - 62, 62, 22, accent, 3, 0.46);
  drawHoloFrame(x, y - 66, accent);
}

function drawSkinGlitchDemonBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 62, 62, "#ff304f", 0.16);
  drawGlitchBars(x, y - 70, "#00e5ff");
}

function drawSkinMechaStickBack(x, y, dir, accent) {
  drawHoloFrame(x, y - 66, accent);
}

function drawSkinHoloBladeBack(x, y, dir, accent) {
  drawHoloFrame(x, y - 66, accent);
  skinRing(x, y - 62, 66, 22, accent, 2, 0.32);
}

function drawSkinVoidWalkerBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 58, 68, "#000000", 0.38);
  drawVoidRing(x, y - 55, accent);
}

function drawSkinBoneKnightBack(x, y, dir, accent) {
  skinRing(x, y - 54, 46, 15, accent, 3, 0.25);
}

function drawSkinVampireDuelistBack(x, y, dir, accent) {
  drawCape(x, y - 74, dir, "#d20d36");
  skinGlowOrb(x, y - 60, 50, "#3a0008", 0.18);
}

function drawSkinWerewolfRageBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 56, 55, "#b87945", 0.18);
}

function drawSkinAngelicGuardianBack(x, y, dir, accent) {
  drawWings(x, y - 58, "#fff6c8", "angel_wings");
  skinRing(x, y - 104, 46, 12, "#fff6c8", 4, 0.65);
}

function drawSkinFallenAngelBack(x, y, dir, accent) {
  drawWings(x, y - 58, "#1c112d", "fallen_wings");
  skinRing(x, y - 102, 50, 13, "#9c5cff", 4, 0.42);
}

function drawSkinGoldChampionBack(x, y, dir, accent) {
  skinRing(x, y - 72, 60, 18, accent, 4, 0.42);
  skinGlowOrb(x, y - 58, 50, accent, 0.10);
}

function drawSkinBloodEmperorBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 62, 64, "#c90025", 0.24);
  skinRing(x, y - 60, 60, 18, "#ffd34a", 3, 0.38);
}

function drawSkinDragonSoulBack(x, y, dir, accent) {
  drawWings(x, y - 58, accent, "dragon_wings");
  skinGlowOrb(x, y - 50, 58, "#ff6b00", 0.16);
}

function drawSkinShadowHorsemanBack(x, y, dir, accent) {
  drawHorseRing(x, y - 35, accent);
  skinGlowOrb(x, y - 58, 60, "#120018", 0.28);
}

function drawSkinCosmicReaperBack(x, y, dir, accent) {
  drawStars(x, y - 80, accent);
  skinRing(x, y - 62, 66, 23, accent, 3, 0.38, Math.sin(performance.now() / 420) * 0.2);
}

function drawSkinNeonOverlordBack(x, y, dir, accent) {
  drawHoloFrame(x, y - 66, accent);
  skinRing(x, y - 62, 74, 26, accent, 4, 0.45);
  skinRing(x, y - 62, 52, 18, "#ff00f7", 2, 0.36);
}

function drawSkinRainbowMadnessBack(x, y, dir, accent) {
  drawRainbowOrbit(x, y - 62);
}

function drawSkinKawaiiDestroyerBack(x, y, dir, accent) {
  skinRing(x, y - 74, 50, 16, "#ff9fe8", 3, 0.34);
  skinSmallStar(x - 48, y - 94, "#ffd34a", 7);
  skinSmallStar(x + 48, y - 48, "#ff9fe8", 7);
}

function drawSkinHerdGuardianBack(x, y, dir, accent) {
  skinMiniHorseshoe(x, y - 96, accent, 1.1);
  skinRing(x, y - 62, 64, 20, accent, 4, 0.40);
}

function drawSkinRedGlitchKingBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 62, 64, "#ff304f", 0.18);
  drawGlitchBars(x, y - 70, accent);
  skinRing(x, y - 62, 64, 20, "#00e5ff", 3, 0.30);
}

function drawSkinNightmareClownBack(x, y, dir, accent) {
  skinGlowOrb(x, y - 62, 68, "#30000a", 0.36);
  skinRing(x, y - 58, 55, 16, "#ff1747", 4, 0.38);
}

function drawSkinCelestialSamuraiBack(x, y, dir, accent) {
  skinRing(x, y - 92, 58, 15, "#ffffff", 4, 0.55);
  skinRing(x, y - 62, 76, 24, "#ffd34a", 3, 0.42);
  drawStars(x, y - 84, "#ffffff");
}

function drawSkinGoldenMustangBack(x, y, dir, accent) {
  skinMiniHorseshoe(x - 36, y - 94, accent, 0.9);
  skinMiniHorseshoe(x + 38, y - 52, accent, 0.75);
  skinRing(x, y - 58, 70, 21, accent, 4, 0.48);
}

function drawSkinTheFinalBossBack(x, y, dir, accent) {
  drawBossFrame(x, y - 70, accent);
  skinGlowOrb(x, y - 62, 72, "#ff003c", 0.22);
  skinRing(x, y - 62, 80, 26, "#ff003c", 5, 0.42);
  skinRing(x, y - 62, 58, 18, "#ffffff", 2, 0.24);
}

/* ---------- Individual-Skins: Front ---------- */

function drawSkinStreetFighterFront(headX, headY, x, y, dir, accent) {
  drawCap(headX, headY, accent);
  skinMaskEye(headX, headY - 3, "#ffffff");
}

function drawSkinHoodieShadowFront(headX, headY, x, y, dir, accent) {
  drawHood(headX, headY, accent);
  skinMaskEye(headX, headY - 3, "#111111");
}

function drawSkinComicHeroFront(headX, headY, x, y, dir, accent) {
  skinSmallStar(headX + dir * 28, headY - 32, "#ffd34a", 8);
}

function drawSkinTinyGoblinFront(headX, headY, x, y, dir, accent) {
  drawEars(headX, headY, accent, "goblin");
  skinMaskEye(headX, headY - 2, "#111111");
}

function drawSkinCuteBunnyFront(headX, headY, x, y, dir, accent) {
  drawBunnyEars(headX, headY, accent);
  skinSmallStar(headX + 30, headY + 10, "#ffffff", 4);
}

function drawSkinBananaWarriorFront(headX, headY, x, y, dir, accent) {
  drawBanana(headX, headY, accent);
  skinSmallStar(headX - 28, headY + 2, "#fff7b0", 5);
}

function drawSkinBloodBladeFront(headX, headY, x, y, dir, accent) {
  drawBloodMark(x, y - 64);
  skinMaskEye(headX, headY - 2, "#ff173b");
}

function drawSkinToxicFighterFront(headX, headY, x, y, dir, accent) {
  drawToxicRing(x, y - 50, accent);
  skinMaskEye(headX, headY - 2, "#b6ff00");
}

function drawSkinIceStickmanFront(headX, headY, x, y, dir, accent) {
  drawIceShards(x, y - 64);
  skinSmallStar(headX + dir * 28, headY - 22, "#eaffff", 6);
}

function drawSkinFireRunnerFront(headX, headY, x, y, dir, accent) {
  drawFireFlicker(x, y - 64);
  skinMaskEye(headX, headY - 2, "#ffd34a");
}

function drawSkinStormSlasherFront(headX, headY, x, y, dir, accent) {
  drawLightning(x, y - 72, "#ffe600");
  skinMaskEye(headX, headY - 2, "#33d8ff");
}

function drawSkinShadowCatFront(headX, headY, x, y, dir, accent) {
  drawEars(headX, headY, accent, "cat");
  skinMaskEye(headX, headY - 2, "#b06cff");
}

function drawSkinClownBladeFront(headX, headY, x, y, dir, accent) {
  drawClownHat(headX, headY, "#ff304f");
  skinMaskEye(headX, headY - 2, "#ffffff");
}

function drawSkinPumpkinReaperFront(headX, headY, x, y, dir, accent) {
  drawPumpkinFace(headX, headY);
  drawCrown(headX, headY - 20, "#ff8a00");
}

function drawSkinPlagueDoctorFront(headX, headY, x, y, dir, accent) {
  drawPlagueMask(headX, headY, accent, dir);
  skinMaskEye(headX, headY - 4, "#0b0b0b");
}

function drawSkinArcadeKnightFront(headX, headY, x, y, dir, accent) {
  drawPixelHelmet(headX, headY, accent);
  skinMaskEye(headX, headY - 2, "#ff00f7");
}

function drawSkinAnimeSwordsmanFront(headX, headY, x, y, dir, accent) {
  drawSpeedLines(x, y - 65, accent);
  skinSmallStar(headX + dir * 26, headY - 26, "#ffffff", 6);
}

function drawSkinDemonStudentFront(headX, headY, x, y, dir, accent) {
  drawHorns(headX, headY, "#ff304f");
  skinMaskEye(headX, headY - 2, "#ffd6ff");
}

function drawSkinMaskedNinjaFront(headX, headY, x, y, dir, accent) {
  drawNinjaMask(headX, headY);
  skinMaskEye(headX, headY - 3, accent);
}

function drawSkinSpiritSamuraiFront(headX, headY, x, y, dir, accent) {
  drawSamuraiHelmet(headX, headY, accent);
  skinSmallStar(headX + dir * 32, headY - 30, "#ffffff", 6);
}

function drawSkinThunderSenpaiFront(headX, headY, x, y, dir, accent) {
  drawLightning(x, y - 72, accent);
  drawSamuraiHelmet(headX, headY, "#ffe600");
}

function drawSkinRoseAssassinFront(headX, headY, x, y, dir, accent) {
  drawRose(x - 28, y - 82, accent);
  skinMaskEye(headX, headY - 2, "#ff4f8b");
}

function drawSkinCyberNinjaFront(headX, headY, x, y, dir, accent) {
  drawNinjaMask(headX, headY);
  drawHoloFrame(x, y - 66, accent);
  skinMaskEye(headX, headY - 3, accent);
}

function drawSkinGlitchDemonFront(headX, headY, x, y, dir, accent) {
  drawHorns(headX, headY, "#00e5ff");
  drawGlitchBars(x, y - 70, accent);
  skinMaskEye(headX, headY - 2, "#00e5ff");
}

function drawSkinMechaStickFront(headX, headY, x, y, dir, accent) {
  drawMechaArmor(x, y - 54, accent);
  skinMaskEye(headX, headY - 2, "#00e5ff");
}

function drawSkinHoloBladeFront(headX, headY, x, y, dir, accent) {
  drawHoloFrame(x, y - 66, accent);
  skinSmallStar(headX + dir * 30, headY - 24, "#ffffff", 5);
}

function drawSkinVoidWalkerFront(headX, headY, x, y, dir, accent) {
  drawVoidRing(x, y - 55, accent);
  skinMaskEye(headX, headY - 2, "#cbb2ff");
}

function drawSkinBoneKnightFront(headX, headY, x, y, dir, accent) {
  drawBoneArmor(x, y - 56, accent);
  skinMaskEye(headX, headY - 2, "#000000");
}

function drawSkinVampireDuelistFront(headX, headY, x, y, dir, accent) {
  drawCrown(headX, headY - 20, "#d20d36");
  skinMaskEye(headX, headY - 2, "#ffffff");
}

function drawSkinWerewolfRageFront(headX, headY, x, y, dir, accent) {
  drawEars(headX, headY, accent, "wolf");
  skinMaskEye(headX, headY - 2, "#ffd7b4");
}

function drawSkinAngelicGuardianFront(headX, headY, x, y, dir, accent) {
  skinSmallStar(headX - 28, headY - 28, "#fff6c8", 7);
  skinSmallStar(headX + 30, headY - 20, "#ffffff", 5);
}

function drawSkinFallenAngelFront(headX, headY, x, y, dir, accent) {
  drawHorns(headX, headY, "#1c112d");
  skinMaskEye(headX, headY - 2, "#9c5cff");
}

function drawSkinGoldChampionFront(headX, headY, x, y, dir, accent) {
  drawCrown(headX, headY - 22, accent);
  skinSmallStar(headX + dir * 30, headY - 24, "#ffffff", 6);
}

function drawSkinBloodEmperorFront(headX, headY, x, y, dir, accent) {
  drawCrown(headX, headY - 22, "#ffd34a");
  drawBloodMark(x, y - 64);
  skinMaskEye(headX, headY - 2, "#ffd6dd");
}

function drawSkinDragonSoulFront(headX, headY, x, y, dir, accent) {
  drawHorns(headX, headY, accent);
  drawFireFlicker(x, y - 64);
  skinMaskEye(headX, headY - 2, "#fff0c6");
}

function drawSkinShadowHorsemanFront(headX, headY, x, y, dir, accent) {
  skinMiniHorseshoe(headX, headY - 28, accent, 0.75);
  skinMaskEye(headX, headY - 2, accent);
}

function drawSkinCosmicReaperFront(headX, headY, x, y, dir, accent) {
  drawStars(x, y - 80, accent);
  drawCrown(headX, headY - 22, accent);
}

function drawSkinNeonOverlordFront(headX, headY, x, y, dir, accent) {
  drawCrown(headX, headY - 22, accent);
  drawHoloFrame(x, y - 66, accent);
  skinMaskEye(headX, headY - 2, "#ffffff");
}

function drawSkinRainbowMadnessFront(headX, headY, x, y, dir, accent) {
  skinSmallStar(headX - 34, headY - 26, "#00e5ff", 6);
  skinSmallStar(headX + 34, headY - 18, "#ff36dc", 6);
}

function drawSkinKawaiiDestroyerFront(headX, headY, x, y, dir, accent) {
  drawKawaii(x, y - 75);
  drawBunnyEars(headX, headY, "#ff9fe8");
}

function drawSkinHerdGuardianFront(headX, headY, x, y, dir, accent) {
  skinMiniHorseshoe(headX, headY - 28, accent, 0.8);
  drawCrown(headX, headY - 22, accent);
}

function drawSkinRedGlitchKingFront(headX, headY, x, y, dir, accent) {
  drawCrown(headX, headY - 22, "#00e5ff");
  drawGlitchBars(x, y - 70, accent);
  skinMaskEye(headX, headY - 2, "#00e5ff");
}

function drawSkinNightmareClownFront(headX, headY, x, y, dir, accent) {
  drawClownHat(headX, headY, "#ff1747");
  drawHorns(headX, headY, "#ffffff");
  skinMaskEye(headX, headY - 2, "#ff1747");
}

function drawSkinCelestialSamuraiFront(headX, headY, x, y, dir, accent) {
  drawSamuraiHelmet(headX, headY, "#ffd34a");
  drawCrown(headX, headY - 28, "#ffffff");
  skinSmallStar(headX + dir * 36, headY - 28, "#ffd34a", 7);
}

function drawSkinGoldenMustangFront(headX, headY, x, y, dir, accent) {
  drawCrown(headX, headY - 22, accent);
  skinMiniHorseshoe(headX + dir * 32, headY - 14, accent, 0.65);
  skinMaskEye(headX, headY - 2, "#fff8d2");
}

function drawSkinTheFinalBossFront(headX, headY, x, y, dir, accent) {
  drawCrown(headX, headY - 24, accent);
  drawHorns(headX, headY, "#ffffff");
  drawGlitchBars(x, y - 70, accent);
  skinMaskEye(headX, headY - 2, "#ffffff");
}

function drawCape(x, y, dir, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.55;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(x - dir * 8, y);
  ctx.lineTo(x - dir * 55, y + 20);
  ctx.lineTo(x - dir * 38, y + 90);
  ctx.lineTo(x - dir * 4, y + 55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawWings(x, y, color, type) {
  ctx.save();
  ctx.fillStyle = type === "fallen_wings" ? "#1c112d" : color;
  ctx.globalAlpha = type === "fallen_wings" ? 0.7 : 0.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;

  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.lineTo(x - 75, y - 20);
  ctx.lineTo(x - 48, y + 60);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + 12, y);
  ctx.lineTo(x + 75, y - 20);
  ctx.lineTo(x + 48, y + 60);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawBossFrame(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  roundRect(ctx, x - 52, y - 58, 104, 138, 18, false, true);
  ctx.restore();
}

function drawVoidRing(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.ellipse(x, y, 58, 22, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawHoloFrame(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 5]);
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  roundRect(ctx, x - 42, y - 62, 84, 128, 10, false, true);
  ctx.setLineDash([]);
  ctx.restore();
}

function drawHorseRing(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.ellipse(x, y, 60, 20, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawStars(x, y, color) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;

  const points = [
    [x - 50, y - 42],
    [x + 48, y - 22],
    [x - 18, y + 36],
    [x + 32, y + 46],
    [x + 2, y - 58]
  ];

  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCap(x, y, color) {
  ctx.save();
  ctx.fillStyle = "#111";
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  roundRect(ctx, x - 24, y - 25, 48, 15, 8, true, true);
  ctx.restore();
}

function drawHood(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, 28, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.restore();
}

function drawEars(x, y, color, type) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;

  const h = type === "wolf" ? 26 : 20;

  ctx.beginPath();
  ctx.moveTo(x - 18, y - 18);
  ctx.lineTo(x - 30, y - 18 - h);
  ctx.lineTo(x - 6, y - 23);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + 18, y - 18);
  ctx.lineTo(x + 30, y - 18 - h);
  ctx.lineTo(x + 6, y - 23);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawBunnyEars(x, y, color) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.95)";
  ctx.lineWidth = 12;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(x - 10, y - 24);
  ctx.lineTo(x - 18, y - 64);
  ctx.moveTo(x + 10, y - 24);
  ctx.lineTo(x + 18, y - 64);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 24);
  ctx.lineTo(x - 18, y - 64);
  ctx.moveTo(x + 10, y - 24);
  ctx.lineTo(x + 18, y - 64);
  ctx.stroke();

  ctx.restore();
}

function drawHorns(x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;

  ctx.beginPath();
  ctx.moveTo(x - 16, y - 20);
  ctx.lineTo(x - 34, y - 52);
  ctx.lineTo(x - 4, y - 28);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + 16, y - 20);
  ctx.lineTo(x + 34, y - 52);
  ctx.lineTo(x + 4, y - 28);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawClownHat(x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.ellipse(x, y - 30, 34, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 14, y - 39, 8, 18);
  ctx.fillRect(x + 6, y - 39, 8, 18);
  ctx.restore();
}

function drawPumpkinFace(x, y) {
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x - 8, y - 4, 4, 0, Math.PI * 2);
  ctx.arc(x + 8, y - 4, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 10, y + 9, 20, 4);
  ctx.restore();
}

function drawPlagueMask(x, y, color, dir) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(x + dir * 16, y - 2);
  ctx.lineTo(x + dir * 54, y + 8);
  ctx.lineTo(x + dir * 16, y + 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPixelHelmet(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.strokeRect(x - 28, y - 26, 56, 42);
  ctx.restore();
}

function drawNinjaMask(x, y) {
  ctx.save();
  ctx.fillStyle = "#000000";
  roundRect(ctx, x - 22, y - 10, 44, 12, 6, true, false);
  ctx.restore();
}

function drawSamuraiHelmet(x, y, color) {
  ctx.save();

  ctx.strokeStyle = "rgba(0,0,0,0.95)";
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.arc(x, y - 3, 31, Math.PI, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(x, y - 3, 31, Math.PI, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawLightning(x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(x - 54, y - 28);
  ctx.lineTo(x - 18, y - 28);
  ctx.lineTo(x - 38, y + 14);
  ctx.lineTo(x - 8, y + 14);
  ctx.lineTo(x - 62, y + 82);
  ctx.lineTo(x - 38, y + 28);
  ctx.lineTo(x - 68, y + 28);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRose(x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGlitchBars(x, y, color) {
  ctx.save();

  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fillRect(x - 52, y - 12, 75, 7);
  ctx.fillRect(x - 20, y + 34, 80, 7);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 44, y + 66, 65, 6);

  ctx.restore();
}

function drawMechaArmor(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  roundRect(ctx, x - 30, y - 12, 60, 45, 6, false, true);
  roundRect(ctx, x - 25, y + 42, 50, 38, 6, false, true);

  ctx.fillStyle = "#00e5ff";
  ctx.beginPath();
  ctx.arc(x + 24, y + 6, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBoneArmor(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  roundRect(ctx, x - 32, y - 18, 64, 50, 8, false, true);

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x - 8, y - 72, 4, 0, Math.PI * 2);
  ctx.arc(x + 8, y - 72, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCrown(x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(x - 30, y + 18);
  ctx.lineTo(x - 20, y - 16);
  ctx.lineTo(x - 8, y + 8);
  ctx.lineTo(x, y - 20);
  ctx.lineTo(x + 8, y + 8);
  ctx.lineTo(x + 20, y - 16);
  ctx.lineTo(x + 30, y + 18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawKawaii(x, y) {
  ctx.save();
  ctx.fillStyle = "#ff9fe8";
  ctx.shadowColor = "#ff9fe8";
  ctx.shadowBlur = 14;

  ctx.save();
  ctx.translate(x - 48, y - 22);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-7, -7, 14, 14);
  ctx.restore();

  ctx.save();
  ctx.translate(x + 50, y + 32);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-7, -7, 14, 14);
  ctx.restore();

  ctx.restore();
}
function drawRainbowOrbit(x, y) {
  const time = performance.now() / 650;

  const colors = [
    "#ff304f",
    "#ff8c00",
    "#ffd34a",
    "#00ff84",
    "#00e5ff",
    "#814dff",
    "#ff36dc"
  ];

  ctx.save();

  ctx.translate(x, y);

  for (let i = 0; i < colors.length; i++) {
    const angle = time + (i / colors.length) * Math.PI * 2;
    const radiusX = 58;
    const radiusY = 26;

    const px = Math.cos(angle) * radiusX;
    const py = Math.sin(angle) * radiusY;

    ctx.globalAlpha = 0.82;
    ctx.fillStyle = colors[i];
    ctx.shadowColor = colors[i];
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.arc(px, py, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.38;
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#ffffff";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 12;

  ctx.beginPath();
  ctx.ellipse(0, 0, 64, 30, Math.sin(time) * 0.25, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.42;
  ctx.lineWidth = 3;

  const ringGradient = ctx.createLinearGradient(-70, 0, 70, 0);
  ringGradient.addColorStop(0, "#ff304f");
  ringGradient.addColorStop(0.17, "#ff8c00");
  ringGradient.addColorStop(0.34, "#ffd34a");
  ringGradient.addColorStop(0.51, "#00ff84");
  ringGradient.addColorStop(0.68, "#00e5ff");
  ringGradient.addColorStop(0.85, "#814dff");
  ringGradient.addColorStop(1, "#ff36dc");

  ctx.strokeStyle = ringGradient;
  ctx.shadowColor = "#ff36dc";
  ctx.shadowBlur = 18;

  ctx.beginPath();
  ctx.ellipse(0, 0, 72, 36, -Math.sin(time) * 0.35, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
function drawRainbowStripes(x, y) {
  const colors = ["#ff304f", "#ffd34a", "#00ff84", "#00e5ff", "#a66cff"];

  ctx.save();
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  for (let i = 0; i < colors.length; i++) {
    ctx.strokeStyle = colors[i];
    ctx.shadowColor = colors[i];
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(x - 40, y - 28 + i * 16);
    ctx.lineTo(x + 40, y - 5 + i * 16);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBloodMark(x, y) {
  ctx.save();
  ctx.fillStyle = "#8b0015";
  ctx.shadowColor = "#ff304f";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x + 38, y + 16, 7, 0, Math.PI * 2);
  ctx.arc(x - 32, y + 42, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawIceShards(x, y) {
  const shards = [
    [x - 50, y + 20],
    [x + 46, y + 8],
    [x - 18, y + 68]
  ];

  ctx.save();
  ctx.fillStyle = "#eaffff";
  ctx.shadowColor = "#8cecff";
  ctx.shadowBlur = 12;

  for (const s of shards) {
    ctx.beginPath();
    ctx.moveTo(s[0], s[1] - 12);
    ctx.lineTo(s[0] + 8, s[1]);
    ctx.lineTo(s[0], s[1] + 12);
    ctx.lineTo(s[0] - 8, s[1]);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawFireFlicker(x, y) {
  ctx.save();
  ctx.fillStyle = "#ff7a1a";
  ctx.shadowColor = "#ff7a1a";
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(x - 45, y + 80);
  ctx.lineTo(x - 25, y + 22);
  ctx.lineTo(x - 5, y + 80);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawToxicRing(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.ellipse(x, y + 50, 50, 16, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBanana(x, y, color) {
  ctx.save();

  ctx.strokeStyle = "rgba(0,0,0,0.95)";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(x, y + 6, 40, -0.9, 1.6);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(x, y + 6, 40, -0.9, 1.6);
  ctx.stroke();

  ctx.restore();
}

function drawSpeedLines(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;

  ctx.beginPath();
  ctx.moveTo(x - 70, y - 30);
  ctx.lineTo(x + 20, y - 48);
  ctx.moveTo(x - 74, y + 5);
  ctx.lineTo(x + 26, y - 12);
  ctx.moveTo(x - 62, y + 42);
  ctx.lineTo(x + 18, y + 26);
  ctx.stroke();

  ctx.restore();
}

function spawnProtectionVisual(player) {
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = "#00e5ff";
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 22;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(player.x, player.y - 62, 58, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function getPremiumWeaponPose(player, handX, handY) {
  const dir = player.direction;
  const attack = player.attackAnim;
  const special = player.specialAnim;

  let tipX = handX + dir * 64;
  let tipY = handY - 40;

  if (attack > 0) {
    const arc = Math.sin(attack * Math.PI);
    tipX = handX + dir * (78 + arc * 48);
    tipY = handY - 54 + arc * 78;
  }

  if (special > 0) {
    tipX = handX + dir * 88;
    tipY = handY - 88;
  }

  return { tipX, tipY };
}

function drawPremiumWeapon(player, handX, handY) {
  const skinId = player.skinStyle && player.skinStyle.id
    ? player.skinStyle.id
    : player.skin;
  const visual = getHighTierVisual(skinId);

  if (!visual || !visual.weapon) return false;

  const style = player.skinStyle;
  const palette = getPremiumPalette(style, visual);
  const pose = getPremiumWeaponPose(player, handX, handY);
  const dx = pose.tipX - handX;
  const dy = pose.tipY - handY;
  const length = Math.max(42, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);
  const type = visual.weapon;
  const primary = palette.primary;
  const secondary = palette.secondary;
  const blade = palette.blade;

  ctx.save();
  ctx.translate(handX, handY);
  ctx.rotate(angle);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const katanaTypes = ["katana", "energy_katana", "celestial_katana", "lightning_blade"];
  const greatswordTypes = [
    "greatsword", "energy_greatsword", "glitch_greatsword", "boss_greatsword",
    "holy_blade", "fallen_blade", "royal_blade", "dragon_blade", "rainbow_blade",
    "glitch_blade", "demon_blade"
  ];

  if (katanaTypes.includes(type)) {
    const curve = type === "lightning_blade" ? -15 : -9;

    ctx.strokeStyle = "rgba(0,0,0,0.96)";
    ctx.lineWidth = type === "celestial_katana" ? 13 : 11;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * 0.58, curve, length, 0);
    ctx.stroke();

    ctx.strokeStyle = blade;
    ctx.lineWidth = type === "celestial_katana" ? 7 : 5;
    ctx.shadowColor = primary;
    ctx.shadowBlur = premiumShadowBlur(type === "celestial_katana" ? 20 : 15);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * 0.58, curve, length, 0);
    ctx.stroke();

    ctx.strokeStyle = secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(9, -1);
    ctx.quadraticCurveTo(length * 0.58, curve - 1, length - 3, -1);
    ctx.stroke();

    ctx.strokeStyle = secondary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(9, -10);
    ctx.lineTo(9, 10);
    ctx.stroke();

    if (type === "energy_katana" || type === "celestial_katana") {
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, 8);
      ctx.lineTo(length - 9, 7);
      ctx.stroke();
    }
  } else if (greatswordTypes.includes(type)) {
    const mystic = visual.tier === "mystic";
    const halfWidth = mystic ? 14 : visual.tier === "legendary" ? 11 : 9;
    const gradient = ctx.createLinearGradient(0, 0, length, 0);
    gradient.addColorStop(0, primary);
    gradient.addColorStop(0.48, blade);
    gradient.addColorStop(1, secondary);

    ctx.beginPath();
    ctx.moveTo(4, -halfWidth);
    ctx.lineTo(length - 18, -halfWidth * 0.72);
    ctx.lineTo(length, 0);
    ctx.lineTo(length - 18, halfWidth * 0.72);
    ctx.lineTo(4, halfWidth);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "rgba(0,0,0,0.96)";
    ctx.lineWidth = 5;
    ctx.shadowColor = primary;
    ctx.shadowBlur = premiumShadowBlur(mystic ? 21 : 16);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = secondary;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(length - 12, 0);
    ctx.stroke();

    ctx.strokeStyle = secondary;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(9, -15);
    ctx.lineTo(9, 15);
    ctx.stroke();

    if (["glitch_blade", "glitch_greatsword", "boss_greatsword"].includes(type)) {
      ctx.strokeStyle = type === "boss_greatsword" ? "#ffffff" : "#00e5ff";
      ctx.lineWidth = 3;
      ctx.setLineDash([9, 6]);
      ctx.lineDashOffset = -performance.now() / 45;
      ctx.beginPath();
      ctx.moveTo(20, -halfWidth - 5);
      ctx.lineTo(length - 16, -halfWidth - 3);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (type === "demon_blade" || type === "dragon_blade") {
      for (let i = 0; i < 3; i++) {
        premiumPolygon(
          [[length * (0.42 + i * 0.14), halfWidth], [length * (0.48 + i * 0.14), halfWidth + 9], [length * (0.53 + i * 0.14), halfWidth]],
          primary,
          secondary,
          1.5,
          0.9,
          9
        );
      }
    }
  } else if (type === "rapier") {
    ctx.strokeStyle = "rgba(0,0,0,0.96)";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();

    ctx.strokeStyle = blade;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = primary;
    ctx.shadowBlur = premiumShadowBlur(14);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();

    ctx.strokeStyle = secondary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(11, 0, 11, -1.15, 1.15);
    ctx.stroke();
  } else if (type === "void_scythe" || type === "cosmic_scythe") {
    const scytheColor = type === "cosmic_scythe" ? secondary : primary;

    ctx.strokeStyle = "rgba(0,0,0,0.96)";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length * 0.82, 0);
    ctx.stroke();

    ctx.strokeStyle = blade;
    ctx.lineWidth = 5;
    ctx.shadowColor = scytheColor;
    ctx.shadowBlur = premiumShadowBlur(17);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length * 0.82, 0);
    ctx.stroke();

    ctx.strokeStyle = scytheColor;
    ctx.lineWidth = type === "cosmic_scythe" ? 9 : 7;
    ctx.beginPath();
    ctx.arc(length * 0.78, -15, 31, -0.7, 1.25);
    ctx.stroke();
    skinSmallStar(length * 0.78, -15, secondary, type === "cosmic_scythe" ? 7 : 4);
  } else if (["lance", "golden_lance"].includes(type)) {
    ctx.strokeStyle = "rgba(0,0,0,0.96)";
    ctx.lineWidth = type === "golden_lance" ? 13 : 11;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(length - 13, 0);
    ctx.stroke();

    ctx.strokeStyle = blade;
    ctx.lineWidth = type === "golden_lance" ? 7 : 5;
    ctx.shadowColor = primary;
    ctx.shadowBlur = premiumShadowBlur(type === "golden_lance" ? 20 : 15);
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(length - 13, 0);
    ctx.stroke();

    premiumPolygon(
      [[length - 19, -13], [length, 0], [length - 19, 13], [length - 12, 0]],
      secondary,
      "#000000",
      3,
      1,
      18
    );
    skinMiniHorseshoe(8, 0, primary, 0.36);
  } else if (type === "hammer") {
    ctx.strokeStyle = "rgba(0,0,0,0.96)";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length - 18, 0);
    ctx.stroke();

    ctx.strokeStyle = secondary;
    ctx.lineWidth = 6;
    ctx.shadowColor = primary;
    ctx.shadowBlur = premiumShadowBlur(16);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length - 18, 0);
    ctx.stroke();

    ctx.fillStyle = primary;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    roundRect(ctx, length - 32, -24, 42, 48, 12, true, true);
    drawPremiumEmblem(length - 11, 55, "heart", primary, secondary);
  } else if (type === "claws") {
    for (let i = -1; i <= 1; i++) {
      ctx.strokeStyle = "rgba(0,0,0,0.96)";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(0, i * 7);
      ctx.quadraticCurveTo(length * 0.52, i * 10 - 10, length * 0.78, i * 13 - 3);
      ctx.stroke();

      ctx.strokeStyle = blade;
      ctx.lineWidth = 4;
      ctx.shadowColor = primary;
      ctx.shadowBlur = premiumShadowBlur(13);
      ctx.beginPath();
      ctx.moveTo(0, i * 7);
      ctx.quadraticCurveTo(length * 0.52, i * 10 - 10, length * 0.78, i * 13 - 3);
      ctx.stroke();
    }
  } else if (type === "cleaver") {
    const gradient = ctx.createLinearGradient(0, 0, length, 0);
    gradient.addColorStop(0, "#240006");
    gradient.addColorStop(0.55, blade);
    gradient.addColorStop(1, primary);
    ctx.beginPath();
    ctx.moveTo(5, -8);
    ctx.lineTo(length - 14, -20);
    ctx.lineTo(length, -7);
    ctx.lineTo(length - 4, 16);
    ctx.lineTo(9, 11);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "rgba(0,0,0,0.98)";
    ctx.lineWidth = 5;
    ctx.shadowColor = primary;
    ctx.shadowBlur = premiumShadowBlur(18);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(length * 0.35, -5);
    ctx.lineTo(length * 0.72, 5);
    ctx.stroke();
  }

  ctx.restore();
  return true;
}

function drawSword(player, handX, handY) {
  if (drawPremiumWeapon(player, handX, handY)) return;

  const dir = player.direction;
  const attack = player.attackAnim;
  const special = player.specialAnim;
  const style = player.skinStyle;

  ctx.save();

  let tipX = handX + dir * 55;
  let tipY = handY - 36;

  if (attack > 0) {
    const arc = Math.sin(attack * Math.PI);
    tipX = handX + dir * (70 + arc * 45);
    tipY = handY - 50 + arc * 75;
  }

  if (special > 0) {
    tipX = handX + dir * 78;
    tipY = handY - 80;
  }

  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(0,0,0,0.95)";
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.lineWidth = 5;
  ctx.strokeStyle = style.blade;
  ctx.shadowColor = style.blade;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.strokeStyle = style.accent;
  ctx.shadowColor = style.accent;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(handX + dir * 8, handY - 4);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.restore();
}

/* ============================================================
   NAMEPLATE / EFFECT DRAWING
============================================================ */

function drawNameplate(player) {
  if (player.dead) return;

  const x = player.x;
  const y = player.y - 165;

  const hpPercent = player.hp / player.maxHp;
  const compactCrowdPlate = Array.isArray(players) && players.length >= 16;

  if (compactCrowdPlate) {
    const compactWidth = 104;
    const compactHpColor = hpPercent <= 0.25
      ? "#ff304f"
      : hpPercent <= 0.5
        ? "#ffd34a"
        : "#00ff84";

    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "900 12px Arial";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.9)";
    ctx.fillStyle = "#ffffff";
    ctx.strokeText(player.name.toUpperCase(), x, y - 8);
    ctx.fillText(player.name.toUpperCase(), x, y - 8);
    ctx.fillStyle = "rgba(0,0,0,0.82)";
    roundRect(ctx, x - compactWidth / 2, y, compactWidth, 7, 4, true, false);
    ctx.fillStyle = compactHpColor;
    roundRect(ctx, x - compactWidth / 2, y, compactWidth * hpPercent, 7, 4, true, false);
    ctx.restore();
    return;
  }

  const xpInfo = getLevelProgressFromTotalXp(player.xp, player.level);
  const xpPercent = xpInfo.progress;

  const barWidth = 138;
  const hpBarHeight = 9;
  const xpBarHeight = 6;
  const hpBarY = y;
  const xpBarY = y + 14;

  ctx.save();

  ctx.textAlign = "center";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(0,0,0,0.85)";

  const levelText = `LVL ${player.level}`;
  const nameText = player.name.toUpperCase();

  ctx.font = "900 13px Arial";
  ctx.strokeText(levelText, x, y - 32);
  ctx.fillStyle = "#ffd34a";
  ctx.fillText(levelText, x, y - 32);

  ctx.font = "900 16px Arial";
  ctx.strokeText(nameText, x, y - 12);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(nameText, x, y - 12);

  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(0,0,0,0.78)";
  roundRect(ctx, x - barWidth / 2, hpBarY, barWidth, hpBarHeight, 5, true, false);

  let hpColor = "#00ff84";
  if (hpPercent <= 0.5) hpColor = "#ffd34a";
  if (hpPercent <= 0.25) hpColor = "#ff304f";

  ctx.fillStyle = hpColor;
  ctx.shadowColor = hpColor;
  ctx.shadowBlur = 10;
  roundRect(ctx, x - barWidth / 2, hpBarY, barWidth * hpPercent, hpBarHeight, 5, true, false);

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0,0,0,0.82)";
  roundRect(ctx, x - barWidth / 2, xpBarY, barWidth, xpBarHeight, 4, true, false);

  const xpGradient = ctx.createLinearGradient(x - barWidth / 2, xpBarY, x + barWidth / 2, xpBarY);
  xpGradient.addColorStop(0, "#008cff");
  xpGradient.addColorStop(0.5, "#00e5ff");
  xpGradient.addColorStop(1, "#7df7ff");

  ctx.fillStyle = xpGradient;
  ctx.shadowColor = "#00d9ff";
  ctx.shadowBlur = 10;
  roundRect(ctx, x - barWidth / 2, xpBarY, barWidth * xpPercent, xpBarHeight, 4, true, false);

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  roundRect(ctx, x - barWidth / 2, xpBarY, barWidth, xpBarHeight, 4, false, true);

  ctx.font = "900 8px Arial";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,0.9)";
  ctx.fillStyle = "#dffbff";
  ctx.strokeText(xpInfo.label, x, xpBarY + 5);
  ctx.fillText(xpInfo.label, x, xpBarY + 5);

  ctx.restore();
}

function drawSlashEffects() {
  for (const slash of slashEffects) {
    const progress = 1 - slash.life / slash.maxLife;
    const alpha = slash.life / slash.maxLife;

    ctx.save();

    ctx.globalAlpha = alpha;
    ctx.translate(slash.x, slash.y);
    ctx.scale(slash.direction, 1);
    ctx.rotate(slash.rotation);

    ctx.strokeStyle = slash.color;
    ctx.lineWidth = 7 * slash.power;
    ctx.lineCap = "round";
    ctx.shadowColor = slash.color;
    ctx.shadowBlur = 24;

    ctx.beginPath();
    ctx.arc(0, 0, 42 * slash.power + progress * 28, -1.0, 0.9);
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3 * slash.power;
    ctx.beginPath();
    ctx.arc(0, 0, 34 * slash.power + progress * 22, -0.9, 0.75);
    ctx.stroke();

    ctx.restore();
  }
}

function drawImpactRings() {
  for (const ring of impactRings) {
    const alpha = ring.life / ring.maxLife;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = 5 * ring.power;
    ctx.shadowColor = ring.color;
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius * 0.62, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

function drawSpawnPortals() {
  for (const portal of spawnPortals) {
    const alpha = portal.life / portal.maxLife;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(portal.x, portal.y);
    ctx.scale(0.55, 1.35);

    ctx.strokeStyle = portal.color;
    ctx.lineWidth = 7;
    ctx.shadowColor = portal.color;
    ctx.shadowBlur = 30;

    ctx.beginPath();
    ctx.arc(0, 0, portal.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, portal.radius * 0.62, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

function drawBlood() {
  for (const drop of bloodDrops) {
    const alpha = clamp(drop.life / drop.maxLife, 0, 1);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = drop.color;
    ctx.shadowColor = "#ff0033";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawGoldParticles() {
  for (const gold of goldParticles) {
    const alpha = clamp(gold.life / gold.maxLife, 0, 1);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(gold.x, gold.y);
    ctx.rotate(gold.rotation);
    ctx.fillStyle = "#ffd34a";
    ctx.shadowColor = "#ffd34a";
    ctx.shadowBlur = 14;
    ctx.fillRect(-gold.size / 2, -gold.size / 2, gold.size, gold.size);
    ctx.restore();
  }
}

function drawDamageTexts() {
  for (const text of damageTexts) {
    const alpha = text.life / text.maxLife;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = "center";
    ctx.font = `1000 ${text.size}px Arial`;
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(0,0,0,0.9)";
    ctx.fillStyle = text.color;
    ctx.shadowColor = text.color;
    ctx.shadowBlur = text.special ? 28 : text.crit ? 22 : 12;

    ctx.strokeText(text.value, text.x, text.y);
    ctx.fillText(text.value, text.x, text.y);
    ctx.restore();
  }
}

function drawParticles() {
  for (const particle of particles) {
    ctx.save();
    ctx.globalAlpha = clamp(particle.life, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.strokeStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 14;
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation || 0);

    const shape = particle.shape || "normal";

    if (shape === "heart") {
      const s = particle.size;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.8);
      ctx.bezierCurveTo(-s * 1.4, -s * 0.1, -s * 0.9, -s * 1.2, 0, -s * 0.45);
      ctx.bezierCurveTo(s * 0.9, -s * 1.2, s * 1.4, -s * 0.1, 0, s * 0.8);
      ctx.fill();
    } else if (shape === "rose") {
      ctx.scale(1.6, 0.65);
      ctx.beginPath();
      ctx.ellipse(0, 0, particle.size, particle.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (["glitch", "holo", "pixel"].includes(shape)) {
      ctx.fillRect(-particle.size, -particle.size * 0.45, particle.size * 2.2, particle.size * 0.9);
    } else if (["lightning", "spark"].includes(shape)) {
      ctx.lineWidth = Math.max(2, particle.size * 0.45);
      ctx.beginPath();
      ctx.moveTo(-particle.size, particle.size * 0.7);
      ctx.lineTo(0, -particle.size * 0.15);
      ctx.lineTo(-particle.size * 0.2, -particle.size * 0.15);
      ctx.lineTo(particle.size, -particle.size);
      ctx.stroke();
    } else if (["ice", "bone"].includes(shape)) {
      ctx.beginPath();
      ctx.moveTo(0, -particle.size * 1.5);
      ctx.lineTo(particle.size * 0.65, particle.size);
      ctx.lineTo(-particle.size * 0.65, particle.size * 0.55);
      ctx.closePath();
      ctx.fill();
    } else if (["cosmic", "holy", "gold", "anime"].includes(shape)) {
      const s = particle.size;
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.4);
      ctx.lineTo(s * 0.35, -s * 0.35);
      ctx.lineTo(s * 1.4, 0);
      ctx.lineTo(s * 0.35, s * 0.35);
      ctx.lineTo(0, s * 1.4);
      ctx.lineTo(-s * 0.35, s * 0.35);
      ctx.lineTo(-s * 1.4, 0);
      ctx.lineTo(-s * 0.35, -s * 0.35);
      ctx.closePath();
      ctx.fill();
    } else if (["boss", "demon", "rage"].includes(shape)) {
      ctx.lineWidth = Math.max(2, particle.size * 0.45);
      ctx.beginPath();
      ctx.moveTo(-particle.size, 0);
      ctx.lineTo(particle.size, 0);
      ctx.moveTo(0, -particle.size);
      ctx.lineTo(0, particle.size);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (width < 0) return;

  if (width < radius * 2) {
    radius = width / 2;
  }

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/* ============================================================
   LOOP
============================================================ */

function update(dt) {
  for (const player of players) {
    updatePlayer(player, dt);
  }

  separatePlayers(dt);

  updateDamageTexts(dt);
  updateParticles(dt);
  updateBlood(dt);
  updateSlashes(dt);
  updateImpactRings(dt);
  updateSpawnPortals(dt);
  updateGoldParticles(dt);

  if (screenShake > 0) {
    screenShake -= dt * 28;
    if (screenShake < 0) screenShake = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const shakeX = screenShake > 0 ? random(-screenShake, screenShake) : 0;
  const shakeY = screenShake > 0 ? random(-screenShake, screenShake) : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawSpawnPortals();
  drawBlood();
  drawImpactRings();

  const sortedPlayers = [...players].sort((a, b) => a.y - b.y);

  for (const player of sortedPlayers) {
    drawPlayer(player);
  }

  drawSlashEffects();
  drawParticles();
  drawGoldParticles();
  drawDamageTexts();

  ctx.restore();
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

/* ============================================================
   STREAMER.BOT WEBSOCKET
============================================================ */

function connectStreamerBotWebSocket() {
  if (streamerbotSocket && streamerbotSocket.readyState === WebSocket.OPEN) return;

  streamerbotSocket = new WebSocket(STREAMERBOT_WS_URL);

  streamerbotSocket.onopen = () => {
    console.log("[StickFight] Mit Streamer.bot WebSocket verbunden");

    streamerbotSocket.send(JSON.stringify({
      request: "Subscribe",
      id: "stickfight-subscribe",
      events: {
        General: ["Custom"]
      }
    }));
  };

  streamerbotSocket.onmessage = event => {
    handleStreamerBotMessage(event.data);
  };

  streamerbotSocket.onclose = () => {
    console.log("[StickFight] Streamer.bot WebSocket getrennt. Reconnect in 5 Sekunden.");

    clearTimeout(streamerbotReconnectTimer);

    streamerbotReconnectTimer = setTimeout(() => {
      connectStreamerBotWebSocket();
    }, 5000);
  };

  streamerbotSocket.onerror = error => {
    console.log("[StickFight] Streamer.bot WebSocket Fehler:", error);
  };
}

function handleStreamerBotMessage(rawMessage) {
  console.log("[StickFight] WebSocket empfangen:", rawMessage);

  const cleanText = normalizeIncomingText(rawMessage);

  if (cleanText.includes("stickfight_start")) {
    console.log("[StickFight] Start-Befehl erkannt");
    startStickFight();
    return;
  }

  if (cleanText.includes("stickfight_reset")) {
    console.log("[StickFight] Reset-Befehl erkannt");
    resetGame();
    return;
  }

  if (cleanText.includes("stickfight_join")) {
    handleBattleRoyaleJoinMessage(cleanText);
    return;
  }

  if (cleanText.includes("stickfight_duel_start")) {
    handleDuelStartMessage(cleanText);
    return;
  }

  console.log("[StickFight] Keine StickFight-Nachricht erkannt:", rawMessage);
}

function handleBattleRoyaleJoinMessage(cleanText) {
  console.log("[StickFight] Join-Befehl erkannt");

  let username = null;
  let level = 1;
  let xp = 0;
  let skin = "default";

  const userMatch = cleanText.match(/"username"\s*:\s*"([^"]+)"/);
  const levelMatch = cleanText.match(/"level"\s*:\s*(\d+)/);
  const xpMatch = cleanText.match(/"xp"\s*:\s*(\d+)/);
  const skinMatch = cleanText.match(/"skin"\s*:\s*"([^"]+)"/);

  if (userMatch && userMatch[1]) username = userMatch[1];
  if (levelMatch && levelMatch[1]) level = Number(levelMatch[1]) || 1;
  if (xpMatch && xpMatch[1]) xp = Number(xpMatch[1]) || 0;
  if (skinMatch && skinMatch[1]) skin = skinMatch[1];

  console.log("[StickFight] Join Daten:", {
    username,
    level,
    xp,
    skin,
    gameState
  });

  if (username) {
    const success = addPlayer(username, level, xp, skin);

    console.log("[StickFight] addPlayer Ergebnis:", success);
    console.log("[StickFight] Spieler aktuell:", players.length);

    updateArenaStatus();
  } else {
    console.log("[StickFight] Join erkannt, aber kein username gefunden:", cleanText);
  }
}

function handleDuelStartMessage(cleanText) {
  console.log("[StickFight] Duel Start erkannt");

  const data = {
    challenger: extractString(cleanText, "challenger", "UserA"),
    target: extractString(cleanText, "target", "UserB"),
    challengerLevel: extractNumber(cleanText, "challengerLevel", 1),
    targetLevel: extractNumber(cleanText, "targetLevel", 1),
    challengerXp: extractNumber(cleanText, "challengerXp", 0),
    targetXp: extractNumber(cleanText, "targetXp", 0),
    challengerSkin: extractString(cleanText, "challengerSkin", "default"),
    targetSkin: extractString(cleanText, "targetSkin", "default"),
    bet: extractNumber(cleanText, "bet", 0),
    pot: extractNumber(cleanText, "pot", 0)
  };

  console.log("[StickFight] Duel Daten:", data);

  startDuelFromData(data);
}

function extractString(text, key, fallback) {
  const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`);
  const match = text.match(regex);

  if (match && match[1]) {
    return match[1];
  }

  return fallback;
}

function extractNumber(text, key, fallback) {
  const regex = new RegExp(`"${key}"\\s*:\\s*(\\d+)`);
  const match = text.match(regex);

  if (match && match[1]) {
    return Number(match[1]) || fallback;
  }

  return fallback;
}

/* ============================================================
   KEYBOARD TESTS
   S = Battle Royale Start
   F = Testspieler hinzufügen
   R = Reset
   D = Duel Demo
============================================================ */

window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  if (key === "s") {
    startStickFight();
  }

  if (key === "r") {
    resetGame();
  }

  if (key === "f") {
    addPlayer(
      "TestFighter" + randomInt(1, 99),
      randomInt(1, 8),
      randomInt(0, 2500),
      ["blood_blade", "cyber_ninja", "the_final_boss", "gold_champion", "neon_green"][randomInt(0, 4)]
    );
  }

  if (key === "d") {
    startDuelFromData({
      challenger: "DuelOne",
      target: "DuelTwo",
      challengerLevel: randomInt(1, 8),
      targetLevel: randomInt(1, 8),
      challengerXp: randomInt(0, 2500),
      targetXp: randomInt(0, 2500),
      challengerSkin: "cyber_ninja",
      targetSkin: "blood_blade",
      bet: 500,
      pot: 1000
    });
  }
});

/* ============================================================
   EXTERNAL API
============================================================ */

window.StickFight = {
  start: startStickFight,
  join: addPlayer,
  begin: beginBattle,
  reset: resetGame,
  duel: startDuelFromData,
  getState: () => gameState,
  getMode: () => currentMode,
  getPlayers: () => players,
  getQueue: () => queuedPlayers
};

/* ============================================================
   SHARED SKIN RENDERER API
   The visual shop loads this same file in renderer-only mode.
   That keeps every shop preview pixel-identical to the fighter
   that is drawn in Battle Royale and Duel mode.
============================================================ */

window.StickFightSkinRenderer = {
  skins: SKINS,
  highTierVisuals: HIGH_TIER_VISUALS,
  getSkinStyle,
  drawPlayer,
  spawnSkinTrail,
  drawParticles,
  updateParticles,
  clearEffects: () => {
    particles = [];
    slashEffects = [];
    impactRings = [];
    bloodDrops = [];
    spawnPortals = [];
    goldParticles = [];
    damageTexts = [];
  }
};

/* ============================================================
   INIT
============================================================ */

if (!window.STICKFIGHT_RENDERER_ONLY) {
  createSkyline();
  connectStreamerBotWebSocket();
  updateArenaStatus();
  requestAnimationFrame(loop);
}
