import { sign, verify } from '@/lib/hmac';

describe('hmac sign/verify', () => {
	it('roundtrips deterministic signature', () => {
		const secret = 'test_secret';
		const params = { b: 'two', a: 'one', c: 3 };
		const sig = sign(params, secret);
		const search = new URLSearchParams();
		Object.entries(params).forEach(([k,v]) => search.append(k, String(v)));
		search.append('sig', sig);
		expect(verify(search, secret)).toBe(true);
	});

	it('fails verification on tamper', () => {
		const secret = 'test_secret';
		const params = { x: 'alpha', y: 'beta' };
		const sig = sign(params, secret);
		const search = new URLSearchParams();
		Object.entries(params).forEach(([k,v]) => search.append(k, String(v)));
		// tamper
		search.set('y', 'gamma');
		search.append('sig', sig);
		expect(verify(search, secret)).toBe(false);
	});
});

