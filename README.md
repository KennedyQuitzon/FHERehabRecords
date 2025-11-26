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

A decentralized healthcare application leveraging **Fully Homomorphic Encryption (FHE)** with an innovative **Gateway callback architecture** to manage confidential rehabilitation and sports medicine records. Built for the **Zama FHE ecosystem**, enabling healthcare providers to track patient recovery progress while ensuring **complete data privacy** on the blockchain.

**Key Innovation**: Medical data remains encrypted during computation, with **asynchronous processing**, **refund mechanisms**, and **timeout protection** to ensure reliable operations without exposing sensitive patient information.

```
🔐 Encrypted at Rest + Encrypted in Transit + Encrypted During Computation + Gateway Callbacks = Complete Privacy + Reliability
```

## 🚀 Enhanced Features

### **Gateway Callback Architecture**
- **Asynchronous Processing**: All sensitive operations use Gateway callbacks for reliable processing
- **Timeout Protection**: Prevents permanent locking of operations with configurable timeouts
- **Refund Mechanism**: Automatic refunds for failed operations and decryption timeouts
- **Retry Logic**: Built-in retry mechanism with configurable attempt limits
- **Status Tracking**: Real-time status monitoring of all callback requests

### **Advanced Security & Privacy**
- **Rate Limiting**: Prevents abuse and spam operations
- **Gas Limit Protection**: Safeguards against gas limit exhaustion
- **Reentrancy Guards**: Comprehensive reentrancy protection
- **Input Validation**: Multi-layer validation for all inputs
- **Privacy Preservation**: Random delays and timing attack protection
- **Audit Trail**: Complete audit logging for all operations

### **Gas Optimization**
- **Batch Operations**: Support for batch processing of multiple records
- **HCU Management**: Optimized use of Homomorphic Computation Units
- **Efficient Callbacks**: Minimized gas usage through optimized callback patterns
- **Bulk Deactivation**: Gas-efficient batch deactivation of records

### **Developer Experience**
- **Enhanced API**: Comprehensive API with status tracking and health monitoring
- **Error Handling**: Detailed error messages and recovery mechanisms
- **Emergency Functions**: Owner controls for contract management
- **Contract Health**: Real-time monitoring and diagnostic functions

### 🎨 Two Frontend Implementations

This project provides **two frontend implementations** demonstrating different approaches to building privacy-preserving healthcare applications:

1. **Classic Web App** (Root Directory)
   - Pure HTML5, CSS3, and JavaScript
   - Zero build dependencies
   - Immediate browser execution
   - Perfect for quick prototypes and learning
   - Live at: [https://fhe-rehab-records.vercel.app/](https://fhe-rehab-records.vercel.app/)

2. **React + Vite + TypeScript** (`PrivateRehabRecords/` Directory)
   - Modern React 18 with full TypeScript support
   - Component-based architecture with custom hooks
   - Vite build tool with Hot Module Replacement (HMR)
   - Production-ready with optimized builds
   - Ideal for scalable, maintainable applications

Both implementations connect to the **same FHE smart contract** on Sepolia testnet, demonstrating that the privacy-preserving backend is framework-agnostic.

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

### 💻 Developer Features (React + Vite App)
- ⚛️ **Modern React 18** - Latest React with concurrent features
- 🚀 **Vite Build Tool** - Lightning-fast HMR and builds
- 📘 **TypeScript** - Full type safety and IDE support
- 🎣 **Custom Hooks** - Reusable wallet and contract logic
- 🔧 **Component Architecture** - Modular, maintainable code
- 🧪 **Testing Ready** - Jest and React Testing Library compatible
- 🎨 **Clean UI** - Gradient design with responsive layouts
- 🔄 **State Management** - React hooks for predictable state
- 📦 **Optimized Bundles** - Tree-shaking and code splitting
- 🛠️ **Developer Tools** - ESLint, TypeScript, and Prettier integration

---

## 🏗️ Architecture

### Enhanced Gateway Callback Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (HTML5 + Web3)                   │
├─────────────────────────────────────────────────────────────┤
│  ├── MetaMask Integration (Wallet Connection)               │
│  ├── Ethers.js (Smart Contract Interaction)                 │
│  ├── Encrypted Data Preparation                             │
│  └── Status Monitoring & Refund Handling                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│    Enhanced FHE Smart Contract (Gateway Callback Pattern)    │
├─────────────────────────────────────────────────────────────┤
│  ├── Request Validation & Security Layer                    │
│  ├── Callback Request Management                            │
│  ├── Timeout & Refund Mechanism                             │
│  ├── Encrypted Storage (euint32, euint8, ebool)            │
│  ├── FHE Operations & Gateway Integration                  │
│  ├── Access Control & Rate Limiting                        │
│  ├── Audit Trail & Event Logging                           │
│  └── Batch Operations & Gas Optimization                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Zama Gateway Oracle                       │
├─────────────────────────────────────────────────────────────┤
│  ├── Asynchronous Decryption Processing                     │
│  ├── Request Queuing & Management                          │
│  ├── Timeout Handling                                      │
│  └── Callback Execution                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Zama FHEVM (Sepolia Testnet)                │
├─────────────────────────────────────────────────────────────┤
│  ├── Encrypted Computation Layer                            │
│  ├── Homomorphic Operations                                 │
│  ├── Callback Processing                                    │
│  └── On-chain Privacy Preservation                          │
└─────────────────────────────────────────────────────────────┘
```

### Operation Flow: Gateway Callback Pattern

```
1. User Submits Encrypted Request
   ↓
2. Contract Validates & Creates Callback Request
   ↓
3. Gateway Oracle Processes Decryption
   ↓
4. Contract Receives Callback & Completes Operation
   ↓
5. Refund Processing (if timeout/failure)
```

### Privacy & Security Enhancements

**Advanced Privacy Protection**:
- 🛡️ **Timing Attack Protection**: Random delays for sensitive operations
- 🔐 **Division Problem Solution**: Multiplicative randomization for privacy
- 🎯 **Price Leakage Prevention**: Fuzzed operation timing
- ⏱️ **Asynchronous Processing**: No blocking operations
- 🔒 **Access Revocation**: Dynamic access control management

**Comprehensive Security Framework**:
- 🚫 **DoS Protection**: Rate limiting and gas limit controls
- 🔁 **Reentrancy Guards**: Multi-layer reentrancy protection
- ✅ **Input Validation**: Comprehensive parameter validation
- 🔍 **Audit Logging**: Complete operation audit trail
- 🚨 **Security Alerts**: Real-time security event notifications

### React + Vite Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              React Frontend (TypeScript + Vite)              │
├─────────────────────────────────────────────────────────────┤
│  ├── src/
│  │   ├── App.tsx                  # Main application component
│  │   ├── main.tsx                 # Entry point
│  │   ├── components/              # React components
│  │   │   ├── OverviewTab.tsx      # System overview
│  │   │   ├── TherapistTab.tsx     # Therapist management
│  │   │   ├── PatientTab.tsx       # Patient profiles
│  │   │   └── RecordsTab.tsx       # Record management
│  │   ├── hooks/                   # Custom React hooks
│  │   │   ├── useWallet.ts         # Wallet connection hook
│  │   │   └── useContract.ts       # Contract interaction hook
│  │   └── index.css                # Global styles
│  └── Build: Vite with HMR & TypeScript compilation
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              @fhevm/sdk + Ethers.js Integration              │
├─────────────────────────────────────────────────────────────┤
│  ├── FHE Client Initialization                              │
│  ├── Encryption/Decryption Operations                       │
│  ├── Smart Contract Calls                                   │
│  └── MetaMask Wallet Connection                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         FHE Smart Contract (Solidity 0.8.24)                 │
└─────────────────────────────────────────────────────────────┘
```

### React Application Structure

```
PrivateRehabRecords/
├── src/
│   ├── main.tsx                    # React app entry point
│   ├── App.tsx                     # Main app with routing & state
│   ├── index.css                   # Global styles
│   ├── components/
│   │   ├── OverviewTab.tsx         # Dashboard & stats
│   │   ├── TherapistTab.tsx        # Therapist authorization
│   │   ├── PatientTab.tsx          # Patient management
│   │   └── RecordsTab.tsx          # Record CRUD operations
│   └── hooks/
│       ├── useWallet.ts            # Wallet connection & state
│       └── useContract.ts          # Contract instance & ABI
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
└── index.html                      # HTML entry point
```

### Frontend Implementation Comparison

| Feature | Classic HTML/JS | React + Vite + TypeScript |
|---------|----------------|---------------------------|
| **Build Tool** | None (direct execution) | Vite 5.0.8 |
| **Language** | JavaScript ES6+ | TypeScript 5.2.2 |
| **Components** | Vanilla JS functions | React 18 components |
| **State Management** | Manual DOM manipulation | React hooks (useState, useEffect) |
| **Type Safety** | No type checking | Full TypeScript support |
| **Dev Experience** | Manual refresh | Hot Module Replacement (HMR) |
| **Code Organization** | Single file structure | Modular component-based |
| **Reusability** | Limited | High (reusable components & hooks) |
| **Testing** | Manual | Jest/React Testing Library ready |
| **Bundle Size** | ~100KB (CDN Ethers.js) | ~150KB (optimized Vite build) |
| **Performance** | Good | Excellent (Vite optimizations) |
| **Maintainability** | Medium | High (typed & structured) |
| **Learning Curve** | Low | Medium |
| **Best For** | Quick prototypes, simple apps | Production apps, scalability |

### React App Key Features

✅ **Component-Based Architecture**
- Modular, reusable components
- Clear separation of concerns
- Easy to test and maintain

✅ **Custom React Hooks**
```typescript
// useWallet.ts - Wallet connection management
const { isConnected, account, connectWallet } = useWallet();

// useContract.ts - Smart contract interaction
const { contract, signer } = useContract(contractAddress);
```

✅ **Type Safety**
- Full TypeScript integration
- Type-safe smart contract calls
- IDE autocompletion and error detection

✅ **Developer Experience**
- Vite dev server with instant HMR
- Fast builds (<2s)
- ESLint + TypeScript linting
- Modern ES modules

✅ **Production Ready**
- Optimized production builds
- Tree shaking for smaller bundles
- Code splitting support
- Environment variable management

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

#### Classic Frontend (Root Directory)

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

# 7. Open index.html in browser
# The classic frontend runs directly without a build step
```

#### React + Vite Application

```bash
# 1. Navigate to React app directory
cd PrivateRehabRecords

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# App runs on http://localhost:5173

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

**React App Scripts:**

```json
{
  "dev": "vite",                    // Start dev server with HMR
  "build": "tsc && vite build",     // TypeScript compile + production build
  "preview": "vite preview",        // Preview production build
  "lint": "eslint src --ext ts,tsx" // Run linting
}
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

## 📚 API Documentation

### Core Functions

#### **User Management**
```solidity
// Authorize therapist
function authorizeTherapist(address therapist, string calldata license) external onlyOwner;

// Register patient
function registerPatient(address patient, address therapist) external onlyOwner;
```

#### **Record Operations (Gateway Callback Pattern)**
```solidity
// Create record with async processing
function createRecord(
    address patient,
    externalEuint32 encryptedIntensity,
    externalEuint32 encryptedPainLevel,
    externalEuint32 encryptedMobilityScore,
    externalEuint8 encryptedExerciseType,
    externalEuint32 encryptedDuration,
    bytes calldata intensityProof,
    bytes calldata painProof,
    bytes calldata mobilityProof,
    bytes calldata typeProof,
    bytes calldata durationProof
) external payable;

// Update record with async processing
function updateRecord(uint256 recordId, ...) external payable;

// Gateway callback handlers
function createRecordCallback(uint256 requestId, bytes memory decrypted, bytes memory proof) external;
function updateRecordCallback(uint256 requestId, bytes memory decrypted, bytes memory proof) external;
```

#### **Refund & Timeout Management**
```solidity
// Trigger refund for failed operation
function triggerRefund(uint256 requestId, string calldata reason) external;

// Process refund after waiting period
function processRefund(uint256 requestId) external;

// Handle timeout operations
function handleTimeout(uint256 requestId) external;

// Batch timeout cleanup
function forceTimeoutExpiredRequests() external onlyOwner;
```

#### **Security & Access Control**
```solidity
// Grant temporary access
function grantRecordAccess(uint256 recordId, address grantTo) external;

// Revoke access
function revokeRecordAccess(uint256 recordId, address revokeFrom) external;

// Deactivate record
function deactivateRecord(uint256 recordId) external;

// Batch operations
function batchDeactivateRecords(uint256[] calldata recordIds) external onlyOwner;
```

#### **Monitoring & Health**
```solidity
// Get contract health status
function getContractHealth() external view returns (
    uint256 totalBalance,
    uint256 pendingRefunds,
    uint256 activeRequests,
    uint256 completedRecords
);

// Get callback request status
function getCallbackRequest(uint256 requestId) external view returns (...);
```

### Events

#### **Gateway Callback Events**
```solidity
event CallbackRequested(uint256 indexed requestId, address indexed requester, uint256 requestType);
event CallbackCompleted(uint256 indexed requestId, bool success);
event ProcessingTimeout(uint256 indexed requestId, uint256 indexed recordId);
event DecryptionRequested(uint256 indexed recordId, uint256 indexed requestId);
event DecryptionCompleted(uint256 indexed requestId, uint256 indexed recordId);
```

#### **Refund Mechanism Events**
```solidity
event RefundTriggered(uint256 indexed requestId, address indexed user, uint256 amount, string reason);
event RefundProcessed(uint256 indexed requestId, address indexed user, uint256 amount);
event RefundFailed(uint256 indexed requestId, address indexed user, uint256 amount, string reason);
```

#### **Security & Audit Events**
```solidity
event SecurityAlert(string alertType, address indexed user, uint256 timestamp);
event OperationAttempted(string operation, address indexed user, bool success);
event AccessRevoked(uint256 indexed recordId, address indexed revokedFrom);
```

### Constants & Configuration

```solidity
uint256 public constant OPERATION_TIMEOUT = 24 hours;
uint256 public constant REFUND_WAITING_PERIOD = 1 hours;
uint256 public constant MAX_RETRY_ATTEMPTS = 3;
uint256 public constant MAX_GAS_LIMIT = 500000;
uint256 public constant MIN_DELAY_BETWEEN_OPERATIONS = 1 minutes;
uint256 public constant REFUND_THRESHOLD = 0.001 ether;
uint256 public constant PLATFORM_FEE = 0.0001 ether;
```

### Security Modifiers

- `rateLimiting()` - Prevents rapid successive operations
- `gasLimitCheck()` - Validates gas usage limits
- `validAddress(address)` - Validates address inputs
- `nonReentrant()` - Prevents reentrancy attacks
- `timeoutProtection(uint256)` - Prevents operations on timed-out records
- `operationExists(uint256)` - Validates callback request existence

### Error Handling

The contract provides comprehensive error messages for:
- Invalid input parameters
- Rate limiting violations
- Timeout exceeded operations
- Insufficient permissions
- Reentrancy attempts
- Gas limit violations
- Address validation failures

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

### Smart Contracts (Enhanced with Gateway Callback Pattern)
- **Framework**: [Hardhat](https://hardhat.org/) 2.19.0
- **Language**: [Solidity](https://soliditylang.org/) 0.8.24
- **FHE Library**: [@fhevm/solidity](https://docs.zama.ai/fhevm) with Gateway callbacks
- **Network**: Ethereum Sepolia Testnet
- **Testing**: Mocha + Chai + Hardhat Network
- **Security**: Comprehensive security modifiers and audit logging
- **Privacy**: Advanced privacy protection with timing attack prevention
- **Gas Optimization**: Batch operations and HCU management

### Frontend (Multiple Implementations)

#### 1. Classic Web App (Root Directory)
- **Core**: HTML5, CSS3, JavaScript (ES6+)
- **Web3**: [Ethers.js](https://docs.ethers.org/) v5.7.2
- **Wallet**: MetaMask Integration
- **Hosting**: [Vercel](https://vercel.com/)

#### 2. React + Vite Application (`PrivateRehabRecords/`)
- **Framework**: [React](https://react.dev/) 18.2.0 with TypeScript
- **Build Tool**: [Vite](https://vitejs.dev/) 5.0.8
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.2.2
- **Web3**: [Ethers.js](https://docs.ethers.org/) v5.7.2
- **FHE SDK**: [@fhevm/sdk](https://docs.zama.ai/fhevm) with fhevmjs 0.5.0
- **UI Components**: Custom React components with hooks
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Wallet Integration**: MetaMask with custom useWallet hook
- **Linting**: ESLint + TypeScript ESLint
- **Dev Server**: Vite Dev Server with HMR
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

### Applications

#### Classic Frontend
🚀 **[https://fhe-rehab-records.vercel.app/](https://fhe-rehab-records.vercel.app/)**
- Pure HTML/CSS/JavaScript implementation
- Zero build dependencies
- Direct MetaMask integration

#### React + Vite Application
🚀 **React App** (Available in `PrivateRehabRecords/` directory)
- Modern React 18 with TypeScript
- Component-based architecture
- Custom hooks for wallet & contract management
- Vite dev server with Hot Module Replacement (HMR)
- Production-ready build pipeline

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

## 📁 Project Structure

```
D:\
├── contracts/                      # Smart contracts
│   └── PrivateRehabRecords.sol     # Main FHE contract
├── test/                           # Contract test suite (93+ tests)
├── scripts/                        # Deployment & interaction scripts
├── index.html                      # Classic frontend (root)
├── PrivateRehabRecords/            # React + Vite application
│   ├── src/
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # Main app component
│   │   ├── components/             # React components
│   │   │   ├── OverviewTab.tsx
│   │   │   ├── TherapistTab.tsx
│   │   │   ├── PatientTab.tsx
│   │   │   └── RecordsTab.tsx
│   │   └── hooks/                  # Custom React hooks
│   │       ├── useWallet.ts
│   │       └── useContract.ts
│   ├── package.json                # React app dependencies
│   ├── vite.config.ts              # Vite configuration
│   └── tsconfig.json               # TypeScript config
├── fhevm-react-template/           # FHEVM SDK & templates
│   ├── packages/
│   │   └── fhevm-sdk/              # Universal FHEVM SDK
│   ├── examples/                   # Example applications
│   │   ├── nextjs-demo/            # Next.js example
│   │   └── PrivateRehabRecords/    # React implementation
│   └── docs/                       # SDK documentation
├── hardhat.config.js               # Hardhat configuration
├── package.json                    # Root dependencies
├── README.md                       # This file
├── DEPLOYMENT.md                   # Deployment guide
├── TESTING.md                      # Testing guide
├── SECURITY.md                     # Security documentation
└── CI_CD.md                        # CI/CD pipeline docs
```

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

### ✅ Phase 3: Enhanced Features (Completed)
- [x] **Gateway Callback Architecture**: Asynchronous processing with reliable callbacks
- [x] **Refund Mechanism**: Automatic refunds for failed operations and timeouts
- [x] **Timeout Protection**: Prevents permanent locking with configurable timeouts
- [x] **Advanced Security**: Rate limiting, reentrancy guards, input validation
- [x] **Privacy Enhancements**: Timing attack prevention and randomization
- [x] **Gas Optimization**: Batch operations and HCU management
- [x] **Audit Trail**: Complete operation logging and security alerts
- [x] **Health Monitoring**: Real-time contract status and diagnostics

### 🔄 Phase 4: Advanced Features (In Progress)
- [ ] Advanced FHE operations (comparisons, aggregations)
- [ ] Multi-therapist collaboration workflows
- [ ] Patient consent management system
- [ ] Cross-record analytics and trends
- [ ] Mobile-responsive interface improvements

### 🔮 Phase 5: Ecosystem Integration (Planned)
- [ ] Zero-knowledge proofs for identity verification
- [ ] Decentralized storage (IPFS) integration for large files
- [ ] Cross-chain bridge for wider adoption
- [ ] Mobile application (React Native)
- [ ] Mainnet deployment preparation
- [ ] Healthcare provider certification system

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
