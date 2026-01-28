import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { glob } from 'glob';
import { parse as parseYaml } from 'yaml';
import type { RuleFile, RuleFrontmatter } from './types.js';

const FRONTMATTER_REGEX = /^\s*---\s*\n([\s\S]*?)\n---/;

export async function findRuleFiles(rootDir: string): Promise<string[]> {
  const pattern = `${rootDir}/.claude/rules/**/*.md`;
  const files = await glob(pattern, { nodir: true });
  return files;
}

export async function parseRuleFile(filePath: string): Promise<RuleFile> {
  const content = await readFile(filePath, 'utf-8');
  const frontmatter = extractFrontmatter(content);

  return {
    filePath,
    frontmatter,
  };
}

function extractFrontmatter(content: string): RuleFrontmatter | null {
  const match = content.match(FRONTMATTER_REGEX);

  if (!match) {
    return null;
  }

  try {
    const parsed = parseYaml(match[1]);
    return parsed as RuleFrontmatter;
  } catch (error) {
    return null;
  }
}

export async function parseAllRules(rootDir: string): Promise<RuleFile[]> {
  const filePaths = await findRuleFiles(rootDir);
  const rules = await Promise.all(
    filePaths.map(filePath => parseRuleFile(filePath))
  );
  return rules;
}
