import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { TenantService } from './providers/tenants.service';

declare global {
    namespace Express {
        interface Request {
            subdomain: string;
        }
    }
}


@Injectable()
export class TenancyMiddleware implements NestMiddleware {
    constructor(private readonly tenantService: TenantService) { }
    use(req: Request, res: Response, next: NextFunction): void {
        const hostHeader = req.headers['x-tenant-id'] as string;
        if (!hostHeader) {
            return next();
        }

        const subdomain = hostHeader.split('.')[0];

        const tenantExists = this.tenantService.getTenantBySubdomain(subdomain);
        if (!tenantExists) {
            throw new NotFoundException('Tenant not found');
        }

        req.subdomain = subdomain;
        next();
    }
}