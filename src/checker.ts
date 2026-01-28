import { glob } from 'glob';
import type { RuleFile, RuleCheckResult, RuleStatus } from './types.js';
import { RuleStatus as Status } from './types.js';

export async function checkRule(
  rule: RuleFile,
  rootDir: string
): Promise<RuleCheckResult> {
  // Check for parse errors first
  if (rule.parseError) {
    return {
      rule,
      status: Status.WARNING,
      matchedFiles: [],
      message: rule.parseError,
    };
  }

  // Global rule (no paths specified)
  if (!rule.frontmatter || !rule.frontmatter.paths) {
    return {
      rule,
      status: Status.OK,
      matchedFiles: [],
      message: 'Global rule (no paths specified)',
    };
  }

  let paths = rule.frontmatter.paths;

  // Handle paths as string - convert to array
  if (typeof paths === 'string') {
    paths = [paths];
  }

  // Check if paths is empty array
  if (!Array.isArray(paths)) {
    return {
      rule,
      status: Status.WARNING,
      matchedFiles: [],
      message: 'Invalid paths type (must be string or array)',
    };
  }

  if (paths.length === 0) {
    return {
      rule,
      status: Status.WARNING,
      matchedFiles: [],
      message: 'Empty paths array',
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

  // Check each glob pattern
  const allMatches = new Set<string>();
  const globErrors: string[] = [];

  for (const pattern of validPaths) {
    try {
      const matches = await glob(pattern, {
        cwd: rootDir,
        nodir: true,
        ignore: ['node_modules/**', '.git/**'],
      });
      matches.forEach(file => allMatches.add(file));
    } catch (error) {
      // Invalid glob pattern - collect error
      const errorMsg = error instanceof Error ? error.message : String(error);
      globErrors.push(`"${pattern}": ${errorMsg}`);
    }
  }

  // If all patterns failed, return WARNING with collected errors
  if (globErrors.length > 0 && allMatches.size === 0) {
    return {
      rule,
      status: Status.WARNING,
      matchedFiles: [],
      message: `Invalid glob pattern(s): ${globErrors.join('; ')}`,
    };
  }

  const matchedFiles = Array.from(allMatches).sort();

  // If there are non-string values, return WARNING (but with matched files if any)
  if (invalidPaths.length > 0) {
    const invalidTypes = invalidPaths
      .map(p => (p === null ? 'null' : typeof p))
      .join(', ');
    return {
      rule,
      status: Status.WARNING,
      matchedFiles,
      message: `Invalid types in paths array: ${invalidTypes}. Only strings are allowed.`,
    };
  }

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
