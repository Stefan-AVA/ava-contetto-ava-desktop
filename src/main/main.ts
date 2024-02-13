import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  Notification,
  ipcMain,
  nativeImage,
  screen,
  Event,
} from "electron";
import * as path from "path";

let tray: Tray | null = null;
let win: BrowserWindow | null = null;
let isQuitting = false; // Use a separate variable to track quitting state
console.log("Starting Electron app...");

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    let iconPath: string;
    if (process.platform === "darwin") {
      const scaleFactor = Math.round(screen.getPrimaryDisplay().scaleFactor);
      iconPath =
        scaleFactor > 1
          ? path.join(__dirname, "../assets/icon/tray@2x.png")
          : path.join(__dirname, "../assets/icon/tray.png");
    } else {
      console.log("this is the windows");
      iconPath = path.join(__dirname, "../assets/icon/task-win.png");
    }

    const trayIcon = nativeImage.createFromPath(iconPath);

    tray = new Tray(trayIcon);
    tray.setToolTip("Contetto");

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Open",
        click: () => {
          if (win && win.isMinimized()) win.restore();
          if (win && !win.isVisible()) win.show();
          win?.focus();
        },
      },
      {
        label: "Exit",
        click: () => {
          isQuitting = true; // Update the state variable instead of the app object
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
      if (win && win.isMinimized()) win.restore();
      if (win && !win.isVisible()) win.show();
      win?.focus();
    });

    win?.on("close", (event) => {
      if (!isQuitting) {
        // Check the state variable
        event.preventDefault();
        win?.hide();
      }
    });

    win?.on("page-title-updated", (evt: Event) => {
      evt.preventDefault();
      win?.setTitle("Contetto");
    });

    const quitShortcut = globalShortcut.register("CommandOrControl+Q", () => {
      app.quit();
    });

    if (!quitShortcut) {
      console.log("Registration failed for the shortcut Ctrl+Q");
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (win === null) {
      createWindow();
    } else if (win.isMinimized()) {
      win.restore();
    } else {
      win.show();
    }
  });

  app.on("will-quit", () => {
    globalShortcut.unregister("CommandOrControl+Q");
  });

  ipcMain.on("show-notification", (event, obj) => {
    showNotification(obj);
  });
}

function createWindow(): void {
  console.log(path.join(__dirname, "preload.js").toString());
  win = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: "../assets/icon/task-win.png",
    show: false, // Correctly placed outside webPreferences
  });

  win.setMenuBarVisibility(false);
  win.loadURL("https://avahomeai.com/");
  win.once("ready-to-show", () => win?.show()); // Show the window when ready
  win.webContents.on("did-finish-load", () => {
    win?.setTitle("Contetto");
  });
}

function showNotification(options: any): void {
  console.log("This is the notification function");
  if (Notification.isSupported()) {
    let notification = new Notification({
      title: options.title,
      body: options.body,
      icon: options.icon || "../assets/icon/task-win.png",
      silent: false,
    });

    notification.on("click", () => {
      console.log("Notification clicked");
      // Explicitly check that win is not null before using it
      if (options.url && win) {
        // Simplified to `win` which checks for non-null and non-undefined
        win
          .loadURL(options.url)
          .then(() => {
            // Since we're inside a check for `win`, it's safe to assume `win` is not null here
            if (win) {
              if (win.isMinimized()) win.restore();
              win.show();
              win.focus();
            }
          })
          .catch((err) => {
            console.error("Failed to load URL:", err);
          });
      }
    });

    notification.show();
  } else {
    console.log("Notifications are not supported on this system");
  }
}
