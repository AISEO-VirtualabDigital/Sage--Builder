try { const { app } = require("electron"); console.log("app exists:", !!app); } catch (e) { console.error("error:", e.message); }
