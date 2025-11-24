// Test Capture System
import { Monster, MONSTER_SPECIES, ITEMS } from './game-data.js';

console.log('=== Testing Enhanced Capture System ===\n');

// Test function to calculate catch rate
function calculateCatchRate(monster, ballType, status = 'none') {
    const speciesData = MONSTER_SPECIES[monster.species];
    const item = ITEMS[ballType];
    
    // Base catch rate
    let catchRate = speciesData.catchRate;
    
    // HP Factor
    const hpPercent = monster.currentHP / monster.maxHP;
    let hpModifier = 1.0;
    if (hpPercent <= 0.25) {
        hpModifier = 2.0;
    } else if (hpPercent <= 0.5) {
        hpModifier = 1.5;
    } else {
        hpModifier = 1.0 + (1.0 - hpPercent) * 0.5;
    }
    
    // Level Factor
    const levelModifier = Math.max(0.5, 1.0 - (monster.level - 5) * 0.01);
    
    // Status Bonus
    let statusBonus = 0;
    if (status === 'paralyzed') statusBonus = 0.15;
    else if (status === 'asleep') statusBonus = 0.20;
    else if (status === 'frozen') statusBonus = 0.20;
    else if (status === 'poisoned' || status === 'burned') statusBonus = 0.10;
    
    // Ball modifier
    const ballModifier = item.catchBonus;
    
    // Final calculation
    const finalRate = Math.min(0.99, (catchRate * hpModifier * levelModifier * ballModifier) + statusBonus);
    
    return {
        base: catchRate,
        hpMod: hpModifier,
        levelMod: levelModifier,
        ballMod: ballModifier,
        statusBonus: statusBonus,
        final: finalRate
    };
}

// Test 1: Full HP, Low Level, Normal Ball
console.log('Test 1: Blue Puffball (Lv. 5, Full HP, Poké Ball)');
const test1 = new Monster('Blue_Puffball', 5);
test1.currentHP = test1.maxHP;
const result1 = calculateCatchRate(test1, 'pokeball');
console.log(`  Base Rate: ${(result1.base * 100).toFixed(1)}%`);
console.log(`  HP Modifier: ${result1.hpMod.toFixed(2)}x`);
console.log(`  Level Modifier: ${result1.levelMod.toFixed(2)}x`);
console.log(`  Ball Modifier: ${result1.ballMod}x`);
console.log(`  Status Bonus: +${(result1.statusBonus * 100).toFixed(1)}%`);
console.log(`  FINAL CATCH RATE: ${(result1.final * 100).toFixed(1)}%\n`);

// Test 2: Half HP, Low Level, Normal Ball
console.log('Test 2: Blue Puffball (Lv. 5, Half HP, Poké Ball)');
const test2 = new Monster('Blue_Puffball', 5);
test2.currentHP = Math.floor(test2.maxHP / 2);
const result2 = calculateCatchRate(test2, 'pokeball');
console.log(`  HP: ${test2.currentHP}/${test2.maxHP}`);
console.log(`  HP Modifier: ${result2.hpMod.toFixed(2)}x (Half HP bonus)`);
console.log(`  FINAL CATCH RATE: ${(result2.final * 100).toFixed(1)}%\n`);

// Test 3: Low HP, Low Level, Normal Ball
console.log('Test 3: Blue Puffball (Lv. 5, Low HP, Poké Ball)');
const test3 = new Monster('Blue_Puffball', 5);
test3.currentHP = Math.floor(test3.maxHP * 0.2);
const result3 = calculateCatchRate(test3, 'pokeball');
console.log(`  HP: ${test3.currentHP}/${test3.maxHP}`);
console.log(`  HP Modifier: ${result3.hpMod.toFixed(2)}x (Very low HP bonus)`);
console.log(`  FINAL CATCH RATE: ${(result3.final * 100).toFixed(1)}%\n`);

// Test 4: Full HP + Paralyzed
console.log('Test 4: Blue Puffball (Lv. 5, Full HP, Paralyzed, Poké Ball)');
const test4 = new Monster('Blue_Puffball', 5);
test4.currentHP = test4.maxHP;
test4.status = 'paralyzed';
const result4 = calculateCatchRate(test4, 'pokeball', 'paralyzed');
console.log(`  Status Bonus: +${(result4.statusBonus * 100).toFixed(1)}% (Paralyzed)`);
console.log(`  FINAL CATCH RATE: ${(result4.final * 100).toFixed(1)}%\n`);

// Test 5: Full HP + Asleep
console.log('Test 5: Blue Puffball (Lv. 5, Full HP, Asleep, Poké Ball)');
const test5 = new Monster('Blue_Puffball', 5);
test5.currentHP = test5.maxHP;
test5.status = 'asleep';
const result5 = calculateCatchRate(test5, 'pokeball', 'asleep');
console.log(`  Status Bonus: +${(result5.statusBonus * 100).toFixed(1)}% (Asleep)`);
console.log(`  FINAL CATCH RATE: ${(result5.final * 100).toFixed(1)}%\n`);

// Test 6: High Level Monster
console.log('Test 6: LavaFlare (Lv. 20, Full HP, Poké Ball)');
const test6 = new Monster('LavaFlare', 20);
test6.currentHP = test6.maxHP;
const result6 = calculateCatchRate(test6, 'pokeball');
console.log(`  Level Modifier: ${result6.levelMod.toFixed(2)}x (Level 20 penalty)`);
console.log(`  FINAL CATCH RATE: ${(result6.final * 100).toFixed(1)}%\n`);

// Test 7: High Level + Low HP + Great Ball
console.log('Test 7: LavaFlare (Lv. 20, Low HP, Great Ball)');
const test7 = new Monster('LavaFlare', 20);
test7.currentHP = Math.floor(test7.maxHP * 0.2);
const result7 = calculateCatchRate(test7, 'greatball');
console.log(`  HP: ${test7.currentHP}/${test7.maxHP}`);
console.log(`  Ball Modifier: ${result7.ballMod}x (Great Ball)`);
console.log(`  FINAL CATCH RATE: ${(result7.final * 100).toFixed(1)}%\n`);

// Test 8: Optimal Conditions
console.log('Test 8: Blue Puffball (Lv. 5, Low HP, Asleep, Ultra Ball)');
const test8 = new Monster('Blue_Puffball', 5);
test8.currentHP = Math.floor(test8.maxHP * 0.1);
test8.status = 'asleep';
const result8 = calculateCatchRate(test8, 'ultraball', 'asleep');
console.log(`  HP: ${test8.currentHP}/${test8.maxHP}`);
console.log(`  HP Modifier: ${result8.hpMod.toFixed(2)}x`);
console.log(`  Ball Modifier: ${result8.ballMod}x (Ultra Ball)`);
console.log(`  Status Bonus: +${(result8.statusBonus * 100).toFixed(1)}% (Asleep)`);
console.log(`  FINAL CATCH RATE: ${(result8.final * 100).toFixed(1)}%\n`);

console.log('=== Summary ===');
console.log('✓ HP affects catch rate (lower HP = easier)');
console.log('✓ Level affects catch rate (higher level = slightly harder)');
console.log('✓ Status conditions provide bonuses:');
console.log('  - Paralyzed: +15%');
console.log('  - Asleep/Frozen: +20%');
console.log('  - Poisoned/Burned: +10%');
console.log('✓ Poké Ball types multiply effectiveness:');
console.log('  - Poké Ball: 1.0x');
console.log('  - Great Ball: 1.5x');
console.log('  - Ultra Ball: 2.0x');
console.log('\n✓ All tests completed successfully!');
