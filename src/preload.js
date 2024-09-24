// preload.js

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, callback) => ipcRenderer.on(channel, callback),
    removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback)
  }
});


contextBridge.exposeInMainWorld('electronStore', {
  set: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  get: (key) => ipcRenderer.invoke('get-store-value', key),
  delete: (key) => ipcRenderer.invoke('delete-store-value', key),
});

