import { DataSource } from 'typeorm';
import { configService } from './config/config.service';

/**
 * The DataSource the migration CLI runs on: start.sh runs
 * `npx typeorm migration:run -d dist/data-source.js`, since TypeORM 0.3's
 * CLI no longer reads the TYPEORM_* variables itself (ticket 07, step 11).
 */
export const migrationDataSource = new DataSource(
    configService.getMigrationDataSourceOptions(),
);
