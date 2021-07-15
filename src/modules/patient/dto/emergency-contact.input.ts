import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class EmergencyContactInput {

    @Field()
    patientId: number;

    @Field()
    firstName: string;

    @Field({ nullable: true })
    middleName: string;

    @Field()
    lastName: string;

    @Field({ nullable: true })
    phone: string;

    @Field({ nullable: true })
    email: string;
}
