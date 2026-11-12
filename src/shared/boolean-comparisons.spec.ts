import { SQLComparisonBuilder } from '@ptc-org/nestjs-query-typeorm/src/query';
import { restoreBooleanComparisons } from './boolean-comparisons';

// The `is` and `isNot` filters write the SQL v1.1.6 wrote. The resolver
// library alone would have `isNot: true` leave out the NULL rows.

describe('restoreBooleanComparisons', () => {
    beforeAll(() => restoreBooleanComparisons());

    const sql = (operator: 'is' | 'isNot', value: boolean | null) =>
        new SQLComparisonBuilder<{ status: boolean }>().build(
            'status',
            operator,
            value,
            'Report',
        ).sql;

    it.each([
        ['is', true, 'Report.status IS TRUE'],
        ['is', false, 'Report.status IS FALSE'],
        ['is', null, 'Report.status IS NULL'],
        ['isNot', true, 'Report.status IS NOT TRUE'],
        ['isNot', false, 'Report.status IS NOT FALSE'],
        ['isNot', null, 'Report.status IS NOT NULL'],
    ] as const)('%s %s writes %s', (operator, value, expected) => {
        expect(sql(operator, value)).toBe(expected);
    });

    it('refuses any other value, as the fork does', () => {
        expect(() =>
            new SQLComparisonBuilder<{ status: unknown }>().build(
                'status',
                'isNot',
                'yes',
                'Report',
            ),
        ).toThrow('unexpected isNot operator param "yes"');
    });
});
