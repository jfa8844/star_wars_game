function updateAmmoUI() {
    const percentage = Math.max(0, (ammo / MAX_AMMO) * 100);
    ammoBar.style.width = percentage + '%';
    if (percentage < 30) {
        ammoBar.style.backgroundColor = '#ff3333';
    } else if (percentage < 60) {
        ammoBar.style.backgroundColor = '#ff9900';
    } else {
        ammoBar.style.backgroundColor = '#00ff00';
    }
}

function updateSkinsMenu() {
    const list = document.getElementById('skinList');
    const stats = document.getElementById('skinStatsText');
    if (!list || !stats) return;

    list.innerHTML = '';
    stats.innerText = `LIFETIME KILLS (TIEs): ${totalTiesTracker} | DEATH STARS DESTROYED: ${roundsCompletedTracker}`;

    let nextP = document.getElementById('nextSkinStatsText');
    if (!nextP) {
        nextP = document.createElement('p');
        nextP.id = 'nextSkinStatsText';
        nextP.style.color = '#ff9900';
        nextP.style.fontWeight = 'bold';
        nextP.style.marginBottom = '20px';
        stats.parentNode.insertBefore(nextP, stats.nextSibling);
    }

    let nextShip = skinsData.find(s => !s.condition());
    let nextShipText = nextShip ? `NEXT UNLOCK: ${nextShip.name} (${Math.floor(nextShip.getProgress())}%)` : "ALL SHIPS UNLOCKED!";
    nextP.innerText = nextShipText;
    nextP.style.color = nextShip ? '#ff9900' : '#00ff00';

    skinsData.forEach(skin => {
        const isUnlocked = skin.condition();
        const prog = isUnlocked ? 100 : Math.floor(skin.getProgress());
        const btn = document.createElement('div');
        btn.className = 'skin-card'; // We could add this to CSS
        btn.style.padding = '15px 20px';
        btn.style.border = isUnlocked ? '2px solid #00ff00' : '2px solid #ff3333';
        btn.style.background = (selectedSkin === skin.name) ? 'rgba(0, 255, 0, 0.2)' : '#222';
        btn.style.color = isUnlocked ? '#fff' : '#666';
        btn.style.borderRadius = '8px';
        btn.style.cursor = isUnlocked ? 'pointer' : 'not-allowed';
        btn.style.textAlign = 'center';
        btn.style.width = '240px';
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';

        const progBarHeight = "8px";
        const progBar = `<div style="position: absolute; bottom: 0; left: 0; height: ${progBarHeight}; width: ${prog}%; background: ${isUnlocked ? '#00ff00' : '#ff9900'}; transition: width 0.3s; pointer-events: none;"></div>`;

        btn.innerHTML = `<div style="position: relative; z-index: 2; padding-bottom: ${progBarHeight};">
                         <h3 style="margin:0 0 10px 0;">${skin.name}</h3>
                         <p style="font-size: 14px; margin: 0; min-height: 34px;">${isUnlocked ? "UNLOCKED" : skin.desc}</p>
                         ${!isUnlocked ? `<p style="font-size: 12px; margin: 8px 0 0 0; color: #ff9900; font-weight:bold;">Progress: ${prog}%</p>` : ''}
                         </div>
                         ${progBar}`;

        if (isUnlocked) {
            btn.addEventListener('click', () => {
                selectedSkin = skin.name;
                localStorage.setItem('swGame_selectedSkin', selectedSkin);
                updateSkinsMenu();
            });
        }
        list.appendChild(btn);
    });
}

const skinsData = [
    { name: "X-Wing", condition: () => true, desc: "Default", getProgress: () => 100 },
    { name: "TIE Fighter", condition: () => totalTiesTracker >= 25, desc: "Defeat 25 TIEs.", getProgress: () => Math.min(100, (totalTiesTracker / 25) * 100) },
    { name: "B-wing", condition: () => totalTiesTracker >= 50, desc: "Defeat 50 TIEs.", getProgress: () => Math.min(100, (totalTiesTracker / 50) * 100) },
    { name: "Millennium Falcon", condition: () => roundsCompletedTracker >= 2, desc: "Clear Death Star 2 times.", getProgress: () => Math.min(100, (roundsCompletedTracker / 2) * 100) },
    { name: "Star Destroyer", condition: () => roundsCompletedTracker >= 5, desc: "Clear Death Star 5 times.", getProgress: () => Math.min(100, (roundsCompletedTracker / 5) * 100) },
    {
        name: "Death Star", condition: () => totalTiesTracker >= 150 && roundsCompletedTracker >= 10, desc: "Defeat 150 TIEs and clear Death Star 10 times.", getProgress: () => {
            let tieProg = Math.min(100, (totalTiesTracker / 150) * 100);
            let dsProg = Math.min(100, (roundsCompletedTracker / 10) * 100);
            return (tieProg + dsProg) / 2;
        }
    }
];

// Event Listeners for UI
// Hub and mission listeners moved to engine.js

document.getElementById('startGameBtn').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    gameStarted = true;
    if (currentGameMode === 'SHOOTER') {
        introAudio.play().catch(e => console.log("Audio waiting:", e));
    }
});

document.getElementById('skinsBtn').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('skinScreen').style.display = 'flex';
    updateSkinsMenu();
});

document.getElementById('backSkinsBtn').addEventListener('click', () => {
    document.getElementById('skinScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
});

document.getElementById('resetSkinsBtn').addEventListener('click', () => {
    if (confirm("Are you sure you want to reset all game progress? This cannot be undone.")) {
        totalTiesTracker = 0;
        roundsCompletedTracker = 0;
        selectedSkin = 'X-Wing';
        localStorage.setItem('swGame_totalTies', 0);
        localStorage.setItem('swGame_roundsCompleted', 0);
        localStorage.setItem('swGame_selectedSkin', 'X-Wing');
        updateSkinsMenu();
    }
});

// restartBtn listener moved to engine.js to avoid ReferenceError
