# Private Rehabilitation Records

A decentralized healthcare application for managing confidential rehabilitation records using Fully Homomorphic Encryption (FHE) on the blockchain. This system ensures complete privacy for sensitive sports medicine and rehabilitation data while maintaining accessibility for authorized healthcare providers.

## 🔗 Links

- **Live Demo**: [https://private-rehab-records.vercel.app/](https://private-rehab-records.vercel.app/)
- **Demo Video**: Available on the repository

## 📋 Overview

This application revolutionizes how rehabilitation and sports medicine data is managed by providing a secure, blockchain-based platform where patient privacy is guaranteed through advanced cryptographic techniques. Medical professionals can track patient progress while ensuring sensitive health information remains completely confidential.

## 🔑 Core Concepts

### Fully Homomorphic Encryption (FHE) Contract

The system leverages Zama's FHE technology to enable computation on encrypted data without ever decrypting it. This means:

- **Encrypted Data Processing**: Medical records remain encrypted even during analysis and updates
- **Zero-Knowledge Privacy**: Healthcare providers can work with patient data without seeing raw values
- **On-Chain Confidentiality**: Sensitive metrics are stored on the blockchain in encrypted form
- **Secure Computation**: Statistical analysis and comparisons happen on encrypted data

### Confidential Sports Medicine Data

The application manages highly sensitive rehabilitation and sports medicine information including:

- **Exercise Intensity Metrics**: Encrypted tracking of workout intensity levels (0-100 scale)
- **Pain Assessment**: Confidential pain level monitoring (0-10 scale)
- **Mobility Scores**: Private mobility and range-of-motion measurements
- **Exercise Type Classification**: Categorized rehabilitation activities (strength, cardio, flexibility, balance, coordination)
- **Session Duration Tracking**: Encrypted time-based progress monitoring
- **Therapist-Patient Relationships**: Secure assignment and access control

All data points are encrypted using FHE, ensuring that even blockchain validators cannot see the actual values.

## 🏥 Key Features

### For Healthcare Providers (Therapists)

- **License-Based Authorization**: Therapists must be authorized with verified license numbers
- **Patient Registration**: Securely register and assign patients
- **Encrypted Record Creation**: Create detailed rehabilitation records with full privacy
- **Progress Monitoring**: Track patient progress over time while maintaining confidentiality
- **Session Management**: Record and analyze therapy sessions

### For Patients

- **Privacy Guaranteed**: All medical data is encrypted and only accessible to authorized therapists
- **Treatment History**: View your rehabilitation journey and progress
- **Secure Access**: Control who can access your medical records
- **Transparent Care**: Understand your treatment timeline and assigned healthcare providers

### System Features

- **Role-Based Access Control**: Separate permissions for patients, therapists, and administrators
- **Immutable Records**: Blockchain-based storage ensures data integrity
- **Deactivation Capability**: Records can be marked inactive while preserving history
- **Audit Trail**: Complete transparency of who accessed what data and when

## 🎯 Use Cases

1. **Sports Injury Rehabilitation**: Track athlete recovery with complete privacy
2. **Physical Therapy Clinics**: Manage multiple patients with secure, encrypted records
3. **Occupational Therapy**: Monitor workplace injury recovery confidentially
4. **Post-Surgical Rehabilitation**: Track recovery metrics without privacy concerns
5. **Chronic Pain Management**: Long-term tracking of pain levels and treatment efficacy

## 🛠️ Technology Stack

- **Frontend**: Pure HTML5, CSS3, and JavaScript (zero build dependencies)
- **Blockchain**: Ethereum Sepolia Testnet
- **Encryption**: Zama's Fully Homomorphic Encryption (fhEVM)
- **Smart Contract**: Solidity with FHE operations
- **Web3 Integration**: Ethers.js v5.7.2
- **Deployment**: Vercel Static Hosting

## 📜 Smart Contract Details

**Contract Address**: `0x9C434EDeBB2aA48400f96167977B88B070bb74f3` (Sepolia Testnet)

### Contract Capabilities

- Patient and therapist profile management
- Encrypted medical data storage using FHE
- Role-based access control and permissions
- Record lifecycle management (create, view, deactivate)
- Comprehensive event logging for auditability

## 🔐 Security & Privacy

- **End-to-End Encryption**: All sensitive data is encrypted using FHE before touching the blockchain
- **No Plaintext Storage**: Medical information is never stored in readable form
- **Access Control**: Only authorized therapists can create and view patient records
- **Wallet Security**: Integration with MetaMask for secure authentication
- **Immutable Audit Trail**: All actions are recorded on the blockchain

## 🚀 Getting Started

### Prerequisites

- MetaMask browser extension installed
- Sepolia testnet ETH (get from a faucet)
- Modern web browser (Chrome, Firefox, Brave, etc.)

### Quick Start

1. **Visit the Application**: Navigate to [https://private-rehab-records.vercel.app/](https://private-rehab-records.vercel.app/)

2. **Connect Wallet**: Click "Connect Wallet" and approve the MetaMask connection

3. **Verify Network**: Ensure you're connected to Sepolia testnet

4. **Start Using**:
   - Contract address is pre-configured
   - Explore the Overview, Therapist, Patient, and Records tabs
   - Authorize therapists, register patients, or create records based on your role

## 📊 Application Interface

### Overview Tab
- System information and statistics
- Contract address configuration
- Total records counter
- Contract owner information

### Therapist Tab
- Authorize new therapists with license verification
- Register patients and assign to therapists
- View therapist profiles and credentials

### Patient Tab
- View patient profiles and registration status
- Access patient record history
- Monitor assigned therapists

### Records Tab
- Create new encrypted rehabilitation records
- Input exercise intensity, pain levels, mobility scores
- Select exercise types and session durations
- View record metadata and status
- Deactivate records when needed

## 🎥 Demo Video

PrivateRehabRecords.mp4 is available showing:
- Wallet connection and setup
- Therapist authorization process
- Patient registration workflow
- Creating encrypted rehabilitation records
- Viewing and managing records
- Privacy features demonstration

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues or pull requests to improve the application.

## 📞 Support

For questions, issues, or feedback:

- Check the PrivateRehabRecords.mp4 for usage guidance
- Review the smart contract code for technical details

## 🌟 Acknowledgments

Built with Zama's FHE technology to bring true privacy to healthcare data on the blockchain.

---

**Note**: This application is deployed on Ethereum Sepolia testnet for demonstration purposes. For production use, additional security audits and testing are recommended.
