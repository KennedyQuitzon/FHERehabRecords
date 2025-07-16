# CI/CD Documentation

Complete guide for the Continuous Integration and Continuous Deployment pipeline.

## Table of Contents

- [Overview](#overview)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Code Quality Tools](#code-quality-tools)
- [Running CI Locally](#running-ci-locally)
- [Configuration Files](#configuration-files)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses GitHub Actions for automated CI/CD with the following features:

- ✅ **Automated Testing** on push/PR to main/develop
- ✅ **Multi-Version Testing** (Node.js 18.x, 20.x)
- ✅ **Code Quality Checks** (Solhint, ESLint, Prettier)
- ✅ **Test Coverage** with Codecov integration
- ✅ **Gas Usage Analysis**
- ✅ **Security Auditing**
- ✅ **Contract Size Monitoring**

## GitHub Actions Workflows

### Main CI/CD Pipeline (`.github/workflows/test.yml`)

Triggers on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

#### Jobs

**1. Lint Job**
- Runs Prettier format check
- Runs ESLint on JavaScript files
- Runs Solhint on Solidity contracts

**2. Test Job**
- Matrix strategy: Node.js 18.x and 20.x
- Compiles smart contracts
- Runs full test suite
- Generates coverage report
- Uploads coverage to Codecov

**3. Build Job**
- Compiles contracts
- Checks contract sizes
- Depends on lint and test jobs passing

**4. Security Job**
- Runs npm audit
- Runs Slither static analysis (if available)

### Pull Request Checks (`.github/workflows/pr-checks.yml`)

Triggers on:
- Pull request opened, synchronized, or reopened

#### Jobs

**1. PR Validation**
- Checks for console.log in contracts
- Validates NatSpec documentation
- Runs tests
- Generates coverage report

**2. Gas Analysis**
- Generates gas usage report
- Comments report on PR automatically

## Code Quality Tools

### Solhint (Solidity Linter)

Configuration: `.solhint.json`

Rules enforced:
- Code complexity ≤ 10
- Compiler version ^0.8.0
- Function visibility explicitly set
- Max line length 120 characters
- Proper naming conventions
- Security best practices

```bash
# Run Solhint
npm run lint:sol

# Auto-fix issues
npm run lint:sol:fix
```

### ESLint (JavaScript Linter)

Configuration: `.eslintrc.json`

Rules enforced:
- No unused variables
- Consistent code style
- ES2021 features
- Mocha test environment
- Double quotes
- Semicolons required

```bash
# Run ESLint
npm run lint:js

# Auto-fix issues
npm run lint:js:fix
```

### Prettier (Code Formatter)

Configuration: `.prettierrc.json`

Features:
- Consistent code formatting
- 120 character line width
- 2-space indentation for JS
- 4-space indentation for Solidity
- Trailing commas in ES5
- LF line endings

```bash
# Format all files
npm run prettier

# Check formatting
npm run prettier:check
```

### Combined Linting

```bash
# Run all linters
npm run lint

# Fix all auto-fixable issues
npm run lint:fix

# Format and fix everything
npm run format
```

## Running CI Locally

### Prerequisites

```bash
# Install dependencies
npm install
```

### Run Complete CI Pipeline Locally

```bash
# 1. Code quality checks
npm run prettier:check
npm run lint

# 2. Compile contracts
npm run compile

# 3. Run tests
npm test

# 4. Generate coverage
npm run coverage

# 5. Check contract sizes
npm run size-contracts

# 6. Security audit
npm audit
```

### Quick Pre-Commit Check

```bash
# Format and lint
npm run format

# Test
npm test
```

## Configuration Files

### `.github/workflows/test.yml`

Main CI/CD pipeline configuration.

**Key Features:**
- Multi-version Node.js testing
- Parallel job execution
- Code coverage upload
- Security scanning

### `.github/workflows/pr-checks.yml`

Pull request specific checks.

**Key Features:**
- Contract validation
- Gas usage reporting
- Automated PR comments

### `.solhint.json`

Solidity linting configuration.

**Customization:**
Edit rules in the `rules` section:
```json
{
  "rules": {
    "code-complexity": ["error", 10],
    "max-line-length": ["warn", 120]
  }
}
```

### `.eslintrc.json`

JavaScript linting configuration.

**Customization:**
Add project-specific rules:
```json
{
  "rules": {
    "no-console": "off",
    "prefer-const": "warn"
  }
}
```

### `.prettierrc.json`

Code formatting configuration.

**Customization:**
Adjust formatting preferences:
```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "semi": true
}
```

### `codecov.yml`

Code coverage configuration.

**Settings:**
- Target coverage: 80%
- Threshold: 2% for project, 5% for patches
- Comments on PRs enabled

## Codecov Integration

### Setup

1. **Sign up** at [codecov.io](https://codecov.io)
2. **Add repository** to Codecov
3. **Get token** from Codecov dashboard
4. **Add token** to GitHub repository secrets:
   - Go to repository Settings → Secrets and variables → Actions
   - Add new secret: `CODECOV_TOKEN`
   - Paste your Codecov token

### Coverage Badges

Add to README.md:

```markdown
[![codecov](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/username/repo)
```

### Viewing Reports

- **Online**: Visit codecov.io dashboard
- **Local**: Open `coverage/index.html` after running `npm run coverage`

## Contract Size Monitoring

Check contract sizes to ensure they stay under the 24KB limit:

```bash
npm run size-contracts
```

Output example:
```
┌─────────────────────────┬──────────┬────────┐
│ Contract                │ Size     │ Margin │
├─────────────────────────┼──────────┼────────┤
│ PrivateRehabRecords     │ 12.34 KB │ 11.66  │
└─────────────────────────┴──────────┴────────┘
```

## Gas Reporting

### Local Gas Reports

```bash
REPORT_GAS=true npm test
```

Report saved to `gas-report.txt`.

### CI Gas Reports

Gas reports are automatically:
- Generated on every PR
- Posted as PR comments
- Saved as artifacts

## Security Auditing

### NPM Audit

Automatically runs in CI, or run locally:

```bash
npm audit

# Fix automatically (if possible)
npm audit fix
```

### Slither (Optional)

Install Slither for static analysis:

```bash
pip install slither-analyzer
slither .
```

## Troubleshooting

### CI Failures

#### Linting Failures

```bash
# Check what's failing
npm run lint

# Auto-fix most issues
npm run lint:fix
```

#### Test Failures

```bash
# Run tests locally
npm test

# Run specific test
npx hardhat test test/PrivateRehabRecords.test.js
```

#### Coverage Failures

```bash
# Generate coverage locally
npm run coverage

# View HTML report
open coverage/index.html
```

### Common Issues

#### 1. "Prettier check failed"

```bash
# Format all files
npm run prettier
```

#### 2. "Solhint errors"

```bash
# See errors
npm run lint:sol

# Try auto-fix
npm run lint:sol:fix
```

#### 3. "ESLint errors"

```bash
# See errors
npm run lint:js

# Try auto-fix
npm run lint:js:fix
```

#### 4. "Node version mismatch"

Ensure you're using Node.js 18.x or 20.x:

```bash
node --version
```

Use nvm to switch versions:

```bash
nvm use 20
```

#### 5. "Codecov upload failed"

- Check `CODECOV_TOKEN` is set in GitHub secrets
- Verify coverage file exists: `coverage/lcov.info`
- Check Codecov dashboard for errors

### Local Pre-Commit Hook

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run format
npm test
```

Install Husky:

```bash
npm install --save-dev husky
npx husky install
```

## Best Practices

### Before Pushing

1. **Format code**: `npm run format`
2. **Run tests**: `npm test`
3. **Check coverage**: `npm run coverage`
4. **Review changes**: `git diff`

### Before Creating PR

1. **Update from main**: `git pull origin main`
2. **Run full CI locally**: Follow [Running CI Locally](#running-ci-locally)
3. **Check contract sizes**: `npm run size-contracts`
4. **Review gas costs**: `REPORT_GAS=true npm test`

### Writing Tests

- Maintain >95% coverage
- Test all edge cases
- Use descriptive test names
- Follow existing patterns

### Code Quality

- Follow Solidity style guide
- Use NatSpec comments
- Keep functions small (<50 lines)
- Limit contract complexity

## Continuous Improvement

### Monitoring

- **Coverage Trends**: Check Codecov dashboard weekly
- **Gas Costs**: Review gas reports on PRs
- **Security**: Address npm audit warnings
- **Test Suite**: Keep tests fast (<2 minutes)

### Updating Tools

```bash
# Check for outdated packages
npm outdated

# Update dev dependencies
npm update --save-dev
```

### Adding New Checks

1. Add check to workflow file
2. Test locally first
3. Update this documentation
4. Announce to team

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Codecov Documentation](https://docs.codecov.com/)

---

**Status**: ✅ Fully Configured and Operational

*Last Updated: 2024*
