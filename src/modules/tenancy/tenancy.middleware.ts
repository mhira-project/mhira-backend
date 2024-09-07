import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

declare global {
    namespace Express {
        interface Request {
            subdomain: string;
        }
    }
}


export async function tenancyMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const hostHeader = req.headers['host'] as string;

    if (!hostHeader) {
        return next();
    }

    const subdomain = hostHeader.split('.')[0];

    req.subdomain = subdomain;
    next();
}