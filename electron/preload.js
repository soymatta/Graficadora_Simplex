const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Añade funciones que quieras compartir
});
