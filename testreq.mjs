console.log(typeof require("electron")); const e = require("electron"); console.log(typeof e); if (typeof e === "object") { console.log("keys:", Object.keys(e)); } else { console.log("e is:", e); }
