import { ArgsType, Field, Int } from "@nestjs/graphql";
import { PaginationArgs } from "src/shared/pagination/types/pagination.args";

@ArgsType()
export class CaseManagerFilter extends PaginationArgs {

    @Field({ nullable: true })
    searchKeyword?: string;

    @Field(() => Int, { nullable: true })
    patientId?: number;

    @Field(() => Int, { nullable: true })
    caseManagerId?: number;

}
