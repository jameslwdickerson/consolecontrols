const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onButtonPress: (callback) => ipcRenderer.on('button-press', callback),
    onButtonRelease: (callback) => ipcRenderer.on('button-release', callback),
    setBrightness: (brightness) => ipcRenderer.send('set-brightness', brightness),
    clearAllButtons: () => ipcRenderer.send('clear-all'),
    startColorCycle: () => ipcRenderer.send('start-color-cycle'),
});
