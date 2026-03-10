function triggerTransition(nextLevel, msg1, msg2) {
    isTransitioning = true;
    levelTransitionTime = Date.now();
    transitionText1 = msg1;
    transitionText2 = msg2;

    enemies.length = 0;
    enemyLasers.length = 0;
    starDestroyers.length = 0;
    turrets.length = 0;

    lives = MAX_LIVES;
    level = nextLevel;
}

function createExplosion(x, y, baseColor) {
    let numParticles = 20 + Math.random() * 20;
    let particles = [];
    for (let i = 0; i < numParticles; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 5 + 1;
        particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: Math.random() * 0.05 + 0.02,
            size: Math.random() * 4 + 2
        });
    }
    shipExplosions.push({ particles: particles, color: baseColor });
}

function loseLife() {
    if (isInvulnerable || isGameOver || isGameWon || isTransitioning) return;

    createExplosion(player.x, player.y, '#ff8800');

    lives--;
    if (lives <= 0) {
        endGame();
    } else {
        isInvulnerable = true;
        invulnerableTime = Date.now();
    }
    updateHealthUI();
}

function setupStars() {
    stars.length = 0;
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 4 + 1
        });
    }
}

function updateExplosionsShared() {
    for (let i = shipExplosions.length - 1; i >= 0; i--) {
        const ex = shipExplosions[i];
        for (let j = ex.particles.length - 1; j >= 0; j--) {
            let p = ex.particles[j];
            p.x += p.vx; p.y += p.vy; p.life -= p.decay;
            if (p.life <= 0) ex.particles.splice(j, 1);
        }
        if (ex.particles.length === 0) shipExplosions.splice(i, 1);
    }
}
