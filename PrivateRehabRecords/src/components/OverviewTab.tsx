import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface OverviewTabProps {
  contract: ethers.Contract | null;
  contractAddress: string;
  onContractAddressChange: (address: string) => void;
  account: string;
}

export function OverviewTab({
  contract,
  contractAddress,
  onContractAddressChange,
  account,
}: OverviewTabProps) {
  const [totalRecords, setTotalRecords] = useState<string>('-');
  const [contractOwner, setContractOwner] = useState<string>('-');

  useEffect(() => {
    const loadStats = async () => {
      if (!contract) return;

      try {
        const records = await contract.getTotalRecords();
        const owner = await contract.owner();

        setTotalRecords(records.toString());
        setContractOwner(`${owner.substring(0, 6)}...${owner.substring(38)}`);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, [contract]);

  return (
    <div className="tab-content active" id="overview">
      <div className="info-card">
        <div className="info-title">🔐 System Information</div>
        <p>
          This application manages private rehabilitation records using Zama's FHE (Fully Homomorphic
          Encryption) technology on Ethereum Sepolia testnet.
        </p>
        <br />
        <div className="two-column">
          <div>
            <strong>Contract Address:</strong>
            <br />
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => onContractAddressChange(e.target.value)}
              placeholder="Enter contract address"
            />
          </div>
          <div>
            <strong>Connected Account:</strong>
            <br />
            <span>{account || 'Not connected'}</span>
          </div>
        </div>
      </div>

      <div className="info-card">
        <div className="info-title">📊 System Statistics</div>
        <div className="two-column">
          <div className="detail-item">
            <div className="detail-label">Total Records</div>
            <div className="detail-value">{totalRecords}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Contract Owner</div>
            <div className="detail-value">{contractOwner}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
