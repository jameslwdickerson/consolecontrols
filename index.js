const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { openStreamDeck, listStreamDecks } = require('elgato-stream-deck'); // Ensure listStreamDecks is imported
const fs = require('fs').promises;
const sharp = require('sharp'); // For processing images
const Jimp = require('jimp'); // added to try and get text on a

let mainWindow;
let myStreamDeck;

// creates window for app
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

// Function to get and send connected Stream Decks

ipcMain.on('get-stream-decks', async (event) => {
    try {
        // Retrieve the list of connected Stream Decks
        const devices = listStreamDecks();
        console.log('Connected Stream Decks:', devices); // Log to the console for debugging
        // Send the devices list to the renderer
        event.reply('stream-decks-response', devices);
    } catch (error) {
        console.error('Error listing Stream Decks:', error);
        event.reply('stream-decks-response', []);
    }
});


// Function to set image
ipcMain.on('set-image', async (event, imageBuffer) => {
    try {
        // Use sharp to process the image buffer
        const { data } = await sharp(imageBuffer)
            .resize(72, 72) // Resize the image to fit the Stream Deck button size
            .raw() // Get raw data in RGBA format
            .toBuffer({ resolveWithObject: true }); // Resolve as object to get buffer

        // Set the image to button 3 (index 2)
        myStreamDeck.fillImage(2, data); // Pass the raw RGBA data
        console.log('Image set to button 3');
    } catch (error) {
        console.error('Error setting image to button 3:', error);
    }
});

// for adding text to button 2
ipcMain.on('set-text', async (event, { buttonIndex, text }) => {
    try {
        console.log(text, 'index.js')
        if (!text || typeof text !== 'string') {
            throw new TypeError('Text must be a valid string');
        }

        // Create an image with Jimp
        const width = 80;  // Width for Stream Deck button
        const height = 80; // Height for Stream Deck button

        const image = new Jimp(width, height, 0x000000FF); // Black background
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE); // Load white font

        // Print text onto the image
        image.print(font, 10, 10, text);

        // Get image buffer
        image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
            if (err) throw err;
            myStreamDeck.fillImage(buttonIndex, buffer); // Fill the image on the Stream Deck button
            console.log(`Text set successfully for button ${buttonIndex + 1}: "${text}"`);
        });
    } catch (error) {
        console.error('Error setting text to button:', error);
    }
});


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
  

//added to create images for the buttons
// ipcMain.on('set-image', async (event, imagePath) => {
//     try {
//         // Read the image file
//         const imageBuffer = await fs.readFile(imagePath);

//         // Resize the image to 192x144 while maintaining aspect ratio
//         const resizedImageBuffer = await sharp(imageBuffer)
//             .resize(192, 144, {
//                 fit: sharp.fit.inside, // Maintain aspect ratio
//                 withoutEnlargement: true // Prevent enlarging smaller images
//             })
//             .raw() // Output as raw pixel data
//             .toBuffer();

//         // Fill the image for button 3 (index 2)
//         myStreamDeck.fillImage(2, resizedImageBuffer); 
//         console.log('Image set successfully for button 3.');
//     } catch (error) {
//         console.error('Error setting image to button 3:', error);
//     }
// });

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

    ipcMain.on('set-color', () => {
        setColor()
    });

    ipcMain.on('set-brightness', (event, brightness) => {
        myStreamDeck.setBrightness(brightness);
    });

    ipcMain.on('clear-all', () => {
        myStreamDeck.clearAllKeys();
    });

    // added for color picker
    // Listen for the color selection event
ipcMain.on('set-color-picker', (event, { r, g, b }) => {
    const keyIndex = 3; // 4th button (0-indexed)
    
    try {
        myStreamDeck.fillColor(keyIndex, r, g, b);
        event.reply('color-picker-response', `Color set to (${r}, ${g}, ${b}) for key ${keyIndex + 1}`);
    } catch (error) {
        console.error('Error setting color:', error);
        event.reply('color-picker-response', 'Failed to set color');
    }
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
