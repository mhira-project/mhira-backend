import { DataSource } from 'typeorm';
import { configService } from './config/config.service';

/**
 * The DataSource the migration CLI runs on: start.sh runs
 * `npx typeorm migration:run -d dist/data-source.js`, since TypeORM 0.3's
 * CLI no longer reads the TYPEORM_* variables itself.
 */
export const migrationDataSource = new DataSource(
    configService.getMigrationDataSourceOptions(),
);
