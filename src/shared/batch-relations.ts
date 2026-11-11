import { RelationQueryBuilder } from '@ptc-org/nestjs-query-typeorm/src/query';
import { DriverUtils } from 'typeorm/driver/DriverUtils';
import { assertPatchedForkVersion } from './fork-version';

/** The fork's method this module replaces (private in its typings), and what it reads. */
interface AliasBuilder {
    buildAlias(...alias: string[]): string;
    relationMeta: { fromAlias: string };
    relationRepo: {
        manager: {
            connection: {
                driver: Parameters<typeof DriverUtils.buildAlias>[0];
            };
        };
    };
}

/**
 * Relations loaded for several records at once (a list's users and their
 * roles and departments, for example) are matched back to each record by
 * column names the fork builds with its `buildAlias`: the relation's
 * primary key as TypeORM names it in the raw result (`roles_id`, the alias
 * and the column), and the aliases of the columns it selects to map with.
 * The fork 2.4.0 calls TypeORM's DriverUtils.buildAlias(driver, fromAlias,
 * ...alias), an older signature; in 0.3.31 the second argument is the
 * options, so the alias is dropped, the primary key's name reads `id`, no
 * row matches, and every record gets an empty list (seen in step 11's
 * first `record-both`, on the fork 2.0.1). This gives `buildAlias` the body
 * the fork itself has from 2.5.0 on (the alias first, no shortening, `_`
 * as the joiner), so the relations are matched as the fork intends and as
 * v1.1.6 returned them. A compatibility measure of ticket 07 (steps 11 and
 * 13), applied once before the app starts; it refuses to run on another
 * fork version (assertPatchedForkVersion) or one without this method.
 */
export function restoreBatchRelationMatching(): void {
    assertPatchedForkVersion('restoreBatchRelationMatching');
    const prototype = (RelationQueryBuilder.prototype as unknown) as AliasBuilder;
    if (typeof prototype.buildAlias !== 'function') {
        throw new Error(
            'RelationQueryBuilder of @ptc-org/nestjs-query-typeorm has no buildAlias any more: restoreBatchRelationMatching must be redone for it.',
        );
    }
    prototype.buildAlias = function(this: AliasBuilder, ...alias: string[]) {
        return DriverUtils.buildAlias(
            this.relationRepo.manager.connection.driver,
            { shorten: false, joiner: '_' },
            this.relationMeta.fromAlias,
            ...alias,
        );
    };
}
