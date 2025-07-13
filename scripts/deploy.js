const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(60));
  console.log("Private Rehabilitation Records - Deployment Script");
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("\n📋 Deployment Information:");
  console.log("-".repeat(60));
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);
  console.log("-".repeat(60));

  // Deploy PrivateRehabRecords contract
  console.log("\n🚀 Deploying PrivateRehabRecords contract...");

  const PrivateRehabRecords = await hre.ethers.getContractFactory("PrivateRehabRecords");
  const rehabRecords = await PrivateRehabRecords.deploy();

  await rehabRecords.waitForDeployment();
  const contractAddress = await rehabRecords.getAddress();

  console.log("✅ Contract deployed successfully!");
  console.log(`Contract Address: ${contractAddress}`);

  // Wait for a few block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await rehabRecords.deploymentTransaction().wait(5);
  console.log("✅ Confirmed!");

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const owner = await rehabRecords.owner();
  const recordCounter = await rehabRecords.recordCounter();

  console.log(`Owner: ${owner}`);
  console.log(`Initial Record Counter: ${recordCounter}`);
  console.log(`Owner matches deployer: ${owner === deployer.address ? "✅" : "❌"}`);

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    deployer: deployer.address,
    owner: owner,
    deploymentTime: new Date().toISOString(),
    blockNumber: (await hre.ethers.provider.getBlockNumber()).toString(),
    transactionHash: rehabRecords.deploymentTransaction().hash
  };

  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 Deployment Summary");
  console.log("=".repeat(60));
  console.log(`Contract: PrivateRehabRecords`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Transaction: ${rehabRecords.deploymentTransaction().hash}`);

  if (network.name === "sepolia") {
    console.log(`\n🔗 Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Verify contract: npm run verify`);
    console.log(`2. Test interactions: npm run interact`);
    console.log(`3. Run simulation: npm run simulate`);
  }

  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
