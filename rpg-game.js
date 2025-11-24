// @ts-nocheck
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Monster, PlayerInventory, MONSTER_SPECIES, ITEMS, NPCS, MOVES } from './game-data.js';
import { UIManager } from './ui-manager.js';

// Make MOVES globally accessible for UI in browser context
if (typeof window !== 'undefined') {
    window.MOVES = MOVES;
}

export class RPGGame {
    constructor(autoStart = true) {
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
        this.bestiary = new Set(); // Track discovered monsters
        
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
        this.mapGroup = null;
        this.mapBounds = { minX: -45, maxX: 45, minZ: -45, maxZ: 45 };
        this.getGroundHeight = () => 0;
        this.playerBaseHeight = 0.6;
        this.wildNoiseSeed = Math.random() * 1000;
        this.autoStart = autoStart;
        
        // Auto-start game
        if (autoStart) {
            this.init(false).catch(error => {
                console.error('Failed to initialize game:', error);
                if (typeof document !== 'undefined') {
                    const loadingEl = document.getElementById('loading');
                    if (loadingEl) {
                        loadingEl.innerHTML = '<p>Errore nel caricamento del gioco. Ricarica la pagina.</p>';
                    }
                }
            });
        }
    }

    async init(loadSave = false) {
        this.setupScene();
        this.setupLights();
        this.setupControls();
        this.setupKeyboard();
        
        // Initialize UI Manager
        this.uiManager = new UIManager(this);
        window.uiManager = this.uiManager; // Make accessible globally for onclick handlers
        window.rpgGame = this; // Make game accessible globally
        
        // Load saved game or start new game
        if (loadSave) {
            const loaded = this.loadGame();
            if (!loaded) {
                // If load failed, start new game and notify user
                console.warn('⚠️ Failed to load saved game. Starting new game...');
                this.addStarterMonster();
            }
        } else {
            // New game - clear any existing save
            localStorage.removeItem('swissmon_save');
            // Add GnuGnu as starter monster
            this.addStarterMonster();
        }
        
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

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        window.addEventListener('resize', () => this.onWindowResize());

        this.mapGroup = new THREE.Group();
        this.scene.add(this.mapGroup);
    }

    setupLights() {
        // Ambient light - slightly warmer
        const ambientLight = new THREE.AmbientLight(0xfff8e1, 0.5);
        this.scene.add(ambientLight);

        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(50, 60, 25);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -60;
        directionalLight.shadow.camera.right = 60;
        directionalLight.shadow.camera.top = 60;
        directionalLight.shadow.camera.bottom = -60;
        directionalLight.shadow.bias = -0.0001;
        this.scene.add(directionalLight);
        
        // Hemisphere light for better outdoor lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.3);
        this.scene.add(hemisphereLight);
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
            this.player.scale.set(3, 3, 3);
            const boundingBox = new THREE.Box3().setFromObject(this.player);
            let baseHeight = -boundingBox.min.y;
            if (!Number.isFinite(baseHeight) || Math.abs(baseHeight) < 0.001) {
                baseHeight = this.playerBaseHeight;
            }
            this.playerBaseHeight = baseHeight;
            this.player.userData.baseHeight = baseHeight;
            this.player.userData.walkCycle = 0;
            this.player.position.set(0, baseHeight, 0);
            
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

    clearCurrentMap() {
        if (!this.mapGroup) return;

        const objects = [...this.mapGroup.children];
        objects.forEach(obj => {
            this.mapGroup.remove(obj);
        });

        this.buildings = {};
        this.wildMonsters = [];
        this.npcs = {};
        this.getGroundHeight = () => 0;
    }

    addToCurrentMap(object3d) {
        if (!object3d) return object3d;
        this.mapGroup.add(object3d);
        return object3d;
    }

    setGroundHeightFunction(fn) {
        this.getGroundHeight = typeof fn === 'function' ? fn : () => 0;
    }

    placeEntityOnGround(entity, x, z, extraHeight = 0) {
        if (!entity) return;
        const baseHeight = entity.userData?.baseHeight ?? this.playerBaseHeight;
        const groundHeight = this.getGroundHeight ? this.getGroundHeight(x, z) : 0;
        entity.position.set(x, groundHeight + baseHeight + extraHeight, z);
    }

    async createVillageMap() {
        this.clearCurrentMap();

        const villageHeightFn = (x, z) => {
            return Math.sin(x * 0.1) * 0.3 + Math.cos(z * 0.1) * 0.3;
        };
        this.setGroundHeightFunction(villageHeightFn);
        this.mapBounds = { minX: -48, maxX: 48, minZ: -48, maxZ: 48 };

        // Ground with detailed grass texture
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        const vertices = groundGeometry.attributes.position.array;
        
        // Add subtle terrain variation
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 1];
            vertices[i + 2] = villageHeightFn(x, z);
        }
        groundGeometry.attributes.position.needsUpdate = true;
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a8c4a,
            roughness: 0.85,
            metalness: 0.1
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.addToCurrentMap(ground);

        // Create paths with better appearance
        this.createPath(0, 0, 6, 50, 0xa89968); // Main path vertical (wider)
        this.createPath(0, 0, 50, 6, 0xa89968); // Main path horizontal (wider)

        // Load buildings with better scale
        await this.loadBuilding('pokecenter', 'Pokémon_Center.glb', -15, 0.1, -15, 5);
        await this.loadBuilding('market', 'Nigrolino_market.glb', 15, 0.1, -15, 5);
        
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
        this.clearCurrentMap();

        const chunkSize = 120;
        const gridX = 3;
        const gridZ = 5;
        const startX = -Math.floor(gridX / 2);
        const startZ = -Math.floor(gridZ / 2);

        const heightFn = (x, z) => {
            const seed = this.wildNoiseSeed;
            const base = Math.sin((x + seed) * 0.015) * 3 + Math.cos((z - seed) * 0.015) * 2.4;
            const ridges = Math.sin((x + z + seed * 0.5) * 0.01) * 2.6;
            const detail = Math.sin((x - z - seed) * 0.045) * 1.3;
            return (base + ridges + detail) * 0.6;
        };

        this.setGroundHeightFunction(heightFn);

        const terrainMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a8c3a,
            roughness: 0.94,
            metalness: 0.05
        });

        const maxHalfWidth = (gridX * chunkSize) / 2;
        const maxHalfDepth = (gridZ * chunkSize) / 2;

        for (let gx = 0; gx < gridX; gx++) {
            for (let gz = 0; gz < gridZ; gz++) {
                const geometry = new THREE.PlaneGeometry(chunkSize, chunkSize, 48, 48);
                const vertices = geometry.attributes.position.array;
                const offsetX = (startX + gx) * chunkSize;
                const offsetZ = (startZ + gz) * chunkSize;

                for (let i = 0; i < vertices.length; i += 3) {
                    const localX = vertices[i];
                    const localZ = vertices[i + 1];
                    const worldX = localX + offsetX;
                    const worldZ = localZ + offsetZ;
                    vertices[i + 2] = heightFn(worldX, worldZ);
                }

                geometry.attributes.position.needsUpdate = true;
                geometry.computeVertexNormals();

                const terrainChunk = new THREE.Mesh(geometry, terrainMaterial);
                terrainChunk.rotation.x = -Math.PI / 2;
                terrainChunk.receiveShadow = true;
                terrainChunk.position.set(offsetX, 0, offsetZ);
                this.addToCurrentMap(terrainChunk);
            }
        }

        this.createWildBackdrop(Math.max(maxHalfWidth, maxHalfDepth) + 120);

        const padding = 35;
        this.mapBounds = {
            minX: -maxHalfWidth + padding,
            maxX: maxHalfWidth - padding,
            minZ: -maxHalfDepth + padding,
            maxZ: maxHalfDepth - padding
        };

        // Spawn wild monsters
        await this.spawnWildMonsters();
        
        // Add NPC Trainer in wild area
        this.createNPCTrainer('trainer3', 0, 0, -(chunkSize * (gridZ / 2 - 0.5)), 0x00ff00);
        
        // Add nature elements across the expanded map
        const scatterXRange = [this.mapBounds.minX + 10, this.mapBounds.maxX - 10];
        const scatterZRange = [this.mapBounds.minZ + 10, this.mapBounds.maxZ - 10];
        this.createTrees({ count: 70, xRange: scatterXRange, zRange: scatterZRange, clearRadius: 20 });
        this.createRocks({ count: 45, xRange: scatterXRange, zRange: scatterZRange });
        this.createBushes({ count: 60, xRange: scatterXRange, zRange: scatterZRange });

        console.log('✓ Zona selvaggia creata');
    }

    async spawnWildMonsters() {
        const monsterConfigs = [
            { file: 'Blue_Puffball_3D.glb', scale: 1.9, speed: 0.8 },
            { file: 'Gnugnu_3D.glb', scale: 2.4, speed: 1.1 },
            { file: 'Lotus_3D.glb', scale: 2.1, speed: 0.7 },
            { file: 'Blossom_3D.glb', scale: 2.1, speed: 0.9 },
            { file: 'LavaFlare.glb', scale: 1.6, speed: 1.3 },
            { file: 'Pyrolynx.glb', scale: 1.8, speed: 1.4 }
        ];

        const spawnArea = {
            minX: this.mapBounds.minX + 15,
            maxX: this.mapBounds.maxX - 15,
            minZ: this.mapBounds.minZ + 15,
            maxZ: this.mapBounds.maxZ - 15
        };

        const usedPositions = [];
        const minDistance = 35;

        const pickSpawnPoint = () => {
            for (let attempts = 0; attempts < 25; attempts++) {
                const x = THREE.MathUtils.randFloat(spawnArea.minX, spawnArea.maxX);
                const z = THREE.MathUtils.randFloat(spawnArea.minZ, spawnArea.maxZ);
                const isFarEnough = usedPositions.every(pos => {
                    const dx = pos.x - x;
                    const dz = pos.z - z;
                    return Math.sqrt(dx * dx + dz * dz) > minDistance;
                });
                if (isFarEnough) {
                    return { x, z };
                }
            }
            // Fallback if too crowded
            return {
                x: THREE.MathUtils.randFloat(spawnArea.minX, spawnArea.maxX),
                z: THREE.MathUtils.randFloat(spawnArea.minZ, spawnArea.maxZ)
            };
        };

        for (const config of monsterConfigs) {
            try {
                const gltf = await this.loadGLTF(`modelli_3D/${config.file}`);
                const monster = gltf.scene;
                monster.scale.setScalar(config.scale);

                monster.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                const boundingBox = new THREE.Box3().setFromObject(monster);
                let baseHeight = -boundingBox.min.y;
                if (!Number.isFinite(baseHeight) || baseHeight < 0.05) {
                    baseHeight = 0.6;
                }
                monster.userData.baseHeight = baseHeight;

                const spawnPoint = pickSpawnPoint();
                usedPositions.push(spawnPoint);
                this.placeEntityOnGround(monster, spawnPoint.x, spawnPoint.z);

                monster.userData.type = 'wild-monster';
                monster.userData.name = config.file.replace('_3D.glb', '').replace('.glb', '');
                monster.userData.idlePhase = Math.random() * Math.PI * 2;
                monster.userData.wanderDirection = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
                monster.userData.wanderSpeed = config.speed;
                monster.userData.changeTimer = THREE.MathUtils.randFloat(4, 8);

                this.addToCurrentMap(monster);
                this.wildMonsters.push(monster);
            } catch (error) {
                console.error(`Errore caricamento mostro ${config.file}:`, error);
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
            
            this.addToCurrentMap(building);
            this.buildings[id] = building;
            console.log(`✓ ${id} caricato`);
        } catch (error) {
            console.error(`Errore caricamento ${filename}:`, error);
        }
    }

    createHouse(x, y, z, color) {
        const houseGroup = new THREE.Group();
        
        // Walls - larger and more detailed
        const wallGeometry = new THREE.BoxGeometry(12, 10, 12);
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.8,
            metalness: 0.2
        });
        const walls = new THREE.Mesh(wallGeometry, wallMaterial);
        walls.castShadow = true;
        walls.receiveShadow = true;
        houseGroup.add(walls);

        // Roof - more detailed pyramid
        const roofGeometry = new THREE.ConeGeometry(9, 5, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            roughness: 0.9
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 7.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        houseGroup.add(roof);

        // Door
        const doorGeometry = new THREE.BoxGeometry(3, 5, 0.3);
        const doorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x654321,
            roughness: 0.9
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, -2.5, 6.15);
        houseGroup.add(door);
        
        // Windows
        const windowGeometry = new THREE.BoxGeometry(2, 2, 0.2);
        const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x87ceeb,
            roughness: 0.1,
            metalness: 0.5
        });
        
        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(-3, 1, 6.1);
        houseGroup.add(window1);
        
        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(3, 1, 6.1);
        houseGroup.add(window2);

        houseGroup.position.set(x, y + 5.1, z);
        houseGroup.userData.type = 'building';
        houseGroup.userData.id = 'house';
        houseGroup.userData.interactable = true;
        
        this.addToCurrentMap(houseGroup);
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
        this.addToCurrentMap(path);
    }

    createNPCTrainer(npcId, x, y, z, color) {
        const npcGroup = new THREE.Group();
        
        // Body - proportions similar to player
        const bodyGeometry = new THREE.CylinderGeometry(1.2, 1.2, 4.5, 12);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        npcGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(1, 20, 20);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffdbac,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.3;
        head.castShadow = true;
        npcGroup.add(head);
        
        // Exclamation mark (indicator) - larger and more visible
        const markGeometry = new THREE.BoxGeometry(0.4, 1.5, 0.15);
        const markMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        const mark = new THREE.Mesh(markGeometry, markMaterial);
        mark.position.y = 5.5;
        npcGroup.add(mark);
        
        const groundHeight = this.getGroundHeight ? this.getGroundHeight(x, z) : 0;
        npcGroup.position.set(x, groundHeight + 2.3 + y, z);
        npcGroup.userData.type = 'npc-trainer';
        npcGroup.userData.id = npcId;
        npcGroup.userData.interactable = true;
        npcGroup.userData.npcData = NPCS[npcId];
        
        this.addToCurrentMap(npcGroup);
        this.npcs[npcId] = npcGroup;
        
        console.log(`✓ NPC ${npcId} creato`);
    }

    createTrees(config = {}) {
        let options = {};
        if (typeof config === 'boolean') {
            options = config
                ? { count: 40, minRadius: 45, maxRadius: 220, clearRadius: 20 }
                : { count: 18, minRadius: 25, maxRadius: 70, clearRadius: 12 };
        } else {
            options = config;
        }

        const {
            count = 18,
            minRadius = 25,
            maxRadius = 70,
            clearRadius = 12,
            xRange = null,
            zRange = null
        } = options;

        for (let i = 0; i < count; i++) {
            let x;
            let z;

            if (Array.isArray(xRange) && Array.isArray(zRange)) {
                x = THREE.MathUtils.randFloat(xRange[0], xRange[1]);
                z = THREE.MathUtils.randFloat(zRange[0], zRange[1]);
                if (Math.sqrt(x * x + z * z) < clearRadius) {
                    i--;
                    continue;
                }
            } else {
                const angle = Math.random() * Math.PI * 2;
                const radius = THREE.MathUtils.randFloat(minRadius, maxRadius);
                x = Math.cos(angle) * radius;
                z = Math.sin(angle) * radius;

                if (Math.sqrt(x * x + z * z) < clearRadius) {
                    i--;
                    continue;
                }
            }
            const treeGroup = new THREE.Group();

            // Trunk - more realistic proportions
            const trunkGeometry = new THREE.CylinderGeometry(0.8, 1, 6, 12);
            const trunkMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x4a3520,
                roughness: 0.95
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 3;
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            treeGroup.add(trunk);

            // Multi-layer foliage for more realistic tree
            const foliageColor = maxRadius > 100 ? 0x2d5016 : 0x3a7f2d;
            
            // Bottom layer
            const foliage1 = new THREE.Mesh(
                new THREE.ConeGeometry(4, 5, 12),
                new THREE.MeshStandardMaterial({ 
                    color: foliageColor,
                    roughness: 0.9
                })
            );
            foliage1.position.y = 7;
            foliage1.castShadow = true;
            treeGroup.add(foliage1);
            
            // Middle layer
            const foliage2 = new THREE.Mesh(
                new THREE.ConeGeometry(3.5, 4, 12),
                new THREE.MeshStandardMaterial({ 
                    color: foliageColor,
                    roughness: 0.9
                })
            );
            foliage2.position.y = 10;
            foliage2.castShadow = true;
            treeGroup.add(foliage2);
            
            // Top layer
            const foliage3 = new THREE.Mesh(
                new THREE.ConeGeometry(2.5, 3, 12),
                new THREE.MeshStandardMaterial({ 
                    color: foliageColor,
                    roughness: 0.9
                })
            );
            foliage3.position.y = 12.5;
            foliage3.castShadow = true;
            treeGroup.add(foliage3);
            
            const groundHeight = this.getGroundHeight ? this.getGroundHeight(x, z) : 0;
            treeGroup.position.set(x, groundHeight + 0.1, z);
            this.addToCurrentMap(treeGroup);
        }
    }

    createFences() {
        const fencePositions = [
            { x: -25, z: 0, rotation: 0, length: 20 },
            { x: 25, z: 0, rotation: 0, length: 20 },
        ];

        fencePositions.forEach(pos => {
            for (let i = 0; i < pos.length; i += 2) {
                const postGeometry = new THREE.BoxGeometry(0.5, 3, 0.5);
                const postMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x8b4513,
                    roughness: 0.9
                });
                const post = new THREE.Mesh(postGeometry, postMaterial);
                post.position.set(pos.x, 1.6, pos.z + i - pos.length / 2);
                post.castShadow = true;
                post.receiveShadow = true;
                this.addToCurrentMap(post);
                
                // Horizontal rail
                if (i < pos.length - 2) {
                    const railGeometry = new THREE.BoxGeometry(0.3, 0.3, 2);
                    const rail = new THREE.Mesh(railGeometry, postMaterial);
                    rail.position.set(pos.x, 2, pos.z + i - pos.length / 2 + 1);
                    rail.castShadow = true;
                    this.addToCurrentMap(rail);
                }
            }
        });
    }

    createRocks(config = {}) {
        const options = typeof config === 'number'
            ? { count: config }
            : config;

        const {
            count = 20,
            minRadius = 25,
            maxRadius = 80,
            xRange = null,
            zRange = null
        } = options;

        for (let i = 0; i < count; i++) {
            const size = Math.random() * 2.5 + 1;
            const geometry = new THREE.DodecahedronGeometry(size, 1);
            const grayVariation = Math.floor(Math.random() * 30) + 100;
            const color = (grayVariation << 16) | (grayVariation << 8) | grayVariation;
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.95,
                metalness: 0.1
            });
            const rock = new THREE.Mesh(geometry, material);
            
            let x;
            let z;

            if (Array.isArray(xRange) && Array.isArray(zRange)) {
                x = THREE.MathUtils.randFloat(xRange[0], xRange[1]);
                z = THREE.MathUtils.randFloat(zRange[0], zRange[1]);
            } else {
                const angle = Math.random() * Math.PI * 2;
                const radius = THREE.MathUtils.randFloat(minRadius, maxRadius);
                x = Math.cos(angle) * radius;
                z = Math.sin(angle) * radius;
            }
            const groundHeight = this.getGroundHeight ? this.getGroundHeight(x, z) : 0;
            rock.position.set(
                x,
                groundHeight + size / 2,
                z
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            this.addToCurrentMap(rock);
        }
    }

    createBushes(config = {}) {
        const options = typeof config === 'number'
            ? { count: config }
            : config;

        const {
            count = 15,
            minRadius = 20,
            maxRadius = 80,
            xRange = null,
            zRange = null
        } = options;

        for (let i = 0; i < count; i++) {
            const bushGroup = new THREE.Group();
            
            // Multi-sphere bushes for more natural look
            for (let j = 0; j < 3; j++) {
                const size = Math.random() * 0.8 + 1.2;
                const geometry = new THREE.SphereGeometry(size, 12, 12);
                const greenVariation = Math.random() * 0x20 + 0x2d5016;
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0x2d5016,
                    roughness: 0.9
                });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(
                    (Math.random() - 0.5) * 1.5,
                    Math.random() * 0.5,
                    (Math.random() - 0.5) * 1.5
                );
                sphere.scale.set(1, 0.8, 1);
                sphere.castShadow = true;
                bushGroup.add(sphere);
            }
            
            let x;
            let z;

            if (Array.isArray(xRange) && Array.isArray(zRange)) {
                x = THREE.MathUtils.randFloat(xRange[0], xRange[1]);
                z = THREE.MathUtils.randFloat(zRange[0], zRange[1]);
            } else {
                const angle = Math.random() * Math.PI * 2;
                const radius = THREE.MathUtils.randFloat(minRadius, maxRadius);
                x = Math.cos(angle) * radius;
                z = Math.sin(angle) * radius;
            }
            const groundHeight = this.getGroundHeight ? this.getGroundHeight(x, z) : 0;
            bushGroup.position.set(
                x,
                groundHeight + 0.6,
                z
            );
            this.addToCurrentMap(bushGroup);
        }
    }

    createWildBackdrop(radius) {
        const floorRadius = radius * 1.5;

        const outerGround = new THREE.Mesh(
            new THREE.CircleGeometry(floorRadius, 64),
            new THREE.MeshStandardMaterial({
                color: 0x2d4f23,
                roughness: 1,
                side: THREE.DoubleSide
            })
        );
        outerGround.rotation.x = -Math.PI / 2;
        outerGround.position.y = -4;
        this.addToCurrentMap(outerGround);

        const cliffWall = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 1.45, radius * 1.6, 70, 48, 1, true),
            new THREE.MeshStandardMaterial({
                color: 0x354724,
                roughness: 1,
                side: THREE.BackSide
            })
        );
        cliffWall.position.y = 31;
        cliffWall.rotation.y = Math.random() * Math.PI;
        cliffWall.receiveShadow = false;
        this.addToCurrentMap(cliffWall);

        const mountainRidge = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 1.2, radius * 1.45, 40, 48, 1, false),
            new THREE.MeshStandardMaterial({
                color: 0x506131,
                roughness: 0.95
            })
        );
        mountainRidge.position.y = 66;
        mountainRidge.receiveShadow = false;
        this.addToCurrentMap(mountainRidge);
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

            // Simple walking animation tied to delta time
            const walkCycle = (this.player.userData.walkCycle ?? 0) + deltaTime * 8;
            this.player.userData.walkCycle = walkCycle;
            const bobAmount = Math.sin(walkCycle) * 0.15;
            const baseHeight = this.player.userData.baseHeight ?? this.playerBaseHeight;
            const groundHeight = this.getGroundHeight ? this.getGroundHeight(this.player.position.x, this.player.position.z) : 0;
            this.player.position.y = groundHeight + baseHeight + bobAmount;
        } else {
            this.player.userData.walkCycle = (this.player.userData.walkCycle ?? 0) * 0.92;
        }

        // Keep player in bounds
        this.player.position.x = THREE.MathUtils.clamp(this.player.position.x, this.mapBounds.minX, this.mapBounds.maxX);
        this.player.position.z = THREE.MathUtils.clamp(this.player.position.z, this.mapBounds.minZ, this.mapBounds.maxZ);

        if (moved) {
            const baseHeight = this.player.userData.baseHeight ?? this.playerBaseHeight;
            const groundHeight = this.getGroundHeight ? this.getGroundHeight(this.player.position.x, this.player.position.z) : 0;
            const bobAmount = Math.sin(this.player.userData.walkCycle ?? 0) * 0.15;
            this.player.position.y = groundHeight + baseHeight + bobAmount;
        } else {
            const baseHeight = this.player.userData.baseHeight ?? this.playerBaseHeight;
            const groundHeight = this.getGroundHeight ? this.getGroundHeight(this.player.position.x, this.player.position.z) : 0;
            this.player.position.y = THREE.MathUtils.lerp(this.player.position.y, groundHeight + baseHeight, 0.15);
        }

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
        const level = 2 + Math.floor(Math.random() * 6); // Random level 2-7
        this.currentBattleEnemyMonster = new Monster(speciesKey, level);
        
        // Add to bestiary after first encounter
        this.addToBestiary(speciesKey);
        
        // Show battle UI
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
        
        // Enhanced capture algorithm
        // Base catch rate from species (0.0 to 1.0)
        let catchRate = speciesData.catchRate;
        
        // HP Factor: Lower HP increases catch rate significantly
        // Full HP = 1.0x, Half HP = 1.5x, Low HP (< 25%) = 2.0x
        const hpPercent = enemyMonster.currentHP / enemyMonster.maxHP;
        let hpModifier = 1.0;
        if (hpPercent <= 0.25) {
            hpModifier = 2.0; // Very low HP: 2x easier
        } else if (hpPercent <= 0.5) {
            hpModifier = 1.5; // Half HP: 1.5x easier
        } else {
            hpModifier = 1.0 + (1.0 - hpPercent) * 0.5; // Gradual increase as HP drops
        }
        
        // Level Factor: Higher level = slightly harder to catch
        // Level 5 = 1.0x, Level 10 = 0.95x, Level 20 = 0.85x, Level 50 = 0.65x
        const levelModifier = Math.max(0.5, 1.0 - (enemyMonster.level - 5) * 0.01);
        
        // Status Condition Bonuses
        let statusBonus = 0;
        if (enemyMonster.status === 'paralyzed') {
            statusBonus = 0.15; // +15% for paralyzed
        } else if (enemyMonster.status === 'asleep') {
            statusBonus = 0.20; // +20% for asleep
        } else if (enemyMonster.status === 'frozen') {
            statusBonus = 0.20; // +20% for frozen
        } else if (enemyMonster.status === 'poisoned' || enemyMonster.status === 'burned') {
            statusBonus = 0.10; // +10% for poisoned/burned
        }
        
        // Poké Ball multiplier (pokeball: 1.0x, greatball: 1.5x, ultraball: 2.0x)
        const ballModifier = item.catchBonus;
        
        // Final catch rate calculation
        // Formula: baseRate * hpMod * levelMod * ballMod + statusBonus
        const finalCatchRate = Math.min(0.99, (catchRate * hpModifier * levelModifier * ballModifier) + statusBonus);
        
        this.uiManager.addBattleLog(`Hai lanciato una ${item.name}!`);
        
        // Debug info (can be removed in production)
        console.log(`Catch attempt: Base=${catchRate.toFixed(2)}, HP=${hpModifier.toFixed(2)}, Level=${levelModifier.toFixed(2)}, Ball=${ballModifier}, Status=+${statusBonus.toFixed(2)}, Final=${(finalCatchRate * 100).toFixed(1)}%`);
        
        if (Math.random() < finalCatchRate) {
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
        
        this.uiManager.updateAllDisplays();
    }
    
    addToBestiary(speciesKey) {
        if (!this.bestiary.has(speciesKey)) {
            this.bestiary.add(speciesKey);
            // Update labels on all wild monsters of this species
            this.updateMonsterLabels();
        }
    }
    
    updateMonsterLabels() {
        this.wildMonsters.forEach(monster => {
            const speciesKey = monster.userData.name.replace(' ', '_');
            if (this.bestiary.has(speciesKey)) {
                this.createMonsterLabel(monster);
            }
        });
    }
    
    createMonsterLabel(monster) {
        // Remove old label if it exists
        if (monster.userData.label) {
            monster.remove(monster.userData.label);
        }
        
        const speciesKey = monster.userData.name.replace(' ', '_');
        const speciesData = MONSTER_SPECIES[speciesKey];
        
        if (!speciesData) return;
        
        // Create a canvas for the label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        // Draw background
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        context.font = 'bold 20px Arial';
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.fillText(speciesData.name, canvas.width / 2, 28);
        
        // Draw level (we'll update this dynamically when monster spawns)
        context.font = '16px Arial';
        context.fillStyle = '#ffd700';
        context.fillText('Lv. ???', canvas.width / 2, 50);
        
        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(4, 1, 1);
        sprite.position.set(0, 3, 0);
        
        monster.add(sprite);
        monster.userData.label = sprite;
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
        
        this.placeEntityOnGround(this.player, 0, 0);
        this.controls.target.copy(this.player.position);
        document.getElementById('loading').classList.add('hidden');
    }

    updateWildMonsters(deltaTime) {
        if (this.currentMap !== 'wild') return;

        this.wildMonsters.forEach(monster => {
            const data = monster.userData;
            data.changeTimer -= deltaTime;
            if (data.changeTimer <= 0) {
                data.wanderDirection = new THREE.Vector3(
                    Math.random() - 0.5,
                    0,
                    Math.random() - 0.5
                ).normalize();
                data.changeTimer = THREE.MathUtils.randFloat(4, 8);
            }

            const moveSpeed = (data.wanderSpeed ?? 1) * 1.8;
            monster.position.x += data.wanderDirection.x * moveSpeed * deltaTime;
            monster.position.z += data.wanderDirection.z * moveSpeed * deltaTime;

            const margin = 20;
            const bounds = this.mapBounds;

            if (monster.position.x < bounds.minX + margin || monster.position.x > bounds.maxX - margin) {
                monster.position.x = THREE.MathUtils.clamp(monster.position.x, bounds.minX + margin, bounds.maxX - margin);
                data.wanderDirection.x *= -1;
            }

            if (monster.position.z < bounds.minZ + margin || monster.position.z > bounds.maxZ - margin) {
                monster.position.z = THREE.MathUtils.clamp(monster.position.z, bounds.minZ + margin, bounds.maxZ - margin);
                data.wanderDirection.z *= -1;
            }

            const groundHeight = this.getGroundHeight ? this.getGroundHeight(monster.position.x, monster.position.z) : 0;
            data.idlePhase += deltaTime * 2;
            const bob = Math.sin(data.idlePhase) * 0.25;
            const baseHeight = data.baseHeight ?? 0.6;
            monster.position.y = groundHeight + baseHeight + bob;

            const targetRotation = Math.atan2(data.wanderDirection.x, data.wanderDirection.z);
            monster.rotation.y = THREE.MathUtils.lerp(monster.rotation.y, targetRotation, 0.08);
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
            bestiary: Array.from(this.bestiary),
            npcs: {},
            timestamp: Date.now()
        };
        
        // Save NPC defeated status
        Object.keys(NPCS).forEach(npcId => {
            saveData.npcs[npcId] = NPCS[npcId].defeated;
        });
        
        localStorage.setItem('swissmon_save', JSON.stringify(saveData));
        console.log('Game saved!');
    }
    
    loadGame() {
        const savedData = localStorage.getItem('swissmon_save');
        if (!savedData) {
            return false;
        }
        
        const data = JSON.parse(savedData);
        
        // Restore team
        this.playerTeam = data.team.map(m => Monster.fromJSON(m));
        
        // Restore inventory
        this.inventory = PlayerInventory.fromJSON(data.inventory);
        
        // Restore bestiary
        if (data.bestiary) {
            this.bestiary = new Set(data.bestiary);
            this.updateMonsterLabels();
        }
        
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

export const rpgGameInstance = typeof window !== 'undefined' ? new RPGGame() : null;
if (typeof window !== 'undefined') {
    window.rpgGame = rpgGameInstance;
}
