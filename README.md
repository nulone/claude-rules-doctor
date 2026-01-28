Catch dead Claude rules before they silently do nothing.

# 🩺 claude-rules-doctor

CLI that verifies `.claude/rules/*.md` `paths:` globs actually match files in your project.

## Quickstart

```bash
# One-off
npx claude-rules-doctor check --root .

# Or install globally
npm install -g claude-rules-doctor
rules-doctor check --root .
```

## Problem

Claude rules with `paths:` frontmatter can silently fail if:
- The glob pattern doesn't match any files
- File paths changed after the rule was created
- Typos in glob patterns

This tool scans all your rules and tells you which ones are "dead" (not applying to any files).

## Usage

### Check current project

```bash
rules-doctor check
```

### CI mode (exit 1 if dead rules found)

```bash
rules-doctor check --ci
```

### JSON output

```bash
rules-doctor check --json
```

### Verbose mode (show matched files)

```bash
rules-doctor check --verbose
```

### Check specific directory

```bash
rules-doctor check --root /path/to/project
```

## Output

- ✅ **OK** — Rule is global (no paths) or paths match files
- ⚠️ **WARNING** — Rule misconfigured: invalid YAML frontmatter, empty paths array, invalid types in paths, or invalid glob patterns
- ❌ **DEAD** — Paths specified, but 0 files match

### WARNING triggers

A rule gets WARNING status when:
- Invalid YAML in frontmatter
- Empty paths array (`paths: []`)
- Non-string values in paths (numbers, booleans, null)
- Invalid glob patterns

## Example output (test-suite/6-mixed)

```bash
$ rules-doctor check

🔍 Rules Doctor - Check Results

✅ OK      <root>/.claude/rules/valid.md
  Matches 1 file(s)

✅ OK      <root>/.claude/rules/global.md
  Global rule (no paths specified)

❌ DEAD    <root>/.claude/rules/dead.md
  No files match the specified paths

Summary:
  Total rules: 3
  ✅ OK: 2
  ⚠️  WARNING: 0
  ❌ DEAD: 1

⚠️  Found 1 dead rule(s). These rules won't apply to any files.
```

## CI (GitHub Actions)

```yaml
name: rules-doctor
on: [push, pull_request]

jobs:
  rules:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx claude-rules-doctor check --ci
```

## Why not cclint?

cclint validates frontmatter schema. We validate reality: do your globs actually match files in your repo?

## License

MIT
