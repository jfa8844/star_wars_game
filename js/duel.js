function initDuelLevel() {
    platforms.length = 0;
    enemies.length = 0;
    enemyLasers.length = 0;
    enemyFragments.length = 0;
    cameraX = 0;
    boss = null;
    healthDrops.length = 0;

    // Hand-crafted realistic layout (Death Star corridor style)
    // Floor segments
    platforms.push({ x: 0, y: canvas.height - 40, w: 1000, h: 40, type: 'floor' });
    platforms.push({ x: 1400, y: canvas.height - 40, w: 1200, h: 40, type: 'floor' });
    platforms.push({ x: 3000, y: canvas.height - 40, w: 800, h: 40, type: 'floor' });
    platforms.push({ x: 4400, y: canvas.height - 40, w: 1200, h: 40, type: 'floor' });

    // Raised walkways and maintenance shafts
    platforms.push({ x: 400, y: canvas.height - 200, w: 300, h: 25 });
    platforms.push({ x: 1000, y: canvas.height - 300, w: 500, h: 25 });
    platforms.push({ x: 1800, y: canvas.height - 220, w: 400, h: 25 });
    platforms.push({ x: 2500, y: canvas.height - 350, w: 300, h: 25 });
    platforms.push({ x: 3300, y: canvas.height - 180, w: 400, h: 25 });

    // Connections
    platforms.push({ x: 1200, y: canvas.height - 120, w: 250, h: 20 });
    platforms.push({ x: 2700, y: canvas.height - 150, w: 200, h: 20 });
    platforms.push({ x: 4000, y: canvas.height - 240, w: 500, h: 20 });

    // Enemies (Stormtroopers)
    const enemyPositions = [500, 900, 1600, 2200, 2600, 3100, 3600, 4200];
    enemyPositions.forEach(ex => {
        enemies.push({
            x: ex, y: 0,
            w: 30, h: 50,
            hp: 1,
            type: 'STORMTROOPER',
            lastFire: Date.now() + Math.random() * 1000,
            dir: -1,
            velocityY: 0
        });
    });
}

function drawStormtrooper(ctx, e) {
    ctx.save();
    ctx.translate(e.x, e.y);

    // Body (Armor plates)
    ctx.fillStyle = '#fff';
    ctx.fillRect(-12, -45, 24, 40); // Torso/Legs

    // Black bodysuit gaps
    ctx.fillStyle = '#000';
    ctx.fillRect(-5, -25, 10, 2); // Belt area
    ctx.fillRect(-13, -35, 2, 10); // Arm gap left
    ctx.fillRect(11, -35, 2, 10); // Arm gap right

    // Helmet
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -50, 10, 0, Math.PI * 2);
    ctx.fill();

    // Helmet Details (Visor/Breath filters)
    ctx.fillStyle = '#000';
    ctx.fillRect(-7, -52, 14, 3); // Visor
    ctx.beginPath();
    ctx.arc(-4, -45, 2, 0, Math.PI * 2); ctx.fill(); // Filter L
    ctx.beginPath();
    ctx.arc(4, -45, 2, 0, Math.PI * 2); ctx.fill(); // Filter R

    // Blaster Rifle (E-11)
    ctx.fillStyle = '#111';
    if (e.dir === -1) {
        ctx.fillRect(-22, -35, 15, 4);
        ctx.fillRect(-22, -32, 4, 6);
    } else {
        ctx.fillRect(7, -35, 15, 4);
        ctx.fillRect(18, -32, 4, 6);
    }

    ctx.restore();
}

function updateDuel() {
    const now = Date.now();

    // Invincibility reset must happen even during celebration/gameover
    if (isInvulnerable && now - invulnerableTime > 2000) isInvulnerable = false;

    if (isGameOver || (isGameWon && !isCelebrating)) return;

    if (!platforms.length) initDuelLevel();

    // Player blocking state
    player.isBlocking = keys.ArrowDown && !player.isJumping;

    // Player movement (cannot move while blocking)
    if (!player.isBlocking) {
        if (keys.ArrowLeft) player.x -= player.speed;
        if (keys.ArrowRight) player.x += player.speed;
    }

    // Gravity
    player.velocityY += 0.8;
    player.y += player.velocityY;

    // Platform Collision
    platforms.forEach(p => {
        if (player.x + 15 > p.x && player.x - 15 < p.x + p.w &&
            player.y > p.y && player.y - player.velocityY <= p.y) {
            player.y = p.y;
            player.velocityY = 0;
            player.isJumping = false;
        }
    });

    // Jump
    if (keys.ArrowUp && !player.isJumping && !player.isBlocking) {
        player.velocityY = -16;
        player.isJumping = true;
    }

    // Camera follow
    if (player.x > cameraX + canvas.width * 0.6) {
        cameraX = player.x - canvas.width * 0.6;
    }
    if (cameraX < 0) cameraX = 0;
    if (cameraX > worldWidth - canvas.width) cameraX = worldWidth - canvas.width;

    // Pits (Restart the level as requested)
    if (player.y > canvas.height + 100) {
        resetGame();
        return;
    }

    // Lightsaber Swing
    if (keys.Space && !player.isBlocking && now - player.lastSwing > 400) {
        player.isSwinging = true;
        player.lastSwing = now;
    }
    if (player.isSwinging && now - player.lastSwing > 200) {
        player.isSwinging = false;
    }

    // Victory Check for Combat (Prevent boss reactivation and combat after win)
    if (isGameWon) {
        updateExplosionsShared();
        return;
    }

    // Boss Activation (Darth Vader)
    if (player.x > 4500 && !boss && !isGameWon) {
        boss = {
            x: 4950, y: canvas.height - 40,
            w: 40, h: 60,
            hp: 12, maxHp: 12,
            type: 'VADER',
            lastAction: now,
            dir: -1,
            state: 'IDLE', // IDLE, MOVE, ATTACK, BLOCK, STUNNED
            stunEnd: 0
        };
    }

    // Update Boss (Darth Vader)
    if (boss) {
        const dist = Math.abs(boss.x - player.x);
        const yDist = Math.abs(boss.y - player.y);

        if (boss.state === 'STUNNED') {
            if (now > boss.stunEnd) boss.state = 'IDLE';
        } else {
            // AI Logic (Slower for difficulty balancing)
            if (now - boss.lastAction > 1200) {
                boss.lastAction = now;
                if (dist > 150) {
                    boss.state = 'MOVE';
                    boss.dir = boss.x > player.x ? -1 : 1;
                } else {
                    // Close range logic
                    const rand = Math.random();
                    if (rand < 0.4) boss.state = 'ATTACK';
                    else if (rand < 0.7) boss.state = 'BLOCK';
                    else boss.state = 'IDLE';
                }
            }

            if (boss.state === 'MOVE') {
                boss.x += boss.dir * 4;
                if (dist < 100) boss.state = 'IDLE';
            }

            if (boss.state === 'ATTACK') {
                if (!boss.isSwinging) {
                    boss.isSwinging = true;
                    boss.swingStart = now;
                }
                if (now - boss.swingStart > 300) {
                    boss.isSwinging = false;
                    boss.state = 'IDLE';
                }
            }
            boss.isBlocking = (boss.state === 'BLOCK');
        }

        // Combat Resolution (Vader vs Luke)
        if (dist < 80 && yDist < 50) {
            // 1. Clashing (Both swing)
            if (player.isSwinging && boss.isSwinging) {
                createExplosion((player.x + boss.x) / 2, player.y - 30, '#ffffff');
                player.isSwinging = false; boss.isSwinging = false;
            }
            // 2. Luke hits Vader
            else if (player.isSwinging && !boss.isBlocking && !boss.isSwinging) {
                boss.hp -= 1;
                boss.state = 'STUNNED'; boss.stunEnd = now + 400;
                createExplosion(boss.x, boss.y - 30, '#ff0000');
                player.isSwinging = false;
                if (boss.hp <= 0) { winGame(); boss = null; }
            }
            // 3. Vader hits Luke
            else if (boss.isSwinging && !player.isBlocking && !player.isSwinging) {
                loseLife();
                boss.isSwinging = false;
            }
            // 4. Parrying (Luke hits Vader's block)
            else if (player.isSwinging && boss.isBlocking) {
                createExplosion((player.x + boss.x) / 2, player.y - 30, '#ffffff');
                player.isSwinging = false;
            }
            // 5. Blocking (Vader hits Luke's block)
            else if (boss.isSwinging && player.isBlocking) {
                createExplosion((player.x + boss.x) / 2, player.y - 30, '#ffffff');
                boss.isSwinging = false;
            }
        }
    }

    // Update Enemies (Stormtroopers)
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];

        // Physics and Gravity
        e.velocityY = (e.velocityY || 0) + 0.8;
        e.y += e.velocityY;

        // Platform Collision for Enemies
        platforms.forEach(p => {
            if (e.x + 10 > p.x && e.x - 10 < p.x + p.w &&
                e.y > p.y && e.y - e.velocityY <= p.y) {
                e.y = p.y;
                e.velocityY = 0;
            }
        });

        const distToPlayer = Math.abs(e.x - player.x);
        if (distToPlayer < 600) {
            e.x += e.dir * 1;
            if (Math.random() < 0.01) e.dir *= -1;
            if (distToPlayer < 400 && now - e.lastFire > 2500) {
                const angle = Math.atan2(player.y - 30 - (e.y - 30), player.x - e.x);
                enemyLasers.push({ x: e.x, y: e.y - 35, vx: Math.cos(angle) * 6, vy: Math.sin(angle) * 6, color: '#ff0000', size: 4 });
                e.lastFire = now;
            }
            if (player.isSwinging && distToPlayer < 70 && Math.abs(e.y - player.y) < 50) {
                enemyFragments.push({ x: e.x, y: e.y - 25, vx: e.dir * 2, vy: -5, rot: 0, vrot: 0.1, part: 'top' });
                enemyFragments.push({ x: e.x, y: e.y, vx: e.dir * -1, vy: -2, rot: 0, vrot: -0.05, part: 'bottom' });
                enemies.splice(i, 1); score += 100; scoreVal.innerText = score;
                continue;
            }
        }
    }

    // Update Fragments, Lasers
    for (let f of enemyFragments) { f.x += f.vx; f.y += f.vy; f.vy += 0.5; f.rot += f.vrot; }

    // Falling Hearts during Vader Battle (Increased frequency)
    if (boss && !isGameWon && Math.random() < 0.015) {
        healthDrops.push({
            x: cameraX + Math.random() * canvas.width,
            y: -20,
            velocityY: 2 + Math.random() * 2,
            size: 20
        });
    }

    for (let i = healthDrops.length - 1; i >= 0; i--) {
        const h = healthDrops[i];
        h.y += h.velocityY;
        // Collision with player
        if (Math.abs(h.x - player.x) < 30 && Math.abs(h.y - (player.y - 25)) < 30) {
            lives = Math.min(MAX_LIVES, lives + 1);
            updateHealthUI();
            healthDrops.splice(i, 1);
            continue;
        }
        if (h.y > canvas.height + 50) healthDrops.splice(i, 1);
    }

    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        const l = enemyLasers[i]; l.x += l.vx; l.y += l.vy;
        if (player.isSwinging && Math.abs(l.x - player.x) < 50 && Math.abs(l.y - (player.y - 30)) < 40) {
            l.vx *= -1.5; l.vy *= -1.5; l.color = '#00ff00'; l.isDeflected = true;
        }
        if (!l.isDeflected && !isInvulnerable && !player.isBlocking && Math.abs(l.x - player.x) < 20 && Math.abs(l.y - (player.y - 25)) < 30) {
            loseLife(); enemyLasers.splice(i, 1); continue;
        }
        if (l.isDeflected) {
            enemies.forEach((e, idx) => {
                if (Math.abs(l.x - e.x) < 30 && Math.abs(l.y - (e.y - 25)) < 40) {
                    createExplosion(e.x, e.y - 25, '#ffffff'); enemies.splice(idx, 1); enemyLasers.splice(i, 1); score += 200; scoreVal.innerText = score;
                }
            });
        }
        if (l.x < cameraX - 100 || l.x > cameraX + canvas.width + 100) enemyLasers.splice(i, 1);
    }
    updateExplosionsShared();
}

function drawDeathStarBackground() {
    // Distant wall panels
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(cameraX, 0, canvas.width, canvas.height);

    // Large structural beams (parallax effect)
    ctx.fillStyle = '#050508';
    for (let i = 0; i < 15; i++) {
        const bx = (i * 800 - cameraX * 0.3) % (worldWidth + 800);
        ctx.fillRect(bx, 0, 120, canvas.height);

        // Horizontal ribs on beams
        ctx.fillStyle = '#08080a';
        for (let j = 0; j < canvas.height; j += 150) {
            ctx.fillRect(bx, j, 120, 10);
        }
        ctx.fillStyle = '#050508';
    }

    // Glowing wall panels and energy lines
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let x = -cameraX % 400; x < canvas.width; x += 400) {
        ctx.strokeRect(x, 100, 300, 400);
        // Small blue lights
        ctx.fillStyle = '#003366';
        ctx.fillRect(x + 20, 120, 10, 5);
        ctx.fillRect(x + 20, 135, 10, 5);
        ctx.fillRect(x + 270, 480, 10, 5);
    }
}

function drawDuel() {
    const now = Date.now();
    ctx.save();

    // 1. Static Background (Wall panels/Beams)
    drawDeathStarBackground();

    ctx.translate(-cameraX, 0);

    // 2. Distant Stars (through "windows" or vents)
    ctx.fillStyle = '#fff';
    for (let i = 0; i < worldWidth; i += 300) {
        if (Math.sin(i) > 0.8) {
            ctx.globalAlpha = 0.3;
            for (let j = 0; j < 5; j++) {
                ctx.fillRect(i + Math.random() * 200, 50 + Math.random() * 100, 1, 1);
            }
            ctx.globalAlpha = 1.0;
        }
    }

    // 3. Platforms (Greebled)
    platforms.forEach(p => {
        if (p.x + p.w > cameraX && p.x < cameraX + canvas.width) {
            // Main metal plate
            const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
            grad.addColorStop(0, '#2a2a2e'); grad.addColorStop(0.3, '#444'); grad.addColorStop(1, '#1a1a1e');
            ctx.fillStyle = grad;
            ctx.fillRect(p.x, p.y, p.w, p.h);

            // Industrial details (Rivets)
            ctx.fillStyle = '#111';
            for (let rx = p.x + 10; rx < p.x + p.w; rx += 40) {
                ctx.beginPath(); ctx.arc(rx, p.y + 8, 2, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(rx, p.y + p.h - 8, 2, 0, Math.PI * 2); ctx.fill();
            }

            // Hazard stripes (yellow/black)
            ctx.fillStyle = '#d4af37';
            ctx.save();
            ctx.clip();
            for (let sx = p.x; sx < p.x + p.w; sx += 40) {
                ctx.beginPath();
                ctx.moveTo(sx, p.y); ctx.lineTo(sx + 20, p.y);
                ctx.lineTo(sx - 10, p.y + p.h); ctx.lineTo(sx - 30, p.y + p.h);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            // Glow strip (cyan energy)
            ctx.fillStyle = '#00ffff';
            ctx.globalAlpha = 0.4 + Math.sin(now / 300) * 0.2;
            ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff';
            ctx.fillRect(p.x + 5, p.y + 2, p.w - 10, 2);
            ctx.shadowBlur = 0; ctx.globalAlpha = 1.0;

            // Support beams (underneath)
            ctx.fillStyle = '#111';
            ctx.fillRect(p.x + 20, p.y + p.h, 15, 600);
            ctx.fillRect(p.x + p.w - 35, p.y + p.h, 15, 600);
        }
    });

    // 4. Player Lighting (Atmospheric glow)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const playerGlow = ctx.createRadialGradient(player.x, player.y - 40, 0, player.x, player.y - 40, 150);
    playerGlow.addColorStop(0, 'rgba(0, 255, 0, 0.15)');
    playerGlow.addColorStop(1, 'rgba(0, 255, 0, 0)');
    ctx.fillStyle = playerGlow;
    ctx.fillRect(player.x - 150, player.y - 190, 300, 300);
    ctx.restore();

    // Player Drawing (Same as before but refined)
    ctx.save();
    ctx.translate(player.x, player.y);
    if (isInvulnerable && Math.floor(now / 100) % 2 === 0) ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#e0c9a6'; ctx.fillRect(-12, -45, 24, 45); // Body
    ctx.fillStyle = '#ffcc99'; ctx.beginPath(); ctx.arc(0, -52, 11, 0, Math.PI * 2); ctx.fill(); // Head
    ctx.fillStyle = '#d4a373'; ctx.beginPath(); ctx.arc(0, -56, 12, Math.PI, 0); ctx.fill(); // Hair
    ctx.strokeStyle = '#00ff00'; ctx.lineWidth = 5; ctx.shadowBlur = 15; ctx.shadowColor = '#00ff00'; ctx.beginPath();
    if (player.isBlocking) { ctx.moveTo(-5, -10); ctx.lineTo(-5, -60); }
    else if (player.isSwinging) { ctx.moveTo(10, -25); ctx.lineTo(55, -30); }
    else { ctx.moveTo(10, -25); ctx.lineTo(25, -75); }
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.restore();

    // 5. Enemies (Stormtroopers)
    enemies.forEach(e => {
        drawStormtrooper(ctx, e);
    });

    // 6. Boss (Darth Vader)
    if (boss) {
        // Vader Lighting
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const vaderGlow = ctx.createRadialGradient(boss.x, boss.y - 40, 0, boss.x, boss.y - 40, 200);
        vaderGlow.addColorStop(0, 'rgba(255, 0, 0, 0.2)');
        vaderGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = vaderGlow;
        ctx.fillRect(boss.x - 200, boss.y - 240, 400, 400);
        ctx.restore();

        ctx.save(); ctx.translate(boss.x, boss.y);
        if (boss.state === 'STUNNED' && Math.floor(now / 50) % 2 === 0) ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#000'; ctx.fillRect(-20, -60, 40, 60); // Body
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, -65, 14, 0, Math.PI * 2); ctx.fill(); // Helmet
        ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 6; ctx.shadowBlur = 20; ctx.shadowColor = '#ff0000'; ctx.beginPath();
        if (boss.isBlocking) { ctx.moveTo(5, -10); ctx.lineTo(5, -65); }
        else if (boss.isSwinging) { ctx.moveTo(-10, -30); ctx.lineTo(-65, -35); }
        else { ctx.moveTo(-15, -30); ctx.lineTo(-30, -80); }
        ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#333'; ctx.fillRect(-50, -110, 100, 10);
        ctx.fillStyle = '#ff0000'; ctx.fillRect(-50, -110, (boss.hp / boss.maxHp) * 100, 10);
        ctx.restore();
    }

    // 7. Projectiles and Fragments
    enemyLasers.forEach(l => {
        ctx.fillStyle = '#fff'; ctx.shadowBlur = 10; ctx.shadowColor = l.color;
        ctx.beginPath(); ctx.arc(l.x, l.y, l.size || 4, 0, Math.PI * 2); ctx.fill();
    });
    enemyFragments.forEach(f => {
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
        ctx.fillStyle = '#eee'; ctx.fillRect(-15, f.part === 'top' ? -25 : 0, 30, 25);
        ctx.restore();
    });

    shipExplosions.forEach(ex => {
        ex.particles.forEach(p => {
            ctx.fillStyle = ex.color; ctx.globalAlpha = p.life;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        });
    });

    healthDrops.forEach(h => {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.fillStyle = '#ff3333';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff3333';
        // Draw Heart Shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-10, -10, -20, 0, 0, 15);
        ctx.bezierCurveTo(20, 0, 10, -10, 0, 0);
        ctx.fill();
        ctx.restore();
    });

    ctx.restore(); // End camera transform

    // UI Overlay (Static Health Bar is in DOM)

    if (boss) {
        ctx.textAlign = 'center'; ctx.fillStyle = '#ff0000'; ctx.font = '24px Courier New';
        ctx.fillText("DARTH VADER", canvas.width / 2, 80);
        if (player.x > 4500) {
            ctx.fillStyle = '#fff'; ctx.font = '16px Courier New';
            ctx.fillText("↓ TO BLOCK | SPACE TO STRIKE", canvas.width / 2, canvas.height - 20);
        }
    }
}
