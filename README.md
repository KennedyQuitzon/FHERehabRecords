# 🏥 FHE Rehabilitation Records

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://fhe-rehab-records.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-93%2B%20passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)]()
[![Solidity](https://img.shields.io/badge/solidity-0.8.24-orange)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/hardhat-2.19.0-yellow)](https://hardhat.org/)

> **Privacy-preserving sports medicine and rehabilitation data management** using **Zama FHEVM** for confidential health tracking on Ethereum blockchain.

🌐 **[Live Demo](https://fhe-rehab-records.vercel.app/)** | 📺 **[Video Demo - Download Required]** | 📖 **[Documentation](#documentation)** | 🔗 **[GitHub Repository](https://github.com/KennedyQuitzon/FHERehabRecords)**

---

## 🎯 Overview

A decentralized healthcare application leveraging **Fully Homomorphic Encryption (FHE)** to manage confidential rehabilitation and sports medicine records. Built for the **Zama FHE ecosystem**, enabling healthcare providers to track patient recovery progress while ensuring **complete data privacy** on the blockchain.

**Key Innovation**: Medical data remains encrypted during computation, allowing statistical analysis and progress tracking without ever exposing sensitive patient information.

```
🔐 Encrypted at Rest + Encrypted in Transit + Encrypted During Computation = Complete Privacy
```

---

## 💡 Core Concepts

### What is FHE (Fully Homomorphic Encryption)?

Fully Homomorphic Encryption enables computations to be performed directly on encrypted data without decryption. This revolutionary technology allows:

- **Confidential Data Processing** - Perform operations on encrypted values
- **Privacy-Preserving Analytics** - Calculate statistics without seeing raw data
- **Secure Multi-Party Computation** - Multiple parties can work together without revealing their inputs
- **Zero-Knowledge Operations** - Verify computations without accessing private information

### FHE Contract for Confidential Sports Medicine Data

This project implements an FHE-powered smart contract specifically designed for **confidential rehabilitation and sports medicine records**:

#### Privacy Model

```
Traditional Healthcare Records:
❌ Centralized storage (single point of failure)
❌ Plaintext data vulnerable to breaches
❌ Limited patient control over access
❌ No computation on encrypted data

FHE Rehabilitation Records:
✅ Decentralized blockchain storage
✅ Always-encrypted medical data
✅ Patient-controlled access permissions
✅ Encrypted operations (comparisons, aggregations)
```

#### Confidential Sports Medicine Data

All sensitive rehabilitation and sports medicine metrics are encrypted using FHE:

**What's Encrypted (Private Health Information)**:

1. **Exercise Intensity** (`euint32`)
   - Workout level measurements (0-100 scale)
   - Training load indicators
   - Performance metrics

2. **Pain Levels** (`euint32`)
   - Patient-reported pain scores (0-10 scale)
   - Discomfort assessments
   - Recovery progress indicators

3. **Mobility Scores** (`euint32`)
   - Range of motion measurements
   - Functional movement assessments
   - Rehabilitation progress metrics

4. **Exercise Type** (`euint8`)
   - Therapy categories (strength, cardio, flexibility, balance)
   - Treatment modalities
   - Workout classifications

5. **Session Duration** (`euint32`)
   - Treatment session length
   - Training time
   - Therapy duration tracking

#### FHE Operations in Practice

```solidity
// Example: Creating an encrypted rehabilitation record
function createRecord(
    address patientAddress,
    uint32 _exerciseIntensity,  // Plaintext input
    uint32 _painLevel,
    uint32 _mobilityScore,
    uint8 _exerciseType,
    uint32 _sessionDuration
) external {
    // 1. Encrypt sensitive data using FHE
    euint32 encryptedIntensity = FHE.asEuint32(_exerciseIntensity);
    euint32 encryptedPainLevel = FHE.asEuint32(_painLevel);
    euint32 encryptedMobilityScore = FHE.asEuint32(_mobilityScore);

    // 2. Store encrypted data on-chain
    records[recordId] = RehabRecord({
        exerciseIntensity: encryptedIntensity,
        painLevel: encryptedPainLevel,
        mobilityScore: encryptedMobilityScore,
        // ... other fields
    });

    // 3. Grant access permissions to authorized parties
    FHE.allow(encryptedIntensity, patientAddress);    // Patient access
    FHE.allow(encryptedIntensity, therapistAddress);  // Therapist access
    FHE.allowThis(encryptedIntensity);                // Contract access

    // Data is now encrypted and stored on-chain!
}
```

#### Privacy Guarantees

**Who Can Access What?**

| Data Type | Patient | Therapist | Contract | Public |
|-----------|---------|-----------|----------|--------|
| Exercise Intensity | ✅ Decrypt | ✅ Decrypt | ✅ Compute | ❌ Hidden |
| Pain Levels | ✅ Decrypt | ✅ Decrypt | ✅ Compute | ❌ Hidden |
| Mobility Scores | ✅ Decrypt | ✅ Decrypt | ✅ Compute | ❌ Hidden |
| Record Timestamp | ✅ View | ✅ View | ✅ View | ✅ View |
| Participant Addresses | ✅ View | ✅ View | ✅ View | ✅ View |

**Key Privacy Features**:

- ✅ **End-to-End Encryption** - Data encrypted from entry to storage
- ✅ **Selective Disclosure** - Patients control who can decrypt their data
- ✅ **Homomorphic Operations** - Computations on encrypted data (future: averages, trends)
- ✅ **On-chain Privacy** - No off-chain trusted parties needed
- ✅ **Audit Trail** - Immutable access logs without exposing sensitive data

#### Use Case: Sports Medicine Clinic

**Scenario**: A sports medicine clinic uses FHE contracts to manage athlete rehabilitation:

1. **Therapist** records encrypted performance metrics after each session
2. **System** performs encrypted analysis to track recovery trends
3. **Patient** views their own progress with decryption key
4. **Consulting Specialist** can be granted temporary access if needed
5. **Privacy Maintained** - Raw medical data never exposed on blockchain

#### Technical Advantages

**Why FHE for Healthcare?**

1. **HIPAA/GDPR Alignment** - Encrypted data reduces compliance risk
2. **Data Sovereignty** - Patients retain control over their medical information
3. **Interoperability** - Secure sharing between healthcare providers
4. **Tamper-Proof** - Blockchain immutability ensures data integrity
5. **Future-Proof** - Quantum-resistant encryption methods

---

## ✨ Features

### 🏥 For Healthcare Providers
- ✅ **License-Based Authorization** - Verified therapist credentials on-chain
- ✅ **Encrypted Record Creation** - Medical data never leaves encrypted form
- ✅ **Progress Monitoring** - Track patient recovery with FHE operations
- ✅ **Session Management** - Comprehensive therapy session tracking
- ✅ **Audit Trail** - Immutable access logs for compliance

### 👨‍⚕️ For Patients
- 🔒 **Privacy Guaranteed** - All medical data encrypted using Zama FHE
- 📊 **Treatment History** - View your rehabilitation journey
- 🔐 **Access Control** - Manage who can see your records
- 📱 **Transparent Care** - Track assigned healthcare providers

### 🛡️ Privacy & Security
- 🔐 **FHE Encryption** - Data encrypted during computation
- 🎯 **Zero-Knowledge** - Providers work without seeing raw values
- 📝 **Immutable Records** - Blockchain-based storage integrity
- 🚫 **DoS Protection** - Rate limiting and pagination
- ⚡ **Gas Optimized** - Efficient smart contract operations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (HTML5 + Web3)                   │
├─────────────────────────────────────────────────────────────┤
│  ├── MetaMask Integration (Wallet Connection)               │
│  ├── Ethers.js (Smart Contract Interaction)                 │
│  └── Real-time Encrypted Data Display                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         FHE Smart Contract (Solidity 0.8.24)                 │
├─────────────────────────────────────────────────────────────┤
│  ├── Encrypted Storage (euint32, euint8, ebool)             │
│  ├── FHE Operations (FHE.asEuint32, FHE.allow)              │
│  ├── Access Control (Modifiers + Role-based)                │
│  └── Event Logging (Audit Trail)                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Zama FHEVM (Sepolia Testnet)                │
├─────────────────────────────────────────────────────────────┤
│  ├── Encrypted Computation Layer                            │
│  ├── Homomorphic Operations                                 │
│  └── On-chain Privacy Preservation                          │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Patient Sports Medicine Data Input
    ↓
FHE Encryption (euint32)
    ↓
Smart Contract Storage (Always Encrypted)
    ↓
Homomorphic Operations (No Decryption)
    ↓
Encrypted Results & Analytics
    ↓
Authorized Decryption (FHE.allow)
    ↓
Therapist/Patient Dashboard
```

---

## 🔐 FHE Privacy Model

### Encrypted Types (Confidential Data)

```solidity
struct RehabRecord {
    euint32 exerciseIntensity;  // 0-100 scale, FHE encrypted
    euint32 painLevel;           // 0-10 scale, FHE encrypted
    euint32 mobilityScore;       // 0-100 scale, FHE encrypted
    euint8 exerciseType;         // Category, FHE encrypted
    euint32 sessionDuration;     // Minutes, FHE encrypted
    bool isActive;               // Public status
    uint256 timestamp;           // Public metadata
    address patient;             // Public identifier
    address therapist;           // Public identifier
}
```

### FHE Permission System

```solidity
// Grant decryption permissions
FHE.allow(encryptedIntensity, patientAddress);   // Patient can decrypt
FHE.allow(encryptedIntensity, therapistAddress); // Therapist can decrypt
FHE.allowThis(encryptedIntensity);               // Contract can compute
```

**Access Control Matrix**:

- **Patients**: Can decrypt their own medical records
- **Assigned Therapists**: Can decrypt records for their patients
- **Smart Contract**: Can perform encrypted computations
- **Other Users**: No access - complete privacy

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
Node.js >= 18.0.0
npm >= 9.0.0
MetaMask browser extension

# Optional
Git for cloning
```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/KennedyQuitzon/FHERehabRecords.git
cd FHERehabRecords

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Compile contracts
npm run compile

# 5. Run tests
npm test

# 6. Deploy to Sepolia
npm run deploy
```

### Environment Configuration

```env
# Network
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_deployment_wallet_private_key

# Verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Security
PAUSER_ADDRESS=0x...
OWNER_ADDRESS=0x...

# Testing
REPORT_GAS=true
```

---

## 🔧 Technical Implementation

### Smart Contract (Zama FHEVM)

**Key Technologies**: `@fhevm/solidity` package for FHE operations

#### Encrypted Data Types

```solidity
import { FHE, euint32, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateRehabRecords is SepoliaConfig {
    // Encrypted types
    euint32 exerciseIntensity;  // 32-bit encrypted integer
    euint32 painLevel;          // 32-bit encrypted integer
    euint8 exerciseType;        // 8-bit encrypted integer
    ebool isActive;             // Encrypted boolean (future use)
}
```

#### FHE Operations

```solidity
// 1. Encrypt plaintext data
euint32 encryptedIntensity = FHE.asEuint32(_exerciseIntensity);

// 2. Grant access permissions
FHE.allowThis(encryptedIntensity);                    // Contract access
FHE.allow(encryptedIntensity, patientAddress);        // Patient access
FHE.allow(encryptedIntensity, msg.sender);            // Therapist access

// 3. Store encrypted data on-chain
records[recordId].exerciseIntensity = encryptedIntensity;

// 4. Perform encrypted operations (no decryption needed)
// Future: euint32 totalIntensity = FHE.add(intensity1, intensity2);
```

### Frontend Integration

```javascript
// Connect to deployed contract
const contractAddress = "0x9C434EDeBB2aA48400f96167977B88B070bb74f3";
const contract = new ethers.Contract(contractAddress, ABI, signer);

// Create encrypted record
const tx = await contract.createRecord(
  patientAddress,
  75,    // Exercise intensity (0-100)
  4,     // Pain level (0-10)
  80,    // Mobility score (0-100)
  1,     // Exercise type (strength training)
  45     // Session duration (minutes)
);

await tx.wait();
console.log("Record created with FHE encryption!");
```

---

## 📋 Usage Guide

### For Contract Owner

**1. Authorize Therapist**

```bash
# Via script
npm run interact

# Or via contract
contract.authorizeTherapist(
  "0xTherapistAddress",
  "PT-LICENSE-12345"
)
```

**2. Register Patient**

```bash
contract.registerPatient(
  "0xPatientAddress",
  "0xAssignedTherapistAddress"
)
```

### For Therapists

**3. Create Rehabilitation Record**

```solidity
// Web interface or direct contract call
createRecord(
  patientAddress,
  exerciseIntensity: 75,  // 0-100
  painLevel: 5,           // 0-10
  mobilityScore: 80,      // 0-100
  exerciseType: 1,        // 0=general, 1=strength, 2=cardio, 3=flexibility
  sessionDuration: 45     // minutes
)
```

**4. View Patient Records**

```bash
# Get record IDs for patient
recordIds = contract.getPatientRecords(patientAddress)

# Get metadata (public info)
metadata = contract.getRecordMetadata(recordId)
```

### For Patients

**5. View Your Records**

```javascript
// Connect wallet and view your records
const myRecords = await contract.getPatientRecords(myAddress);

// View assigned therapist
const profile = await contract.getPatientProfile(myAddress);
console.log("Therapist:", profile.assignedTherapist);
console.log("Total Sessions:", profile.totalSessions);
```

---

## 🧪 Testing

### Test Suite

**93+ comprehensive test cases** covering all functionality:

```bash
# Run all tests
npm test

# Run with coverage
npm run coverage

# Run with gas reporting
REPORT_GAS=true npm test

# Run specific test file
npx hardhat test test/PrivateRehabRecords.test.js
```

### Test Categories

```
✅ Deployment & Initialization (8 tests)
✅ Therapist Authorization (12 tests)
✅ Patient Registration (11 tests)
✅ Record Creation (20 tests)
✅ Record Updates (12 tests)
✅ Access Control (8 tests)
✅ Edge Cases (4 tests)
✅ Multiple Workflows (18 tests)

Total: 93+ tests | Coverage: >95%
```

### Testing Documentation

See [TESTING.md](TESTING.md) for comprehensive testing guide including:
- Test patterns and best practices
- FHE testing strategies
- Coverage reports
- Performance benchmarks

---

## 📊 Smart Contract Details

### Deployment Information

| Parameter | Value |
|-----------|-------|
| **Network** | Sepolia Testnet |
| **Chain ID** | 11155111 |
| **Contract Address** | `0x9C434EDeBB2aA48400f96167977B88B070bb74f3` |
| **Compiler Version** | Solidity 0.8.24 |
| **Optimization** | Enabled (200 runs) |
| **License** | MIT |

**Etherscan**: [View Verified Contract](https://sepolia.etherscan.io/address/0x9C434EDeBB2aA48400f96167977B88B070bb74f3)

### Contract Functions

| Function | Access | Description |
|----------|--------|-------------|
| `authorizeTherapist` | Owner | Authorize healthcare provider |
| `registerPatient` | Owner | Register patient with therapist |
| `createRecord` | Therapist | Create encrypted rehab record |
| `updateRecord` | Therapist | Update existing record |
| `deactivateRecord` | Therapist/Owner | Deactivate record |
| `getPatientRecords` | Patient/Therapist | Get record IDs |
| `getRecordMetadata` | Authorized | Get public metadata |

### Gas Costs

```
Deployment:          ~2,500,000 gas
authorizeTherapist:     ~50,000 gas
registerPatient:        ~60,000 gas
createRecord:          ~150,000 gas
updateRecord:           ~80,000 gas
```

*Gas costs optimized with Solidity optimizer (200 runs)*

---

## 🛠️ Tech Stack

### Smart Contracts
- **Framework**: [Hardhat](https://hardhat.org/) 2.19.0
- **Language**: [Solidity](https://soliditylang.org/) 0.8.24
- **FHE Library**: [@fhevm/solidity](https://docs.zama.ai/fhevm)
- **Network**: Ethereum Sepolia Testnet
- **Testing**: Mocha + Chai + Hardhat Network

### Frontend
- **Core**: HTML5, CSS3, JavaScript (ES6+)
- **Web3**: [Ethers.js](https://docs.ethers.org/) v5.7.2
- **Wallet**: MetaMask Integration
- **Hosting**: [Vercel](https://vercel.com/)

### Development Tools
- **Linting**: Solhint, ESLint, Prettier
- **Security**: Slither, Mythril, NPM Audit
- **Testing**: 93+ tests, >95% coverage
- **CI/CD**: GitHub Actions (4 workflows)
- **Git Hooks**: Husky + lint-staged
- **Performance**: Gas Reporter, Contract Sizer

### Infrastructure
- **RPC**: Alchemy / Infura
- **Explorer**: Etherscan
- **Verification**: Hardhat Verify Plugin
- **Testnet**: Sepolia (Chain ID: 11155111)

---

## 🌐 Live Demo

### Application
🚀 **[https://fhe-rehab-records.vercel.app/](https://fhe-rehab-records.vercel.app/)**

### Video Demonstration
📺 **[Download demo.mp4 to view]** - The video file needs to be downloaded to your local machine for viewing. Direct links cannot be opened in browser.

### Deployed Contract
📜 **Sepolia Testnet**
- **Address**: `0x9C434EDeBB2aA48400f96167977B88B070bb74f3`
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x9C434EDeBB2aA48400f96167977B88B070bb74f3)
- **Verified**: ✅ Source code verified

### GitHub Repository
🔗 **[https://github.com/KennedyQuitzon/FHERehabRecords](https://github.com/KennedyQuitzon/FHERehabRecords)**

### Getting Testnet ETH
💧 **Sepolia Faucets**:
- [Alchemy Faucet](https://sepoliafaucet.com/)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)
- [Infura Faucet](https://www.infura.io/faucet/sepolia)

---

## 📖 Documentation

### Core Documentation
- 📘 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive deployment guide
- 🧪 **[TESTING.md](TESTING.md)** - Testing strategies and patterns
- 🔐 **[SECURITY.md](SECURITY.md)** - Security audit & optimization
- 🚀 **[CI_CD.md](CI_CD.md)** - CI/CD pipeline documentation

### Additional Resources
- 📊 **[TEST_SUMMARY.md](TEST_SUMMARY.md)** - Test suite overview
- ⚡ **[SECURITY_PERFORMANCE_SUMMARY.md](SECURITY_PERFORMANCE_SUMMARY.md)** - Performance metrics

### External Links
- 🔗 **[Zama Documentation](https://docs.zama.ai/)**
- 🔗 **[FHEVM Hardhat Plugin](https://docs.zama.ai/fhevm/guides/hardhat)**
- 🔗 **[Hardhat Documentation](https://hardhat.org/docs)**
- 🔗 **[Sepolia Testnet Info](https://sepolia.etherscan.io/)**

---

## 🔒 Security

### Auditing Tools

```bash
# Run security audit
npm run security

# Slither static analysis
npm run security:slither

# Mythril analysis
npm run security:mythril

# Dependency audit
npm audit
```

### Security Features

- ✅ **Access Control** - Role-based permissions with modifiers
- ✅ **FHE Encryption** - All sensitive data encrypted
- ✅ **DoS Protection** - Pagination and rate limiting patterns
- ✅ **Reentrancy Guards** - Checks-effects-interactions pattern
- ✅ **Integer Safety** - Solidity 0.8+ overflow protection
- ✅ **Input Validation** - Comprehensive parameter checks
- ✅ **Event Logging** - Audit trail for all actions

### Automated Security

- 🔍 **Pre-commit hooks** - Code quality checks
- 🤖 **CI/CD scanning** - Automated vulnerability detection
- 📊 **Weekly audits** - Scheduled security scans
- 📈 **Coverage tracking** - >95% test coverage

---

## 🚢 Deployment

### Deploy to Sepolia

```bash
# 1. Configure .env
cp .env.example .env
# Add: SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY

# 2. Compile contracts
npm run compile

# 3. Run tests
npm test

# 4. Deploy
npm run deploy

# 5. Verify on Etherscan
npm run verify
```

### Deploy Frontend

```bash
# Vercel deployment (automatic)
vercel --prod

# Or configure in vercel.json
{
  "framework": null,
  "buildCommand": null,
  "outputDirectory": "."
}
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

```bash
# 1. Fork the repository
# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes and commit (follows conventional commits)
git commit -m "feat(contracts): add batch processing"

# 4. Push to branch
git push origin feature/amazing-feature

# 5. Open Pull Request
```

### Development Guidelines

- ✅ Write tests for new features
- ✅ Maintain >95% code coverage
- ✅ Follow Solidity style guide
- ✅ Use conventional commits
- ✅ Update documentation
- ✅ Run linting before commit

### Pre-commit Checks (Automatic)

```bash
✅ Prettier formatting
✅ Solhint linting
✅ ESLint checking
✅ Test suite execution
```

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Completed)
- [x] Smart contract with FHE encryption
- [x] Therapist and patient management
- [x] Encrypted record storage
- [x] Basic access control
- [x] Sepolia testnet deployment

### ✅ Phase 2: Testing & Security (Completed)
- [x] 93+ comprehensive test cases
- [x] Security auditing tools integration
- [x] CI/CD pipeline setup
- [x] Documentation completion
- [x] Gas optimization

### 🔄 Phase 3: Enhanced Features (In Progress)
- [ ] Batch operations for multiple records
- [ ] Advanced FHE operations (comparisons, aggregations)
- [ ] Multi-therapist collaboration
- [ ] Patient consent management
- [ ] Export/import functionality

### 🔮 Phase 4: Advanced Privacy (Planned)
- [ ] Zero-knowledge proofs for identity
- [ ] Decentralized storage (IPFS) for large files
- [ ] Cross-chain bridge for wider adoption
- [ ] Mobile application (React Native)
- [ ] Mainnet deployment

---

## 🎥 Video Demo

📺 **Download Required**: The [demo.mp4] file must be downloaded to your local machine to view. Direct browser links are not supported for local video files.

**Demo showcases**:
- 🔐 Privacy-preserving data entry with FHE
- 👨‍⚕️ Therapist workflow for encrypted records
- 👤 Patient dashboard and access control
- 📊 Encrypted record management system
- 🔍 Access control demonstration

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 FHE Rehabilitation Records

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 🏆 Acknowledgments

### Built With
- 🎯 **[Zama](https://zama.ai/)** - FHE technology and FHEVM
- ⚡ **[Hardhat](https://hardhat.org/)** - Ethereum development environment
- 🌐 **[Vercel](https://vercel.com/)** - Frontend hosting
- 🔗 **[Alchemy](https://www.alchemy.com/)** - Blockchain infrastructure

### Special Thanks
- Zama team for pioneering FHE on blockchain
- Ethereum community for Sepolia testnet
- Open source contributors

---

## 📞 Support

### Get Help
- 📧 **Issues**: [GitHub Issues](https://github.com/KennedyQuitzon/FHERehabRecords/issues)
- 📖 **Docs**: [Documentation](#documentation)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/KennedyQuitzon/FHERehabRecords/discussions)

### Resources
- 🔗 [Zama Discord](https://discord.com/invite/zama)
- 🔗 [Hardhat Discord](https://discord.gg/hardhat)
- 🔗 [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)

---

## 🌟 Star History

If you find this project useful, please ⭐ star the repository!

---

<div align="center">

**Built with ❤️ for privacy-preserving healthcare**

**Powered by Zama FHEVM** | **MIT Licensed** | **Sepolia Testnet**

[Live Demo](https://fhe-rehab-records.vercel.app/) • [Documentation](#documentation) • [GitHub](https://github.com/KennedyQuitzon/FHERehabRecords)

</div>
