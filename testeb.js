if (process.electronBinding) { console.log("electronBinding exists"); const e = process.electronBinding("electron"); console.log(typeof e); } else { console.log("electronBinding not found"); }
