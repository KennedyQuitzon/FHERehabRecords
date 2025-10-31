import { useState } from 'react';
import { ethers } from 'ethers';

interface RecordsTabProps {
  contract: ethers.Contract | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onRecordCreated: () => void;
}

export function RecordsTab({ contract, onSuccess, onError, onRecordCreated }: RecordsTabProps) {
  const [recordPatientAddress, setRecordPatientAddress] = useState('');
  const [exerciseIntensity, setExerciseIntensity] = useState('');
  const [painLevel, setPainLevel] = useState('');
  const [mobilityScore, setMobilityScore] = useState('');
  const [exerciseType, setExerciseType] = useState('1');
  const [sessionDuration, setSessionDuration] = useState('');
  const [recordIdView, setRecordIdView] = useState('');
  const [recordResults, setRecordResults] = useState<JSX.Element | null>(null);

  const createRecord = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');

      const intensity = parseInt(exerciseIntensity);
      const pain = parseInt(painLevel);
      const mobility = parseInt(mobilityScore);
      const type = parseInt(exerciseType);
      const duration = parseInt(sessionDuration);

      if (
        !recordPatientAddress ||
        isNaN(intensity) ||
        isNaN(pain) ||
        isNaN(mobility) ||
        isNaN(type) ||
        isNaN(duration)
      ) {
        throw new Error('Please fill in all fields with valid values');
      }

      const tx = await contract.createRecord(
        recordPatientAddress,
        intensity,
        pain,
        mobility,
        type,
        duration
      );

      onSuccess('Transaction sent. Waiting for confirmation...');

      await tx.wait();
      onSuccess('Record created successfully!');

      setRecordPatientAddress('');
      setExerciseIntensity('');
      setPainLevel('');
      setMobilityScore('');
      setSessionDuration('');

      onRecordCreated();
    } catch (error) {
      onError(`Error creating record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getRecordMetadata = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');

      const recordId = parseInt(recordIdView);
      if (isNaN(recordId)) throw new Error('Please enter valid record ID');

      const metadata = await contract.getRecordMetadata(recordId);

      setRecordResults(
        <div className="info-card">
          <div className="info-title">Record #{recordId} Metadata</div>
          <div className="detail-item">
            <div className="detail-label">Status</div>
            <div className="detail-value">{metadata[0] ? 'Active' : 'Inactive'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Timestamp</div>
            <div className="detail-value">{new Date(metadata[1] * 1000).toLocaleString()}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Patient</div>
            <div className="detail-value">{metadata[2]}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Therapist</div>
            <div className="detail-value">{metadata[3]}</div>
          </div>
        </div>
      );
    } catch (error) {
      onError(`Error getting record metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deactivateRecord = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');

      const recordId = parseInt(recordIdView);
      if (isNaN(recordId)) throw new Error('Please enter valid record ID');

      const tx = await contract.deactivateRecord(recordId);
      onSuccess('Transaction sent. Waiting for confirmation...');

      await tx.wait();
      onSuccess('Record deactivated successfully!');
    } catch (error) {
      onError(`Error deactivating record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="tab-content">
      <div className="info-card">
        <div className="info-title">📝 Record Management</div>
        <p>Create and manage rehabilitation records with encrypted data.</p>
      </div>

      <div className="two-column">
        <div>
          <div className="form-group">
            <label>Patient Address</label>
            <input
              type="text"
              value={recordPatientAddress}
              onChange={(e) => setRecordPatientAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div className="form-group">
            <label>Exercise Intensity (0-100)</label>
            <input
              type="number"
              value={exerciseIntensity}
              onChange={(e) => setExerciseIntensity(e.target.value)}
              min="0"
              max="100"
              placeholder="75"
            />
          </div>

          <div className="form-group">
            <label>Pain Level (0-10)</label>
            <input
              type="number"
              value={painLevel}
              onChange={(e) => setPainLevel(e.target.value)}
              min="0"
              max="10"
              placeholder="3"
            />
          </div>
        </div>

        <div>
          <div className="form-group">
            <label>Mobility Score (0-100)</label>
            <input
              type="number"
              value={mobilityScore}
              onChange={(e) => setMobilityScore(e.target.value)}
              min="0"
              max="100"
              placeholder="85"
            />
          </div>

          <div className="form-group">
            <label>Exercise Type</label>
            <select value={exerciseType} onChange={(e) => setExerciseType(e.target.value)}>
              <option value="1">Strength Training</option>
              <option value="2">Cardio</option>
              <option value="3">Flexibility</option>
              <option value="4">Balance</option>
              <option value="5">Coordination</option>
            </select>
          </div>

          <div className="form-group">
            <label>Session Duration (minutes)</label>
            <input
              type="number"
              value={sessionDuration}
              onChange={(e) => setSessionDuration(e.target.value)}
              min="1"
              placeholder="45"
            />
          </div>
        </div>
      </div>

      <button className="btn" onClick={createRecord}>
        Create Record
      </button>

      <div style={{ marginTop: '30px' }}>
        <div className="form-group">
          <label>Record ID for Viewing</label>
          <input
            type="number"
            value={recordIdView}
            onChange={(e) => setRecordIdView(e.target.value)}
            placeholder="1"
          />
        </div>

        <button className="btn btn-secondary" onClick={getRecordMetadata}>
          Get Record Metadata
        </button>
        <button className="btn btn-secondary" onClick={deactivateRecord}>
          Deactivate Record
        </button>
      </div>

      {recordResults && <div>{recordResults}</div>}
    </div>
  );
}
