/*
  # Create get_table_sizes function

  1. New Functions
    - `get_table_sizes()` - Returns table information including name, schema, row count, and size in bytes
  
  2. Security
    - Grant execute permissions to authenticated users for admin functionality
  
  3. Purpose
    - Provides database table size information for admin dashboard
    - Used by DatabaseManagement component to display storage statistics
*/

CREATE OR REPLACE FUNCTION public.get_table_sizes()
RETURNS TABLE(
  table_name text,
  schema_name text,
  row_count bigint,
  size_bytes bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.relname::text AS table_name,
    n.nspname::text AS schema_name,
    c.reltuples::bigint AS row_count,
    pg_total_relation_size(c.oid)::bigint AS size_bytes
  FROM
    pg_class c
  JOIN
    pg_namespace n ON n.oid = c.relnamespace
  WHERE
    c.relkind = 'r' -- 'r' for relation (table)
    AND n.nspname = 'public' -- Only public schema tables
  ORDER BY
    pg_total_relation_size(c.oid) DESC;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_table_sizes() TO authenticated;