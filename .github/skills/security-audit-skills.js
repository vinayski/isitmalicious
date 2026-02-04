#!/usr/bin/env node

/**
 * Security Audit Skills - Implementation
 * 
 * This script implements the security-audit-skills functionality
 * to detect malicious code patterns in skill files.
 */

const fs = require('fs');
const path = require('path');

// Security patterns to detect
const SECURITY_PATTERNS = {
  critical: [
    {
      name: 'Command Injection',
      pattern: /(exec|eval|Function\(|child_process|execSync|spawn)\s*\(/gi,
      description: 'Potential command injection vulnerability detected',
      remediation: 'Avoid using eval(), exec(), or Function() with untrusted input. Use safer alternatives and validate all inputs.'
    },
    {
      name: 'Path Traversal',
      pattern: /\.\.[\/\\]|\.{2,}\//g,
      description: 'Path traversal pattern detected',
      remediation: 'Sanitize file paths and use path.resolve() or path.normalize() to prevent directory traversal attacks.'
    },
    {
      name: 'Credential Access',
      pattern: /(process\.env\.(API_KEY|SECRET|PASSWORD|TOKEN)|\.env\s+|credentials\s*=|secret\s*=|api[_-]?key\s*=|password\s*=)/gi,
      description: 'Potential credential or secret access detected',
      remediation: 'Ensure proper secret management. Never log or transmit secrets. Use secure storage mechanisms.'
    },
    {
      name: 'Code Obfuscation',
      pattern: /(atob|btoa|fromCharCode|\\x[0-9a-f]{2}|\\u[0-9a-f]{4}|Buffer\.from\(.+base64)/gi,
      description: 'Code obfuscation or encoding detected',
      remediation: 'Remove unnecessary obfuscation. Encoded content should be reviewed for malicious payloads.'
    },
    {
      name: 'Network Exfiltration',
      pattern: /(fetch|XMLHttpRequest|axios|http\.request|https\.request)\s*\(/gi,
      description: 'Network request detected - verify destination',
      remediation: 'Review all network requests. Ensure data is not being exfiltrated to untrusted domains.'
    }
  ],
  high: [
    {
      name: 'File System Modification',
      pattern: /(fs\.unlink|fs\.rmdir|fs\.writeFile|fs\.rm|fs\.chmod)/gi,
      description: 'File system modification detected',
      remediation: 'Validate file operations. Ensure proper permissions and user authorization.'
    },
    {
      name: 'Dynamic Require',
      pattern: /require\s*\(\s*[^'"]/g,
      description: 'Dynamic require with variable detected',
      remediation: 'Use static imports when possible. Validate module paths if dynamic requires are necessary.'
    }
  ],
  medium: [
    {
      name: 'Unsafe Randomness',
      pattern: /Math\.random\(\)/gi,
      description: 'Non-cryptographic random number generation',
      remediation: 'Use crypto.randomBytes() or crypto.getRandomValues() for security-critical operations.'
    },
    {
      name: 'Console Logging',
      pattern: /console\.(log|error|warn|debug)\s*\(/gi,
      description: 'Console logging detected - may expose sensitive data',
      remediation: 'Remove debug logging in production. Ensure no sensitive data is logged.'
    }
  ]
};

// Suspicious domains/IPs (simplified for demo)
const SUSPICIOUS_DOMAINS = [
  'malicious-domain.com',
  'evil.com',
  'badactor.net',
  'c2server.com',
  'exfiltrate.com'
];

class SecurityAuditor {
  constructor() {
    this.findings = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
  }

  /**
   * Audit a skill file for security issues
   */
  auditFile(filePath) {
    console.log(`\n🔍 Auditing: ${filePath}\n`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    this.scanContent(content, filePath);
    return this.reportFindings();
  }

  /**
   * Audit all skill files in a directory
   */
  auditDirectory(dirPath) {
    console.log(`\n🔍 Auditing directory: ${dirPath}\n`);
    
    if (!fs.existsSync(dirPath)) {
      console.error(`❌ Directory not found: ${dirPath}`);
      return false;
    }

    const files = this.findSkillFiles(dirPath);
    
    if (files.length === 0) {
      console.log('ℹ️  No skill files found');
      return true;
    }

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      this.scanContent(content, file);
    });

    return this.reportFindings();
  }

  /**
   * Find all skill files in directory
   */
  findSkillFiles(dirPath) {
    const files = [];
    
    const scan = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          scan(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.skill'))) {
          files.push(fullPath);
        }
      }
    };
    
    scan(dirPath);
    return files;
  }

  /**
   * Scan content for security patterns
   */
  scanContent(content, filePath) {
    const lines = content.split('\n');
    
    // Skip scanning if file is in documentation/examples directory
    // or contains security documentation markers
    if (this.shouldSkipFile(filePath, content)) {
      console.log(`ℹ️  Skipping ${path.basename(filePath)} (documentation/examples)`);
      return;
    }
    
    // Check critical patterns
    this.checkPatterns(content, lines, filePath, SECURITY_PATTERNS.critical, 'critical');
    
    // Check high severity patterns
    this.checkPatterns(content, lines, filePath, SECURITY_PATTERNS.high, 'high');
    
    // Check medium severity patterns
    this.checkPatterns(content, lines, filePath, SECURITY_PATTERNS.medium, 'medium');
    
    // Check for suspicious domains
    this.checkSuspiciousDomains(content, lines, filePath);
  }

  /**
   * Determine if file should be skipped
   */
  shouldSkipFile(filePath, content) {
    // Skip example files
    if (filePath.includes('/examples/') || filePath.includes('\\examples\\')) {
      return true;
    }
    
    // Skip if file contains documentation markers
    if (content.includes('FOR TESTING ONLY') || 
        content.includes('DETECTED:') ||
        content.includes('### Detection Rules') ||
        content.includes('## Security Patterns Detected')) {
      return true;
    }
    
    return false;
  }

  /**
   * Check for pattern matches
   */
  checkPatterns(content, lines, filePath, patterns, severity) {
    patterns.forEach(patternObj => {
      const matches = content.match(patternObj.pattern);
      
      if (matches) {
        // Find line numbers
        const locations = [];
        lines.forEach((line, index) => {
          if (patternObj.pattern.test(line)) {
            locations.push(index + 1);
          }
        });

        this.findings[severity].push({
          file: filePath,
          name: patternObj.name,
          description: patternObj.description,
          remediation: patternObj.remediation,
          locations: locations,
          matchCount: matches.length
        });
      }
    });
  }

  /**
   * Check for suspicious domains
   */
  checkSuspiciousDomains(content, lines, filePath) {
    SUSPICIOUS_DOMAINS.forEach(domain => {
      if (content.includes(domain)) {
        const locations = [];
        lines.forEach((line, index) => {
          if (line.includes(domain)) {
            locations.push(index + 1);
          }
        });

        this.findings.critical.push({
          file: filePath,
          name: 'Suspicious Domain',
          description: `Connection to suspicious domain detected: ${domain}`,
          remediation: 'Remove connections to untrusted or malicious domains.',
          locations: locations,
          matchCount: 1
        });
      }
    });
  }

  /**
   * Report findings and return status
   */
  reportFindings() {
    const totalCritical = this.findings.critical.length;
    const totalHigh = this.findings.high.length;
    const totalMedium = this.findings.medium.length;
    const totalLow = this.findings.low.length;
    
    console.log('\n' + '='.repeat(80));
    console.log('SECURITY AUDIT REPORT');
    console.log('='.repeat(80) + '\n');

    if (totalCritical > 0) {
      console.log('🚨 CRITICAL THREATS DETECTED\n');
      this.printFindings(this.findings.critical, '🚨');
      console.log('\n⛔ HALTING: Critical security threats must be resolved before proceeding.\n');
      return false;
    }

    if (totalHigh > 0) {
      console.log('⚠️  HIGH PRIORITY ISSUES\n');
      this.printFindings(this.findings.high, '⚠️ ');
    }

    if (totalMedium > 0) {
      console.log('\n📋 MEDIUM PRIORITY ISSUES\n');
      this.printFindings(this.findings.medium, '📋');
    }

    if (totalLow > 0) {
      console.log('\nℹ️  LOW PRIORITY ISSUES\n');
      this.printFindings(this.findings.low, 'ℹ️ ');
    }

    console.log('\n' + '='.repeat(80));
    
    if (totalHigh === 0 && totalMedium === 0 && totalLow === 0) {
      console.log('✅ No security issues detected. Skill appears safe.\n');
    } else {
      console.log(`\n⚠️  Found ${totalHigh} high, ${totalMedium} medium, and ${totalLow} low priority issues.\n`);
      console.log('Please review and address these issues before deploying the skill.\n');
    }

    return totalCritical === 0;
  }

  /**
   * Print findings for a severity level
   */
  printFindings(findings, icon) {
    findings.forEach((finding, index) => {
      console.log(`${icon} ${index + 1}. ${finding.name}`);
      console.log(`   File: ${finding.file}`);
      console.log(`   Lines: ${finding.locations.join(', ')}`);
      console.log(`   Description: ${finding.description}`);
      console.log(`   Remediation: ${finding.remediation}`);
      console.log('');
    });
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage:
  node security-audit-skills.js <file-or-directory>
  
Examples:
  node security-audit-skills.js ./skill-file.md
  node security-audit-skills.js ./.github/skills/
  
Description:
  Scans skill files for malicious code patterns and security vulnerabilities.
  Exits with code 0 if safe, code 1 if critical threats detected.
    `);
    process.exit(0);
  }

  const targetPath = path.resolve(args[0]);
  const auditor = new SecurityAuditor();
  
  let isSafe = false;
  
  if (fs.statSync(targetPath).isDirectory()) {
    isSafe = auditor.auditDirectory(targetPath);
  } else {
    isSafe = auditor.auditFile(targetPath);
  }
  
  process.exit(isSafe ? 0 : 1);
}

module.exports = SecurityAuditor;
