import { ValidationPipe } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { NestedMessagesValidationPipe } from './nested-messages-validation.pipe';

// Ticket 07, step 14: the messages v1.1.6 (class-validator 0.13) gave for a
// @ValidateNested value that is neither an object nor an array. The
// expected messages were measured on v1.1.6 (an explicit `filter: null`,
// follow-up item 8) or follow from 0.13's tree as Nest's pipe flattens it.

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

describe('NestedMessagesValidationPipe', () => {
    const pipe = new NestedMessagesValidationPipe();

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
