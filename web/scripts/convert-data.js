/* global process */
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", "data");
const OUT_DIR = join(__dirname, "..", "public", "data");

const FILES = [
  { code: "wfa", gender: "boys", ageCol: "Age" },
  { code: "wfa", gender: "girls", ageCol: "Age" },
  { code: "lhfa", gender: "boys", ageCol: "Day" },
  { code: "lhfa", gender: "girls", ageCol: "Day" },
  { code: "hcfa", gender: "boys", ageCol: "Age" },
  { code: "hcfa", gender: "girls", ageCol: "Age" },
];

const COLUMNS = ["Day", "L", "M", "S", "P01", "P25", "P50", "P75", "P99"];

async function convert() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const { code, gender, ageCol } of FILES) {
    const filename = `${code}-${gender}-percentiles-expanded-tables.xlsx`;
    const filepath = join(DATA_DIR, filename);

    const buf = await readFile(filepath);
    const workbook = XLSX.read(buf, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const data = rows.map((row) => {
      const obj = {};
      for (const col of COLUMNS) {
        if (col === "Day") {
          obj.Day = row[ageCol] ?? row.Day;
        } else {
          obj[col] = row[col];
        }
      }
      return obj;
    });

    const outPath = join(OUT_DIR, `${code}-${gender}.json`);
    await writeFile(outPath, JSON.stringify(data));
    console.log(`  ${filename} -> ${code}-${gender}.json (${data.length} rows)`);
  }

  console.log("Done.");
}

convert().catch((err) => {
  console.error(err);
  process.exit(1);
});
