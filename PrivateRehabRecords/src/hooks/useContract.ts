import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function recordCounter() view returns (uint256)",
  "function authorizeTherapist(address therapistAddress, string licenseNumber)",
  "function registerPatient(address patientAddress, address assignedTherapist)",
  "function createRecord(address patientAddress, uint32 exerciseIntensity, uint32 painLevel, uint32 mobilityScore, uint8 exerciseType, uint32 sessionDuration)",
  "function getRecordMetadata(uint256 recordId) view returns (bool isActive, uint256 timestamp, address patient, address therapist)",
  "function getPatientRecords(address patientAddress) view returns (uint256[])",
  "function getTherapistRecords(address therapistAddress) view returns (uint256[])",
  "function getPatientProfile(address patientAddress) view returns (bool isRegistered, uint256 totalSessions, uint256 registrationTime, address assignedTherapist)",
  "function getTherapistProfile(address therapistAddress) view returns (bool isAuthorized, string licenseNumber, uint256 registrationTime)",
  "function deactivateRecord(uint256 recordId)",
  "function getTotalRecords() view returns (uint256)",
  "function isRecordActive(uint256 recordId) view returns (bool)"
];

export function useContract(contractAddress: string) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    if (contractAddress && contractAddress !== '0x...' && signer) {
      const contractInstance = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      setContract(contractInstance);
    }
  }, [contractAddress, signer]);

  return { contract, signer, setSigner };
}
