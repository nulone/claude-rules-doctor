import { describe, it, expect } from 'vitest';
import { generateReport } from '../src/reporter.js';
import { RuleStatus } from '../src/types.js';

describe('generateReport', () => {
  it('counts statuses correctly', () => {
    const results: any[] = [
      { status: RuleStatus.OK, rule: { filePath: 'a' }, matchedFiles: [], message: '' },
      { status: RuleStatus.WARNING, rule: { filePath: 'b' }, matchedFiles: [], message: '' },
      { status: RuleStatus.DEAD, rule: { filePath: 'c' }, matchedFiles: [], message: '' },
      { status: RuleStatus.OK, rule: { filePath: 'd' }, matchedFiles: [], message: '' },
    ];
    const report = generateReport(results);
    expect(report.totalRules).toBe(4);
    expect(report.okCount).toBe(2);
    expect(report.warningCount).toBe(1);
    expect(report.deadCount).toBe(1);
  });
});
