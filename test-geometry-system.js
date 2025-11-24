// Geometry and alignment tests for terrain helpers
import * as THREE from 'three';
import { RPGGame } from './rpg-game.js';

console.log('=== Testing Geometry & Alignment System ===\n');

class TestGame extends RPGGame {
    constructor() {
        super(false);
        this.mapGroup = new THREE.Group();
    }

    async loadGLTF(path) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial()
        );
        mesh.name = path;
        return { scene: mesh };
    }
}

const ALIGN_TOLERANCE = 1e-6;
const POSITION_TOLERANCE = 1e-4;

async function runGeometryTests() {
    const game = new TestGame();
    game.setGroundHeightFunction((x, z) => 0.5 * Math.sin(x * 0.1) + 0.25 * Math.cos(z * 0.1));
    game.mapBounds = { minX: -120, maxX: 120, minZ: -200, maxZ: 200 };

    // Player mock used for relative size checks
    game.player = new THREE.Mesh(
        new THREE.BoxGeometry(2, 9, 2),
        new THREE.MeshBasicMaterial()
    );
    game.player.userData.baseHeight = 4.5;
    game.player.userData.walkCycle = 0;

    console.log('Test 1: placeEntityOnGround allinea gli oggetti con il terreno');
    const dummy = new THREE.Object3D();
    dummy.userData.baseHeight = 1.25;
    const sampleX = 12;
    const sampleZ = -8;
    game.placeEntityOnGround(dummy, sampleX, sampleZ);
    const expectedY = game.getGroundHeight(sampleX, sampleZ) + dummy.userData.baseHeight;
    const diff = Math.abs(dummy.position.y - expectedY);
    if (diff <= ALIGN_TOLERANCE) {
        console.log('  ✓ Oggetto posizionato correttamente sulla superficie');
    } else {
        console.log(`  ✗ Allineamento errato: atteso ${expectedY.toFixed(4)}, ottenuto ${dummy.position.y.toFixed(4)}`);
    }

    console.log('\nTest 2: spawnWildMonsters rispetta scala e allineamento terreno');
    await game.spawnWildMonsters();

    let scaleIssues = 0;
    let alignmentIssues = 0;

    game.wildMonsters.forEach(monster => {
        const scale = monster.scale.x;
        if (scale < 1.5 || scale > 2.5) {
            scaleIssues++;
            console.log(`  ✗ Scala fuori range per ${monster.userData.name}: ${scale.toFixed(2)}`);
        }

        const groundHeight = game.getGroundHeight(monster.position.x, monster.position.z);
        const baseHeight = monster.userData.baseHeight ?? 0;
        const expectedHeight = groundHeight + baseHeight;
        const delta = Math.abs(monster.position.y - expectedHeight);
        if (delta > POSITION_TOLERANCE) {
            alignmentIssues++;
            console.log(`  ✗ ${monster.userData.name} disallineato di ${delta.toFixed(5)}`);
        }
    });

    if (scaleIssues === 0) {
        console.log('  ✓ Tutti i mostri hanno dimensioni entro il range 1.5 - 2.5');
    }
    if (alignmentIssues === 0) {
        console.log('  ✓ Tutti i mostri sono appoggiati correttamente al terreno');
    }

    console.log('\nTest 3: gli NPC hanno dimensioni coerenti con il player');
    const playerHeight = new THREE.Box3().setFromObject(game.player).getSize(new THREE.Vector3()).y;
    game.createNPCTrainer('trainer1', 0, 0, 0, 0xff0000);
    const npc = game.npcs['trainer1'];
    const npcHeight = new THREE.Box3().setFromObject(npc).getSize(new THREE.Vector3()).y;
    const npcRatio = npcHeight / playerHeight;
    if (npcRatio >= 0.8 && npcRatio <= 1.2) {
        console.log(`  ✓ NPC in scala: rapporto ${npcRatio.toFixed(2)}`);
    } else {
        console.log(`  ✗ Rapporto NPC/Player fuori range: ${npcRatio.toFixed(2)}`);
    }

    console.log('\n=== Geometry Tests Completed ===');
}

runGeometryTests().catch(error => {
    console.error('✗ Errore durante i test di geometria:', error);
    process.exit(1);
});
