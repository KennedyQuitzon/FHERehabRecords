// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateRehabRecords is SepoliaConfig {

    address public owner;
    uint256 public recordCounter;

    struct RehabRecord {
        euint32 exerciseIntensity;      // 0-100 scale, encrypted
        euint32 painLevel;              // 0-10 scale, encrypted
        euint32 mobilityScore;          // 0-100 scale, encrypted
        euint8 exerciseType;            // Exercise category ID, encrypted
        euint32 sessionDuration;        // Duration in minutes, encrypted
        bool isActive;
        uint256 timestamp;
        address patient;
        address therapist;
    }

    struct TherapistProfile {
        bool isAuthorized;
        string licenseNumber;
        uint256 registrationTime;
    }

    struct PatientProfile {
        bool isRegistered;
        uint256 totalSessions;
        uint256 registrationTime;
        address assignedTherapist;
    }

    mapping(uint256 => RehabRecord) public records;
    mapping(address => TherapistProfile) public therapists;
    mapping(address => PatientProfile) public patients;
    mapping(address => uint256[]) public patientRecords;
    mapping(address => uint256[]) public therapistRecords;

    event RecordCreated(uint256 indexed recordId, address indexed patient, address indexed therapist);
    event TherapistAuthorized(address indexed therapist, string licenseNumber);
    event PatientRegistered(address indexed patient, address indexed therapist);
    event RecordUpdated(uint256 indexed recordId, address indexed updatedBy);
    event AccessGranted(uint256 indexed recordId, address indexed grantedTo);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyAuthorizedTherapist() {
        require(therapists[msg.sender].isAuthorized, "Not authorized therapist");
        _;
    }

    modifier onlyRegisteredPatient() {
        require(patients[msg.sender].isRegistered, "Not registered patient");
        _;
    }

    modifier onlyRecordParticipant(uint256 recordId) {
        RehabRecord storage record = records[recordId];
        require(
            msg.sender == record.patient ||
            msg.sender == record.therapist ||
            msg.sender == owner,
            "No access to record"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        recordCounter = 1;
    }

    // Authorize a therapist to create and manage records
    function authorizeTherapist(address therapistAddress, string memory licenseNumber)
        external onlyOwner {
        therapists[therapistAddress] = TherapistProfile({
            isAuthorized: true,
            licenseNumber: licenseNumber,
            registrationTime: block.timestamp
        });

        emit TherapistAuthorized(therapistAddress, licenseNumber);
    }

    // Register a patient and assign to therapist
    function registerPatient(address patientAddress, address assignedTherapist)
        external onlyOwner {
        require(therapists[assignedTherapist].isAuthorized, "Therapist not authorized");

        patients[patientAddress] = PatientProfile({
            isRegistered: true,
            totalSessions: 0,
            registrationTime: block.timestamp,
            assignedTherapist: assignedTherapist
        });

        emit PatientRegistered(patientAddress, assignedTherapist);
    }

    // Create a new rehabilitation record
    function createRecord(
        address patientAddress,
        uint32 _exerciseIntensity,
        uint32 _painLevel,
        uint32 _mobilityScore,
        uint8 _exerciseType,
        uint32 _sessionDuration
    ) external onlyAuthorizedTherapist {
        require(patients[patientAddress].isRegistered, "Patient not registered");
        require(patients[patientAddress].assignedTherapist == msg.sender, "Not assigned therapist");
        require(_exerciseIntensity <= 100, "Invalid exercise intensity");
        require(_painLevel <= 10, "Invalid pain level");
        require(_mobilityScore <= 100, "Invalid mobility score");
        require(_sessionDuration > 0, "Invalid session duration");

        // Encrypt sensitive medical data
        euint32 encryptedIntensity = FHE.asEuint32(_exerciseIntensity);
        euint32 encryptedPainLevel = FHE.asEuint32(_painLevel);
        euint32 encryptedMobilityScore = FHE.asEuint32(_mobilityScore);
        euint8 encryptedExerciseType = FHE.asEuint8(_exerciseType);
        euint32 encryptedDuration = FHE.asEuint32(_sessionDuration);

        uint256 recordId = recordCounter;

        records[recordId] = RehabRecord({
            exerciseIntensity: encryptedIntensity,
            painLevel: encryptedPainLevel,
            mobilityScore: encryptedMobilityScore,
            exerciseType: encryptedExerciseType,
            sessionDuration: encryptedDuration,
            isActive: true,
            timestamp: block.timestamp,
            patient: patientAddress,
            therapist: msg.sender
        });

        // Grant access permissions
        FHE.allowThis(encryptedIntensity);
        FHE.allowThis(encryptedPainLevel);
        FHE.allowThis(encryptedMobilityScore);
        FHE.allowThis(encryptedExerciseType);
        FHE.allowThis(encryptedDuration);

        FHE.allow(encryptedIntensity, patientAddress);
        FHE.allow(encryptedIntensity, msg.sender);
        FHE.allow(encryptedPainLevel, patientAddress);
        FHE.allow(encryptedPainLevel, msg.sender);
        FHE.allow(encryptedMobilityScore, patientAddress);
        FHE.allow(encryptedMobilityScore, msg.sender);
        FHE.allow(encryptedExerciseType, patientAddress);
        FHE.allow(encryptedExerciseType, msg.sender);
        FHE.allow(encryptedDuration, patientAddress);
        FHE.allow(encryptedDuration, msg.sender);

        // Update mappings
        patientRecords[patientAddress].push(recordId);
        therapistRecords[msg.sender].push(recordId);
        patients[patientAddress].totalSessions++;

        recordCounter++;

        emit RecordCreated(recordId, patientAddress, msg.sender);
    }

    // Update existing record (only by assigned therapist)
    function updateRecord(
        uint256 recordId,
        uint32 _exerciseIntensity,
        uint32 _painLevel,
        uint32 _mobilityScore,
        uint8 _exerciseType,
        uint32 _sessionDuration
    ) external onlyRecordParticipant(recordId) {
        RehabRecord storage record = records[recordId];
        require(record.isActive, "Record not active");
        require(msg.sender == record.therapist, "Only therapist can update");
        require(_exerciseIntensity <= 100, "Invalid exercise intensity");
        require(_painLevel <= 10, "Invalid pain level");
        require(_mobilityScore <= 100, "Invalid mobility score");
        require(_sessionDuration > 0, "Invalid session duration");

        // Update encrypted values
        record.exerciseIntensity = FHE.asEuint32(_exerciseIntensity);
        record.painLevel = FHE.asEuint32(_painLevel);
        record.mobilityScore = FHE.asEuint32(_mobilityScore);
        record.exerciseType = FHE.asEuint8(_exerciseType);
        record.sessionDuration = FHE.asEuint32(_sessionDuration);

        // Grant permissions for updated values
        FHE.allowThis(record.exerciseIntensity);
        FHE.allowThis(record.painLevel);
        FHE.allowThis(record.mobilityScore);
        FHE.allowThis(record.exerciseType);
        FHE.allowThis(record.sessionDuration);

        FHE.allow(record.exerciseIntensity, record.patient);
        FHE.allow(record.painLevel, record.patient);
        FHE.allow(record.mobilityScore, record.patient);
        FHE.allow(record.exerciseType, record.patient);
        FHE.allow(record.sessionDuration, record.patient);

        emit RecordUpdated(recordId, msg.sender);
    }

    // Deactivate a record
    function deactivateRecord(uint256 recordId)
        external onlyRecordParticipant(recordId) {
        require(msg.sender == records[recordId].therapist || msg.sender == owner, "Not authorized");
        records[recordId].isActive = false;
    }

    // Grant access to specific record to another address (for consultations)
    function grantRecordAccess(uint256 recordId, address grantTo)
        external onlyRecordParticipant(recordId) {
        require(msg.sender == records[recordId].therapist || msg.sender == owner, "Not authorized");

        RehabRecord storage record = records[recordId];

        FHE.allow(record.exerciseIntensity, grantTo);
        FHE.allow(record.painLevel, grantTo);
        FHE.allow(record.mobilityScore, grantTo);
        FHE.allow(record.exerciseType, grantTo);
        FHE.allow(record.sessionDuration, grantTo);

        emit AccessGranted(recordId, grantTo);
    }

    // Get record metadata (non-sensitive info)
    function getRecordMetadata(uint256 recordId)
        external view onlyRecordParticipant(recordId)
        returns (
            bool isActive,
            uint256 timestamp,
            address patient,
            address therapist
        ) {
        RehabRecord storage record = records[recordId];
        return (
            record.isActive,
            record.timestamp,
            record.patient,
            record.therapist
        );
    }

    // Get patient's record IDs
    function getPatientRecords(address patientAddress)
        external view returns (uint256[] memory) {
        require(
            msg.sender == patientAddress ||
            msg.sender == patients[patientAddress].assignedTherapist ||
            msg.sender == owner,
            "No access to patient records"
        );
        return patientRecords[patientAddress];
    }

    // Get therapist's record IDs
    function getTherapistRecords(address therapistAddress)
        external view returns (uint256[] memory) {
        require(
            msg.sender == therapistAddress ||
            msg.sender == owner,
            "No access to therapist records"
        );
        return therapistRecords[therapistAddress];
    }

    // Get patient profile info
    function getPatientProfile(address patientAddress)
        external view returns (
            bool isRegistered,
            uint256 totalSessions,
            uint256 registrationTime,
            address assignedTherapist
        ) {
        require(
            msg.sender == patientAddress ||
            msg.sender == patients[patientAddress].assignedTherapist ||
            msg.sender == owner,
            "No access to patient profile"
        );

        PatientProfile storage profile = patients[patientAddress];
        return (
            profile.isRegistered,
            profile.totalSessions,
            profile.registrationTime,
            profile.assignedTherapist
        );
    }

    // Get therapist profile info
    function getTherapistProfile(address therapistAddress)
        external view returns (
            bool isAuthorized,
            string memory licenseNumber,
            uint256 registrationTime
        ) {
        require(
            msg.sender == therapistAddress ||
            msg.sender == owner,
            "No access to therapist profile"
        );

        TherapistProfile storage profile = therapists[therapistAddress];
        return (
            profile.isAuthorized,
            profile.licenseNumber,
            profile.registrationTime
        );
    }

    // Emergency function to revoke therapist authorization
    function revokeTherapistAuthorization(address therapistAddress)
        external onlyOwner {
        therapists[therapistAddress].isAuthorized = false;
    }

    // Get total number of records
    function getTotalRecords() external view returns (uint256) {
        return recordCounter - 1;
    }

    // Check if record exists and is active
    function isRecordActive(uint256 recordId) external view returns (bool) {
        return records[recordId].isActive && records[recordId].timestamp > 0;
    }
}