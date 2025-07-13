const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivateRehabRecords", function () {
  let rehabRecords;
  let owner;
  let therapist1;
  let therapist2;
  let patient1;
  let patient2;
  let unauthorized;

  beforeEach(async function () {
    // Get signers
    [owner, therapist1, therapist2, patient1, patient2, unauthorized] = await ethers.getSigners();

    // Deploy contract
    const PrivateRehabRecords = await ethers.getContractFactory("PrivateRehabRecords");
    rehabRecords = await PrivateRehabRecords.deploy();
    await rehabRecords.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await rehabRecords.owner()).to.equal(owner.address);
    });

    it("Should initialize record counter to 1", async function () {
      expect(await rehabRecords.recordCounter()).to.equal(1);
    });

    it("Should have zero total records initially", async function () {
      expect(await rehabRecords.getTotalRecords()).to.equal(0);
    });
  });

  describe("Therapist Authorization", function () {
    it("Should allow owner to authorize therapist", async function () {
      const licenseNumber = "PT-12345-2024";
      await expect(rehabRecords.authorizeTherapist(therapist1.address, licenseNumber))
        .to.emit(rehabRecords, "TherapistAuthorized")
        .withArgs(therapist1.address, licenseNumber);

      const profile = await rehabRecords.therapists(therapist1.address);
      expect(profile.isAuthorized).to.be.true;
      expect(profile.licenseNumber).to.equal(licenseNumber);
    });

    it("Should not allow non-owner to authorize therapist", async function () {
      await expect(
        rehabRecords.connect(unauthorized).authorizeTherapist(therapist1.address, "PT-12345")
      ).to.be.revertedWith("Not authorized");
    });

    it("Should allow owner to revoke therapist authorization", async function () {
      await rehabRecords.authorizeTherapist(therapist1.address, "PT-12345");
      await rehabRecords.revokeTherapistAuthorization(therapist1.address);

      const profile = await rehabRecords.therapists(therapist1.address);
      expect(profile.isAuthorized).to.be.false;
    });
  });

  describe("Patient Registration", function () {
    beforeEach(async function () {
      // Authorize therapist first
      await rehabRecords.authorizeTherapist(therapist1.address, "PT-12345");
    });

    it("Should allow owner to register patient", async function () {
      await expect(rehabRecords.registerPatient(patient1.address, therapist1.address))
        .to.emit(rehabRecords, "PatientRegistered")
        .withArgs(patient1.address, therapist1.address);

      const profile = await rehabRecords.patients(patient1.address);
      expect(profile.isRegistered).to.be.true;
      expect(profile.assignedTherapist).to.equal(therapist1.address);
      expect(profile.totalSessions).to.equal(0);
    });

    it("Should not allow registration with unauthorized therapist", async function () {
      await expect(
        rehabRecords.registerPatient(patient1.address, unauthorized.address)
      ).to.be.revertedWith("Therapist not authorized");
    });

    it("Should not allow non-owner to register patient", async function () {
      await expect(
        rehabRecords.connect(unauthorized).registerPatient(patient1.address, therapist1.address)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Record Creation", function () {
    beforeEach(async function () {
      // Setup: authorize therapist and register patient
      await rehabRecords.authorizeTherapist(therapist1.address, "PT-12345");
      await rehabRecords.registerPatient(patient1.address, therapist1.address);
    });

    it("Should allow authorized therapist to create record", async function () {
      await expect(
        rehabRecords.connect(therapist1).createRecord(
          patient1.address,
          75,  // intensity
          5,   // pain
          80,  // mobility
          1,   // exercise type
          45   // duration
        )
      ).to.emit(rehabRecords, "RecordCreated");

      expect(await rehabRecords.getTotalRecords()).to.equal(1);

      const profile = await rehabRecords.patients(patient1.address);
      expect(profile.totalSessions).to.equal(1);
    });

    it("Should not allow unauthorized therapist to create record", async function () {
      await expect(
        rehabRecords.connect(unauthorized).createRecord(
          patient1.address, 75, 5, 80, 1, 45
        )
      ).to.be.revertedWith("Not authorized therapist");
    });

    it("Should not allow therapist to create record for unregistered patient", async function () {
      await expect(
        rehabRecords.connect(therapist1).createRecord(
          patient2.address, 75, 5, 80, 1, 45
        )
      ).to.be.revertedWith("Patient not registered");
    });

    it("Should validate exercise intensity range", async function () {
      await expect(
        rehabRecords.connect(therapist1).createRecord(
          patient1.address, 101, 5, 80, 1, 45
        )
      ).to.be.revertedWith("Invalid exercise intensity");
    });

    it("Should validate pain level range", async function () {
      await expect(
        rehabRecords.connect(therapist1).createRecord(
          patient1.address, 75, 11, 80, 1, 45
        )
      ).to.be.revertedWith("Invalid pain level");
    });

    it("Should validate mobility score range", async function () {
      await expect(
        rehabRecords.connect(therapist1).createRecord(
          patient1.address, 75, 5, 101, 1, 45
        )
      ).to.be.revertedWith("Invalid mobility score");
    });

    it("Should validate session duration", async function () {
      await expect(
        rehabRecords.connect(therapist1).createRecord(
          patient1.address, 75, 5, 80, 1, 0
        )
      ).to.be.revertedWith("Invalid session duration");
    });

    it("Should not allow wrong therapist to create record", async function () {
      // Authorize second therapist
      await rehabRecords.authorizeTherapist(therapist2.address, "PT-67890");

      // Try to create record with wrong therapist
      await expect(
        rehabRecords.connect(therapist2).createRecord(
          patient1.address, 75, 5, 80, 1, 45
        )
      ).to.be.revertedWith("Not assigned therapist");
    });
  });

  describe("Record Update", function () {
    beforeEach(async function () {
      await rehabRecords.authorizeTherapist(therapist1.address, "PT-12345");
      await rehabRecords.registerPatient(patient1.address, therapist1.address);
      await rehabRecords.connect(therapist1).createRecord(
        patient1.address, 75, 5, 80, 1, 45
      );
    });

    it("Should allow therapist to update their record", async function () {
      await expect(
        rehabRecords.connect(therapist1).updateRecord(
          1, 80, 4, 85, 2, 50
        )
      ).to.emit(rehabRecords, "RecordUpdated")
        .withArgs(1, therapist1.address);
    });

    it("Should not allow non-therapist to update record", async function () {
      await expect(
        rehabRecords.connect(unauthorized).updateRecord(
          1, 80, 4, 85, 2, 50
        )
      ).to.be.revertedWith("No access to record");
    });

    it("Should validate update parameters", async function () {
      await expect(
        rehabRecords.connect(therapist1).updateRecord(
          1, 101, 4, 85, 2, 50
        )
      ).to.be.revertedWith("Invalid exercise intensity");
    });
  });

  describe("Record Deactivation", function () {
    beforeEach(async function () {
      await rehabRecords.authorizeTherapist(therapist1.address, "PT-12345");
      await rehabRecords.registerPatient(patient1.address, therapist1.address);
      await rehabRecords.connect(therapist1).createRecord(
        patient1.address, 75, 5, 80, 1, 45
      );
    });

    it("Should allow therapist to deactivate record", async function () {
      await rehabRecords.connect(therapist1).deactivateRecord(1);
      expect(await rehabRecords.isRecordActive(1)).to.be.false;
    });

    it("Should allow owner to deactivate record", async function () {
      await rehabRecords.deactivateRecord(1);
      expect(await rehabRecords.isRecordActive(1)).to.be.false;
    });

    it("Should not allow unauthorized user to deactivate", async function () {
      await expect(
        rehabRecords.connect(unauthorized).deactivateRecord(1)
      ).to.be.revertedWith("No access to record");
    });
  });

  describe("Record Access Control", function () {
    beforeEach(async function () {
      await rehabRecords.authorizeTherapist(therapist1.address, "PT-12345");
      await rehabRecords.registerPatient(patient1.address, therapist1.address);
      await rehabRecords.connect(therapist1).createRecord(
        patient1.address, 75, 5, 80, 1, 45
      );
    });

    it("Should allow therapist to grant access", async function () {
      await expect(
        rehabRecords.connect(therapist1).grantRecordAccess(1, therapist2.address)
      ).to.emit(rehabRecords, "AccessGranted")
        .withArgs(1, therapist2.address);
    });

    it("Should not allow unauthorized user to grant access", async function () {
      await expect(
        rehabRecords.connect(unauthorized).grantRecordAccess(1, therapist2.address)
      ).to.be.revertedWith("No access to record");
    });
  });

  describe("Record Queries", function () {
    beforeEach(async function () {
      await rehabRecords.authorizeTherapist(therapist1.address, "PT-12345");
      await rehabRecords.registerPatient(patient1.address, therapist1.address);
      await rehabRecords.connect(therapist1).createRecord(
        patient1.address, 75, 5, 80, 1, 45
      );
    });

    it("Should return patient record IDs", async function () {
      const records = await rehabRecords.getPatientRecords(patient1.address);
      expect(records.length).to.equal(1);
      expect(records[0]).to.equal(1);
    });

    it("Should return therapist record IDs", async function () {
      const records = await rehabRecords.getTherapistRecords(therapist1.address);
      expect(records.length).to.equal(1);
      expect(records[0]).to.equal(1);
    });

    it("Should return record metadata", async function () {
      const metadata = await rehabRecords.getRecordMetadata(1);
      expect(metadata[0]).to.be.true; // isActive
      expect(metadata[2]).to.equal(patient1.address); // patient
      expect(metadata[3]).to.equal(therapist1.address); // therapist
    });

    it("Should enforce access control on queries", async function () {
      await expect(
        rehabRecords.connect(unauthorized).getPatientRecords(patient1.address)
      ).to.be.revertedWith("No access to patient records");
    });
  });

  describe("Profile Queries", function () {
    beforeEach(async function () {
      await rehabRecords.authorizeTherapist(therapist1.address, "PT-12345");
      await rehabRecords.registerPatient(patient1.address, therapist1.address);
    });

    it("Should return patient profile", async function () {
      const profile = await rehabRecords.getPatientProfile(patient1.address);
      expect(profile[0]).to.be.true; // isRegistered
      expect(profile[1]).to.equal(0); // totalSessions
      expect(profile[3]).to.equal(therapist1.address); // assignedTherapist
    });

    it("Should return therapist profile", async function () {
      const profile = await rehabRecords.getTherapistProfile(therapist1.address);
      expect(profile[0]).to.be.true; // isAuthorized
      expect(profile[1]).to.equal("PT-12345"); // licenseNumber
    });

    it("Should enforce access control on profile queries", async function () {
      await expect(
        rehabRecords.connect(unauthorized).getPatientProfile(patient1.address)
      ).to.be.revertedWith("No access to patient profile");
    });
  });

  describe("Multiple Records Workflow", function () {
    beforeEach(async function () {
      await rehabRecords.authorizeTherapist(therapist1.address, "PT-12345");
      await rehabRecords.registerPatient(patient1.address, therapist1.address);
    });

    it("Should handle multiple records for same patient", async function () {
      // Create 3 records
      await rehabRecords.connect(therapist1).createRecord(patient1.address, 50, 7, 60, 1, 30);
      await rehabRecords.connect(therapist1).createRecord(patient1.address, 65, 5, 70, 2, 35);
      await rehabRecords.connect(therapist1).createRecord(patient1.address, 75, 4, 80, 1, 40);

      expect(await rehabRecords.getTotalRecords()).to.equal(3);

      const profile = await rehabRecords.patients(patient1.address);
      expect(profile.totalSessions).to.equal(3);

      const records = await rehabRecords.getPatientRecords(patient1.address);
      expect(records.length).to.equal(3);
    });

    it("Should maintain separate records for different therapists", async function () {
      // Setup second therapist and patient
      await rehabRecords.authorizeTherapist(therapist2.address, "PT-67890");
      await rehabRecords.registerPatient(patient2.address, therapist2.address);

      // Create records
      await rehabRecords.connect(therapist1).createRecord(patient1.address, 75, 5, 80, 1, 45);
      await rehabRecords.connect(therapist2).createRecord(patient2.address, 70, 6, 75, 2, 40);

      const therapist1Records = await rehabRecords.getTherapistRecords(therapist1.address);
      const therapist2Records = await rehabRecords.getTherapistRecords(therapist2.address);

      expect(therapist1Records.length).to.equal(1);
      expect(therapist2Records.length).to.equal(1);
      expect(therapist1Records[0]).to.not.equal(therapist2Records[0]);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle record counter correctly", async function () {
      await rehabRecords.authorizeTherapist(therapist1.address, "PT-12345");
      await rehabRecords.registerPatient(patient1.address, therapist1.address);

      const initialCounter = await rehabRecords.recordCounter();
      await rehabRecords.connect(therapist1).createRecord(patient1.address, 75, 5, 80, 1, 45);
      const newCounter = await rehabRecords.recordCounter();

      expect(newCounter).to.equal(initialCounter + 1n);
    });

    it("Should return false for non-existent record", async function () {
      expect(await rehabRecords.isRecordActive(999)).to.be.false;
    });

    it("Should handle zero values appropriately", async function () {
      await rehabRecords.authorizeTherapist(therapist1.address, "PT-12345");
      await rehabRecords.registerPatient(patient1.address, therapist1.address);

      // Valid: 0 intensity, pain, mobility, type
      await expect(
        rehabRecords.connect(therapist1).createRecord(patient1.address, 0, 0, 0, 0, 30)
      ).to.not.be.reverted;
    });
  });
});
