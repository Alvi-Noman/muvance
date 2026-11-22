import { describe, expect, it } from 'vitest';
import { sha512Crypt, verifySha512Crypt } from '@/lib/sha512-crypt';

// Test vectors from the SHA-crypt specification (Ulrich Drepper), the same ones glibc checks.
describe('sha512Crypt', () => {
  it('matches the specification', () => {
    expect(sha512Crypt('Hello world!', 'saltstring')).toBe(
      '$6$saltstring$svn8UoSVapNtMuq1ukKS4tPQd8iKwSMHWjl/O817G3uBnIFNjnQJuesI68u4OTLiBFdcbYEdFCoEOfaS35inz1',
    );
    expect(sha512Crypt('Hello world!', 'saltstringsaltstring', 10000)).toBe(
      '$6$rounds=10000$saltstringsaltst$OW1/O6BYHV6BcXZu8QVeXbDWra3Oeqh0sbHbbMCVNSnCM/UrjmM0Dp8vOuZeHBy/YTBmSK6H9qs/y3RnOaw5v.',
    );
    expect(sha512Crypt('the minimum number is still observed', 'roundstoolow', 10)).toBe(
      '$6$rounds=1000$roundstoolow$kUMsbe306n21p9R.FRkW3IGn.S9NPN0x50YhH1xhLsPuWGsUSklZt58jaTfF4ZEQpyUNGc0dqbpBYYBaHHrsX.',
    );
  });

  it('verifies passwords against hashes it made', () => {
    const hash = sha512Crypt('correct horse battery');
    expect(hash).toMatch(/^\$6\$[./0-9A-Za-z]{16}\$[./0-9A-Za-z]{86}$/);
    expect(verifySha512Crypt('correct horse battery', hash)).toBe(true);
    expect(verifySha512Crypt('correct horse batterY', hash)).toBe(false);
    expect(verifySha512Crypt('anything', 'not-a-hash')).toBe(false);
  });
});
