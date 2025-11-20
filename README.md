# 🎮 3D-Models - Mappa di Gioco con Mostriciattoli

Un'esperienza interattiva 3D con i tuoi mostriciattoli animati!

## 🎨 Modelli 3D Disponibili

- **Blue Puffball** 🔵 - Palla pelosa blu
- **Gnugnu** 👻 - Creatura misteriosa
- **Lotus** 🌸 - Mostro floreale

## 🚀 Avvio Rapido

### Opzione 1: Server HTTP Python (Consigliato)
```bash
python3 -m http.server 8000
```
Poi apri: `http://localhost:8000`

### Opzione 2: Usando npm
```bash
npm start
```

## 🎮 Controlli

### Mouse
- **Clic + Trascina**: Ruota la camera
- **Scroll**: Zoom avanti/indietro

### Tastiera
- **W**: Muovi camera in avanti
- **A**: Muovi camera a sinistra
- **S**: Muovi camera indietro
- **D**: Muovi camera a destra

### Pulsanti UI
- **Salta**: Fai saltare il mostro
- **Gira**: Rotazione completa 360°
- **Muovi**: Attiva/disattiva movimento automatico

## 🌟 Caratteristiche

✨ **Mappa 3D Completa**
- Terreno con variazioni di altezza
- Piattaforme rialzate
- Alberi e rocce decorative
- Sentiero di pietra

🎭 **Animazioni dei Mostri**
- Animazione idle (movimento su/giù)
- Salto parabolico
- Rotazione completa
- Movimento circolare automatico

💡 **Illuminazione Dinamica**
- Luce ambientale
- Luce direzionale (sole) con ombre
- Luci puntiformi colorate per atmosfera

📦 **Tecnologie Utilizzate**
- Three.js (rendering 3D)
- GLTFLoader (caricamento modelli)
- OrbitControls (controllo camera)

## 📁 Struttura del Progetto

```
3D-Models/
├── index.html          # Pagina principale
├── game.js            # Logica del gioco
├── package.json       # Configurazione npm
├── README.md          # Documentazione
└── modelli_3D/        # Cartella con i modelli GLB
    ├── Blue_Puffball_3D.glb
    ├── Gnugnu_3D.glb
    └── Lotus_3D.glb
```

## 🛠️ Personalizzazione

### Modificare la Posizione dei Mostri
Edita il file `game.js` nella sezione `loadMonsters()`:
```javascript
const monsterConfigs = [
    { name: 'blue', file: 'Blue_Puffball_3D.glb', position: { x: -10, y: 2, z: 0 }, scale: 2 },
    // ... modifica x, y, z per cambiare la posizione
];
```

### Aggiungere Nuove Animazioni
Aggiungi nuove funzioni nel metodo `animateMonster()` di `game.js`

### Cambiare Colori della Mappa
Modifica i valori dei colori nella funzione `createGameMap()`:
```javascript
color: 0x3a8c3a  // Formato esadecimale RGB
```

## 🎯 Funzionalità Future

- [ ] Sistema di raccolta oggetti
- [ ] Interazione tra mostri
- [ ] Effetti particellari
- [ ] Suoni e musica
- [ ] Modalità multiplayer
- [ ] Sistema di livelli

## 📝 Note Tecniche

- I modelli GLB devono essere nella cartella `modelli_3D/`
- Il gioco richiede un server web per funzionare (CORS)
- Compatibile con tutti i browser moderni
- Performance ottimizzate con ombre soft

## 🐛 Risoluzione Problemi

**I mostri non si caricano?**
- Verifica che i file GLB siano nella cartella corretta
- Controlla la console del browser per errori
- Assicurati di usare un server web (non aprire index.html direttamente)

**Performance lente?**
- Riduci la qualità delle ombre in `game.js`
- Diminuisci il numero di oggetti decorativi

---

Divertiti con i tuoi mostriciattoli! 🎉
