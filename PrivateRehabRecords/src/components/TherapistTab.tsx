import { useState } from 'react';
import { ethers } from 'ethers';

interface TherapistTabProps {
  contract: ethers.Contract | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function TherapistTab({ contract, onSuccess, onError }: TherapistTabProps) {
  const [therapistAddress, setTherapistAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [patientAddressReg, setPatientAddressReg] = useState('');
  const [assignedTherapistAddress, setAssignedTherapistAddress] = useState('');
  const [therapistResults, setTherapistResults] = useState<JSX.Element | null>(null);

  const authorizeTherapist = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      if (!therapistAddress || !licenseNumber) throw new Error('Please fill in all fields');

      const tx = await contract.authorizeTherapist(therapistAddress, licenseNumber);
      onSuccess('Transaction sent. Waiting for confirmation...');

      await tx.wait();
      onSuccess('Therapist authorized successfully!');

      setTherapistAddress('');
      setLicenseNumber('');
    } catch (error) {
      onError(`Error authorizing therapist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getTherapistProfile = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      if (!therapistAddress) throw new Error('Please enter therapist address');

      const profile = await contract.getTherapistProfile(therapistAddress);

      setTherapistResults(
        <div className="info-card">
          <div className="info-title">Therapist Profile</div>
          <div className="detail-item">
            <div className="detail-label">Authorized</div>
            <div className="detail-value">{profile[0] ? 'Yes' : 'No'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">License Number</div>
            <div className="detail-value">{profile[1]}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Registration Time</div>
            <div className="detail-value">{new Date(profile[2] * 1000).toLocaleString()}</div>
          </div>
        </div>
      );
    } catch (error) {
      onError(`Error getting therapist profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const registerPatient = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      if (!patientAddressReg || !assignedTherapistAddress) throw new Error('Please fill in all fields');

      const tx = await contract.registerPatient(patientAddressReg, assignedTherapistAddress);
      onSuccess('Transaction sent. Waiting for confirmation...');

      await tx.wait();
      onSuccess('Patient registered successfully!');

      setPatientAddressReg('');
      setAssignedTherapistAddress('');
    } catch (error) {
      onError(`Error registering patient: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="tab-content">
      <div className="info-card">
        <div className="info-title">👨‍⚕️ Therapist Functions</div>
        <p>Authorized therapists can create and manage patient records.</p>
      </div>

      <div className="form-group">
        <label>Therapist Address</label>
        <input
          type="text"
          value={therapistAddress}
          onChange={(e) => setTherapistAddress(e.target.value)}
          placeholder="0x..."
        />
      </div>

      <div className="form-group">
        <label>License Number</label>
        <input
          type="text"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          placeholder="Enter license number"
        />
      </div>

      <button className="btn" onClick={authorizeTherapist}>
        Authorize Therapist
      </button>
      <button className="btn btn-secondary" onClick={getTherapistProfile}>
        Get Profile
      </button>

      <div className="form-group" style={{ marginTop: '30px' }}>
        <label>Patient Address for Registration</label>
        <input
          type="text"
          value={patientAddressReg}
          onChange={(e) => setPatientAddressReg(e.target.value)}
          placeholder="0x..."
        />
      </div>

      <div className="form-group">
        <label>Assigned Therapist Address</label>
        <input
          type="text"
          value={assignedTherapistAddress}
          onChange={(e) => setAssignedTherapistAddress(e.target.value)}
          placeholder="0x..."
        />
      </div>

      <button className="btn" onClick={registerPatient}>
        Register Patient
      </button>

      {therapistResults && <div>{therapistResults}</div>}
    </div>
  );
}
