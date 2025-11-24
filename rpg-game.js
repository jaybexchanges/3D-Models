import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Monster, PlayerInventory, MONSTER_SPECIES, ITEMS, NPCS, MOVES } from './game-data.js';
import { UIManager } from './ui-manager.js';

// Make MOVES globally accessible for UI
window.MOVES = MOVES;

class RPGGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.player = null;
        this.currentMap = 'village'; // 'village' or 'wild'
        this.buildings = {};
        this.wildMonsters = [];
        this.playerTeam = []; // Changed from caughtMonsters to playerTeam (Monster objects)
        this.inventory = new PlayerInventory();
        this.nearestInteractable = null;
        this.inBattle = false;
        this.currentBattleMonster = null;
        this.currentBattleEnemyMonster = null;
        this.battleTurn = 'player';
        this.npcs = {};
        
        // Player movement
        this.keys = {
            w: false, a: false, s: false, d: false,
            shift: false, e: false, m: false, escape: false
        };
        this.playerSpeed = 5;
        this.playerRotation = 0;
        
        this.clock = new THREE.Clock();
        this.loader = new GLTFLoader();
        this.uiManager = null;
        
        this.init();
    }

    async init() {
        this.setupScene();
        this.setupLights();
        this.setupControls();
        this.setupKeyboard();
        
        // Initialize UI Manager
        this.uiManager = new UIManager(this);
        window.uiManager = this.uiManager; // Make accessible globally for onclick handlers
        window.rpgGame = this; // Make game accessible globally
        
        // Add GnuGnu as starter monster
        this.addStarterMonster();
        
        await this.loadPlayer();
        await this.createVillageMap();
        
        this.animate();
        this.hideLoading();
    }
    
    addStarterMonster() {
        // Create GnuGnu as starter monster at level 5
        const starterMonster = new Monster('Gnugnu', 5);
        this.playerTeam.push(starterMonster);
        console.log('✓ Starter monster added: Gnugnu');
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 20, 25);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 25);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI / 2.2;
        this.controls.enablePan = false;
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'escape') {
                if (!this.inBattle) {
                    this.uiManager.toggleMainMenu();
                }
                e.preventDefault();
            } else if (key in this.keys) {
                this.keys[key] = true;
                if (key === 'e' && !this.inBattle && !this.uiManager.isMenuOpen()) this.interact();
                if (key === 'm' && !this.inBattle && !this.uiManager.isMenuOpen()) this.switchMap();
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) this.keys[key] = false;
        });
    }

    async loadPlayer() {
        try {
            const gltf = await this.loadGLTF('modelli_3D/Player_1.glb');
            this.player = gltf.scene;
            this.player.scale.set(2, 2, 2);
            this.player.position.set(0, 0, 0);
            
            this.player.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            this.scene.add(this.player);
            console.log('✓ Player caricato');
        } catch (error) {
            console.error('Errore caricamento player:', error);
        }
    }

    async createVillageMap() {
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c59,
            roughness: 0.8
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Create paths
        this.createPath(0, 0, 40, 4, 0x9b8b6e); // Main path vertical
        this.createPath(0, 0, 4, 30, 0x9b8b6e); // Main path horizontal

        // Load buildings
        await this.loadBuilding('pokecenter', 'Pokémon_Center.glb', -15, 0, -15, 3);
        await this.loadBuilding('market', 'Nigrolino_market.glb', 15, 0, -15, 3);
        
        // Create houses
        this.createHouse(-15, 0, 15, 0xff6b6b);
        this.createHouse(15, 0, 15, 0x6bcfff);
        this.createHouse(0, 0, -25, 0xffd700);

        // Add NPC Trainers
        this.createNPCTrainer('trainer1', -25, 0, 0, 0xff0000);
        this.createNPCTrainer('trainer2', 25, 0, 5, 0x0000ff);

        // Add decorations
        this.createTrees();
        this.createFences();

        console.log('✓ Villaggio creato');
    }

    async createWildMap() {
        // Clear current scene except player and lights
        const objectsToRemove = [];
        this.scene.children.forEach(child => {
            if (child !== this.player && !child.isLight && child.type !== 'AmbientLight' && child.type !== 'DirectionalLight') {
                objectsToRemove.push(child);
            }
        });
        objectsToRemove.forEach(obj => this.scene.remove(obj));
        this.buildings = {};
        this.wildMonsters = [];
        this.npcs = {};

        // Create wild terrain
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 30, 30);
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] = Math.random() * 2 - 0.5; // Random height
        }
        groundGeometry.attributes.position.needsUpdate = true;
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a8c3a,
            roughness: 0.9
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Spawn wild monsters
        await this.spawnWildMonsters();
        
        // Add NPC Trainer in wild area
        this.createNPCTrainer('trainer3', 0, 0, -30, 0x00ff00);
        
        // Add nature elements
        this.createTrees(true);
        this.createRocks();
        this.createBushes();

        console.log('✓ Zona selvaggia creata');
    }

    async spawnWildMonsters() {
        const monsterFiles = [
            'Blue_Puffball_3D.glb',
            'Gnugnu_3D.glb',
            'Lotus_3D.glb',
            'Blossom_3D.glb',
            'LavaFlare.glb',
            'Pyrolynx.glb'
        ];

        const positions = [
            { x: -20, z: -20 },
            { x: 20, z: -20 },
            { x: -20, z: 20 },
            { x: 20, z: 20 },
            { x: -10, z: 10 },
            { x: 10, z: -10 }
        ];

        for (let i = 0; i < monsterFiles.length; i++) {
            try {
                const gltf = await this.loadGLTF(`modelli_3D/${monsterFiles[i]}`);
                const monster = gltf.scene;
                monster.scale.set(2, 2, 2);
                monster.position.set(positions[i].x, 1, positions[i].z);
                
                monster.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                monster.userData.type = 'wild-monster';
                monster.userData.name = monsterFiles[i].replace('_3D.glb', '').replace('.glb', '');
                monster.userData.idlePhase = Math.random() * Math.PI * 2;
                
                this.scene.add(monster);
                this.wildMonsters.push(monster);
            } catch (error) {
                console.error(`Errore caricamento mostro ${monsterFiles[i]}:`, error);
            }
        }
    }

    async loadBuilding(id, filename, x, y, z, scale) {
        try {
            const gltf = await this.loadGLTF(`modelli_3D/${filename}`);
            const building = gltf.scene;
            building.scale.set(scale, scale, scale);
            building.position.set(x, y, z);
            
            building.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            building.userData.type = 'building';
            building.userData.id = id;
            building.userData.interactable = true;
            
            this.scene.add(building);
            this.buildings[id] = building;
            console.log(`✓ ${id} caricato`);
        } catch (error) {
            console.error(`Errore caricamento ${filename}:`, error);
        }
    }

    createHouse(x, y, z, color) {
        const houseGroup = new THREE.Group();
        
        // Walls
        const wallGeometry = new THREE.BoxGeometry(8, 6, 8);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: color });
        const walls = new THREE.Mesh(wallGeometry, wallMaterial);
        walls.castShadow = true;
        walls.receiveShadow = true;
        houseGroup.add(walls);

        // Roof
        const roofGeometry = new THREE.ConeGeometry(6, 3, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 4.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        houseGroup.add(roof);

        // Door
        const doorGeometry = new THREE.BoxGeometry(2, 3, 0.2);
        const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, -1.5, 4.1);
        houseGroup.add(door);

        houseGroup.position.set(x, y + 3, z);
        houseGroup.userData.type = 'building';
        houseGroup.userData.id = 'house';
        houseGroup.userData.interactable = true;
        
        this.scene.add(houseGroup);
    }

    createPath(x, z, width, length, color) {
        const pathGeometry = new THREE.PlaneGeometry(width, length);
        const pathMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.9
        });
        const path = new THREE.Mesh(pathGeometry, pathMaterial);
        path.rotation.x = -Math.PI / 2;
        path.position.set(x, 0.05, z);
        path.receiveShadow = true;
        this.scene.add(path);
    }

    createNPCTrainer(npcId, x, y, z, color) {
        const npcGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.8, 0.8, 3, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        npcGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.7, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.2;
        head.castShadow = true;
        npcGroup.add(head);
        
        // Exclamation mark (indicator)
        const markGeometry = new THREE.BoxGeometry(0.3, 1, 0.1);
        const markMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const mark = new THREE.Mesh(markGeometry, markMaterial);
        mark.position.y = 4;
        npcGroup.add(mark);
        
        npcGroup.position.set(x, y + 1.5, z);
        npcGroup.userData.type = 'npc-trainer';
        npcGroup.userData.id = npcId;
        npcGroup.userData.interactable = true;
        npcGroup.userData.npcData = NPCS[npcId];
        
        this.scene.add(npcGroup);
        this.npcs[npcId] = npcGroup;
        
        console.log(`✓ NPC ${npcId} creato`);
    }

    createTrees(dense = false) {
        const count = dense ? 20 : 8;
        const spread = dense ? 40 : 35;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = spread + Math.random() * 10;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3520 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(x, 2, z);
            trunk.castShadow = true;
            this.scene.add(trunk);

            // Foliage
            const foliageGeometry = new THREE.ConeGeometry(3, 5, 8);
            const foliageColor = dense ? 0x2d5016 : 0x3a7f2d;
            const foliageMaterial = new THREE.MeshStandardMaterial({ color: foliageColor });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.set(x, 6, z);
            foliage.castShadow = true;
            this.scene.add(foliage);
        }
    }

    createFences() {
        const fencePositions = [
            { x: -25, z: 0, rotation: 0, length: 20 },
            { x: 25, z: 0, rotation: 0, length: 20 },
        ];

        fencePositions.forEach(pos => {
            for (let i = 0; i < pos.length; i += 2) {
                const postGeometry = new THREE.BoxGeometry(0.3, 2, 0.3);
                const postMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
                const post = new THREE.Mesh(postGeometry, postMaterial);
                post.position.set(pos.x, 1, pos.z + i - pos.length / 2);
                post.castShadow = true;
                this.scene.add(post);
            }
        });
    }

    createRocks() {
        for (let i = 0; i < 15; i++) {
            const size = Math.random() * 1.5 + 0.5;
            const geometry = new THREE.DodecahedronGeometry(size);
            const material = new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.9
            });
            const rock = new THREE.Mesh(geometry, material);
            
            const angle = Math.random() * Math.PI * 2;
            const radius = 25 + Math.random() * 15;
            rock.position.set(
                Math.cos(angle) * radius,
                size / 2,
                Math.sin(angle) * radius
            );
            rock.castShadow = true;
            this.scene.add(rock);
        }
    }

    createBushes() {
        for (let i = 0; i < 10; i++) {
            const geometry = new THREE.SphereGeometry(1, 8, 8);
            const material = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
            const bush = new THREE.Mesh(geometry, material);
            
            const angle = Math.random() * Math.PI * 2;
            const radius = 20 + Math.random() * 20;
            bush.position.set(
                Math.cos(angle) * radius,
                0.5,
                Math.sin(angle) * radius
            );
            bush.scale.set(1, 0.7, 1);
            bush.castShadow = true;
            this.scene.add(bush);
        }
    }

    loadGLTF(path) {
        return new Promise((resolve, reject) => {
            this.loader.load(path, resolve, undefined, reject);
        });
    }

    updatePlayer(deltaTime) {
        if (!this.player || this.inBattle) return;

        const speed = this.keys.shift ? this.playerSpeed * 2 : this.playerSpeed;
        const moveDistance = speed * deltaTime;
        
        let moved = false;
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

        if (this.keys.w) {
            this.player.position.addScaledVector(forward, moveDistance);
            moved = true;
        }
        if (this.keys.s) {
            this.player.position.addScaledVector(forward, -moveDistance);
            moved = true;
        }
        if (this.keys.a) {
            this.player.position.addScaledVector(right, -moveDistance);
            moved = true;
        }
        if (this.keys.d) {
            this.player.position.addScaledVector(right, moveDistance);
            moved = true;
        }

        // Rotate player to face movement direction
        if (moved) {
            const moveDir = new THREE.Vector3();
            if (this.keys.w) moveDir.add(forward);
            if (this.keys.s) moveDir.sub(forward);
            if (this.keys.a) moveDir.sub(right);
            if (this.keys.d) moveDir.add(right);
            
            if (moveDir.length() > 0) {
                const targetRotation = Math.atan2(moveDir.x, moveDir.z);
                this.player.rotation.y = targetRotation;
            }

            // Simple walking animation
            const bobAmount = Math.sin(Date.now() * 0.01) * 0.1;
            this.player.position.y = bobAmount;
        }

        // Keep player in bounds
        this.player.position.x = Math.max(-45, Math.min(45, this.player.position.x));
        this.player.position.z = Math.max(-45, Math.min(45, this.player.position.z));

        // Camera follow player
        const cameraOffset = new THREE.Vector3(0, 20, 25);
        const targetPosition = this.player.position.clone().add(cameraOffset);
        this.controls.target.lerp(this.player.position, 0.1);

        // Check for nearby interactables
        this.checkNearbyInteractables();
    }

    checkNearbyInteractables() {
        const interactionDistance = 5;
        this.nearestInteractable = null;

        // Check buildings
        Object.values(this.buildings).forEach(building => {
            const distance = this.player.position.distanceTo(building.position);
            if (distance < interactionDistance) {
                this.nearestInteractable = building;
            }
        });

        // Check wild monsters
        if (this.currentMap === 'wild') {
            this.wildMonsters.forEach(monster => {
                const distance = this.player.position.distanceTo(monster.position);
                if (distance < interactionDistance) {
                    this.nearestInteractable = monster;
                }
            });
        }
        
        // Check NPCs
        Object.values(this.npcs).forEach(npc => {
            const distance = this.player.position.distanceTo(npc.position);
            if (distance < interactionDistance) {
                this.nearestInteractable = npc;
            }
        });
    }

    interact() {
        if (!this.nearestInteractable) return;

        if (this.nearestInteractable.userData.type === 'building') {
            this.interactWithBuilding(this.nearestInteractable.userData.id);
        } else if (this.nearestInteractable.userData.type === 'wild-monster') {
            this.startWildBattle(this.nearestInteractable);
        } else if (this.nearestInteractable.userData.type === 'npc-trainer') {
            this.interactWithNPC(this.nearestInteractable);
        }
    }
    
    interactWithNPC(npc) {
        const npcData = npc.userData.npcData;
        
        if (npcData.defeated) {
            alert(`${npcData.name}: Sei davvero forte! Continua così!`);
            return;
        }
        
        if (confirm(`${npcData.name}: ${npcData.dialogue}`)) {
            this.startTrainerBattle(npc);
        }
    }

    interactWithBuilding(buildingId) {
        if (buildingId === 'pokecenter') {
            this.healMonsters();
        } else if (buildingId === 'market') {
            this.uiManager.showShopMenu();
        } else {
            alert('Sembra che non ci sia nessuno...');
        }
    }
    
    healMonsters() {
        this.playerTeam.forEach(monster => {
            monster.currentHP = monster.maxHP;
        });
        alert('I tuoi mostri sono stati curati completamente!');
        this.uiManager.updateTeamDisplay();
    }

    startWildBattle(monsterMesh) {
        if (this.playerTeam.length === 0) {
            alert('Non hai mostri nella squadra!');
            return;
        }

        this.inBattle = true;
        this.currentBattleMonster = monsterMesh;
        
        // Create enemy monster instance
        const speciesKey = monsterMesh.userData.name.replace(' ', '_');
        const level = 3 + Math.floor(Math.random() * 5); // Random level 3-7
        this.currentBattleEnemyMonster = new Monster(speciesKey, level);
        
        // Hide old battle UI, show new one
        document.getElementById('battle-screen').classList.remove('active');
        document.getElementById('battle-ui').classList.remove('hidden');
        
        this.uiManager.clearBattleLog();
        this.uiManager.addBattleLog(`Un ${this.currentBattleEnemyMonster.name} selvaggio è apparso!`);
        this.uiManager.updateBattleUI(this.playerTeam[0], this.currentBattleEnemyMonster);
    }
    
    startTrainerBattle(npcMesh) {
        if (this.playerTeam.length === 0) {
            alert('Non hai mostri nella squadra! Cattura un mostro prima di combattere!');
            return;
        }
        
        this.inBattle = true;
        this.currentTrainer = npcMesh;
        
        // Create trainer's first monster
        const trainerData = npcMesh.userData.npcData;
        const firstMonster = trainerData.team[0];
        this.currentBattleEnemyMonster = new Monster(firstMonster.species, firstMonster.level);
        this.trainerTeamIndex = 0;
        
        document.getElementById('battle-ui').classList.remove('hidden');
        this.uiManager.clearBattleLog();
        this.uiManager.addBattleLog(`${trainerData.name} ti sfida a battaglia!`);
        this.uiManager.addBattleLog(`${trainerData.name} manda in campo ${this.currentBattleEnemyMonster.name}!`);
        this.uiManager.updateBattleUI(this.playerTeam[0], this.currentBattleEnemyMonster);
    }

    handleBattleAction(action, moveIndex = 0) {
        if (action === 'attack') {
            this.battleAttack(moveIndex);
        } else if (action === 'catch') {
            if (this.currentTrainer) {
                this.uiManager.addBattleLog('Non puoi catturare i mostri degli allenatori!');
                return;
            }
            this.uiManager.showBattleItemSelection();
        } else if (action === 'item') {
            this.uiManager.showBattleItemSelection();
        } else if (action === 'run') {
            if (this.currentTrainer) {
                this.uiManager.addBattleLog('Non puoi scappare da una battaglia con un allenatore!');
                return;
            }
            this.runFromBattle();
        }
    }
    
    battleAttack(moveIndex = 0) {
        const playerMonster = this.playerTeam[0];
        const enemyMonster = this.currentBattleEnemyMonster;
        
        // Get the move to use
        const move = playerMonster.getMove(moveIndex);
        if (!move) {
            this.uiManager.addBattleLog('Mossa non disponibile!');
            return;
        }
        
        // Check accuracy
        const hitChance = Math.random() * 100;
        if (hitChance > move.accuracy) {
            this.uiManager.addBattleLog(`${playerMonster.name} usa ${move.name} ma manca!`);
            setTimeout(() => this.enemyAttack(), 1500);
            return;
        }
        
        // Calculate type effectiveness
        const effectiveness = playerMonster.getTypeEffectiveness(move.type, enemyMonster.types);
        
        // Calculate damage using Pokemon formula with move power
        const attackerAttack = playerMonster.attack;
        const defenderDefense = enemyMonster.defense;
        const baseDamage = Math.floor(((2 * playerMonster.level / 5 + 2) * move.power * attackerAttack / defenderDefense) / 50) + 2;
        const damage = Math.floor(baseDamage * effectiveness * (0.85 + Math.random() * 0.15));
        
        const enemyDied = enemyMonster.takeDamage(damage);
        
        this.uiManager.addBattleLog(`${playerMonster.name} usa ${move.name}!`);
        if (effectiveness > 1) {
            this.uiManager.addBattleLog('È super efficace!');
        } else if (effectiveness < 1 && effectiveness > 0) {
            this.uiManager.addBattleLog('Non è molto efficace...');
        } else if (effectiveness === 0) {
            this.uiManager.addBattleLog('Non ha effetto...');
        }
        this.uiManager.addBattleLog(`${damage} HP di danno!`);
        this.uiManager.updateBattleUI(playerMonster, enemyMonster);
        
        if (enemyDied) {
            setTimeout(() => this.handleEnemyDefeated(), 1000);
            return;
        }
        
        // Enemy turn
        setTimeout(() => this.enemyAttack(), 1500);
    }
    
    enemyAttack() {
        const playerMonster = this.playerTeam[0];
        const enemyMonster = this.currentBattleEnemyMonster;
        
        // Enemy picks a random move
        const moveIndex = Math.floor(Math.random() * enemyMonster.moves.length);
        const move = enemyMonster.getMove(moveIndex);
        
        if (!move) {
            // Fallback to basic attack if no move available
            const damage = Math.floor(enemyMonster.attack * 0.5);
            const playerDied = playerMonster.takeDamage(damage);
            this.uiManager.addBattleLog(`${enemyMonster.name} attacca! ${damage} HP di danno!`);
            this.uiManager.updateBattleUI(playerMonster, enemyMonster);
            
            if (playerDied) {
                setTimeout(() => {
                    this.uiManager.addBattleLog(`${playerMonster.name} è esausto!`);
                    setTimeout(() => this.endBattle(false), 2000);
                }, 1000);
            }
            return;
        }
        
        // Check accuracy
        const hitChance = Math.random() * 100;
        if (hitChance > move.accuracy) {
            this.uiManager.addBattleLog(`${enemyMonster.name} usa ${move.name} ma manca!`);
            return;
        }
        
        // Calculate type effectiveness
        const effectiveness = enemyMonster.getTypeEffectiveness(move.type, playerMonster.types);
        
        // Calculate damage
        const attackerAttack = enemyMonster.attack;
        const defenderDefense = playerMonster.defense;
        const baseDamage = Math.floor(((2 * enemyMonster.level / 5 + 2) * move.power * attackerAttack / defenderDefense) / 50) + 2;
        const damage = Math.floor(baseDamage * effectiveness * (0.85 + Math.random() * 0.15));
        
        const playerDied = playerMonster.takeDamage(damage);
        
        this.uiManager.addBattleLog(`${enemyMonster.name} usa ${move.name}!`);
        if (effectiveness > 1) {
            this.uiManager.addBattleLog('È super efficace!');
        } else if (effectiveness < 1 && effectiveness > 0) {
            this.uiManager.addBattleLog('Non è molto efficace...');
        } else if (effectiveness === 0) {
            this.uiManager.addBattleLog('Non ha effetto...');
        }
        this.uiManager.addBattleLog(`${damage} HP di danno!`);
        this.uiManager.updateBattleUI(playerMonster, enemyMonster);
        
        if (playerDied) {
            setTimeout(() => {
                this.uiManager.addBattleLog(`${playerMonster.name} è esausto!`);
                setTimeout(() => this.endBattle(false), 2000);
            }, 1000);
        }
    }
    
    handleEnemyDefeated() {
        const playerMonster = this.playerTeam[0];
        const expGained = MONSTER_SPECIES[this.currentBattleEnemyMonster.species].expYield;
        
        this.uiManager.addBattleLog(`${this.currentBattleEnemyMonster.name} è esausto!`);
        this.uiManager.addBattleLog(`${playerMonster.name} ha guadagnato ${expGained} EXP!`);
        
        const levelUpResult = playerMonster.gainExp(expGained);
        if (levelUpResult.leveledUp) {
            this.uiManager.addBattleLog(`${playerMonster.name} è salito al livello ${playerMonster.level}!`);
            
            // Check if there's a new move to learn
            if (levelUpResult.newMove) {
                const newMove = MOVES[levelUpResult.newMove];
                if (playerMonster.moves.length < 4) {
                    // Auto-learn if less than 4 moves
                    playerMonster.learnMove(levelUpResult.newMove);
                    this.uiManager.addBattleLog(`${playerMonster.name} ha imparato ${newMove.name}!`);
                } else {
                    // Prompt user to replace a move
                    this.pendingMoveLearn = {
                        monster: playerMonster,
                        moveKey: levelUpResult.newMove
                    };
                    setTimeout(() => {
                        this.uiManager.showMoveReplacePrompt(playerMonster, levelUpResult.newMove);
                    }, 2000);
                    return; // Don't continue battle flow yet
                }
            }
        }
        
        this.uiManager.updateBattleUI(playerMonster, this.currentBattleEnemyMonster);
        
        if (this.currentTrainer) {
            // Trainer battle - check for next monster
            this.trainerTeamIndex++;
            const trainerData = this.currentTrainer.userData.npcData;
            
            if (this.trainerTeamIndex < trainerData.team.length) {
                setTimeout(() => {
                    const nextMonster = trainerData.team[this.trainerTeamIndex];
                    this.currentBattleEnemyMonster = new Monster(nextMonster.species, nextMonster.level);
                    this.uiManager.addBattleLog(`${trainerData.name} manda in campo ${this.currentBattleEnemyMonster.name}!`);
                    this.uiManager.updateBattleUI(playerMonster, this.currentBattleEnemyMonster);
                }, 2000);
            } else {
                // Trainer defeated
                setTimeout(() => {
                    this.inventory.money += trainerData.reward;
                    this.uiManager.addBattleLog(`Hai sconfitto ${trainerData.name}!`);
                    this.uiManager.addBattleLog(`Hai ricevuto ${trainerData.reward} monete!`);
                    trainerData.defeated = true;
                    // Remove exclamation mark from NPC
                    this.currentTrainer.children[2].visible = false;
                    setTimeout(() => this.endBattle(true), 3000);
                }, 2000);
            }
        } else {
            // Wild battle - remove monster from scene
            setTimeout(() => this.endBattle(true), 2000);
        }
    }
    
    continueBattleAfterMoveLearn() {
        const playerMonster = this.playerTeam[0];
        this.uiManager.updateBattleUI(playerMonster, this.currentBattleEnemyMonster);
        
        if (this.currentTrainer) {
            // Trainer battle - check for next monster
            this.trainerTeamIndex++;
            const trainerData = this.currentTrainer.userData.npcData;
            
            if (this.trainerTeamIndex < trainerData.team.length) {
                setTimeout(() => {
                    const nextMonster = trainerData.team[this.trainerTeamIndex];
                    this.currentBattleEnemyMonster = new Monster(nextMonster.species, nextMonster.level);
                    this.uiManager.addBattleLog(`${trainerData.name} manda in campo ${this.currentBattleEnemyMonster.name}!`);
                    this.uiManager.updateBattleUI(playerMonster, this.currentBattleEnemyMonster);
                }, 1000);
            } else {
                // Trainer defeated
                setTimeout(() => {
                    this.inventory.money += trainerData.reward;
                    this.uiManager.addBattleLog(`Hai sconfitto ${trainerData.name}!`);
                    this.uiManager.addBattleLog(`Hai ricevuto ${trainerData.reward} monete!`);
                    trainerData.defeated = true;
                    // Remove exclamation mark from NPC
                    this.currentTrainer.children[2].visible = false;
                    setTimeout(() => this.endBattle(true), 2000);
                }, 1000);
            }
        } else {
            // Wild battle - remove monster from scene
            setTimeout(() => this.endBattle(true), 1000);
        }
    }
    
    useCatchItem(itemId) {
        if (this.playerTeam.length >= 6) {
            this.uiManager.addBattleLog('La tua squadra è piena! Non puoi catturare altri mostri.');
            return;
        }
        
        if (!this.inventory.useItem(itemId)) {
            this.uiManager.addBattleLog('Non hai questo oggetto!');
            return;
        }
        
        const item = ITEMS[itemId];
        const enemyMonster = this.currentBattleEnemyMonster;
        const speciesData = MONSTER_SPECIES[enemyMonster.species];
        
        // Calculate catch chance
        const hpFactor = (enemyMonster.maxHP - enemyMonster.currentHP) / enemyMonster.maxHP;
        const catchChance = speciesData.catchRate * item.catchBonus * (1 + hpFactor * 0.5);
        
        this.uiManager.addBattleLog(`Hai lanciato una ${item.name}!`);
        
        if (Math.random() < catchChance) {
            this.uiManager.addBattleLog(`Fantastico! Hai catturato ${enemyMonster.name}!`);
            
            // Add to team
            this.playerTeam.push(enemyMonster);
            
            // Remove from scene
            if (this.currentBattleMonster) {
                this.scene.remove(this.currentBattleMonster);
                const index = this.wildMonsters.indexOf(this.currentBattleMonster);
                if (index > -1) this.wildMonsters.splice(index, 1);
            }
            
            this.uiManager.updatePlayerInfo();
            setTimeout(() => this.endBattle(true), 2000);
        } else {
            this.uiManager.addBattleLog(`Oh no! ${enemyMonster.name} è scappato dalla sfera!`);
            setTimeout(() => this.enemyAttack(), 1500);
        }
    }

    runFromBattle() {
        this.uiManager.addBattleLog('Sei scappato dalla battaglia!');
        setTimeout(() => this.endBattle(false), 1500);
    }

    endBattle(won) {
        this.inBattle = false;
        this.currentBattleMonster = null;
        this.currentBattleEnemyMonster = null;
        this.currentTrainer = null;
        this.trainerTeamIndex = 0;
        
        document.getElementById('battle-ui').classList.add('hidden');
        document.getElementById('battle-screen').classList.remove('active');
        
        this.uiManager.updateAllDisplays();
    }

    async switchMap() {
        document.getElementById('loading').classList.remove('hidden');
        
        if (this.currentMap === 'village') {
            this.currentMap = 'wild';
            document.querySelector('#location-info h2').textContent = '🌲 Zona Selvaggia';
            document.querySelector('#location-info p').textContent = 'Attenzione ai mostri selvatici!';
            await this.createWildMap();
        } else {
            this.currentMap = 'village';
            document.querySelector('#location-info h2').textContent = '🏘️ Villaggio Iniziale';
            document.querySelector('#location-info p').textContent = 'Benvenuto nel mondo dei mostri!';
            await this.createVillageMap();
        }
        
        this.player.position.set(0, 0, 0);
        document.getElementById('loading').classList.add('hidden');
    }

    updateWildMonsters(deltaTime) {
        if (this.currentMap !== 'wild') return;

        this.wildMonsters.forEach(monster => {
            // Idle bobbing animation
            monster.userData.idlePhase += deltaTime * 2;
            monster.position.y = 1 + Math.sin(monster.userData.idlePhase) * 0.2;
            
            // Slow rotation
            monster.rotation.y += deltaTime * 0.5;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = Math.min(this.clock.getDelta(), 0.1);

        this.updatePlayer(deltaTime);
        this.updateWildMonsters(deltaTime);
        this.controls.update();

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
    
    saveGame() {
        const saveData = {
            team: this.playerTeam.map(m => m.toJSON()),
            inventory: this.inventory.toJSON(),
            currentMap: this.currentMap,
            npcs: {},
            timestamp: Date.now()
        };
        
        // Save NPC defeated status
        Object.keys(NPCS).forEach(npcId => {
            saveData.npcs[npcId] = NPCS[npcId].defeated;
        });
        
        localStorage.setItem('monsterquest_save', JSON.stringify(saveData));
        console.log('Game saved!');
    }
    
    loadGame() {
        const savedData = localStorage.getItem('monsterquest_save');
        if (!savedData) {
            return false;
        }
        
        const data = JSON.parse(savedData);
        
        // Restore team
        this.playerTeam = data.team.map(m => Monster.fromJSON(m));
        
        // Restore inventory
        this.inventory = PlayerInventory.fromJSON(data.inventory);
        
        // Restore NPC status
        Object.keys(data.npcs).forEach(npcId => {
            if (NPCS[npcId]) {
                NPCS[npcId].defeated = data.npcs[npcId];
            }
        });
        
        // Update UI
        this.uiManager.updateAllDisplays();
        
        console.log('Game loaded!');
        return true;
    }
}

// Initialize game
const rpgGame = new RPGGame();
window.rpgGame = rpgGame;
