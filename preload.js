const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onButtonPress: (callback) => ipcRenderer.on('button-press', callback),
    onButtonRelease: (callback) => ipcRenderer.on('button-release', callback),
    setBrightness: (brightness) => ipcRenderer.send('set-brightness', brightness),
    clearAllButtons: () => ipcRenderer.send('clear-all'),
    startColorCycle: () => ipcRenderer.send('start-color-cycle'),
    getStreamDecks: () => ipcRenderer.send('get-stream-decks'),
    onStreamDecksResponse: (callback) => ipcRenderer.on('stream-decks-response', (event, devices) => {
        callback(event, devices);
    }),
    setColorPicker: (color) => ipcRenderer.send('set-color-picker', color), // for color picker button 4
    setText: (text) => ipcRenderer.send('set-text', text), // Exposed method to set text on button 2
    // setImage: (imageBuffer) => ipcRenderer.send('set-image', imageBuffer), // setting image for button 3
});
