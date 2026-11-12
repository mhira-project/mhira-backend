-- Structure of the Postgres side, from the catalog only: no row is read.
-- One line per item, sorted, so two installations compare line by line.
select 'server_version', current_setting('server_version');
select 'server_encoding', current_setting('server_encoding');
select 'timezone', current_setting('TimeZone');
select 'extension ' || extname, extversion from pg_extension order by 1;
select 'schema ' || nspname, '' from pg_namespace
  where nspname not in ('pg_catalog', 'information_schema', 'pg_toast') and nspname not like 'pg_temp_%' and nspname not like 'pg_toast_temp_%'
  order by 1;
select 'table ' || table_schema || '.' || table_name, table_type from information_schema.tables
  where table_schema not in ('pg_catalog', 'information_schema') order by 1;
select 'column ' || table_schema || '.' || table_name || '.' || column_name,
       data_type || coalesce('(' || character_maximum_length || ')', '') ||
       case when data_type = 'USER-DEFINED' then ' ' || udt_name else '' end ||
       case when is_nullable = 'NO' then ' not null' else '' end ||
       coalesce(' default ' || column_default, '')
  from information_schema.columns
  where table_schema not in ('pg_catalog', 'information_schema') order by 1;
select 'index ' || schemaname || '.' || tablename || '.' || indexname, indexdef from pg_indexes
  where schemaname not in ('pg_catalog', 'information_schema') order by 1;
select 'constraint ' || n.nspname || '.' || t.relname || '.' || c.conname, pg_get_constraintdef(c.oid)
  from pg_constraint c join pg_class t on t.oid = c.conrelid join pg_namespace n on n.oid = t.relnamespace
  where n.nspname not in ('pg_catalog', 'information_schema') order by 1;
select 'enum ' || n.nspname || '.' || t.typname, string_agg(e.enumlabel, ',' order by e.enumsortorder)
  from pg_type t join pg_enum e on e.enumtypid = t.oid join pg_namespace n on n.oid = t.typnamespace
  group by n.nspname, t.typname order by 1;
select 'sequence ' || sequence_schema || '.' || sequence_name, data_type from information_schema.sequences order by 1;
select 'view ' || table_schema || '.' || table_name, '' from information_schema.views
  where table_schema not in ('pg_catalog', 'information_schema') order by 1;
select 'trigger ' || event_object_schema || '.' || event_object_table || '.' || trigger_name, action_timing || ' ' || event_manipulation
  from information_schema.triggers order by 1;
select 'migration ' || name, '' from migrations order by id;
