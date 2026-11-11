/**
 * A GraphQL `ID` argument (`string | number`, a string at run time) as the
 * condition on an integer primary key. It goes to Postgres as it came, as
 * v1.1.6 sends it: Postgres casts it, and refuses "abc" with v1.1.6's
 * message, where `Number()` would send NaN. TypeORM's condition types know
 * the column as a number only, so the value is typed as one here and
 * nowhere else; use it inside the `where` only (ticket 07, P2).
 */
export function idAsSent(id: string | number): number {
    return id as number;
}
