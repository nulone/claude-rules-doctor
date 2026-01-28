export interface RuleFrontmatter {
  paths?: string[];
  [key: string]: unknown;
}

export interface RuleFile {
  filePath: string;
  frontmatter: RuleFrontmatter | null;
}

export enum RuleStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  DEAD = 'DEAD',
}

export interface RuleCheckResult {
  rule: RuleFile;
  status: RuleStatus;
  matchedFiles: string[];
  message: string;
}

export interface CheckOptions {
  root: string;
  ci: boolean;
  json: boolean;
  verbose: boolean;
}

export interface CheckReport {
  totalRules: number;
  okCount: number;
  warningCount: number;
  deadCount: number;
  results: RuleCheckResult[];
}
