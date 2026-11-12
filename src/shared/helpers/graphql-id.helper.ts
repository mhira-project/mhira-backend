import { FindOptionsWhere } from 'typeorm';

/**
 * The condition on an integer primary key for a GraphQL `ID` argument
 * (`string | number`, a string at run time). The id goes to Postgres as it
 * came, as v1.1.6 sends it: Postgres casts it, and refuses "abc" with
 * v1.1.6's message, where `Number()` would send NaN.
 * TypeORM's condition types know the column as a number only, so the
 * condition, not the id, is typed for the entity.
 */
export function whereIdAsSent<Entity extends { id: number }>(
    id: string | number,
): FindOptionsWhere<Entity> {
    return { id } as FindOptionsWhere<Entity>;
}
