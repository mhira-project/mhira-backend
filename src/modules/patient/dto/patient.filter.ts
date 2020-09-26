import { ArgsType, Field, Int } from "@nestjs/graphql";
import { PaginationArgs } from "src/shared/pagination/types/pagination.args";

@ArgsType()
export class PatientFilter extends PaginationArgs {

    @Field({ nullable: true })
    searchKeyword?: string;

    @Field({ nullable: true })
    active?: boolean;

    @Field({ nullable: true })
    createdAtFrom?: Date;

    @Field({ nullable: true })
    createdAtTo?: Date;

    @Field(() => Int, { nullable: true })
    caseManagerId?: number;

}
