import { NextResponse } from 'next/server';

// HOTMESS security.txt per RFC 9116
// Adjust contact email and policy URL as needed.
export async function GET() {
  const body = [
    'Contact: mailto:security@hotmess.london',
    'Expires: 2026-01-01T00:00:00.000Z',
    'Policy: https://hotmess.london/legal/security',
    'Preferred-Languages: en',
    'Canonical: https://hotmess.london/.well-known/security.txt'
  ].join('\n');
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
