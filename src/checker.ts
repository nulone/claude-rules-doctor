import { glob } from 'glob';
import type { RuleFile, RuleCheckResult, RuleStatus } from './types.js';
import { RuleStatus as Status } from './types.js';

export async function checkRule(
  rule: RuleFile,
  rootDir: string
): Promise<RuleCheckResult> {
  // Global rule (no paths specified)
  if (!rule.frontmatter || !rule.frontmatter.paths) {
    return {
      rule,
      status: Status.OK,
      matchedFiles: [],
      message: 'Global rule (no paths specified)',
    };
  }

  const paths = rule.frontmatter.paths;

  if (!Array.isArray(paths) || paths.length === 0) {
    return {
      rule,
      status: Status.OK,
      matchedFiles: [],
      message: 'No valid paths array',
    };
  }

  // Filter out non-string values and warn about them
  const invalidPaths: unknown[] = [];
  const validPaths: string[] = [];

  for (const path of paths) {
    if (typeof path === 'string') {
      validPaths.push(path);
    } else {
      invalidPaths.push(path);
    }
  }

  // If there are non-string values, return WARNING
  if (invalidPaths.length > 0) {
    const invalidTypes = invalidPaths
      .map(p => (p === null ? 'null' : typeof p))
      .join(', ');
    return {
      rule,
      status: Status.WARNING,
      matchedFiles: [],
      message: `Invalid types in paths array: ${invalidTypes}. Only strings are allowed.`,
    };
  }

  // Check each glob pattern
  const allMatches = new Set<string>();

  for (const pattern of validPaths) {
    try {
      const matches = await glob(pattern, {
        cwd: rootDir,
        nodir: true,
        ignore: ['node_modules/**', '.git/**'],
      });
      matches.forEach(file => allMatches.add(file));
    } catch (error) {
      // Invalid glob pattern - treat as no matches
      continue;
    }
  }

  const matchedFiles = Array.from(allMatches).sort();

  if (matchedFiles.length === 0) {
    return {
      rule,
      status: Status.DEAD,
      matchedFiles: [],
      message: 'No files match the specified paths',
    };
  }

  // For now, we don't detect platform bugs, so just return OK
  return {
    rule,
    status: Status.OK,
    matchedFiles,
    message: `Matches ${matchedFiles.length} file(s)`,
  };
}

export async function checkAllRules(
  rules: RuleFile[],
  rootDir: string
): Promise<RuleCheckResult[]> {
  return Promise.all(rules.map(rule => checkRule(rule, rootDir)));
}
