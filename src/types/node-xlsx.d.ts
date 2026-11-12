import 'node-xlsx';

// node-xlsx 0.16's parse reads a file path or a Buffer (`xlsx.read` with
// `type: 'buffer'`), as its own documentation says, but @types/node-xlsx
// 0.15 types the Buffer as an ArrayBuffer. A Buffer passed for one until
// @types/node 22's generic Buffer met TypeScript 5.9's lib, whose
// ArrayBuffer is resizable. Ticket 07, step 22.
declare module 'node-xlsx' {
    export function parse(
        mixed: Buffer,
        options?: {},
    ): Array<{
        name: string;
        data: unknown[][];
    }>;
}
