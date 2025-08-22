-- =============================================================================
-- SCHEMA SYNCHRONIZATION MIGRATION - VERSION 2.9
-- =============================================================================
-- 
-- Purpose: Sync Supabase with authoritative database/schema.sql
-- Date: 2025-08-17
-- 
-- This migration applies all missing elements from database/schema.sql:
-- 1. New monitoring and performance tables
-- 2. Enhanced functions for statistics and archival
-- 3. Performance optimization indexes
-- 4. System health monitoring views
-- 5. Data archival strategy
--
-- Based on: Database audit recommendations and schema.sql updates
-- =============================================================================

-- Pre-migration checks
DO $$
DECLARE
    current_version VARCHAR(10);
    table_count INTEGER;
BEGIN
    -- Check current schema version
    SELECT version INTO current_version 
    FROM system_schema_versions 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Count current tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    RAISE NOTICE 'Current schema version: %', COALESCE(current_version, 'Unknown');
    RAISE NOTICE 'Current table count: %', table_count;
    RAISE NOTICE 'Starting schema synchronization...';
END $$;

-- =============================================================================
-- 1. CREATE MISSING TABLES
-- =============================================================================

-- 1.1 System Table Statistics (for monitoring)
CREATE TABLE IF NOT EXISTS system_table_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL UNIQUE,
    row_count BIGINT NOT NULL DEFAULT 0,
    avg_row_size_bytes INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    index_size_bytes BIGINT DEFAULT 0,
    last_analyzed TIMESTAMPTZ DEFAULT NOW(),
    last_vacuum TIMESTAMPTZ,
    last_analyze TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Audit Logs Archive (for data retention)
CREATE TABLE IF NOT EXISTS system_audit_logs_archive (
    LIKE system_audit_logs INCLUDING ALL
);

-- Add constraint for archive table
DO $$
BEGIN
    ALTER TABLE system_audit_logs_archive 
    ADD CONSTRAINT audit_archive_date_check 
    CHECK (created_at < NOW() - INTERVAL '1 year');
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE 'Archive date constraint already exists';
END $$;

RAISE NOTICE 'Missing tables created successfully';

-- =============================================================================
-- 2. CREATE MISSING FUNCTIONS
-- =============================================================================

-- 2.1 Table Statistics Update Function
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS VOID AS $$
DECLARE
    r RECORD;
    table_size BIGINT;
    index_size BIGINT;
    row_count BIGINT;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    LOOP
        -- Get table size information
        SELECT 
            pg_total_relation_size(quote_ident(r.tablename)::regclass),
            pg_indexes_size(quote_ident(r.tablename)::regclass)
        INTO table_size, index_size;
        
        -- Get row count (approximate for large tables)
        EXECUTE format('SELECT COUNT(*) FROM %I', r.tablename) INTO row_count;
        
        -- Insert or update statistics
        INSERT INTO system_table_statistics (
            table_name, 
            row_count, 
            total_size_bytes, 
            index_size_bytes,
            avg_row_size_bytes,
            last_analyzed
        ) VALUES (
            r.tablename,
            row_count,
            table_size,
            index_size,
            CASE WHEN row_count > 0 THEN (table_size / row_count)::INTEGER ELSE 0 END,
            NOW()
        )
        ON CONFLICT (table_name) DO UPDATE SET
            row_count = EXCLUDED.row_count,
            total_size_bytes = EXCLUDED.total_size_bytes,
            index_size_bytes = EXCLUDED.index_size_bytes,
            avg_row_size_bytes = EXCLUDED.avg_row_size_bytes,
            last_analyzed = EXCLUDED.last_analyzed,
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2.2 Audit Log Archival Function
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Move logs older than 1 year to archive
    WITH moved_logs AS (
        DELETE FROM system_audit_logs 
        WHERE created_at < NOW() - INTERVAL '1 year'
        RETURNING *
    )
    INSERT INTO system_audit_logs_archive 
    SELECT * FROM moved_logs;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- Log the archival operation
    INSERT INTO system_audit_logs (
        table_name,
        operation,
        user_id,
        metadata
    ) VALUES (
        'system_audit_logs',
        'ARCHIVE',
        NULL,
        json_build_object('archived_count', archived_count, 'archive_date', NOW())
    );
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE 'Missing functions created successfully';

-- =============================================================================
-- 3. CREATE MISSING VIEWS
-- =============================================================================

-- 3.1 Performance Monitoring View
CREATE OR REPLACE VIEW system_performance_metrics AS
SELECT 
    ts.table_name,
    ts.row_count,
    pg_size_pretty(ts.total_size_bytes) AS total_size,
    pg_size_pretty(ts.index_size_bytes) AS index_size,
    pg_size_pretty(ts.avg_row_size_bytes) AS avg_row_size,
    ROUND((ts.index_size_bytes::DECIMAL / NULLIF(ts.total_size_bytes, 0)) * 100, 2) AS index_ratio_percent,
    ts.last_analyzed,
    AGE(NOW(), ts.last_analyzed) AS analysis_age
FROM system_table_statistics ts
ORDER BY ts.total_size_bytes DESC;

-- 3.2 System Health Metrics View
CREATE OR REPLACE VIEW system_health_metrics AS
SELECT 
    'Database Size' AS metric_name,
    pg_size_pretty(pg_database_size(current_database())) AS metric_value,
    'INFO' AS severity
UNION ALL
SELECT 
    'Active Connections' AS metric_name,
    COUNT(*)::TEXT AS metric_value,
    CASE 
        WHEN COUNT(*) > 80 THEN 'WARNING'
        WHEN COUNT(*) > 100 THEN 'CRITICAL'
        ELSE 'INFO'
    END AS severity
FROM pg_stat_activity 
WHERE state = 'active'
UNION ALL
SELECT 
    'Audit Logs (Last 30 Days)' AS metric_name,
    COUNT(*)::TEXT AS metric_value,
    CASE 
        WHEN COUNT(*) > 100000 THEN 'WARNING'
        ELSE 'INFO'
    END AS severity
FROM system_audit_logs 
WHERE created_at > NOW() - INTERVAL '30 days'
UNION ALL
SELECT 
    'Inactive Users' AS metric_name,
    COUNT(*)::TEXT AS metric_value,
    'INFO' AS severity
FROM auth_user_profiles 
WHERE NOT is_active;

-- 3.3 Maintenance Recommendations View
CREATE OR REPLACE VIEW system_maintenance_recommendations AS
SELECT 
    table_name,
    CASE 
        WHEN last_analyzed < NOW() - INTERVAL '7 days' THEN 'ANALYZE recommended'
        WHEN row_count > 10000 AND index_ratio_percent > 50 THEN 'Review indexes - high overhead'
        WHEN total_size_bytes > 1073741824 THEN 'Consider partitioning - table > 1GB'
        ELSE 'No immediate action needed'
    END AS recommendation,
    CASE 
        WHEN last_analyzed < NOW() - INTERVAL '7 days' THEN 'HIGH'
        WHEN row_count > 10000 AND index_ratio_percent > 50 THEN 'MEDIUM'
        ELSE 'LOW'
    END AS priority
FROM system_performance_metrics
WHERE 
    CASE 
        WHEN last_analyzed < NOW() - INTERVAL '7 days' THEN 'ANALYZE recommended'
        WHEN row_count > 10000 AND index_ratio_percent > 50 THEN 'Review indexes - high overhead'
        WHEN total_size_bytes > 1073741824 THEN 'Consider partitioning - table > 1GB'
        ELSE 'No immediate action needed'
    END != 'No immediate action needed'
ORDER BY 
    CASE 
        WHEN last_analyzed < NOW() - INTERVAL '7 days' THEN 1
        WHEN row_count > 10000 AND index_ratio_percent > 50 THEN 2
        ELSE 3 
    END;

RAISE NOTICE 'Missing views created successfully';

-- =============================================================================
-- 4. CREATE MISSING INDEXES (Performance Optimization)
-- =============================================================================

-- Residents search optimization
CREATE INDEX IF NOT EXISTS idx_residents_search_active ON residents(barangay_code, is_active, last_name);
CREATE INDEX IF NOT EXISTS idx_residents_barangay_active ON residents(barangay_code, is_active);
CREATE INDEX IF NOT EXISTS idx_residents_household_active ON residents(household_code, is_active);

-- Household statistics optimization
CREATE INDEX IF NOT EXISTS idx_household_members_stats ON household_members(household_code, is_active);
CREATE INDEX IF NOT EXISTS idx_households_type_income ON households(household_type, income_class);
CREATE INDEX IF NOT EXISTS idx_households_barangay_active ON households(barangay_code, is_active);

-- Demographic analysis optimization
CREATE INDEX IF NOT EXISTS idx_residents_age_sex ON residents(birthdate, sex, barangay_code);
CREATE INDEX IF NOT EXISTS idx_sectoral_analysis ON resident_sectoral_info(resident_id, is_senior_citizen, is_labor_force);

-- Search and reporting optimization
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_user_date ON system_audit_logs(table_name, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_barangay_date ON system_dashboard_summaries(barangay_code, calculation_date DESC);

-- Indexes for new monitoring tables
CREATE INDEX IF NOT EXISTS idx_table_stats_name ON system_table_statistics(table_name);
CREATE INDEX IF NOT EXISTS idx_table_stats_analyzed ON system_table_statistics(last_analyzed DESC);

RAISE NOTICE 'Performance optimization indexes created successfully';

-- =============================================================================
-- 5. SETUP SECURITY AND PERMISSIONS
-- =============================================================================

-- Add triggers for new tables
CREATE TRIGGER trigger_update_table_stats_timestamp
    BEFORE UPDATE ON system_table_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for new tables
ALTER TABLE system_table_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs_archive ENABLE ROW LEVEL SECURITY;

-- Create policies (admin only access)
DROP POLICY IF EXISTS policy_table_statistics_admin_only ON system_table_statistics;
CREATE POLICY policy_table_statistics_admin_only ON system_table_statistics
    FOR ALL TO authenticated
    USING (is_admin());

DROP POLICY IF EXISTS policy_audit_archive_admin_only ON system_audit_logs_archive;
CREATE POLICY policy_audit_archive_admin_only ON system_audit_logs_archive
    FOR ALL TO authenticated
    USING (is_admin());

RAISE NOTICE 'Security and permissions configured successfully';

-- =============================================================================
-- 6. INITIAL DATA POPULATION
-- =============================================================================

-- Populate initial table statistics
SELECT update_table_statistics();

RAISE NOTICE 'Initial data populated successfully';

-- =============================================================================
-- 7. SCHEMA VERSION UPDATE
-- =============================================================================

INSERT INTO system_schema_versions (version, description)
VALUES ('2.9', 'Schema sync: Performance optimizations, monitoring system, and archival strategy')
ON CONFLICT (version) DO NOTHING;

-- =============================================================================
-- 8. MIGRATION COMPLETION SUMMARY
-- =============================================================================

DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    view_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Count final objects
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
    
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'public';
    
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname NOT LIKE '%_pkey';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== SCHEMA SYNCHRONIZATION COMPLETED ===';
    RAISE NOTICE 'Final object counts:';
    RAISE NOTICE '  Tables: %', table_count;
    RAISE NOTICE '  Functions: %', function_count;
    RAISE NOTICE '  Views: %', view_count;
    RAISE NOTICE '  Indexes: %', index_count;
    RAISE NOTICE '';
    RAISE NOTICE 'New capabilities enabled:';
    RAISE NOTICE '  ✅ Performance monitoring system';
    RAISE NOTICE '  ✅ Table statistics tracking';
    RAISE NOTICE '  ✅ Data archival strategy';
    RAISE NOTICE '  ✅ Enhanced indexing for performance';
    RAISE NOTICE '  ✅ System health monitoring';
    RAISE NOTICE '  ✅ Automated maintenance recommendations';
    RAISE NOTICE '';
    RAISE NOTICE 'Usage commands:';
    RAISE NOTICE '  Monitor performance: SELECT * FROM system_performance_metrics;';
    RAISE NOTICE '  Check health: SELECT * FROM system_health_metrics;';
    RAISE NOTICE '  Get recommendations: SELECT * FROM system_maintenance_recommendations;';
    RAISE NOTICE '  Update statistics: SELECT update_table_statistics();';
    RAISE NOTICE '  Archive old logs: SELECT archive_old_audit_logs();';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Supabase schema synchronized with database/schema.sql successfully!';
END $$;