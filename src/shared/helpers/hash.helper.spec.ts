import { Hash } from './hash.helper';

// Passwords stay readable across the upgrade from argon2 0.26 to 0.45, both
// ways. A new hash carries MHIRA's explicit parameters, as v1.1.6's did, and
// a hash v1.1.6's argon2 0.26.2 made verifies. The fixture was made by
// 0.26.2 with these parameters.
const PASSWORD = 'Passw0rd!';
const HASH_BY_0_26 =
    '$argon2id$v=19$m=1024,t=2,p=2$CfttwIc1BD7+fHXm3joRkg$co1oCvw1CYXbeBwg89+fxlYRxLdI7raW+5o64N8cFEM';

describe('Hash with argon2', () => {
    it("writes argon2id with v1.1.6's parameters, a 16-byte salt and a 32-byte hash", async () => {
        const hash = await Hash.make(PASSWORD);
        expect(hash).toMatch(
            /^\$argon2id\$v=19\$m=1024,t=2,p=2\$[A-Za-z0-9+/]{22}\$[A-Za-z0-9+/]{43}$/,
        );
        await expect(Hash.compare(PASSWORD, hash)).resolves.toBe(true);
    });

    it('verifies a hash made by argon2 0.26.2, and refuses a wrong password', async () => {
        await expect(Hash.compare(PASSWORD, HASH_BY_0_26)).resolves.toBe(true);
        await expect(Hash.compare(`${PASSWORD}x`, HASH_BY_0_26)).resolves.toBe(
            false,
        );
    });
});
