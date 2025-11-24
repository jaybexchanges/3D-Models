# Enhanced Capture System Documentation

## Overview
The capture system has been enhanced to provide a realistic and strategic Pokemon-style catching mechanic that considers multiple factors.

## Capture Algorithm

The final catch rate is calculated using the formula:

```
Final Catch Rate = min(99%, (Base Rate × HP Modifier × Level Modifier × Ball Modifier) + Status Bonus)
```

### Factors Affecting Capture

#### 1. Base Catch Rate (Species-Dependent)
Each monster species has a base catch rate ranging from 0.0 to 1.0:
- Easy to catch: 0.7 (70%) - e.g., Blue Puffball, Lotus
- Medium difficulty: 0.6 (60%) - e.g., Gnugnu
- Harder to catch: 0.5 (50%) - e.g., LavaFlare

#### 2. HP Modifier (Current HP / Max HP)
The monster's remaining HP significantly affects catch rate:

| HP Remaining | Modifier | Effect |
|--------------|----------|--------|
| 100% - 51%   | 1.0x - 1.25x | Gradual increase as HP drops |
| 50% - 26%    | 1.5x | Half HP: 50% easier to catch |
| 25% - 0%     | 2.0x | Very low HP: 100% easier to catch |

**Example:**
- Full HP (20/20): 1.0x modifier
- Half HP (10/20): 1.5x modifier  
- Low HP (5/20): 2.0x modifier

#### 3. Level Modifier
Higher level monsters are slightly harder to catch:

```
Level Modifier = max(0.5, 1.0 - (Level - 5) × 0.01)
```

| Level | Modifier | Difficulty Change |
|-------|----------|-------------------|
| 5     | 1.00x    | Base difficulty |
| 10    | 0.95x    | 5% harder |
| 20    | 0.85x    | 15% harder |
| 50    | 0.55x    | 45% harder |
| 100   | 0.50x    | 50% harder (cap) |

#### 4. Status Condition Bonus (Additive)
Status conditions provide a flat percentage bonus:

| Status | Bonus | Notes |
|--------|-------|-------|
| None | +0% | No bonus |
| Poisoned | +10% | Minor bonus |
| Burned | +10% | Minor bonus |
| Paralyzed | +15% | Good bonus |
| Asleep | +20% | Best bonus |
| Frozen | +20% | Best bonus |

**Important:** Status bonuses are **added** to the final rate, not multiplied.

#### 5. Poké Ball Type (Multiplicative)
Different ball types multiply the catch rate:

| Ball Type | Multiplier | Cost |
|-----------|------------|------|
| Poké Ball | 1.0x | 200 coins |
| Great Ball | 1.5x | 600 coins |
| Ultra Ball | 2.0x | 1200 coins |

## Example Calculations

### Example 1: Basic Capture
**Blue Puffball (Lv. 5, Full HP, No Status, Poké Ball)**
- Base Rate: 0.70
- HP Modifier: 1.0x (full HP)
- Level Modifier: 1.0x (level 5)
- Ball Modifier: 1.0x (Poké Ball)
- Status Bonus: +0%
- **Final: 70%**

### Example 2: Weakened Target
**Blue Puffball (Lv. 5, Half HP, No Status, Poké Ball)**
- Base Rate: 0.70
- HP Modifier: 1.5x (half HP)
- Level Modifier: 1.0x
- Ball Modifier: 1.0x
- Status Bonus: +0%
- **Final: 99%** (capped)

### Example 3: Status Effect
**Blue Puffball (Lv. 5, Full HP, Paralyzed, Poké Ball)**
- Base Rate: 0.70
- HP Modifier: 1.0x
- Level Modifier: 1.0x
- Ball Modifier: 1.0x
- Status Bonus: +15%
- **Final: 85%**

### Example 4: High Level Challenge
**LavaFlare (Lv. 20, Full HP, No Status, Poké Ball)**
- Base Rate: 0.50
- HP Modifier: 1.0x
- Level Modifier: 0.85x (level penalty)
- Ball Modifier: 1.0x
- Status Bonus: +0%
- **Final: 42.5%**

### Example 5: Optimal Conditions
**LavaFlare (Lv. 20, Low HP, Asleep, Ultra Ball)**
- Base Rate: 0.50
- HP Modifier: 2.0x (low HP)
- Level Modifier: 0.85x
- Ball Modifier: 2.0x (Ultra Ball)
- Status Bonus: +20%
- Calculation: (0.50 × 2.0 × 0.85 × 2.0) + 0.20 = 1.70 + 0.20 = 1.90
- **Final: 99%** (capped at 99%)

## Strategic Tips

### For Players:
1. **Weaken the target** - Get HP to red (< 25%) for maximum catch rate
2. **Use status moves** - Paralysis (+15%) or Sleep (+20%) significantly help
3. **Save better balls** - Use Ultra Balls on high-level or rare monsters
4. **Level matters** - Higher level monsters need more preparation
5. **Combine factors** - Low HP + Status + Great Ball = high success rate

### Difficulty Scaling:
- **Early game (Level 2-7)**: 70-99% with basic preparation
- **Mid game (Level 10-20)**: 50-85% requires strategy
- **Late game (Level 30+)**: 30-70% even with optimal conditions
- **Legendary (Level 50+)**: < 50% base rate, needs perfect setup

## Implementation Details

### Monster Status Field
Each monster now has a `status` property:
```javascript
monster.status = 'none' | 'paralyzed' | 'asleep' | 'poisoned' | 'burned' | 'frozen'
```

### Capture Function (rpg-game.js)
```javascript
useCatchItem(itemId) {
    // Calculate all modifiers
    const finalCatchRate = (baseRate × hpMod × levelMod × ballMod) + statusBonus;
    
    // Cap at 99%
    const cappedRate = Math.min(0.99, finalCatchRate);
    
    // Roll for capture
    if (Math.random() < cappedRate) {
        // Success!
    }
}
```

### Console Debug Info
The system logs detailed capture calculations:
```
Catch attempt: Base=0.70, HP=1.50, Level=1.00, Ball=1, Status=+0.00, Final=99.0%
```

## Testing Results

All test scenarios passed:
- ✅ HP affects catch rate (lower HP = easier)
- ✅ Level affects catch rate (higher level = harder)
- ✅ Status conditions provide correct bonuses
- ✅ Ball types multiply effectiveness correctly
- ✅ Maximum catch rate capped at 99%
- ✅ Minimum level modifier capped at 0.5x (50%)

## Balance Considerations

### Why these numbers?
- **HP scaling (2.0x max)**: Rewards strategic damage without making it trivial
- **Level penalty (0.01 per level)**: Keeps high-level monsters challenging
- **Status bonuses (10-20%)**: Makes status moves valuable but not overpowered
- **Ball multipliers (1.0x-2.0x)**: Progressive upgrade path for players
- **99% cap**: Nothing is guaranteed, adds tension even in ideal scenarios

### Comparison to Pokemon:
This system is inspired by Pokemon's capture formula but simplified:
- Pokemon uses: `((3 × MaxHP - 2 × CurrentHP) × CatchRate × BallBonus) / (3 × MaxHP) × StatusBonus`
- Our system is more straightforward but achieves similar strategic depth
- Status bonuses are additive instead of multiplicative for better player understanding

## Future Enhancements

Potential additions:
1. **Critical Capture** - Small chance for instant capture (5%)
2. **Shake System** - Visual feedback with 1-3 shakes before success/failure
3. **Terrain Bonuses** - Certain balls work better in specific locations
4. **Time-of-Day** - Some balls more effective at night/day
5. **Weather Effects** - Rain/snow affects certain ball types
6. **Hold Items** - Items that boost capture rate when held
7. **Friendship System** - Harder to catch monsters that trust you less

## Notes for Developers

- Status condition must be set manually (no status moves implemented yet)
- Ball items already exist in inventory system
- Capture system integrates with existing battle flow
- Console logging can be disabled by removing console.log() in production
- All percentages are stored as decimals (0.70 = 70%)
