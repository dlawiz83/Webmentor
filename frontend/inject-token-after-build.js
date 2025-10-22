import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const distPath = "dist/manifest.json";

if (!fs.existsSync(distPath)) {
  console.error(" dist/manifest.json not found. Run build first.");
  process.exit(1);
}

const envToken = process.env.VITE_CHROME_AI_TOKEN;
if (!envToken) {
  console.error("No token found in .env");
  process.exit(1);
}

let manifest = fs.readFileSync(distPath, "utf8");
manifest = manifest.replace("$VITE_CHROME_AI_TOKEN", envToken);
fs.writeFileSync(distPath, manifest);

console.log("Token injected successfully into dist/manifest.json");
