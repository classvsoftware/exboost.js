const fs = require("fs");
const path = require("path");
const packageJson = require("../package.json").version;

const filePath = path.join(__dirname, "../src/exboost.ts");
let content = fs.readFileSync(filePath, { encoding: "utf8" });
content = content.replace("VERSION_PLACEHOLDER", packageJson);

fs.writeFileSync(filePath, content, { encoding: "utf8" });
