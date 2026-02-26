function spawnEnemy(now) {
    if (isGameOver || isTransitioning || isGameWon) return;

    if (level === 3) {
        if (!exhaustPortVisible && now - lastTurretSpawn > 1000) {
            const isLeft = Math.random() > 0.5;
            turrets.push({
                x: isLeft ? 60 : canvas.width - 60,
                y: -50,
                width: 30,
                height: 30,
                speed: 5,
                hp: 3,
                lastFire: now,
                isLeft: isLeft
            });
            lastTurretSpawn = now;
        }

        if (!exhaustPortVisible && now - lastEnemySpawn > 2500) {
            const x = Math.random() * (canvas.width - 300) + 150;
            enemies.push({ x: x, y: -50, width: 40, height: 40, speed: 4, hp: 1 });
            lastEnemySpawn = now;
        }
    } else {
        if (now - lastEnemySpawn > enemySpawnRate) {
            const x = Math.random() * (canvas.width - 60) + 30;
            let baseSpeed = 3;
            let speedVariance = 3;
            let speedScale = 0.05;

            if (level === 2) {
                baseSpeed = 2.0;
                speedVariance = 1.0;
                speedScale = 0.02;
            }

            enemies.push({
                x: x, y: -50, width: 40, height: 40,
                speed: baseSpeed + Math.random() * speedVariance + (score * speedScale),
                hp: 1
            });
            lastEnemySpawn = now;
            enemySpawnRate = Math.max(400, 1500 - (score * 15));
        }

        if (level === 2) {
            if (now - lastStarDestroyerSpawn > 6000 + Math.random() * 4000) {
                const x = Math.random() * (canvas.width - 200) + 100;
                starDestroyers.push({
                    x: x, y: -150, width: 140, height: 200, speed: 1.5, hp: 15, lastFire: now
                });
                lastStarDestroyerSpawn = now;
            }
        }
    }

    if (now - lastAmmoSpawn > 8000 + Math.random() * 5000) {
        const dropX = Math.random() * (canvas.width - 60) + 30;
        ammoDrops.push({ x: dropX, y: -30, width: 25, height: 25, speed: 2.5 });
        lastAmmoSpawn = now;
    }
}

function shoot() {
    if (isGameOver || ammo <= 0 || isTransitioning || isGameWon) return;
    const now = Date.now();
    if (!player.lastShot) player.lastShot = 0;
    if (now - player.lastShot > 250) {
        lasers.push({ x: player.x - 18, y: player.y, width: 4, height: 18, speed: 15, color: '#00ff00', isAlly: true });
        lasers.push({ x: player.x + 18, y: player.y, width: 4, height: 18, speed: 15, color: '#00ff00', isAlly: true });
        player.lastShot = now;
        ammo--;
        updateAmmoUI();
    }
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    if (isInvulnerable && Math.floor(Date.now() / 100) % 2 === 0) ctx.globalAlpha = 0.3;

    if (selectedSkin === 'TIE Fighter') {
        ctx.fillStyle = '#111'; ctx.strokeStyle = '#666'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-25, -20); ctx.lineTo(-20, -25); ctx.lineTo(-20, 25); ctx.lineTo(-25, 20); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(25, -20); ctx.lineTo(20, -25); ctx.lineTo(20, 25); ctx.lineTo(25, 20); ctx.closePath(); ctx.fill(); ctx.stroke();
        let strutGrad = ctx.createLinearGradient(0, -5, 0, 5);
        strutGrad.addColorStop(0, '#555'); strutGrad.addColorStop(0.5, '#999'); strutGrad.addColorStop(1, '#333');
        ctx.fillStyle = strutGrad; ctx.fillRect(-20, -4, 40, 8);
        let podGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 14);
        podGrad.addColorStop(0, '#999'); podGrad.addColorStop(1, '#333');
        ctx.fillStyle = podGrad; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.moveTo(-8, 0); ctx.lineTo(8, 0);
        ctx.moveTo(-6, -6); ctx.lineTo(6, 6); ctx.moveTo(-6, 6); ctx.lineTo(6, -6); ctx.stroke();
    } else if (selectedSkin === 'Millennium Falcon') {
        let hullGrad = ctx.createRadialGradient(0, 5, 5, 0, 5, 22);
        hullGrad.addColorStop(0, '#e5e5e5'); hullGrad.addColorStop(1, '#aaaaaa');
        ctx.fillStyle = hullGrad; ctx.strokeStyle = '#777'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 5, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 5, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, -15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-18, -3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(18, -3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 12); ctx.lineTo(-15, 16); ctx.stroke();
        ctx.fillStyle = '#d5d5d5';
        ctx.beginPath(); ctx.moveTo(-4, -5); ctx.lineTo(-14, -28); ctx.lineTo(-6, -28); ctx.lineTo(0, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(4, -5); ctx.lineTo(14, -28); ctx.lineTo(6, -28); ctx.lineTo(0, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#b03030'; ctx.fillRect(-12, -22, 6, 2); ctx.fillRect(6, -22, 6, 2);
        ctx.fillStyle = '#d5d5d5'; ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(28, -6); ctx.lineTo(31, -1); ctx.lineTo(17, 10); ctx.fill(); ctx.stroke();
        let podGrad = ctx.createRadialGradient(31, -3, 1, 31, -3, 5);
        podGrad.addColorStop(0, '#999'); podGrad.addColorStop(1, '#444');
        ctx.fillStyle = podGrad; ctx.beginPath(); ctx.arc(31, -3, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#88ccff'; ctx.beginPath(); ctx.arc(30.5, -4, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#999'; ctx.beginPath(); ctx.arc(-10, -2, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#444'; ctx.beginPath(); ctx.arc(-10, -2, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 18; ctx.shadowColor = '#66ccff';
        ctx.beginPath(); ctx.arc(0, 5, 20.5, 0.25 * Math.PI, 0.75 * Math.PI); ctx.lineWidth = 4; ctx.strokeStyle = '#e0f7fa'; ctx.stroke();
        ctx.shadowBlur = 0;
    } else if (selectedSkin === 'Death Star') {
        let dsGrad = ctx.createRadialGradient(-5, -5, 5, 0, 0, 25);
        dsGrad.addColorStop(0, '#dddddd'); dsGrad.addColorStop(1, '#555555');
        ctx.fillStyle = dsGrad; ctx.strokeStyle = '#333';
        ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-25, 0); ctx.lineTo(25, 0); ctx.stroke();
        let dishGrad = ctx.createRadialGradient(-8, -10, 2, -8, -10, 8);
        dishGrad.addColorStop(0, '#333'); dishGrad.addColorStop(1, '#777');
        ctx.fillStyle = dishGrad; ctx.beginPath(); ctx.arc(-8, -10, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-8, -10, 2, 0, Math.PI * 2); ctx.fill();
        if (keys.Space) {
            ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 15; ctx.shadowColor = '#00ff00';
            ctx.beginPath(); ctx.arc(-8, -10, 3, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.fillStyle = '#ffffcc';
        for (let i = 0; i < 15; i++) {
            let rx = (Math.random() - 0.5) * 35; let ry = (Math.random() - 0.5) * 35;
            if (rx * rx + ry * ry < 400 && (Math.abs(rx - (-8)) > 10 || Math.abs(ry - (-10)) > 10)) { ctx.fillRect(rx, ry, 1, 1); }
        }
    } else if (selectedSkin === 'B-wing') {
        ctx.fillStyle = '#ddd'; ctx.strokeStyle = '#888'; ctx.fillRect(-6, 5, 12, 10); ctx.strokeRect(-6, 5, 12, 10);
        ctx.fillRect(-35, -2, 70, 6); ctx.fillRect(30, -8, 8, 15);
        ctx.beginPath(); ctx.arc(-30, 0, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#112233'; ctx.beginPath(); ctx.arc(-30, -2, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 15; ctx.shadowColor = '#ff66b2'; ctx.fillRect(-3, 15, 6, 4);
        ctx.shadowBlur = 0;
    } else if (selectedSkin === 'Star Destroyer') {
        let sdGrad = ctx.createLinearGradient(-35, -50, 35, 50);
        sdGrad.addColorStop(0, '#dddddd'); sdGrad.addColorStop(1, '#777777');
        ctx.fillStyle = sdGrad; ctx.strokeStyle = '#555';
        ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(35, 30); ctx.lineTo(-35, 30); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(0, 30); ctx.stroke();
        ctx.fillStyle = '#666'; ctx.fillRect(-10, 20, 20, 6); ctx.fillRect(-5, 15, 10, 5);
        ctx.fillStyle = '#fff'; ctx.shadowBlur = 15; ctx.shadowColor = '#66ccff';
        ctx.beginPath(); ctx.arc(0, 30, 5, 0, Math.PI * 2); ctx.arc(-15, 28, 4, 0, Math.PI * 2); ctx.arc(15, 28, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    } else {
        let noseGrad = ctx.createLinearGradient(-5, -25, 5, 20);
        noseGrad.addColorStop(0, '#fff'); noseGrad.addColorStop(0.5, '#aaa'); noseGrad.addColorStop(1, '#666');
        ctx.fillStyle = noseGrad; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(8, -5); ctx.lineTo(10, 20); ctx.lineTo(-10, 20); ctx.lineTo(-8, -5); ctx.fill();
        ctx.fillStyle = '#112233'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(5, 5); ctx.lineTo(-5, 5); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 8, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0000ff'; ctx.fillRect(-2, 6, 4, 2);
        ctx.fillStyle = '#888'; ctx.beginPath(); ctx.moveTo(10, 5); ctx.lineTo(35, 5); ctx.lineTo(35, 15); ctx.lineTo(10, 15); ctx.fill();
        ctx.strokeStyle = '#b22222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(15, 8); ctx.lineTo(30, 8); ctx.stroke();
        ctx.fillStyle = '#999'; ctx.fillRect(33, -15, 3, 30); ctx.fillStyle = '#ff3333'; ctx.fillRect(33, -15, 3, 8);
        ctx.fillStyle = '#888'; ctx.beginPath(); ctx.moveTo(-10, 5); ctx.lineTo(-35, 5); ctx.lineTo(-35, 15); ctx.lineTo(-10, 15); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-15, 8); ctx.lineTo(-30, 8); ctx.stroke();
        ctx.fillStyle = '#999'; ctx.fillRect(-36, -15, 3, 30); ctx.fillStyle = '#ff3333'; ctx.fillRect(-36, -15, 3, 8);
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 15; ctx.shadowColor = '#ff66b2';
        ctx.fillRect(-8, 20, 5, 8); ctx.fillRect(3, 20, 5, 8);
        ctx.shadowBlur = 0;
    }
    ctx.restore();
}

function drawStarDestroyer(sd) {
    ctx.save(); ctx.translate(sd.x, sd.y);
    let sdGrad = ctx.createLinearGradient(-70, -100, 70, 100);
    sdGrad.addColorStop(0, '#dddddd'); sdGrad.addColorStop(0.5, '#999999'); sdGrad.addColorStop(1, '#555555');
    ctx.fillStyle = sdGrad; ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 100); ctx.lineTo(-70, -100); ctx.lineTo(70, -100); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 100); ctx.lineTo(0, -100); ctx.stroke();
    ctx.fillStyle = '#777';
    for (let i = 0; i < 30; i++) {
        let r1 = Math.random(); let r2 = Math.random(); if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
        let gx = -70 * r1 + 70 * r2; let gy = -100 * r1 - 100 * r2 + 100 * (1 - r1 - r2);
        ctx.globalAlpha = Math.random() * 0.5 + 0.2; ctx.fillRect(gx, gy, Math.random() * 6 + 2, Math.random() * 6 + 2);
    }
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#ffffcc'; ctx.shadowBlur = 5; ctx.shadowColor = '#ffffcc';
    for (let i = 0; i < 20; i++) { ctx.fillRect((Math.random() > 0.5 ? 1 : -1) * (Math.random() * 10 + 2), Math.random() * 180 - 90, 1, 1); }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#777'; ctx.fillRect(-15, -95, 30, 20); ctx.fillStyle = '#666'; ctx.fillRect(-25, -90, 50, 12); ctx.fillStyle = '#888'; ctx.fillRect(-20, -105, 40, 10);
    ctx.fillStyle = '#fff'; ctx.fillRect(-18, -100, 2, 2); ctx.fillRect(16, -100, 2, 2);
    ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 25; ctx.shadowColor = '#66ccff';
    ctx.beginPath(); ctx.arc(-30, -100, 10, 0, Math.PI * 2); ctx.arc(0, -100, 15, 0, Math.PI * 2); ctx.arc(30, -100, 10, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.beginPath(); ctx.arc(-30, -100, 4, 0, Math.PI * 2); ctx.arc(0, -100, 7, 0, Math.PI * 2); ctx.arc(30, -100, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function drawEnemy(e) {
    ctx.save(); ctx.translate(e.x, e.y);
    ctx.fillStyle = '#111'; ctx.strokeStyle = '#666'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-25, -20); ctx.lineTo(-20, -25); ctx.lineTo(-20, 25); ctx.lineTo(-25, 20); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(25, -20); ctx.lineTo(20, -25); ctx.lineTo(20, 25); ctx.lineTo(25, 20); ctx.closePath(); ctx.fill(); ctx.stroke();
    let strutGrad = ctx.createLinearGradient(0, -5, 0, 5); strutGrad.addColorStop(0, '#555'); strutGrad.addColorStop(0.5, '#999'); strutGrad.addColorStop(1, '#333');
    ctx.fillStyle = strutGrad; ctx.fillRect(-20, -4, 40, 8);
    let podGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 14); podGrad.addColorStop(0, '#999'); podGrad.addColorStop(1, '#333');
    ctx.fillStyle = podGrad; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.moveTo(-6, -6); ctx.lineTo(6, 6); ctx.moveTo(-6, 6); ctx.lineTo(6, -6); ctx.stroke();
    ctx.fillStyle = '#00ff00'; ctx.shadowBlur = 5; ctx.shadowColor = '#00ff00'; ctx.beginPath(); ctx.arc(-4, 12, 1.5, 0, Math.PI * 2); ctx.arc(4, 12, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.restore();
}

function drawTurret(t) {
    ctx.save(); ctx.translate(t.x, t.y);
    ctx.fillStyle = '#444'; ctx.fillRect(-18, -18, 36, 36);
    ctx.strokeStyle = '#222'; ctx.strokeRect(-18, -18, 36, 36);
    ctx.fillStyle = '#666'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
    let dx = player.x - t.x; let dy = player.y - t.y; ctx.rotate(Math.atan2(dy, dx) - Math.PI / 2);
    let barrelGrad = ctx.createLinearGradient(-8, 0, 8, 0); barrelGrad.addColorStop(0, '#555'); barrelGrad.addColorStop(0.5, '#bbb'); barrelGrad.addColorStop(1, '#555');
    ctx.fillStyle = barrelGrad; ctx.fillRect(-6, 0, 4, 25); ctx.fillRect(2, 0, 4, 25);
    ctx.fillStyle = '#222'; ctx.fillRect(-7, 20, 6, 5); ctx.fillRect(1, 20, 6, 5);
    let domeGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 10); domeGrad.addColorStop(0, '#aaa'); domeGrad.addColorStop(1, '#333');
    ctx.fillStyle = domeGrad; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff0000'; ctx.shadowBlur = 5; ctx.shadowColor = '#ff0000'; ctx.beginPath(); ctx.arc(-5, -5, 2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.restore();
}

function drawExhaustPort() {
    ctx.save(); ctx.translate(canvas.width / 2, exhaustPortY);
    ctx.fillStyle = '#333'; ctx.fillRect(-100, -50, 200, 100);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
    for (let i = -100; i <= 100; i += 20) { ctx.beginPath(); ctx.moveTo(i, -50); ctx.lineTo(i, 50); ctx.stroke(); }
    ctx.fillStyle = '#444'; ctx.beginPath(); ctx.arc(0, 0, 35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    let holeGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 25); holeGrad.addColorStop(0, '#000'); holeGrad.addColorStop(1, '#222');
    ctx.fillStyle = holeGrad; ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 4; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ff3333'; ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 100) * 0.2; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1.0;
    if (player.x > canvas.width / 2 - 25 && player.x < canvas.width / 2 + 25) {
        ctx.strokeStyle = '#ff3333'; ctx.lineWidth = 3; ctx.shadowBlur = 10; ctx.shadowColor = '#ff0000';
        ctx.beginPath(); ctx.moveTo(-25, -40); ctx.lineTo(-40, -40); ctx.lineTo(-40, -25);
        ctx.moveTo(25, -40); ctx.lineTo(40, -40); ctx.lineTo(40, -25);
        ctx.moveTo(40, 25); ctx.lineTo(40, 40); ctx.lineTo(25, 40);
        ctx.moveTo(-25, 40); ctx.lineTo(-40, 40); ctx.lineTo(-40, 25);
        ctx.stroke(); ctx.shadowBlur = 0;
    }
    ctx.restore();
}

function drawAmmoDrop(drop) {
    ctx.save(); ctx.translate(drop.x, drop.y);
    ctx.shadowBlur = 10; ctx.shadowColor = '#00ff00';
    ctx.fillStyle = '#222'; ctx.strokeStyle = '#00ff00'; ctx.lineWidth = 2;
    ctx.fillRect(-12, -15, 24, 30); ctx.strokeRect(-12, -15, 24, 30);
    ctx.fillStyle = '#00ff00'; ctx.fillRect(-6, -20, 12, 5);
    ctx.fillRect(-8, -10, 16, 4); ctx.fillRect(-8, -2, 16, 4); ctx.fillRect(-8, 6, 16, 4);
    ctx.shadowBlur = 0; ctx.restore();
}

function updateShooter() {
    const now = Date.now();
    if (isCelebrating) {
        if (now - celebrationStartTime > 7000) skipBtn.style.display = 'block';
        if (now - celebrationStartTime < 30000) {
            if (Math.random() < 0.1) {
                fireworks.push({
                    x: Math.random() * canvas.width, y: canvas.height, targetY: Math.random() * (canvas.height / 2),
                    color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 5)],
                    exploded: false, particles: []
                });
            }
            for (let i = fireworks.length - 1; i >= 0; i--) {
                let fw = fireworks[i];
                if (!fw.exploded) {
                    fw.y -= 5;
                    if (fw.y <= fw.targetY) {
                        fw.exploded = true;
                        for (let j = 0; j < 30; j++) {
                            let angle = Math.random() * Math.PI * 2; let speed = Math.random() * 3 + 1;
                            fw.particles.push({ x: fw.x, y: fw.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alpha: 1 });
                        }
                    }
                } else {
                    for (let j = fw.particles.length - 1; j >= 0; j--) {
                        let p = fw.particles[j]; p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.alpha -= 0.02;
                        if (p.alpha <= 0) fw.particles.splice(j, 1);
                    }
                    if (fw.particles.length === 0) fireworks.splice(i, 1);
                }
            }
        } else { finishCelebration(); }
        return;
    }

    if (isGameOver || isGameWon) return;
    if (isInvulnerable && now - invulnerableTime > 2000) isInvulnerable = false;

    if (level === 1 && tiesDestroyed >= 7 && !isTransitioning) {
        tiesDestroyed = 0; triggerTransition(2, "HYPERSPACE JUMP ACTIVATED", "Approaching Imperial Fleet...");
    } else if (level === 2 && tiesDestroyed >= 8 && sdsDestroyed >= 2 && !isTransitioning) {
        triggerTransition(3, "APPROACHING DEATH STAR", "Commence Trench Run!");
    }

    if (isTransitioning) {
        if (now - levelTransitionTime > 3000) {
            isTransitioning = false;
            if (level === 2) {
                enemySpawnRate = 1200;
                allies.push({ x: player.x - 100, y: player.y + 20, offsetX: -100, offsetY: 20 });
                allies.push({ x: player.x + 100, y: player.y + 20, offsetX: 100, offsetY: 20 });
            } else if (level === 3) {
                allies.length = 0; starDestroyers.length = 0; trenchDistance = 0; exhaustPortVisible = false; exhaustPortY = -100;
            }
        }
    }

    if (level === 3 && !isTransitioning) {
        trenchDistance += 5;
        if (trenchDistance > maxTrenchDistance && !exhaustPortVisible) exhaustPortVisible = true;
        if (exhaustPortVisible) {
            exhaustPortY += 2;
            if (exhaustPortY > canvas.height + 50) { loseLife(); exhaustPortVisible = false; exhaustPortY = -100; trenchDistance = maxTrenchDistance - 1000; }
        }
    }

    if (keys.ArrowLeft && player.x > (level === 3 ? 130 : 30)) player.x -= player.speed;
    if (keys.ArrowRight && player.x < (level === 3 ? canvas.width - 130 : canvas.width - 30)) player.x += player.speed;

    allies.forEach(ally => {
        ally.x += (player.x + ally.offsetX - ally.x) * 0.05;
        ally.y += (player.y + ally.offsetY - ally.y) * 0.05;
        if (now - lastAllyFire > 800) {
            lasers.push({ x: ally.x - 18, y: ally.y, width: 4, height: 18, speed: 15, color: '#00ff00', isAlly: true });
            lasers.push({ x: ally.x + 18, y: ally.y, width: 4, height: 18, speed: 15, color: '#00ff00', isAlly: true });
        }
    });
    if (now - lastAllyFire > 800) lastAllyFire = now;

    spawnEnemy(now);

    if (level !== 3) {
        stars.forEach(s => {
            s.y += (level === 2 ? s.speed * 2 : s.speed);
            if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
        });
    }

    for (let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].y -= lasers[i].speed;
        if (level === 3 && exhaustPortVisible && lasers[i].x > canvas.width / 2 - 25 && lasers[i].x < canvas.width / 2 + 25 && lasers[i].y > exhaustPortY - 25 && lasers[i].y < exhaustPortY + 25) { winGame(); return; }
        if (lasers[i].y < -20) lasers.splice(i, 1);
    }

    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        enemyLasers[i].y += enemyLasers[i].speed;
        if (enemyLasers[i].vx) enemyLasers[i].x += enemyLasers[i].vx;
        if (!isTransitioning && !isInvulnerable && enemyLasers[i].x > player.x - 20 && enemyLasers[i].x < player.x + 20 && enemyLasers[i].y > player.y - 20 && enemyLasers[i].y < player.y + 20) { loseLife(); enemyLasers.splice(i, 1); continue; }
        if (enemyLasers[i].y > canvas.height + 20) enemyLasers.splice(i, 1);
    }

    for (let i = ammoDrops.length - 1; i >= 0; i--) {
        const drop = ammoDrops[i]; drop.y += drop.speed;
        if (Math.sqrt(Math.pow(drop.x - player.x, 2) + Math.pow(drop.y - player.y, 2)) < 40) { ammoDrops.splice(i, 1); ammo = Math.min(MAX_AMMO, ammo + 10); updateAmmoUI(); score += 5; scoreVal.innerText = score; continue; }
        if (drop.y > canvas.height + 30) ammoDrops.splice(i, 1);
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i]; e.y += e.speed;
        if (!isTransitioning && !isInvulnerable && Math.sqrt(Math.pow(e.x - player.x, 2) + Math.pow(e.y - player.y, 2)) < 35) { loseLife(); createExplosion(e.x, e.y, '#ffaa00'); enemies.splice(i, 1); continue; }
        if (e.y > canvas.height + 30) { enemies.splice(i, 1); score = Math.max(0, score - 5); scoreVal.innerText = score; }
    }

    for (let i = turrets.length - 1; i >= 0; i--) {
        const t = turrets[i]; t.y += t.speed;
        if (now - t.lastFire > 600) {
            let dx = player.x - t.x; let dy = player.y - t.y; let mag = Math.sqrt(dx * dx + dy * dy);
            enemyLasers.push({ x: t.x, y: t.y + 15, width: 5, height: 15, speed: 10, vx: (dx / mag) * 7.5, color: '#ff3333' }); t.lastFire = now;
        }
        if (!isTransitioning && !isInvulnerable && player.x > t.x - 25 && player.x < t.x + 25 && player.y > t.y - 25 && player.y < t.y + 25) { loseLife(); createExplosion(t.x, t.y, '#ff4400'); turrets.splice(i, 1); continue; }
        if (t.y > canvas.height + 50) turrets.splice(i, 1);
    }

    for (let i = starDestroyers.length - 1; i >= 0; i--) {
        const sd = starDestroyers[i]; sd.y += sd.speed;
        if (now - sd.lastFire > 1500) { enemyLasers.push({ x: sd.x - 40, y: sd.y + 80, width: 6, height: 25, speed: 10, color: '#ff3333' }); enemyLasers.push({ x: sd.x + 40, y: sd.y + 80, width: 6, height: 25, speed: 10, color: '#ff3333' }); sd.lastFire = now; }
        if (!isTransitioning && !isInvulnerable && player.x > sd.x - 70 && player.x < sd.x + 70 && player.y > sd.y - 100 && player.y < sd.y + 100) { loseLife(); createExplosion(sd.x, sd.y + 50, '#ffaa00'); player.y += 50; continue; }
        if (sd.y > canvas.height + 150) starDestroyers.splice(i, 1);
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = lasers.length - 1; j >= 0; j--) {
            const e = enemies[i]; const l = lasers[j];
            if (e && l && l.isAlly && l.x > e.x - 25 && l.x < e.x + 25 && l.y > e.y - 20 && l.y < e.y + 20) { createExplosion(e.x, e.y, '#ffaa00'); enemies.splice(i, 1); lasers.splice(j, 1); score += 10; if (level < 3) tiesDestroyed++; totalTiesTracker++; localStorage.setItem('swGame_totalTies', totalTiesTracker); updateSkinsMenu(); scoreVal.innerText = score; break; }
        }
    }

    for (let i = turrets.length - 1; i >= 0; i--) {
        for (let j = lasers.length - 1; j >= 0; j--) {
            const t = turrets[i]; const l = lasers[j];
            if (t && l && l.isAlly && l.x > t.x - 20 && l.x < t.x + 20 && l.y > t.y - 20 && l.y < t.y + 20) { lasers.splice(j, 1); t.hp--; if (t.hp <= 0) { createExplosion(t.x, t.y, '#ff4400'); turrets.splice(i, 1); score += 50; scoreVal.innerText = score; break; } }
        }
    }

    for (let i = starDestroyers.length - 1; i >= 0; i--) {
        for (let j = lasers.length - 1; j >= 0; j--) {
            const sd = starDestroyers[i]; const l = lasers[j];
            if (sd && l && l.isAlly && l.x > sd.x - 70 && l.x < sd.x + 70 && l.y > sd.y - 100 && l.y < sd.y + 100) { lasers.splice(j, 1); sd.hp--; if (sd.hp <= 0) { createExplosion(sd.x, sd.y, '#ff6600'); starDestroyers.splice(i, 1); score += 250; sdsDestroyed++; scoreVal.innerText = score; break; } }
        }
    }

    for (let i = shipExplosions.length - 1; i >= 0; i--) {
        const ex = shipExplosions[i];
        for (let j = ex.particles.length - 1; j >= 0; j--) {
            let p = ex.particles[j]; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
            if (p.life <= 0) ex.particles.splice(j, 1);
        }
        if (ex.particles.length === 0) shipExplosions.splice(i, 1);
    }
}

function drawShooter() {
    if (isCelebrating) {
        let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); gradient.addColorStop(0, "#000022"); gradient.addColorStop(1, "#003300"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
        fireworks.forEach(fw => { if (!fw.exploded) { ctx.fillStyle = fw.color; ctx.beginPath(); ctx.arc(fw.x, fw.y, 2, 0, Math.PI * 2); ctx.fill(); } else { fw.particles.forEach(p => { ctx.fillStyle = fw.color; ctx.globalAlpha = p.alpha; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1.0; } });
        ctx.fillStyle = '#001100'; ctx.beginPath(); ctx.moveTo(0, canvas.height); ctx.lineTo(0, canvas.height - 150); ctx.lineTo(100, canvas.height - 200); ctx.lineTo(200, canvas.height - 130); ctx.lineTo(300, canvas.height - 250); ctx.lineTo(400, canvas.height - 170); ctx.lineTo(500, canvas.height - 230); ctx.lineTo(600, canvas.height - 140); ctx.lineTo(700, canvas.height - 210); ctx.lineTo(800, canvas.height - 150); ctx.lineTo(800, canvas.height); ctx.fill();
        const baseHeight = canvas.height - 90;
        // Luke
        ctx.save(); ctx.translate(canvas.width / 2 - 40, baseHeight - 40); ctx.fillStyle = '#ffcc99'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#eedd88'; ctx.beginPath(); ctx.arc(0, -2, 8.5, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#eeeeee'; ctx.beginPath(); ctx.moveTo(-6, 8); ctx.lineTo(6, 8); ctx.lineTo(8, 30); ctx.lineTo(-8, 30); ctx.fill(); ctx.fillStyle = '#eeddcc'; ctx.fillRect(-10, 8, 4, 15); ctx.fillRect(6, 8, 4, 15); ctx.fillStyle = '#553311'; ctx.fillRect(-7, 20, 14, 3); ctx.fillStyle = '#eeddcc'; ctx.fillRect(-6, 30, 4, 15); ctx.fillRect(2, 30, 4, 15); ctx.restore();
        // Leia
        ctx.save(); ctx.translate(canvas.width / 2 - 10, baseHeight - 35); ctx.fillStyle = '#ffcc99'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#331100'; ctx.beginPath(); ctx.arc(-8, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(8, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(0, -2, 7.5, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-5, 7); ctx.lineTo(5, 7); ctx.lineTo(9, 40); ctx.lineTo(-9, 40); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(-9, 7, 4, 14); ctx.fillRect(5, 7, 4, 14); ctx.fillStyle = '#cccccc'; ctx.fillRect(-6, 20, 12, 2); ctx.restore();
        // Han
        ctx.save(); ctx.translate(canvas.width / 2 + 20, baseHeight - 40); ctx.fillStyle = '#ffcc99'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#442211'; ctx.beginPath(); ctx.arc(0, -2, 8.5, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#eeeeee'; ctx.fillRect(-6, 8, 12, 15); ctx.fillStyle = '#111111'; ctx.fillRect(-7, 8, 4, 15); ctx.fillRect(3, 8, 4, 15); ctx.fillStyle = '#eeeeee'; ctx.fillRect(-11, 8, 4, 15); ctx.fillRect(7, 8, 4, 15); ctx.fillStyle = '#223355'; ctx.fillRect(-6, 23, 5, 22); ctx.fillRect(1, 23, 5, 22); ctx.fillStyle = '#553311'; ctx.fillRect(4, 25, 4, 8); ctx.restore();
        // Chewie
        ctx.save(); ctx.translate(canvas.width / 2 + 50, baseHeight - 45); ctx.fillStyle = '#663311'; ctx.beginPath(); ctx.arc(0, -5, 9, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(-9, -5); ctx.lineTo(9, -5); ctx.lineTo(11, 35); ctx.lineTo(-11, 35); ctx.fill(); ctx.fillStyle = '#663311'; ctx.fillRect(-14, 0, 5, 20); ctx.fillRect(9, 0, 5, 20); ctx.fillRect(-10, 35, 7, 15); ctx.fillRect(3, 35, 7, 15); ctx.strokeStyle = '#221100'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 25); ctx.stroke(); ctx.fillStyle = '#aaaaaa'; for (let i = 0; i < 5; i++) { ctx.fillRect(-6 + i * 3, 2 + i * 4.5, 4, 2); } ctx.restore();
        // C3PO
        ctx.save(); ctx.translate(canvas.width / 2 - 70, baseHeight - 40); let gold = ctx.createLinearGradient(-5, 0, 5, 0); gold.addColorStop(0, '#cca822'); gold.addColorStop(0.5, '#ffee55'); gold.addColorStop(1, '#cca822'); ctx.fillStyle = gold; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-3, -1, 1.5, 0, Math.PI * 2); ctx.arc(3, -1, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = gold; ctx.fillRect(-6, 7, 12, 18); ctx.fillRect(-9, 7, 3, 15); ctx.fillRect(6, 7, 3, 15); ctx.fillStyle = '#333'; ctx.fillRect(-5, 20, 10, 4); ctx.fillStyle = gold; ctx.fillRect(-5, 25, 4, 20); ctx.fillStyle = '#cccccc'; ctx.fillRect(1, 25, 4, 20); ctx.restore();
        // R2D2
        ctx.save(); ctx.translate(canvas.width / 2 - 100, baseHeight - 20); ctx.fillStyle = '#eeeeee'; ctx.fillRect(-8, 5, 16, 15); let domeNode = ctx.createLinearGradient(-8, 0, 8, 0); domeNode.addColorStop(0, '#999'); domeNode.addColorStop(0.5, '#eee'); domeNode.addColorStop(1, '#999'); ctx.fillStyle = domeNode; ctx.beginPath(); ctx.arc(0, 5, 8, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#2244aa'; ctx.fillRect(-8, 3, 16, 2); ctx.fillRect(-4, -1, 3, 3); ctx.fillStyle = '#dddddd'; ctx.fillRect(-11, 5, 4, 15); ctx.fillRect(7, 5, 4, 15); ctx.restore();
        ctx.fillStyle = '#ffe81f'; ctx.font = '40px Courier New'; ctx.textAlign = 'center'; ctx.shadowBlur = 15; ctx.shadowColor = '#ffe81f'; ctx.fillText("THE GALAXY IS SAVED.", canvas.width / 2, 100);
        ctx.font = '20px Courier New'; ctx.fillText("MAY THE FORCE BE WITH YOU.", canvas.width / 2, 150); ctx.shadowBlur = 0;
        return;
    }

    if (level === 3) {
        ctx.fillStyle = '#444'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#222'; ctx.fillRect(0, 0, 100, canvas.height); ctx.fillRect(canvas.width - 100, 0, 100, canvas.height);
        ctx.strokeStyle = '#111'; ctx.lineWidth = 2; let offset = (Date.now() / 10) % 50;
        for (let y = offset; y < canvas.height; y += 50) { ctx.beginPath(); ctx.moveTo(100, y); ctx.lineTo(canvas.width - 100, y); ctx.stroke(); }
        if (exhaustPortVisible) drawExhaustPort();
    } else {
        stars.forEach(s => {
            let starColors = ['#ffffff', '#ffffff', '#ccddff', '#ffddbb'];
            let colorIdx = Math.floor(Math.sin(s.x * s.y) * 4); if (colorIdx < 0) colorIdx = 0; if (colorIdx > 3) colorIdx = 3;
            ctx.fillStyle = starColors[colorIdx];
            ctx.shadowBlur = s.size > 1.5 ? 4 : 0; ctx.shadowColor = ctx.fillStyle;
            ctx.globalAlpha = Math.random() * 0.5 + 0.5;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        });
        ctx.globalAlpha = 1.0;
    }

    lasers.forEach(l => {
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 15; ctx.shadowColor = l.color;
        ctx.fillRect(l.x - l.width / 2, l.y, l.width, l.height); ctx.fillRect(l.x - (l.width / 2) + 1, l.y, l.width - 2, l.height);
        ctx.shadowBlur = 0;
    });
    enemyLasers.forEach(l => {
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 15; ctx.shadowColor = l.color;
        ctx.fillRect(l.x - l.width / 2, l.y, l.width, l.height); ctx.fillRect(l.x - (l.width / 2) + 1, l.y, l.width - 2, l.height);
        ctx.shadowBlur = 0;
    });
    shipExplosions.forEach(ex => { ex.particles.forEach(p => { ctx.fillStyle = ex.color; ctx.shadowBlur = 10; ctx.shadowColor = ex.color; ctx.globalAlpha = p.life < 0 ? 0 : p.life; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }); });
    ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
    starDestroyers.forEach(drawStarDestroyer);
    turrets.forEach(drawTurret);
    enemies.forEach(drawEnemy);
    ammoDrops.forEach(drawAmmoDrop);

    if (!isGameOver && !isGameWon) {
        if (isTransitioning) ctx.globalAlpha = Math.sin(Date.now() / 100) * 0.5 + 0.5;
        else if (isInvulnerable) ctx.globalAlpha = Math.sin(Date.now() / 50) * 0.5 + 0.5;
        drawPlayer(); ctx.globalAlpha = 1.0;
        allies.forEach(ally => { ctx.save(); ctx.translate(ally.x - player.x, ally.y - player.y); drawPlayer(); ctx.restore(); });
    }

    ctx.fillStyle = '#00ff00'; ctx.font = '20px Courier New'; ctx.textAlign = 'right'; ctx.fillText(`LIVES: ${lives}`, canvas.width - 20, 50);
    if (isTransitioning) { ctx.fillStyle = '#fff'; ctx.font = '36px Courier New'; ctx.textAlign = 'center'; ctx.shadowBlur = 15; ctx.shadowColor = '#fff'; ctx.fillText(transitionText1, canvas.width / 2, canvas.height / 2); ctx.font = '24px Courier New'; ctx.fillText(transitionText2, canvas.width / 2, canvas.height / 2 + 40); ctx.shadowBlur = 0; }
    else if (level === 1) { ctx.fillStyle = '#aaa'; ctx.font = '16px Courier New'; ctx.textAlign = 'right'; ctx.fillText(`Jump Drive Charging: ${tiesDestroyed}/7`, canvas.width - 20, 75); }
    else if (level === 2) { ctx.fillStyle = '#ff3333'; ctx.font = '16px Courier New'; ctx.textAlign = 'right'; ctx.fillText(`SD: ${sdsDestroyed}/2 | TIE: ${tiesDestroyed}/8`, canvas.width - 20, 75); }
    else if (level === 3 && exhaustPortVisible) { ctx.fillStyle = '#ff0000'; ctx.font = '24px Courier New'; ctx.textAlign = 'center'; ctx.fillText("FIRE AT THE EXHAUST PORT!", canvas.width / 2, 80); }
}
