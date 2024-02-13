import { contextBridge, ipcRenderer } from "electron";

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

contextBridge.exposeInMainWorld("Electron", {
  sendNotification: (options: NotificationOptions) => {
    console.log(options);
    ipcRenderer.send("show-notification", options);
  },
});
