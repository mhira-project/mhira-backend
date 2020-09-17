import { ArgsType, Field, InputType } from "@nestjs/graphql";
import { PaginationArgs } from "src/shared/pagination/types/pagination.args";

@ArgsType()
export class PatientFilter extends PaginationArgs {

    @Field({ nullable: true })
    searchKeyword?: string;

}
