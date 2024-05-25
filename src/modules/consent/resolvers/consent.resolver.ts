import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
// import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
// import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { CreateOneConsentInput, DeleteOneConsentInput, UpdateOneConsentInput } from '../dtos/consent.dto';
import { Consent } from '../models/consent.model';
import { ConsentService } from '../providers/consent.service';

@Resolver(() => Consent)
export class ConsentResolver {
    constructor(private readonly disclaimerService: ConsentService) { }

    @Query(() => [Consent])
    async consents(): Promise<Consent[]> {
        return this.disclaimerService.getConsents();
    }

    @Mutation(() => Consent)
    @UseGuards(GqlAuthGuard)
    async createOneConsent(
        @Args('input') input: CreateOneConsentInput,
    ): Promise<boolean> {
        return this.disclaimerService.createOneConsent(input);
    }

    @Mutation(() => Consent)
    @UseGuards(GqlAuthGuard)
    async updateOneConsent(
        @Args('input') input: UpdateOneConsentInput,
    ): Promise<boolean> {
        return this.disclaimerService.updateOneConsent(input);
    }

    @Mutation(() => Consent)
    @UseGuards(GqlAuthGuard)
    async deleteOneConsent(
        @Args('input') input: DeleteOneConsentInput,
    ): Promise<boolean> {
        return this.disclaimerService.deleteOneConsent(input);
    }
}


