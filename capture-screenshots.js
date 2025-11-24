/**
 * Automated Screenshot Capture Script for Visual Testing
 * 
 * This script launches a dev server, opens the game in headless Chrome,
 * and captures screenshots at various camera positions including 
 * ground-level ("a raso terra") views.
 * 
 * Run with: node capture-screenshots.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const SERVER_PORT = 8765;
const PAGE_URL = `http://localhost:${SERVER_PORT}/rpg.html`;
const BROWSER_PATH = '/usr/bin/google-chrome';

// Camera positions for testing - including ground-level ("a raso terra")
const cameraPositions = [
    // Standard overhead views
    {
        name: '01_village_overview',
        description: 'Village center overview from above',
        map: 'village',
        camera: { x: 0, y: 25, z: 30 },
        target: { x: 0, y: 0, z: 0 }
    },
    {
        name: '02_pokecenter_view',
        description: 'View of Poké Center from angle',
        map: 'village',
        camera: { x: -15, y: 15, z: -5 },
        target: { x: -15, y: 0, z: -15 }
    },
    {
        name: '03_market_view',
        description: 'View of Market from angle',
        map: 'village',
        camera: { x: 15, y: 15, z: -5 },
        target: { x: 15, y: 0, z: -15 }
    },
    
    // Ground-level views ("a raso terra") - camera at player feet height
    {
        name: '11_ground_village_center',
        description: 'Ground-level: Village center looking toward Poké Center',
        map: 'village',
        groundLevel: true,
        camera: { x: 0, z: 5 },
        target: { x: 0, z: -20 },
        heightOffset: 1.0
    },
    {
        name: '12_ground_pokecenter_entrance',
        description: 'Ground-level: Poké Center entrance close view',
        map: 'village',
        groundLevel: true,
        camera: { x: -15, z: -10 },
        target: { x: -15, z: -15 },
        heightOffset: 0.5
    },
    {
        name: '13_ground_market_entrance',
        description: 'Ground-level: Market entrance close view',
        map: 'village',
        groundLevel: true,
        camera: { x: 15, z: -10 },
        target: { x: 15, z: -15 },
        heightOffset: 0.5
    },
    {
        name: '14_ground_houses_west',
        description: 'Ground-level: Western houses view',
        map: 'village',
        groundLevel: true,
        camera: { x: -10, z: 15 },
        target: { x: -15, z: 15 },
        heightOffset: 0.5
    },
    {
        name: '15_ground_houses_east',
        description: 'Ground-level: Eastern houses view',
        map: 'village',
        groundLevel: true,
        camera: { x: 10, z: 15 },
        target: { x: 15, z: 15 },
        heightOffset: 0.5
    },
    {
        name: '16_ground_npc_trainer',
        description: 'Ground-level: NPC trainer area view',
        map: 'village',
        groundLevel: true,
        camera: { x: -22, z: 3 },
        target: { x: -25, z: 0 },
        heightOffset: 0.5
    },
    {
        name: '17_ground_village_south',
        description: 'Ground-level: Southern path toward wild zone',
        map: 'village',
        groundLevel: true,
        camera: { x: 0, z: 35 },
        target: { x: 0, z: 48 },
        heightOffset: 1.0
    }
];

/**
 * Start a local HTTP server
 */
function startServer() {
    return new Promise((resolve, reject) => {
        console.log(`📡 Starting dev server on port ${SERVER_PORT}...`);
        
        const server = spawn('python3', ['-m', 'http.server', String(SERVER_PORT)], {
            cwd: __dirname,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        
        server.on('error', (err) => {
            reject(new Error(`Failed to start server: ${err.message}`));
        });
        
        // Give server time to start
        setTimeout(() => {
            console.log('✓ Dev server started');
            resolve(server);
        }, 2000);
    });
}

/**
 * Launch browser and navigate to game
 */
async function launchBrowser() {
    console.log('🌐 Launching Chrome browser...');
    
    const browser = await puppeteer.launch({
        executablePath: BROWSER_PATH,
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--enable-webgl',
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
            '--window-size=1280,720'
        ]
    });
    
    console.log('✓ Browser launched');
    return browser;
}

/**
 * Wait for game to be fully loaded
 */
async function waitForGameLoad(page) {
    console.log('⏳ Waiting for game to load...');
    
    // First check console for any errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`   Browser error: ${msg.text()}`);
        }
    });
    
    page.on('pageerror', err => {
        console.log(`   Page error: ${err.message}`);
    });
    
    // Check what's available
    const check1 = await page.evaluate(() => {
        return {
            hasWindow: typeof window !== 'undefined',
            hasRpgGame: typeof window.rpgGame !== 'undefined',
            hasThree: typeof THREE !== 'undefined'
        };
    });
    console.log(`   Initial state: window=${check1.hasWindow}, rpgGame=${check1.hasRpgGame}, THREE=${check1.hasThree}`);
    
    // Wait for the game to initialize with polling
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
        const gameState = await page.evaluate(() => {
            if (!window.rpgGame) return { ready: false, reason: 'no rpgGame' };
            if (!window.rpgGame.camera) return { ready: false, reason: 'no camera' };
            if (!window.rpgGame.renderer) return { ready: false, reason: 'no renderer' };
            if (!window.rpgGame.scene) return { ready: false, reason: 'no scene' };
            return { ready: true };
        });
        
        if (gameState.ready) {
            console.log('✓ Game loaded and ready');
            // Wait additional time for rendering
            await new Promise(resolve => setTimeout(resolve, 2000));
            return true;
        }
        
        if (attempts % 5 === 0) {
            console.log(`   Attempt ${attempts + 1}/${maxAttempts}: ${gameState.reason}`);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
    }
    
    throw new Error('Game failed to initialize after ' + maxAttempts + ' attempts');
}

/**
 * Capture screenshot at specified camera position
 */
async function captureScreenshot(page, position) {
    console.log(`📸 Capturing: ${position.name} - ${position.description}`);
    
    // Set camera position and capture canvas data
    const result = await page.evaluate((pos) => {
        const game = window.rpgGame;
        if (!game || !game.camera) {
            return { error: 'Game not initialized' };
        }
        
        const camera = game.camera;
        const getHeight = game.getGroundHeight;
        
        if (pos.groundLevel) {
            // Ground-level camera positioning ("a raso terra")
            const camHeight = getHeight(pos.camera.x, pos.camera.z) + pos.heightOffset;
            const targetHeight = getHeight(pos.target.x, pos.target.z) + pos.heightOffset;
            camera.position.set(pos.camera.x, camHeight, pos.camera.z);
            camera.lookAt(pos.target.x, targetHeight, pos.target.z);
        } else {
            // Fixed camera positioning
            camera.position.set(pos.camera.x, pos.camera.y, pos.camera.z);
            camera.lookAt(pos.target.x, pos.target.y || 0, pos.target.z);
        }
        
        // Force render
        game.renderer.render(game.scene, camera);
        
        // Capture canvas as data URL
        const canvas = document.querySelector('canvas');
        if (!canvas) {
            return { error: 'Canvas not found' };
        }
        
        let dataUrl;
        try {
            dataUrl = canvas.toDataURL('image/png');
        } catch(e) {
            return { error: 'Failed to capture canvas: ' + e.message };
        }
        
        return {
            success: true,
            dataUrl: dataUrl,
            cameraPosition: {
                x: camera.position.x.toFixed(2),
                y: camera.position.y.toFixed(2),
                z: camera.position.z.toFixed(2)
            },
            currentMap: game.currentMap
        };
    }, position);
    
    if (result.error) {
        console.log(`   ⚠️ Error: ${result.error}`);
        return null;
    }
    
    // Save the image from data URL
    const filename = `${position.name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    
    // Extract base64 data and save
    const base64Data = result.dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filepath, base64Data, 'base64');
    
    console.log(`   ✓ Saved: ${filename} (camera at ${result.cameraPosition.x}, ${result.cameraPosition.y}, ${result.cameraPosition.z})`);
    
    return {
        filename,
        filepath,
        position: result.cameraPosition,
        map: result.currentMap
    };
}

/**
 * Generate test report
 */
function generateReport(screenshots) {
    const reportPath = path.join(__dirname, 'screenshot-test-report.md');
    
    let report = `# Automated Screenshot Test Report

Generated: ${new Date().toISOString()}

## Summary

- Total screenshots captured: ${screenshots.length}
- Ground-level views: ${screenshots.filter(s => s && s.filename.includes('ground')).length}
- Overhead views: ${screenshots.filter(s => s && !s.filename.includes('ground')).length}

## Screenshots

| # | Name | Camera Position | Description |
|---|------|-----------------|-------------|
`;

    cameraPositions.forEach((pos, idx) => {
        const shot = screenshots[idx];
        if (shot) {
            report += `| ${idx + 1} | ${pos.name} | (${shot.position.x}, ${shot.position.y}, ${shot.position.z}) | ${pos.description} |\n`;
        } else {
            report += `| ${idx + 1} | ${pos.name} | - | ${pos.description} (FAILED) |\n`;
        }
    });

    report += `
## Ground-Level Views ("A Raso Terra")

These views are captured with the camera at player feet height (terrain + offset) looking horizontally.
This perspective reveals objects that may be partially underground or floating above the ground.

### Village Ground-Level Views

`;

    const groundLevelShots = cameraPositions.filter(p => p.groundLevel);
    groundLevelShots.forEach(pos => {
        report += `#### ${pos.name}
- **Description**: ${pos.description}
- **Camera**: (${pos.camera.x}, terrain+${pos.heightOffset}, ${pos.camera.z})
- **Target**: (${pos.target.x}, terrain+${pos.heightOffset}, ${pos.target.z})
- **File**: screenshots/${pos.name}.png

`;
    });

    report += `## Notes

- All screenshots were captured from a live dev server instance
- Camera positions use terrain height function for ground-level views
- Ground-level views help identify objects placed below or above terrain level
`;

    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved: ${reportPath}`);
    return reportPath;
}

/**
 * Main execution
 */
async function main() {
    console.log('\n=== Automated Screenshot Capture ===\n');
    
    // Ensure screenshots directory exists
    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
    
    let server = null;
    let browser = null;
    
    try {
        // Start server
        server = await startServer();
        
        // Launch browser
        browser = await launchBrowser();
        
        // Open game page
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        console.log(`🎮 Navigating to ${PAGE_URL}...`);
        await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        console.log('✓ Page loaded, waiting for game initialization...');
        
        // Wait for game to load
        await waitForGameLoad(page);
        
        // Capture screenshots
        console.log('\n📷 Capturing screenshots...\n');
        const screenshots = [];
        
        for (const position of cameraPositions) {
            const result = await captureScreenshot(page, position);
            screenshots.push(result);
        }
        
        // Generate report
        generateReport(screenshots);
        
        console.log('\n✅ Screenshot capture complete!\n');
        console.log(`Total screenshots: ${screenshots.filter(s => s !== null).length}/${cameraPositions.length}`);
        
    } catch (error) {
        console.error('❌ Error during screenshot capture:', error.message);
        process.exitCode = 1;
    } finally {
        // Cleanup
        if (browser) {
            console.log('🔒 Closing browser...');
            await browser.close();
        }
        if (server) {
            console.log('🔒 Stopping server...');
            server.kill('SIGTERM');
        }
    }
}

main();

export { cameraPositions };
