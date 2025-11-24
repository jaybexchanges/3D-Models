// UI Manager for all game menus and interfaces
import { ITEMS, MOVES } from './game-data.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.currentMenu = null;
        this.setupMenus();
    }
    
    setupMenus() {
        // Main menu (ESC key)
        this.createMainMenu();
        this.createTeamMenu();
        this.createInventoryMenu();
        this.createMapMenu();
        this.createBattleUI();
        this.createShopUI();
        this.createSaveLoadUI();
    }
    
    createMainMenu() {
        const menuHTML = `
            <div id="main-menu" class="menu-overlay hidden">
                <div class="menu-container">
                    <h2>📋 Menu Principale</h2>
                    <div class="menu-options">
                        <button onclick="uiManager.showTeamMenu()" class="menu-btn">👥 Squadra</button>
                        <button onclick="uiManager.showInventoryMenu()" class="menu-btn">🎒 Inventario</button>
                        <button onclick="uiManager.showMapMenu()" class="menu-btn">🗺️ Mappa</button>
                        <button onclick="uiManager.showSaveLoadMenu()" class="menu-btn">💾 Salva/Carica</button>
                        <button onclick="uiManager.closeMainMenu()" class="menu-btn">❌ Chiudi</button>
                    </div>
                    <div class="player-info">
                        <p>💰 Denaro: <span id="player-money">3000</span></p>
                        <p>👾 Mostri: <span id="team-count">0</span>/6</p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }
    
    createTeamMenu() {
        const menuHTML = `
            <div id="team-menu" class="menu-overlay hidden">
                <div class="menu-container large">
                    <h2>👥 La Tua Squadra</h2>
                    <div id="team-list" class="team-grid"></div>
                    <button onclick="uiManager.closeTeamMenu()" class="menu-btn close-btn">Chiudi</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }
    
    createInventoryMenu() {
        const menuHTML = `
            <div id="inventory-menu" class="menu-overlay hidden">
                <div class="menu-container large">
                    <h2>🎒 Inventario</h2>
                    <div id="inventory-list" class="inventory-grid"></div>
                    <button onclick="uiManager.closeInventoryMenu()" class="menu-btn close-btn">Chiudi</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }
    
    createMapMenu() {
        const menuHTML = `
            <div id="map-menu" class="menu-overlay hidden">
                <div class="menu-container">
                    <h2>🗺️ Mappa del Mondo</h2>
                    <div class="map-display">
                        <div class="map-location ${this.game.currentMap === 'village' ? 'active' : ''}">
                            <h3>🏘️ Villaggio Iniziale</h3>
                            <p>Centro Pokémon, Market, Case</p>
                        </div>
                        <div class="map-location ${this.game.currentMap === 'wild' ? 'active' : ''}">
                            <h3>🌲 Zona Selvaggia</h3>
                            <p>Mostri selvatici, Natura</p>
                        </div>
                    </div>
                    <button onclick="uiManager.closeMapMenu()" class="menu-btn close-btn">Chiudi</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }
    
    createBattleUI() {
        const battleHTML = `
            <div id="battle-ui" class="hidden">
                <div class="battle-container">
                    <div class="battle-monsters">
                        <div class="enemy-monster">
                            <div class="monster-info">
                                <h3 id="enemy-name">Mostro Selvaggio</h3>
                                <div class="hp-bar-container">
                                    <div class="hp-bar" id="enemy-hp-bar"></div>
                                </div>
                                <p class="hp-text"><span id="enemy-hp">50</span>/<span id="enemy-max-hp">50</span> HP</p>
                                <p class="level-text">Lv. <span id="enemy-level">5</span></p>
                            </div>
                        </div>
                        <div class="player-monster">
                            <div class="monster-info">
                                <h3 id="player-monster-name">Il Tuo Mostro</h3>
                                <div class="hp-bar-container">
                                    <div class="hp-bar player" id="player-hp-bar"></div>
                                </div>
                                <p class="hp-text"><span id="player-hp">45</span>/<span id="player-max-hp">45</span> HP</p>
                                <p class="level-text">Lv. <span id="player-level">5</span></p>
                                <div class="exp-bar-container">
                                    <div class="exp-bar" id="player-exp-bar"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="battle-log" id="battle-log">
                        <p>Un mostro selvaggio è apparso!</p>
                    </div>
                    <div class="battle-actions" id="battle-actions">
                        <button onclick="uiManager.battleAction('attack')" class="battle-btn">⚔️ Attacca</button>
                        <button onclick="uiManager.battleAction('catch')" class="battle-btn">🎯 Cattura</button>
                        <button onclick="uiManager.battleAction('item')" class="battle-btn">🎒 Oggetto</button>
                        <button onclick="uiManager.battleAction('run')" class="battle-btn">🏃 Fuggi</button>
                    </div>
                    <div class="battle-moves hidden" id="battle-moves"></div>
                    <div class="battle-items hidden" id="battle-items"></div>
                    <div class="move-replace-prompt hidden" id="move-replace-prompt">
                        <div class="move-replace-container">
                            <h3 id="move-learn-title"></h3>
                            <p id="move-learn-text"></p>
                            <div id="move-replace-options"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', battleHTML);
    }
    
    createShopUI() {
        const shopHTML = `
            <div id="shop-menu" class="menu-overlay hidden">
                <div class="menu-container large">
                    <h2>🏪 Nigrolino Market</h2>
                    <p class="shop-money">💰 Denaro: <span id="shop-money">3000</span></p>
                    <div id="shop-items" class="shop-grid"></div>
                    <button onclick="uiManager.closeShopMenu()" class="menu-btn close-btn">Chiudi</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', shopHTML);
    }
    
    createSaveLoadUI() {
        const saveLoadHTML = `
            <div id="saveload-menu" class="menu-overlay hidden">
                <div class="menu-container">
                    <h2>💾 Salva/Carica Partita</h2>
                    <div class="saveload-options">
                        <button onclick="uiManager.saveGame()" class="menu-btn">💾 Salva Partita</button>
                        <button onclick="uiManager.loadGame()" class="menu-btn">📂 Carica Partita</button>
                        <button onclick="uiManager.deleteSave()" class="menu-btn danger">🗑️ Elimina Salvataggio</button>
                    </div>
                    <div id="save-info" class="save-info"></div>
                    <button onclick="uiManager.closeSaveLoadMenu()" class="menu-btn close-btn">Chiudi</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', saveLoadHTML);
    }
    
    // Main Menu Functions
    showMainMenu() {
        this.currentMenu = 'main';
        document.getElementById('main-menu').classList.remove('hidden');
        this.updatePlayerInfo();
    }
    
    closeMainMenu() {
        document.getElementById('main-menu').classList.add('hidden');
        this.currentMenu = null;
    }
    
    toggleMainMenu() {
        if (this.currentMenu === 'main') {
            this.closeMainMenu();
        } else {
            this.closeAllMenus();
            this.showMainMenu();
        }
    }
    
    // Team Menu Functions
    showTeamMenu() {
        this.closeMainMenu();
        this.currentMenu = 'team';
        document.getElementById('team-menu').classList.remove('hidden');
        this.updateTeamDisplay();
    }
    
    closeTeamMenu() {
        document.getElementById('team-menu').classList.add('hidden');
        this.currentMenu = null;
    }
    
    updateTeamDisplay() {
        const teamList = document.getElementById('team-list');
        const team = this.game.playerTeam;
        
        if (team.length === 0) {
            teamList.innerHTML = '<p class="empty-message">Nessun mostro nella squadra!</p>';
            return;
        }
        
        teamList.innerHTML = team.map((monster, index) => `
            <div class="team-card">
                <h3>${monster.name}</h3>
                <p class="monster-level">Livello ${monster.level}</p>
                <p class="monster-types">🏷️ ${monster.types.join(' / ')}</p>
                <p class="monster-nature">⭐ Natura: ${monster.nature.name}</p>
                <div class="stat-row">
                    <span>HP:</span>
                    <div class="stat-bar-bg">
                        <div class="stat-bar" style="width: ${(monster.currentHP / monster.maxHP) * 100}%"></div>
                    </div>
                    <span>${monster.currentHP}/${monster.maxHP}</span>
                </div>
                <div class="stat-row">
                    <span>ATT: ${monster.attack}</span>
                    <span>DEF: ${monster.defense}</span>
                    <span>VEL: ${monster.speed}</span>
                </div>
                <div class="moves-display">
                    <p class="moves-label">Mosse:</p>
                    <div class="moves-list">
                        ${monster.moves.map(moveKey => {
                            const move = MOVES[moveKey];
                            return move ? `<span class="move-chip" title="${move.description}">${move.name}</span>` : '';
                        }).join('')}
                    </div>
                </div>
                <div class="exp-display">
                    <span>EXP: ${monster.exp}/${monster.expToNextLevel}</span>
                    <div class="exp-bar-bg">
                        <div class="exp-bar" style="width: ${(monster.exp / monster.expToNextLevel) * 100}%"></div>
                    </div>
                </div>
                ${monster.currentHP <= 0 ? '<p class="fainted">😵 Esausto</p>' : ''}
            </div>
        `).join('');
    }
    
    // Inventory Menu Functions
    showInventoryMenu() {
        this.closeMainMenu();
        this.currentMenu = 'inventory';
        document.getElementById('inventory-menu').classList.remove('hidden');
        this.updateInventoryDisplay();
    }
    
    closeInventoryMenu() {
        document.getElementById('inventory-menu').classList.add('hidden');
        this.currentMenu = null;
    }
    
    updateInventoryDisplay() {
        const inventoryList = document.getElementById('inventory-list');
        const inventory = this.game.inventory;
        
        inventoryList.innerHTML = Object.entries(inventory.items).map(([itemId, quantity]) => {
            const item = ITEMS[itemId];
            return `
                <div class="inventory-card">
                    <h3>${item.name}</h3>
                    <p class="item-desc">${item.description}</p>
                    <p class="item-quantity">Quantità: ${quantity}</p>
                    ${item.type === 'heal' ? 
                        `<button onclick="uiManager.useHealItem('${itemId}')" class="item-btn" ${quantity === 0 ? 'disabled' : ''}>Usa</button>` 
                        : ''}
                </div>
            `;
        }).join('');
    }
    
    useHealItem(itemId) {
        if (this.game.playerTeam.length === 0) {
            alert('Non hai mostri da curare!');
            return;
        }
        
        // Simple: heal first monster
        const monster = this.game.playerTeam[0];
        const item = ITEMS[itemId];
        
        if (this.game.inventory.useItem(itemId)) {
            monster.heal(item.healAmount);
            alert(`${monster.name} è stato curato di ${item.healAmount} HP!`);
            this.updateInventoryDisplay();
            this.updateTeamDisplay();
        }
    }
    
    // Map Menu Functions
    showMapMenu() {
        this.closeMainMenu();
        this.currentMenu = 'map';
        document.getElementById('map-menu').classList.remove('hidden');
    }
    
    closeMapMenu() {
        document.getElementById('map-menu').classList.add('hidden');
        this.currentMenu = null;
    }
    
    // Shop Functions
    showShopMenu() {
        this.currentMenu = 'shop';
        document.getElementById('shop-menu').classList.remove('hidden');
        this.updateShopDisplay();
    }
    
    closeShopMenu() {
        document.getElementById('shop-menu').classList.add('hidden');
        this.currentMenu = null;
    }
    
    updateShopDisplay() {
        const shopItems = document.getElementById('shop-items');
        const shopMoney = document.getElementById('shop-money');
        shopMoney.textContent = this.game.inventory.money;
        
        shopItems.innerHTML = Object.entries(ITEMS).map(([itemId, item]) => `
            <div class="shop-card">
                <h3>${item.name}</h3>
                <p class="item-desc">${item.description}</p>
                <p class="item-price">💰 ${item.price}</p>
                <button onclick="uiManager.buyItem('${itemId}')" class="shop-btn">Compra</button>
            </div>
        `).join('');
    }
    
    buyItem(itemId) {
        if (this.game.inventory.buyItem(itemId)) {
            alert(`Hai comprato ${ITEMS[itemId].name}!`);
            this.updateShopDisplay();
            this.updatePlayerInfo();
        } else {
            alert('Non hai abbastanza denaro!');
        }
    }
    
    // Save/Load Functions
    showSaveLoadMenu() {
        this.closeMainMenu();
        this.currentMenu = 'saveload';
        document.getElementById('saveload-menu').classList.remove('hidden');
        this.updateSaveInfo();
    }
    
    closeSaveLoadMenu() {
        document.getElementById('saveload-menu').classList.add('hidden');
        this.currentMenu = null;
    }
    
    saveGame() {
        this.game.saveGame();
        alert('Partita salvata!');
        this.updateSaveInfo();
    }
    
    loadGame() {
        if (this.game.loadGame()) {
            alert('Partita caricata!');
            this.closeSaveLoadMenu();
            this.updateAllDisplays();
        } else {
            alert('Nessun salvataggio trovato!');
        }
    }
    
    deleteSave() {
        if (confirm('Sei sicuro di voler eliminare il salvataggio?')) {
            localStorage.removeItem('monsterquest_save');
            alert('Salvataggio eliminato!');
            this.updateSaveInfo();
        }
    }
    
    updateSaveInfo() {
        const saveInfo = document.getElementById('save-info');
        const savedData = localStorage.getItem('monsterquest_save');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            saveInfo.innerHTML = `
                <div class="save-data">
                    <p>✅ Salvataggio trovato</p>
                    <p>Mostri catturati: ${data.team.length}</p>
                    <p>Denaro: ${data.inventory.money}</p>
                    <p>Data: ${new Date(data.timestamp).toLocaleString('it-IT')}</p>
                </div>
            `;
        } else {
            saveInfo.innerHTML = '<p class="empty-message">Nessun salvataggio trovato</p>';
        }
    }
    
    // Battle UI Functions
    battleAction(action) {
        if (action === 'attack') {
            this.showMoveSelection();
        } else {
            this.game.handleBattleAction(action);
        }
    }
    
    showMoveSelection() {
        const movesDiv = document.getElementById('battle-moves');
        const playerMonster = this.game.playerTeam[0];
        
        if (!playerMonster || !playerMonster.moves) {
            this.game.handleBattleAction('attack', 0);
            return;
        }
        
        movesDiv.innerHTML = playerMonster.moves.map((moveKey, index) => {
            const move = MOVES[moveKey];
            if (!move) return '';
            
            return `
                <button onclick="uiManager.useBattleMove(${index})" class="battle-move-btn">
                    <span class="move-name">${move.name}</span>
                    <span class="move-type">${move.type}</span>
                    <span class="move-power">⚡ ${move.power}</span>
                </button>
            `;
        }).join('');
        
        movesDiv.classList.remove('hidden');
        document.getElementById('battle-actions').classList.add('hidden');
    }
    
    hideMoveSelection() {
        document.getElementById('battle-moves').classList.add('hidden');
        document.getElementById('battle-actions').classList.remove('hidden');
    }
    
    useBattleMove(moveIndex) {
        this.hideMoveSelection();
        this.game.handleBattleAction('attack', moveIndex);
    }
    
    updateBattleUI(playerMonster, enemyMonster) {
        // Update enemy
        document.getElementById('enemy-name').textContent = enemyMonster.name;
        document.getElementById('enemy-hp').textContent = enemyMonster.currentHP;
        document.getElementById('enemy-max-hp').textContent = enemyMonster.maxHP;
        document.getElementById('enemy-level').textContent = enemyMonster.level;
        document.getElementById('enemy-hp-bar').style.width = 
            `${(enemyMonster.currentHP / enemyMonster.maxHP) * 100}%`;
        
        // Update player monster
        document.getElementById('player-monster-name').textContent = playerMonster.name;
        document.getElementById('player-hp').textContent = playerMonster.currentHP;
        document.getElementById('player-max-hp').textContent = playerMonster.maxHP;
        document.getElementById('player-level').textContent = playerMonster.level;
        document.getElementById('player-hp-bar').style.width = 
            `${(playerMonster.currentHP / playerMonster.maxHP) * 100}%`;
        document.getElementById('player-exp-bar').style.width = 
            `${(playerMonster.exp / playerMonster.expToNextLevel) * 100}%`;
    }
    
    addBattleLog(message) {
        const log = document.getElementById('battle-log');
        const p = document.createElement('p');
        p.textContent = message;
        log.appendChild(p);
        log.scrollTop = log.scrollHeight;
    }
    
    clearBattleLog() {
        document.getElementById('battle-log').innerHTML = '';
    }
    
    showBattleItemSelection() {
        const itemsDiv = document.getElementById('battle-items');
        const catchItems = ['pokeball', 'greatball', 'ultraball'];
        
        itemsDiv.innerHTML = catchItems.map(itemId => {
            const item = ITEMS[itemId];
            const quantity = this.game.inventory.items[itemId];
            return `
                <button onclick="uiManager.useBattleItem('${itemId}')" 
                        class="battle-item-btn" 
                        ${quantity === 0 ? 'disabled' : ''}>
                    ${item.name} (${quantity})
                </button>
            `;
        }).join('');
        
        itemsDiv.classList.remove('hidden');
        document.getElementById('battle-actions').classList.add('hidden');
    }
    
    hideBattleItemSelection() {
        document.getElementById('battle-items').classList.add('hidden');
        document.getElementById('battle-actions').classList.remove('hidden');
    }
    
    useBattleItem(itemId) {
        this.game.useCatchItem(itemId);
        this.hideBattleItemSelection();
    }
    
    showMoveReplacePrompt(monster, newMoveKey) {
        const newMove = MOVES[newMoveKey];
        const promptDiv = document.getElementById('move-replace-prompt');
        const titleEl = document.getElementById('move-learn-title');
        const textEl = document.getElementById('move-learn-text');
        const optionsDiv = document.getElementById('move-replace-options');
        
        titleEl.textContent = `${monster.name} vuole imparare ${newMove.name}!`;
        textEl.textContent = `Ma ${monster.name} conosce già 4 mosse. Vuoi sostituire una mossa?`;
        
        // Build options
        let optionsHTML = '<div class="move-replace-grid">';
        
        // Show current moves
        monster.moves.forEach((moveKey, index) => {
            const move = MOVES[moveKey];
            optionsHTML += `
                <button onclick="uiManager.replaceMove(${index})" class="move-replace-btn">
                    <span class="move-name">${move.name}</span>
                    <span class="move-type">${move.type}</span>
                    <span class="move-power">⚡ ${move.power}</span>
                </button>
            `;
        });
        
        optionsHTML += '</div>';
        
        // Show new move info
        optionsHTML += `
            <div class="new-move-info">
                <h4>Nuova mossa:</h4>
                <div class="move-details">
                    <span class="move-name">${newMove.name}</span>
                    <span class="move-type">${newMove.type}</span>
                    <span class="move-power">⚡ ${newMove.power}</span>
                    <p>${newMove.description}</p>
                </div>
            </div>
        `;
        
        // Add cancel button
        optionsHTML += '<button onclick="uiManager.cancelMoveLearn()" class="menu-btn">Non imparare</button>';
        
        optionsDiv.innerHTML = optionsHTML;
        
        // Hide battle actions, show prompt
        document.getElementById('battle-actions').classList.add('hidden');
        document.getElementById('battle-moves').classList.add('hidden');
        promptDiv.classList.remove('hidden');
    }
    
    replaceMove(index) {
        const pendingLearn = this.game.pendingMoveLearn;
        if (pendingLearn) {
            const newMove = MOVES[pendingLearn.moveKey];
            const oldMove = MOVES[pendingLearn.monster.moves[index]];
            
            pendingLearn.monster.learnMove(pendingLearn.moveKey, index);
            
            this.addBattleLog(`${pendingLearn.monster.name} ha dimenticato ${oldMove.name} e ha imparato ${newMove.name}!`);
            
            this.hideMoveReplacePrompt();
            this.game.pendingMoveLearn = null;
            
            // Continue battle flow
            this.game.continueBattleAfterMoveLearn();
        }
    }
    
    cancelMoveLearn() {
        const pendingLearn = this.game.pendingMoveLearn;
        if (pendingLearn) {
            const newMove = MOVES[pendingLearn.moveKey];
            this.addBattleLog(`${pendingLearn.monster.name} non ha imparato ${newMove.name}.`);
            
            this.hideMoveReplacePrompt();
            this.game.pendingMoveLearn = null;
            
            // Continue battle flow
            this.game.continueBattleAfterMoveLearn();
        }
    }
    
    hideMoveReplacePrompt() {
        document.getElementById('move-replace-prompt').classList.add('hidden');
        document.getElementById('battle-actions').classList.remove('hidden');
    }
    
    // Utility Functions
    updatePlayerInfo() {
        document.getElementById('player-money').textContent = this.game.inventory.money;
        document.getElementById('team-count').textContent = this.game.playerTeam.length;
        document.getElementById('caught-count').textContent = this.game.playerTeam.length;
    }
    
    updateAllDisplays() {
        this.updatePlayerInfo();
        this.updateTeamDisplay();
        this.updateInventoryDisplay();
    }
    
    closeAllMenus() {
        document.querySelectorAll('.menu-overlay').forEach(menu => {
            menu.classList.add('hidden');
        });
        this.currentMenu = null;
    }
    
    isMenuOpen() {
        return this.currentMenu !== null;
    }
}
