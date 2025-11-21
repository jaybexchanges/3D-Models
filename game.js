import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

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
        this.setupScene();
        this.setupLights();
        this.createGameMap();
        this.loadMonsters();
        this.setupControls();
        this.animate();
        
        // Setup keyboard controls
        this.setupKeyboardControls();
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
            { name: 'blue', file: 'Blue_Puffball_3D.glb', position: { x: -15, y: 2, z: -8 }, scale: 2 },
            { name: 'gnugnu', file: 'Gnugnu_3D.glb', position: { x: -5, y: 2, z: -8 }, scale: 2 },
            { name: 'lotus', file: 'Lotus_3D.glb', position: { x: 5, y: 2, z: -8 }, scale: 2 },
            { name: 'blossom', file: 'Blossom_3D.glb', position: { x: 15, y: 2, z: -8 }, scale: 2 },
            { name: 'lavaflare', file: 'LavaFlare.glb', position: { x: -15, y: 2, z: 8 }, scale: 2 },
            { name: 'pyrolynx', file: 'Pyrolynx.glb', position: { x: -5, y: 2, z: 8 }, scale: 2 },
            { name: 'player1', file: 'Player_1.glb', position: { x: 5, y: 2, z: 8 }, scale: 2 },
            { name: 'player2', file: 'Player_2.glb', position: { x: 15, y: 2, z: 8 }, scale: 2 },
            { name: 'pokecenter', file: 'Pokémon_Center.glb', position: { x: 0, y: 2, z: 0 }, scale: 3, isBuilding: true }
        ];

        let loadedCount = 0;
        const totalMonsters = monsterConfigs.length;

        for (const config of monsterConfigs) {
            try {
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
                    isBuilding: config.isBuilding || false
                };

                loadedCount++;
                console.log(`✓ Caricato: ${config.name}`);

            } catch (error) {
                console.error(`Errore caricamento ${config.name}:`, error);
            }
        }

        // Hide loading screen and show UI
        if (loadedCount > 0) {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('ui-overlay').classList.remove('hidden');
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

    toggleMovement(monsterName) {
        const monster = this.monsters[monsterName];
        if (!monster) return;

        monster.isMoving = !monster.isMoving;
    }

    updateMonsters(deltaTime) {
        Object.values(this.monsters).forEach(monster => {
            // Buildings don't animate
            if (monster.isBuilding) return;
            
            // Idle animation (bobbing)
            if (!monster.isMoving) {
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
