console.log("keys:", Object.keys(require.cache)); const m = require.cache[require.resolve("electron")]; console.log("cache entry:", m); if (m) { console.log("m.exports:", m.exports); }
