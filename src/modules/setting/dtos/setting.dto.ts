import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SettingDto {

    @Field({ nullable: true })
    systemLocale: string;

    @Field({ nullable: true })
    systemTimezone: string;

    @Field({ nullable: true })
    dateFormat: string;

    @Field({ nullable: true })
    timeFormat: string;

    @Field({ nullable: true })
    dateTimeFormat: string;

}
