import { configService } from "src/config/config.service";


export function url(path = '') {

    const baseUrl = configService.getAppUrl();

    if (!baseUrl.endsWith('/')) {
        baseUrl.concat('/');
    }

    return baseUrl.concat(path);
}
