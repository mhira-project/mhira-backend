import { ObjectType, Field } from '@nestjs/graphql';
import { authConfig } from 'src/config/auth.config';
import { User } from 'src/modules/user/models/user.model';

@ObjectType()
export class LoginResponseDto {

  @Field({ defaultValue: 'Bearer' })
  tokenType: string;

  @Field({ defaultValue: authConfig.tokenLife })
  expiresIn: number;

  @Field()
  accessToken: string;

  @Field({ nullable: true })
  refreshToken?: string;

  @Field({ nullable: true })
  user?: User;
}
