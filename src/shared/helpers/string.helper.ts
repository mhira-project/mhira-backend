import { v4 as uuid } from 'uuid';
export class Str {

    static uuid = () => uuid();

    static slug(text: string) {
        return text
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            ;
    }
}
