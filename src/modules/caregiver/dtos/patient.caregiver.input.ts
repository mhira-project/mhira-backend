import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@InputType()
export class PatientCaregiverInput {
    @Field()
    patientId!: number;

    @Field()
    caregiverId!: number;

    @Field({ nullable: true })
    relation?: string;

    @IsOptional()
    @Field({ nullable: true })
    emergency?: boolean;

    @IsOptional()
    @Field({ nullable: true })
    note?: string;
}