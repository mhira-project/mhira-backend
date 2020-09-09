import { configService } from "src/config/config.service";


export const jwtConstants = configService.getTokenConfig();