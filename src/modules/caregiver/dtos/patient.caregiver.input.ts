import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class PatientCaregiverInput {
    @Field()
    patientId!: number;

    @Field()
    caregiverId!: number;
}