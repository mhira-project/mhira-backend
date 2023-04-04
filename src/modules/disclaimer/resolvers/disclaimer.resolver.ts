import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
// import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
// import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { UpdateDisclaimerInput } from '../dtos/disclaimer.dto';
import { Disclaimer } from '../models/disclaimer.model';
import { DisclaimerService } from '../providers/disclaimer.service';

@Resolver(() => Disclaimer)
export class DisclaimerResolver {
    constructor(private readonly disclaimerService: DisclaimerService) {}

    @Query(() => [Disclaimer])
    async disclaimers(): Promise<Disclaimer[]> {
        return this.disclaimerService.getDisclaimers();
    }

    @Mutation(() => Disclaimer)
    @UseGuards(GqlAuthGuard)
    async updateDisclaimer(
        @Args('input') input: UpdateDisclaimerInput,
    ): Promise<boolean> {
        return this.disclaimerService.updateDisclaimer(input);
    }
}
