function updateDuel() {
    const now = Date.now();

    // Player movement
    if (keys.ArrowLeft) player.x -= player.speed;
    if (keys.ArrowRight) player.x += player.speed;

    // Ground & Gravity
    const groundY = canvas.height - 60;
    if (player.y < groundY) {
        player.velocityY += 0.8;
    } else {
        player.y = groundY;
        player.velocityY = 0;
        player.isJumping = false;
    }
    player.y += player.velocityY;

    // Jump
    if (keys.ArrowUp && !player.isJumping) {
        player.velocityY = -15;
        player.isJumping = true;
    }

    // Lightsaber Swing
    if (keys.Space && now - player.lastSwing > 300) {
        player.isSwinging = true;
        player.lastSwing = now;
    }
    if (player.isSwinging && now - player.lastSwing > 200) {
        player.isSwinging = false;
    }

    // Boundary
    if (player.x < 30) player.x = 30;
    if (player.x > canvas.width - 30) player.x = canvas.width - 30;

    // Enemy Spawning
    if (now - lastEnemySpawn > 2000) {
        const side = Math.random() > 0.5;
        enemies.push({
            x: side ? -50 : canvas.width + 50,
            y: groundY,
            speed: side ? 2 : -2,
            lastFire: now
        });
        lastEnemySpawn = now;
    }

    // Update Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.x += e.speed;
        const dist = Math.abs(e.x - player.x);
        if (dist < 250) {
            e.x -= e.speed; // Stop and shoot
            if (now - e.lastFire > 1800) {
                const angle = Math.atan2(player.y - 30 - (e.y - 30), player.x - e.x);
                enemyLasers.push({
                    x: e.x, y: e.y - 35,
                    vx: Math.cos(angle) * 7, vy: Math.sin(angle) * 7,
                    color: '#ff0000'
                });
                e.lastFire = now;
            }
        }
        if (player.isSwinging && Math.abs(e.x - player.x) < 70 && Math.abs(e.y - player.y) < 50) {
            createExplosion(e.x, e.y - 25, '#ffffff');
            enemies.splice(i, 1);
            score += 100; scoreVal.innerText = score;
            continue;
        }
        if (e.x < -100 || e.x > canvas.width + 100) enemies.splice(i, 1);
    }

    // Update Enemy Lasers
    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        const l = enemyLasers[i];
        l.x += l.vx; l.y += l.vy;

        if (player.isSwinging && Math.abs(l.x - player.x) < 50 && Math.abs(l.y - (player.y - 30)) < 40) {
            l.vx *= -1.5; l.vy *= -1.5; l.color = '#00ff00'; l.isDeflected = true;
        }
        if (!l.isDeflected && !isInvulnerable && Math.abs(l.x - player.x) < 20 && Math.abs(l.y - (player.y - 25)) < 30) {
            loseLife(); enemyLasers.splice(i, 1); continue;
        }
        if (l.isDeflected) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if (Math.abs(l.x - e.x) < 25 && Math.abs(l.y - (e.y - 25)) < 30) {
                    createExplosion(e.x, e.y - 25, '#ffffff');
                    enemies.splice(j, 1); enemyLasers.splice(i, 1);
                    score += 200; scoreVal.innerText = score;
                    break;
                }
            }
        }
        if (l.x < -50 || l.x > canvas.width + 50 || l.y < -50 || l.y > canvas.height + 50) enemyLasers.splice(i, 1);
    }
    updateExplosionsShared();
}

function drawDuel() {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#000010'); sky.addColorStop(1, '#1a0033');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#111'; ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.strokeStyle = '#222';
    for (let i = 0; i < canvas.width; i += 40) ctx.strokeRect(i, canvas.height - 40, 40, 40);

    // Player
    ctx.save();
    ctx.translate(player.x, player.y);
    if (isInvulnerable && Math.floor(Date.now() / 100) % 2 === 0) ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#4e342e'; ctx.fillRect(-12, -45, 24, 45); // Body
    ctx.fillStyle = '#ffcc99'; ctx.beginPath(); ctx.arc(0, -52, 10, 0, Math.PI * 2); ctx.fill(); // Head
    ctx.strokeStyle = '#00ff00'; ctx.lineWidth = 5; ctx.shadowBlur = 15; ctx.shadowColor = '#00ff00';
    ctx.beginPath();
    if (player.isSwinging) { ctx.moveTo(10, -25); ctx.lineTo(50, -35); }
    else { ctx.moveTo(10, -25); ctx.lineTo(25, -70); }
    ctx.stroke();
    ctx.restore();

    // Enemies
    enemies.forEach(e => {
        ctx.save(); ctx.translate(e.x, e.y);
        ctx.fillStyle = '#eee'; ctx.fillRect(-15, -50, 30, 50);
        ctx.fillStyle = '#000'; ctx.fillRect(-10, -45, 20, 5); ctx.restore();
    });

    // Lasers
    enemyLasers.forEach(l => {
        ctx.fillStyle = '#fff'; ctx.shadowBlur = 10; ctx.shadowColor = l.color;
        ctx.beginPath(); ctx.arc(l.x, l.y, 4, 0, Math.PI * 2); ctx.fill();
    });

    // Explosions
    shipExplosions.forEach(ex => {
        ex.particles.forEach(p => {
            ctx.fillStyle = ex.color; ctx.globalAlpha = p.life;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        });
    });
    ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffe81f'; ctx.font = '20px Courier New'; ctx.textAlign = 'right';
    ctx.fillText(`LIVES: ${lives}`, canvas.width - 20, 60);
}
