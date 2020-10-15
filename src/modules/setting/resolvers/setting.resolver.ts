import { UseGuards } from "@nestjs/common";
import { Resolver, Query } from "@nestjs/graphql";
import { GqlAuthGuard } from "src/modules/auth/auth.guard";
import { SettingDto } from "../dtos/setting.dto";
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


}
