'use client';

import React from 'react';

export interface ProgressBarProps {
  progress: number; // Progress percentage (0–100).
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const pct = Math.min(100, Math.max(0, progress));
  return (
    <div style={{ marginBottom: '20px' }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Onboarding progress"
    >
      <div style={{ height: '10px', width: '100%', background: '#333', borderRadius: '10px' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: '#FF0080',
            borderRadius: '10px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <p style={{ textAlign: 'center', marginTop: '10px' }}>{Math.round(pct)}% Complete</p>
    </div>
  );
};

export default ProgressBar;
