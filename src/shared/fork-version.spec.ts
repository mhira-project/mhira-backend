import { assertPatchedForkVersion, PATCHED_FORK_VERSION } from './fork-version';

// Ticket 07, step 11: the fork compatibility measures run only on the fork
// version they were checked against.

const FORK_PACKAGE = '@ptc-org/nestjs-query-typeorm/package.json';

describe('assertPatchedForkVersion', () => {
    afterEach(() => jest.dontMock(FORK_PACKAGE));

    it('lets the measures run on the installed fork', () => {
        expect(() => assertPatchedForkVersion('a measure')).not.toThrow();
    });

    it('refuses another fork version, naming the measure', () => {
        jest.doMock(FORK_PACKAGE, () => ({ version: '0.0.1' }));
        jest.isolateModules(() => {
            const isolated: typeof import('./fork-version') = require('./fork-version');
            expect(() =>
                isolated.assertPatchedForkVersion('a measure'),
            ).toThrow(
                `a measure was checked against @ptc-org/nestjs-query-typeorm ${PATCHED_FORK_VERSION}, and 0.0.1 is installed`,
            );
        });
    });
});
