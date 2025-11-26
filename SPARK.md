# 🚀 GitHub Spark - Swissmon 3D RPG Game

This document describes the Swissmon 3D RPG game project for use with GitHub Spark and AI-assisted development.

## 📋 Project Overview

**Swissmon** is a Pokémon-like 3D RPG game built with Three.js and vanilla JavaScript. Players can explore villages and wild areas, catch monsters, battle trainers, and manage their team.

## 🎯 Core Features

### Game Mechanics
- **Monster Catching System**: 3 ball types with varying catch rates
- **Turn-based Battle System**: 55+ moves with type effectiveness
- **Level & Experience System**: Monsters level up and learn new moves
- **Type System**: 18 elemental types with strengths/weaknesses
- **Nature System**: 21 natures affecting monster stats

### Game World
- **Village Map**: Pokemon Center, Market, NPC houses
- **Wild Area**: Wild monsters, trainers, exploration
- **3D Environment**: Three.js rendering with GLB models

### User Interface
- **Main Menu**: Team, Inventory, Map, Save/Load
- **Battle UI**: HP bars, move selection, battle log
- **Shop System**: Buy items with in-game currency
- **Pokemon Center**: Free monster healing

## 🛠️ Technical Stack

### Frontend
- **Three.js** (v0.169.0) - 3D rendering engine
- **ES6 Modules** - Modern JavaScript modules
- **HTML5/CSS3** - UI and styling
- **LocalStorage API** - Save/load game state

### 3D Assets
- **Format**: GLB (GL Transmission Format)
- **Categories**: Monsters, NPCs, Buildings, Environment

### Development
- **Node.js** - Package management
- **Python HTTP Server** - Local development server
- **Puppeteer** - Screenshot automation and testing

## 📁 File Structure

```
3D-Models/
├── index.html          # Landing page
├── rpg.html            # Main game page
├── rpg-game.js         # Game engine (RPGGame class)
├── game-data.js        # Data: monsters, moves, items, NPCs
├── ui-manager.js       # UI components and menus
├── rpg-styles.css      # Game styling
├── package.json        # Node.js dependencies
├── modelli_3D/         # 3D model assets
│   ├── monsters/       # Monster GLB models
│   ├── NPCs/           # Character models
│   ├── buildings_and_interiors/
│   └── environment/    # Trees, terrain, backgrounds
├── test-*.js           # Test files
└── SPARK.md            # This file
```

## 🎮 How to Run

### Using npm
```bash
npm install
npm start
# Open http://localhost:8000/rpg.html
```

### Using Python
```bash
python3 -m http.server 8000
# Open http://localhost:8000/rpg.html
```

## 🧪 Testing

```bash
npm test
# Runs test-moves-system.js, test-capture-system.js, test-geometry-system.js
```

## 📖 Key Classes and Modules

### RPGGame (rpg-game.js)
Main game class handling:
- Scene setup and rendering
- Player movement and controls
- Map switching (village ↔ wild)
- Battle system
- Save/load functionality

### UIManager (ui-manager.js)
Manages all UI elements:
- Main menu system
- Battle interface
- Team/Inventory displays
- Shop and Pokemon Center

### Game Data (game-data.js)
Contains all game data:
- `MONSTER_SPECIES` - Monster definitions
- `MOVES` - Move database (55+ moves)
- `ITEMS` - Items and pricing
- `NPCS` - NPC definitions
- `ELEMENT_TYPES` - Type system
- `TYPE_EFFECTIVENESS` - Type matchup chart

## 🔧 Customization Guide

### Adding a New Monster
```javascript
// In game-data.js MONSTER_SPECIES
'NewMonster': {
    name: 'New Monster',
    types: [ELEMENT_TYPES.FIRE, ELEMENT_TYPES.FLYING],
    baseHP: 50,
    baseAttack: 50,
    baseDefense: 50,
    baseSpeed: 50,
    catchRate: 0.7,
    expYield: 70,
    learnset: {
        1: 'TACKLE',
        5: 'EMBER',
        10: 'FLAMETHROWER'
    }
}
```

### Adding a New Move
```javascript
// In game-data.js MOVES
NEW_MOVE: { 
    name: 'New Move', 
    type: ELEMENT_TYPES.FIRE, 
    power: 80, 
    accuracy: 95, 
    description: 'A powerful fire attack' 
}
```

## 🎯 Development Tasks for Spark

When working with this project, you can ask Spark to:

1. **Add new monsters** - Create new monster species with stats and movesets
2. **Add new moves** - Design new battle moves with types and effects
3. **Improve UI** - Enhance menus, add animations, improve styling
4. **Add features** - New game mechanics like evolution, abilities, etc.
5. **Fix bugs** - Debug issues with battles, movement, or UI
6. **Add maps** - Create new explorable areas
7. **Enhance 3D** - Improve lighting, effects, or camera controls

## 📝 Conventions

- **Language**: Italian for UI text, English for code/comments
- **Styling**: CSS classes with semantic naming
- **Modules**: ES6 import/export pattern
- **Async**: Promises and async/await for loading
- **Events**: DOM event listeners for UI interactions

## 🔗 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| three | ^0.169.0 | 3D rendering |
| puppeteer-core | ^23.0.0 | Screenshot testing |
| typescript | ^5.9.3 | Type checking (dev) |

## 💡 AI Prompting Tips

When using GitHub Spark with this project:

1. **Be specific about files**: Reference exact file names when making changes
2. **Use existing patterns**: Follow the established code structure
3. **Test changes**: Run `npm test` after modifications
4. **Check the game**: Start the server and test in browser
5. **Italian UI**: Keep user-facing text in Italian
