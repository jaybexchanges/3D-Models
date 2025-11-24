// Game Data - Monster Stats, Items, NPCs

// Element types
export const ELEMENT_TYPES = {
    NORMAL: 'Normal',
    FIRE: 'Fire',
    WATER: 'Water',
    GRASS: 'Grass',
    ELECTRIC: 'Electric',
    ICE: 'Ice',
    FIGHTING: 'Fighting',
    POISON: 'Poison',
    GROUND: 'Ground',
    FLYING: 'Flying',
    PSYCHIC: 'Psychic',
    BUG: 'Bug',
    ROCK: 'Rock',
    GHOST: 'Ghost',
    DRAGON: 'Dragon',
    DARK: 'Dark',
    STEEL: 'Steel',
    FAIRY: 'Fairy'
};

// Type effectiveness chart (attacker type -> defender type -> multiplier)
export const TYPE_EFFECTIVENESS = {
    [ELEMENT_TYPES.FIRE]: {
        [ELEMENT_TYPES.GRASS]: 2.0,
        [ELEMENT_TYPES.ICE]: 2.0,
        [ELEMENT_TYPES.BUG]: 2.0,
        [ELEMENT_TYPES.STEEL]: 2.0,
        [ELEMENT_TYPES.WATER]: 0.5,
        [ELEMENT_TYPES.FIRE]: 0.5,
        [ELEMENT_TYPES.ROCK]: 0.5,
        [ELEMENT_TYPES.DRAGON]: 0.5
    },
    [ELEMENT_TYPES.WATER]: {
        [ELEMENT_TYPES.FIRE]: 2.0,
        [ELEMENT_TYPES.GROUND]: 2.0,
        [ELEMENT_TYPES.ROCK]: 2.0,
        [ELEMENT_TYPES.GRASS]: 0.5,
        [ELEMENT_TYPES.WATER]: 0.5,
        [ELEMENT_TYPES.DRAGON]: 0.5
    },
    [ELEMENT_TYPES.GRASS]: {
        [ELEMENT_TYPES.WATER]: 2.0,
        [ELEMENT_TYPES.GROUND]: 2.0,
        [ELEMENT_TYPES.ROCK]: 2.0,
        [ELEMENT_TYPES.FIRE]: 0.5,
        [ELEMENT_TYPES.GRASS]: 0.5,
        [ELEMENT_TYPES.POISON]: 0.5,
        [ELEMENT_TYPES.FLYING]: 0.5,
        [ELEMENT_TYPES.BUG]: 0.5,
        [ELEMENT_TYPES.DRAGON]: 0.5,
        [ELEMENT_TYPES.STEEL]: 0.5
    },
    [ELEMENT_TYPES.ELECTRIC]: {
        [ELEMENT_TYPES.WATER]: 2.0,
        [ELEMENT_TYPES.FLYING]: 2.0,
        [ELEMENT_TYPES.GRASS]: 0.5,
        [ELEMENT_TYPES.ELECTRIC]: 0.5,
        [ELEMENT_TYPES.DRAGON]: 0.5,
        [ELEMENT_TYPES.GROUND]: 0
    },
    [ELEMENT_TYPES.GHOST]: {
        [ELEMENT_TYPES.GHOST]: 2.0,
        [ELEMENT_TYPES.PSYCHIC]: 2.0,
        [ELEMENT_TYPES.DARK]: 0.5,
        [ELEMENT_TYPES.NORMAL]: 0
    },
    [ELEMENT_TYPES.PSYCHIC]: {
        [ELEMENT_TYPES.FIGHTING]: 2.0,
        [ELEMENT_TYPES.POISON]: 2.0,
        [ELEMENT_TYPES.PSYCHIC]: 0.5,
        [ELEMENT_TYPES.STEEL]: 0.5,
        [ELEMENT_TYPES.DARK]: 0
    },
    // Add more type matchups as needed
    [ELEMENT_TYPES.NORMAL]: {},
    [ELEMENT_TYPES.FAIRY]: {
        [ELEMENT_TYPES.FIGHTING]: 2.0,
        [ELEMENT_TYPES.DRAGON]: 2.0,
        [ELEMENT_TYPES.DARK]: 2.0,
        [ELEMENT_TYPES.FIRE]: 0.5,
        [ELEMENT_TYPES.POISON]: 0.5,
        [ELEMENT_TYPES.STEEL]: 0.5
    },
    [ELEMENT_TYPES.STEEL]: {
        [ELEMENT_TYPES.ICE]: 2.0,
        [ELEMENT_TYPES.ROCK]: 2.0,
        [ELEMENT_TYPES.FAIRY]: 2.0,
        [ELEMENT_TYPES.FIRE]: 0.5,
        [ELEMENT_TYPES.WATER]: 0.5,
        [ELEMENT_TYPES.ELECTRIC]: 0.5,
        [ELEMENT_TYPES.STEEL]: 0.5
    }
};

// Nature system - affects stat growth
export const NATURES = {
    HARDY: { name: 'Hardy', attackMod: 1.0, defenseMod: 1.0, speedMod: 1.0 },
    BRAVE: { name: 'Brave', attackMod: 1.1, defenseMod: 1.0, speedMod: 0.9 },
    ADAMANT: { name: 'Adamant', attackMod: 1.1, defenseMod: 0.9, speedMod: 1.0 },
    NAUGHTY: { name: 'Naughty', attackMod: 1.1, defenseMod: 1.0, speedMod: 1.0 },
    BOLD: { name: 'Bold', attackMod: 0.9, defenseMod: 1.1, speedMod: 1.0 },
    RELAXED: { name: 'Relaxed', attackMod: 1.0, defenseMod: 1.1, speedMod: 0.9 },
    IMPISH: { name: 'Impish', attackMod: 1.0, defenseMod: 1.1, speedMod: 1.0 },
    LAX: { name: 'Lax', attackMod: 1.0, defenseMod: 1.1, speedMod: 1.0 },
    TIMID: { name: 'Timid', attackMod: 0.9, defenseMod: 1.0, speedMod: 1.1 },
    HASTY: { name: 'Hasty', attackMod: 1.0, defenseMod: 0.9, speedMod: 1.1 },
    JOLLY: { name: 'Jolly', attackMod: 1.0, defenseMod: 1.0, speedMod: 1.1 },
    NAIVE: { name: 'Naive', attackMod: 1.0, defenseMod: 1.0, speedMod: 1.1 },
    MODEST: { name: 'Modest', attackMod: 0.9, defenseMod: 1.0, speedMod: 1.0 },
    MILD: { name: 'Mild', attackMod: 1.0, defenseMod: 0.9, speedMod: 1.0 },
    QUIET: { name: 'Quiet', attackMod: 1.0, defenseMod: 1.0, speedMod: 0.9 },
    RASH: { name: 'Rash', attackMod: 1.0, defenseMod: 0.9, speedMod: 1.0 },
    CALM: { name: 'Calm', attackMod: 1.0, defenseMod: 1.1, speedMod: 1.0 },
    GENTLE: { name: 'Gentle', attackMod: 0.9, defenseMod: 1.1, speedMod: 1.0 },
    SASSY: { name: 'Sassy', attackMod: 1.0, defenseMod: 1.1, speedMod: 0.9 },
    CAREFUL: { name: 'Careful', attackMod: 1.0, defenseMod: 1.1, speedMod: 1.0 },
    QUIRKY: { name: 'Quirky', attackMod: 1.0, defenseMod: 1.0, speedMod: 1.0 }
};

// Move definitions - at least 50 moves
export const MOVES = {
    // Normal type moves
    TACKLE: { name: 'Tackle', type: ELEMENT_TYPES.NORMAL, power: 40, accuracy: 100, description: 'Un attacco base' },
    SCRATCH: { name: 'Scratch', type: ELEMENT_TYPES.NORMAL, power: 40, accuracy: 100, description: 'Graffia il nemico' },
    QUICK_ATTACK: { name: 'Quick Attack', type: ELEMENT_TYPES.NORMAL, power: 40, accuracy: 100, description: 'Attacco veloce' },
    HYPER_FANG: { name: 'Hyper Fang', type: ELEMENT_TYPES.NORMAL, power: 80, accuracy: 90, description: 'Morso potente' },
    BODY_SLAM: { name: 'Body Slam', type: ELEMENT_TYPES.NORMAL, power: 85, accuracy: 100, description: 'Carica con il corpo' },
    HYPER_BEAM: { name: 'Hyper Beam', type: ELEMENT_TYPES.NORMAL, power: 150, accuracy: 90, description: 'Raggio devastante' },
    
    // Fire type moves
    EMBER: { name: 'Ember', type: ELEMENT_TYPES.FIRE, power: 40, accuracy: 100, description: 'Lancia piccole fiamme' },
    FLAME_WHEEL: { name: 'Flame Wheel', type: ELEMENT_TYPES.FIRE, power: 60, accuracy: 100, description: 'Ruota di fuoco' },
    FLAMETHROWER: { name: 'Flamethrower', type: ELEMENT_TYPES.FIRE, power: 90, accuracy: 100, description: 'Lanciafiamme potente' },
    FIRE_BLAST: { name: 'Fire Blast', type: ELEMENT_TYPES.FIRE, power: 110, accuracy: 85, description: 'Esplosione di fuoco' },
    FIRE_PUNCH: { name: 'Fire Punch', type: ELEMENT_TYPES.FIRE, power: 75, accuracy: 100, description: 'Pugno infuocato' },
    HEAT_WAVE: { name: 'Heat Wave', type: ELEMENT_TYPES.FIRE, power: 95, accuracy: 90, description: 'Ondata di calore' },
    INFERNO: { name: 'Inferno', type: ELEMENT_TYPES.FIRE, power: 100, accuracy: 50, description: 'Inferno ardente' },
    
    // Water type moves
    WATER_GUN: { name: 'Water Gun', type: ELEMENT_TYPES.WATER, power: 40, accuracy: 100, description: 'Spara acqua' },
    BUBBLE_BEAM: { name: 'Bubble Beam', type: ELEMENT_TYPES.WATER, power: 65, accuracy: 100, description: 'Raggio di bolle' },
    WATER_PULSE: { name: 'Water Pulse', type: ELEMENT_TYPES.WATER, power: 60, accuracy: 100, description: 'Impulso d\'acqua' },
    SURF: { name: 'Surf', type: ELEMENT_TYPES.WATER, power: 90, accuracy: 100, description: 'Grande ondata' },
    HYDRO_PUMP: { name: 'Hydro Pump', type: ELEMENT_TYPES.WATER, power: 110, accuracy: 80, description: 'Idropompa potente' },
    AQUA_TAIL: { name: 'Aqua Tail', type: ELEMENT_TYPES.WATER, power: 90, accuracy: 90, description: 'Colpo di coda acquatica' },
    
    // Grass type moves
    VINE_WHIP: { name: 'Vine Whip', type: ELEMENT_TYPES.GRASS, power: 45, accuracy: 100, description: 'Frusta con liane' },
    RAZOR_LEAF: { name: 'Razor Leaf', type: ELEMENT_TYPES.GRASS, power: 55, accuracy: 95, description: 'Foglie affilate' },
    MEGA_DRAIN: { name: 'Mega Drain', type: ELEMENT_TYPES.GRASS, power: 40, accuracy: 100, description: 'Drena energia' },
    SEED_BOMB: { name: 'Seed Bomb', type: ELEMENT_TYPES.GRASS, power: 80, accuracy: 100, description: 'Bomba di semi' },
    ENERGY_BALL: { name: 'Energy Ball', type: ELEMENT_TYPES.GRASS, power: 90, accuracy: 100, description: 'Sfera di energia' },
    SOLAR_BEAM: { name: 'Solar Beam', type: ELEMENT_TYPES.GRASS, power: 120, accuracy: 100, description: 'Raggio solare' },
    PETAL_DANCE: { name: 'Petal Dance', type: ELEMENT_TYPES.GRASS, power: 120, accuracy: 100, description: 'Danza di petali' },
    
    // Electric type moves
    THUNDER_SHOCK: { name: 'Thunder Shock', type: ELEMENT_TYPES.ELECTRIC, power: 40, accuracy: 100, description: 'Scossa elettrica' },
    SPARK: { name: 'Spark', type: ELEMENT_TYPES.ELECTRIC, power: 65, accuracy: 100, description: 'Scintilla elettrica' },
    THUNDERBOLT: { name: 'Thunderbolt', type: ELEMENT_TYPES.ELECTRIC, power: 90, accuracy: 100, description: 'Fulmine potente' },
    THUNDER: { name: 'Thunder', type: ELEMENT_TYPES.ELECTRIC, power: 110, accuracy: 70, description: 'Tuono devastante' },
    DISCHARGE: { name: 'Discharge', type: ELEMENT_TYPES.ELECTRIC, power: 80, accuracy: 100, description: 'Scarica elettrica' },
    VOLT_TACKLE: { name: 'Volt Tackle', type: ELEMENT_TYPES.ELECTRIC, power: 120, accuracy: 100, description: 'Carica elettrica' },
    
    // Ghost type moves
    LICK: { name: 'Lick', type: ELEMENT_TYPES.GHOST, power: 30, accuracy: 100, description: 'Leccata spettrale' },
    SHADOW_SNEAK: { name: 'Shadow Sneak', type: ELEMENT_TYPES.GHOST, power: 40, accuracy: 100, description: 'Attacco d\'ombra' },
    SHADOW_PUNCH: { name: 'Shadow Punch', type: ELEMENT_TYPES.GHOST, power: 60, accuracy: 100, description: 'Pugno oscuro' },
    SHADOW_BALL: { name: 'Shadow Ball', type: ELEMENT_TYPES.GHOST, power: 80, accuracy: 100, description: 'Sfera d\'ombra' },
    SHADOW_CLAW: { name: 'Shadow Claw', type: ELEMENT_TYPES.GHOST, power: 70, accuracy: 100, description: 'Artiglio spettrale' },
    NIGHT_SHADE: { name: 'Night Shade', type: ELEMENT_TYPES.GHOST, power: 60, accuracy: 100, description: 'Ombra notturna' },
    
    // Psychic type moves
    CONFUSION: { name: 'Confusion', type: ELEMENT_TYPES.PSYCHIC, power: 50, accuracy: 100, description: 'Confonde il nemico' },
    PSYBEAM: { name: 'Psybeam', type: ELEMENT_TYPES.PSYCHIC, power: 65, accuracy: 100, description: 'Raggio psichico' },
    PSYCHIC: { name: 'Psychic', type: ELEMENT_TYPES.PSYCHIC, power: 90, accuracy: 100, description: 'Potere psichico' },
    ZEN_HEADBUTT: { name: 'Zen Headbutt', type: ELEMENT_TYPES.PSYCHIC, power: 80, accuracy: 90, description: 'Testata zen' },
    
    // Fairy type moves
    FAIRY_WIND: { name: 'Fairy Wind', type: ELEMENT_TYPES.FAIRY, power: 40, accuracy: 100, description: 'Vento fatato' },
    DRAINING_KISS: { name: 'Draining Kiss', type: ELEMENT_TYPES.FAIRY, power: 50, accuracy: 100, description: 'Bacio che drena' },
    PLAY_ROUGH: { name: 'Play Rough', type: ELEMENT_TYPES.FAIRY, power: 90, accuracy: 90, description: 'Gioco violento' },
    MOONBLAST: { name: 'Moonblast', type: ELEMENT_TYPES.FAIRY, power: 95, accuracy: 100, description: 'Raggio lunare' },
    DAZZLING_GLEAM: { name: 'Dazzling Gleam', type: ELEMENT_TYPES.FAIRY, power: 80, accuracy: 100, description: 'Luce abbagliante' },
    
    // Steel type moves
    METAL_CLAW: { name: 'Metal Claw', type: ELEMENT_TYPES.STEEL, power: 50, accuracy: 95, description: 'Artiglio metallico' },
    IRON_HEAD: { name: 'Iron Head', type: ELEMENT_TYPES.STEEL, power: 80, accuracy: 100, description: 'Testata d\'acciaio' },
    FLASH_CANNON: { name: 'Flash Cannon', type: ELEMENT_TYPES.STEEL, power: 80, accuracy: 100, description: 'Cannone lucente' },
    STEEL_WING: { name: 'Steel Wing', type: ELEMENT_TYPES.STEEL, power: 70, accuracy: 90, description: 'Ala d\'acciaio' },
    
    // Dragon type moves
    DRAGON_BREATH: { name: 'Dragon Breath', type: ELEMENT_TYPES.DRAGON, power: 60, accuracy: 100, description: 'Respiro draconico' },
    DRAGON_CLAW: { name: 'Dragon Claw', type: ELEMENT_TYPES.DRAGON, power: 80, accuracy: 100, description: 'Artiglio del drago' },
    DRAGON_PULSE: { name: 'Dragon Pulse', type: ELEMENT_TYPES.DRAGON, power: 85, accuracy: 100, description: 'Impulso draconico' },
    OUTRAGE: { name: 'Outrage', type: ELEMENT_TYPES.DRAGON, power: 120, accuracy: 100, description: 'Furia del drago' }
};

export const MONSTER_SPECIES = {
    'Blue_Puffball': {
        name: 'Blue Puffball',
        types: [ELEMENT_TYPES.WATER, ELEMENT_TYPES.FAIRY],
        baseHP: 45,
        baseAttack: 49,
        baseDefense: 49,
        baseSpeed: 45,
        catchRate: 0.7,
        expYield: 64,
        learnset: {
            1: 'TACKLE',
            5: 'WATER_GUN',
            9: 'FAIRY_WIND',
            13: 'BUBBLE_BEAM',
            17: 'DRAINING_KISS',
            21: 'WATER_PULSE',
            25: 'PLAY_ROUGH',
            30: 'SURF',
            35: 'MOONBLAST',
            40: 'HYDRO_PUMP'
        }
    },
    'Gnugnu': {
        name: 'Gnugnu',
        types: [ELEMENT_TYPES.GHOST, ELEMENT_TYPES.PSYCHIC],
        baseHP: 50,
        baseAttack: 55,
        baseDefense: 40,
        baseSpeed: 60,
        catchRate: 0.6,
        expYield: 72,
        learnset: {
            1: 'SCRATCH',
            4: 'LICK',
            8: 'CONFUSION',
            12: 'SHADOW_SNEAK',
            16: 'PSYBEAM',
            20: 'SHADOW_PUNCH',
            24: 'ZEN_HEADBUTT',
            28: 'SHADOW_BALL',
            32: 'PSYCHIC',
            36: 'SHADOW_CLAW',
            40: 'NIGHT_SHADE'
        }
    },
    'Lotus': {
        name: 'Lotus',
        types: [ELEMENT_TYPES.GRASS, ELEMENT_TYPES.FAIRY],
        baseHP: 55,
        baseAttack: 45,
        baseDefense: 55,
        baseSpeed: 50,
        catchRate: 0.65,
        expYield: 68,
        learnset: {
            1: 'TACKLE',
            5: 'VINE_WHIP',
            9: 'FAIRY_WIND',
            13: 'RAZOR_LEAF',
            17: 'MEGA_DRAIN',
            21: 'DAZZLING_GLEAM',
            25: 'SEED_BOMB',
            29: 'ENERGY_BALL',
            33: 'MOONBLAST',
            37: 'SOLAR_BEAM',
            42: 'PETAL_DANCE'
        }
    },
    'Blossom': {
        name: 'Blossom',
        types: [ELEMENT_TYPES.GRASS, ELEMENT_TYPES.FLYING],
        baseHP: 48,
        baseAttack: 52,
        baseDefense: 43,
        baseSpeed: 65,
        catchRate: 0.7,
        expYield: 70,
        learnset: {
            1: 'TACKLE',
            6: 'VINE_WHIP',
            11: 'RAZOR_LEAF',
            16: 'QUICK_ATTACK',
            21: 'MEGA_DRAIN',
            26: 'SEED_BOMB',
            31: 'ENERGY_BALL',
            36: 'SOLAR_BEAM',
            41: 'PETAL_DANCE'
        }
    },
    'LavaFlare': {
        name: 'LavaFlare',
        types: [ELEMENT_TYPES.FIRE, ELEMENT_TYPES.ROCK],
        baseHP: 58,
        baseAttack: 64,
        baseDefense: 50,
        baseSpeed: 55,
        catchRate: 0.5,
        expYield: 85,
        learnset: {
            1: 'TACKLE',
            7: 'EMBER',
            13: 'FLAME_WHEEL',
            19: 'FIRE_PUNCH',
            25: 'FLAMETHROWER',
            31: 'HEAT_WAVE',
            37: 'FIRE_BLAST',
            43: 'INFERNO'
        }
    },
    'Pyrolynx': {
        name: 'Pyrolynx',
        types: [ELEMENT_TYPES.FIRE, ELEMENT_TYPES.NORMAL],
        baseHP: 52,
        baseAttack: 60,
        baseDefense: 48,
        baseSpeed: 58,
        catchRate: 0.55,
        expYield: 80,
        learnset: {
            1: 'SCRATCH',
            6: 'EMBER',
            11: 'QUICK_ATTACK',
            16: 'FLAME_WHEEL',
            21: 'BODY_SLAM',
            26: 'FIRE_PUNCH',
            31: 'FLAMETHROWER',
            36: 'HYPER_FANG',
            41: 'FIRE_BLAST'
        }
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
    constructor(species, level = 5, nature = null) {
        const speciesData = MONSTER_SPECIES[species];
        this.species = species;
        this.name = speciesData.name;
        this.level = level;
        this.types = speciesData.types || [ELEMENT_TYPES.NORMAL];
        
        // Assign random nature if not specified
        if (nature) {
            this.nature = NATURES[nature];
        } else {
            const natureKeys = Object.keys(NATURES);
            const randomNature = natureKeys[Math.floor(Math.random() * natureKeys.length)];
            this.nature = NATURES[randomNature];
        }
        
        // Calculate base stats
        const baseMaxHP = this.calculateStat(speciesData.baseHP, level);
        const baseAttack = this.calculateStat(speciesData.baseAttack, level);
        const baseDefense = this.calculateStat(speciesData.baseDefense, level);
        const baseSpeed = this.calculateStat(speciesData.baseSpeed, level);
        
        // Apply nature modifiers
        this.maxHP = baseMaxHP; // HP is not affected by nature
        this.currentHP = this.maxHP;
        this.attack = Math.floor(baseAttack * this.nature.attackMod);
        this.defense = Math.floor(baseDefense * this.nature.defenseMod);
        this.speed = Math.floor(baseSpeed * this.nature.speedMod);
        
        this.exp = 0;
        this.expToNextLevel = this.calculateExpNeeded(level);
        
        // Initialize moves
        this.moves = [];
        this.learnAvailableMoves();
    }
    
    calculateStat(baseStat, level) {
        // Pokemon-like stat calculation formula
        // Formula: ((2 * BaseStat * Level) / 100) + Level + 10
        return Math.floor(((2 * baseStat * level) / 100) + level + 10);
    }
    
    calculateExpNeeded(level) {
        // Simple exponential growth
        return Math.floor(Math.pow(level, 3));
    }
    
    learnAvailableMoves() {
        const speciesData = MONSTER_SPECIES[this.species];
        const learnset = speciesData.learnset || {};
        
        // Learn all moves up to current level
        Object.keys(learnset).forEach(levelKey => {
            const learnLevel = parseInt(levelKey);
            if (learnLevel <= this.level) {
                const moveKey = learnset[levelKey];
                if (MOVES[moveKey] && !this.hasMove(moveKey)) {
                    // Limit to 4 moves, replace oldest if full
                    if (this.moves.length >= 4) {
                        this.moves.shift(); // Remove first (oldest) move
                    }
                    this.moves.push(moveKey);
                }
            }
        });
        
        // Ensure at least Tackle if no moves
        if (this.moves.length === 0) {
            this.moves.push('TACKLE');
        }
    }
    
    hasMove(moveKey) {
        return this.moves.includes(moveKey);
    }
    
    getMove(index) {
        if (index >= 0 && index < this.moves.length) {
            return MOVES[this.moves[index]];
        }
        return null;
    }
    
    gainExp(amount) {
        this.exp += amount;
        let leveledUp = false;
        
        while (this.exp >= this.expToNextLevel && this.level < 100) {
            this.levelUp();
            leveledUp = true;
        }
        
        return leveledUp;
    }
    
    levelUp() {
        this.exp -= this.expToNextLevel;
        this.level++;
        
        const speciesData = MONSTER_SPECIES[this.species];
        const oldMaxHP = this.maxHP;
        
        // Recalculate base stats
        const baseMaxHP = this.calculateStat(speciesData.baseHP, this.level);
        const baseAttack = this.calculateStat(speciesData.baseAttack, this.level);
        const baseDefense = this.calculateStat(speciesData.baseDefense, this.level);
        const baseSpeed = this.calculateStat(speciesData.baseSpeed, this.level);
        
        // Apply nature modifiers
        this.maxHP = baseMaxHP;
        this.currentHP += (this.maxHP - oldMaxHP); // Heal by the HP increase
        this.attack = Math.floor(baseAttack * this.nature.attackMod);
        this.defense = Math.floor(baseDefense * this.nature.defenseMod);
        this.speed = Math.floor(baseSpeed * this.nature.speedMod);
        
        this.expToNextLevel = this.calculateExpNeeded(this.level);
        
        // Check for new moves to learn
        this.learnAvailableMoves();
        
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
    
    getTypeEffectiveness(moveType, defenderTypes) {
        let effectiveness = 1.0;
        
        defenderTypes.forEach(defenderType => {
            if (TYPE_EFFECTIVENESS[moveType] && TYPE_EFFECTIVENESS[moveType][defenderType] !== undefined) {
                effectiveness *= TYPE_EFFECTIVENESS[moveType][defenderType];
            }
        });
        
        return effectiveness;
    }
    
    toJSON() {
        return {
            species: this.species,
            name: this.name,
            level: this.level,
            types: this.types,
            nature: Object.keys(NATURES).find(key => NATURES[key] === this.nature),
            maxHP: this.maxHP,
            currentHP: this.currentHP,
            attack: this.attack,
            defense: this.defense,
            speed: this.speed,
            exp: this.exp,
            expToNextLevel: this.expToNextLevel,
            moves: this.moves
        };
    }
    
    static fromJSON(data) {
        const monster = new Monster(data.species, data.level, data.nature);
        monster.currentHP = data.currentHP;
        monster.exp = data.exp;
        if (data.moves) {
            monster.moves = data.moves;
        }
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
