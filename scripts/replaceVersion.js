const fs = require("fs");
const path = require("path");
const version = require("../package.json").version;

const filePath = path.join(__dirname, "../dist/exboost.js");
let content = fs.readFileSync(filePath, { encoding: "utf8" });
content = content.replace("VERSION_PLACEHOLDER", version);

fs.writeFileSync(filePath, content, { encoding: "utf8" });
