console.log("Deleting 'out' directory...");
require("node:fs").rmSync("./out", { recursive: true, force: true });
