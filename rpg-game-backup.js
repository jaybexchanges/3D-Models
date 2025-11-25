import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
        this.caughtMonsters = [];
        this.nearestInteractable = null;
        this.inBattle = false;
        this.currentBattleMonster = null;
        
        // Player movement
        this.keys = {
            w: false, a: false, s: false, d: false,
            shift: false, e: false, m: false
        };
        this.playerSpeed = 5;
        this.playerRotation = 0;
        
        this.clock = new THREE.Clock();
        this.loader = new GLTFLoader();
        
        this.init();
    }

    async init() {
        this.setupScene();
        this.setupLights();
        this.setupControls();
        this.setupKeyboard();
        
        await this.loadPlayer();
        await this.createVillageMap();
        
        this.animate();
        this.hideLoading();
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
            if (key in this.keys) {
                this.keys[key] = true;
                if (key === 'e' && !this.inBattle) this.interact();
                if (key === 'm' && !this.inBattle) this.switchMap();
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) this.keys[key] = false;
        });
    }

    async loadPlayer() {
        try {
            const gltf = await this.loadGLTF('modelli_3D/NPCs/Player_1.glb');
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
        await this.loadBuilding('pokecenter', 'buildings_and_interiors/Pokémon_Center.glb', -15, 0, -15, 3);
        await this.loadBuilding('market', 'buildings_and_interiors/Nigrolino_market.glb', 15, 0, -15, 3);
        
        // Create houses
        this.createHouse(-15, 0, 15, 0xff6b6b);
        this.createHouse(15, 0, 15, 0x6bcfff);
        this.createHouse(0, 0, -25, 0xffd700);

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
        
        // Add nature elements
        this.createTrees(true);
        this.createRocks();
        this.createBushes();

        console.log('✓ Zona selvaggia creata');
    }

    async spawnWildMonsters() {
        const monsterFiles = [
            'monsters/Blue_Puffball_3D.glb',
            'monsters/Gnugnu_3D.glb',
            'monsters/Lotus_3D.glb',
            'monsters/Blossom_3D.glb',
            'monsters/LavaFlare.glb',
            'monsters/Pyrolynx.glb'
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
                monster.userData.name = monsterFiles[i].replace('monsters/', '').replace('_3D.glb', '').replace('.glb', '');
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
    }

    interact() {
        if (!this.nearestInteractable) return;

        if (this.nearestInteractable.userData.type === 'building') {
            this.interactWithBuilding(this.nearestInteractable.userData.id);
        } else if (this.nearestInteractable.userData.type === 'wild-monster') {
            this.startBattle(this.nearestInteractable);
        }
    }

    interactWithBuilding(buildingId) {
        const prompt = document.getElementById('interaction-prompt');
        const title = document.getElementById('prompt-title');
        const text = document.getElementById('prompt-text');
        const buttons = document.getElementById('prompt-buttons');

        if (buildingId === 'pokecenter') {
            title.textContent = '🏥 Pokémon Center';
            text.textContent = 'Benvenuto! Vuoi curare i tuoi mostri?';
            buttons.innerHTML = '<button onclick="rpgGame.healMonsters()">Cura</button><button onclick="rpgGame.closePrompt()">Esci</button>';
        } else if (buildingId === 'market') {
            title.textContent = '🏪 Nigrolino Market';
            text.textContent = 'Benvenuto! Cosa desideri?';
            buttons.innerHTML = '<button onclick="rpgGame.buyItems()">Compra</button><button onclick="rpgGame.closePrompt()">Esci</button>';
        } else {
            title.textContent = '🏠 Casa';
            text.textContent = 'Sembra che non ci sia nessuno...';
            buttons.innerHTML = '<button onclick="rpgGame.closePrompt()">Esci</button>';
        }

        prompt.classList.add('show');
    }

    startBattle(monster) {
        if (this.caughtMonsters.length >= 6) {
            alert('Hai già 6 mostri! Non puoi catturarne altri.');
            return;
        }

        this.inBattle = true;
        this.currentBattleMonster = monster;
        
        document.getElementById('monster-name').textContent = monster.userData.name;
        document.getElementById('battle-screen').classList.add('active');
    }

    attemptCatch() {
        const catchChance = Math.random();
        
        if (catchChance > 0.3) { // 70% catch rate
            this.caughtMonsters.push(this.currentBattleMonster.userData.name);
            document.getElementById('caught-count').textContent = this.caughtMonsters.length;
            
            // Remove monster from scene
            this.scene.remove(this.currentBattleMonster);
            const index = this.wildMonsters.indexOf(this.currentBattleMonster);
            if (index > -1) this.wildMonsters.splice(index, 1);
            
            document.getElementById('battle-text').textContent = 
                `Fantastico! Hai catturato ${this.currentBattleMonster.userData.name}!`;
            
            setTimeout(() => this.endBattle(), 2000);
        } else {
            document.getElementById('battle-text').textContent = 
                `Oh no! ${this.currentBattleMonster.userData.name} è scappato!`;
            
            setTimeout(() => this.endBattle(), 1500);
        }
    }

    runFromBattle() {
        document.getElementById('battle-text').textContent = 'Sei scappato!';
        setTimeout(() => this.endBattle(), 1000);
    }

    endBattle() {
        this.inBattle = false;
        this.currentBattleMonster = null;
        document.getElementById('battle-screen').classList.remove('active');
        document.getElementById('battle-text').textContent = 'Un mostriciattolo è apparso!';
    }

    healMonsters() {
        alert('I tuoi mostri sono stati curati!');
        this.closePrompt();
    }

    buyItems() {
        alert('Funzionalità in sviluppo!');
        this.closePrompt();
    }

    closePrompt() {
        document.getElementById('interaction-prompt').classList.remove('show');
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
}

// Initialize game
const rpgGame = new RPGGame();
window.rpgGame = rpgGame;
