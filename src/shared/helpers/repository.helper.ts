import { EntityNotFoundError, FindOptionsWhere, Repository } from 'typeorm';

/**
 * The entity with this id, or v1.1.6's EntityNotFoundError, whose message
 * prints the id ("matching: 999999"); TypeORM 0.3's findOneOrFail takes
 * options and would print the options object instead.
 */
export async function findByIdOrFail<Entity extends { id: number }>(
    repository: Repository<Entity>,
    id: number,
): Promise<Entity> {
    const entity = await repository.findOneBy({
        id,
    } as FindOptionsWhere<Entity>);
    if (!entity) throw new EntityNotFoundError(repository.target, id);
    return entity;
}
