const fs = require("fs");
const path = require("path");
const version = require("../package.json").version;

for (const relativePath of ["../dist/exboost.cjs", "../dist/exboost.mjs"]) {
  const filePath = path.join(__dirname, relativePath);
  let content = fs.readFileSync(filePath, { encoding: "utf8" });
  content = content.replace("VERSION_PLACEHOLDER", version);

  fs.writeFileSync(filePath, content, { encoding: "utf8" });
}
