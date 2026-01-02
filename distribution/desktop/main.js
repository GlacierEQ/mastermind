const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400, height: 900,
    titleBarStyle: 'hiddenInset', // Apple Apple-style seamless header
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  win.loadURL('http://localhost:3000'); // Connects to the local Full-Stack backend
}

app.whenReady().then(createWindow);
