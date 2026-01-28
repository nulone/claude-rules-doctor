import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAllRules } from '../src/parser.js';
import { checkAllRules } from '../src/checker.js';
import { RuleStatus } from '../src/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function byBasename(results: any[], basename: string) {
  const hit = results.find(r => path.basename(r.rule.filePath) === basename);
  if (!hit) throw new Error(`No result for ${basename}`);
  return hit;
}

function norm(arr: string[]) {
  return arr.map(s => s.replaceAll('\\', '/'));
}

describe('test-project', () => {
  const root = path.join(repoRoot, 'test-project');

  it('valid.md → OK, matches src/index.ts', async () => {
    const rules = await parseAllRules(root);
    const results = await checkAllRules(rules, root);
    const r = byBasename(results, 'valid.md');
    expect(r.status).toBe(RuleStatus.OK);
    expect(norm(r.matchedFiles)).toContain('src/index.ts');
  });

  it('global.md → OK, global rule', async () => {
    const rules = await parseAllRules(root);
    const results = await checkAllRules(rules, root);
    const r = byBasename(results, 'global.md');
    expect(r.status).toBe(RuleStatus.OK);
    expect(r.message).toMatch(/global/i);
  });

  it('dead.md → DEAD', async () => {
    const rules = await parseAllRules(root);
    const results = await checkAllRules(rules, root);
    const r = byBasename(results, 'dead.md');
    expect(r.status).toBe(RuleStatus.DEAD);
  });
});

describe('test-project-2', () => {
  const root = path.join(repoRoot, 'test-project-2');

  it('multiple-paths.md → OK, matches 3 files', async () => {
    const rules = await parseAllRules(root);
    const results = await checkAllRules(rules, root);
    const r = byBasename(results, 'multiple-paths.md');
    expect(r.status).toBe(RuleStatus.OK);
    const matched = norm(r.matchedFiles);
    expect(matched).toContain('src/app.ts');
    expect(matched).toContain('lib/helper.js');
    expect(matched).toContain('tests/app.test.ts');
  });
});

describe('test-project-3', () => {
  const root = path.join(repoRoot, 'test-project-3');

  it('invalid-yaml.md → WARNING', async () => {
    const rules = await parseAllRules(root);
    const results = await checkAllRules(rules, root);
    const r = byBasename(results, 'invalid-yaml.md');
    expect(r.status).toBe(RuleStatus.WARNING);
  });

  it('empty-paths.md → WARNING', async () => {
    const rules = await parseAllRules(root);
    const results = await checkAllRules(rules, root);
    const r = byBasename(results, 'empty-paths.md');
    expect(r.status).toBe(RuleStatus.WARNING);
  });

  it('non-array-paths.md → OK, matches src/test.ts', async () => {
    const rules = await parseAllRules(root);
    const results = await checkAllRules(rules, root);
    const r = byBasename(results, 'non-array-paths.md');
    expect(r.status).toBe(RuleStatus.OK);
    expect(norm(r.matchedFiles)).toContain('src/test.ts');
  });

  it('mixed-types.md → WARNING, but matches src/test.ts', async () => {
    const rules = await parseAllRules(root);
    const results = await checkAllRules(rules, root);
    const r = byBasename(results, 'mixed-types.md');
    expect(r.status).toBe(RuleStatus.WARNING);
    expect(norm(r.matchedFiles)).toContain('src/test.ts');
  });

  it('whitespace-frontmatter.md → OK, matches src/test.ts', async () => {
    const rules = await parseAllRules(root);
    const results = await checkAllRules(rules, root);
    const r = byBasename(results, 'whitespace-frontmatter.md');
    expect(r.status).toBe(RuleStatus.OK);
    expect(norm(r.matchedFiles)).toContain('src/test.ts');
  });
});
