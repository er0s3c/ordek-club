// Testler için LibreOffice yerine: girdi adında "slow" geçerse asılı kalır, "broken" geçerse PDF üretmez.
import fs from "node:fs";
import path from "node:path";
const args = process.argv.slice(2);
const input = args[args.length - 1];
const outDir = args[args.indexOf("--outdir") + 1];
const mode = fs.readFileSync(input).includes(Buffer.from("MODE:slow")) ? "slow" : fs.readFileSync(input).includes(Buffer.from("MODE:broken")) ? "broken" : "ok";
if (mode === "slow") setInterval(() => {}, 1000);
else if (mode === "broken") process.exit(1);
else fs.writeFileSync(path.join(outDir, path.basename(input).replace(/\.[^.]+$/, ".pdf")), "%PDF-1.7\n% sahte\n");
