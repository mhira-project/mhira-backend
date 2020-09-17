/**
 * Contains default CORS configurations
 *
 * Refer to https://github.com/expressjs/cors#configuration-options
 * for documentation on each option.
 */

export const corsConfig = {

    credentials: true,

    origin: [
        // production
        'https://mhira.net',
        /\.mhira\.net$/,

        // local development
        'http://localhost',
        /^(http\:\/\/localhost\:)/,
    ],

    methods: [
        'POST',
        'GET',
        'OPTIONS',
        'PUT',
        'PATCH',
        'DELETE',
    ],

    allowedHeaders: [
        'Content-Type',
        'Origin',
        'Authorization',
        'X-Requested-With,'
    ],

    exposedHeaders: [
        'Cache-Control',
        'Content-Language',
        'Content-Type',
        'Expires',
        'Last-Modified',
        'Pragma',
        'Access-Control-Allow-Headers',
    ],

    preflightContinue: false,

    optionsSuccessStatus: 204,

    maxAge: 60 * 60 * 24,
};
