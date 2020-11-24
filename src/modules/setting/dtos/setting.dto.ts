import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsLocale, IsOptional, Max, Min } from "class-validator";

@InputType('SettingInput')
@ObjectType()
export class SettingDto {

    @IsOptional()
    @IsLocale()
    @Field({ nullable: true })
    systemLocale?: string;

    @IsOptional()
    @Field({ nullable: true })
    systemTimezone?: string;

    @IsOptional()
    @Field({ nullable: true })
    dateFormat?: string;

    @IsOptional()
    @Field({ nullable: true })
    timeFormat?: string;

    @IsOptional()
    @Field({ nullable: true })
    dateTimeFormat?: string;

    @IsOptional()
    @Max(365)
    @Min(15)
    @Field(() => Int, { nullable: true })
    passwordLifeTimeInDays?: number;

    @IsOptional()
    @Max(365 * 5)
    @Min(0)
    @Field(() => Int, { nullable: true })
    passwordReUseCutoffInDays?: number;

}
