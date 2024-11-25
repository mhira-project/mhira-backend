import { BasicStrategy as Strategy } from 'passport-http';
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { configService } from 'src/config/config.service';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    constructor(
    ) {
        super({
            passReqToCallback: true
        });
    }

    public validate = async (req, username, password): Promise<boolean> => {
        const { user, pass } = configService.getBasicAuthConfig();
        if (
            user === username &&
            pass === password
        ) {
            return true;
        }
        throw new HttpException('You are not authorized!', HttpStatus.UNAUTHORIZED);
    }
}
