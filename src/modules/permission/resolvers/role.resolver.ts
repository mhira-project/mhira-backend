

import { UseGuards } from "@nestjs/common";
import { Resolver, Query } from "@nestjs/graphql";
import { GqlAuthGuard } from "src/modules/auth/auth.guard";
import { Role } from "../models/role.model";

@Resolver(() => Role)
@UseGuards(GqlAuthGuard)
export class RoleResolver {


}
