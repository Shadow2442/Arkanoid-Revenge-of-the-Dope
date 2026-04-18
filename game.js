const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const titleVideo = document.getElementById("title-video");
const titleStartOverlay = document.getElementById("title-start-overlay");
ctx.imageSmoothingEnabled = false;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const HUD_HEIGHT = 72;
const ARENA_TOP = HUD_HEIGHT;
const ARENA_BOTTOM = HEIGHT - 24;
const GRID_COLS = 14;
const GRID_ROWS = 9;
const BRICK_GAP = 4;
const BRICK_WIDTH = 58;
const BRICK_HEIGHT = 24;
const LEVEL_START_X = 66;
const LEVEL_START_Y = 110;
const FIXED_STEP = 1000 / 60;
const STUCK_AUTO_RELEASE_FRAMES = 60 * 10;

const STATES = {
  MENU: "menu",
  PLAYING: "playing",
  LEVEL_CLEAR: "level_clear",
  GAME_OVER: "game_over",
  WIN: "win",
  PAUSED: "paused",
  CONFIRM_EXIT: "confirm_exit",
  ATTRACT: "attract",
};

const POWERUP_TYPES = ["E", "S", "C", "L", "D", "P"];

const PIXEL_TRANSPARENT = ".";

const SPRITES = {
  vaus: [
    "....111111111111111111111111....",
    "..1222222333333333333333444441..",
    ".1255555233333333333333334444461.",
    "125777752388888888888888344444651",
    "125777752388888888888888344444651",
    "125799752366666666666668344444651",
    "125799752366666666666668344444651",
    "125777752388888888888888344444651",
    "125777752388888888888888344444651",
    ".1255555233333333333333334444461.",
    "..1222222333333333333333444441..",
    "....111111111111111111111111....",
  ],
  enemy: [
    "....111111....",
    "..1222222221..",
    ".1233333333321.",
    "123344444443321",
    "123455555554321",
    "1.34.55..55.43.1",
    "1234555665554321",
    ".12334444443321.",
    "..111.....111..",
  ],
  doh: [
    "..................111111111111..................",
    ".............111122222222222221111.............",
    ".........11122222222333333322222222111.........",
    "......1122222233333333333333333322222211......",
    "....11222233333444444444444444433332222211....",
    "...122223333444444455555555444444333322221...",
    "..1222333444444555555666555555444443332221..",
    ".122233444445555566666666666555554444332221.",
    ".122334444555566667777777766665555444433221.",
    "1223344455556666777888877766665555444333221",
    "1223344555566667778888887776666555544333221",
    "1223344555666677788899888777666655544333221",
    "1223344555666677788899888777666655544333221",
    "1223344555566667778888887776666555544333221",
    "1223344455556666777888877766665555444333221",
    ".122334444555566667777777766665555444433221.",
    ".122233444445555566666666666555554444332221.",
    "..1222333444444555555666555555444443332221..",
    "...122223333444444455555555444444333322221...",
    "....11222233333444444444444444433332222211....",
    "......1122222233333333333333333322222211......",
    ".........11122222222333333322222222111.........",
    ".............111122222222222221111.............",
    "..................111111111111..................",
  ],
};

const PALETTES = {
  vaus: {
    "1": "#101010",
    "2": "#f08a08",
    "3": "#6f767d",
    "4": "#c51414",
    "5": "#ffd38a",
    "6": "#ff8b8b",
    "7": "#c86d10",
    "8": "#d7dde2",
    "9": "#8e0b0b",
  },
  enemy: {
    "1": "#f7f7ff",
    "2": "#f04458",
    "3": "#274fc7",
    "4": "#132b73",
    "5": "#ffcc39",
  },
  doh: {
    "1": "#5d2947",
    "2": "#9a4b71",
    "3": "#d48ca4",
    "4": "#f7bdcc",
    "5": "#fff1f6",
    "6": "#7b1230",
    "7": "#ffdf67",
    "8": "#120d1f",
    "9": "#ff4a71",
  },
};

const BRICK_TYPES = {
  0: null,
  1: { hp: 1, color: "#f0ea2e", score: 60, powerup: 0.18 },
  2: { hp: 1, color: "#35a8ff", score: 70, powerup: 0.18 },
  3: { hp: 1, color: "#66e7ff", score: 80, powerup: 0.22 },
  4: { hp: 2, color: "#ff3030", score: 130, powerup: 0.3 },
  5: { hp: 999, color: "#a7a7a7", score: 0, indestructible: true },
  6: { hp: 3, color: "#ffffff", score: 180, powerup: 0.4 },
};

const LEVELS = [
  {
    name: "Round 1 - Opening Volley",
    enemyRate: 8000,
    speedBoost: 0.04,
    pattern: [
      [0, 0, 1, 1, 2, 2, 3, 3, 2, 2, 1, 1, 0, 0],
      [0, 1, 1, 2, 2, 3, 4, 4, 3, 2, 2, 1, 1, 0],
      [1, 1, 2, 2, 3, 4, 4, 4, 4, 3, 2, 2, 1, 1],
      [1, 2, 2, 3, 4, 4, 6, 6, 4, 4, 3, 2, 2, 1],
      [2, 2, 3, 4, 4, 6, 6, 6, 6, 4, 4, 3, 2, 2],
      [2, 3, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 3, 2],
      [3, 3, 4, 4, 0, 1, 1, 1, 1, 0, 4, 4, 3, 3],
      [0, 3, 4, 0, 1, 2, 2, 2, 2, 1, 0, 4, 3, 0],
      [0, 0, 0, 1, 2, 3, 0, 0, 3, 2, 1, 0, 0, 0],
    ],
  },
  {
    name: "Round 2 - Capsule Storm",
    enemyRate: 6500,
    speedBoost: 0.09,
    pattern: [
      [4, 4, 4, 5, 1, 2, 3, 3, 2, 1, 5, 4, 4, 4],
      [4, 6, 4, 5, 1, 2, 4, 4, 2, 1, 5, 4, 6, 4],
      [4, 4, 4, 5, 2, 3, 6, 6, 3, 2, 5, 4, 4, 4],
      [5, 5, 5, 5, 2, 4, 4, 4, 4, 2, 5, 5, 5, 5],
      [1, 1, 2, 2, 3, 0, 0, 0, 0, 3, 2, 2, 1, 1],
      [1, 2, 2, 3, 4, 4, 0, 0, 4, 4, 3, 2, 2, 1],
      [2, 2, 3, 4, 0, 0, 1, 1, 0, 0, 4, 3, 2, 2],
      [2, 3, 4, 0, 1, 1, 2, 2, 1, 1, 0, 4, 3, 2],
      [3, 4, 0, 1, 2, 3, 6, 6, 3, 2, 1, 0, 4, 3],
    ],
  },
  {
    name: "Round 3 - Corridor Clash",
    enemyRate: 5200,
    speedBoost: 0.15,
    pattern: [
      [5, 5, 4, 4, 3, 3, 2, 2, 3, 3, 4, 4, 5, 5],
      [5, 4, 4, 6, 3, 2, 2, 2, 2, 3, 6, 4, 4, 5],
      [4, 4, 6, 6, 4, 3, 1, 1, 3, 4, 6, 6, 4, 4],
      [4, 6, 6, 5, 5, 0, 0, 0, 0, 5, 5, 6, 6, 4],
      [3, 3, 4, 5, 0, 1, 6, 6, 1, 0, 5, 4, 3, 3],
      [2, 2, 3, 5, 0, 1, 6, 6, 1, 0, 5, 3, 2, 2],
      [2, 3, 4, 5, 5, 0, 1, 1, 0, 5, 5, 4, 3, 2],
      [3, 4, 6, 6, 4, 3, 2, 2, 3, 4, 6, 6, 4, 3],
      [5, 5, 4, 4, 3, 3, 6, 6, 3, 3, 4, 4, 5, 5],
    ],
  },
];

class SeededRandom {
  constructor(seed = 1337) {
    this.seed = seed >>> 0;
  }

  next() {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  range(min, max) {
    return min + this.next() * (max - min);
  }

  pick(items) {
    return items[Math.floor(this.next() * items.length)];
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function circleRectCollision(ball, rect) {
  const closestX = clamp(ball.x, rect.x, rect.x + rect.width);
  const closestY = clamp(ball.y, rect.y, rect.y + rect.height);
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;
  return dx * dx + dy * dy <= ball.radius * ball.radius;
}

function fillRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawPixelSprite(ctx, x, y, scaleX, sprite, palette, scaleY = scaleX) {
  for (let row = 0; row < sprite.length; row += 1) {
    for (let col = 0; col < sprite[row].length; col += 1) {
      const key = sprite[row][col];
      if (key === PIXEL_TRANSPARENT) continue;
      ctx.fillStyle = palette[key];
      ctx.fillRect(
        Math.round(x + col * scaleX),
        Math.round(y + row * scaleY),
        Math.ceil(scaleX),
        Math.ceil(scaleY),
      );
    }
  }
}

function drawVausSprite(ctx, x, y, width, height) {
  const pixelWidth = width / SPRITES.vaus[0].length;
  const pixelHeight = height / SPRITES.vaus.length;
  drawPixelSprite(ctx, x, y, pixelWidth, SPRITES.vaus, PALETTES.vaus, pixelHeight);
}

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.musicEnabled = false;
    this.musicAudio = new Audio();
    this.musicAudio.volume = 0.55;
    this.musicMode = null;
    this.musicDelayTimer = null;
    this.titleTrackPath = "./soundtrack/titletheme.mp3";
    this.gameplayTrackPaths = [
      "./soundtrack/arkanoid (1).mp3",
      "./soundtrack/arkanoid (2).mp3",
      "./soundtrack/arkanoid (3).mp3",
      "./soundtrack/arkanoid (4).mp3",
    ];
    this.lastGameplayTrackPath = null;
  }

  unlock() {
    if (this.enabled) {
      if (this.musicMode) {
        this.startMusic(this.musicMode);
      }
      return;
    }
    const AudioContextRef = window.AudioContext || window.webkitAudioContext;
    if (AudioContextRef) {
      this.ctx = new AudioContextRef();
    }
    this.enabled = true;
    if (this.musicMode) {
      this.startMusic(this.musicMode);
    } else {
      this.syncMusic("title");
    }
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
      return;
    }
    if (this.musicMode) {
      this.startMusic(this.musicMode);
    }
  }

  beep(freq, duration, type = "square", volume = 0.04) {
    if (!this.enabled || !this.ctx) return;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(this.ctx.destination);
    const now = this.ctx.currentTime;
    oscillator.start(now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.stop(now + duration);
  }

  playTone(freq, startTime, duration, type = "square", volume = 0.035) {
    if (!this.enabled || !this.ctx || !freq) return;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(this.ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  playNoise(startTime, duration, volume = 0.015, cutoff = 900) {
    if (!this.enabled || !this.ctx) return;
    const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(startTime);
    source.stop(startTime + duration);
  }

  stopMusic() {
    if (this.musicDelayTimer) {
      clearTimeout(this.musicDelayTimer);
      this.musicDelayTimer = null;
    }
    this.musicAudio.pause();
    this.musicAudio.currentTime = 0;
    this.musicAudio.onended = null;
    this.musicAudio.removeAttribute("src");
    this.musicAudio.load();
    this.musicMode = null;
  }

  pickNextGameplayTrackPath() {
    const pool = this.gameplayTrackPaths.filter((path) => path !== this.lastGameplayTrackPath);
    const choices = pool.length > 0 ? pool : this.gameplayTrackPaths;
    const nextPath = choices[Math.floor(Math.random() * choices.length)];
    this.lastGameplayTrackPath = nextPath;
    return nextPath;
  }

  startMusic(mode) {
    if (!this.musicEnabled) {
      this.musicMode = mode;
      return;
    }
    if (this.musicMode === mode && this.musicAudio.src && !this.musicAudio.paused) return;
    this.stopMusic();
    this.musicMode = mode;

    const path = mode === "title" ? this.titleTrackPath : this.pickNextGameplayTrackPath();
    this.musicAudio.src = path;
    this.musicAudio.loop = mode === "title";
    this.musicAudio.onended = () => {
      if (this.musicMode !== mode) return;
      if (mode === "title") {
        return;
      }
      this.musicDelayTimer = setTimeout(() => {
        if (this.musicMode === "gameplay") {
          this.startMusic("gameplay");
        }
      }, 5000);
    };
    this.musicAudio.load();
    this.musicAudio.play().catch(() => {
      this.musicAudio.onended = null;
    });
  }

  syncMusic(mode) {
    const normalizedMode = mode === "title" ? "title" : "gameplay";
    this.startMusic(normalizedMode);
  }

  play(event) {
    const sounds = {
      paddle: () => this.beep(320, 0.08, "square"),
      brick: () => this.beep(520, 0.07, "triangle"),
      wall: () => this.beep(220, 0.05, "sine"),
      powerup: () => this.beep(660, 0.18, "sawtooth"),
      enemy: () => this.beep(180, 0.12, "square"),
      laser: () => this.beep(860, 0.06, "sawtooth", 0.03),
      boss: () => this.beep(120, 0.15, "triangle", 0.05),
      lose: () => this.beep(110, 0.35, "sine", 0.05),
      clear: () => this.beep(740, 0.25, "triangle", 0.05),
    };
    sounds[event]?.();
  }
}

class Particle {
  constructor(x, y, color, rng = null) {
    const random = rng ? () => rng.next() : () => Math.random();
    this.x = x;
    this.y = y;
    this.vx = (random() - 0.5) * 4;
    this.vy = (random() - 0.5) * 4;
    this.life = 28 + random() * 18;
    this.color = color;
    this.size = 2 + random() * 3;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;
    this.life -= 1;
  }

  render(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life / 46;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

class Paddle {
  constructor(game) {
    this.game = game;
    this.baseWidth = 136;
    this.width = this.baseWidth;
    this.height = 24;
    this.x = WIDTH / 2 - this.width / 2;
    this.y = HEIGHT - 72;
    this.speed = 7.2;
    this.catchEnabled = false;
    this.laserEnabled = false;
    this.expandTimer = 0;
    this.catchTimer = 0;
    this.laserTimer = 0;
    this.color = "#45dfff";
  }

  resetPosition() {
    this.x = WIDTH / 2 - this.width / 2;
  }

  update() {
    const { input } = this.game;
    if (input.mouseActive && input.mouseX !== null) {
      this.x = input.mouseX - this.width / 2;
    } else {
      if (input.left) this.x -= this.speed;
      if (input.right) this.x += this.speed;
    }
    this.x = clamp(this.x, 26, WIDTH - 26 - this.width);

    if (this.expandTimer > 0 && --this.expandTimer === 0) {
      this.width = this.baseWidth;
      this.x = clamp(this.x, 26, WIDTH - 26 - this.width);
    }
    if (this.catchTimer > 0 && --this.catchTimer === 0) {
      this.catchEnabled = false;
    }
    if (this.laserTimer > 0 && --this.laserTimer === 0) {
      this.laserEnabled = false;
    }
  }

  expand() {
    this.width = 180;
    this.expandTimer = 60 * 18;
    this.x = clamp(this.x - 24, 26, WIDTH - 26 - this.width);
  }

  enableCatch() {
    this.catchEnabled = true;
    this.catchTimer = 60 * 16;
  }

  enableLaser() {
    this.laserEnabled = true;
    this.laserTimer = 60 * 14;
  }

  getRect() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  render(ctx) {
    ctx.save();
    drawVausSprite(ctx, this.x, this.y, this.width, this.height);
    if (this.catchEnabled || this.laserEnabled) {
      ctx.strokeStyle = this.catchEnabled ? "#9bff7a" : "#ff648d";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    }
    ctx.restore();
  }
}

class Ball {
  constructor(game, x, y, angle = -Math.PI / 3) {
    this.game = game;
    this.radius = 8;
    this.baseSpeed = game.ballBaseSpeed || 5.3;
    this.speed = this.baseSpeed;
    this.reset(x, y, angle);
  }

  reset(x, y, angle = -Math.PI / 3) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.stuck = true;
    this.offsetX = 0;
    this.stuckFrames = 0;
  }

  attachToPaddle() {
    const paddle = this.game.paddle;
    this.stuck = true;
    this.offsetX = this.x - (paddle.x + paddle.width / 2);
    this.vx = 0;
    this.vy = -this.speed;
    this.stuckFrames = 0;
  }

  launch() {
    if (!this.stuck) return;
    this.stuck = false;
    this.stuckFrames = 0;
    const paddle = this.game.paddle;
    const relative = clamp(this.offsetX / (paddle.width / 2), -1, 1);
    const angle = -Math.PI / 2 + relative * 1.05;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update() {
    if (this.stuck) {
      const paddle = this.game.paddle;
      this.x = paddle.x + paddle.width / 2 + this.offsetX;
      this.y = paddle.y - this.radius - 2;
      this.stuckFrames += 1;
      if (this.stuckFrames >= STUCK_AUTO_RELEASE_FRAMES) {
        this.launch();
      }
      return;
    }

    this.x += this.vx;
    this.y += this.vy;

    const gates = this.game.exitGatesOpen ? this.game.getExitGates() : [];
    const leftGateOpen = gates.some((gate) => gate.side === "left" && this.y >= gate.y && this.y <= gate.y + gate.height);
    const rightGateOpen = gates.some((gate) => gate.side === "right" && this.y >= gate.y && this.y <= gate.y + gate.height);

    if (this.x - this.radius <= 24 && !leftGateOpen) {
      this.x = 24 + this.radius;
      this.vx *= -1;
      this.game.audio.play("wall");
    } else if (this.x + this.radius >= WIDTH - 24 && !rightGateOpen) {
      this.x = WIDTH - 24 - this.radius;
      this.vx *= -1;
      this.game.audio.play("wall");
    }

    if (this.y - this.radius <= ARENA_TOP + 12) {
      this.y = ARENA_TOP + 12 + this.radius;
      this.vy = Math.abs(this.vy);
      this.game.audio.play("wall");
    }
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8ed4ff";
    ctx.fillRect(this.x - 2, this.y - 2, 2, 2);
    ctx.restore();
  }
}

class Brick {
  constructor(x, y, typeCode) {
    const def = BRICK_TYPES[typeCode];
    this.x = x;
    this.y = y;
    this.width = BRICK_WIDTH;
    this.height = BRICK_HEIGHT;
    this.typeCode = typeCode;
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.color = def.color;
    this.score = def.score;
    this.indestructible = !!def.indestructible;
    this.powerupChance = def.powerup || 0;
  }

  hit() {
    if (this.indestructible) return false;
    this.hp -= 1;
    return this.hp <= 0;
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 2);
    ctx.fillRect(this.x + 2, this.y + 2, 2, this.height - 4);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(this.x + 2, this.y + this.height - 4, this.width - 4, 2);
    ctx.fillRect(this.x + this.width - 4, this.y + 2, 2, this.height - 4);
    for (let px = this.x + 6; px < this.x + this.width - 6; px += 8) {
      ctx.fillRect(px, this.y + this.height - 6, 4, 2);
    }
    if (this.maxHp > 1 && !this.indestructible) {
      ctx.fillStyle = "#101010";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${this.hp}`, this.x + this.width / 2, this.y + 17);
    }
    if (this.indestructible) {
      ctx.fillStyle = "#dedede";
      for (let px = this.x + 3; px < this.x + this.width - 2; px += 8) {
        ctx.fillRect(px, this.y + 3, 4, this.height - 6);
      }
    }
    ctx.restore();
  }
}

class Capsule {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 18;
    this.type = type;
    this.speed = 2.2;
  }

  update() {
    this.y += this.speed;
  }

  render(ctx) {
    const palette = {
      E: "#7cff79",
      S: "#7cd7ff",
      C: "#ffd95f",
      L: "#ff7098",
      D: "#c590ff",
      P: "#ffffff",
    };
    ctx.save();
    ctx.fillStyle = palette[this.type] || "#fff";
    fillRoundedRect(ctx, this.x, this.y, this.width, this.height, 8);
    ctx.fillStyle = "#071229";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText(this.type, this.x + this.width / 2, this.y + 14);
    ctx.restore();
  }
}

class Enemy {
  constructor(levelIndex, rng = null) {
    const random = rng ? () => rng.next() : () => Math.random();
    this.width = 34;
    this.height = 18;
    this.x = random() > 0.5 ? 26 : WIDTH - 60;
    this.y = ARENA_TOP + 90 + random() * 160;
    this.vx = (this.x < WIDTH / 2 ? 1 : -1) * (2.4 + levelIndex * 0.35);
    this.hp = 1;
  }

  update() {
    this.x += this.vx;
    if (this.x <= 26 || this.x + this.width >= WIDTH - 26) {
      this.vx *= -1;
    }
  }

  getRect() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  render(ctx) {
    ctx.save();
    const scale = Math.max(1, Math.floor(Math.min(this.width / SPRITES.enemy[0].length, this.height / SPRITES.enemy.length)));
    const spriteWidth = SPRITES.enemy[0].length * scale;
    const spriteHeight = SPRITES.enemy.length * scale;
    drawPixelSprite(ctx, Math.round(this.x + (this.width - spriteWidth) / 2), Math.round(this.y + (this.height - spriteHeight) / 2), scale, SPRITES.enemy, PALETTES.enemy);
    ctx.restore();
  }
}

class LaserShot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 4;
    this.height = 18;
    this.speed = 10;
  }

  update() {
    this.y -= this.speed;
  }

  getRect() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = "#ff648d";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(this.x, this.y, this.width, 6);
    ctx.restore();
  }
}

class DohProjectile {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.radius = 7;
    this.vx = Math.cos(angle) * 3.4;
    this.vy = Math.sin(angle) * 3.4;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = "#ff7a90";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Boss {
  constructor() {
    this.x = WIDTH / 2 - 180;
    this.y = 112;
    this.width = 360;
    this.height = 140;
    this.hp = 24;
    this.maxHp = 24;
    this.vx = 2.3;
    this.projectileCooldown = 110;
    this.weakPoints = [
      { x: 68, y: 48, radius: 24 },
      { x: 180, y: 62, radius: 28 },
      { x: 292, y: 48, radius: 24 },
    ];
  }

  update(game) {
    this.x += this.vx;
    if (this.x <= 70 || this.x + this.width >= WIDTH - 70) {
      this.vx *= -1;
    }

    this.projectileCooldown -= 1;
    if (this.projectileCooldown <= 0) {
      this.projectileCooldown = 72;
      const targetX = game.paddle.x + game.paddle.width / 2;
      const mouthX = this.x + this.width / 2;
      const mouthY = this.y + this.height - 10;
      const angle = Math.atan2(game.paddle.y - mouthY, targetX - mouthX);
      game.bossProjectiles.push(new DohProjectile(mouthX, mouthY, angle));
      game.audio.play("boss");
    }
  }

  hit(ballOrLaser) {
    const localX = ballOrLaser.x - this.x;
    const localY = ballOrLaser.y - this.y;
    for (const weak of this.weakPoints) {
      const dx = localX - weak.x;
      const dy = localY - weak.y;
      if (dx * dx + dy * dy <= weak.radius * weak.radius) {
        this.hp -= 1;
        return true;
      }
    }
    return false;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    drawPixelSprite(ctx, 0, 0, 6, SPRITES.doh, PALETTES.doh);

    ctx.strokeStyle = "#ffdf67";
    ctx.lineWidth = 3;
    for (const weak of this.weakPoints) {
      ctx.beginPath();
      ctx.arc(weak.x, weak.y, weak.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

class Game {
  constructor() {
    this.audio = new AudioSystem();
    this.soundToggleButton = document.getElementById("sound-toggle");
    this.titleVideo = titleVideo;
    this.titleStartOverlay = titleStartOverlay;
    this.titleVideoReady = !!(this.titleVideo && this.titleVideo.readyState >= 2);
    this.titleVideoActive = false;
    this.rng = new SeededRandom(19870718);
    this.input = { left: false, right: false, mouseX: null, mouseActive: false };
    this.mouseFireHeld = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.state = STATES.MENU;
    this.previousState = STATES.MENU;
    this.confirmExitSelection = 0;
    this.confirmExitHover = null;
    this.attractDelayFrames = 60 * 10;
    this.idleFrames = 0;
    this.hasStartedGameOnce = false;
    this.attractSceneIndex = 0;
    this.attractSceneFrame = 0;
    this.attractDemo = null;
    this.attractScenes = [
      { type: "title", duration: 60 * 4 },
      { type: "hiscore", duration: 60 * 4 },
      { type: "level_preview", duration: 60 * 5, levelIndex: 0 },
      { type: "level_preview", duration: 60 * 5, levelIndex: 1 },
      { type: "level_preview", duration: 60 * 5, levelIndex: 2 },
      { type: "boss_preview", duration: 60 * 5 },
    ];
    this.paddle = new Paddle(this);
    this.balls = [];
    this.bricks = [];
    this.capsules = [];
    this.enemies = [];
    this.lasers = [];
    this.particles = [];
    this.boss = null;
    this.bossProjectiles = [];
    this.levelIndex = 0;
    this.ballBaseSpeed = 5.3;
    this.bonusStageUnlocked = false;
    this.bonusStageComplete = false;
    this.retroSeedLabel = `SEED-${this.rng.seed}`;
    this.currentEnemyRate = 999999;
    this.score = 0;
    this.lives = 3;
    this.enemyTimer = 0;
    this.messageTimer = 0;
    this.message = "";
    this.fireCooldown = 0;
    this.exitGatesOpen = false;
    this.exitGatePulse = 0;
    this.exitSequence = null;
    this.starfield = Array.from({ length: 80 }, () => ({
      x: this.rng.range(0, WIDTH),
      y: this.rng.range(0, HEIGHT),
      speed: this.rng.range(0.2, 1),
      size: this.rng.range(0.2, 2),
    }));
    this.bindEvents();
    this.bindUi();
    this.bindTitleVideo();
    this.updateTitleOverlay();
    this.resetBalls();
  }

  bindEvents() {
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      this.registerActivity();
      if (key === "arrowleft" || key === "a") this.input.left = true;
      if (key === "arrowright" || key === "d") this.input.right = true;

      if (key === " " || key === "enter") {
        event.preventDefault();
        this.audio.unlock();
        this.handlePrimaryAction();
      }
      if (key === "p") {
        this.togglePause();
      }
      if (key === "escape") {
        event.preventDefault();
        this.handleEscape();
      }
      if (key === "f") {
        this.tryFireLaser();
      }
      if (this.state === STATES.CONFIRM_EXIT) {
        if (key === "arrowleft" || key === "a") this.confirmExitSelection = 0;
        if (key === "arrowright" || key === "d") this.confirmExitSelection = 1;
      }
    });

    window.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      this.registerActivity();
      if (key === "arrowleft" || key === "a") this.input.left = false;
      if (key === "arrowright" || key === "d") this.input.right = false;
    });

    canvas.addEventListener("pointerdown", (event) => {
      this.audio.setMusicEnabled(true);
      this.audio.unlock();
      this.updateSoundToggle();
      this.registerActivity();
      this.input.mouseActive = true;
      if (event.button === 0) {
        this.mouseFireHeld = true;
      }
      const rect = canvas.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) * (WIDTH / rect.width);
      const mouseY = (event.clientY - rect.top) * (HEIGHT / rect.height);
      this.input.mouseX = mouseX;
      this.updateConfirmExitHover(mouseX, mouseY);
      if (this.state === STATES.CONFIRM_EXIT && this.confirmExitHover !== null) {
        this.confirmExitSelection = this.confirmExitHover;
      }
      if (event.button === 0 && this.state === STATES.PLAYING && this.paddle.laserEnabled) {
        this.tryFireLaser();
        return;
      }
      this.handlePrimaryAction();
    });

    canvas.addEventListener("pointermove", (event) => {
      this.registerActivity();
      const rect = canvas.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      this.input.mouseX = (event.clientX - rect.left) * scaleX;
      this.input.mouseActive = true;
      this.updateConfirmExitHover(
        this.input.mouseX,
        (event.clientY - rect.top) * (HEIGHT / rect.height),
      );
    });

    canvas.addEventListener("pointerenter", (event) => {
      this.registerActivity();
      const rect = canvas.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      this.input.mouseX = (event.clientX - rect.left) * scaleX;
      this.input.mouseActive = true;
      this.updateConfirmExitHover(
        this.input.mouseX,
        (event.clientY - rect.top) * (HEIGHT / rect.height),
      );
    });

    canvas.addEventListener("pointerleave", () => {
      this.input.mouseActive = false;
      this.input.mouseX = null;
      this.mouseFireHeld = false;
      this.confirmExitHover = null;
    });

    canvas.addEventListener("pointerup", (event) => {
      if (event.button === 0) {
        this.mouseFireHeld = false;
      }
    });
  }

  bindUi() {
    if (!this.soundToggleButton) return;
    this.soundToggleButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextEnabled = !this.audio.musicEnabled;
      this.audio.unlock();
      this.audio.setMusicEnabled(nextEnabled);
      if (nextEnabled) {
        this.audio.syncMusic("title");
      }
      this.updateSoundToggle();
    });
    this.updateSoundToggle();
  }

  bindTitleVideo() {
    if (!this.titleVideo) return;
    this.titleVideo.muted = true;
    this.titleVideo.loop = true;
    this.titleVideo.playsInline = true;
    const markReady = () => {
      this.titleVideoReady = this.titleVideo.readyState >= 2;
    };
    this.titleVideo.addEventListener("loadeddata", markReady);
    this.titleVideo.addEventListener("canplay", markReady);
    this.titleVideo.addEventListener("error", () => {
      this.titleVideoReady = false;
      this.titleVideoActive = false;
    });
    markReady();
  }

  syncTitleVideoPlayback(shouldPlay) {
    if (!this.titleVideo) return;
    if (shouldPlay) {
      if (!this.titleVideoActive) {
        this.titleVideoActive = true;
        const playPromise = this.titleVideo.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            this.titleVideoActive = false;
          });
        }
      }
      return;
    }

    if (!this.titleVideoActive && this.titleVideo.paused) return;
    this.titleVideo.pause();
    this.titleVideoActive = false;
    this.titleVideo.currentTime = 0;
  }

  drawTitleVideoBackground() {
    if (!this.titleVideo || !this.titleVideoReady || this.titleVideo.readyState < 2) {
      return false;
    }

    const videoAspect = this.titleVideo.videoWidth / this.titleVideo.videoHeight;
    const drawWidth = WIDTH;
    const drawHeight = WIDTH / videoAspect;
    const drawX = 0;
    const drawY = (HEIGHT - drawHeight) / 2;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(this.titleVideo, drawX, drawY, drawWidth, drawHeight);

    const vignette = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    vignette.addColorStop(0, "rgba(0,0,0,0.42)");
    vignette.addColorStop(0.18, "rgba(0,0,0,0.1)");
    vignette.addColorStop(0.8, "rgba(0,0,0,0.08)");
    vignette.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    return true;
  }

  updateTitleOverlay() {
    if (!this.titleStartOverlay) return;
    this.titleStartOverlay.classList.toggle("visible", this.state === STATES.MENU);
  }

  updateSoundToggle() {
    if (!this.soundToggleButton) return;
    const on = this.audio.musicEnabled;
    this.soundToggleButton.textContent = on ? "🔊" : "🔇";
    this.soundToggleButton.setAttribute("aria-label", on ? "Sound on" : "Sound off");
    this.soundToggleButton.classList.toggle("sound-on", on);
  }

  registerActivity() {
    this.idleFrames = 0;
    if (this.state === STATES.ATTRACT) {
      this.state = STATES.MENU;
      this.attractSceneIndex = 0;
      this.attractSceneFrame = 0;
      this.attractDemo = null;
      this.updateTitleOverlay();
      this.audio.syncMusic("title");
    }
  }

  resetBalls(multiball = false) {
    const centerX = this.paddle.x + this.paddle.width / 2;
    const ball = new Ball(this, centerX, this.paddle.y - 12);
    ball.offsetX = 0;
    this.balls = [ball];
    if (multiball) {
      const leftBall = new Ball(this, centerX - 18, this.paddle.y - 12, -Math.PI * 0.68);
      leftBall.stuck = false;
      const rightBall = new Ball(this, centerX + 18, this.paddle.y - 12, -Math.PI * 0.32);
      rightBall.stuck = false;
      this.balls.push(leftBall, rightBall);
    }
  }

  startGame() {
    this.state = STATES.PLAYING;
    this.updateTitleOverlay();
    this.hasStartedGameOnce = true;
    this.rng = new SeededRandom(19870718);
    this.retroSeedLabel = `SEED-${this.rng.seed}`;
    this.levelIndex = 0;
    this.bonusStageUnlocked = false;
    this.bonusStageComplete = false;
    this.score = 0;
    this.lives = 3;
    this.idleFrames = 0;
    this.message = "";
    this.messageTimer = 0;
    this.loadLevel(this.levelIndex);
  }

  generateBonusLevel() {
    const pattern = [];
    for (let row = 0; row < GRID_ROWS; row += 1) {
      const line = [];
      for (let col = 0; col < GRID_COLS; col += 1) {
        const corridor = (col === 6 || col === 7) && row > 1 && row < GRID_ROWS - 1;
        if (corridor) {
          line.push(0);
          continue;
        }
        const roll = this.rng.next();
        if (roll < 0.08) {
          line.push(5);
        } else if (roll < 0.22) {
          line.push(6);
        } else if (roll < 0.42) {
          line.push(4);
        } else {
          line.push(1 + Math.floor(this.rng.next() * 3));
        }
      }
      pattern.push(line);
    }

    return {
      name: "Bonus Round - Chaos Circuit",
      enemyRate: 4200,
      speedBoost: 0.22,
      pattern,
    };
  }

  loadLevel(index) {
    this.levelIndex = index;
    this.capsules = [];
    this.enemies = [];
    this.lasers = [];
    this.particles = [];
    this.bossProjectiles = [];
    this.boss = null;
    this.exitGatesOpen = false;
    this.exitGatePulse = 0;
    this.exitSequence = null;
    this.paddle = new Paddle(this);
    this.resetBalls();
    const level = index < LEVELS.length ? LEVELS[index] : this.generateBonusLevel();
    if (!level) {
      this.ballBaseSpeed = 6.2;
      this.startBossFight();
      return;
    }
    if (index >= LEVELS.length) {
      this.bonusStageUnlocked = true;
    }
    this.currentEnemyRate = level.enemyRate;
    this.enemyTimer = this.currentEnemyRate;
    this.ballBaseSpeed = 5.3 + level.speedBoost * 5;
    this.bricks = [];
    level.pattern.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (!cell) return;
        const x = LEVEL_START_X + colIndex * (BRICK_WIDTH + BRICK_GAP);
        const y = LEVEL_START_Y + rowIndex * (BRICK_HEIGHT + BRICK_GAP);
        this.bricks.push(new Brick(x, y, cell));
      });
    });
    this.message = level.name;
    this.messageTimer = 180;
    this.audio.syncMusic("level");
  }

  startBossFight() {
    this.state = STATES.PLAYING;
    this.bricks = [];
    this.capsules = [];
    this.enemies = [];
    this.lasers = [];
    this.bossProjectiles = [];
    this.particles = [];
    this.boss = new Boss();
    this.exitGatesOpen = false;
    this.exitGatePulse = 0;
    this.exitSequence = null;
    this.paddle = new Paddle(this);
    this.resetBalls();
    this.message = "Final Round - Doh";
    this.messageTimer = 210;
    this.audio.syncMusic("boss");
  }

  handlePrimaryAction() {
    if (this.state === STATES.MENU) {
      this.startGame();
      return;
    }
    if (this.state === STATES.CONFIRM_EXIT) {
      if (this.confirmExitSelection === 0) {
        this.audio.stopMusic();
        this.state = STATES.MENU;
        this.previousState = STATES.MENU;
        this.updateTitleOverlay();
        this.message = "";
        this.messageTimer = 0;
      } else {
        this.state = this.previousState === STATES.CONFIRM_EXIT ? STATES.PLAYING : this.previousState || STATES.PLAYING;
        this.updateTitleOverlay();
      }
      return;
    }
    if (this.state === STATES.GAME_OVER || this.state === STATES.WIN) {
      this.startGame();
      return;
    }
    if (this.state === STATES.LEVEL_CLEAR) {
      this.advanceStage();
      return;
    }
    if (this.state === STATES.PLAYING) {
      this.balls.forEach((ball) => ball.launch());
    }
  }

  handleEscape() {
    if (this.state === STATES.MENU) return;
    if (this.state === STATES.CONFIRM_EXIT) {
      this.confirmExitHover = null;
      this.state = this.previousState === STATES.CONFIRM_EXIT ? STATES.PLAYING : this.previousState || STATES.PLAYING;
      this.updateTitleOverlay();
      return;
    }
    this.previousState = this.state;
    this.confirmExitSelection = 1;
    this.confirmExitHover = null;
    this.state = STATES.CONFIRM_EXIT;
  }

  getConfirmExitButtons() {
    return [
      { index: 0, label: "YES", x: WIDTH / 2 - 150, y: HEIGHT / 2 + 40, width: 120, height: 56 },
      { index: 1, label: "NO", x: WIDTH / 2 + 30, y: HEIGHT / 2 + 40, width: 120, height: 56 },
    ];
  }

  updateConfirmExitHover(mouseX, mouseY) {
    if (this.state !== STATES.CONFIRM_EXIT) {
      this.confirmExitHover = null;
      return;
    }
    const hovered = this.getConfirmExitButtons().find((button) =>
      mouseX >= button.x &&
      mouseX <= button.x + button.width &&
      mouseY >= button.y &&
      mouseY <= button.y + button.height,
    );
    this.confirmExitHover = hovered ? hovered.index : null;
    if (hovered) {
      this.confirmExitSelection = hovered.index;
    }
  }

  togglePause() {
    if (this.state === STATES.PLAYING) {
      this.previousState = this.state;
      this.state = STATES.PAUSED;
    } else if (this.state === STATES.PAUSED) {
      this.state = this.previousState || STATES.PLAYING;
    }
  }

  tryFireLaser() {
    if (this.state !== STATES.PLAYING || !this.paddle.laserEnabled || this.fireCooldown > 0) return;
    this.lasers.push(new LaserShot(this.paddle.x + 14, this.paddle.y - 12));
    this.lasers.push(new LaserShot(this.paddle.x + this.paddle.width - 18, this.paddle.y - 12));
    this.fireCooldown = 18;
    this.audio.play("laser");
  }

  spawnCapsule(x, y, chanceOverride) {
    if (this.rng.next() > chanceOverride) return;
    const type = this.rng.pick(POWERUP_TYPES);
    this.capsules.push(new Capsule(x, y, type));
  }

  awardParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i += 1) {
      this.particles.push(new Particle(x, y, color, this.rng));
    }
  }

  loseLife() {
    this.audio.play("lose");
    this.lives -= 1;
    this.capsules = [];
    this.enemies = [];
    this.lasers = [];
    this.bossProjectiles = [];
    this.paddle = new Paddle(this);
    this.resetBalls();
    if (this.lives <= 0) {
      this.state = STATES.GAME_OVER;
    } else {
      this.message = "VAUS destroyed";
      this.messageTimer = 120;
    }
  }

  activateCapsule(type) {
    if (type === "E") this.paddle.expand();
    if (type === "S") {
      this.balls.forEach((ball) => {
        ball.speed = Math.max(3.8, ball.speed * 0.8);
        const angle = Math.atan2(ball.vy, ball.vx);
        if (!ball.stuck) {
          ball.vx = Math.cos(angle) * ball.speed;
          ball.vy = Math.sin(angle) * ball.speed;
        }
      });
    }
    if (type === "C") this.paddle.enableCatch();
    if (type === "L") this.paddle.enableLaser();
    if (type === "D") this.resetBalls(true);
    if (type === "P") this.lives += 1;
    this.audio.play("powerup");
  }

  advanceStage() {
    if (this.boss && this.boss.hp <= 0) {
      this.state = STATES.PLAYING;
      this.loadLevel(LEVELS.length);
      return;
    }
    const nextLevel = this.levelIndex + 1;
    if (nextLevel < LEVELS.length) {
      this.state = STATES.PLAYING;
      this.loadLevel(nextLevel);
    } else if (this.bonusStageUnlocked && !this.bonusStageComplete) {
      this.state = STATES.WIN;
      this.bonusStageComplete = true;
    } else {
      this.state = STATES.PLAYING;
      this.startBossFight();
    }
  }

  update() {
    this.updateStars();
    if (this.state === STATES.MENU) {
      if (!this.hasStartedGameOnce) {
        this.idleFrames += 1;
        if (this.idleFrames >= this.attractDelayFrames) {
          this.startAttractMode();
        }
      }
      return;
    }
    if (this.state === STATES.ATTRACT) {
      this.updateAttractMode();
      return;
    }
    if (this.state !== STATES.PLAYING) return;

    if (this.fireCooldown > 0) this.fireCooldown -= 1;
    if (this.messageTimer > 0) this.messageTimer -= 1;
    this.exitGatePulse += 0.08;

    if (this.mouseFireHeld && this.paddle.laserEnabled) {
      this.tryFireLaser();
    }

    if (this.exitSequence) {
      this.updateExitSequence();
      return;
    }

    this.paddle.update();
    this.balls.forEach((ball) => ball.update());
    this.handlePaddleCollisions();
    this.handleBrickCollisions();
    this.handleEnemyLogic();
    this.handleCapsules();
    this.handleLasers();
    this.handleBoss();
    this.handleParticles();

    if (!this.boss && this.remainingBreakableBricks() === 0) {
      if (!this.exitGatesOpen) {
        this.exitGatesOpen = true;
        this.message = "Enter a gate";
        this.messageTimer = 9999;
        this.balls = [];
      }
      const gate = this.paddleEnteredExitGate();
      if (gate) {
        this.startExitSequence(gate);
      }
      return;
    }

    this.balls = this.balls.filter((ball) => ball.y - ball.radius <= HEIGHT + 24);
    if (this.state === STATES.PLAYING && this.balls.length === 0) {
      this.loseLife();
    }
  }

  startExitSequence(gate) {
    if (this.exitSequence || this.boss) return;
    this.exitSequence = { side: gate.side, frames: 0 };
    this.message = "Vaus entering gate";
    this.messageTimer = 9999;
    this.audio.play("clear");
    this.balls = [];
    this.capsules = [];
    this.enemies = [];
    this.lasers = [];
    this.bossProjectiles = [];
  }

  updateExitSequence() {
    const sequence = this.exitSequence;
    if (!sequence) return;
    sequence.frames += 1;
    const targetX = sequence.side === "left" ? -this.paddle.width - 8 : WIDTH + 8;
    const speed = 9;
    if (sequence.side === "left") {
      this.paddle.x = Math.max(targetX, this.paddle.x - speed);
    } else {
      this.paddle.x = Math.min(targetX, this.paddle.x + speed);
    }

    if (sequence.frames >= 26 || this.paddle.x <= -this.paddle.width || this.paddle.x >= WIDTH) {
      this.exitSequence = null;
      this.exitGatesOpen = false;
      this.advanceStage();
    }
  }

  startAttractMode() {
    this.state = STATES.ATTRACT;
    this.updateTitleOverlay();
    this.attractSceneIndex = 0;
    this.attractSceneFrame = 0;
    this.initializeAttractScene();
    this.audio.syncMusic("title");
  }

  updateAttractMode() {
    const scene = this.attractScenes[this.attractSceneIndex];
    if (!scene) {
      this.attractSceneIndex = 0;
      this.attractSceneFrame = 0;
      return;
    }

    this.attractSceneFrame += 1;
    if (scene.type === "level_preview") {
      this.exitGatePulse += 0.06;
      this.audio.syncMusic("level");
      this.updateAttractGameplay();
    } else if (scene.type === "boss_preview") {
      this.audio.syncMusic("boss");
      this.updateAttractGameplay();
    } else {
      this.audio.syncMusic("title");
    }

    if (this.attractSceneFrame >= scene.duration) {
      this.attractSceneIndex = (this.attractSceneIndex + 1) % this.attractScenes.length;
      this.attractSceneFrame = 0;
      this.initializeAttractScene();
    }
  }

  initializeAttractScene() {
    const scene = this.attractScenes[this.attractSceneIndex];
    if (!scene) {
      this.attractDemo = null;
      return;
    }

    if (scene.type === "level_preview") {
      const previewLevel = LEVELS[scene.levelIndex];
      const bricks = [];
      previewLevel.pattern.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (!cell) return;
          const x = LEVEL_START_X + colIndex * (BRICK_WIDTH + BRICK_GAP);
          const y = LEVEL_START_Y + rowIndex * (BRICK_HEIGHT + BRICK_GAP);
          bricks.push(new Brick(x, y, cell));
        });
      });
      this.attractDemo = {
        type: "level_preview",
        levelIndex: scene.levelIndex,
        bricks,
        paddle: { x: WIDTH / 2 - 68, y: HEIGHT - 96, width: 136, height: 24 },
        ball: { x: WIDTH / 2, y: HEIGHT - 122, vx: 4.2, vy: -4.6, radius: 8 },
      };
      return;
    }

    if (scene.type === "boss_preview") {
      this.attractDemo = {
        type: "boss_preview",
        paddle: { x: WIDTH / 2 - 68, y: HEIGHT - 96, width: 136, height: 24 },
        ball: { x: WIDTH / 2 + 40, y: HEIGHT - 142, vx: 4.5, vy: -4.2, radius: 8 },
        boss: { x: WIDTH / 2 - 180, y: 120, width: 360, height: 140, hp: 14, dir: 1 },
      };
      return;
    }

    this.attractDemo = null;
  }

  updateAttractGameplay() {
    if (!this.attractDemo) return;
    const demo = this.attractDemo;
    const ball = demo.ball;
    const paddle = demo.paddle;

    const targetX = clamp(ball.x - paddle.width / 2, 26, WIDTH - 26 - paddle.width);
    paddle.x += clamp(targetX - paddle.x, -5.8, 5.8);

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x - ball.radius <= 24) {
      ball.x = 24 + ball.radius;
      ball.vx *= -1;
    } else if (ball.x + ball.radius >= WIDTH - 24) {
      ball.x = WIDTH - 24 - ball.radius;
      ball.vx *= -1;
    }
    if (ball.y - ball.radius <= ARENA_TOP + 12) {
      ball.y = ARENA_TOP + 12 + ball.radius;
      ball.vy = Math.abs(ball.vy);
    }

    const paddleRect = paddle;
    if (ball.vy > 0 && circleRectCollision(ball, paddleRect)) {
      ball.y = paddle.y - ball.radius - 1;
      const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      const angle = -Math.PI / 2 + clamp(hitPos, -1, 1) * 1.0;
      const speed = Math.min(7.2, Math.hypot(ball.vx, ball.vy) + 0.05);
      ball.vx = Math.cos(angle) * speed;
      ball.vy = Math.sin(angle) * speed;
    }

    if (demo.type === "level_preview") {
      for (const brick of [...demo.bricks]) {
        if (!circleRectCollision(ball, brick)) continue;
        const overlapLeft = Math.abs(ball.x + ball.radius - brick.x);
        const overlapRight = Math.abs(ball.x - ball.radius - (brick.x + brick.width));
        const overlapTop = Math.abs(ball.y + ball.radius - brick.y);
        const overlapBottom = Math.abs(ball.y - ball.radius - (brick.y + brick.height));
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          ball.vx *= -1;
        } else {
          ball.vy *= -1;
        }
        if (brick.hit()) {
          demo.bricks = demo.bricks.filter((candidate) => candidate !== brick);
        }
        break;
      }

      if (demo.bricks.filter((brick) => !brick.indestructible).length === 0) {
        this.initializeAttractScene();
      }
    }

    if (demo.type === "boss_preview") {
      demo.boss.x += demo.boss.dir * 2.1;
      if (demo.boss.x <= 70 || demo.boss.x + demo.boss.width >= WIDTH - 70) {
        demo.boss.dir *= -1;
      }
      const bossRect = demo.boss;
      if (circleRectCollision(ball, bossRect)) {
        ball.vy *= -1;
      }
    }

    if (ball.y - ball.radius > HEIGHT) {
      ball.x = WIDTH / 2;
      ball.y = HEIGHT - 122;
      ball.vx = 4.2;
      ball.vy = -4.6;
    }
  }

  getExitGates() {
    const gateHeight = 96;
    const gateY = HEIGHT - 120;
    return [
      { side: "left", x: 12, y: gateY, width: 18, height: gateHeight },
      { side: "right", x: WIDTH - 30, y: gateY, width: 18, height: gateHeight },
    ];
  }

  ballEnteredExitGate(ball) {
    if (this.boss) return false;
    return this.getExitGates().some((gate) => {
      const withinY = ball.y >= gate.y && ball.y <= gate.y + gate.height;
      const beyondX = gate.side === "left"
        ? ball.x - ball.radius <= gate.x + gate.width
        : ball.x + ball.radius >= gate.x;
      return withinY && beyondX;
    });
  }

  paddleEnteredExitGate() {
    if (this.boss) return null;
    const paddleRect = this.paddle.getRect();
    return this.getExitGates().find((gate) => rectsIntersect(paddleRect, gate)) || null;
  }

  updateStars() {
    this.starfield.forEach((star) => {
      star.y += star.speed;
      if (star.y > HEIGHT) {
        star.y = 0;
        star.x = this.rng.range(0, WIDTH);
      }
    });
  }

  handlePaddleCollisions() {
    const paddleRect = this.paddle.getRect();
    this.balls.forEach((ball) => {
      if (ball.vy > 0 && circleRectCollision(ball, paddleRect)) {
        ball.y = this.paddle.y - ball.radius - 1;
        const hitPos = (ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
        let angle = -Math.PI / 2 + clamp(hitPos, -1, 1) * 1.05;
        const nearLeftWall = this.paddle.x <= 42;
        const nearRightWall = this.paddle.x + this.paddle.width >= WIDTH - 42;
        const edgeBias = 0.02;
        if (nearLeftWall) angle += edgeBias;
        if (nearRightWall) angle -= edgeBias;
        ball.speed = Math.min(8.5, ball.speed + 0.02);
        ball.vx = Math.cos(angle) * ball.speed;
        ball.vy = Math.sin(angle) * ball.speed;

        // Prevent dead-vertical loops by enforcing a tiny horizontal component.
        const minHorizontalSpeed = 1.15;
        if (Math.abs(ball.vx) < minHorizontalSpeed) {
          const horizontalSign = nearRightWall ? -1 : nearLeftWall ? 1 : (hitPos >= 0 ? 1 : -1);
          ball.vx = horizontalSign * minHorizontalSpeed;
          ball.vy = -Math.sqrt(Math.max(0.5, ball.speed * ball.speed - ball.vx * ball.vx));
        }

        this.audio.play("paddle");
        if (this.paddle.catchEnabled) {
          ball.attachToPaddle();
        }
      }
    });

    this.enemies.forEach((enemy) => {
      if (rectsIntersect(enemy.getRect(), paddleRect)) {
        this.loseLife();
      }
    });

    this.bossProjectiles = this.bossProjectiles.filter((proj) => {
      const hit = circleRectCollision({ x: proj.x, y: proj.y, radius: proj.radius }, paddleRect);
      if (hit) {
        this.loseLife();
        return false;
      }
      return proj.y - proj.radius <= HEIGHT;
    });
  }

  handleBrickCollisions() {
    const ballsToRemove = new Set();

    for (const ball of this.balls) {
      for (const brick of this.bricks) {
        if (!circleRectCollision(ball, brick)) continue;

        const overlapLeft = Math.abs(ball.x + ball.radius - brick.x);
        const overlapRight = Math.abs(ball.x - ball.radius - (brick.x + brick.width));
        const overlapTop = Math.abs(ball.y + ball.radius - brick.y);
        const overlapBottom = Math.abs(ball.y - ball.radius - (brick.y + brick.height));
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          ball.vx *= -1;
        } else {
          ball.vy *= -1;
        }

        if (brick.hit()) {
          this.score += brick.score;
          this.awardParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 12);
          this.spawnCapsule(brick.x + brick.width / 2 - 15, brick.y + 4, brick.powerupChance);
          this.bricks = this.bricks.filter((candidate) => candidate !== brick);
        }
        this.audio.play("brick");
        break;
      }
    }

    if (ballsToRemove.size > 0) {
      this.balls = this.balls.filter((ball) => !ballsToRemove.has(ball));
    }
  }

  handleEnemyLogic() {
    if (!this.boss) {
      this.enemyTimer -= 1;
      if (this.enemyTimer <= 0) {
        this.enemyTimer = this.currentEnemyRate;
        if (this.enemies.length < 2) {
          this.enemies.push(new Enemy(this.levelIndex, this.rng));
        }
      }
    }

    this.enemies.forEach((enemy) => enemy.update());
    this.balls.forEach((ball) => {
      this.enemies = this.enemies.filter((enemy) => {
        if (!circleRectCollision(ball, enemy.getRect())) return true;
        ball.vy *= -1;
        this.score += 240;
        this.awardParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, "#ff6889", 10);
        this.audio.play("enemy");
        return false;
      });
    });
  }

  handleCapsules() {
    const paddleRect = this.paddle.getRect();
    this.capsules.forEach((capsule) => capsule.update());
    this.capsules = this.capsules.filter((capsule) => {
      if (rectsIntersect(capsule, paddleRect)) {
        this.activateCapsule(capsule.type);
        return false;
      }
      return capsule.y <= HEIGHT;
    });
  }

  handleLasers() {
    this.lasers.forEach((laser) => laser.update());
    this.lasers = this.lasers.filter((laser) => laser.y + laser.height >= ARENA_TOP);

    this.lasers = this.lasers.filter((laser) => {
      for (const brick of this.bricks) {
        if (!rectsIntersect(laser.getRect(), brick)) continue;
        if (brick.hit()) {
          this.score += brick.score;
          this.awardParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 10);
          this.spawnCapsule(brick.x + brick.width / 2 - 15, brick.y + 4, brick.powerupChance);
          this.bricks = this.bricks.filter((candidate) => candidate !== brick);
        }
        this.audio.play("brick");
        return false;
      }

      this.enemies = this.enemies.filter((enemy) => {
        if (!rectsIntersect(laser.getRect(), enemy.getRect())) return true;
        this.score += 240;
        this.awardParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, "#ff6889", 10);
        this.audio.play("enemy");
        laser.y = -999;
        return false;
      });

      if (this.boss && laser.y > -900 && this.boss.hit({ x: laser.x, y: laser.y })) {
        this.score += 180;
        this.audio.play("boss");
        this.awardParticles(laser.x, laser.y, "#ffdf67", 8);
        laser.y = -999;
      }

      return laser.y > -900;
    });
  }

  handleBoss() {
    if (!this.boss) return;
    this.boss.update(this);
    this.bossProjectiles.forEach((proj) => proj.update());

    this.balls.forEach((ball) => {
      const bossRect = { x: this.boss.x, y: this.boss.y, width: this.boss.width, height: this.boss.height };
      if (!circleRectCollision(ball, bossRect)) return;
      const weakHit = this.boss.hit(ball);
      ball.vy *= -1;
      if (weakHit) {
        this.score += 220;
        this.awardParticles(ball.x, ball.y, "#ffdf67", 8);
        this.audio.play("boss");
      } else {
        this.audio.play("wall");
      }
    });

    if (this.boss.hp <= 0) {
      this.awardParticles(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, "#fff", 40);
      this.audio.play("clear");
      this.state = STATES.LEVEL_CLEAR;
      this.message = "Doh Defeated";
      this.messageTimer = 9999;
    }
  }

  handleParticles() {
    this.particles.forEach((particle) => particle.update());
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  remainingBreakableBricks() {
    return this.bricks.filter((brick) => !brick.indestructible).length;
  }

  drawBackground() {
    ctx.fillStyle = "#001f97";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (let y = ARENA_TOP + 8; y < ARENA_BOTTOM; y += 28) {
      for (let x = 56; x < WIDTH - 56; x += 44) {
        ctx.fillStyle = "#1133b7";
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1f51de";
        ctx.beginPath();
        ctx.arc(x - 3, y - 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#335ff0";
        ctx.fillRect(x - 8, y + 6, 16, 2);
      }
    }

    ctx.fillStyle = "#707070";
    ctx.fillRect(12, ARENA_TOP, 18, ARENA_BOTTOM - ARENA_TOP);
    ctx.fillRect(WIDTH - 30, ARENA_TOP, 18, ARENA_BOTTOM - ARENA_TOP);
    ctx.fillStyle = "#d8d8d8";
    ctx.fillRect(14, ARENA_TOP, 4, ARENA_BOTTOM - ARENA_TOP);
    ctx.fillRect(WIDTH - 28, ARENA_TOP, 4, ARENA_BOTTOM - ARENA_TOP);
    ctx.fillStyle = "#4d4d4d";
    for (let y = ARENA_TOP + 6; y < ARENA_BOTTOM - 6; y += 18) {
      ctx.fillRect(20, y, 6, 10);
      ctx.fillRect(WIDTH - 26, y, 6, 10);
    }

    if (this.exitGatesOpen) {
      this.drawExitGates();
    }
  }

  drawExitGates() {
    const glow = 0.55 + Math.sin(this.exitGatePulse) * 0.25;
    this.getExitGates().forEach((gate) => {
      ctx.save();
      ctx.fillStyle = "#050505";
      ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
      ctx.fillStyle = `rgba(90, 255, 255, ${0.28 + glow * 0.25})`;
      ctx.fillRect(gate.x + 2, gate.y + 2, gate.width - 4, gate.height - 4);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + glow * 0.2})`;
      for (let y = gate.y + 6; y < gate.y + gate.height - 4; y += 8) {
        ctx.fillRect(gate.x + 4, y, gate.width - 8, 3);
      }
      ctx.strokeStyle = "#d7ffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(gate.x + 1, gate.y + 1, gate.width - 2, gate.height - 2);
      ctx.restore();
    });
  }

  drawHud() {
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, WIDTH, HUD_HEIGHT);

    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px monospace";
    ctx.fillText(String(this.score).padStart(6, "0"), 34, 28);
    ctx.fillStyle = "#ff3030";
    ctx.fillText("HIGH SCORE", 350, 16);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("100000", 410, 36);

    ctx.textAlign = "right";
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(this.boss ? "DOH" : `ROUND ${Math.min(this.levelIndex + 1, LEVELS.length)}${this.bonusStageUnlocked ? "+" : ""}`, WIDTH - 34, 28);
    ctx.fillStyle = "#ffd400";
    ctx.fillText(this.retroSeedLabel, WIDTH - 34, 54);

    if (this.boss) {
      ctx.fillStyle = "#4c0000";
      ctx.fillRect(390, 44, 180, 12);
      ctx.fillStyle = "#ff3030";
      ctx.fillRect(390, 44, 180 * (this.boss.hp / this.boss.maxHp), 12);
      ctx.strokeStyle = "#ffffff";
      ctx.strokeRect(390, 44, 180, 12);
    }
    ctx.restore();
  }

  drawLivesDisplay() {
    const livesToDraw = Math.max(0, this.lives);
    if (livesToDraw === 0) return;

    ctx.save();
    const scale = 2;
    const startX = 40;
    const y = HEIGHT - 36;
    for (let i = 0; i < livesToDraw; i += 1) {
      drawVausSprite(ctx, startX + i * 58, y, SPRITES.vaus[0].length * scale, SPRITES.vaus.length * scale);
    }
    ctx.restore();
  }

  drawOverlay(title, subtitle) {
    ctx.save();
    ctx.fillStyle = "rgba(3, 6, 12, 0.72)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 42px monospace";
    ctx.fillText(title, WIDTH / 2, HEIGHT / 2 - 24);
    ctx.fillStyle = "#5ff4ff";
    ctx.font = "18px monospace";
    ctx.fillText(subtitle, WIDTH / 2, HEIGHT / 2 + 18);
    ctx.restore();
  }

  drawTitleScreen() {
    ctx.save();
    const hasVideoBackdrop = this.drawTitleVideoBackground();
    if (hasVideoBackdrop) {
      ctx.restore();
      return;
    }

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.textAlign = "center";
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#ff3030";
    ctx.fillText("1UP", WIDTH * 0.24, 24);
    ctx.fillText("HIGH SCORE", WIDTH * 0.5, 24);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("00", WIDTH * 0.24, 48);
    ctx.fillText("100000", WIDTH * 0.5, 48);
    const sunset = ctx.createRadialGradient(WIDTH / 2, 170, 10, WIDTH / 2, 170, 240);
    sunset.addColorStop(0, "rgba(255,90,70,0.95)");
    sunset.addColorStop(0.25, "rgba(255,50,70,0.7)");
    sunset.addColorStop(0.55, "rgba(120,20,80,0.45)");
    sunset.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sunset;
    ctx.beginPath();
    ctx.arc(WIDTH / 2, 170, 220, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,120,140,0.35)";
    ctx.lineWidth = 6;
    for (let i = 0; i < 16; i += 1) {
      const angle = (-0.9 + i * 0.12);
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 170);
      ctx.lineTo(WIDTH / 2 + Math.cos(angle) * 250, 170 + Math.sin(angle) * 160);
      ctx.stroke();
    }

    const drawMoai = (x, mirror = 1) => {
      ctx.save();
      ctx.translate(x, 402);
      ctx.scale(mirror, 1);
      ctx.fillStyle = "#2a0706";
      ctx.strokeStyle = "#ff6a1e";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-95, -170);
      ctx.lineTo(-62, -214);
      ctx.lineTo(-14, -224);
      ctx.lineTo(42, -198);
      ctx.lineTo(70, -145);
      ctx.lineTo(74, -72);
      ctx.lineTo(56, -6);
      ctx.lineTo(82, 72);
      ctx.lineTo(78, 162);
      ctx.lineTo(-14, 224);
      ctx.lineTo(-68, 212);
      ctx.lineTo(-92, 136);
      ctx.lineTo(-84, 52);
      ctx.lineTo(-102, -26);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,90,30,0.25)";
      ctx.lineWidth = 2;
      for (let y = -176; y <= 176; y += 18) {
        ctx.beginPath();
        ctx.moveTo(-88, y);
        ctx.lineTo(72, y + 16);
        ctx.stroke();
      }
      for (let xx = -80; xx <= 60; xx += 18) {
        ctx.beginPath();
        ctx.moveTo(xx, -190);
        ctx.lineTo(xx - 10, 190);
        ctx.stroke();
      }
      ctx.restore();
    };
    drawMoai(180, 1);
    drawMoai(WIDTH - 180, -1);

    ctx.strokeStyle = "#29f0bd";
    ctx.lineWidth = 2;
    for (let ring = 0; ring < 6; ring += 1) {
      ctx.beginPath();
      ctx.ellipse(WIDTH / 2, 340, 150 - ring * 18, 110 - ring * 13, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let x = -130; x <= 130; x += 20) {
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2 + x, 250);
      ctx.lineTo(WIDTH / 2 + x * 0.42, 470);
      ctx.stroke();
    }

    ctx.fillStyle = "#fdf7ff";
    ctx.font = "bold 96px monospace";
    ctx.fillText("ARKANOID", WIDTH / 2 + 5, 132);
    ctx.fillStyle = "#ff8a34";
    ctx.fillText("ARKANOID", WIDTH / 2, 124);
    ctx.strokeStyle = "#311118";
    ctx.lineWidth = 3;
    ctx.strokeText("ARKANOID", WIDTH / 2, 124);

    ctx.fillStyle = "#7cff83";
    ctx.font = "bold 40px monospace";
    ctx.fillText("REVENGE OF THE", WIDTH / 2, 288);

    ctx.fillStyle = "#ff3838";
    ctx.font = "bold 120px monospace";
    ctx.fillText("DOPE", WIDTH / 2 + 5, 430);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("DOPE", WIDTH / 2, 422);
    ctx.fillStyle = "#2a63ff";
    ctx.fillText("DOPE", WIDTH / 2, 414);
    ctx.strokeStyle = "#6c0e16";
    ctx.lineWidth = 3;
    ctx.strokeText("DOPE", WIDTH / 2, 422);

    ctx.font = "bold 72px monospace";
    ctx.fillStyle = "#ff3030";
    ctx.fillText("SLIMSHADY", WIDTH / 2, 582);

    ctx.font = "bold 26px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("\u00A9 1987 SLIMSHADY CORP. JAPAN", WIDTH / 2, 632);
    ctx.fillText("ALL RIGHTS RESERVED", WIDTH / 2, 674);
    ctx.fillText("CREDIT  0", WIDTH * 0.78, 690);

    const blinkOn = Math.floor(performance.now() / 450) % 2 === 0;
    if (blinkOn) {
      ctx.font = "bold 34px monospace";
      ctx.fillStyle = "#ffd400";
      ctx.fillText("START GAME", WIDTH / 2, 520);
    }

    ctx.restore();
  }

  drawHiScoreScreen() {
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ff3030";
    ctx.font = "bold 28px monospace";
    ctx.fillText("HI-SCORE RANKING", WIDTH / 2, 90);

    const entries = [
      ["AAA", "100000"],
      ["TOM", "085000"],
      ["CPU", "060000"],
      ["VAU", "045000"],
      ["DOH", "020000"],
    ];
    ctx.font = "bold 26px monospace";
    entries.forEach((entry, index) => {
      const y = 180 + index * 70;
      ctx.fillStyle = index === 0 ? "#ffd400" : "#ffffff";
      ctx.fillText(`${index + 1}. ${entry[0]}`, WIDTH / 2 - 130, y);
      ctx.fillStyle = "#7ce7ff";
      ctx.fillText(entry[1], WIDTH / 2 + 120, y);
    });

    ctx.fillStyle = "#6cff92";
    ctx.font = "bold 22px monospace";
    ctx.fillText("ARKANOID DEFENSE HONORS", WIDTH / 2, 590);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("PRESS ANY KEY TO RETURN", WIDTH / 2, 650);
    ctx.restore();
  }

  drawAttractGameplay(levelIndex, bossPreview = false) {
    this.drawBackground();
    this.drawHud();

    const demo = this.attractDemo;
    if (!demo) return;

    if (bossPreview && demo.boss) {
      const fakeBoss = new Boss();
      fakeBoss.x = demo.boss.x;
      fakeBoss.y = demo.boss.y;
      fakeBoss.hp = demo.boss.hp;
      fakeBoss.render(ctx);
    } else if (demo.bricks) {
      demo.bricks.forEach((brick) => brick.render(ctx));
    }

    drawVausSprite(ctx, demo.paddle.x, demo.paddle.y, demo.paddle.width, demo.paddle.height);

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(demo.ball.x, demo.ball.y, demo.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "bold 22px monospace";
    ctx.fillStyle = "#ffffff";
    const label = bossPreview ? "ATTRACT MODE - DOH ENCOUNTER" : `ATTRACT MODE - ROUND ${levelIndex + 1}`;
    ctx.fillText(label, WIDTH / 2, HEIGHT - 44);
    ctx.restore();
  }

  render() {
    this.updateTitleOverlay();
    if (this.state === STATES.MENU) {
      this.syncTitleVideoPlayback(true);
      this.audio.syncMusic("title");
      this.drawTitleScreen();
      return;
    }

    if (this.state === STATES.ATTRACT) {
      const scene = this.attractScenes[this.attractSceneIndex];
      this.syncTitleVideoPlayback(scene.type === "title");
      if (scene.type === "title") {
        this.drawTitleScreen();
      } else if (scene.type === "hiscore") {
        this.drawHiScoreScreen();
      } else if (scene.type === "level_preview") {
        this.drawAttractGameplay(scene.levelIndex);
      } else if (scene.type === "boss_preview") {
        this.drawAttractGameplay(0, true);
      }
      return;
    }

    this.syncTitleVideoPlayback(false);

    this.drawBackground();
    this.drawHud();

    this.bricks.forEach((brick) => brick.render(ctx));
    this.capsules.forEach((capsule) => capsule.render(ctx));
    this.enemies.forEach((enemy) => enemy.render(ctx));
    this.lasers.forEach((laser) => laser.render(ctx));
    this.bossProjectiles.forEach((proj) => proj.render(ctx));
    if (this.boss) this.boss.render(ctx);
    this.particles.forEach((particle) => particle.render(ctx));
    this.paddle.render(ctx);
    this.balls.forEach((ball) => ball.render(ctx));
    this.drawLivesDisplay();

    if (this.messageTimer > 0 && this.message) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px monospace";
      ctx.fillText(this.message, WIDTH / 2, HEIGHT - 44);
      ctx.restore();
    }

    if (this.state === STATES.PAUSED) {
      this.drawOverlay("PAUSED", "Press P to continue");
    }

    if (this.state === STATES.CONFIRM_EXIT) {
      this.drawOverlay("RETURN TO TITLE SCREEN?", "Use Left/Right and Space");
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = "bold 30px monospace";
      this.getConfirmExitButtons().forEach((button) => {
        const selected = this.confirmExitSelection === button.index;
        const hovered = this.confirmExitHover === button.index;
        ctx.fillStyle = hovered ? "rgba(255, 212, 0, 0.22)" : "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(button.x, button.y, button.width, button.height);
        ctx.strokeStyle = selected ? "#ffd400" : "#ffffff";
        ctx.lineWidth = hovered ? 3 : 2;
        ctx.strokeRect(button.x, button.y, button.width, button.height);
        ctx.fillStyle = selected ? "#ffd400" : "#ffffff";
        ctx.fillText(button.label, button.x + button.width / 2, button.y + 38);
      });
      ctx.restore();
    }

    if (this.state === STATES.LEVEL_CLEAR) {
      this.drawOverlay("STAGE CLEAR", "Press Space to continue");
    }

    if (this.state === STATES.GAME_OVER) {
      this.drawOverlay("GAME OVER", "Press Space to restart");
    }

    if (this.state === STATES.WIN) {
      this.drawOverlay("VICTORY", "Doh is down, the bonus run is cleared, and the cabinet may now glow smugly.");
    }
  }

  loop = (timestamp) => {
    if (!this.lastTime) this.lastTime = timestamp;
    this.accumulator += timestamp - this.lastTime;
    this.lastTime = timestamp;

    while (this.accumulator >= FIXED_STEP) {
      this.update();
      this.accumulator -= FIXED_STEP;
    }

    this.render();
    requestAnimationFrame(this.loop);
  };
}

const game = new Game();
requestAnimationFrame(game.loop);
