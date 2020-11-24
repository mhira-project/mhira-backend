import { InputType, PartialType } from "@nestjs/graphql";
import { SettingDto } from "./setting.dto";

@InputType()
export class UpdateSettingInput extends PartialType(SettingDto) {


}
