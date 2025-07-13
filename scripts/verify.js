const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(60));
  console.log("Contract Verification Script");
  console.log("=".repeat(60));

  // Load deployment information
  const deploymentPath = path.join(__dirname, "..", "deployment.json");

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ deployment.json not found!");
    console.error("Please run deployment first: npm run deploy");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("\n📋 Verification Information:");
  console.log("-".repeat(60));
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Chain ID: ${deploymentInfo.chainId}`);
  console.log("-".repeat(60));

  // Check if already verified
  try {
    console.log("\n🔍 Checking verification status...");

    const network = await hre.ethers.provider.getNetwork();
    if (network.name !== "sepolia") {
      console.log("⚠️  Verification is only available on public networks (Sepolia, Mainnet, etc.)");
      console.log("Current network:", network.name);
      process.exit(0);
    }

    console.log("\n⏳ Verifying contract on Etherscan...");
    console.log("This may take a few moments...");

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });

    console.log("\n✅ Contract verified successfully!");
    console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}#code`);

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✅ Contract is already verified!");
      console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}#code`);

      deploymentInfo.verified = true;
      fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);

      if (error.message.includes("API Key")) {
        console.log("\n💡 Make sure ETHERSCAN_API_KEY is set in your .env file");
      }

      process.exit(1);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Verification Process Complete");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exit(1);
  });
