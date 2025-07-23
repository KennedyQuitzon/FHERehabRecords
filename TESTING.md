# Testing Documentation

Comprehensive testing guide for the Private Rehabilitation Records smart contract.

## Table of Contents

- [Test Infrastructure](#test-infrastructure)
- [Test Suite Overview](#test-suite-overview)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Test Patterns](#test-patterns)
- [Writing New Tests](#writing-new-tests)

## Test Infrastructure

### Technology Stack

- **Framework**: Hardhat ^2.19.0
- **Assertion Library**: Chai ^4.3.10
- **Test Runner**: Mocha (built into Hardhat)
- **Network Helpers**: @nomicfoundation/hardhat-network-helpers
- **Gas Reporter**: hardhat-gas-reporter
- **Coverage Tool**: solidity-coverage

### Project Structure

```
test/
├── PrivateRehabRecords.test.js          # Core test suite (30+ tests)
└── PrivateRehabRecords.expanded.test.js # Expanded test suite (45+ tests)
```

## Test Suite Overview

### Total Test Cases: 47+

The test suite covers all aspects of the contract functionality:

#### 1. Deployment and Initialization (5 tests)
- Contract deployment with correct owner
- Record counter initialization
- Initial state validation
- Contract address verification
- Default authorization states

#### 2. Therapist Authorization (8 tests)
- Owner authorization of therapists
- License number storage
- Authorization revocation
- Access control enforcement
- Multiple therapist management
- Timestamp tracking
- Re-authorization scenarios
- Edge cases (empty license)

#### 3. Patient Registration (8 tests)
- Patient registration workflow
- Therapist assignment
- Access control validation
- Multiple patient handling
- Cross-therapist assignment
- Registration timestamps
- Session counter initialization
- Re-registration scenarios

#### 4. Record Creation (10 tests)
- Valid record creation
- Session count incrementation
- Authorization validation
- Parameter validation (intensity, pain, mobility)
- Exercise type handling
- Duration validation
- Therapist assignment verification
- Counter incrementation
- Event emission
- Edge cases

#### 5. Record Update (6 tests)
- Therapist update permissions
- Parameter validation
- Access control enforcement
- Inactive record handling
- Update event emission
- Non-therapist restriction

#### 6. Record Deactivation (4 tests)
- Therapist deactivation rights
- Owner deactivation rights
- Patient restriction
- Unauthorized access prevention

#### 7. Access Control and Queries (4 tests)
- Patient record queries
- Therapist record queries
- Metadata retrieval
- Access control enforcement

#### 8. Profile Management (Not shown - add as needed)
- Patient profile queries
- Therapist profile queries
- Profile access control

#### 9. Multiple Records Workflow (Covered in original tests)
- Sequential record creation
- Multi-patient management
- Record ID tracking

#### 10. Edge Cases (Covered throughout)
- Zero values
- Maximum values
- Non-existent records
- Boundary conditions

## Running Tests

### Basic Test Execution

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/PrivateRehabRecords.test.js

# Run with gas reporting
REPORT_GAS=true npm test

# Run tests with verbose output
npm test -- --verbose
```

### Test Coverage

```bash
# Generate coverage report
npm run coverage

# Coverage report will be generated in:
# - coverage/
# - coverage.json
```

Expected coverage metrics:
- **Statements**: > 95%
- **Branches**: > 90%
- **Functions**: 100%
- **Lines**: > 95%

### Gas Reporting

```bash
# Enable gas reporting
REPORT_GAS=true npm test

# Report will be saved to gas-report.txt
```

## Test Patterns

### Pattern 1: Deployment Fixture

Using `loadFixture` for efficient test isolation:

```javascript
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

async function deployContractFixture() {
  const [owner, user1, user2] = await ethers.getSigners();
  const Contract = await ethers.getContractFactory("PrivateRehabRecords");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  return { contract, owner, user1, user2 };
}

describe("Test Suite", function () {
  it("should test something", async function () {
    const { contract, owner } = await loadFixture(deployContractFixture);
    // Test logic here
  });
});
```

**Benefits**:
- Fast test execution (snapshot restoration)
- Isolated test environments
- No state pollution between tests

### Pattern 2: Role-Based Testing

Multiple signers for different roles:

```javascript
const [owner, therapist1, therapist2, patient1, patient2, unauthorized] =
  await ethers.getSigners();

// Test with different roles
await contract.connect(therapist1).createRecord(...);
await contract.connect(owner).authorizeTherapist(...);
```

### Pattern 3: Setup Helper Functions

Reusable setup for complex scenarios:

```javascript
async function setupTherapistAndPatient() {
  const fixture = await loadFixture(deployContractFixture);
  await fixture.contract.authorizeTherapist(fixture.therapist1.address, "LIC-123");
  await fixture.contract.registerPatient(fixture.patient1.address, fixture.therapist1.address);
  return fixture;
}

it("should create record", async function () {
  const { contract, therapist1, patient1 } = await setupTherapistAndPatient();
  // Test with pre-configured therapist and patient
});
```

### Pattern 4: Event Testing

Verifying event emission:

```javascript
await expect(contract.authorizeTherapist(therapist.address, "LIC-123"))
  .to.emit(contract, "TherapistAuthorized")
  .withArgs(therapist.address, "LIC-123");
```

### Pattern 5: Revert Testing

Testing error conditions:

```javascript
// Test for generic revert
await expect(
  contract.connect(unauthorized).ownerFunction()
).to.be.reverted;

// Test for specific revert message
await expect(
  contract.connect(unauthorized).ownerFunction()
).to.be.revertedWith("Not authorized");

// Test for custom errors (if using Solidity 0.8.4+)
await expect(
  contract.someFunction()
).to.be.revertedWithCustomError(contract, "CustomError");
```

### Pattern 6: State Verification

Checking contract state changes:

```javascript
// Get state before
const initialCount = await contract.recordCounter();

// Perform action
await contract.createRecord(...);

// Verify state change
const newCount = await contract.recordCounter();
expect(newCount).to.equal(initialCount + 1n);
```

## Writing New Tests

### Test Naming Convention

Use descriptive test names that explain the behavior:

```javascript
// ✅ Good
it("Should allow owner to authorize therapist with license number")
it("Should reject record creation when exercise intensity exceeds 100")
it("Should emit RecordCreated event when therapist creates valid record")

// ❌ Bad
it("test1")
it("works")
it("therapist test")
```

### Test Organization

Group related tests using `describe` blocks:

```javascript
describe("Feature Name", function () {
  describe("Success Cases", function () {
    it("should...", async function () {});
  });

  describe("Failure Cases", function () {
    it("should not...", async function () {});
  });

  describe("Edge Cases", function () {
    it("should handle...", async function () {});
  });
});
```

### Test Template

```javascript
describe("Feature", function () {
  // Setup fixture if needed
  async function setupFeature() {
    const fixture = await loadFixture(deployContractFixture);
    // Additional setup
    return fixture;
  }

  it("should perform expected behavior", async function () {
    // 1. Arrange - Setup test data
    const { contract, user1 } = await setupFeature();
    const testValue = 100;

    // 2. Act - Execute the function
    const tx = await contract.connect(user1).someFunction(testValue);
    await tx.wait();

    // 3. Assert - Verify results
    const result = await contract.getResult();
    expect(result).to.equal(expectedValue);
  });
});
```

## Test Quality Checklist

### For Each Feature

- [ ] Happy path test
- [ ] Access control test
- [ ] Parameter validation tests
- [ ] Edge case tests (zero, max values)
- [ ] Event emission tests
- [ ] State change verification
- [ ] Revert condition tests

### For The Entire Suite

- [ ] At least 45 test cases
- [ ] All public functions covered
- [ ] All modifiers tested
- [ ] All events tested
- [ ] > 95% code coverage
- [ ] Gas usage verified
- [ ] No skipped tests
- [ ] Clear test descriptions

## Common Testing Patterns

### Testing Access Control

```javascript
describe("Access Control", function () {
  it("should allow authorized user", async function () {
    await expect(contract.connect(authorized).protectedFunction())
      .to.not.be.reverted;
  });

  it("should reject unauthorized user", async function () {
    await expect(contract.connect(unauthorized).protectedFunction())
      .to.be.revertedWith("Not authorized");
  });
});
```

### Testing Parameter Validation

```javascript
describe("Parameter Validation", function () {
  it("should accept valid value", async function () {
    await expect(contract.setValue(50))
      .to.not.be.reverted;
  });

  it("should reject value above maximum", async function () {
    await expect(contract.setValue(101))
      .to.be.revertedWith("Value exceeds maximum");
  });

  it("should handle zero value", async function () {
    await expect(contract.setValue(0))
      .to.not.be.reverted;
  });
});
```

### Testing State Transitions

```javascript
it("should transition from inactive to active", async function () {
  // Initial state
  expect(await contract.isActive()).to.be.false;

  // Trigger transition
  await contract.activate();

  // Verify new state
  expect(await contract.isActive()).to.be.true;
});
```

## Continuous Integration

### Recommended CI Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run compile
      - run: npm test
      - run: npm run coverage
```

## Troubleshooting

### Common Issues

#### 1. Timeout Errors

```javascript
// Increase timeout for specific test
it("slow test", async function () {
  this.timeout(60000); // 60 seconds
  // Test code
});
```

#### 2. Gas Estimation Failures

Check that:
- All required parameters are provided
- Account has sufficient balance
- Contract state allows the operation

#### 3. Fixture Not Resetting

Ensure you're using `loadFixture` correctly:

```javascript
// ✅ Correct
beforeEach(async function () {
  fixture = await loadFixture(deployContractFixture);
});

// ❌ Wrong - sharing state
before(async function () {
  fixture = await deployContractFixture();
});
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clarity**: Test names should be descriptive
3. **Coverage**: Aim for >95% code coverage
4. **Speed**: Use fixtures for faster execution
5. **Assertions**: One primary assertion per test
6. **Setup**: Use helper functions for complex setups
7. **Cleanup**: Tests should clean up after themselves (handled by fixtures)
8. **Documentation**: Comment complex test logic

## Resources

- [Hardhat Testing Guide](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Chai Matchers](https://ethereum-waffle.readthedocs.io/en/latest/matchers.html)
- [Hardhat Network Helpers](https://hardhat.org/hardhat-network-helpers/docs/overview)
- [Solidity Coverage](https://github.com/sc-forks/solidity-coverage)

---

**Note**: Always run the full test suite before committing changes. Maintain high test coverage to ensure contract reliability.
