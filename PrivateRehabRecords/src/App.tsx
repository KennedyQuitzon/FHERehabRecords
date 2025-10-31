import { useState, useEffect } from 'react';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';
import { OverviewTab } from './components/OverviewTab';
import { TherapistTab } from './components/TherapistTab';
import { PatientTab } from './components/PatientTab';
import { RecordsTab } from './components/RecordsTab';

type TabType = 'overview' | 'therapist' | 'patient' | 'records';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [contractAddress, setContractAddress] = useState('0x9C434EDeBB2aA48400f96167977B88B070bb74f3');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { isConnected, account, signer, error: walletError, connectWallet } = useWallet();
  const { contract, setSigner } = useContract(contractAddress);

  useEffect(() => {
    if (signer) {
      setSigner(signer);
    }
  }, [signer, setSigner]);

  useEffect(() => {
    if (walletError) {
      showError(walletError);
    }
  }, [walletError]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const showSuccess = (text: string) => showMessage('success', text);
  const showError = (text: string) => showMessage('error', text);

  const handleRecordCreated = () => {
    // Trigger refresh of overview stats if needed
  };

  return (
    <div className="container">
      {message && (
        <div className={message.type}>
          {message.text}
        </div>
      )}

      <div className="header">
        <h1>🏥 Private Rehabilitation Records</h1>
        <p className="subtitle">Secure, encrypted rehabilitation tracking on blockchain</p>
        <div className={`connection-status ${isConnected ? 'status-connected' : 'status-disconnected'}`}>
          {isConnected ? 'Connected' : 'Not Connected'}
        </div>
        <br />
        <button
          className="connect-btn"
          onClick={connectWallet}
          disabled={isConnected}
        >
          {isConnected ? 'Connected' : 'Connect Wallet'}
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'therapist' ? 'active' : ''}`}
          onClick={() => setActiveTab('therapist')}
        >
          Therapist
        </button>
        <button
          className={`tab ${activeTab === 'patient' ? 'active' : ''}`}
          onClick={() => setActiveTab('patient')}
        >
          Patient
        </button>
        <button
          className={`tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          Records
        </button>
      </div>

      <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
        <OverviewTab
          contract={contract}
          contractAddress={contractAddress}
          onContractAddressChange={setContractAddress}
          account={account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Not connected'}
        />
      </div>

      <div style={{ display: activeTab === 'therapist' ? 'block' : 'none' }}>
        <TherapistTab
          contract={contract}
          onSuccess={showSuccess}
          onError={showError}
        />
      </div>

      <div style={{ display: activeTab === 'patient' ? 'block' : 'none' }}>
        <PatientTab
          contract={contract}
          onError={showError}
        />
      </div>

      <div style={{ display: activeTab === 'records' ? 'block' : 'none' }}>
        <RecordsTab
          contract={contract}
          onSuccess={showSuccess}
          onError={showError}
          onRecordCreated={handleRecordCreated}
        />
      </div>
    </div>
  );
}

export default App;
