import { NextFunction, Request, Response } from 'express';

// extend the Request object to include the subdomain
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

    // Extract subdomain from the host
    const subdomain = hostHeader.split('.')[0];
    console.log('subdomain', subdomain);

    req.subdomain = subdomain;
    next();
}