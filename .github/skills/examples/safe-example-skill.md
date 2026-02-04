---
name: safe-example-skill
description: A safe example skill demonstrating secure coding practices
---

# Safe Example Skill

This is an example of a secure skill that follows security best practices.

## Safe Practices Demonstrated

### Static Imports
```javascript
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
```

### Secure File Operations
```javascript
// Safe file reading with path validation
function readFileSafely(fileName) {
  // Normalize and validate the path
  const safeFileName = path.basename(fileName);
  const safePath = path.join(__dirname, 'data', safeFileName);
  
  // Check if path is within allowed directory
  if (!safePath.startsWith(path.join(__dirname, 'data'))) {
    throw new Error('Invalid file path');
  }
  
  return fs.readFileSync(safePath, 'utf-8');
}
```

### Input Validation
```javascript
function validateInput(userInput) {
  // Whitelist validation
  const allowedPattern = /^[a-zA-Z0-9_-]+$/;
  
  if (!allowedPattern.test(userInput)) {
    throw new Error('Invalid input format');
  }
  
  return userInput;
}
```

### Secure Random Generation
```javascript
// Use cryptographically secure random for tokens
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}
```

### Safe Data Processing
```javascript
function processData(data) {
  // Parse and validate JSON safely
  try {
    const parsed = JSON.parse(data);
    
    // Validate required fields
    if (!parsed.name || !parsed.value) {
      throw new Error('Missing required fields');
    }
    
    return {
      name: String(parsed.name).slice(0, 100),
      value: Number(parsed.value)
    };
  } catch (error) {
    throw new Error('Invalid data format');
  }
}
```

### Secure Configuration
```javascript
const config = {
  maxFileSize: 1024 * 1024, // 1MB
  allowedExtensions: ['.txt', '.md', '.json'],
  timeout: 5000
};
```

## Security Features

1. **Input Validation**: All user inputs are validated before processing
2. **Path Sanitization**: File paths are normalized and checked
3. **Error Handling**: Proper error handling without exposing sensitive info
4. **Secure Defaults**: Conservative security settings
5. **No External Dependencies**: Minimal attack surface

This skill demonstrates secure coding practices and should pass security audits.
