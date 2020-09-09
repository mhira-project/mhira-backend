import { Brackets, SelectQueryBuilder } from "typeorm";
import { Logger } from "@nestjs/common";

export function applySearchQuery<T>(
    query: SelectQueryBuilder<T>,
    searchKeyword: string,
    searchableColumns: string[],
): SelectQueryBuilder<T> {

    const searchTerm = searchKeyword.trim();

    Logger.debug(`Applying searchTerm: ${searchTerm}`, 'SearchQuery');

    query.andWhere(new Brackets((subQuery) => {

        for (const index in searchableColumns) {
            const searchableColumn = searchableColumns[index];
            Logger.debug(`Applying search on column: ${searchableColumn}`, 'SearchQuery');

            if (+index > 0) {
                subQuery.orWhere(`"${searchableColumn}" ILIKE :searchTerm`, { searchTerm: `%${searchTerm}%` });
            } else {
                subQuery.where(`"${searchableColumn}" ILIKE :searchTerm`, { searchTerm: `%${searchTerm}%` });
            }
        }
    }));

    return query;
}
