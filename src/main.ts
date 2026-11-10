import { NestFactory } from '@nestjs/core';
import * as mongoose from 'mongoose';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { corsConfig } from './config/cors.config';
import { GqlBadRequestHandler } from './shared/exception/gql-bad-request.handler';
import { configService } from './config/config.service';
import { GqlUnauthorizedHandler } from './shared/exception/gql-unauthorized.handler';

async function bootstrap() {
    // Mongoose 5, which v1.1.6 runs, does not apply strictQuery; Mongoose 6
    // does by default and warns at the first connection. Off keeps v1.1.6's
    // filters as they are (and is Mongoose 7's default again).
    mongoose.set('strictQuery', false);
    const app = await NestFactory.create(AppModule);

    const port = configService.getPort();
    const logger = new Logger('bootstrap');

    app.enableCors(corsConfig);
    app.useGlobalFilters(new GqlBadRequestHandler());
    app.useGlobalFilters(new GqlUnauthorizedHandler());
    app.useGlobalPipes(new ValidationPipe());

    await app.listen(port);
    logger.log(`Application started on port ${port}`);
}
bootstrap();
