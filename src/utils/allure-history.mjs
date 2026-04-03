import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';

const KEEP = 5;
const ROOT = process.cwd();

const reportHistoryDir = path.join(ROOT, 'allure-report', 'history');
const resultsHistoryDir = path.join(ROOT, 'allure-results', 'history');
const widgetsDir = path.join(ROOT, 'allure-report', 'widgets');
const dataDir = path.join(ROOT, 'allure-report', 'data');

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  fs.cpSync(src, dst, { recursive: true });
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function trimTrendFile(filePath, keep) {
  const data = readJson(filePath);
  if (!data) return;

  if (Array.isArray(data)) {
    writeJson(filePath, data.slice(0, keep));
    return;
  }
  if (data && Array.isArray(data.items)) {
    data.items = data.items.slice(0, keep);
    writeJson(filePath, data);
  }
}

// This is the key: trim per-test history items used by the History tab
function trimPerTestHistory(filePath, keep) {
  const data = readJson(filePath);
  if (!data) return;

  // Allure stores per-test history as an object keyed by test uid
  // Each entry has an "items" array (newest first)
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const key of Object.keys(data)) {
      const entry = data[key];
      if (entry && Array.isArray(entry.items)) {
        entry.items = entry.items.slice(0, keep);
      }
    }
    writeJson(filePath, data);
  }
}

const mode = process.argv[2]; // "seed" | "trim"

if (mode === 'seed') {
  copyDir(reportHistoryDir, resultsHistoryDir);
  trimPerTestHistory(path.join(resultsHistoryDir, 'history.json'), KEEP);
  trimTrendFile(path.join(resultsHistoryDir, 'history-trend.json'), KEEP);
  trimTrendFile(path.join(resultsHistoryDir, 'duration-trend.json'), KEEP);
  trimTrendFile(path.join(resultsHistoryDir, 'retry-trend.json'), KEEP);
  trimTrendFile(path.join(resultsHistoryDir, 'categories-trend.json'), KEEP);
  process.exit(0);
}

if (mode === 'trim') {
  // trend widgets
  const trendFiles = [
    'history-trend.json',
    'duration-trend.json',
    'retry-trend.json',
    'categories-trend.json',
  ];

  for (const f of trendFiles) {
    trimTrendFile(path.join(widgetsDir, f), KEEP);
    trimTrendFile(path.join(reportHistoryDir, f), KEEP);
    trimTrendFile(path.join(dataDir, f), KEEP);
  }

  // history tab source (this is what you were missing)
  trimPerTestHistory(path.join(reportHistoryDir, 'history.json'), KEEP);
  trimPerTestHistory(path.join(widgetsDir, 'history.json'), KEEP);
  trimPerTestHistory(path.join(dataDir, 'history.json'), KEEP);

  // recompute/trim summary totals (Overview “x of y”)
  const summaryPath = path.join(widgetsDir, 'summary.json');
  const summary = readJson(summaryPath);
  if (summary?.statistic) {
    // keep current run totals only; history is shown elsewhere
    // statistic should reflect current report tests, not accumulated launches
    // if it’s inflated, it usually means old results were still included
    // safest: set total = passed+failed+broken+skipped+unknown
    const s = summary.statistic;
    s.total =
      (s.passed ?? 0) + (s.failed ?? 0) + (s.broken ?? 0) + (s.skipped ?? 0) + (s.unknown ?? 0);
    writeJson(summaryPath, summary);
  }

  process.exit(0);
}

console.error('Usage: node scripts/allure-history.mjs "seed" | "trim"');
process.exit(1);
