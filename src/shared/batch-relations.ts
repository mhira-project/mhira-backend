import { RelationQueryBuilder } from '@ptc-org/nestjs-query-typeorm/src/query';
import { DriverUtils } from 'typeorm/driver/DriverUtils';

/** The fork's method this module replaces (private in its typings), and what it reads. */
interface PrimaryKeyColumns {
    getRelationPrimaryKeysPropertyNameAndColumnsName(): {
        propertyName: string;
        columnName: string;
    }[];
    relationMeta: {
        fromAlias: string;
        fromPrimaryKeys: { propertyName: string; databasePath: string }[];
    };
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
 * the relation's primary key as TypeORM names it in the raw result:
 * `roles_id`, the alias and the column. The fork 2.0.1 builds that name
 * with TypeORM's DriverUtils.buildAlias(driver, ...alias), an older
 * signature; in 0.3.31 the second argument is the options, so the alias is
 * dropped, the name reads `id`, no row matches, and every record gets an
 * empty list (seen in step 11's first `record-both`). This gives the fork's
 * method the call TypeORM 0.3.31 expects, so the relations are matched as
 * the fork intends and as v1.1.6 returned them. A compatibility measure of ticket 07 (step 11),
 * applied once before the app starts; it refuses to run on a fork version
 * without this method.
 */
export function restoreBatchRelationMatching(): void {
    const prototype = (RelationQueryBuilder.prototype as unknown) as PrimaryKeyColumns;
    if (
        typeof prototype.getRelationPrimaryKeysPropertyNameAndColumnsName !==
        'function'
    ) {
        throw new Error(
            'RelationQueryBuilder of @ptc-org/nestjs-query-typeorm has no getRelationPrimaryKeysPropertyNameAndColumnsName any more: restoreBatchRelationMatching must be redone for it.',
        );
    }
    prototype.getRelationPrimaryKeysPropertyNameAndColumnsName = function(
        this: PrimaryKeyColumns,
    ) {
        const { driver } = this.relationRepo.manager.connection;
        return this.relationMeta.fromPrimaryKeys.map(primaryKey => ({
            propertyName: primaryKey.propertyName,
            columnName: DriverUtils.buildAlias(
                driver,
                undefined,
                this.relationMeta.fromAlias,
                primaryKey.databasePath,
            ),
        }));
    };
}
