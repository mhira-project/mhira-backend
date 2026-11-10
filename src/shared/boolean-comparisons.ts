import { SQLComparisonBuilder } from '@ptc-org/nestjs-query-typeorm/src/query';

type ComparisonSql = (
    column: string,
    value: unknown,
) => { sql: string; params: Record<string, never> };

/** The two methods of the fork's SQLComparisonBuilder this module replaces (private in its typings). */
interface BooleanComparisons {
    isComparisonSQL: ComparisonSql;
    isNotComparisonSQL: ComparisonSql;
}

function booleanComparison(operator: 'is' | 'isNot'): ComparisonSql {
    const sqlOperator = operator === 'is' ? 'IS' : 'IS NOT';
    return (column, value) => {
        if (value === null || value === true || value === false) {
            const literal =
                value === null ? 'NULL' : String(value).toUpperCase();
            return { sql: `${column} ${sqlOperator} ${literal}`, params: {} };
        }
        throw new Error(
            `unexpected ${operator} operator param ${JSON.stringify(value)}`,
        );
    };
}

/**
 * The `is` and `isNot` filters as @nestjs-query wrote them up to v1.1.6 and
 * the fork up to 0.33: `IS [NOT] TRUE`, `IS [NOT] FALSE`, `IS [NOT] NULL`.
 * The fork 2.0 writes `= TRUE`, `!= TRUE` and so on, and `isNot` then
 * leaves out the rows whose column is NULL. A compatibility measure of
 * ticket 07 (step 11), applied once before the app starts; it refuses to
 * run on a fork version without these two methods.
 */
export function restoreBooleanComparisons(): void {
    const prototype = (SQLComparisonBuilder.prototype as unknown) as BooleanComparisons;
    if (
        typeof prototype.isComparisonSQL !== 'function' ||
        typeof prototype.isNotComparisonSQL !== 'function'
    ) {
        throw new Error(
            'SQLComparisonBuilder of @ptc-org/nestjs-query-typeorm has no isComparisonSQL or isNotComparisonSQL any more: restoreBooleanComparisons must be redone for it.',
        );
    }
    prototype.isComparisonSQL = booleanComparison('is');
    prototype.isNotComparisonSQL = booleanComparison('isNot');
}
