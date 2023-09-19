import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class RemovePermissionsFromRoleInput {
    @Field(() => Int)
    id: number;

    @Field(() => [Int])
    relationIds: number[];
}

@InputType()
export class AddPermissionsToRoleInput extends RemovePermissionsFromRoleInput {}