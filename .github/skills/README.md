# GitHub Copilot Skills - Security Audit

This directory contains GitHub Copilot skills for security auditing.

## Available Skills

### security-audit-skills

A comprehensive security auditing skill that detects malicious code patterns and security vulnerabilities in skill files.

**File**: `security-audit-skills.md`

**Usage**:
- Audit skills before installation
- Check skill security for untrusted sources
- Scan for malicious code patterns
- Verify the safety of third-party skills

**Triggers**:
- "audit skills"
- "check skill security"
- "scan for malicious code"
- "security review"

## Implementation

### security-audit-skills.js

Node.js implementation of the security auditing functionality.

**Installation**:
```bash
chmod +x .github/skills/security-audit-skills.js
```

**Usage**:
```bash
# Audit a single skill file
node .github/skills/security-audit-skills.js path/to/skill.md

# Audit all skills in a directory
node .github/skills/security-audit-skills.js .github/skills/

# Use in CI/CD
node .github/skills/security-audit-skills.js .github/skills/ || exit 1
```

**Exit Codes**:
- `0`: No critical issues found (safe to proceed)
- `1`: Critical security threats detected (halt installation)

## Examples

The `examples/` directory contains sample skills:

- **safe-example-skill.md**: Demonstrates secure coding practices
- **unsafe-example-skill.md**: Contains vulnerabilities for testing (DO NOT USE IN PRODUCTION)

## Security Patterns Detected

### Critical Threats
- Command injection (eval, exec, Function)
- Path traversal (../, directory manipulation)
- Credential theft (environment variables, secret access)
- Code obfuscation (base64, encoding)
- Network exfiltration (suspicious domains)

### High Priority
- File system modifications (unlink, rmdir, chmod)
- Dynamic require with variables

### Medium Priority
- Unsafe randomness (Math.random for security)
- Console logging (potential data exposure)

## Testing

Test the security auditor with the example files:

```bash
# Should pass - no critical issues
node .github/skills/security-audit-skills.js .github/skills/examples/safe-example-skill.md

# Should fail - critical issues detected
node .github/skills/security-audit-skills.js .github/skills/examples/unsafe-example-skill.md
```

## Integration

### GitHub Actions

```yaml
name: Security Audit Skills

on: [pull_request, push]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Audit Skills
        run: node .github/skills/security-audit-skills.js .github/skills/
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running security audit..."
node .github/skills/security-audit-skills.js .github/skills/

if [ $? -ne 0 ]; then
  echo "❌ Security audit failed. Commit blocked."
  exit 1
fi

echo "✅ Security audit passed"
```

## Contributing

To add new security patterns:

1. Identify the malicious pattern
2. Add it to `SECURITY_PATTERNS` in `security-audit-skills.js`
3. Create a test case in the examples directory
4. Document the pattern in `security-audit-skills.md`
5. Test the detection

## License

Same as the parent repository.
