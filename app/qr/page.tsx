import React, { useEffect, useState } from 'react';

function getOrCreateMockUserId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'mock_user_id';
  let id = localStorage.getItem(key);
  if (id) return id;

  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    id = (crypto as any).randomUUID();
  } else {
    // fallback: legacy random string (keep UX behavior for older runtimes)
    id = 'mock-' + Math.random().toString(36).slice(2, 10);
  }

  localStorage.setItem(key, id);
  return id;
}

export default function Page() {
  const [userId] = useState(() => getOrCreateMockUserId());
  useEffect(() => {
    // display or use userId in UI as before
  }, []);
  return <div>Mock user id: {userId}</div>;
}
