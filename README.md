# isitmalicious

A GitHub Copilot skill for detecting malicious code and security vulnerabilities in skills and code.

## Features

### Security Audit Skills

The **security-audit-skills** is a comprehensive security auditing tool that:

- ✅ Detects malicious code patterns in skill files
- ✅ Identifies security vulnerabilities before skill installation
- ✅ Halts execution when critical threats are detected
- ✅ Provides actionable security recommendations
- ✅ Integrates with CI/CD pipelines

## Quick Start

### Using the Skill

Trigger the security audit with natural language commands:

```
@workspace audit skills
@workspace check skill security
@workspace scan for malicious code
```

### Command Line Usage

```bash
# Audit a single skill file
node .github/skills/security-audit-skills.js path/to/skill.md

# Audit all skills in a directory
node .github/skills/security-audit-skills.js .github/skills/

# Use in scripts (exits with code 1 on critical issues)
node .github/skills/security-audit-skills.js .github/skills/ || exit 1
```

## What It Detects

### Critical Threats (Immediate Halt)

- **Command Injection**: `eval()`, `exec()`, unsafe command execution
- **Path Traversal**: `../../../`, unauthorized file access
- **Credential Theft**: Environment variable access, secret exposure
- **Code Obfuscation**: Base64 encoding, character encoding tricks
- **Network Exfiltration**: Suspicious outbound connections, data theft
- **Malicious Domains**: Connections to known bad actors

### High Priority Issues

- File system modifications (delete, chmod)
- Dynamic module loading with untrusted input

### Medium Priority Issues

- Weak random number generation for security
- Console logging that may expose sensitive data

## Examples

See `.github/skills/examples/` for:

- **safe-example-skill.md**: Demonstrates secure coding practices
- **unsafe-example-skill.md**: Contains vulnerabilities (for testing only)

## CI/CD Integration

The repository includes a GitHub Actions workflow that automatically audits skills on every push or pull request. See `.github/workflows/security-audit.yml`.

## Documentation

Full documentation available in `.github/skills/`:

- **security-audit-skills.md**: Detailed skill documentation
- **README.md**: Implementation guide and usage examples

## Testing

```bash
# Test with safe skill (should pass)
node .github/skills/security-audit-skills.js .github/skills/examples/safe-example-skill.md

# Test with unsafe skill (should fail)
node .github/skills/security-audit-skills.js .github/skills/examples/unsafe-example-skill.md
```

## Contributing

Contributions welcome! To add new detection patterns:

1. Identify the malicious pattern
2. Add it to `SECURITY_PATTERNS` in `security-audit-skills.js`
3. Create a test case
4. Document the pattern
5. Submit a PR

## License

MIT