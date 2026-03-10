// Global Update
function update() {
    if (currentGameMode === 'SHOOTER') {
        updateShooter();
    } else if (currentGameMode === 'DUEL') {
        updateDuel();
    }
}

// Global Draw
function draw() {
    // Clear canvas background
    ctx.fillStyle = '#020205';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (currentGameMode === 'SHOOTER') {
        drawShooter();
    } else if (currentGameMode === 'DUEL') {
        drawDuel();
    }
}

// Main Game Loop (Persistent to prevent "super speed" bugs)
function loop() {
    if (gameStarted && !isGameOver && (!isGameWon || isCelebrating)) {
        update();
    }
    draw();
    requestAnimationFrame(loop);
}

// Game Completion Logic
function endGame() {
    console.log("Entering endGame state...");
    isGameOver = true;
    introAudio.pause();
    introAudio.currentTime = 0;
    const screen = document.getElementById('gameOver');
    if (screen) {
        screen.style.display = 'block';
        screen.querySelector('h2').innerText = "GAME OVER";
        screen.querySelector('p').innerText = currentGameMode === 'SHOOTER' ? "The Empire Got You." : "The Stormtroopers overwhelmed you.";
        finalScore.innerText = score;
        restartBtn.innerText = "PLAY AGAIN";
    } else {
        console.error("Game Over screen element not found!");
    }
}

function winGame() {
    isGameWon = true;
    isCelebrating = true;
    celebrationStartTime = Date.now();
    score += 1000;

    introAudio.pause();
    introAudio.currentTime = 0;

    roundsCompletedTracker++;
    localStorage.setItem('swGame_roundsCompleted', roundsCompletedTracker);
    updateSkinsMenu();

    gameOverScreen.style.display = 'none';
    skipBtn.style.display = 'none';

    winAudio.currentTime = 0;
    winAudio.play().catch(e => console.log("Audio play failed:", e));

    gameOverScreen.querySelector('h2').innerText = "VICTORY!";
    gameOverScreen.querySelector('h2').style.color = "#00ff00";
    gameOverScreen.querySelector('h2').style.textShadow = "0 0 10px #00ff00";
    gameOverScreen.querySelector('p').innerText = "The Death Star is destroyed!";
    finalScore.innerText = score;
    restartBtn.innerText = "PLAY AGAIN";
}

function finishCelebration() {
    isCelebrating = false;
    winAudio.pause();
    winAudio.currentTime = 0;
    skipBtn.style.display = 'none';
    gameOverScreen.style.display = 'block';
}

skipBtn.addEventListener('click', finishCelebration);

function resetGame() {
    score = 0;
    level = 1;
    tiesDestroyed = 0;
    sdsDestroyed = 0;
    lives = MAX_LIVES;
    isInvulnerable = false;
    isTransitioning = false;
    isCelebrating = false;
    skipBtn.style.display = 'none';
    winAudio.pause();
    winAudio.currentTime = 0;

    introAudio.currentTime = 0;
    if (currentGameMode === 'SHOOTER') {
        introAudio.play().catch(e => console.log(e));
    }

    scoreVal.innerText = score;
    isGameOver = false;
    isGameWon = false;
    updateHealthUI();
    updateAmmoUI();
    gameOverScreen.style.display = 'none';

    if (currentGameMode === 'DUEL') {
        player.x = 100;
    } else {
        player.x = canvas.width / 2;
    }
    updateHealthUI();
    player.y = canvas.height - 60;
    player.velocityY = 0;
    player.isJumping = false;
    player.isSwinging = false;

    // Clear arrays
    lasers.length = 0;
    enemyLasers.length = 0;
    enemies.length = 0;
    starDestroyers.length = 0;
    turrets.length = 0;
    allies.length = 0;
    ammoDrops.length = 0;
    shipExplosions.length = 0;
    fireworks.length = 0;

    // Duel Specific Reset
    cameraX = 0;
    boss = null;
    enemyFragments.length = 0;
    platforms.length = 0;
    if (currentGameMode === 'DUEL') initDuelLevel();

    lastEnemySpawn = 0;
    lastStarDestroyerSpawn = 0;
    lastAmmoSpawn = Date.now();
    enemySpawnRate = 1500;

    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    keys.ArrowUp = false;
    keys.ArrowDown = false;
    keys.Space = false;

    gameOverScreen.querySelector('h2').style.color = "#ff3333";
    gameOverScreen.querySelector('h2').style.textShadow = "0 0 10px #ff3333";
}

// Global Input Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.code === 'ArrowRight') keys.ArrowRight = true;
    if (e.code === 'ArrowUp') keys.ArrowUp = true;
    if (e.code === 'ArrowDown') keys.ArrowDown = true;
    if (e.code === 'Space') {
        if (currentGameMode === 'SHOOTER') {
            if (!keys.Space) shoot();
        }
        keys.Space = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.code === 'ArrowRight') keys.ArrowRight = false;
    if (e.code === 'ArrowUp') keys.ArrowUp = false;
    if (e.code === 'ArrowDown') keys.ArrowDown = false;
    if (e.code === 'Space') keys.Space = false;
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    setupStars();
    updateHealthUI();

    // Mission Listeners (Moved here to ensure resetGame is defined)
    document.getElementById('selectShooter').addEventListener('click', () => {
        currentGameMode = 'SHOOTER';
        currentAppView = 'GAME';
        document.getElementById('hubScreen').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        document.getElementById('startScreen').style.display = 'flex';
        document.querySelector('#startScreen h1').innerHTML = "STAR WARS<br>HYPERSPACE SURVIVOR";
        document.querySelector('#startScreen p').innerText = "Survive the asteroid field, defeat the Empire, and destroy the Death Star. May the Force be with you.";
    });

    document.getElementById('selectDuel').addEventListener('click', () => {
        currentGameMode = 'DUEL';
        currentAppView = 'GAME';
        document.getElementById('hubScreen').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        document.getElementById('startScreen').style.display = 'flex';
        document.querySelector('#startScreen h1').innerHTML = "STAR WARS<br>LIGHTSABER DUEL";
        document.querySelector('#startScreen p').innerText = "Master the Force, deflect blaster bolts, and defeat the Stormtroopers. The destiny of the Jedi is in your hands.";
        document.getElementById('skinsBtn').style.display = 'none';
        resetGame();
    });

    restartBtn.addEventListener('click', resetGame);

    const backToHub = () => {
        gameStarted = false;
        isGameOver = false;
        isGameWon = false;
        isCelebrating = false;
        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('hubScreen').style.display = 'flex';
        currentAppView = 'HUB';
        introAudio.pause();
        introAudio.currentTime = 0;
        winAudio.pause();
        winAudio.currentTime = 0;
        // Persistent loop manages itself, no need to cancel or restart
    };

    document.getElementById('backToHubBtn').addEventListener('click', backToHub);
    document.getElementById('backToHubGameOverBtn').addEventListener('click', backToHub);

    // Initial loop start
    requestAnimationFrame(loop);
});
