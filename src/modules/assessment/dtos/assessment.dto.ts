import { FilterableField } from "@nestjs-query/query-graphql";
import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";

@ObjectType('Assessment')
export class AssessmentDto {

    @FilterableField(() => Int)
    patientId: number;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    date?: Date;

    @Field({ nullable: true })
    name: string;

    @FilterableField(() => Int, { nullable: true })
    clinicianId: number;

    @FilterableField(() => Int, { nullable: true })
    informantId?: number;

    // questionnaires: Questionnaire[];

}
