import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { glob } from 'glob';
import { parse as parseYaml } from 'yaml';
import type { RuleFile, RuleFrontmatter } from './types.js';

const FRONTMATTER_REGEX = /^\s*---\s*\n([\s\S]*?)\n---/;

export async function findRuleFiles(rootDir: string): Promise<string[]> {
  const files = await glob('.claude/rules/**/*.md', {
    cwd: rootDir,
    nodir: true,
    absolute: true
  });
  return files;
}

export async function parseRuleFile(filePath: string): Promise<RuleFile> {
  const content = await readFile(filePath, 'utf-8');
  const result = extractFrontmatter(content);

  return {
    filePath,
    frontmatter: result.frontmatter,
    parseError: result.parseError,
  };
}

function extractFrontmatter(content: string): {
  frontmatter: RuleFrontmatter | null;
  parseError?: string
} {
  const match = content.match(FRONTMATTER_REGEX);

  if (!match) {
    // No frontmatter found - this is a normal global rule
    return { frontmatter: null };
  }

  try {
    const parsed = parseYaml(match[1]);
    return { frontmatter: parsed as RuleFrontmatter };
  } catch (error) {
    // Frontmatter found but YAML parsing failed
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      frontmatter: null,
      parseError: `YAML parse error: ${errorMessage}`
    };
  }
}

export async function parseAllRules(rootDir: string): Promise<RuleFile[]> {
  const filePaths = await findRuleFiles(rootDir);
  const rules = await Promise.all(
    filePaths.map(filePath => parseRuleFile(filePath))
  );
  return rules;
}
