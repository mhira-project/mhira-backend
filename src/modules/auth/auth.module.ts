import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { AuthResolver } from './auth.resolver';
import { SettingModule } from '../setting/setting.module';
import { AccessTokenService } from './providers/access-token.service';
import { GqlAuthGuard } from './auth.guard';

@Global()
@Module({
    imports: [
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: jwtConstants.tokenLife },
        }),
        SettingModule,
    ],
    providers: [
        AuthService,
        AuthResolver,
        AccessTokenService,
        GqlAuthGuard,
    ],
    exports: [AccessTokenService, GqlAuthGuard],
})
export class AuthModule { }
