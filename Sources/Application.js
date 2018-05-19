const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

let mainWindow = null

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 640,
        resizable: false
    })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../Views/Main/Markdown/Main.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.on('closed', function() {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    if (mainWindow === null) {
        createWindow()
    }
})