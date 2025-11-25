# Automated Screenshot Test Report

Generated: 2025-11-25T10:36:38.264Z

## Summary

- Total screenshots captured: 15
- Ground-level views: 7
- Overhead views: 8

## Screenshots

| # | Name | Camera Position | Description |
|---|------|-----------------|-------------|
| 1 | 01_village_overview | (0.00, 25.00, 30.00) | Village center overview from above |
| 2 | 02_pokecenter_view | (-15.00, 15.00, -5.00) | View of Poké Center from angle |
| 3 | 03_market_view | (15.00, 15.00, -5.00) | View of Market from angle |
| 4 | 11_ground_village_center | (0.00, 1.26, 5.00) | Ground-level: Village center looking toward Poké Center |
| 5 | 12_ground_pokecenter_entrance | (-15.00, 0.36, -10.00) | Ground-level: Poké Center entrance close view |
| 6 | 13_ground_market_entrance | (15.00, 0.96, -10.00) | Ground-level: Market entrance close view |
| 7 | 14_ground_houses_west | (-10.00, 0.27, 15.00) | Ground-level: Western houses view |
| 8 | 15_ground_houses_east | (10.00, 0.77, 15.00) | Ground-level: Eastern houses view |
| 9 | 16_ground_npc_trainer | (-22.00, 0.54, 3.00) | Ground-level: NPC trainer area view |
| 10 | 17_ground_village_south | (0.00, 0.72, 35.00) | Ground-level: Southern path toward wild zone |
| 11 | 21_pokecenter_base_check | (-25.00, 0.14, -15.00) | Ground-level: Poké Center base verification (side angle) |
| 12 | 22_market_base_check | (25.00, 0.50, -15.00) | Ground-level: Market base verification (side angle) |
| 13 | 23_house_red_base | (-5.00, 0.03, 20.00) | Ground-level: Red house base verification |
| 14 | 24_house_blue_base | (5.00, 0.32, 20.00) | Ground-level: Blue house base verification |
| 15 | 25_player_perspective | (0.00, 2.79, 3.00) | Player perspective: Looking at village center |

## Ground-Level Views ("A Raso Terra")

These views are captured with the camera at player feet height (terrain + offset) looking horizontally.
This perspective reveals objects that may be partially underground or floating above the ground.

### Village Ground-Level Views

#### 11_ground_village_center
- **Description**: Ground-level: Village center looking toward Poké Center
- **Camera**: (0, terrain+1, 5)
- **Target**: (0, terrain+1, -20)
- **File**: screenshots/11_ground_village_center.png

#### 12_ground_pokecenter_entrance
- **Description**: Ground-level: Poké Center entrance close view
- **Camera**: (-15, terrain+0.5, -10)
- **Target**: (-15, terrain+0.5, -15)
- **File**: screenshots/12_ground_pokecenter_entrance.png

#### 13_ground_market_entrance
- **Description**: Ground-level: Market entrance close view
- **Camera**: (15, terrain+0.5, -10)
- **Target**: (15, terrain+0.5, -15)
- **File**: screenshots/13_ground_market_entrance.png

#### 14_ground_houses_west
- **Description**: Ground-level: Western houses view
- **Camera**: (-10, terrain+0.5, 15)
- **Target**: (-15, terrain+0.5, 15)
- **File**: screenshots/14_ground_houses_west.png

#### 15_ground_houses_east
- **Description**: Ground-level: Eastern houses view
- **Camera**: (10, terrain+0.5, 15)
- **Target**: (15, terrain+0.5, 15)
- **File**: screenshots/15_ground_houses_east.png

#### 16_ground_npc_trainer
- **Description**: Ground-level: NPC trainer area view
- **Camera**: (-22, terrain+0.5, 3)
- **Target**: (-25, terrain+0.5, 0)
- **File**: screenshots/16_ground_npc_trainer.png

#### 17_ground_village_south
- **Description**: Ground-level: Southern path toward wild zone
- **Camera**: (0, terrain+1, 35)
- **Target**: (0, terrain+1, 48)
- **File**: screenshots/17_ground_village_south.png

#### 21_pokecenter_base_check
- **Description**: Ground-level: Poké Center base verification (side angle)
- **Camera**: (-25, terrain+0.3, -15)
- **Target**: (-15, terrain+0.3, -15)
- **File**: screenshots/21_pokecenter_base_check.png

#### 22_market_base_check
- **Description**: Ground-level: Market base verification (side angle)
- **Camera**: (25, terrain+0.3, -15)
- **Target**: (15, terrain+0.3, -15)
- **File**: screenshots/22_market_base_check.png

#### 23_house_red_base
- **Description**: Ground-level: Red house base verification
- **Camera**: (-5, terrain+0.3, 20)
- **Target**: (-15, terrain+0.3, 15)
- **File**: screenshots/23_house_red_base.png

#### 24_house_blue_base
- **Description**: Ground-level: Blue house base verification
- **Camera**: (5, terrain+0.3, 20)
- **Target**: (15, terrain+0.3, 15)
- **File**: screenshots/24_house_blue_base.png

#### 25_player_perspective
- **Description**: Player perspective: Looking at village center
- **Camera**: (0, terrain+2.5, 3)
- **Target**: (0, terrain+2.5, -10)
- **File**: screenshots/25_player_perspective.png

## Notes

- All screenshots were captured from a live dev server instance
- Camera positions use terrain height function for ground-level views
- Ground-level views help identify objects placed below or above terrain level
