import { UseGuards } from "@nestjs/common";
import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { GqlAuthGuard } from "src/modules/auth/auth.guard";
import { SettingDto } from "../dtos/setting.dto";
import { UpdateSettingInput } from "../dtos/update-setting.input";
import { Setting } from "../models/setting.model";
import { SettingService } from "../providers/setting.service";

@Resolver(() => Setting)
@UseGuards(GqlAuthGuard)
export class SettingResolver {

    constructor(
        private readonly settingService: SettingService,
    ) { }

    @Query(() => SettingDto)
    async settings(): Promise<SettingDto> {
        return this.settingService.get();
    }

    @Mutation(() => Boolean)
    async updateSettings(@Args('input') input: UpdateSettingInput): Promise<boolean> {
        return this.settingService.update(input);
    }

}
