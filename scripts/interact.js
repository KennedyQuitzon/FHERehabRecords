const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(60));
  console.log("Contract Interaction Script");
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

  console.log("\n📋 Interaction Information:");
  console.log("-".repeat(60));
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${deploymentInfo.network}`);
  console.log("-".repeat(60));

  // Get signers
  const [owner, therapist, patient] = await hre.ethers.getSigners();

  console.log("\n👥 Test Accounts:");
  console.log(`Owner: ${owner.address}`);
  console.log(`Therapist: ${therapist.address}`);
  console.log(`Patient: ${patient.address}`);

  // Connect to deployed contract
  const PrivateRehabRecords = await hre.ethers.getContractFactory("PrivateRehabRecords");
  const contract = PrivateRehabRecords.attach(contractAddress);

  console.log("\n" + "=".repeat(60));
  console.log("Contract Interaction Examples");
  console.log("=".repeat(60));

  // 1. Get contract owner
  console.log("\n1️⃣  Fetching Contract Owner...");
  const contractOwner = await contract.owner();
  console.log(`Owner: ${contractOwner}`);

  // 2. Get total records
  console.log("\n2️⃣  Fetching Total Records...");
  const totalRecords = await contract.getTotalRecords();
  console.log(`Total Records: ${totalRecords}`);

  // 3. Authorize therapist (only if owner)
  console.log("\n3️⃣  Authorizing Therapist...");
  try {
    const licenseNumber = "MED-LIC-" + Date.now();
    const tx = await contract.authorizeTherapist(therapist.address, licenseNumber);
    const receipt = await tx.wait();
    console.log(`✅ Therapist authorized!`);
    console.log(`License: ${licenseNumber}`);
    console.log(`Transaction: ${receipt.hash}`);
  } catch (error) {
    if (error.message.includes("Not authorized")) {
      console.log("⚠️  Only owner can authorize therapists");
    } else {
      console.log(`ℹ️  ${error.message.split('\n')[0]}`);
    }
  }

  // 4. Check therapist profile
  console.log("\n4️⃣  Fetching Therapist Profile...");
  try {
    const therapistProfile = await contract.getTherapistProfile(therapist.address);
    console.log(`Authorized: ${therapistProfile[0]}`);
    console.log(`License Number: ${therapistProfile[1]}`);
    console.log(`Registration Time: ${new Date(Number(therapistProfile[2]) * 1000).toLocaleString()}`);
  } catch (error) {
    console.log(`ℹ️  Unable to fetch profile: ${error.message.split('\n')[0]}`);
  }

  // 5. Register patient
  console.log("\n5️⃣  Registering Patient...");
  try {
    const tx = await contract.registerPatient(patient.address, therapist.address);
    const receipt = await tx.wait();
    console.log(`✅ Patient registered!`);
    console.log(`Assigned Therapist: ${therapist.address}`);
    console.log(`Transaction: ${receipt.hash}`);
  } catch (error) {
    console.log(`ℹ️  ${error.message.split('\n')[0]}`);
  }

  // 6. Check patient profile
  console.log("\n6️⃣  Fetching Patient Profile...");
  try {
    const patientProfile = await contract.getPatientProfile(patient.address);
    console.log(`Registered: ${patientProfile[0]}`);
    console.log(`Total Sessions: ${patientProfile[1]}`);
    console.log(`Registration Time: ${new Date(Number(patientProfile[2]) * 1000).toLocaleString()}`);
    console.log(`Assigned Therapist: ${patientProfile[3]}`);
  } catch (error) {
    console.log(`ℹ️  Unable to fetch profile: ${error.message.split('\n')[0]}`);
  }

  // 7. Create record (as therapist)
  console.log("\n7️⃣  Creating Rehabilitation Record (as Therapist)...");
  try {
    const contractAsTherapist = contract.connect(therapist);
    const tx = await contractAsTherapist.createRecord(
      patient.address,
      75,  // Exercise intensity (0-100)
      4,   // Pain level (0-10)
      80,  // Mobility score (0-100)
      1,   // Exercise type (strength)
      45   // Session duration (minutes)
    );
    const receipt = await tx.wait();
    console.log(`✅ Record created!`);
    console.log(`Transaction: ${receipt.hash}`);

    // Extract record ID from event
    const event = receipt.logs.find(log => {
      try {
        return contract.interface.parseLog(log).name === "RecordCreated";
      } catch { return false; }
    });
    if (event) {
      const parsedEvent = contract.interface.parseLog(event);
      console.log(`Record ID: ${parsedEvent.args.recordId}`);
    }
  } catch (error) {
    console.log(`ℹ️  ${error.message.split('\n')[0]}`);
  }

  // 8. Get patient records
  console.log("\n8️⃣  Fetching Patient Records...");
  try {
    const recordIds = await contract.getPatientRecords(patient.address);
    console.log(`Total Patient Records: ${recordIds.length}`);
    if (recordIds.length > 0) {
      console.log(`Record IDs: ${recordIds.join(", ")}`);
    }
  } catch (error) {
    console.log(`ℹ️  ${error.message.split('\n')[0]}`);
  }

  // 9. Get record metadata
  console.log("\n9️⃣  Fetching Record Metadata...");
  try {
    const totalRecordsNow = await contract.getTotalRecords();
    if (totalRecordsNow > 0n) {
      const metadata = await contract.getRecordMetadata(1);
      console.log(`Active: ${metadata[0]}`);
      console.log(`Timestamp: ${new Date(Number(metadata[1]) * 1000).toLocaleString()}`);
      console.log(`Patient: ${metadata[2]}`);
      console.log(`Therapist: ${metadata[3]}`);
    } else {
      console.log("No records available yet");
    }
  } catch (error) {
    console.log(`ℹ️  ${error.message.split('\n')[0]}`);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("✅ Interaction Complete!");
  console.log("=".repeat(60));
  console.log("\n📝 Summary:");
  console.log(`- Contract Owner: ${contractOwner}`);
  console.log(`- Total Records: ${await contract.getTotalRecords()}`);
  console.log(`- Test Therapist: ${therapist.address}`);
  console.log(`- Test Patient: ${patient.address}`);

  if (deploymentInfo.network === "sepolia") {
    console.log(`\n🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  }

  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });
