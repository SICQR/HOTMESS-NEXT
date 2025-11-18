import { POST } from '../../../app/api/qr/rewards/route';

function makeRequest(body: any) {
  return new Request('http://localhost/api/qr/rewards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as Request;
}

describe('QR rewards route - UUID enforcement', () => {
  const OLD_NODE_ENV = process.env.NODE_ENV;
  const OLD_ALLOW = process.env.NEXT_PUBLIC_ALLOW_MOCK_IDS;

  afterEach(() => {
    process.env.NODE_ENV = OLD_NODE_ENV;
    process.env.NEXT_PUBLIC_ALLOW_MOCK_IDS = OLD_ALLOW;
  });

  test('rejects non-UUID userId in production when NEXT_PUBLIC_ALLOW_MOCK_IDS != 1', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_ALLOW_MOCK_IDS;

    const req = makeRequest({ userId: 'not-a-uuid' });
    const res = await POST(req);
    const json = await (res as Response).json();
    expect((res as Response).status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Invalid user ID format');
  });

  test('accepts UUID userId in production', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_ALLOW_MOCK_IDS;

    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const req = makeRequest({ userId: uuid });
    const res = await POST(req);
    const json = await (res as Response).json();
    expect((res as Response).status).toBe(200);
    expect(json.success).toBe(true);
  });

  test('bypasses enforcement when NEXT_PUBLIC_ALLOW_MOCK_IDS=1', async () => {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_ALLOW_MOCK_IDS = '1';

    const req = makeRequest({ userId: 'not-a-uuid' });
    const res = await POST(req);
    const json = await (res as Response).json();
    expect((res as Response).status).toBe(200);
    expect(json.success).toBe(true);
  });
});
