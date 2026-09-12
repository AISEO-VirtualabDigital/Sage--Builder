for (let k in process.env) { if (k.startsWith("NODE_")) console.log(k, ":", process.env[k]); }
