#!/usr/bin/env node

import { Command } from 'commander';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { parseAllRules } from './parser.js';
import { checkAllRules } from './checker.js';
import { generateReport, printConsoleReport, printJsonReport } from './reporter.js';
import pkg from '../package.json' with { type: 'json' };

const program = new Command();

program
  .name('rules-doctor')
  .description('CLI for checking .claude/rules/*.md files')
  .version(pkg.version);

program
  .command('check')
  .description('Check all rules in .claude/rules/')
  .option('--root <path>', 'Root directory to check', process.cwd())
  .option('--ci', 'Exit with code 1 if dead rules found', false)
  .option('--json', 'Output results as JSON', false)
  .option('--verbose', 'Show matched files for each rule', false)
  .action(async (options) => {
    try {
      const rootDir = resolve(options.root);
      const rulesDir = join(rootDir, '.claude', 'rules');

      // Check if .claude/rules/ directory exists
      if (!existsSync(rulesDir)) {
        console.log('Directory .claude/rules/ does not exist');
        process.exit(0);
      }

      // Parse all rules
      const rules = await parseAllRules(rootDir);

      if (rules.length === 0) {
        console.log('No rules found in .claude/rules/ (directory is empty)');
        process.exit(0);
      }

      // Check all rules
      const results = await checkAllRules(rules, rootDir);

      // Generate report
      const report = generateReport(results);

      // Output
      if (options.json) {
        printJsonReport(report);
      } else {
        printConsoleReport(report, options.verbose, rootDir);
      }

      // CI mode: exit 1 if dead rules found
      if (options.ci && report.deadCount > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
