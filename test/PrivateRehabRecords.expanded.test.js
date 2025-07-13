const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PrivateRehabRecords - Comprehensive Test Suite", function () {
  // Fixture for deployment
  async function deployContractFixture() {
    const [owner, therapist1, therapist2, therapist3, patient1, patient2, patient3, unauthorized] =
      await ethers.getSigners();

    const PrivateRehabRecords = await ethers.getContractFactory("PrivateRehabRecords");
    const rehabRecords = await PrivateRehabRecords.deploy();
    await rehabRecords.waitForDeployment();

    return {
      rehabRecords,
      owner,
      therapist1,
      therapist2,
      therapist3,
      patient1,
      patient2,
      patient3,
      unauthorized
    };
  }

  describe("1. Deployment and Initialization (5 tests)", function () {
    it("1.1 Should deploy with correct owner", async function () {
      const { rehabRecords, owner } = await loadFixture(deployContractFixture);
      expect(await rehabRecords.owner()).to.equal(owner.address);
    });

    it("1.2 Should initialize record counter to 1", async function () {
      const { rehabRecords } = await loadFixture(deployContractFixture);
      expect(await rehabRecords.recordCounter()).to.equal(1);
    });

    it("1.3 Should have zero total records initially", async function () {
      const { rehabRecords } = await loadFixture(deployContractFixture);
      expect(await rehabRecords.getTotalRecords()).to.equal(0);
    });

    it("1.4 Should have valid contract address", async function () {
      const { rehabRecords } = await loadFixture(deployContractFixture);
      const address = await rehabRecords.getAddress();
      expect(address).to.be.properAddress;
      expect(address).to.not.equal(ethers.ZeroAddress);
    });

    it("1.5 Should have no authorized therapists initially", async function () {
      const { rehabRecords, therapist1 } = await loadFixture(deployContractFixture);
      const profile = await rehabRecords.therapists(therapist1.address);
      expect(profile.isAuthorized).to.be.false;
    });
  });

  describe("2. Therapist Authorization (8 tests)", function () {
    it("2.1 Should allow owner to authorize therapist with license", async function () {
      const { rehabRecords, therapist1 } = await loadFixture(deployContractFixture);
      const licenseNumber = "MED-LIC-123456";

      await expect(rehabRecords.authorizeTherapist(therapist1.address, licenseNumber))
        .to.emit(rehabRecords, "TherapistAuthorized")
        .withArgs(therapist1.address, licenseNumber);

      const profile = await rehabRecords.therapists(therapist1.address);
      expect(profile.isAuthorized).to.be.true;
      expect(profile.licenseNumber).to.equal(licenseNumber);
    });

    it("2.2 Should not allow non-owner to authorize therapist", async function () {
      const { rehabRecords, therapist1, unauthorized } = await loadFixture(deployContractFixture);

      await expect(
        rehabRecords.connect(unauthorized).authorizeTherapist(therapist1.address, "LIC-123")
      ).to.be.revertedWith("Not authorized");
    });

    it("2.3 Should allow owner to revoke therapist authorization", async function () {
      const { rehabRecords, therapist1 } = await loadFixture(deployContractFixture);

      await rehabRecords.authorizeTherapist(therapist1.address, "LIC-123");
      await rehabRecords.revokeTherapistAuthorization(therapist1.address);

      const profile = await rehabRecords.therapists(therapist1.address);
      expect(profile.isAuthorized).to.be.false;
    });

    it("2.4 Should not allow non-owner to revoke authorization", async function () {
      const { rehabRecords, therapist1, unauthorized } = await loadFixture(deployContractFixture);

      await rehabRecords.authorizeTherapist(therapist1.address, "LIC-123");

      await expect(
        rehabRecords.connect(unauthorized).revokeTherapistAuthorization(therapist1.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("2.5 Should authorize multiple therapists", async function () {
      const { rehabRecords, therapist1, therapist2, therapist3 } = await loadFixture(deployContractFixture);

      await rehabRecords.authorizeTherapist(therapist1.address, "LIC-001");
      await rehabRecords.authorizeTherapist(therapist2.address, "LIC-002");
      await rehabRecords.authorizeTherapist(therapist3.address, "LIC-003");

      expect((await rehabRecords.therapists(therapist1.address)).isAuthorized).to.be.true;
      expect((await rehabRecords.therapists(therapist2.address)).isAuthorized).to.be.true;
      expect((await rehabRecords.therapists(therapist3.address)).isAuthorized).to.be.true;
    });

    it("2.6 Should store correct registration timestamp", async function () {
      const { rehabRecords, therapist1 } = await loadFixture(deployContractFixture);

      const tx = await rehabRecords.authorizeTherapist(therapist1.address, "LIC-123");
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const profile = await rehabRecords.therapists(therapist1.address);
      expect(profile.registrationTime).to.equal(block.timestamp);
    });

    it("2.7 Should allow re-authorization of revoked therapist", async function () {
      const { rehabRecords, therapist1 } = await loadFixture(deployContractFixture);

      await rehabRecords.authorizeTherapist(therapist1.address, "LIC-001");
      await rehabRecords.revokeTherapistAuthorization(therapist1.address);
      await rehabRecords.authorizeTherapist(therapist1.address, "LIC-002");

      const profile = await rehabRecords.therapists(therapist1.address);
      expect(profile.isAuthorized).to.be.true;
      expect(profile.licenseNumber).to.equal("LIC-002");
    });

    it("2.8 Should handle empty license number", async function () {
      const { rehabRecords, therapist1 } = await loadFixture(deployContractFixture);

      await expect(
        rehabRecords.authorizeTherapist(therapist1.address, "")
      ).to.not.be.reverted;
    });
  });

  describe("3. Patient Registration (8 tests)", function () {
    it("3.1 Should allow owner to register patient", async function () {
      const { rehabRecords, therapist1, patient1 } = await loadFixture(deployContractFixture);

      await rehabRecords.authorizeTherapist(therapist1.address, "LIC-123");

      await expect(rehabRecords.registerPatient(patient1.address, therapist1.address))
        .to.emit(rehabRecords, "PatientRegistered")
        .withArgs(patient1.address, therapist1.address);

      const profile = await rehabRecords.patients(patient1.address);
      expect(profile.isRegistered).to.be.true;
      expect(profile.assignedTherapist).to.equal(therapist1.address);
      expect(profile.totalSessions).to.equal(0);
    });

    it("3.2 Should not register patient with unauthorized therapist", async function () {
      const { rehabRecords, therapist1, patient1 } = await loadFixture(deployContractFixture);

      await expect(
        rehabRecords.registerPatient(patient1.address, therapist1.address)
      ).to.be.revertedWith("Therapist not authorized");
    });

    it("3.3 Should not allow non-owner to register patient", async function () {
      const { rehabRecords, therapist1, patient1, unauthorized } = await loadFixture(deployContractFixture);

      await rehabRecords.authorizeTherapist(therapist1.address, "LIC-123");

      await expect(
        rehabRecords.connect(unauthorized).registerPatient(patient1.address, therapist1.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("3.4 Should register multiple patients", async function () {
      const { rehabRecords, therapist1, patient1, patient2, patient3 } = await loadFixture(deployContractFixture);

      await rehabRecords.authorizeTherapist(therapist1.address, "LIC-123");
      await rehabRecords.registerPatient(patient1.address, therapist1.address);
      await rehabRecords.registerPatient(patient2.address, therapist1.address);
      await rehabRecords.registerPatient(patient3.address, therapist1.address);

      expect((await rehabRecords.patients(patient1.address)).isRegistered).to.be.true;
      expect((await rehabRecords.patients(patient2.address)).isRegistered).to.be.true;
      expect((await rehabRecords.patients(patient3.address)).isRegistered).to.be.true;
    });

    it("3.5 Should assign patients to different therapists", async function () {
      const { rehabRecords, therapist1, therapist2, patient1, patient2 } = await loadFixture(deployContractFixture);

      await rehabRecords.authorizeTherapist(therapist1.address, "LIC-001");
      await rehabRecords.authorizeTherapist(therapist2.address, "LIC-002");
      await rehabRecords.registerPatient(patient1.address, therapist1.address);
      await rehabRecords.registerPatient(patient2.address, therapist2.address);

      expect((await rehabRecords.patients(patient1.address)).assignedTherapist).to.equal(therapist1.address);
      expect((await rehabRecords.patients(patient2.address)).assignedTherapist).to.equal(therapist2.address);
    });

    it("3.6 Should store registration timestamp", async function () {
      const { rehabRecords, therapist1, patient1 } = await loadFixture(deployContractFixture);

      await rehabRecords.authorizeTherapist(therapist1.address, "LIC-123");
      const tx = await rehabRecords.registerPatient(patient1.address, therapist1.address);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const profile = await rehabRecords.patients(patient1.address);
      expect(profile.registrationTime).to.equal(block.timestamp);
    });

    it("3.7 Should initialize total sessions to zero", async function () {
      const { rehabRecords, therapist1, patient1 } = await loadFixture(deployContractFixture);

      await rehabRecords.authorizeTherapist(therapist1.address, "LIC-123");
      await rehabRecords.registerPatient(patient1.address, therapist1.address);

      const profile = await rehabRecords.patients(patient1.address);
      expect(profile.totalSessions).to.equal(0);
    });

    it("3.8 Should allow re-registration of patient", async function () {
      const { rehabRecords, therapist1, therapist2, patient1 } = await loadFixture(deployContractFixture);

      await rehabRecords.authorizeTherapist(therapist1.address, "LIC-001");
      await rehabRecords.authorizeTherapist(therapist2.address, "LIC-002");

      await rehabRecords.registerPatient(patient1.address, therapist1.address);
      await rehabRecords.registerPatient(patient1.address, therapist2.address);

      const profile = await rehabRecords.patients(patient1.address);
      expect(profile.assignedTherapist).to.equal(therapist2.address);
    });
  });

  describe("4. Record Creation (10 tests)", function () {
    async function setupTherapistAndPatient() {
      const fixture = await loadFixture(deployContractFixture);
      await fixture.rehabRecords.authorizeTherapist(fixture.therapist1.address, "LIC-123");
      await fixture.rehabRecords.registerPatient(fixture.patient1.address, fixture.therapist1.address);
      return fixture;
    }

    it("4.1 Should create record with valid parameters", async function () {
      const { rehabRecords, therapist1, patient1 } = await setupTherapistAndPatient();

      await expect(
        rehabRecords.connect(therapist1).createRecord(patient1.address, 75, 5, 80, 1, 45)
      ).to.emit(rehabRecords, "RecordCreated");

      expect(await rehabRecords.getTotalRecords()).to.equal(1);
    });

    it("4.2 Should increment patient session count", async function () {
      const { rehabRecords, therapist1, patient1 } = await setupTherapistAndPatient();

      await rehabRecords.connect(therapist1).createRecord(patient1.address, 75, 5, 80, 1, 45);

      const profile = await rehabRecords.patients(patient1.address);
      expect(profile.totalSessions).to.equal(1);
    });

    it("4.3 Should not allow unauthorized therapist to create record", async function () {
      const { rehabRecords, patient1, unauthorized } = await setupTherapistAndPatient();

      await expect(
        rehabRecords.connect(unauthorized).createRecord(patient1.address, 75, 5, 80, 1, 45)
      ).to.be.revertedWith("Not authorized therapist");
    });

    it("4.4 Should not create record for unregistered patient", async function () {
      const { rehabRecords, therapist1, patient2 } = await setupTherapistAndPatient();

      await expect(
        rehabRecords.connect(therapist1).createRecord(patient2.address, 75, 5, 80, 1, 45)
      ).to.be.revertedWith("Patient not registered");
    });

    it("4.5 Should validate exercise intensity maximum (100)", async function () {
      const { rehabRecords, therapist1, patient1 } = await setupTherapistAndPatient();

      await expect(
        rehabRecords.connect(therapist1).createRecord(patient1.address, 101, 5, 80, 1, 45)
      ).to.be.revertedWith("Invalid exercise intensity");
    });

    it("4.6 Should validate pain level maximum (10)", async function () {
      const { rehabRecords, therapist1, patient1 } = await setupTherapistAndPatient();

      await expect(
        rehabRecords.connect(therapist1).createRecord(patient1.address, 75, 11, 80, 1, 45)
      ).to.be.revertedWith("Invalid pain level");
    });

    it("4.7 Should validate mobility score maximum (100)", async function () {
      const { rehabRecords, therapist1, patient1 } = await setupTherapistAndPatient();

      await expect(
        rehabRecords.connect(therapist1).createRecord(patient1.address, 75, 5, 101, 1, 45)
      ).to.be.revertedWith("Invalid mobility score");
    });

    it("4.8 Should not allow zero session duration", async function () {
      const { rehabRecords, therapist1, patient1 } = await setupTherapistAndPatient();

      await expect(
        rehabRecords.connect(therapist1).createRecord(patient1.address, 75, 5, 80, 1, 0)
      ).to.be.revertedWith("Invalid session duration");
    });

    it("4.9 Should not allow wrong therapist to create record", async function () {
      const { rehabRecords, therapist1, therapist2, patient1 } = await setupTherapistAndPatient();

      await rehabRecords.authorizeTherapist(therapist2.address, "LIC-456");

      await expect(
        rehabRecords.connect(therapist2).createRecord(patient1.address, 75, 5, 80, 1, 45)
      ).to.be.revertedWith("Not assigned therapist");
    });

    it("4.10 Should increment record counter", async function () {
      const { rehabRecords, therapist1, patient1 } = await setupTherapistAndPatient();

      const initialCounter = await rehabRecords.recordCounter();
      await rehabRecords.connect(therapist1).createRecord(patient1.address, 75, 5, 80, 1, 45);
      const newCounter = await rehabRecords.recordCounter();

      expect(newCounter).to.equal(initialCounter + 1n);
    });
  });

  describe("5. Record Update (6 tests)", function () {
    async function setupWithRecord() {
      const fixture = await loadFixture(deployContractFixture);
      await fixture.rehabRecords.authorizeTherapist(fixture.therapist1.address, "LIC-123");
      await fixture.rehabRecords.registerPatient(fixture.patient1.address, fixture.therapist1.address);
      await fixture.rehabRecords.connect(fixture.therapist1).createRecord(
        fixture.patient1.address, 75, 5, 80, 1, 45
      );
      return fixture;
    }

    it("5.1 Should allow therapist to update their record", async function () {
      const { rehabRecords, therapist1 } = await setupWithRecord();

      await expect(
        rehabRecords.connect(therapist1).updateRecord(1, 80, 4, 85, 2, 50)
      ).to.emit(rehabRecords, "RecordUpdated")
        .withArgs(1, therapist1.address);
    });

    it("5.2 Should not allow non-therapist to update record", async function () {
      const { rehabRecords, unauthorized } = await setupWithRecord();

      await expect(
        rehabRecords.connect(unauthorized).updateRecord(1, 80, 4, 85, 2, 50)
      ).to.be.revertedWith("No access to record");
    });

    it("5.3 Should not allow patient to update record", async function () {
      const { rehabRecords, patient1 } = await setupWithRecord();

      await expect(
        rehabRecords.connect(patient1).updateRecord(1, 80, 4, 85, 2, 50)
      ).to.be.revertedWith("Only therapist can update");
    });

    it("5.4 Should validate update parameters - intensity", async function () {
      const { rehabRecords, therapist1 } = await setupWithRecord();

      await expect(
        rehabRecords.connect(therapist1).updateRecord(1, 101, 4, 85, 2, 50)
      ).to.be.revertedWith("Invalid exercise intensity");
    });

    it("5.5 Should validate update parameters - pain", async function () {
      const { rehabRecords, therapist1 } = await setupWithRecord();

      await expect(
        rehabRecords.connect(therapist1).updateRecord(1, 80, 11, 85, 2, 50)
      ).to.be.revertedWith("Invalid pain level");
    });

    it("5.6 Should not update inactive record", async function () {
      const { rehabRecords, therapist1 } = await setupWithRecord();

      await rehabRecords.connect(therapist1).deactivateRecord(1);

      await expect(
        rehabRecords.connect(therapist1).updateRecord(1, 80, 4, 85, 2, 50)
      ).to.be.revertedWith("Record not active");
    });
  });

  describe("6. Record Deactivation (4 tests)", function () {
    async function setupWithRecord() {
      const fixture = await loadFixture(deployContractFixture);
      await fixture.rehabRecords.authorizeTherapist(fixture.therapist1.address, "LIC-123");
      await fixture.rehabRecords.registerPatient(fixture.patient1.address, fixture.therapist1.address);
      await fixture.rehabRecords.connect(fixture.therapist1).createRecord(
        fixture.patient1.address, 75, 5, 80, 1, 45
      );
      return fixture;
    }

    it("6.1 Should allow therapist to deactivate record", async function () {
      const { rehabRecords, therapist1 } = await setupWithRecord();

      await rehabRecords.connect(therapist1).deactivateRecord(1);
      expect(await rehabRecords.isRecordActive(1)).to.be.false;
    });

    it("6.2 Should allow owner to deactivate record", async function () {
      const { rehabRecords, owner } = await setupWithRecord();

      await rehabRecords.connect(owner).deactivateRecord(1);
      expect(await rehabRecords.isRecordActive(1)).to.be.false;
    });

    it("6.3 Should not allow patient to deactivate record", async function () {
      const { rehabRecords, patient1 } = await setupWithRecord();

      await expect(
        rehabRecords.connect(patient1).deactivateRecord(1)
      ).to.be.revertedWith("Not authorized");
    });

    it("6.4 Should not allow unauthorized user to deactivate", async function () {
      const { rehabRecords, unauthorized } = await setupWithRecord();

      await expect(
        rehabRecords.connect(unauthorized).deactivateRecord(1)
      ).to.be.revertedWith("No access to record");
    });
  });

  describe("7. Access Control and Queries (4 tests)", function () {
    async function setupWithRecord() {
      const fixture = await loadFixture(deployContractFixture);
      await fixture.rehabRecords.authorizeTherapist(fixture.therapist1.address, "LIC-123");
      await fixture.rehabRecords.registerPatient(fixture.patient1.address, fixture.therapist1.address);
      await fixture.rehabRecords.connect(fixture.therapist1).createRecord(
        fixture.patient1.address, 75, 5, 80, 1, 45
      );
      return fixture;
    }

    it("7.1 Should return patient record IDs", async function () {
      const { rehabRecords, patient1 } = await setupWithRecord();

      const records = await rehabRecords.getPatientRecords(patient1.address);
      expect(records.length).to.equal(1);
      expect(records[0]).to.equal(1);
    });

    it("7.2 Should return therapist record IDs", async function () {
      const { rehabRecords, therapist1 } = await setupWithRecord();

      const records = await rehabRecords.getTherapistRecords(therapist1.address);
      expect(records.length).to.equal(1);
      expect(records[0]).to.equal(1);
    });

    it("7.3 Should return record metadata", async function () {
      const { rehabRecords, patient1, therapist1 } = await setupWithRecord();

      const metadata = await rehabRecords.getRecordMetadata(1);
      expect(metadata[0]).to.be.true; // isActive
      expect(metadata[2]).to.equal(patient1.address); // patient
      expect(metadata[3]).to.equal(therapist1.address); // therapist
    });

    it("7.4 Should enforce access control on queries", async function () {
      const { rehabRecords, patient1, unauthorized } = await setupWithRecord();

      await expect(
        rehabRecords.connect(unauthorized).getPatientRecords(patient1.address)
      ).to.be.revertedWith("No access to patient records");
    });
  });

  // Continue in next message...
});
