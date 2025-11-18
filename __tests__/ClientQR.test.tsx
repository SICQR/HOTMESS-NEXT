import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ClientQR from '@/app/qr/ClientQR';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock crypto.randomUUID
Object.defineProperty(global.crypto, 'randomUUID', {
  value: jest.fn(() => 'test-uuid-12345'),
});

describe('ClientQR Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders the component', () => {
    render(<ClientQR />);
    // Component should render without errors
    expect(screen.getByText(/Mock user id:/)).toBeInTheDocument();
  });

  it('generates and displays a user ID', async () => {
    render(<ClientQR />);
    
    await waitFor(() => {
      expect(screen.getByText(/Mock user id:/)).toBeInTheDocument();
    });
    
    const text = screen.getByText(/Mock user id:/).textContent;
    expect(text).toContain('test-uuid-12345');
  });

  it('reuses existing user ID from localStorage', async () => {
    const existingId = 'existing-user-id-123';
    localStorageMock.setItem('hotmess-user-id', existingId);
    
    render(<ClientQR />);
    
    await waitFor(() => {
      expect(screen.getByText(/Mock user id:/)).toBeInTheDocument();
    });
    
    const text = screen.getByText(/Mock user id:/).textContent;
    expect(text).toContain(existingId);
  });

  it('stores generated user ID in localStorage', async () => {
    render(<ClientQR />);
    
    await waitFor(() => {
      expect(screen.getByText(/Mock user id:/)).toBeInTheDocument();
    });
    
    const storedId = localStorageMock.getItem('hotmess-user-id');
    expect(storedId).toBeTruthy();
    expect(storedId).toBe('test-uuid-12345');
  });
});
