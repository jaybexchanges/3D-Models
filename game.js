import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class MonsterGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.monsters = {};
        this.animations = {};
        this.clock = new THREE.Clock();
        
        this.init();
    }

    init() {
        this.setupKeyboardControls(); // Initialize keyboard first
        this.setupScene();
        this.setupLights();
        this.createGameMap();
        this.loadMonsters();
        this.setupControls();
        this.animate();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 15, 30);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 25);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);

        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0xff00ff, 0.5, 50);
        pointLight1.position.set(-20, 5, -20);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x00ffff, 0.5, 50);
        pointLight2.position.set(20, 5, 20);
        this.scene.add(pointLight2);
    }

    createGameMap() {
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a8c3a,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Add some vertex displacement for terrain variation
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] = Math.random() * 0.5;
        }
        groundGeometry.attributes.position.needsUpdate = true;
        groundGeometry.computeVertexNormals();
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Create platforms
        this.createPlatform(-15, 0.5, -15, 8, 1, 8, 0x8b4513);
        this.createPlatform(15, 0.5, 15, 8, 1, 8, 0x8b4513);
        this.createPlatform(0, 1, 0, 12, 2, 12, 0xa0522d);

        // Create decorative elements
        this.createTrees();
        this.createRocks();
        this.createPathway();
    }

    createPlatform(x, y, z, width, height, depth, color) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.1
        });
        const platform = new THREE.Mesh(geometry, material);
        platform.position.set(x, y, z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        this.scene.add(platform);
    }

    createTrees() {
        const positions = [
            { x: -25, z: -25 },
            { x: -25, z: 25 },
            { x: 25, z: -25 },
            { x: 25, z: 25 },
            { x: -30, z: 0 },
            { x: 30, z: 0 }
        ];

        positions.forEach(pos => {
            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3520 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(pos.x, 2, pos.z);
            trunk.castShadow = true;
            this.scene.add(trunk);

            // Foliage
            const foliageGeometry = new THREE.ConeGeometry(3, 5, 8);
            const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.set(pos.x, 6, pos.z);
            foliage.castShadow = true;
            this.scene.add(foliage);
        });
    }

    createRocks() {
        for (let i = 0; i < 15; i++) {
            const size = Math.random() * 1.5 + 0.5;
            const geometry = new THREE.DodecahedronGeometry(size, 0);
            const material = new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.9,
                metalness: 0.1
            });
            const rock = new THREE.Mesh(geometry, material);
            
            const angle = (i / 15) * Math.PI * 2;
            const radius = 35 + Math.random() * 5;
            rock.position.set(
                Math.cos(angle) * radius,
                size / 2,
                Math.sin(angle) * radius
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);
        }
    }

    createPathway() {
        const pathMaterial = new THREE.MeshStandardMaterial({
            color: 0xc4a677,
            roughness: 0.8
        });

        for (let i = -40; i < 40; i += 3) {
            const stone = new THREE.Mesh(
                new THREE.CylinderGeometry(1, 1, 0.2, 6),
                pathMaterial
            );
            stone.position.set(i, 0.1, -10 + Math.sin(i * 0.2) * 2);
            stone.rotation.x = -Math.PI / 2;
            stone.receiveShadow = true;
            this.scene.add(stone);
        }
    }

    async loadMonsters() {
        const loader = new GLTFLoader();
        const monsterConfigs = [
            { name: 'blue', file: 'monsters/Blue_Puffball_3D.glb', position: { x: -15, y: 2, z: -8 }, scale: 2 },
            { name: 'gnugnu', file: 'monsters/Gnugnu_3D.glb', position: { x: -5, y: 2, z: -8 }, scale: 2 },
            { name: 'lotus', file: 'monsters/Lotus_3D.glb', position: { x: 5, y: 2, z: -8 }, scale: 2 },
            { name: 'blossom', file: 'monsters/Blossom_3D.glb', position: { x: 15, y: 2, z: -8 }, scale: 2 },
            { name: 'lavaflare', file: 'monsters/LavaFlare.glb', position: { x: -15, y: 2, z: 8 }, scale: 2 },
            { name: 'pyrolynx', file: 'monsters/Pyrolynx.glb', position: { x: -5, y: 2, z: 8 }, scale: 2 },
            { name: 'player1', file: 'NPCs/Player_1.glb', position: { x: 5, y: 2, z: 8 }, scale: 2 },
            { name: 'player2', file: 'NPCs/Player_2.glb', position: { x: 15, y: 2, z: 8 }, scale: 2 },
            { name: 'pokecenter', file: 'buildings_and_interiors/Pokémon_Center.glb', position: { x: 0, y: 2, z: 0 }, scale: 3, isBuilding: true },
            { name: 'nigrolino', file: 'buildings_and_interiors/Nigrolino_market.glb', position: { x: -20, y: 2, z: 0 }, scale: 3, isBuilding: true }
        ];

        let loadedCount = 0;
        const totalMonsters = monsterConfigs.length;

        console.log(`Inizio caricamento di ${totalMonsters} modelli...`);

        for (const config of monsterConfigs) {
            try {
                console.log(`Caricamento ${config.name} da ${config.file}...`);
                const gltf = await this.loadGLTF(loader, `modelli_3D/${config.file}`);
                
                const monster = gltf.scene;
                monster.position.set(config.position.x, config.position.y, config.position.z);
                monster.scale.set(config.scale, config.scale, config.scale);
                
                // Enable shadows
                monster.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.scene.add(monster);
                
                this.monsters[config.name] = {
                    model: monster,
                    basePosition: { ...config.position },
                    isMoving: false,
                    movementAngle: Math.random() * Math.PI * 2,
                    idleAnimation: { time: Math.random() * Math.PI * 2 },
                    isBuilding: config.isBuilding || false,
                    isWalking: false,
                    walkAnimationId: null,
                    legMeshes: this.findLegMeshes(monster)
                };

                loadedCount++;
                console.log(`✓ Caricato: ${config.name} (${loadedCount}/${totalMonsters})`);
                
                // Find leg meshes for procedural animation
                const legs = this.findLegMeshes(monster);
                
                // Update loading text
                document.getElementById('loading').querySelector('p').textContent = 
                    `Caricamento ${loadedCount}/${totalMonsters} mostriciattoli...`;

            } catch (error) {
                console.error(`❌ Errore caricamento ${config.name}:`, error);
                console.error(`File: modelli_3D/${config.file}`);
            }
        }

        // Hide loading screen and show UI
        console.log(`Caricamento completato: ${loadedCount}/${totalMonsters} modelli`);
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('ui-overlay').classList.remove('hidden');
        
        if (loadedCount === 0) {
            alert('Errore: Nessun modello caricato. Controlla la console per dettagli.');
        } else {
            console.log(`🎮 Gioco pronto! ${loadedCount}/${totalMonsters} mostri caricati`);
        }
    }

    loadGLTF(loader, path) {
        return new Promise((resolve, reject) => {
            loader.load(
                path,
                (gltf) => resolve(gltf),
                undefined,
                (error) => reject(error)
            );
        });
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 80;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
    }

    setupKeyboardControls() {
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };

        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) this.keys[key] = true;
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) this.keys[key] = false;
        });
    }

    animateMonster(monsterName, animationType) {
        const monster = this.monsters[monsterName];
        if (!monster) return;

        switch (animationType) {
            case 'jump':
                this.jumpAnimation(monster);
                break;
            case 'spin':
                this.spinAnimation(monster);
                break;
            case 'walk':
                this.walkAnimation(monster);
                break;
        }
    }

    jumpAnimation(monster) {
        const startY = monster.model.position.y;
        const jumpHeight = 4;
        const duration = 800;
        const startTime = Date.now();

        const jump = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Parabolic jump
            const height = Math.sin(progress * Math.PI) * jumpHeight;
            monster.model.position.y = startY + height;

            if (progress < 1) {
                requestAnimationFrame(jump);
            } else {
                monster.model.position.y = startY;
            }
        };

        jump();
    }

    spinAnimation(monster) {
        const startRotation = monster.model.rotation.y;
        const duration = 1000;
        const startTime = Date.now();

        const spin = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            monster.model.rotation.y = startRotation + (progress * Math.PI * 2);

            if (progress < 1) {
                requestAnimationFrame(spin);
            }
        };

        spin();
    }

    findLegMeshes(model) {
        const legs = {
            leftLeg: null,
            rightLeg: null
        };

        model.traverse((node) => {
            if (node.isMesh) {
                const nameLower = node.name.toLowerCase();
                
                // Try to identify leg meshes by name
                if (nameLower.includes('left') && (nameLower.includes('leg') || nameLower.includes('foot'))) {
                    legs.leftLeg = node;
                    console.log(`Found left leg mesh: ${node.name}`);
                } else if (nameLower.includes('right') && (nameLower.includes('leg') || nameLower.includes('foot'))) {
                    legs.rightLeg = node;
                    console.log(`Found right leg mesh: ${node.name}`);
                }
            }
        });

        return legs;
    }

    walkAnimation(monster) {
        // Stop if already walking
        if (monster.isWalking) {
            monster.isWalking = false;
            if (monster.walkAnimationId) {
                cancelAnimationFrame(monster.walkAnimationId);
                monster.walkAnimationId = null;
            }
            this.resetLegMeshes(monster);
            return;
        }

        monster.isWalking = true;
        const startPos = { ...monster.model.position };
        const walkDistance = 15;
        const duration = 3000;
        const startTime = Date.now();
        
        // Store original positions
        if (!monster.originalLegPositions) {
            monster.originalLegPositions = this.saveLegPositions(monster);
        }
        
        const walk = () => {
            if (!monster.isWalking) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Linear movement forward
            monster.model.position.x = startPos.x + (progress * walkDistance);
            
            // Walking bob
            const bobFrequency = 8;
            const bobAmount = 0.2;
            const bobPhase = progress * Math.PI * bobFrequency;
            monster.model.position.y = startPos.y + Math.abs(Math.sin(bobPhase)) * bobAmount;
            
            // Subtle body tilt while walking
            monster.model.rotation.z = Math.sin(bobPhase) * 0.05;
            
            // Animate leg meshes if available
            this.animateLegMeshes(monster, bobPhase);

            if (progress < 1) {
                monster.walkAnimationId = requestAnimationFrame(walk);
            } else {
                // Reset
                monster.model.position.y = startPos.y;
                monster.model.rotation.z = 0;
                this.resetLegMeshes(monster);
                monster.isWalking = false;
            }
        };

        walk();
    }

    saveLegPositions(monster) {
        const saved = {};
        if (monster.legMeshes) {
            if (monster.legMeshes.leftLeg) {
                saved.leftLeg = { 
                    x: monster.legMeshes.leftLeg.rotation.x,
                    y: monster.legMeshes.leftLeg.rotation.y,
                    z: monster.legMeshes.leftLeg.rotation.z
                };
            }
            if (monster.legMeshes.rightLeg) {
                saved.rightLeg = { 
                    x: monster.legMeshes.rightLeg.rotation.x,
                    y: monster.legMeshes.rightLeg.rotation.y,
                    z: monster.legMeshes.rightLeg.rotation.z
                };
            }
        }
        return saved;
    }

    resetLegMeshes(monster) {
        if (monster.originalLegPositions && monster.legMeshes) {
            if (monster.legMeshes.leftLeg && monster.originalLegPositions.leftLeg) {
                monster.legMeshes.leftLeg.rotation.x = monster.originalLegPositions.leftLeg.x;
                monster.legMeshes.leftLeg.rotation.z = monster.originalLegPositions.leftLeg.z;
            }
            if (monster.legMeshes.rightLeg && monster.originalLegPositions.rightLeg) {
                monster.legMeshes.rightLeg.rotation.x = monster.originalLegPositions.rightLeg.x;
                monster.legMeshes.rightLeg.rotation.z = monster.originalLegPositions.rightLeg.z;
            }
        }
    }

    animateLegMeshes(monster, phase) {
        if (!monster.legMeshes) return;

        const swingAmount = 0.3;
        
        // Animate legs with opposite phases
        if (monster.legMeshes.leftLeg) {
            monster.legMeshes.leftLeg.rotation.x = Math.sin(phase) * swingAmount;
        }
        if (monster.legMeshes.rightLeg) {
            monster.legMeshes.rightLeg.rotation.x = Math.sin(phase + Math.PI) * swingAmount;
        }
    }

    toggleMovement(monsterName) {
        const monster = this.monsters[monsterName];
        if (!monster) return;

        monster.isMoving = !monster.isMoving;
    }

    updateMonsters(deltaTime) {
        // Limit updates if deltaTime is too large (performance issue)
        if (deltaTime > 0.1) deltaTime = 0.1;
        
        Object.values(this.monsters).forEach(monster => {
            // Buildings don't animate
            if (monster.isBuilding) return;
            
            // Skip idle animation if walking
            if (!monster.isWalking && !monster.isMoving) {
                monster.idleAnimation.time += deltaTime * 2;
                const bobAmount = Math.sin(monster.idleAnimation.time) * 0.2;
                monster.model.position.y = monster.basePosition.y + bobAmount;
            }

            // Movement
            if (monster.isMoving) {
                monster.movementAngle += deltaTime * 0.5;
                const radius = 8;
                monster.model.position.x = monster.basePosition.x + Math.cos(monster.movementAngle) * radius;
                monster.model.position.z = monster.basePosition.z + Math.sin(monster.movementAngle) * radius;
                
                // Rotate to face movement direction
                monster.model.rotation.y = monster.movementAngle + Math.PI / 2;
            }
        });
    }

    updateCamera(deltaTime) {
        if (!this.keys) return; // Safety check
        
        const moveSpeed = 15 * deltaTime;
        const direction = new THREE.Vector3();

        if (this.keys.w) {
            direction.z -= moveSpeed;
        }
        if (this.keys.s) {
            direction.z += moveSpeed;
        }
        if (this.keys.a) {
            direction.x -= moveSpeed;
        }
        if (this.keys.d) {
            direction.x += moveSpeed;
        }

        if (direction.length() > 0) {
            this.controls.target.add(direction);
            this.camera.position.add(direction);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        this.updateMonsters(deltaTime);
        this.updateCamera(deltaTime);
        this.controls.update();

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the game
const game = new MonsterGame();

// Make game accessible globally for button controls
window.game = game;
