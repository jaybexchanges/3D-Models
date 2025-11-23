# 🎮 3D-Models - Gioco RPG Pokémon-like Completo

Un'avventura RPG 3D completa in stile Pokémon con sistema di cattura, battaglie, livelli e molto altro!

## 🎨 Modelli 3D Disponibili

### Mostriciattoli Catturabili
- **Blue Puffball** 🔵 - Palla pelosa blu (Lv. base: HP 45, ATK 49, DEF 49, VEL 45)
- **Gnugnu** 👻 - Creatura misteriosa (Lv. base: HP 50, ATK 55, DEF 40, VEL 60)
- **Lotus** 🌸 - Mostro floreale (Lv. base: HP 55, ATK 45, DEF 55, VEL 50)
- **Blossom** 🌺 - Creatura fiorita (Lv. base: HP 48, ATK 52, DEF 43, VEL 65)
- **LavaFlare** 🔥 - Mostro di fuoco (Lv. base: HP 58, ATK 64, DEF 50, VEL 55)
- **Pyrolynx** 🦁 - Felino infuocato (Lv. base: HP 52, ATK 60, DEF 48, VEL 58)

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
  - HP bar animate in tempo reale
  - Log di battaglia con messaggi dettagliati
  - Battaglie contro mostri selvatici e allenatori NPC

- **Sistema di Livelli ed Esperienza**
  - I mostri guadagnano EXP dopo ogni battaglia
  - Level up automatico con aumento statistiche
  - Barra EXP visuale per ogni mostro
  - Statistiche: HP, Attacco, Difesa, Velocità

- **Sistema di Cattura**
  - 3 tipi di Poké Ball (normale, Great Ball, Ultra Ball)
  - Tasso di cattura influenzato da HP e tipo di ball
  - Limite squadra di 6 mostri

### 📋 Menu Completo (Tasto ESC)

#### 👥 Squadra
- Visualizza tutti i mostri catturati
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

### Calcolo Esperienza
EXP richiesta per livello successivo:
```
EXP = Level³
```

### Calcolo Danni
Sistema di battaglia con formula che considera:
- Livello dell'attaccante
- Attacco dell'attaccante
- Difesa del difensore
- Variazione random (85%-100%)

## 🎯 Obiettivi del Gioco
1. Cattura tutti e 6 i mostriciattoli disponibili
2. Sconfiggi tutti e 3 gli allenatori NPC
3. Porta tutti i mostri al livello massimo
4. Accumula ricchezze sconfiggendo allenatori

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
    baseHP: 50,
    baseAttack: 50,
    baseDefense: 50,
    baseSpeed: 50,
    catchRate: 0.7,
    expYield: 70
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
- Abbassa gli HP del mostro nemico prima di catturarlo
- Usa Ultra Ball per mostri difficili da catturare
- Cura i tuoi mostri al Centro Pokémon gratuitamente
- Accumula EXP combattendo mostri selvatici

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

---

Buona avventura nel mondo dei mostriciattoli! 🎉👾
