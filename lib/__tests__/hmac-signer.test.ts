import { verifySignature, signPayload } from '../hmac-signer';

describe('verifySignature', () => {
  it('returns false for signatures with different lengths', () => {
    const payload = { foo: 'bar' };
    const secret = 'test-secret';
    const validSignature = signPayload(payload, secret);
    const invalidSignature = validSignature.slice(0, -2); // shorter signature

    expect(verifySignature(payload, secret, invalidSignature)).toBe(false);
  });

  it('returns true for valid signature', () => {
    const payload = { foo: 'bar' };
    const secret = 'test-secret';
    const validSignature = signPayload(payload, secret);

    expect(verifySignature(payload, secret, validSignature)).toBe(true);
  });
});
