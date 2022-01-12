import * as bcrypt from 'bcryptjs';
import * as argon2 from 'argon2';
import { InternalServerErrorException } from '@nestjs/common';

export class Hash {

    static async make(value: string, algorithm = 'argon2'): Promise<string> {

        // Is bcrypt Hash
        if (algorithm.localeCompare('argon2') === 0) {
            return Hash.argon2Hash(value);
        }

        // Is Argon2 hash
        if (algorithm.localeCompare('bcrypt')) {
            return Hash.brcryptHash(value);
        }

        throw new InternalServerErrorException('Unsupported hash algorithm provided. Supported: argon2, bcrypt');
    }

    static async compare(value: string, hashedValue: string): Promise<boolean> {

        // Is bcrypt Hash
        if (hashedValue.startsWith('$2a')) {
            return Hash.brcryptVerify(value, hashedValue);
        }

        // Is Argon2 hash
        if (hashedValue.startsWith('$argon2')) {
            return Hash.argon2Verify(value, hashedValue);
        }

        throw new InternalServerErrorException('Unsupported hash algorithm for hashed value');
    }

    static async brcryptHash(value: string, saltRounds = 10): Promise<string> {

        return bcrypt.hash(value, saltRounds);
    }

    static async brcryptVerify(value: string, hashedValue: string): Promise<boolean> {

        return bcrypt.compare(value, hashedValue);
    }


    static async argon2Hash(value: string): Promise<string> {

        const argon2Config = {
            type: argon2.argon2id,
            memoryCost: 1024,
            parallelism: 2,
            timeCost: 2,
        };

        return argon2.hash(value, argon2Config);
    }

    static async argon2Verify(value: string, hashedValue: string): Promise<boolean> {

        return argon2.verify(hashedValue, value);
    }

}
