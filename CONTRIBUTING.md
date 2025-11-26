# Contributing to Swissmon 3D RPG

Thank you for your interest in contributing to Swissmon! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.x (for development server)
- Modern web browser with WebGL support

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/jaybexchanges/3D-Models.git
   cd 3D-Models
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   
   Using Python (recommended, requires Python 3.x):
   ```bash
   npm start
   ```
   
   Alternative using Node.js http-server (no Python required):
   ```bash
   npm run serve
   ```

4. **Open the game**
   - Landing page: http://localhost:8000/index.html
   - Game: http://localhost:8000/rpg.html

## 📁 Project Structure

```
3D-Models/
├── index.html          # Landing page
├── rpg.html            # Main game HTML
├── rpg-game.js         # Game engine
├── game-data.js        # Game data (monsters, moves, items)
├── ui-manager.js       # UI components
├── rpg-styles.css      # Styling
├── modelli_3D/         # 3D assets (GLB files)
└── test-*.js           # Test files
```

## 🎮 Key Files

| File | Description |
|------|-------------|
| `rpg-game.js` | Main RPGGame class with game logic |
| `game-data.js` | Monster species, moves, items, NPCs data |
| `ui-manager.js` | UIManager class for menus and interfaces |
| `rpg-styles.css` | CSS styling for game UI |

## 🧪 Testing

Run the test suite:
```bash
npm test
```

This runs:
- `test-moves-system.js` - Move and type effectiveness tests
- `test-capture-system.js` - Monster capture system tests
- `test-geometry-system.js` - 3D geometry tests

## 📝 Code Style

### JavaScript
- Use ES6+ features (classes, modules, arrow functions)
- Use async/await for asynchronous operations
- Follow existing naming conventions (camelCase for variables, PascalCase for classes)

### CSS
- Use semantic class names
- Follow the existing BEM-like naming pattern
- Keep styles in `rpg-styles.css`

### Comments
- Code comments in English
- User-facing text in Italian (the game's primary language)

## 🎯 Types of Contributions

### Adding New Monsters

1. Add monster definition in `game-data.js`:
   ```javascript
   'MonsterName': {
       name: 'Monster Name',
       types: [ELEMENT_TYPES.TYPE1, ELEMENT_TYPES.TYPE2],
       baseHP: 50,
       baseAttack: 50,
       baseDefense: 50,
       baseSpeed: 50,
       catchRate: 0.7,
       expYield: 70,
       learnset: {
           1: 'MOVE1',
           5: 'MOVE2'
       }
   }
   ```

2. Add corresponding GLB model in `modelli_3D/monsters/`

3. Update spawn locations in `rpg-game.js` if needed

### Adding New Moves

Add move definition in `game-data.js`:
```javascript
MOVE_NAME: { 
    name: 'Move Name', 
    type: ELEMENT_TYPES.TYPE, 
    power: 80, 
    accuracy: 95, 
    description: 'Move description' 
}
```

### Adding New Items

Add item in `game-data.js`:
```javascript
itemname: {
    name: 'Item Name',
    type: 'heal', // or 'catch'
    healAmount: 30, // for heal type
    catchMultiplier: 1.5, // for catch type
    price: 400
}
```

## 🔄 Pull Request Process

1. **Create a branch** for your feature/fix
2. **Make your changes** following the code style
3. **Test your changes** - run `npm test` and manually test the game
4. **Update documentation** if needed
5. **Submit a PR** with a clear description

## 🐛 Reporting Issues

When reporting issues, please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots (if applicable)

## 🤝 Community Guidelines

- Be respectful and constructive
- Search existing issues before creating new ones
- Keep discussions on-topic
- Help others when you can

## 📧 Questions?

If you have questions about contributing, feel free to open an issue with the "question" label.

---

Thank you for contributing to Swissmon! 🎮✨
