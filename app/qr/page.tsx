'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@/components/Button';
import { logger } from '@/lib/log';
import { useToast } from '@/components/Toast'; // HOTMESS ADD

interface UserRewards {
  totalPoints: number;
  scanCount: number;
  rewards: Array<{
    qr_code: string;
    points: number;
    updated_at: string;
  }>;
}

export default function QRPage() {
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string>('');
  const liveRef = useRef<HTMLDivElement | null>(null);
  const { push } = useToast(); // HOTMESS ADD
  const [userId] = useState(() => {
    // TODO: Get actual user ID from authentication context
    // For now, generate a persistent mock ID
    if (typeof window !== 'undefined') {
      let storedId = localStorage.getItem('mock_user_id');
      if (!storedId) {
        storedId = `user_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('mock_user_id', storedId);
      }
      return storedId;
    }
    return 'mock_user';
  });

  const fetchUserRewards = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/qr/rewards?userId=${encodeURIComponent(userId)}`);
      const data = await response.json();
      
      if (data.success) {
        setUserRewards(data.data);
        setTimeout(() => liveRef.current?.focus(), 0);
      } else {
        setMessage('Failed to load rewards: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      logger.error('Failed to fetch user rewards', { error });
      setMessage('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserRewards();
  }, [fetchUserRewards]);

  const simulateQRScan = async () => {
    setScanning(true);
    setMessage('');

    try {
      // Simulate scanning a random QR code
      const mockQRCode = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      
      const response = await fetch('/api/qr/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrCode: mockQRCode,
          userId: userId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(`🎉 ${data.data.message}`);
        push(`+${data.data.points} points earned`); // HOTMESS ADD
        // Refresh rewards after successful scan
        await fetchUserRewards();
        setTimeout(() => liveRef.current?.focus(), 0);
      } else {
        setMessage('Scan failed: ' + (data.error || 'Unknown error'));
        push('Scan failed'); // HOTMESS ADD
      }
    } catch (error) {
      logger.error('QR scan failed', { error });
      setMessage('Scan failed: Network error');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0D0D0D', 
      color: '#FFF', 
      padding: '20px' 
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
          QR Rewards
        </h1>

        {/* Rewards Summary */}
        <div style={{
          background: 'linear-gradient(135deg, #FF0080, #7400b8)',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {loading ? (
              <p>Loading your rewards...</p>
            ) : userRewards ? (
            <>
              <h2 style={{ fontSize: '3rem', margin: '0' }}>
                {userRewards.totalPoints}
              </h2>
              <p style={{ margin: '0.5rem 0', fontSize: '1.2rem' }}>
                Total Points
              </p>
              <p style={{ margin: '0', opacity: 0.8 }}>
                From {userRewards.scanCount} scans
              </p>
            </>
          ) : (
            <p>Failed to load rewards</p>
          )}
        </div>

        {/* Scan Button */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Button
            text={scanning ? 'Scanning...' : '📱 Scan QR Code'}
            onClick={simulateQRScan}
            disabled={scanning}
            className="text-lg px-8 py-4"
          />
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
            Tap to simulate scanning a QR code
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            ref={liveRef}
            tabIndex={-1}
            aria-live="assertive"
            style={{
              padding: '15px',
              borderRadius: '5px',
              marginBottom: '2rem',
              backgroundColor: message.includes('🎉') ? '#1a472a' : '#472a2a',
              border: message.includes('🎉') ? '1px solid #22c55e' : '1px solid #ef4444'
            }}>
            {message}
          </div>
        )}

        {/* Recent Scans */}
        {userRewards && userRewards.rewards.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Recent Scans</h3>
            <div style={{ 
              background: '#1a1a1a', 
              borderRadius: '8px', 
              padding: '15px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {userRewards.rewards
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 10)
                .map((reward, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: index < userRewards.rewards.length - 1 ? '1px solid #333' : 'none'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                        {reward.qr_code}
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                        {new Date(reward.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ 
                      color: '#FF0080', 
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}>
                      +{reward.points} pts
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '2rem',
            padding: '15px',
            backgroundColor: '#1a1a1a',
            borderRadius: '5px',
            fontSize: '0.8rem',
            fontFamily: 'monospace'
          }}>
            <p><strong>Debug Info:</strong></p>
            <p>User ID: {userId}</p>
            <p>Environment: {process.env.NODE_ENV}</p>
          </div>
        )}
      </div>
    </div>
  );
}