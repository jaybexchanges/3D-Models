# 🎮 3D-Models - Gioco RPG Pokémon-like Completo

Un'avventura RPG 3D completa in stile Pokémon con sistema di cattura, battaglie, livelli e molto altro!

## 🎨 Modelli 3D Disponibili

### Mostriciattoli Catturabili
- **Blue Puffball** 🔵💧✨ - Palla pelosa blu (Water/Fairy)
  - Base: HP 45, ATK 49, DEF 49, VEL 45
  - Mosse speciali: Water Gun, Bubble Beam, Moonblast, Play Rough
  
- **Gnugnu** 👻🧠 - Creatura misteriosa (Ghost/Psychic) **[STARTER]**
  - Base: HP 50, ATK 55, DEF 40, VEL 60
  - Mosse speciali: Shadow Ball, Psychic, Shadow Claw, Zen Headbutt
  
- **Lotus** 🌸🌿✨ - Mostro floreale (Grass/Fairy)
  - Base: HP 55, ATK 45, DEF 55, VEL 50
  - Mosse speciali: Solar Beam, Energy Ball, Moonblast, Petal Dance
  
- **Blossom** 🌺🌿🦅 - Creatura fiorita (Grass/Flying)
  - Base: HP 48, ATK 52, DEF 43, VEL 65
  - Mosse speciali: Razor Leaf, Solar Beam, Energy Ball, Quick Attack
  
- **LavaFlare** 🔥🪨 - Mostro di fuoco (Fire/Rock)
  - Base: HP 58, ATK 64, DEF 50, VEL 55
  - Mosse speciali: Flamethrower, Fire Blast, Heat Wave
  
- **Pyrolynx** 🦁🔥 - Felino infuocato (Fire/Normal)
  - Base: HP 52, ATK 60, DEF 48, VEL 58
  - Mosse speciali: Fire Punch, Flamethrower, Body Slam

### Personaggi
- **Player_1** 👤 - Personaggio principale
- **Player_2** 👤 - Modello alternativo

### Edifici
- **Pokémon Center** 🏥 - Centro di cura per i mostri
- **Nigrolino Market** 🏪 - Negozio di oggetti

## 🚀 Avvio Rapido

### Opzione 1: Server HTTP Python (Consigliato)
```bash
python3 -m http.server 8000
```
Poi apri: `http://localhost:8000/rpg.html`

### Opzione 2: Usando npm
```bash
npm start
```

## 🎮 Controlli

### Mouse
- **Clic + Trascina**: Ruota la camera
- **Scroll**: Zoom avanti/indietro

### Tastiera
- **W/A/S/D**: Movimento del personaggio
- **SHIFT**: Corri più velocemente
- **E**: Interagisci con NPC, edifici e mostri
- **M**: Cambia mappa (Villaggio ⇄ Zona Selvaggia)
- **ESC**: Apri/chiudi menu principale

## 🌟 Caratteristiche Complete

### ✨ Sistema di Gioco Completo
- **Due Mappe Esplorabili**
  - Villaggio Iniziale con Centro Pokémon, Market e case
  - Zona Selvaggia con mostri selvatici

- **Sistema di Battaglia Avanzato**
  - Battaglie a turni con calcolo danni realistico
  - **Sistema di mosse completo con 55+ mosse**
  - **Selezione mossa durante la battaglia**
  - **Sistema di tipi elementali con vantaggi/svantaggi**
  - HP bar animate in tempo reale
  - Log di battaglia con messaggi dettagliati
  - Battaglie contro mostri selvatici e allenatori NPC
  - Calcolo efficacia tipo (super efficace, non molto efficace)

- **Sistema di Mosse Avanzato** ⚔️
  - **55+ mosse diverse** con potenza, tipo e precisione
  - Ogni mostro impara mosse specifiche salendo di livello
  - Limite di 4 mosse per mostro
  - Mosse di tipo: Normale, Fuoco, Acqua, Erba, Elettro, Fantasma, Psico, Folletto, Acciaio, Drago
  - Ogni mossa ha descrizione, potenza e precisione uniche

- **Sistema di Tipi Elementali** 🔥💧🌿
  - **18 tipi elementali**: Normal, Fire, Water, Grass, Electric, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy
  - **Dual-typing**: La maggior parte dei mostri ha 2 tipi
  - **Calcolo efficacia tipo**: Vantaggi e svantaggi in battaglia
  - Esempi: Fuoco > Erba, Acqua > Fuoco, Elettro > Acqua

- **Sistema Nature/Personalità** ⭐
  - **21 nature diverse** che influenzano la crescita delle statistiche
  - Ogni natura modifica Attacco, Difesa o Velocità
  - Esempi:
    - **Brave**: +10% Attacco, -10% Velocità
    - **Bold**: +10% Difesa, -10% Attacco
    - **Timid**: +10% Velocità, -10% Attacco
  - Nature assegnate casualmente alla cattura/generazione

- **Sistema di Livelli ed Esperienza**
  - I mostri guadagnano EXP dopo ogni battaglia
  - Level up automatico con aumento statistiche
  - **Apprendimento automatico nuove mosse** salendo di livello
  - Barra EXP visuale per ogni mostro
  - Statistiche: HP, Attacco, Difesa, Velocità

- **Sistema di Cattura**
  - 3 tipi di Poké Ball (normale, Great Ball, Ultra Ball)
  - Tasso di cattura influenzato da HP e tipo di ball
  - Limite squadra di 6 mostri
  - **GnuGnu come mostro starter** automatico all'inizio

### 📋 Menu Completo (Tasto ESC)

#### 👥 Squadra
- Visualizza tutti i mostri catturati
- **Tipi elementali** di ogni mostro
- **Natura/personalità** con effetti
- **Lista mosse correnti** (massimo 4)
- Statistiche complete (HP, ATK, DEF, VEL)
- Livello e barra esperienza
- Stato HP con indicatore visuale

#### 🎒 Inventario
- Gestione oggetti completa
- Poké Ball di vari tipi
- Pozioni curative (Pozione, Super Pozione, Iper Pozione)
- Utilizzo oggetti su mostri della squadra

#### 🗺️ Mappa
- Visualizzazione mappe disponibili
- Indicatore posizione attuale
- Descrizione delle aree

#### 💾 Salva/Carica
- Salvataggio completo della partita su localStorage
- Carica partita precedente
- Visualizza informazioni salvataggio
- Elimina salvataggio

### 🏪 Sistema Negozio
- Acquista oggetti con denaro guadagnato
- Prezzi variabili per oggetto
- Controllo automatico denaro disponibile
- Inventario che si aggiorna automaticamente

### 🏥 Centro Pokémon
- Cura automatica di tutti i mostri
- Ripristino HP completo
- Gratuito e illimitato

### 🤺 Allenatori NPC
- 3 allenatori sparsi per le mappe
- Dialoghi e sfide di battaglia
- Ricompense in denaro per vittorie
- Segno distintivo giallo sopra la testa
- Allenatori non ripetibili dopo la sconfitta

## 💰 Sistema Economico
- Denaro iniziale: 3000 monete
- Guadagno da vittorie contro allenatori
- Spesa per acquisti nel negozio

## 📦 Oggetti Disponibili

### Sfere di Cattura
- **Poké Ball** (200💰) - Tasso cattura base
- **Great Ball** (600💰) - Tasso cattura +50%
- **Ultra Ball** (1200💰) - Tasso cattura +100%

### Oggetti Curativi
- **Pozione** (300💰) - Cura 20 HP
- **Super Pozione** (700💰) - Cura 50 HP
- **Iper Pozione** (1200💰) - Cura 200 HP

## 📊 Sistema Statistiche

### Calcolo Statistiche
Le statistiche dei mostri sono calcolate con una formula simile a Pokémon:
```
Stat = ((2 × BaseStat × Level) / 100) + Level + 10
```

Le nature modificano le statistiche finali:
- **Nature aggressive** (es. Brave, Adamant): +10% ATK
- **Nature difensive** (es. Bold, Impish): +10% DEF
- **Nature veloci** (es. Timid, Jolly): +10% VEL

### Calcolo Esperienza
EXP richiesta per livello successivo:
```
EXP = Level³
```

### Calcolo Danni
Sistema di battaglia con formula che considera:
- Livello dell'attaccante
- **Potenza della mossa usata**
- Attacco dell'attaccante
- Difesa del difensore
- **Efficacia del tipo** (0x, 0.5x, 1x, 2x, 4x)
- Variazione random (85%-100%)

### ⚔️ Esempi di Mosse per Tipo

**Fuoco** 🔥
- Ember (40), Flame Wheel (60), Flamethrower (90), Fire Blast (110)

**Acqua** 💧
- Water Gun (40), Bubble Beam (65), Surf (90), Hydro Pump (110)

**Erba** 🌿
- Vine Whip (45), Razor Leaf (55), Energy Ball (90), Solar Beam (120)

**Elettro** ⚡
- Thunder Shock (40), Spark (65), Thunderbolt (90), Thunder (110)

**Fantasma** 👻
- Lick (30), Shadow Sneak (40), Shadow Ball (80), Shadow Claw (70)

**Psico** 🧠
- Confusion (50), Psybeam (65), Psychic (90), Zen Headbutt (80)

**Folletto** ✨
- Fairy Wind (40), Draining Kiss (50), Play Rough (90), Moonblast (95)

**Acciaio** ⚙️
- Metal Claw (50), Iron Head (80), Flash Cannon (80), Steel Wing (70)

### 🎯 Vantaggi di Tipo

**Super Efficace (2x danno):**
- Fuoco > Erba, Ghiaccio, Coleottero, Acciaio
- Acqua > Fuoco, Terra, Roccia
- Erba > Acqua, Terra, Roccia
- Elettro > Acqua, Volante
- Fantasma > Fantasma, Psico
- Folletto > Drago, Lotta, Buio

**Non Molto Efficace (0.5x danno):**
- Fuoco < Acqua, Fuoco, Roccia
- Acqua < Erba, Acqua, Drago
- Erba < Fuoco, Erba, Veleno, Volante
- Elettro < Erba, Elettro, Drago

**Nessun Effetto (0x danno):**
- Elettro vs Terra
- Fantasma vs Normale
- Normale vs Fantasma

## 🎯 Obiettivi del Gioco
1. **Inizia con GnuGnu** - Il tuo mostro starter Ghost/Psychic
2. Cattura tutti e 6 i mostriciattoli disponibili
3. Sconfiggi tutti e 3 gli allenatori NPC
4. Porta i tuoi mostri al livello massimo
5. Impara tutte le mosse più potenti
6. Accumula ricchezze sconfiggendo allenatori

## 🛠️ Struttura Tecnica

### File Principali
```
3D-Models/
├── rpg.html              # Pagina HTML principale
├── rpg-game.js           # Logica di gioco principale
├── game-data.js          # Dati mostri, oggetti, NPC
├── ui-manager.js         # Gestione interfacce e menu
├── rpg-styles.css        # Stili per menu e UI
├── package.json          # Configurazione npm
└── modelli_3D/           # Cartella modelli 3D
    ├── Blue_Puffball_3D.glb
    ├── Gnugnu_3D.glb
    ├── Lotus_3D.glb
    ├── Blossom_3D.glb
    ├── LavaFlare.glb
    ├── Pyrolynx.glb
    ├── Player_1.glb
    ├── Pokémon_Center.glb
    └── Nigrolino_market.glb
```

### Tecnologie Utilizzate
- **Three.js** (0.169.0) - Rendering 3D
- **GLTFLoader** - Caricamento modelli 3D
- **OrbitControls** - Controllo camera
- **LocalStorage API** - Salvataggio partite
- **ES6 Modules** - Organizzazione codice

## 🎨 Personalizzazione

### Aggiungere Nuovi Mostri
Edita `game-data.js` nella sezione `MONSTER_SPECIES`:
```javascript
'NuovoMostro': {
    name: 'Nuovo Mostro',
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
        10: 'FLAME_WHEEL',
        15: 'FLAMETHROWER'
    }
}
```

### Aggiungere Nuove Mosse
Edita `game-data.js` nella sezione `MOVES`:
```javascript
NUOVA_MOSSA: { 
    name: 'Nuova Mossa', 
    type: ELEMENT_TYPES.FIRE, 
    power: 80, 
    accuracy: 95, 
    description: 'Descrizione della mossa' 
}
```

### Aggiungere Nuovi Oggetti
Edita `game-data.js` nella sezione `ITEMS`:
```javascript
nuovooggetto: {
    name: 'Nuovo Oggetto',
    type: 'heal', // o 'catch'
    healAmount: 30, // per oggetti curativi
    price: 400
}
```

### Aggiungere Nuovi NPC
Edita `game-data.js` nella sezione `NPCS`:
```javascript
trainer4: {
    name: 'Allenatore Giallo',
    dialogue: 'Vuoi combattere?',
    team: [
        { species: 'Blue_Puffball', level: 10 }
    ],
    reward: 600,
    defeated: false
}
```

## 🐛 Risoluzione Problemi

**I modelli 3D non si caricano?**
- Verifica che i file GLB siano nella cartella `modelli_3D/`
- Controlla la console del browser per errori
- Assicurati di usare un server web (non aprire HTML direttamente)

**Il gioco non si salva?**
- Verifica che il browser supporti localStorage
- Controlla che non sia in modalità navigazione privata
- Verifica permessi storage del browser

**Performance lente?**
- Riduci la qualità delle ombre in `rpg-game.js`
- Diminuisci il numero di mostri/decorazioni
- Chiudi applicazioni in background

**Menu non si apre?**
- Assicurati di non essere in battaglia
- Premi ESC per aprire il menu
- Ricarica la pagina se necessario

## 🎓 Guida Strategica

### Per Iniziare
1. Esplora il villaggio e parla con gli NPC
2. Vai al Market e compra Poké Ball e Pozioni
3. Cambia mappa (M) per andare nella Zona Selvaggia
4. Cattura il tuo primo mostro

### Strategie di Battaglia
- **Usa il vantaggio di tipo**: Fuoco contro Erba, Acqua contro Fuoco, ecc.
- **Scegli la mossa giusta**: Ogni mostro ha 4 mosse, usa quella più efficace
- **Considera la natura**: Mostri con natura Brave hanno più attacco
- Abbassa gli HP del mostro nemico prima di catturarlo
- Usa Ultra Ball per mostri difficili da catturare
- Cura i tuoi mostri al Centro Pokémon gratuitamente
- Accumula EXP combattendo mostri selvatici
- **Fai level up per imparare mosse più potenti**

### Gestione Squadra
- **GnuGnu (Ghost/Psychic)** è forte contro Psico e Fantasma
- **Blue Puffball (Water/Fairy)** è versatile con doppio tipo
- **LavaFlare (Fire/Rock)** ha attacco alto ma è debole contro acqua
- Bilancia i tipi della tua squadra per coprire tutte le debolezze
- Controlla le nature per ottimizzare le statistiche

### Gestione Risorse
- Non sprecare Poké Ball su mostri già catturati
- Risparmia denaro per Ultra Ball e Iper Pozioni
- Sconfiggi gli allenatori per guadagnare denaro
- Salva spesso la partita (ESC > Salva/Carica)

## 📝 Note Tecniche

- Richiede browser moderno con supporto ES6 Modules
- Utilizza WebGL per rendering 3D
- Salvataggio locale tramite localStorage
- FPS ottimizzati per prestazioni fluide
- Ombre dinamiche in tempo reale

## 🏆 Achievement Suggeriti

- 🌟 **Primo Mostro**: Cattura il tuo primo mostriciattolo
- 👥 **Squadra Completa**: Cattura tutti e 6 i mostri
- ⚔️ **Campione**: Sconfiggi tutti e 3 gli allenatori
- 📈 **Maestro**: Porta un mostro al livello 50
- 💰 **Ricco**: Accumula 10,000 monete
- 🏥 **Intoccabile**: Vinci 10 battaglie senza usare il Centro Pokémon
- 🎯 **Stratega**: Vinci una battaglia usando solo mosse super efficaci
- ⚡ **Potenza Massima**: Impara una mossa di potenza 100+
- 🔥 **Maestro del Fuoco**: Porta un mostro di tipo Fuoco al livello 40
- 🌿 **Guardiano della Natura**: Cattura tutti i mostri di tipo Erba
- 👻 **Cacciatore di Fantasmi**: Usa GnuGnu per sconfiggere 10 mostri
- 🎲 **Fortuna o Abilità**: Cattura un mostro con una Poké Ball normale al primo tentativo
- 🧠 **Collezionista di Mosse**: Impara tutte e 4 le mosse disponibili con un mostro

## 🆕 Novità di Questa Versione

### Sistema di Mosse Completo
- ✨ **55+ mosse uniche** con potenza, tipo e precisione differenti
- 🎯 Selezione mossa interattiva durante le battaglie
- 📚 Ogni mostro impara mosse automaticamente salendo di livello
- 💪 Mosse più potenti sbloccate a livelli più alti

### Sistema di Tipi Elementali
- 🔥 **18 tipi elementali** completi con vantaggi/svantaggi
- 🎭 **Dual-typing**: Molti mostri hanno 2 tipi
- ⚖️ Calcolo efficacia automatico (super efficace, non molto efficace, nessun effetto)
- 🎮 Strategia di tipo fondamentale per vincere

### Sistema Nature/Personalità
- ⭐ **21 nature diverse** che modificano le statistiche
- 📊 Variabilità nei mostri catturati
- 🎯 Nature aggressive, difensive, bilanciate e veloci
- 🎲 Assegnazione casuale per rendere ogni mostro unico

### Mostro Starter
- 👻 **GnuGnu (Ghost/Psychic)** come compagno iniziale
- 🚀 Inizia subito con un mostro potente
- 📖 Impara mosse spettrali e psichiche

---

## 🤖 GitHub Spark Compatibility

This repository is configured for use with **GitHub Spark**, the AI-powered app builder. 

### Quick Start with Spark

1. Open this repository with GitHub Spark
2. Use natural language to describe changes you want to make
3. Spark will understand the project structure and make intelligent modifications

### Useful Prompts for Spark

- "Add a new ice-type monster called Frostbite with stats similar to LavaFlare"
- "Create a new healing move called 'Nature's Gift' for grass types"
- "Add a new NPC trainer in the wild area"
- "Improve the battle UI with better animations"
- "Add a new item to the shop"

### Documentation for Spark

- **[SPARK.md](SPARK.md)** - Detailed project requirements for AI assistance
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines

### Development Environment

The repository includes a `.devcontainer` configuration for VS Code and GitHub Codespaces, ensuring a consistent development environment.

---

Buona avventura nel mondo dei mostriciattoli! 🎉👾
