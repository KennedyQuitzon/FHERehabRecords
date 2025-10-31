import { useState } from 'react';
import { ethers } from 'ethers';

interface PatientTabProps {
  contract: ethers.Contract | null;
  onError: (message: string) => void;
}

export function PatientTab({ contract, onError }: PatientTabProps) {
  const [patientAddressView, setPatientAddressView] = useState('');
  const [patientResults, setPatientResults] = useState<JSX.Element | null>(null);

  const getPatientProfile = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      if (!patientAddressView) throw new Error('Please enter patient address');

      const profile = await contract.getPatientProfile(patientAddressView);

      setPatientResults(
        <div className="info-card">
          <div className="info-title">Patient Profile</div>
          <div className="detail-item">
            <div className="detail-label">Registered</div>
            <div className="detail-value">{profile[0] ? 'Yes' : 'No'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Total Sessions</div>
            <div className="detail-value">{profile[1].toString()}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Registration Time</div>
            <div className="detail-value">{new Date(profile[2] * 1000).toLocaleString()}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Assigned Therapist</div>
            <div className="detail-value">{profile[3]}</div>
          </div>
        </div>
      );
    } catch (error) {
      onError(`Error getting patient profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getPatientRecords = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      if (!patientAddressView) throw new Error('Please enter patient address');

      const recordIds = await contract.getPatientRecords(patientAddressView);

      if (recordIds.length === 0) {
        setPatientResults(<div className="info-card">No records found for this patient.</div>);
        return;
      }

      setPatientResults(
        <div className="info-card">
          <div className="info-title">Patient Records</div>
          <div>
            {recordIds.map((id: ethers.BigNumber, index: number) => (
              <div key={index} className="detail-item" style={{ marginBottom: '10px' }}>
                Record ID: {id.toString()}
              </div>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      onError(`Error getting patient records: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="tab-content">
      <div className="info-card">
        <div className="info-title">🏃‍♀️ Patient Functions</div>
        <p>View patient profiles and records.</p>
      </div>

      <div className="form-group">
        <label>Patient Address</label>
        <input
          type="text"
          value={patientAddressView}
          onChange={(e) => setPatientAddressView(e.target.value)}
          placeholder="0x..."
        />
      </div>

      <button className="btn" onClick={getPatientProfile}>
        Get Patient Profile
      </button>
      <button className="btn btn-secondary" onClick={getPatientRecords}>
        Get Patient Records
      </button>

      {patientResults && <div>{patientResults}</div>}
    </div>
  );
}
