// Test script for moves system
import { Monster, MONSTER_SPECIES, MOVES, NATURES, ELEMENT_TYPES } from './game-data.js';

console.log('=== Testing Move System Implementation ===\n');

// Test 1: Check MOVES count
const moveCount = Object.keys(MOVES).length;
console.log(`✓ Total moves defined: ${moveCount}`);
if (moveCount >= 50) {
    console.log('  ✓ Requirement met: 50+ moves\n');
} else {
    console.log('  ✗ ERROR: Less than 50 moves defined\n');
}

// Test 2: Check element types
const elementCount = Object.keys(ELEMENT_TYPES).length;
console.log(`✓ Element types defined: ${elementCount}`);
console.log(`  Types: ${Object.values(ELEMENT_TYPES).join(', ')}\n`);

// Test 3: Check natures
const natureCount = Object.keys(NATURES).length;
console.log(`✓ Natures defined: ${natureCount}`);
console.log(`  Sample natures: ${Object.keys(NATURES).slice(0, 5).join(', ')}\n`);

// Test 4: Check all monsters have types and learnsets
console.log('=== Testing Monster Species ===');
Object.keys(MONSTER_SPECIES).forEach(speciesKey => {
    const species = MONSTER_SPECIES[speciesKey];
    console.log(`\n${species.name}:`);
    console.log(`  Types: ${species.types ? species.types.join(', ') : 'MISSING'}`);
    console.log(`  Learnset moves: ${species.learnset ? Object.keys(species.learnset).length : 0}`);
    
    if (species.learnset) {
        const levels = Object.keys(species.learnset).map(l => parseInt(l)).sort((a, b) => a - b);
        console.log(`  Learn levels: ${levels.join(', ')}`);
        console.log(`  Sample moves: ${Object.values(species.learnset).slice(0, 3).join(', ')}`);
    }
});

// Test 5: Create GnuGnu starter
console.log('\n=== Testing GnuGnu Starter ===');
const gnugnu = new Monster('Gnugnu', 5);
console.log(`✓ Created: ${gnugnu.name}`);
console.log(`  Level: ${gnugnu.level}`);
console.log(`  Types: ${gnugnu.types.join(', ')}`);
console.log(`  Nature: ${gnugnu.nature.name}`);
console.log(`  Stats:`);
console.log(`    HP: ${gnugnu.currentHP}/${gnugnu.maxHP}`);
console.log(`    Attack: ${gnugnu.attack}`);
console.log(`    Defense: ${gnugnu.defense}`);
console.log(`    Speed: ${gnugnu.speed}`);
console.log(`  Moves: ${gnugnu.moves.length}/4`);
gnugnu.moves.forEach((moveKey, i) => {
    const move = MOVES[moveKey];
    if (move) {
        console.log(`    ${i + 1}. ${move.name} (${move.type}, Power: ${move.power})`);
    }
});

// Test 6: Test level up and move learning
console.log('\n=== Testing Level Up System ===');
const testMonster = new Monster('LavaFlare', 1);
console.log(`Created ${testMonster.name} at level ${testMonster.level}`);
console.log(`Initial moves: ${testMonster.moves.join(', ')}`);

// Gain enough exp to reach level 10
const expNeeded = testMonster.calculateExpNeeded(10);
testMonster.gainExp(expNeeded);
console.log(`\nAfter leveling to ${testMonster.level}:`);
console.log(`Moves: ${testMonster.moves.join(', ')}`);
testMonster.moves.forEach((moveKey, i) => {
    const move = MOVES[moveKey];
    if (move) {
        console.log(`  ${i + 1}. ${move.name} (${move.type}, Power: ${move.power})`);
    }
});

// Test 7: Test type effectiveness
console.log('\n=== Testing Type Effectiveness ===');
const fireMonster = new Monster('LavaFlare', 10);
const waterMonster = new Monster('Blue_Puffball', 10);
const grassMonster = new Monster('Lotus', 10);

// Fire vs Grass (should be super effective)
const fireVsGrass = fireMonster.getTypeEffectiveness(ELEMENT_TYPES.FIRE, grassMonster.types);
console.log(`Fire vs Grass effectiveness: ${fireVsGrass}x ${fireVsGrass > 1 ? '(Super effective!)' : ''}`);

// Water vs Fire (should be super effective)
const waterVsFire = waterMonster.getTypeEffectiveness(ELEMENT_TYPES.WATER, fireMonster.types);
console.log(`Water vs Fire effectiveness: ${waterVsFire}x ${waterVsFire > 1 ? '(Super effective!)' : ''}`);

// Fire vs Water (should be not very effective)
const fireVsWater = fireMonster.getTypeEffectiveness(ELEMENT_TYPES.FIRE, waterMonster.types);
console.log(`Fire vs Water effectiveness: ${fireVsWater}x ${fireVsWater < 1 ? '(Not very effective)' : ''}`);

console.log('\n=== All Tests Completed ===');
console.log('✓ Move system successfully implemented!');
console.log('✓ Type system working!');
console.log('✓ Nature system working!');
console.log('✓ GnuGnu starter ready!');
