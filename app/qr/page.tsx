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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string>('');
  const liveRef = useRef<HTMLDivElement | null>(null);
  const { push } = useToast(); // HOTMESS ADD
  const [userId] = useState(() => {
    // TODO: Get actual user ID from authentication context
    // For now, generate a persistent mock ID (RFC-4122 UUID when available)
    if (typeof window !== 'undefined') {
      let storedId = localStorage.getItem('mock_user_id');
      if (!storedId) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const uid = (globalThis as any).crypto?.randomUUID?.();
          storedId = uid || `user_${Math.random().toString(36).substr(2, 9)}`;
        } catch {
          storedId = `user_${Math.random().toString(36).substr(2, 9)}`;
        }
        if (storedId) {
          localStorage.setItem('mock_user_id', storedId);
        }
      }
      return storedId || 'mock_user';
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
      <main aria-labelledby="qr-heading" role="main">
        <div ref={liveRef} tabIndex={-1} aria-live="polite" />
        <h1 id="qr-heading">QR Scanner (Dev Mode)</h1>
        <p>{message}</p>
        <Button text={scanning ? 'Scanning…' : 'Simulate Scan'} onClick={simulateQRScan} disabled={scanning} />
      </main>
    </div>
  );
}