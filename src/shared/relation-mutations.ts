/**
 * The filters the fork's generated relation mutations passed to the query
 * service's addRelations and removeRelations: what the default authorizer
 * gives when neither the DTO nor its relation has an authorizer of its own,
 * as with every DTO here. The `add…`/`remove…` mutations written by hand
 * (ticket 07, step 11) pass the same.
 */
export const DEFAULT_AUTHORIZER_FILTERS = {
    filter: {},
    relationFilter: {},
};
