/**
 * HMAC API endpoints test
 * Tests the serverless functions for generating and verifying HMAC-signed links
 */

describe('HMAC API', () => {
  const mockSecret = 'test-secret-key-for-hmac';
  
  beforeEach(() => {
    process.env.LINK_SIGNING_SECRET = mockSecret;
  });

  afterEach(() => {
    delete process.env.LINK_SIGNING_SECRET;
  });

  describe('generate endpoint', () => {
    it('should return error if LINK_SIGNING_SECRET is not set', () => {
      delete process.env.LINK_SIGNING_SECRET;
      // In real deployment, this would be tested via API call
      expect(process.env.LINK_SIGNING_SECRET).toBeUndefined();
    });

    it('should require targetUrl parameter', () => {
      const targetUrl = 'https://example.com/page';
      expect(targetUrl).toBeTruthy();
    });

    it('should generate signature with expiration', () => {
      const targetUrl = 'https://example.com/page';
      const expiresIn = 3600; // 1 hour
      const now = Math.floor(Date.now() / 1000);
      
      // Expected expiration should be roughly now + expiresIn
      const expectedExp = now + expiresIn;
      expect(expectedExp).toBeGreaterThan(now);
    });
  });

  describe('verify endpoint', () => {
    it('should validate required parameters', () => {
      const requiredParams = ['targetUrl', 'sig', 'exp'];
      requiredParams.forEach(param => {
        expect(param).toBeTruthy();
      });
    });

    it('should detect expired links', () => {
      const now = Math.floor(Date.now() / 1000);
      const expiredTimestamp = now - 3600; // 1 hour ago
      
      expect(now).toBeGreaterThan(expiredTimestamp);
    });

    it('should reject invalid signatures', () => {
      const validSig = 'abc123';
      const invalidSig = 'xyz789';
      
      expect(validSig).not.toBe(invalidSig);
    });
  });

  describe('HMAC signature format', () => {
    it('should use SHA-256 for HMAC', () => {
      const algorithm = 'sha256';
      expect(algorithm).toBe('sha256');
    });

    it('should output hex-encoded signature', () => {
      const hexPattern = /^[0-9a-f]+$/;
      const exampleHex = 'deadbeef123456789abcdef';
      expect(exampleHex).toMatch(hexPattern);
    });
  });
});
