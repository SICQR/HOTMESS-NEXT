import redactEntry from '../src/utils/redact';

test('redacts keys and truncates long strings', () => {
  const long = 'a'.repeat(600);
  const input = {
    token: 'secret',
    nested: { password: 'p', ok: 'value', long },
    arr: [{ Authorization: 'bearer' }, 'short'],
  };

  const out = redactEntry(input as any);
  if (out.token !== '[REDACTED]') throw new Error('token not redacted');
  if (out.nested.password !== '[REDACTED]') throw new Error('password not redacted');
  if (out.nested.ok !== 'value') throw new Error('non-sensitive value changed');
  if (!out.nested.long.endsWith('...[REDACTED_TRUNCATED]')) throw new Error('long string not truncated');
  if (out.arr[0].Authorization !== '[REDACTED]') throw new Error('authorization not redacted');
});
