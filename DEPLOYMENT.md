# Deployment Guide

Complete guide for deploying and verifying the Private Rehabilitation Records smart contract.

## Prerequisites

Before deploying, ensure you have:

1. **Node.js and npm** installed (v18 or higher)
2. **MetaMask** wallet with Sepolia testnet configured
3. **Sepolia ETH** for gas fees (get from [Sepolia Faucet](https://sepoliafaucet.com/))
4. **Alchemy or Infura** account for RPC endpoint
5. **Etherscan** API key for contract verification

## Step 1: Environment Setup

1. Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd private-rehabilitation-records
npm install
```

2. Create `.env` file from template:
```bash
cp .env.example .env
```

3. Configure your `.env` file:
```env
# Get from Alchemy or Infura
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Export from MetaMask (use a test wallet!)
PRIVATE_KEY=your_private_key_without_0x_prefix

# Get from Etherscan
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Security Warning**: Never commit your `.env` file or share your private keys!

## Step 2: Compile Contracts

Compile the smart contracts:

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

## Step 3: Run Tests

Before deploying, ensure all tests pass:

```bash
npm test
```

All tests should pass. The test suite includes:
- Deployment and initialization
- Therapist authorization
- Patient registration
- Record creation and management
- Access control
- Multiple workflows

## Step 4: Deploy to Sepolia

Deploy the contract to Sepolia testnet:

```bash
npm run deploy
```

Expected output:
```
============================================================
Private Rehabilitation Records - Deployment Script
============================================================

📋 Deployment Information:
------------------------------------------------------------
Network: sepolia (Chain ID: 11155111)
Deployer: 0x...
Balance: X.XXX ETH
------------------------------------------------------------

🚀 Deploying PrivateRehabRecords contract...
✅ Contract deployed successfully!
Contract Address: 0x...

⏳ Waiting for block confirmations...
✅ Confirmed!

🔍 Verifying deployment...
Owner: 0x...
Initial Record Counter: 1
Owner matches deployer: ✅

💾 Deployment info saved to: ./deployment.json

============================================================
🎉 Deployment Summary
============================================================
Contract: PrivateRehabRecords
Address: 0x...
Network: sepolia
Deployer: 0x...
Transaction: 0x...

🔗 Etherscan: https://sepolia.etherscan.io/address/0x...

📝 Next steps:
1. Verify contract: npm run verify
2. Test interactions: npm run interact
3. Run simulation: npm run simulate
============================================================
```

The deployment script automatically:
- Deploys the contract
- Waits for confirmations
- Verifies deployment parameters
- Saves deployment info to `deployment.json`

## Step 5: Verify Contract on Etherscan

Verify the contract source code on Etherscan:

```bash
npm run verify
```

Expected output:
```
============================================================
Contract Verification Script
============================================================

📋 Verification Information:
------------------------------------------------------------
Contract Address: 0x...
Network: sepolia
Chain ID: 11155111
------------------------------------------------------------

🔍 Checking verification status...

⏳ Verifying contract on Etherscan...
This may take a few moments...

✅ Contract verified successfully!
🔗 View on Etherscan: https://sepolia.etherscan.io/address/0x...#code

============================================================
Verification Process Complete
============================================================
```

## Step 6: Test Contract Interactions

Run the interaction script to test basic functionality:

```bash
npm run interact
```

This script will:
- Connect to the deployed contract
- Fetch contract owner and stats
- Authorize a test therapist
- Register a test patient
- Create sample records
- Query patient and record data

## Step 7: Run Full Workflow Simulation

Execute a complete healthcare workflow simulation:

```bash
npm run simulate
```

This comprehensive simulation includes:
- Authorizing multiple therapists
- Registering multiple patients
- Creating progressive rehabilitation records
- Demonstrating privacy features
- Showing access control
- Record lifecycle management

## Deployment to Mainnet (Production)

**⚠️ WARNING**: Deploying to mainnet requires real ETH and careful preparation.

### Additional Mainnet Requirements

1. **Security Audit**: Get a professional security audit
2. **Comprehensive Testing**: Test extensively on testnets
3. **Sufficient ETH**: Ensure wallet has enough ETH for deployment
4. **Backup Plans**: Have contingency plans for issues

### Mainnet Configuration

1. Add mainnet configuration to `hardhat.config.js`:
```javascript
mainnet: {
  url: process.env.MAINNET_RPC_URL,
  accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
  chainId: 1
}
```

2. Add mainnet variables to `.env`:
```env
MAINNET_RPC_URL=your_mainnet_rpc_url
MAINNET_PRIVATE_KEY=your_mainnet_private_key
```

3. Deploy to mainnet:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## Troubleshooting

### Common Issues

1. **Insufficient Funds**
   - Error: `insufficient funds for gas`
   - Solution: Add more Sepolia ETH to your wallet

2. **Network Connection**
   - Error: `could not detect network`
   - Solution: Check your RPC URL in `.env`

3. **Verification Failed**
   - Error: `Etherscan API key invalid`
   - Solution: Verify your Etherscan API key is correct

4. **Contract Already Verified**
   - Message: `Already Verified`
   - Solution: This is normal, contract is already verified

5. **Compilation Errors**
   - Error: Solidity compilation failed
   - Solution: Ensure dependencies are installed: `npm install`

### Getting Help

- Check the [Hardhat Documentation](https://hardhat.org/docs)
- Review [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)
- Open an issue on GitHub

## Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract verified on Etherscan
- [ ] Deployment info saved in `deployment.json`
- [ ] Interaction script runs without errors
- [ ] Simulation script completes successfully
- [ ] Contract address updated in frontend
- [ ] README updated with new contract address
- [ ] All tests passing
- [ ] Security considerations reviewed

## Network Information

### Sepolia Testnet

- **Chain ID**: 11155111
- **RPC URL**: https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucets**:
  - https://sepoliafaucet.com
  - https://www.alchemy.com/faucets/ethereum-sepolia

### Contract Details

After deployment, your contract will be available at:

- **Address**: See `deployment.json`
- **Etherscan**: `https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>`
- **ABI**: Located in `artifacts/contracts/PrivateRehabRecords.sol/PrivateRehabRecords.json`

## Useful Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Run test with coverage
npm run coverage

# Deploy to Sepolia
npm run deploy

# Deploy to local network
npm run deploy:local

# Verify on Etherscan
npm run verify

# Interact with contract
npm run interact

# Run simulation
npm run simulate

# Start local node
npm run node

# Clean artifacts
npm run clean
```

## Security Best Practices

1. **Never commit private keys** to version control
2. **Use test wallets only** for testnet deployments
3. **Review all transactions** before signing
4. **Keep dependencies updated** for security patches
5. **Get professional audits** before mainnet deployment
6. **Test extensively** on testnets first
7. **Monitor contract activity** after deployment

## Support

For deployment support:
- Review this guide carefully
- Check the main README.md
- Review script output for specific errors
- Open a GitHub issue with deployment logs

---

**Remember**: Always test thoroughly on Sepolia before considering mainnet deployment!
