// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreVal = document.getElementById('scoreVal');
const gameOverScreen = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const skipBtn = document.getElementById('skipBtn');
const ammoBar = document.getElementById('ammoBar');

// Game State
let score = 0;
let isGameOver = false;
let isGameWon = false;
let isCelebrating = false;
let celebrationStartTime = 0;
let animationId;
let lastEnemySpawn = 0;
let enemySpawnRate = 1500; // ms

// Audio
let winAudio = new Audio('https://ia601407.us.archive.org/26/items/StarWarsThemeSongByJohnWilliams/Star%20Wars%20Theme%20Song%20By%20John%20Williams.mp3');
winAudio.volume = 0.5;

let introAudio = new Audio('https://ia601407.us.archive.org/26/items/StarWarsThemeSongByJohnWilliams/Star%20Wars%20Theme%20Song%20By%20John%20Williams.mp3');
introAudio.volume = 0.4;
introAudio.loop = true;

// App View State
let gameStarted = false;
let currentGameMode = 'SHOOTER'; // 'SHOOTER' or 'DUEL'
let currentAppView = 'HUB'; // 'HUB' or 'GAME'

// Shared Game Variables
const MAX_LIVES = 3;
let lives = MAX_LIVES;
const MAX_AMMO = 30;
let ammo = MAX_AMMO;
let isInvulnerable = false;
let invulnerableTime = 0;

// Level Progression
let level = 1;
let tiesDestroyed = 0;
let sdsDestroyed = 0;
let levelTransitionTime = 0;
let isTransitioning = false;
let transitionText1 = "";
let transitionText2 = "";

// Level 3 Specific
let trenchDistance = 0;
const maxTrenchDistance = 5000;
let exhaustPortVisible = false;
let exhaustPortY = -100;

// Spawning
let lastAmmoSpawn = 0;
let lastStarDestroyerSpawn = 0;
let lastAllyFire = 0;
let lastTurretSpawn = 0;

// Persistent Stats
let totalTiesTracker = parseInt(localStorage.getItem('swGame_totalTies')) || 0;
let roundsCompletedTracker = parseInt(localStorage.getItem('swGame_roundsCompleted')) || 0;
let selectedSkin = localStorage.getItem('swGame_selectedSkin') || 'X-Wing';

// Input
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    Space: false
};

// Player Object
const player = {
    x: 400, // Will be centered on reset
    y: 540,
    width: 40,
    height: 40,
    speed: 7,
    // Duel specific
    velocityY: 0,
    isJumping: false,
    isSwinging: false,
    lastSwing: 0
};

// Entity Arrays
const lasers = [];
const enemyLasers = [];
const enemies = [];
const starDestroyers = [];
const turrets = [];
const allies = [];
const stars = [];
const ammoDrops = [];
const fireworks = [];
const shipExplosions = [];
