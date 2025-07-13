const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(60));
  console.log("Complete Workflow Simulation Script");
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

  console.log("\n📋 Simulation Information:");
  console.log("-".repeat(60));
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${deploymentInfo.network}`);
  console.log("-".repeat(60));

  // Get signers
  const [owner, therapist1, therapist2, patient1, patient2] = await hre.ethers.getSigners();

  console.log("\n👥 Simulation Accounts:");
  console.log(`Owner: ${owner.address}`);
  console.log(`Therapist 1: ${therapist1.address}`);
  console.log(`Therapist 2: ${therapist2.address}`);
  console.log(`Patient 1: ${patient1.address}`);
  console.log(`Patient 2: ${patient2.address}`);

  // Connect to deployed contract
  const PrivateRehabRecords = await hre.ethers.getContractFactory("PrivateRehabRecords");
  const contract = PrivateRehabRecords.attach(contractAddress);

  console.log("\n" + "=".repeat(60));
  console.log("Starting Healthcare Workflow Simulation");
  console.log("=".repeat(60));

  // Step 1: Authorize Therapists
  console.log("\n📝 STEP 1: Authorizing Healthcare Providers");
  console.log("-".repeat(60));

  const therapists = [
    { address: therapist1.address, license: "PT-12345-2024", name: "Dr. Smith" },
    { address: therapist2.address, license: "PT-67890-2024", name: "Dr. Johnson" }
  ];

  for (const therapist of therapists) {
    try {
      const tx = await contract.authorizeTherapist(therapist.address, therapist.license);
      await tx.wait();
      console.log(`✅ ${therapist.name} authorized (License: ${therapist.license})`);
    } catch (error) {
      console.log(`⚠️  ${therapist.name} authorization: ${error.message.split('\n')[0]}`);
    }
  }

  // Step 2: Register Patients
  console.log("\n👥 STEP 2: Registering Patients");
  console.log("-".repeat(60));

  const patients = [
    { address: patient1.address, therapist: therapist1.address, therapistName: "Dr. Smith", name: "Patient A" },
    { address: patient2.address, therapist: therapist2.address, therapistName: "Dr. Johnson", name: "Patient B" }
  ];

  for (const patient of patients) {
    try {
      const tx = await contract.registerPatient(patient.address, patient.therapist);
      await tx.wait();
      console.log(`✅ ${patient.name} registered with ${patient.therapistName}`);
    } catch (error) {
      console.log(`⚠️  ${patient.name} registration: ${error.message.split('\n')[0]}`);
    }
  }

  // Step 3: Create Multiple Rehabilitation Records
  console.log("\n💉 STEP 3: Creating Rehabilitation Records");
  console.log("-".repeat(60));

  const exerciseTypes = {
    0: "General",
    1: "Strength Training",
    2: "Cardio",
    3: "Flexibility",
    4: "Balance",
    5: "Coordination"
  };

  // Patient 1 - Progressive recovery over multiple sessions
  const patient1Records = [
    { intensity: 50, pain: 7, mobility: 60, type: 1, duration: 30, day: "Day 1" },
    { intensity: 60, pain: 6, mobility: 65, type: 3, duration: 35, day: "Day 3" },
    { intensity: 70, pain: 5, mobility: 72, type: 1, duration: 40, day: "Day 7" },
    { intensity: 75, pain: 4, mobility: 78, type: 2, duration: 45, day: "Day 14" }
  ];

  console.log(`\n${patient.name} - Progressive Recovery Sessions:`);
  const contractAsTherapist1 = contract.connect(therapist1);

  for (const record of patient1Records) {
    try {
      const tx = await contractAsTherapist1.createRecord(
        patient1.address,
        record.intensity,
        record.pain,
        record.mobility,
        record.type,
        record.duration
      );
      const receipt = await tx.wait();
      console.log(`✅ ${record.day}: Intensity ${record.intensity}%, Pain ${record.pain}/10, Mobility ${record.mobility}% - ${exerciseTypes[record.type]} (${record.duration}min)`);
    } catch (error) {
      console.log(`⚠️  ${record.day}: ${error.message.split('\n')[0]}`);
    }
  }

  // Patient 2 - Different therapy approach
  const patient2Records = [
    { intensity: 40, pain: 8, mobility: 50, type: 3, duration: 25, day: "Week 1" },
    { intensity: 55, pain: 7, mobility: 60, type: 4, duration: 30, day: "Week 2" },
    { intensity: 70, pain: 5, mobility: 75, type: 1, duration: 40, day: "Week 4" }
  ];

  console.log(`\n${patients[1].name} - Recovery Sessions:`);
  const contractAsTherapist2 = contract.connect(therapist2);

  for (const record of patient2Records) {
    try {
      const tx = await contractAsTherapist2.createRecord(
        patient2.address,
        record.intensity,
        record.pain,
        record.mobility,
        record.type,
        record.duration
      );
      await tx.wait();
      console.log(`✅ ${record.day}: Intensity ${record.intensity}%, Pain ${record.pain}/10, Mobility ${record.mobility}% - ${exerciseTypes[record.type]} (${record.duration}min)`);
    } catch (error) {
      console.log(`⚠️  ${record.day}: ${error.message.split('\n')[0]}`);
    }
  }

  // Step 4: Query and Display Statistics
  console.log("\n📊 STEP 4: Healthcare Data Analysis");
  console.log("-".repeat(60));

  try {
    const totalRecords = await contract.getTotalRecords();
    console.log(`Total Records Created: ${totalRecords}`);

    for (const patient of patients) {
      const recordIds = await contract.getPatientRecords(patient.address);
      const profile = await contract.getPatientProfile(patient.address);

      console.log(`\n${patient.name}:`);
      console.log(`  - Total Sessions: ${profile[1]}`);
      console.log(`  - Record IDs: ${recordIds.join(", ")}`);
      console.log(`  - Assigned Therapist: ${profile[3]}`);
      console.log(`  - Registered: ${new Date(Number(profile[2]) * 1000).toLocaleDateString()}`);
    }
  } catch (error) {
    console.log(`⚠️  Statistics: ${error.message.split('\n')[0]}`);
  }

  // Step 5: Demonstrate Record Access and Privacy
  console.log("\n🔐 STEP 5: Privacy and Access Control Demonstration");
  console.log("-".repeat(60));

  try {
    const recordIds = await contract.getPatientRecords(patient1.address);
    if (recordIds.length > 0) {
      const recordId = recordIds[0];
      const metadata = await contract.getRecordMetadata(recordId);
      console.log(`\nRecord #${recordId} Metadata (Public Information):`);
      console.log(`  - Active: ${metadata[0]}`);
      console.log(`  - Timestamp: ${new Date(Number(metadata[1]) * 1000).toLocaleString()}`);
      console.log(`  - Patient: ${metadata[2]}`);
      console.log(`  - Therapist: ${metadata[3]}`);
      console.log(`\n🔒 Note: Actual medical data (intensity, pain, mobility) is encrypted`);
      console.log(`   and only accessible by authorized parties through FHE operations.`);
    }
  } catch (error) {
    console.log(`⚠️  Privacy check: ${error.message.split('\n')[0]}`);
  }

  // Step 6: Record Deactivation Example
  console.log("\n🗑️  STEP 6: Record Lifecycle Management");
  console.log("-".repeat(60));

  try {
    const recordIds = await contract.getPatientRecords(patient1.address);
    if (recordIds.length > 0) {
      const oldRecordId = recordIds[0];
      const tx = await contractAsTherapist1.deactivateRecord(oldRecordId);
      await tx.wait();
      console.log(`✅ Record #${oldRecordId} deactivated (archived)`);
      console.log(`   Historical data preserved but marked inactive`);
    }
  } catch (error) {
    console.log(`⚠️  Deactivation: ${error.message.split('\n')[0]}`);
  }

  // Final Summary
  console.log("\n" + "=".repeat(60));
  console.log("✅ Simulation Complete!");
  console.log("=".repeat(60));

  try {
    const finalStats = {
      totalRecords: await contract.getTotalRecords(),
      owner: await contract.owner(),
      patient1Sessions: (await contract.getPatientProfile(patient1.address))[1],
      patient2Sessions: (await contract.getPatientProfile(patient2.address))[1]
    };

    console.log("\n📈 Final Statistics:");
    console.log(`  - Total Records: ${finalStats.totalRecords}`);
    console.log(`  - ${patients[0].name} Sessions: ${finalStats.patient1Sessions}`);
    console.log(`  - ${patients[1].name} Sessions: ${finalStats.patient2Sessions}`);
    console.log(`  - Contract Owner: ${finalStats.owner}`);

    if (deploymentInfo.network === "sepolia") {
      console.log(`\n🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    }
  } catch (error) {
    console.log(`⚠️  Final stats: ${error.message.split('\n')[0]}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Simulation demonstrates:");
  console.log("  ✓ Multi-therapist authorization");
  console.log("  ✓ Patient registration and assignment");
  console.log("  ✓ Progressive rehabilitation tracking");
  console.log("  ✓ Encrypted medical data storage (FHE)");
  console.log("  ✓ Access control and privacy");
  console.log("  ✓ Record lifecycle management");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });
