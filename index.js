const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { openStreamDeck } = require('elgato-stream-deck');
const fs = require('fs').promises;

let mainWindow;
let myStreamDeck;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile('index.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// Create cycling colors for animation
function cycleColors() {
    const colorCycle = setInterval(() => {
        for (let i = 0; i < myStreamDeck.NUM_KEYS; i++) {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            myStreamDeck.fillColor(i, r, g, b);
        }
    }, 500);
    return colorCycle;
}

// Demo sequence of actions
async function runDemoSequence() {
    // Step 1: Set all buttons to blue
    for (let i = 0; i < myStreamDeck.NUM_KEYS; i++) {
        myStreamDeck.fillColor(i, 0, 0, 255);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 2: Cycle colors with delay
    const cycleInterval = cycleColors();
    await new Promise((resolve) => setTimeout(resolve, 5000));
    clearInterval(cycleInterval);

    // Step 3: Clear all buttons
    myStreamDeck.clearAllKeys();
}

app.on('ready', () => {
    createWindow();

    myStreamDeck = openStreamDeck();

    myStreamDeck.on('down', (keyIndex) => {
        console.log(`Button ${keyIndex} pressed`);
        mainWindow.webContents.send('button-press', keyIndex);

        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        myStreamDeck.fillColor(keyIndex, r, g, b);
    });

    myStreamDeck.on('up', (keyIndex) => {
        console.log(`Button ${keyIndex} released`);
        mainWindow.webContents.send('button-release', keyIndex);
        myStreamDeck.clearKey(keyIndex);
    });

    myStreamDeck.on('error', (error) => {
        console.error('Stream Deck error:', error);
    });

    ipcMain.on('start-color-cycle', () => {
        runDemoSequence();
    });

    ipcMain.on('set-brightness', (event, brightness) => {
        myStreamDeck.setBrightness(brightness);
    });

    ipcMain.on('clear-all', () => {
        myStreamDeck.clearAllKeys();
    });
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('before-quit', () => {
    if (myStreamDeck) {
        myStreamDeck.close();
    }
});
