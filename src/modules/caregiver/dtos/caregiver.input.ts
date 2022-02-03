import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";


@InputType()
export class CaregiverInput {
    @Field()
    firstName: string;

    @Field()
    phone!: string;

    @IsOptional()
    @Field({ nullable: true })
    middleName?: string;

    @Field()
    lastName: string;

    @IsOptional()
    @Field({ nullable: true })
    email?: string;

    @IsOptional()
    @Field({ nullable: true })
    street?: string;

    @IsOptional()
    @Field({ nullable: true })
    country?: string;

    @IsOptional()
    @Field({ nullable: true })
    place?: string;

    @IsOptional()
    @Field({ nullable: true })
    number?: string;

    @IsOptional()
    @Field({ nullable: true })
    apartment?: string;

    @IsOptional()
    @Field({ nullable: true })
    postalCode?: string;
}