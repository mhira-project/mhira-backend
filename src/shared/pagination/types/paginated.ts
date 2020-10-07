import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { PageInfoDto } from './page-info';


/**
 * Based on https://docs.nestjs.com/graphql/resolvers#generics
 * 
 * @param classRef 
 */
export function Paginated<T>(classRef: Type<T>): any {
    @ObjectType(`${classRef.name}EdgeDto`, { isAbstract: true })
    abstract class EdgeType {
        @Field(() => String)
        cursor: string;

        @Field(() => classRef)
        node: T;
    }

    @ObjectType({ isAbstract: true })
    abstract class PaginatedType {
        @Field(() => [EdgeType], { nullable: true })
        edges: EdgeType[];

        @Field(() => PageInfoDto, { nullable: true })
        pageInfo: PageInfoDto;
    }
    return PaginatedType;
}
