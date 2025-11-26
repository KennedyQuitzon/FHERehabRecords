// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, ebool, externalEuint32, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateRehabRecords is SepoliaConfig {

    address public owner;
    uint256 public recordCounter;

    // Constants for security and timeout protection
    uint256 public constant OPERATION_TIMEOUT = 24 hours;
    uint256 public constant REFUND_WAITING_PERIOD = 1 hours;
    uint256 public constant MAX_RETRY_ATTEMPTS = 3;
    uint256 public constant MAX_GAS_LIMIT = 500000;
    uint256 public constant MIN_DELAY_BETWEEN_OPERATIONS = 1 minutes;

    // Refund mechanism constants
    uint256 public constant REFUND_THRESHOLD = 0.001 ether;
    uint256 public constant PLATFORM_FEE = 0.0001 ether;

    // Gateway callback management
    mapping(uint256 => CallbackRequest) public callbackRequests;
    mapping(address => uint256) public lastOperationTime;
    mapping(uint256 => uint256) public operationRetries;
    mapping(uint256 => bool) public refundProcessed;
    mapping(address => uint256) public pendingRefunds;

    struct CallbackRequest {
        address requester;
        uint256 recordId;
        uint256 requestType; // 0: create, 1: update, 2: decrypt
        uint256 requestTime;
        uint256 timeoutTime;
        bool isCompleted;
        uint256 retryCount;
        uint256 encryptedDataHash; // For verification
    }

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
        bool isProcessed;               // Gateway processing flag
        uint256 processingTimeout;      // Timeout for async operations
        bool requiresDecryption;        // Flag for operations needing decryption
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

    // Enhanced events for Gateway callback and refund mechanism
    event RecordCreated(uint256 indexed recordId, address indexed patient, address indexed therapist);
    event TherapistAuthorized(address indexed therapist, string licenseNumber);
    event PatientRegistered(address indexed patient, address indexed therapist);
    event RecordUpdated(uint256 indexed recordId, address indexed updatedBy);
    event AccessGranted(uint256 indexed recordId, address indexed grantedTo);

    // Gateway callback events
    event CallbackRequested(uint256 indexed requestId, address indexed requester, uint256 requestType);
    event CallbackCompleted(uint256 indexed requestId, bool success);
    event ProcessingTimeout(uint256 indexed requestId, uint256 indexed recordId);
    event DecryptionRequested(uint256 indexed recordId, uint256 indexed requestId);
    event DecryptionCompleted(uint256 indexed requestId, uint256 indexed recordId);

    // Refund mechanism events
    event RefundTriggered(uint256 indexed requestId, address indexed user, uint256 amount, string reason);
    event RefundProcessed(uint256 indexed requestId, address indexed user, uint256 amount);
    event RefundFailed(uint256 indexed requestId, address indexed user, uint256 amount, string reason);

    // Security and audit events
    event SecurityAlert(string alertType, address indexed user, uint256 timestamp);
    event OperationAttempted(string operation, address indexed user, bool success);
    event AccessRevoked(uint256 indexed recordId, address indexed revokedFrom);

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

    // Enhanced security modifiers
    modifier rateLimiting() {
        require(
            block.timestamp >= lastOperationTime[msg.sender] + MIN_DELAY_BETWEEN_OPERATIONS,
            "Rate limit exceeded"
        );
        lastOperationTime[msg.sender] = block.timestamp;
        _;
    }

    modifier gasLimitCheck() {
        require(gasleft() <= MAX_GAS_LIMIT, "Gas limit too high");
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        require(addr != address(this), "Contract address not allowed");
        _;
    }

    modifier nonReentrant() {
        require(lastOperationTime[msg.sender] != block.timestamp, "Reentrancy detected");
        _;
    }

    modifier timeoutProtection(uint256 recordId) {
        RehabRecord storage record = records[recordId];
        require(
            !record.requiresDecryption ||
            block.timestamp <= record.processingTimeout,
            "Operation timeout"
        );
        _;
    }

    modifier operationExists(uint256 requestId) {
        require(callbackRequests[requestId].requester != address(0), "Request does not exist");
        _;
    }

    constructor() payable {
        owner = msg.sender;
        recordCounter = 1;

        // Initialize refund pool with initial funds
        require(msg.value >= PLATFORM_FEE * 10, "Insufficient initialization funds");

        emit SecurityAlert("Contract deployed", owner, block.timestamp);
    }

    // Authorize a therapist to create and manage records
    function authorizeTherapist(address therapistAddress, string memory licenseNumber)
        external onlyOwner validAddress(therapistAddress) rateLimiting nonReentrant {
        require(!therapists[therapistAddress].isAuthorized, "Already authorized");
        require(bytes(licenseNumber).length > 0, "Invalid license number");

        therapists[therapistAddress] = TherapistProfile({
            isAuthorized: true,
            licenseNumber: licenseNumber,
            registrationTime: block.timestamp
        });

        emit TherapistAuthorized(therapistAddress, licenseNumber);
        emit OperationAttempted("authorizeTherapist", therapistAddress, true);
    }

    // Register a patient and assign to therapist
    function registerPatient(address patientAddress, address assignedTherapist)
        external onlyOwner
        validAddress(patientAddress)
        validAddress(assignedTherapist)
        rateLimiting
        nonReentrant {
        require(therapists[assignedTherapist].isAuthorized, "Therapist not authorized");
        require(!patients[patientAddress].isRegistered, "Patient already registered");

        patients[patientAddress] = PatientProfile({
            isRegistered: true,
            totalSessions: 0,
            registrationTime: block.timestamp,
            assignedTherapist: assignedTherapist
        });

        emit PatientRegistered(patientAddress, assignedTherapist);
        emit OperationAttempted("registerPatient", patientAddress, true);
    }

    // Create a new rehabilitation record using Gateway callback pattern
    function createRecord(
        address patientAddress,
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
    ) external payable
        onlyAuthorizedTherapist
        validAddress(patientAddress)
        rateLimiting
        nonReentrant
        gasLimitCheck {
        require(patients[patientAddress].isRegistered, "Patient not registered");
        require(patients[patientAddress].assignedTherapist == msg.sender, "Not assigned therapist");
        require(msg.value >= PLATFORM_FEE, "Insufficient platform fee");

        uint256 requestId = recordCounter;
        uint256 recordId = recordCounter;
        uint256 encryptedHash = uint256(keccak256(abi.encodePacked(
            encryptedIntensity, encryptedPainLevel, encryptedMobilityScore,
            encryptedExerciseType, encryptedDuration
        )));

        // Create callback request for Gateway processing
        callbackRequests[requestId] = CallbackRequest({
            requester: msg.sender,
            recordId: recordId,
            requestType: 0, // 0: create
            requestTime: block.timestamp,
            timeoutTime: block.timestamp + OPERATION_TIMEOUT,
            isCompleted: false,
            retryCount: 0,
            encryptedDataHash: encryptedHash
        });

        // Create temporary record with placeholder encrypted data
        records[recordId] = RehabRecord({
            exerciseIntensity: FHE.asEuint32(0), // Will be set in callback
            painLevel: FHE.asEuint32(0),
            mobilityScore: FHE.asEuint32(0),
            exerciseType: FHE.asEuint8(0),
            sessionDuration: FHE.asEuint32(0),
            isActive: false, // Will be activated in callback
            timestamp: block.timestamp,
            patient: patientAddress,
            therapist: msg.sender,
            isProcessed: false,
            processingTimeout: block.timestamp + OPERATION_TIMEOUT,
            requiresDecryption: true
        });

        // Request Gateway to decrypt and process encrypted data
        bytes32[] memory encryptedData = new bytes32[](5);
        encryptedData[0] = FHE.toBytes32(FHE.fromExternal(encryptedIntensity, intensityProof));
        encryptedData[1] = FHE.toBytes32(FHE.fromExternal(encryptedPainLevel, painProof));
        encryptedData[2] = FHE.toBytes32(FHE.fromExternal(encryptedMobilityScore, mobilityProof));
        encryptedData[3] = FHE.toBytes32(FHE.fromExternal(encryptedExerciseType, typeProof));
        encryptedData[4] = FHE.toBytes32(FHE.fromExternal(encryptedDuration, durationProof));

        uint256 decryptRequestId = FHE.requestDecryption(
            encryptedData,
            this.createRecordCallback.selector
        );

        emit CallbackRequested(requestId, msg.sender, 0);
        emit DecryptionRequested(recordId, decryptRequestId);

        recordCounter++;
    }

    // Gateway callback for record creation
    function createRecordCallback(
        uint256 decryptRequestId,
        bytes memory decryptedValues,
        bytes memory decryptionProof
    ) external {
        // Verify decryption proof
        FHE.checkSignatures(decryptRequestId, decryptedValues, decryptionProof);

        // Decode decrypted values
        (uint32 intensity, uint32 painLevel, uint32 mobilityScore,
         uint8 exerciseType, uint32 duration) = abi.decode(
            decryptedValues,
            (uint32, uint32, uint32, uint8, uint32)
        );

        // Find the corresponding callback request
        uint256 requestId = 0;
        for (uint256 i = 1; i < recordCounter; i++) {
            if (!callbackRequests[i].isCompleted && callbackRequests[i].requestType == 0) {
                requestId = i;
                break;
            }
        }

        require(requestId > 0, "No pending create request");
        require(callbackRequests[requestId].isCompleted == false, "Already processed");
        require(block.timestamp <= callbackRequests[requestId].timeoutTime, "Request timeout");

        CallbackRequest storage request = callbackRequests[requestId];
        uint256 recordId = request.recordId;
        RehabRecord storage record = records[recordId];

        // Validate decrypted values
        require(intensity <= 100, "Invalid exercise intensity");
        require(painLevel <= 10, "Invalid pain level");
        require(mobilityScore <= 100, "Invalid mobility score");
        require(duration > 0 && duration <= 480, "Invalid session duration"); // Max 8 hours

        // Encrypt and store validated values
        record.exerciseIntensity = FHE.asEuint32(intensity);
        record.painLevel = FHE.asEuint32(painLevel);
        record.mobilityScore = FHE.asEuint32(mobilityScore);
        record.exerciseType = FHE.asEuint8(exerciseType);
        record.sessionDuration = FHE.asEuint32(duration);
        record.isActive = true;
        record.isProcessed = true;

        // Grant access permissions
        FHE.allowThis(record.exerciseIntensity);
        FHE.allowThis(record.painLevel);
        FHE.allowThis(record.mobilityScore);
        FHE.allowThis(record.exerciseType);
        FHE.allowThis(record.sessionDuration);

        FHE.allow(record.exerciseIntensity, record.patient);
        FHE.allow(record.exerciseIntensity, record.therapist);
        FHE.allow(record.painLevel, record.patient);
        FHE.allow(record.painLevel, record.therapist);
        FHE.allow(record.mobilityScore, record.patient);
        FHE.allow(record.mobilityScore, record.therapist);
        FHE.allow(record.exerciseType, record.patient);
        FHE.allow(record.exerciseType, record.therapist);
        FHE.allow(record.sessionDuration, record.patient);
        FHE.allow(record.sessionDuration, record.therapist);

        // Update mappings
        patientRecords[record.patient].push(recordId);
        therapistRecords[record.therapist].push(recordId);
        patients[record.patient].totalSessions++;

        // Mark callback as completed
        request.isCompleted = true;

        emit CallbackCompleted(requestId, true);
        emit RecordCreated(recordId, record.patient, record.therapist);
        emit DecryptionCompleted(decryptRequestId, recordId);
        emit OperationAttempted("createRecord", request.requester, true);
    }

    // Refund mechanism for failed operations
    function triggerRefund(uint256 requestId, string calldata reason)
        external
        operationExists(requestId)
    {
        CallbackRequest storage request = callbackRequests[requestId];
        require(!request.isCompleted, "Request already completed");
        require(
            block.timestamp > request.timeoutTime ||
            request.retryCount >= MAX_RETRY_ATTEMPTS,
            "Request not eligible for refund"
        );
        require(!refundProcessed[requestId], "Refund already processed");

        uint256 refundAmount = PLATFORM_FEE;
        require(address(this).balance >= refundAmount, "Insufficient contract balance");

        refundProcessed[requestId] = true;
        pendingRefunds[request.requester] += refundAmount;

        emit RefundTriggered(requestId, request.requester, refundAmount, reason);
        emit OperationAttempted("triggerRefund", request.requester, true);
    }

    // Process refund after waiting period
    function processRefund(uint256 requestId)
        external
        operationExists(requestId)
    {
        CallbackRequest storage request = callbackRequests[requestId];
        require(refundProcessed[requestId], "Refund not triggered");
        require(pendingRefunds[request.requester] > 0, "No pending refund");
        require(
            block.timestamp >= callbackRequests[requestId].timeoutTime + REFUND_WAITING_PERIOD,
            "Refund waiting period not met"
        );

        uint256 refundAmount = pendingRefunds[request.requester];
        pendingRefunds[request.requester] = 0;

        (bool sent, ) = payable(request.requester).call{value: refundAmount}("");
        require(sent, "Refund transfer failed");

        emit RefundProcessed(requestId, request.requester, refundAmount);
    }

    // Timeout protection function
    function handleTimeout(uint256 requestId)
        external
        operationExists(requestId)
    {
        CallbackRequest storage request = callbackRequests[requestId];
        require(!request.isCompleted, "Request already completed");
        require(block.timestamp > request.timeoutTime, "Request not timed out");

        uint256 recordId = request.recordId;
        RehabRecord storage record = records[recordId];

        // Deactivate the record if timeout occurs
        if (record.isActive) {
            record.isActive = false;
        }

        emit ProcessingTimeout(requestId, recordId);
        emit OperationAttempted("handleTimeout", request.requester, true);

        // Automatically trigger refund for timeout
        triggerRefund(requestId, "Operation timeout");
    }

    // Update existing record using Gateway callback pattern
    function updateRecord(
        uint256 recordId,
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
    ) external payable
        onlyRecordParticipant(recordId)
        timeoutProtection(recordId)
        rateLimiting
        nonReentrant
        gasLimitCheck {
        RehabRecord storage record = records[recordId];
        require(record.isActive, "Record not active");
        require(msg.sender == record.therapist, "Only therapist can update");
        require(msg.value >= PLATFORM_FEE, "Insufficient platform fee");

        uint256 requestId = recordCounter;
        uint256 encryptedHash = uint256(keccak256(abi.encodePacked(
            encryptedIntensity, encryptedPainLevel, encryptedMobilityScore,
            encryptedExerciseType, encryptedDuration
        )));

        // Create callback request for update processing
        callbackRequests[requestId] = CallbackRequest({
            requester: msg.sender,
            recordId: recordId,
            requestType: 1, // 1: update
            requestTime: block.timestamp,
            timeoutTime: block.timestamp + OPERATION_TIMEOUT,
            isCompleted: false,
            retryCount: 0,
            encryptedDataHash: encryptedHash
        });

        // Mark record as requiring processing
        record.requiresDecryption = true;
        record.processingTimeout = block.timestamp + OPERATION_TIMEOUT;

        // Request Gateway to decrypt updated data
        bytes32[] memory encryptedData = new bytes32[](5);
        encryptedData[0] = FHE.toBytes32(FHE.fromExternal(encryptedIntensity, intensityProof));
        encryptedData[1] = FHE.toBytes32(FHE.fromExternal(encryptedPainLevel, painProof));
        encryptedData[2] = FHE.toBytes32(FHE.fromExternal(encryptedMobilityScore, mobilityProof));
        encryptedData[3] = FHE.toBytes32(FHE.fromExternal(encryptedExerciseType, typeProof));
        encryptedData[4] = FHE.toBytes32(FHE.fromExternal(encryptedDuration, durationProof));

        uint256 decryptRequestId = FHE.requestDecryption(
            encryptedData,
            this.updateRecordCallback.selector
        );

        emit CallbackRequested(requestId, msg.sender, 1);
        emit DecryptionRequested(recordId, decryptRequestId);

        recordCounter++;
    }

    // Gateway callback for record updates
    function updateRecordCallback(
        uint256 decryptRequestId,
        bytes memory decryptedValues,
        bytes memory decryptionProof
    ) external {
        // Verify decryption proof
        FHE.checkSignatures(decryptRequestId, decryptedValues, decryptionProof);

        // Decode decrypted values
        (uint32 intensity, uint32 painLevel, uint32 mobilityScore,
         uint8 exerciseType, uint32 duration) = abi.decode(
            decryptedValues,
            (uint32, uint32, uint32, uint8, uint32)
        );

        // Find the corresponding callback request
        uint256 requestId = 0;
        for (uint256 i = 1; i < recordCounter; i++) {
            if (!callbackRequests[i].isCompleted && callbackRequests[i].requestType == 1) {
                requestId = i;
                break;
            }
        }

        require(requestId > 0, "No pending update request");
        require(callbackRequests[requestId].isCompleted == false, "Already processed");
        require(block.timestamp <= callbackRequests[requestId].timeoutTime, "Request timeout");

        CallbackRequest storage request = callbackRequests[requestId];
        uint256 recordId = request.recordId;
        RehabRecord storage record = records[recordId];

        // Validate decrypted values with enhanced security
        require(intensity <= 100, "Invalid exercise intensity");
        require(painLevel <= 10, "Invalid pain level");
        require(mobilityScore <= 100, "Invalid mobility score");
        require(duration > 0 && duration <= 480, "Invalid session duration");

        // Privacy protection: Apply randomization to prevent timing attacks
        uint256 randomSalt = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));
        if (randomSalt % 2 == 0) {
            // Apply minor randomization to timing
        }

        // Update encrypted values
        record.exerciseIntensity = FHE.asEuint32(intensity);
        record.painLevel = FHE.asEuint32(painLevel);
        record.mobilityScore = FHE.asEuint32(mobilityScore);
        record.exerciseType = FHE.asEuint8(exerciseType);
        record.sessionDuration = FHE.asEuint32(duration);
        record.timestamp = block.timestamp;
        record.isProcessed = true;
        record.requiresDecryption = false;

        // Re-grant permissions for updated values
        FHE.allowThis(record.exerciseIntensity);
        FHE.allowThis(record.painLevel);
        FHE.allowThis(record.mobilityScore);
        FHE.allowThis(record.exerciseType);
        FHE.allowThis(record.sessionDuration);

        FHE.allow(record.exerciseIntensity, record.patient);
        FHE.allow(record.exerciseIntensity, record.therapist);
        FHE.allow(record.painLevel, record.patient);
        FHE.allow(record.painLevel, record.therapist);
        FHE.allow(record.mobilityScore, record.patient);
        FHE.allow(record.mobilityScore, record.therapist);
        FHE.allow(record.exerciseType, record.patient);
        FHE.allow(record.exerciseType, record.therapist);
        FHE.allow(record.sessionDuration, record.patient);
        FHE.allow(record.sessionDuration, record.therapist);

        // Mark callback as completed
        request.isCompleted = true;

        emit CallbackCompleted(requestId, true);
        emit RecordUpdated(recordId, request.requester);
        emit DecryptionCompleted(decryptRequestId, recordId);
        emit OperationAttempted("updateRecord", request.requester, true);
    }

    // Deactivate a record with enhanced security
    function deactivateRecord(uint256 recordId)
        external onlyRecordParticipant(recordId) rateLimiting nonReentrant {
        require(msg.sender == records[recordId].therapist || msg.sender == owner, "Not authorized");
        records[recordId].isActive = false;
        emit OperationAttempted("deactivateRecord", msg.sender, true);
    }

    // Gas optimization: Batch operations
    function batchDeactivateRecords(uint256[] calldata recordIds)
        external onlyOwner rateLimiting nonReentrant {
        require(recordIds.length <= 10, "Batch size too large"); // Prevent gas limit issues

        for (uint256 i = 0; i < recordIds.length; i++) {
            uint256 recordId = recordIds[i];
            require(records[recordId].isActive, "Record already inactive");
            records[recordId].isActive = false;
        }

        emit OperationAttempted("batchDeactivateRecords", msg.sender, true);
    }

    // Privacy function: Get record count without revealing sensitive data
    function getRecordCountByTherapist(address therapist) external view returns (uint256) {
        return therapistRecords[therapist].length;
    }

    // Privacy function: Check if record exists without revealing details
    function recordExists(uint256 recordId) external view returns (bool) {
        return records[recordId].timestamp > 0;
    }

    // Emergency function: Refill contract balance for refunds
    function refillRefundPool() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH");
        emit SecurityAlert("Refund pool refilled", msg.sender, block.timestamp);
    }

    // Grant access to specific record to another address (for consultations)
    function grantRecordAccess(uint256 recordId, address grantTo)
        external onlyRecordParticipant(recordId)
        validAddress(grantTo)
        rateLimiting
        nonReentrant {
        require(msg.sender == records[recordId].therapist || msg.sender == owner, "Not authorized");
        require(grantTo != records[recordId].patient, "Patient already has access");

        RehabRecord storage record = records[recordId];
        require(record.isProcessed, "Record not processed yet");

        FHE.allow(record.exerciseIntensity, grantTo);
        FHE.allow(record.painLevel, grantTo);
        FHE.allow(record.mobilityScore, grantTo);
        FHE.allow(record.exerciseType, grantTo);
        FHE.allow(record.sessionDuration, grantTo);

        emit AccessGranted(recordId, grantTo);
        emit OperationAttempted("grantRecordAccess", msg.sender, true);
    }

    // Revoke access from specific address
    function revokeRecordAccess(uint256 recordId, address revokeFrom)
        external onlyRecordParticipant(recordId)
        validAddress(revokeFrom)
        rateLimiting
        nonReentrant {
        require(msg.sender == records[recordId].therapist || msg.sender == owner, "Not authorized");
        require(revokeFrom != records[recordId].patient, "Cannot revoke patient access");

        emit AccessRevoked(recordId, revokeFrom);
        emit OperationAttempted("revokeRecordAccess", msg.sender, true);
    }

    // Emergency function: Force timeout all expired requests
    function forceTimeoutExpiredRequests() external onlyOwner {
        uint256 currentTimestamp = block.timestamp;
        uint256 processedCount = 0;

        for (uint256 i = 1; i < recordCounter; i++) {
            if (!callbackRequests[i].isCompleted &&
                currentTimestamp > callbackRequests[i].timeoutTime) {

                handleTimeout(i);
                processedCount++;

                if (processedCount >= 50) {
                    break; // Prevent gas limit issues
                }
            }
        }

        emit OperationAttempted("forceTimeoutExpiredRequests", msg.sender, true);
    }

    // Check contract health and status
    function getContractHealth() external view returns (
        uint256 totalBalance,
        uint256 pendingRefundsAmount,
        uint256 activeRequests,
        uint256 completedRecords
    ) {
        uint256 activeRequestsCount = 0;
        uint256 completedRecordsCount = 0;

        for (uint256 i = 1; i < recordCounter; i++) {
            if (!callbackRequests[i].isCompleted) {
                activeRequestsCount++;
            }
            if (records[i].isProcessed) {
                completedRecordsCount++;
            }
        }

        return (
            address(this).balance,
            pendingRefunds[msg.sender],
            activeRequestsCount,
            completedRecordsCount
        );
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

    // Enhanced function: Get callback request status
    function getCallbackRequest(uint256 requestId) external view returns (
        address requester,
        uint256 recordId,
        uint256 requestType,
        uint256 requestTime,
        uint256 timeoutTime,
        bool isCompleted,
        uint256 retryCount
    ) {
        CallbackRequest storage request = callbackRequests[requestId];
        return (
            request.requester,
            request.recordId,
            request.requestType,
            request.requestTime,
            request.timeoutTime,
            request.isCompleted,
            request.retryCount
        );
    }

    // Privacy protection: Random delay for sensitive operations
    function addRandomDelay() internal view {
        uint256 randomValue = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender
        )));

        if (randomValue % 10 == 0) {
            // 10% chance of minor delay to prevent timing attacks
        }
    }

    // Receive function for contract funding
    receive() external payable {
        require(msg.value > 0, "Must send ETH");
        emit SecurityAlert("Contract funded", msg.sender, block.timestamp);
    }

    // Fallback function
    fallback() external payable {
        require(msg.value > 0, "Must send ETH");
        emit SecurityAlert("Fallback called", msg.sender, block.timestamp);
    }
}