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
        this.colliders = [];
        this.doorTriggers = [];
        this.doorAreas = [];
        this.currentReturnContext = null;
        
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
        this.currentMap = 'village';
        this.updateLocationUI('village');
        this.placeEntityOnGround(this.player, 0, 0);
        
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
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true  // Required for screenshot capture
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
            const gltf = await this.loadGLTF('modelli_3D/NPCs/Player_1.glb');
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
        this.colliders = [];
        this.doorTriggers = [];
        this.doorAreas = [];
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
        entity.updateWorldMatrix(true, true);
    }

    registerCollider(object, padding = 0) {
        if (!object) return;
        object.updateWorldMatrix(true, true);
        const box = new THREE.Box3().setFromObject(object);
        if (!box.isEmpty()) {
            box.min.x -= padding;
            box.max.x += padding;
            box.min.z -= padding;
            box.max.z += padding;
            this.colliders.push(box);
        }
    }

    createDoorTrigger({ position, width = 3, height = 4, depth = 1.5, targetMap, spawn = { x: 0, z: 0 }, returnMap = 'village', returnSpawn = { x: 0, z: 0 }, walkwayDepth = 4, label = 'Entra' }) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshBasicMaterial({ visible: false });
        const door = new THREE.Mesh(geometry, material);
        door.position.copy(position);
        door.userData.type = 'door';
        door.userData.targetMap = targetMap;
        door.userData.spawn = spawn;
        door.userData.returnMap = returnMap;
        door.userData.returnSpawn = returnSpawn;
        door.userData.label = label;
        this.addToCurrentMap(door);
        this.doorTriggers.push(door);

        const halfWidth = width / 2;
        const doorArea = {
            minX: position.x - halfWidth,
            maxX: position.x + halfWidth,
            minZ: position.z - walkwayDepth * 0.5,
            maxZ: position.z + walkwayDepth
        };
        this.doorAreas.push(doorArea);
        return door;
    }

    createBuildingDoor(building, { targetMap, spawn, returnMap = 'village', returnSpawn, width, height, depth, offsetX = 0, forwardOffset = 1.8, walkwayDepth = 5, label }) {
        if (!building) return null;
        building.updateWorldMatrix(true, true);
        const box = new THREE.Box3().setFromObject(building);
        if (box.isEmpty()) return null;

        const centerX = (box.min.x + box.max.x) / 2 + offsetX;
        const baseY = (box.min.y + box.max.y) / 2;
        const frontZ = box.max.z + forwardOffset;

        const doorWidth = width || Math.max(3, (box.max.x - box.min.x) * 0.35);
        const doorHeight = height || 4.5;
        const doorDepth = depth || 1.5;
        const doorSpawn = spawn || { x: 0, z: -10 };
        const exteriorSpawn = returnSpawn || { x: centerX, z: frontZ + 2 };

        const doorPosition = new THREE.Vector3(centerX, baseY + doorHeight * 0.5 - 0.5, frontZ);
        return this.createDoorTrigger({
            position: doorPosition,
            width: doorWidth,
            height: doorHeight,
            depth: doorDepth,
            targetMap,
            spawn: doorSpawn,
            returnMap,
            returnSpawn: exteriorSpawn,
            walkwayDepth,
            label
        });
    }

    isCollidingWithMap() {
        if (!this.colliders.length) return false;
        const pos = this.player.position;
        const insideDoorArea = this.doorAreas.some(area => pos.x > area.minX && pos.x < area.maxX && pos.z > area.minZ && pos.z < area.maxZ);
        for (const box of this.colliders) {
            if (pos.x > box.min.x && pos.x < box.max.x && pos.z > box.min.z && pos.z < box.max.z) {
                if (insideDoorArea) {
                    return false;
                }
                return true;
            }
        }
        return false;
    }

    async createVillageMap() {
        this.clearCurrentMap();

        // Flat plain - no height variation
        const villageHeightFn = () => 0;
        this.setGroundHeightFunction(villageHeightFn);
        this.mapBounds = { minX: -48, maxX: 48, minZ: -48, maxZ: 48 };

        // Simple flat ground plane - just a plain (pianura)
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a8c4a,
            roughness: 0.85,
            metalness: 0.1
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.addToCurrentMap(ground);

        // Village is now just a flat plain - no buildings, paths, houses, NPCs, trees, or fences

        console.log('✓ Villaggio creato (pianura)');
    }

    async createPokeCenterInterior(options = {}) {
        this.clearCurrentMap();
        this.setGroundHeightFunction(() => 0);

        let modelHeight = 12; // Default height, will be updated from model
        
        // Load the 3D model for Pokemon Center interior
        try {
            const gltf = await this.loadGLTF('modelli_3D/buildings_and_interiors/poke_center_inside.glb');
            const interior = gltf.scene;
            
            // Scale the model appropriately - use larger scale for interior
            const scale = 15;
            interior.scale.set(scale, scale, scale);
            
            // Position the model
            interior.position.set(0, 0, 0);
            interior.updateWorldMatrix(true, true);
            
            // Enable shadows for all meshes
            interior.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            this.addToCurrentMap(interior);
            
            // Calculate bounds from the model
            const boundingBox = new THREE.Box3().setFromObject(interior);
            const halfWidth = (boundingBox.max.x - boundingBox.min.x) / 2;
            const halfDepth = (boundingBox.max.z - boundingBox.min.z) / 2;
            modelHeight = boundingBox.max.y - boundingBox.min.y;
            
            this.mapBounds = {
                minX: boundingBox.min.x + 1.5,
                maxX: boundingBox.max.x - 1.5,
                minZ: boundingBox.min.z + 1.5,
                maxZ: boundingBox.max.z - 1.5
            };
            
            console.log(`✓ Interno Poké Center caricato (bounds: ${halfWidth.toFixed(1)} x ${halfDepth.toFixed(1)}, height: ${modelHeight.toFixed(1)})`);
        } catch (error) {
            console.error('Errore caricamento interno Poké Center:', error);
            // Fallback to a simple floor if model fails to load
            const floor = new THREE.Mesh(
                new THREE.PlaneGeometry(42, 54),
                new THREE.MeshStandardMaterial({ color: 0xfdf6f6, roughness: 0.82, metalness: 0.08 })
            );
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            this.addToCurrentMap(floor);
            
            this.mapBounds = {
                minX: -20,
                maxX: 20,
                minZ: -25,
                maxZ: 25
            };
        }

        // Add interior lighting - position based on model height
        const receptionLight = new THREE.PointLight(0xfff2f2, 0.65, 70);
        receptionLight.position.set(0, modelHeight * 0.85, 4);
        receptionLight.castShadow = true;
        this.addToCurrentMap(receptionLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.78);
        this.addToCurrentMap(ambientLight);

        const targetMap = options.returnMap || this.currentReturnContext?.map || 'village';
        const targetSpawn = options.returnSpawn || this.currentReturnContext?.spawn || this.getDefaultSpawn(targetMap);
        const interiorSpawn = options.spawn || this.getDefaultSpawn('pokecenter');

        // Create exit door trigger at the front of the room - position based on model height
        const doorHeight = Math.min(6, modelHeight * 0.5);
        this.createDoorTrigger({
            position: new THREE.Vector3(0, doorHeight / 2, this.mapBounds.minZ + 0.6),
            width: 5.5,
            height: doorHeight,
            depth: 1.6,
            targetMap,
            spawn: targetSpawn,
            returnMap: 'pokecenter',
            returnSpawn: interiorSpawn,
            walkwayDepth: 7,
            label: 'Esci all\'esterno'
        });

        console.log('✓ Interno Poké Center creato');
    }

    async createMarketInterior(options = {}) {
        this.clearCurrentMap();
        this.setGroundHeightFunction(() => 0);

        const roomWidth = 38;
        const roomDepth = 52;
        const wallHeight = 11;
        const wallThickness = 0.8;
        const doorOpening = 7;
        const halfWidth = roomWidth / 2;
        const halfDepth = roomDepth / 2;

        this.mapBounds = {
            minX: -halfWidth + 1.5,
            maxX: halfWidth - 1.5,
            minZ: -halfDepth + 1.5,
            maxZ: halfDepth - 1.5
        };

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(roomWidth, roomDepth),
            new THREE.MeshStandardMaterial({ color: 0xf3f0d8, roughness: 0.78, metalness: 0.05 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.addToCurrentMap(floor);

        const aisleRunner = new THREE.Mesh(
            new THREE.PlaneGeometry(roomWidth - 6, 12),
            new THREE.MeshStandardMaterial({ color: 0xd3c176, roughness: 0.6 })
        );
        aisleRunner.rotation.x = -Math.PI / 2;
        aisleRunner.position.set(0, 0.04, 5);
        aisleRunner.receiveShadow = true;
        this.addToCurrentMap(aisleRunner);

        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xf7f4e6, roughness: 0.72 });
        const createWallSegmentMarket = (width, x, z) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, wallThickness), wallMaterial);
            wall.position.set(x, wallHeight / 2, z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.addToCurrentMap(wall);
            this.registerCollider(wall, 0.35);
        };

        createWallSegmentMarket(roomWidth, 0, halfDepth - wallThickness / 2);
        const sideWallGeometry = new THREE.BoxGeometry(roomDepth, wallHeight, wallThickness);
        const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-halfWidth + wallThickness / 2, wallHeight / 2, 0);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        this.addToCurrentMap(leftWall);
        this.registerCollider(leftWall, 0.35);

        const rightWall = leftWall.clone();
        rightWall.position.x = halfWidth - wallThickness / 2;
        this.addToCurrentMap(rightWall);
        this.registerCollider(rightWall, 0.35);

        const segmentWidthMarket = (roomWidth - doorOpening) / 2;
        createWallSegmentMarket(segmentWidthMarket, -doorOpening / 2 - segmentWidthMarket / 2, -halfDepth + wallThickness / 2);
        createWallSegmentMarket(segmentWidthMarket, doorOpening / 2 + segmentWidthMarket / 2, -halfDepth + wallThickness / 2);

        const counter = new THREE.Mesh(
            new THREE.BoxGeometry(roomWidth - 10, 3.5, 4.2),
            new THREE.MeshStandardMaterial({ color: 0xd97b1d, roughness: 0.55 })
        );
        counter.position.set(0, 1.75, -halfDepth + 8);
        counter.castShadow = true;
        counter.receiveShadow = true;
        this.addToCurrentMap(counter);
        this.registerCollider(counter, 0.25);

        const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0xc8c2a4, roughness: 0.65 });
        const shelfLevels = 3;
        const createShelfRow = (x, z) => {
            const shelfGroup = new THREE.Group();
            for (let level = 0; level < shelfLevels; level++) {
                const shelf = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 2.4), shelfMaterial);
                shelf.position.set(0, 0.8 + level * 1.2, 0);
                shelf.castShadow = true;
                shelf.receiveShadow = true;
                shelfGroup.add(shelf);
            }

            const supports = new THREE.Mesh(
                new THREE.BoxGeometry(10.2, shelfLevels * 1.2 + 1.2, 0.5),
                new THREE.MeshStandardMaterial({ color: 0x8f8661, roughness: 0.6 })
            );
            supports.position.y = (shelfLevels * 1.2) / 2 + 0.8;
            shelfGroup.add(supports);

            shelfGroup.position.set(x, 0, z);
            this.addToCurrentMap(shelfGroup);
            this.registerCollider(shelfGroup, 0.3);
        };

        createShelfRow(-9, 4);
        createShelfRow(0, 4);
        createShelfRow(9, 4);

        const crateMaterial = new THREE.MeshStandardMaterial({ color: 0xb77a2a, roughness: 0.7 });
        for (let i = 0; i < 4; i++) {
            const crate = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 3), crateMaterial);
            crate.position.set(-halfWidth + 4 + i * 3.5, 1.25, halfDepth - 8 - (i % 2) * 2);
            crate.castShadow = true;
            crate.receiveShadow = true;
            this.addToCurrentMap(crate);
            this.registerCollider(crate, 0.15);
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        this.addToCurrentMap(ambientLight);

        const ceilingLight = new THREE.PointLight(0xfff4d5, 0.7, 65);
        ceilingLight.position.set(0, wallHeight - 1, 6);
        ceilingLight.castShadow = true;
        this.addToCurrentMap(ceilingLight);

        const targetMap = options.returnMap || this.currentReturnContext?.map || 'village';
        const targetSpawn = options.returnSpawn || this.currentReturnContext?.spawn || this.getDefaultSpawn(targetMap);
        const interiorSpawn = options.spawn || this.getDefaultSpawn('market');

        this.createDoorTrigger({
            position: new THREE.Vector3(0, 2.8, -halfDepth + 0.6),
            width: 5,
            height: 5.5,
            depth: 1.6,
            targetMap,
            spawn: targetSpawn,
            returnMap: 'market',
            returnSpawn: interiorSpawn,
            walkwayDepth: 6.5,
            label: 'Esci all\'esterno'
        });

        console.log('✓ Interno Market creato');
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
            metalness: 0.05,
            flatShading: false  // Ensure smooth shading
        });

        const maxHalfWidth = (gridX * chunkSize) / 2;
        const maxHalfDepth = (gridZ * chunkSize) / 2;

        // Create a single large terrain mesh to avoid seams
        const totalWidth = gridX * chunkSize;
        const totalDepth = gridZ * chunkSize;
        const segmentsX = gridX * 48;
        const segmentsZ = gridZ * 48;
        
        const geometry = new THREE.PlaneGeometry(totalWidth, totalDepth, segmentsX, segmentsZ);
        const vertices = geometry.attributes.position.array;

        for (let i = 0; i < vertices.length; i += 3) {
            const localX = vertices[i];
            // After rotation.x = -PI/2, local Y becomes world -Z
            // So we use -localY to get the world Z coordinate for consistent height calculation
            const worldZ = -vertices[i + 1];
            vertices[i + 2] = heightFn(localX, worldZ);
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        const terrain = new THREE.Mesh(geometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        terrain.position.set(0, 0, 0);
        this.addToCurrentMap(terrain);

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
        await this.createTrees({ count: 70, xRange: scatterXRange, zRange: scatterZRange, clearRadius: 20 });
        this.createRocks({ count: 45, xRange: scatterXRange, zRange: scatterZRange });
        this.createBushes({ count: 60, xRange: scatterXRange, zRange: scatterZRange });

        console.log('✓ Zona selvaggia creata');
    }

    async spawnWildMonsters() {
        // Monster scales adjusted to be proportional to player (scale ~3)
        // Range: 1.5 - 1.6 (smaller than before to fix oversized monsters)
        const monsterConfigs = [
            { file: 'monsters/Blue_Puffball_3D.glb', scale: 1.5, speed: 0.8 },
            { file: 'monsters/Gnugnu_3D.glb', scale: 1.6, speed: 1.1 },
            { file: 'monsters/Lotus_3D.glb', scale: 1.5, speed: 0.7 },
            { file: 'monsters/Blossom_3D.glb', scale: 1.5, speed: 0.9 },
            { file: 'monsters/LavaFlare.glb', scale: 1.5, speed: 1.3 },
            { file: 'monsters/Pyrolynx.glb', scale: 1.5, speed: 1.4 }
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
            
            // Position at origin first to calculate bounding box correctly.
            // This is necessary because bounding box calculation can be affected
            // by world transforms when the model is already positioned elsewhere.
            building.position.set(0, 0, 0);
            building.updateWorldMatrix(true, true);
            
            building.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            building.userData.type = 'building';
            building.userData.id = id;
            building.userData.interactable = true;
            
            // Calculate bounding box to find the bottom of the model
            const boundingBox = new THREE.Box3().setFromObject(building);
            // The offset needed to place the building's bottom at y=0
            // boundingBox.min.y is the lowest point of the model
            const yOffset = -boundingBox.min.y;
            
            // Store a baseHeight of 0 since we're manually calculating the offset
            building.userData.baseHeight = 0;
            
            // Get ground height at target position
            const groundHeight = this.getGroundHeight ? this.getGroundHeight(x, z) : 0;
            
            // Position building so its bottom sits on the ground
            // Add the extraHeight (y parameter) on top
            building.position.set(x, groundHeight + yOffset + y, z);
            building.updateWorldMatrix(true, true);
            
            this.addToCurrentMap(building);
            this.registerCollider(building, 0.6);
            this.buildings[id] = building;
            console.log(`✓ ${id} caricato (yOffset: ${yOffset.toFixed(2)})`);
            return building;
        } catch (error) {
            console.error(`Errore caricamento ${filename}:`, error);
        }
    }

    createHouse(x, y, z, color) {
        const houseGroup = new THREE.Group();
        
        // Walls - larger and more detailed
        // Height 10, positioned so bottom is at y=0 in local space
        const wallGeometry = new THREE.BoxGeometry(12, 10, 12);
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.8,
            metalness: 0.2
        });
        const walls = new THREE.Mesh(wallGeometry, wallMaterial);
        walls.position.y = 5; // Move walls up so bottom is at y=0
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
        // Walls: height 10, center at y=5, so bottom at y=0 and top at y=10
        // Roof (cone): height 5, center sits on top of walls, so position at y=10 + 5/2 = 12.5
        roof.position.y = 12.5;
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
        door.position.set(0, 2.5, 6.15); // Door bottom at y=0, center at y=2.5
        houseGroup.add(door);
        
        // Windows
        const windowGeometry = new THREE.BoxGeometry(2, 2, 0.2);
        const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x87ceeb,
            roughness: 0.1,
            metalness: 0.5
        });
        
        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(-3, 6, 6.1); // Windows at reasonable height
        houseGroup.add(window1);
        
        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(3, 6, 6.1);
        houseGroup.add(window2);

        // Get ground height at target position
        const groundHeight = this.getGroundHeight ? this.getGroundHeight(x, z) : 0;
        
        // Position house so its bottom sits on the ground
        houseGroup.position.set(x, groundHeight + y, z);
        houseGroup.userData.baseHeight = 0;
        houseGroup.userData.type = 'building';
        houseGroup.userData.id = 'house';
        houseGroup.userData.interactable = true;
        
        this.addToCurrentMap(houseGroup);
        this.registerCollider(houseGroup, 0.4);
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

    async createTrees(config = {}) {
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

        // Load the pine tree model once
        let treeModel = null;
        try {
            const gltf = await this.loadGLTF('modelli_3D/environment/stylized_pine_tree_tree.glb');
            treeModel = gltf.scene;
            
            // Calculate the bounding box to properly position the tree on the ground
            treeModel.updateMatrixWorld(true);
            const boundingBox = new THREE.Box3().setFromObject(treeModel);
            const modelHeight = boundingBox.max.y - boundingBox.min.y;
            const modelBottomY = boundingBox.min.y;
            
            // Store metadata for proper ground placement
            treeModel.userData.modelBottomY = modelBottomY;
            treeModel.userData.modelHeight = modelHeight;
            
            // Calculate appropriate base scale based on model size
            // Target tree height should be around 12-15 units (similar to procedural trees)
            const targetHeight = 12;
            const autoScale = modelHeight > 0.1 ? targetHeight / modelHeight : 1;
            treeModel.userData.autoScale = autoScale;
            
            // Pre-calculate base ground offset (will be multiplied by final scale later)
            treeModel.userData.baseGroundOffset = -modelBottomY;
            
            console.log(`✓ Pine tree model loaded (original height: ${modelHeight.toFixed(2)}, autoScale: ${autoScale.toFixed(3)})`);
        } catch (error) {
            console.warn('Could not load pine tree model, using procedural trees:', error.message || error);
        }

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

            let tree;
            if (treeModel) {
                // Clone the loaded pine tree model
                tree = treeModel.clone();
                
                // Enable shadows for all meshes
                tree.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // Use auto-calculated scale based on model size, with random variation
                const autoScale = treeModel.userData.autoScale || 1;
                const randomScale = THREE.MathUtils.randFloat(0.85, 1.35);
                const finalScale = autoScale * randomScale;
                tree.scale.set(finalScale, finalScale, finalScale);
                
                // Use pre-calculated base ground offset, scaled by finalScale
                const baseGroundOffset = treeModel.userData.baseGroundOffset || 0;
                tree.userData.groundOffset = baseGroundOffset * finalScale;
            } else {
                // Fallback to procedural trees if model fails to load
                tree = new THREE.Group();

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
                tree.add(trunk);

                // Multi-layer foliage for more realistic tree
                const foliageColor = maxRadius > 100 ? 0x3b6b2a : 0x3a7f2d;
                
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
                tree.add(foliage1);
                
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
                tree.add(foliage2);
                
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
                tree.add(foliage3);
                
                const randomScale = THREE.MathUtils.randFloat(0.85, 1.35);
                tree.scale.set(randomScale, randomScale, randomScale);
            }
            
            const groundHeight = this.getGroundHeight ? this.getGroundHeight(x, z) : 0;
            tree.rotation.y = Math.random() * Math.PI * 2;
            
            // Apply ground offset for 3D models (to place at correct height)
            const groundOffset = tree.userData.groundOffset || 0;
            tree.position.set(x, groundHeight + groundOffset + 0.1, z);
            this.addToCurrentMap(tree);
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
            
            // Apply rotation first, then calculate bounding box for proper ground placement
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.updateMatrixWorld(true);
            
            // Calculate actual bottom after rotation
            const boundingBox = new THREE.Box3().setFromObject(rock);
            const rockBottom = -boundingBox.min.y;
            
            rock.position.set(
                x,
                groundHeight + rockBottom,
                z
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
            // Position spheres so their bottom is at y=0 in group space
            for (let j = 0; j < 3; j++) {
                const size = Math.random() * 0.8 + 1.2;
                const geometry = new THREE.SphereGeometry(size, 12, 12);
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0x2d5016,
                    roughness: 0.9
                });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(
                    (Math.random() - 0.5) * 1.5,
                    size * 0.8 + Math.random() * 0.3, // Position so bottom touches ground
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
                groundHeight,
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
                color: 0x3b6d2e,
                roughness: 0.95,
                side: THREE.DoubleSide
            })
        );
        outerGround.rotation.x = -Math.PI / 2;
        outerGround.position.y = -4;
        this.addToCurrentMap(outerGround);

        const cliffWall = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 1.45, radius * 1.6, 70, 48, 1, true),
            new THREE.MeshStandardMaterial({
                color: 0x6f8c4b,
                roughness: 0.9,
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
                color: 0x8fa763,
                roughness: 0.85
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
        const previousPosition = this.player.position.clone();
        
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

        if (moved && this.isCollidingWithMap()) {
            this.player.position.copy(previousPosition);
        }

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

        // Check doors
        this.doorTriggers.forEach(door => {
            const distance = this.player.position.distanceTo(door.position);
            if (distance < interactionDistance) {
                this.nearestInteractable = door;
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
        } else if (this.nearestInteractable.userData.type === 'door') {
            this.enterDoor(this.nearestInteractable);
        }
    }

    enterDoor(door) {
        const targetMap = door.userData.targetMap;
        if (!targetMap) return;
        const spawn = door.userData.spawn || { x: 0, z: 0 };
        const returnMap = door.userData.returnMap || this.currentMap;
        const returnSpawn = door.userData.returnSpawn || { x: this.player.position.x, z: this.player.position.z };
        this.switchMap(targetMap, { spawn, returnMap, returnSpawn });
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

    async switchMap(destination = null, options = {}) {
        document.getElementById('loading').classList.remove('hidden');

        let targetMap = destination;
        if (!targetMap) {
            targetMap = this.currentMap === 'village' ? 'wild' : 'village';
        }

        const defaultSpawn = this.getDefaultSpawn(targetMap);
        const spawn = {
            x: options.spawn && typeof options.spawn.x === 'number' ? options.spawn.x : defaultSpawn.x,
            z: options.spawn && typeof options.spawn.z === 'number' ? options.spawn.z : defaultSpawn.z
        };

        if (options.returnMap) {
            this.currentReturnContext = {
                map: options.returnMap,
                spawn: options.returnSpawn || defaultSpawn
            };
        } else if (targetMap === 'village' || targetMap === 'wild') {
            this.currentReturnContext = null;
        }

        if (targetMap === 'wild') {
            await this.createWildMap();
        } else if (targetMap === 'village') {
            await this.createVillageMap();
        } else if (targetMap === 'pokecenter') {
            await this.createPokeCenterInterior(options);
        } else if (targetMap === 'market') {
            await this.createMarketInterior(options);
        } else {
            console.warn('Unknown map requested:', targetMap);
        }

        this.currentMap = targetMap;
        this.updateLocationUI(targetMap);

        this.placeEntityOnGround(this.player, spawn.x, spawn.z, options.spawnOffsetY || 0);
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

    getDefaultSpawn(mapName) {
        switch (mapName) {
            case 'wild':
                return { x: 0, z: -30 };
            case 'pokecenter':
                return { x: 0, z: -12 };
            case 'market':
                return { x: 0, z: -12 };
            case 'village':
            default:
                return { x: 0, z: 0 };
        }
    }

    updateLocationUI(mapName) {
        const titleEl = document.querySelector('#location-info h2');
        const textEl = document.querySelector('#location-info p');
        if (!titleEl || !textEl) return;

        if (mapName === 'wild') {
            titleEl.textContent = '🌲 Zona Selvaggia';
            textEl.textContent = 'Attenzione ai mostri selvatici!';
        } else if (mapName === 'pokecenter') {
            titleEl.textContent = '🏥 Poké Center';
            textEl.textContent = 'Cura i tuoi Swissmon e riposati!';
        } else if (mapName === 'market') {
            titleEl.textContent = '🛒 Nigrolino Market';
            textEl.textContent = 'Compra oggetti utili per la tua avventura!';
        } else {
            titleEl.textContent = '🏘️ Villaggio Iniziale';
            textEl.textContent = 'Benvenuto nel mondo dei mostri!';
        }
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
