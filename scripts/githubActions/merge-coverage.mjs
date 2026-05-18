/* eslint-disable no-undef */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const coverageDir = path.join(rootDir, 'coverage');

const coverageFiles = await findCoverageFiles(['apps', 'packages']);
const finalCoverage = {};
const summary = {
  total: createEmptyTotal(),
};

for (const filePath of coverageFiles.final) {
  const fileCoverage = JSON.parse(await readFile(filePath, 'utf8'));
  Object.assign(finalCoverage, fileCoverage);
}

for (const filePath of coverageFiles.summary) {
  const coverageSummary = JSON.parse(await readFile(filePath, 'utf8'));

  for (const [fileName, fileSummary] of Object.entries(coverageSummary)) {
    if (fileName === 'total') {
      continue;
    }

    summary[fileName] = fileSummary;
    addTotals(summary.total, fileSummary);
  }
}

calculatePercentages(summary.total);

await mkdir(coverageDir, { recursive: true });
await writeFile(path.join(coverageDir, 'coverage-final.json'), `${JSON.stringify(finalCoverage)}\n`);
await writeFile(path.join(coverageDir, 'coverage-summary.json'), `${JSON.stringify(summary)}\n`);

async function findCoverageFiles(workspaceDirs) {
  const files = {
    final: [],
    summary: [],
  };

  for (const workspaceDir of workspaceDirs) {
    const workspacePath = path.join(rootDir, workspaceDir);
    const entries = await readdir(workspacePath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const packageCoverageDir = path.join(workspacePath, entry.name, 'coverage');
      files.final.push(path.join(packageCoverageDir, 'coverage-final.json'));
      files.summary.push(path.join(packageCoverageDir, 'coverage-summary.json'));
    }
  }

  return files;
}

function createEmptyTotal() {
  return {
    lines: createEmptyMetric(),
    statements: createEmptyMetric(),
    functions: createEmptyMetric(),
    branches: createEmptyMetric(),
    branchesTrue: createEmptyMetric(),
  };
}

function createEmptyMetric() {
  return {
    total: 0,
    covered: 0,
    skipped: 0,
    pct: 'Unknown',
  };
}

function addTotals(total, fileSummary) {
  for (const metricName of ['lines', 'statements', 'functions', 'branches']) {
    total[metricName].total += fileSummary[metricName].total;
    total[metricName].covered += fileSummary[metricName].covered;
    total[metricName].skipped += fileSummary[metricName].skipped;
  }
}

function calculatePercentages(total) {
  for (const metric of Object.values(total)) {
    metric.pct = metric.total === 0 ? 'Unknown' : Number(((metric.covered / metric.total) * 100).toFixed(2));
  }
}
