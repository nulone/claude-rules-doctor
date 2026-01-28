import chalk from 'chalk';
import type { RuleCheckResult, CheckReport } from './types.js';
import { RuleStatus } from './types.js';

export function generateReport(results: RuleCheckResult[]): CheckReport {
  const report: CheckReport = {
    totalRules: results.length,
    okCount: 0,
    warningCount: 0,
    deadCount: 0,
    results,
  };

  for (const result of results) {
    switch (result.status) {
      case RuleStatus.OK:
        report.okCount++;
        break;
      case RuleStatus.WARNING:
        report.warningCount++;
        break;
      case RuleStatus.DEAD:
        report.deadCount++;
        break;
    }
  }

  return report;
}

export function printConsoleReport(report: CheckReport, verbose: boolean): void {
  console.log(chalk.bold('\n🔍 Rules Doctor - Check Results\n'));

  for (const result of report.results) {
    const statusIcon = getStatusIcon(result.status);
    const statusColor = getStatusColor(result.status);
    const relativePath = result.rule.filePath;

    console.log(
      `${statusIcon} ${statusColor(result.status.padEnd(7))} ${chalk.gray(relativePath)}`
    );
    console.log(`  ${chalk.dim(result.message)}`);

    if (verbose && result.matchedFiles.length > 0) {
      console.log(chalk.dim(`  Matched files (${result.matchedFiles.length}):`));
      result.matchedFiles.slice(0, 10).forEach(file => {
        console.log(chalk.dim(`    - ${file}`));
      });
      if (result.matchedFiles.length > 10) {
        console.log(chalk.dim(`    ... and ${result.matchedFiles.length - 10} more`));
      }
    }
    console.log();
  }

  console.log(chalk.bold('Summary:'));
  console.log(`  Total rules: ${report.totalRules}`);
  console.log(`  ${chalk.green('✅ OK')}: ${report.okCount}`);
  console.log(`  ${chalk.yellow('⚠️  WARNING')}: ${report.warningCount}`);
  console.log(`  ${chalk.red('❌ DEAD')}: ${report.deadCount}`);
  console.log();

  if (report.deadCount > 0) {
    console.log(
      chalk.yellow(
        `⚠️  Found ${report.deadCount} dead rule(s). These rules won't apply to any files.`
      )
    );
    console.log();
  }
}

export function printJsonReport(report: CheckReport): void {
  console.log(JSON.stringify(report, null, 2));
}

function getStatusIcon(status: RuleStatus): string {
  switch (status) {
    case RuleStatus.OK:
      return chalk.green('✅');
    case RuleStatus.WARNING:
      return chalk.yellow('⚠️');
    case RuleStatus.DEAD:
      return chalk.red('❌');
  }
}

function getStatusColor(status: RuleStatus): typeof chalk.green {
  switch (status) {
    case RuleStatus.OK:
      return chalk.green;
    case RuleStatus.WARNING:
      return chalk.yellow;
    case RuleStatus.DEAD:
      return chalk.red;
  }
}
