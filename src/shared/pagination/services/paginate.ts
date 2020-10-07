import { Logger } from '@nestjs/common';
import { PageInfoDto } from '../types/page-info';
import { PaginationArgs } from '../types/pagination.args';
import { SelectQueryBuilder } from 'typeorm';

/**
 * Based on https://gist.github.com/VojtaSim/6b03466f1964a6c81a3dbf1f8cec8d5c
 */
export async function paginate<T>(
    query: SelectQueryBuilder<T>,
    paginationArgs: PaginationArgs,
    cursorColumn = 'id',
    defaultLimit = 25,
): Promise<any> {

    const logger = new Logger('Pagination');

    const totalCountQuery = query.clone();

    let result: T[] = [];

    // FORWARD pagination
    if (paginationArgs.first || !paginationArgs.last) {

        // pagination ordering
        query.orderBy({ [cursorColumn]: 'DESC' })

        if (paginationArgs.after) {
            const offsetId = Number(Buffer.from(paginationArgs.after, 'base64').toString('ascii'));
            logger.verbose(`Paginate AfterID: ${offsetId}`);
            query.andWhere(`"${cursorColumn}" < :offsetId`, { offsetId });
        }

        const limit = paginationArgs.first ?? defaultLimit;

        query.take(limit)

        result = await query.getMany();
    }

    // REVERSE pagination
    else if (paginationArgs.last) {

        // pagination ordering
        query.orderBy({ [cursorColumn]: 'ASC' })

        if (paginationArgs.before) {
            const offsetId = Number(Buffer.from(paginationArgs.before, 'base64').toString('ascii'));
            logger.verbose(`Paginate BeforeID: ${offsetId}`);
            query.andWhere(`"${cursorColumn}" > :offsetId`, { offsetId });
        }

        const limit = paginationArgs.last ?? defaultLimit;

        query.take(limit);

        result = await query.getMany();

        result.reverse(); // reverse order
    }


    const startCursorId: number = result.length > 0 ? result[0][cursorColumn] : null;
    const endCursorId: number = result.length > 0 ? result.slice(-1)[0][cursorColumn] : null;


    const beforeQuery = totalCountQuery.clone();

    const afterQuery = beforeQuery.clone();

    let countBefore = 0;
    let countAfter = 0;
    if (beforeQuery.expressionMap.wheres && beforeQuery.expressionMap.wheres.length) {
        countBefore = await beforeQuery
            .andWhere(`${cursorColumn} > :cursor`, { cursor: startCursorId })
            .getCount();
        countAfter = await afterQuery
            .andWhere(`${cursorColumn} < :cursor`, { cursor: endCursorId })
            .getCount();

    } else {
        countBefore = await beforeQuery
            .where(`${cursorColumn} > :cursor`, { cursor: startCursorId })
            .getCount();

        countAfter = await afterQuery
            .where(`${cursorColumn} < :cursor`, { cursor: endCursorId })
            .getCount();

    }

    logger.debug(`CountBefore:${countBefore}`);
    logger.debug(`CountAfter:${countAfter}`);

    const edges = result.map((value) => {
        return {
            node: value,
            cursor: Buffer.from(`${value[cursorColumn]}`).toString('base64'),
        };
    });

    const pageInfo = new PageInfoDto();
    pageInfo.startCursor = edges.length > 0 ? edges[0].cursor : null;
    pageInfo.endCursor = edges.length > 0 ? edges.slice(-1)[0].cursor : null;

    pageInfo.hasNextPage = countAfter > 0;
    pageInfo.hasPreviousPage = countBefore > 0;
    // pageInfo.countBefore = countBefore;
    // pageInfo.countNext = countAfter;
    // pageInfo.countCurrent = edges.length;
    // pageInfo.countTotal = countAfter + countBefore + edges.length;

    return { edges, pageInfo };
}
