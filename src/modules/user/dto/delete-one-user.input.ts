import { DeleteOneInputType } from "@nestjs-query/query-graphql";
import { InputType } from "@nestjs/graphql";
import { User } from '../models/user.model';

@InputType()
export class DeleteOneUserInput extends DeleteOneInputType(User) {

}

