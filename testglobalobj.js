for (let k in global) { try { const g = global[k]; if (g && typeof g === "object" && g.app && g.BrowserWindow) { console.log(k, "has app and BrowserWindow"); } } catch (e) { } }
