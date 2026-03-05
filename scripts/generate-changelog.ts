import { execSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

interface ChangelogEntry {
  hash: string;
  subject: string;
  date: string;
  author: string;
}

const SEPARATOR = "---COMMIT---";

const raw = execSync(
  `git log --date=format:'%Y-%m-%d' --pretty=format:'%h${SEPARATOR}%s${SEPARATOR}%ad${SEPARATOR}%an'`,
  { encoding: "utf-8" }
);

const grouped: Record<string, ChangelogEntry[]> = {};

for (const line of raw.split("\n")) {
  if (!line.trim()) continue;
  const [hash, subject, date, author] = line.split(SEPARATOR);
  if (!hash || !subject || !date || !author) continue;

  if (!grouped[date]) grouped[date] = [];
  grouped[date].push({ hash, subject, date, author });
}

const sorted = Object.keys(grouped)
  .sort((a, b) => b.localeCompare(a))
  .reduce<Record<string, ChangelogEntry[]>>((acc, key) => {
    acc[key] = grouped[key];
    return acc;
  }, {});

const outDir = join(process.cwd(), "src", "data");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "changelog.json"), JSON.stringify(sorted, null, 2));

console.log(
  `Changelog: ${Object.values(sorted).flat().length} commits across ${Object.keys(sorted).length} days`
);
