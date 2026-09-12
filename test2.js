console.log(typeof require("electron")); const e = require("electron"); if (typeof e === "object") { console.log("has app:", !!e.app); } else { console.log("e is:", e); }
