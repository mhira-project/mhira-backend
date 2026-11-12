import { ValidationPipe } from '@nestjs/common';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { getOrCreateCursorPagingType } from '@ptc-org/nestjs-query-graphql/src/types/query/paging';
import { V116MessagesValidationPipe } from './v116-messages-validation.pipe';

// The messages v1.1.6 (class-validator 0.13) gave for a @ValidateNested
// value that is neither an object nor an array. The expected messages were
// measured on v1.1.6 (an explicit `filter: null`) or follow from 0.13's tree
// as Nest's pipe flattens it. Also the order of a cursor paging `last`'s
// messages, measured on v1.1.6 with the resolver library's own paging input.

class Paging {
    @IsInt()
    first: number;
}

class Args {
    @ValidateNested()
    @Type(() => Paging)
    filter: Paging;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => Paging)
    paging: Paging;
}

class Outer {
    @ValidateNested()
    @Type(() => Args)
    args: Args;
}

async function messages(
    pipe: ValidationPipe,
    metatype: new () => object,
    value: unknown,
): Promise<unknown> {
    try {
        await pipe.transform(value, { type: 'body', metatype });
    } catch (error) {
        return error.getResponse().message;
    }
    return 'passed';
}

/** An input whose GraphQL field name differs from its property, as the fork declares `input`, with an `@Exclude`d field like the uploads. */
class Renamed {
    @Expose({ name: 'role' })
    @IsNotEmpty()
    input: object;

    @Exclude()
    upload: object;
}

describe('V116MessagesValidationPipe', () => {
    const pipe = new V116MessagesValidationPipe();

    it('gives back the value it was given, as the bare pipe does', async () => {
        const value = { role: { name: 'r' }, upload: { file: 1 } };
        expect(
            await pipe.transform(value, { type: 'body', metatype: Renamed }),
        ).toBe(value);
    });

    it("an explicit null gives v1.1.6's message, with the property as its path", async () => {
        expect(
            await messages(pipe, Args, { filter: null, paging: { first: 1 } }),
        ).toEqual([
            'filter.nested property filter must be either object or array',
        ]);
    });

    it('class-validator 0.14 alone would give it without the path', async () => {
        expect(
            await messages(new ValidationPipe(), Args, {
                filter: null,
                paging: { first: 1 },
            }),
        ).toEqual(['nested property filter must be either object or array']);
    });

    it("leaves out the property's other constraints, as v1.1.6's pipe did", async () => {
        expect(
            await messages(pipe, Args, { filter: { first: 1 }, paging: '' }),
        ).toEqual([
            'paging.nested property paging must be either object or array',
        ]);
    });

    it('keeps the full path one level down', async () => {
        expect(
            await messages(pipe, Outer, {
                args: { filter: 5, paging: { first: 1 } },
            }),
        ).toEqual([
            'args.filter.nested property filter must be either object or array',
        ]);
    });

    it('leaves every other message as it was', async () => {
        expect(
            await messages(pipe, Args, {
                filter: { first: 'a' },
                paging: { first: 1 },
            }),
        ).toEqual(['filter.first must be an integer number']);
        expect(
            await messages(pipe, Args, {
                filter: { first: 1 },
                paging: { first: 1 },
            }),
        ).toBe('passed');
    });
});

const CursorPaging = getOrCreateCursorPagingType({});

class CursorArgs {
    @ValidateNested()
    @Type(() => CursorPaging)
    paging: InstanceType<typeof CursorPaging>;
}

describe('V116MessagesValidationPipe on cursor paging', () => {
    const pipe = new V116MessagesValidationPipe();

    it("gives a `last` below 1 v1.1.6's order, positive first", async () => {
        expect(
            await messages(pipe, CursorArgs, {
                paging: { last: 0, before: 'YXJyYXljb25uZWN0aW9uOjE=' },
            }),
        ).toEqual([
            'paging.last must be a positive number',
            'paging.last must not be less than 1',
        ]);
        expect(
            await messages(pipe, CursorArgs, { paging: { last: -1 } }),
        ).toEqual([
            'paging.last must be a positive number',
            'paging.last must not be less than 1',
            'paging.Cannot be used without `before`.',
        ]);
    });

    it('the resolver library alone would give the other order', async () => {
        expect(
            await messages(new ValidationPipe(), CursorArgs, {
                paging: { last: 0, before: 'YXJyYXljb25uZWN0aW9uOjE=' },
            }),
        ).toEqual([
            'paging.last must not be less than 1',
            'paging.last must be a positive number',
        ]);
    });

    it('leaves `first` in its own order, the same as on v1.1.6', async () => {
        expect(
            await messages(pipe, CursorArgs, { paging: { first: 0 } }),
        ).toEqual([
            'paging.first must not be less than 1',
            'paging.first must be a positive number',
        ]);
    });
});
