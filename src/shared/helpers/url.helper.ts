import { configService } from "src/config/config.service";


export function url(path = '') {

    let baseUrl = configService.getAppUrl();

    if (!baseUrl.endsWith('/')) {
        baseUrl = baseUrl.concat('/');
    }

    return baseUrl.concat(path);
}
