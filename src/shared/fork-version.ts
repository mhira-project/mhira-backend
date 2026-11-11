/** The version of @ptc-org/nestjs-query-typeorm that package.json pins and that restoreBooleanComparisons was checked against. */
export const PATCHED_FORK_VERSION = '9.4.0';

/**
 * Refuses to apply a compatibility measure to another version of the fork.
 * Such a measure replaces private methods and reads private fields; a later
 * version can keep a method's name and change what it reads, and the
 * measure would then fail silently (in step 11's first attempt, every
 * batched relation list came back empty). Ticket 07, step 11.
 */
export function assertPatchedForkVersion(measure: string): void {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {
        version,
    } = require('@ptc-org/nestjs-query-typeorm/package.json') as {
        version: string;
    };
    if (version !== PATCHED_FORK_VERSION) {
        throw new Error(
            `${measure} was checked against @ptc-org/nestjs-query-typeorm ${PATCHED_FORK_VERSION}, and ${version} is installed: check it against that version and update PATCHED_FORK_VERSION.`,
        );
    }
}
