// Game Data - Monster Stats, Items, NPCs
export const MONSTER_SPECIES = {
    'Blue_Puffball': {
        name: 'Blue Puffball',
        baseHP: 45,
        baseAttack: 49,
        baseDefense: 49,
        baseSpeed: 45,
        catchRate: 0.7,
        expYield: 64
    },
    'Gnugnu': {
        name: 'Gnugnu',
        baseHP: 50,
        baseAttack: 55,
        baseDefense: 40,
        baseSpeed: 60,
        catchRate: 0.6,
        expYield: 72
    },
    'Lotus': {
        name: 'Lotus',
        baseHP: 55,
        baseAttack: 45,
        baseDefense: 55,
        baseSpeed: 50,
        catchRate: 0.65,
        expYield: 68
    },
    'Blossom': {
        name: 'Blossom',
        baseHP: 48,
        baseAttack: 52,
        baseDefense: 43,
        baseSpeed: 65,
        catchRate: 0.7,
        expYield: 70
    },
    'LavaFlare': {
        name: 'LavaFlare',
        baseHP: 58,
        baseAttack: 64,
        baseDefense: 50,
        baseSpeed: 55,
        catchRate: 0.5,
        expYield: 85
    },
    'Pyrolynx': {
        name: 'Pyrolynx',
        baseHP: 52,
        baseAttack: 60,
        baseDefense: 48,
        baseSpeed: 58,
        catchRate: 0.55,
        expYield: 80
    }
};

export const ITEMS = {
    pokeball: {
        name: 'Poké Ball',
        type: 'catch',
        catchBonus: 1.0,
        price: 200,
        description: 'Una sfera per catturare mostri'
    },
    greatball: {
        name: 'Great Ball',
        type: 'catch',
        catchBonus: 1.5,
        price: 600,
        description: 'Una sfera più efficace'
    },
    ultraball: {
        name: 'Ultra Ball',
        type: 'catch',
        catchBonus: 2.0,
        price: 1200,
        description: 'Una sfera molto efficace'
    },
    potion: {
        name: 'Pozione',
        type: 'heal',
        healAmount: 20,
        price: 300,
        description: 'Cura 20 HP'
    },
    superpotion: {
        name: 'Super Pozione',
        type: 'heal',
        healAmount: 50,
        price: 700,
        description: 'Cura 50 HP'
    },
    hyperpotion: {
        name: 'Iper Pozione',
        type: 'heal',
        healAmount: 200,
        price: 1200,
        description: 'Cura 200 HP'
    }
};

export const NPCS = {
    trainer1: {
        name: 'Allenatore Rosso',
        dialogue: 'Vuoi combattere con me?',
        team: [
            { species: 'Blue_Puffball', level: 5 },
            { species: 'Lotus', level: 6 }
        ],
        reward: 500,
        defeated: false
    },
    trainer2: {
        name: 'Allenatore Blu',
        dialogue: 'I miei mostri sono fortissimi!',
        team: [
            { species: 'Gnugnu', level: 7 }
        ],
        reward: 400,
        defeated: false
    },
    trainer3: {
        name: 'Allenatore Verde',
        dialogue: 'Sei pronto per una sfida?',
        team: [
            { species: 'LavaFlare', level: 8 },
            { species: 'Pyrolynx', level: 9 }
        ],
        reward: 800,
        defeated: false
    }
};

export class Monster {
    constructor(species, level = 5) {
        const speciesData = MONSTER_SPECIES[species];
        this.species = species;
        this.name = speciesData.name;
        this.level = level;
        
        // Calculate stats based on level
        this.maxHP = this.calculateStat(speciesData.baseHP, level);
        this.currentHP = this.maxHP;
        this.attack = this.calculateStat(speciesData.baseAttack, level);
        this.defense = this.calculateStat(speciesData.baseDefense, level);
        this.speed = this.calculateStat(speciesData.baseSpeed, level);
        
        this.exp = 0;
        this.expToNextLevel = this.calculateExpNeeded(level);
    }
    
    calculateStat(baseStat, level) {
        // Pokemon-like stat calculation
        return Math.floor(((2 * baseStat * level) / 100) + level + 10);
    }
    
    calculateExpNeeded(level) {
        // Simple exponential growth
        return Math.floor(Math.pow(level, 3));
    }
    
    gainExp(amount) {
        this.exp += amount;
        
        while (this.exp >= this.expToNextLevel && this.level < 100) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.exp -= this.expToNextLevel;
        this.level++;
        
        const speciesData = MONSTER_SPECIES[this.species];
        const oldMaxHP = this.maxHP;
        
        this.maxHP = this.calculateStat(speciesData.baseHP, this.level);
        this.currentHP += (this.maxHP - oldMaxHP); // Heal by the HP increase
        this.attack = this.calculateStat(speciesData.baseAttack, this.level);
        this.defense = this.calculateStat(speciesData.baseDefense, this.level);
        this.speed = this.calculateStat(speciesData.baseSpeed, this.level);
        
        this.expToNextLevel = this.calculateExpNeeded(this.level);
        
        return true;
    }
    
    heal(amount) {
        this.currentHP = Math.min(this.currentHP + amount, this.maxHP);
    }
    
    takeDamage(damage) {
        this.currentHP = Math.max(0, this.currentHP - damage);
        return this.currentHP <= 0;
    }
    
    isAlive() {
        return this.currentHP > 0;
    }
    
    toJSON() {
        return {
            species: this.species,
            name: this.name,
            level: this.level,
            maxHP: this.maxHP,
            currentHP: this.currentHP,
            attack: this.attack,
            defense: this.defense,
            speed: this.speed,
            exp: this.exp,
            expToNextLevel: this.expToNextLevel
        };
    }
    
    static fromJSON(data) {
        const monster = new Monster(data.species, data.level);
        monster.currentHP = data.currentHP;
        monster.exp = data.exp;
        return monster;
    }
}

export class PlayerInventory {
    constructor() {
        this.items = {
            pokeball: 5,
            greatball: 0,
            ultraball: 0,
            potion: 3,
            superpotion: 0,
            hyperpotion: 0
        };
        this.money = 3000;
    }
    
    hasItem(itemId) {
        return this.items[itemId] > 0;
    }
    
    useItem(itemId) {
        if (this.hasItem(itemId)) {
            this.items[itemId]--;
            return true;
        }
        return false;
    }
    
    addItem(itemId, quantity = 1) {
        this.items[itemId] = (this.items[itemId] || 0) + quantity;
    }
    
    buyItem(itemId) {
        const item = ITEMS[itemId];
        if (this.money >= item.price) {
            this.money -= item.price;
            this.addItem(itemId);
            return true;
        }
        return false;
    }
    
    toJSON() {
        return {
            items: this.items,
            money: this.money
        };
    }
    
    static fromJSON(data) {
        const inventory = new PlayerInventory();
        inventory.items = data.items;
        inventory.money = data.money;
        return inventory;
    }
}
