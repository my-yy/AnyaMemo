'use strict'

import {app, protocol, BrowserWindow, ipcMain} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'
import installExtension, {VUEJS_DEVTOOLS} from 'electron-devtools-installer'

const electronLocalshortcut = require('electron-localshortcut');


const isDevelopment = process.env.NODE_ENV !== 'production'
const isMacOS = process.platform === 'darwin';


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {scheme: 'app', privileges: {secure: true, standard: true}}
])

app.on('before-quit', () => isQuiting = true); //cmd+Q

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: isDevelopment ? 1400 : 800,
    height: 600,
    // skipTaskbar: true,
    webPreferences: {
      enableRemoteModule: true,
      webSecurity: false,

      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })
  win.setTitle("AnyaMemo")

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  electronLocalshortcut.register(win, 'F10', () => {
    window.webContents.openDevTools();
  });


  const window = win
  window.on('close', (event) => { //点击关闭按钮 或者 执行cmd+Q 都会触发
    // app.dock.hide();
    if (isQuiting) {//cmd+q 在执行，不执行拦截逻辑
      return
    }
    if (window.fullScreen) {
      return; //如果是在全屏模式下，则还是关闭，否则界面会变成黑的。
    }
    if (isMacOS) {//Mac下只是隐藏窗口
      event.preventDefault();
      window.hide()
    }
  })


}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  createWindowOrShow()
})


function createWindowOrShow() {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  } else {
    //有可能是隐藏的，那就显示出来
    BrowserWindow.getAllWindows()[0].show()
  }
}

ipcMain.on("showWindow", async (event, message) => {
  createWindowOrShow()
})


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
  createTray()
})

let isQuiting = false


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


/// tray
import {Tray, Menu} from 'electron'
import path from "path"

let tray = null;

function createTray() {
  const icon_url = path.join(__static, 'icons/cat_16x16.png')
  //__static对应的是public文件夹
  tray = new Tray(icon_url);
  tray.setToolTip('AnyaMemo')
  tray.on("click", () => {
    createWindowOrShow()
  })
}
