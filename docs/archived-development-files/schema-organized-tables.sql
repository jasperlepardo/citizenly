-- =====================================================
-- RBI SYSTEM - ORGANIZED TABLE STRUCTURE BY CONTEXT
-- =====================================================
-- System: Records of Barangay Inhabitant System
-- Version: 2.0 - Organized by Context
-- Updated: January 2025
-- =====================================================

-- =====================================================
-- TABLE ORGANIZATION BY CONTEXT/DOMAIN
-- =====================================================

-- 📍 REFERENCE DATA CONTEXT (ref_*)
-- Government standard reference tables (read-only)
-- =====================================================
psgc_regions                    → psgc_regions (keep as-is - government standard)
psgc_provinces                  → psgc_provinces (keep as-is - government standard)
psgc_cities_municipalities      → psgc_cities_municipalities (keep as-is - government standard)
psgc_barangays                  → psgc_barangays (keep as-is - government standard)

psoc_major_groups               → psoc_major_groups (keep as-is - government standard)
psoc_sub_major_groups           → psoc_sub_major_groups (keep as-is - government standard)
psoc_minor_groups               → psoc_minor_groups (keep as-is - government standard)
psoc_unit_groups                → psoc_unit_groups (keep as-is - government standard)
psoc_unit_sub_groups            → psoc_unit_sub_groups (keep as-is - government standard)
psoc_position_titles            → psoc_position_titles (keep as-is - government standard)
psoc_occupation_cross_references → psoc_occupation_cross_references (keep as-is - government standard)

-- 🔐 AUTHENTICATION/USER CONTEXT (auth_*)
-- User management, roles, permissions
-- =====================================================
roles                           → auth_roles
user_profiles                   → auth_user_profiles  
barangay_accounts              → auth_barangay_accounts

-- 🌍 GEOGRAPHIC CONTEXT (geo_*)
-- Local geographic subdivisions
-- =====================================================
subdivisions                    → geo_subdivisions
street_names                    → geo_street_names

-- 🏠 HOUSEHOLD CONTEXT (household_*)
-- Household-related tables
-- =====================================================
households                      → households (keep as main entity)
household_members              → household_members (keep clear relationship)

-- 👥 RESIDENT CONTEXT (resident_*)  
-- Resident-related tables and relationships
-- =====================================================
residents                       → residents (keep as main entity)
resident_relationships          → resident_relationships (already prefixed)
sectoral_information           → resident_sectoral_info
migrant_information            → resident_migrant_info

-- 📊 SYSTEM/ADMIN CONTEXT (system_*)
-- System-generated and administrative tables
-- =====================================================
barangay_dashboard_summaries    → system_dashboard_summaries
audit_logs                      → system_audit_logs
schema_version                  → system_schema_versions

-- =====================================================
-- RECOMMENDED TABLE ORGANIZATION
-- =====================================================

-- 📍 REFERENCE DATA (Government Standards - Keep Original Names)
-- psgc_* and psoc_* tables maintain original naming for compliance

-- 🔐 AUTHENTICATION CONTEXT (auth_*)
CREATE TABLE auth_roles (...)
CREATE TABLE auth_user_profiles (...)  
CREATE TABLE auth_barangay_accounts (...)

-- 🌍 GEOGRAPHIC CONTEXT (geo_*)
CREATE TABLE geo_subdivisions (...)
CREATE TABLE geo_street_names (...)

-- 🏠 HOUSEHOLD CONTEXT
CREATE TABLE households (...) -- Main entity, no prefix needed
CREATE TABLE household_members (...) -- Clear relationship

-- 👥 RESIDENT CONTEXT  
CREATE TABLE residents (...) -- Main entity, no prefix needed
CREATE TABLE resident_relationships (...) -- Already properly named
CREATE TABLE resident_sectoral_info (...) -- Shortened from sectoral_information  
CREATE TABLE resident_migrant_info (...) -- Shortened from migrant_information

-- 📊 SYSTEM CONTEXT (system_*)
CREATE TABLE system_dashboard_summaries (...)
CREATE TABLE system_audit_logs (...)
CREATE TABLE system_schema_versions (...)

-- =====================================================
-- BENEFITS OF ORGANIZED NAMING
-- =====================================================

-- ✅ CONTEXT CLARITY:
-- - auth_* = Authentication/User management
-- - geo_* = Geographic subdivisions (local)
-- - resident_* = Resident-related data
-- - system_* = System-generated/admin data
-- - psgc_*/psoc_* = Government standards (unchanged)

-- ✅ EASIER NAVIGATION:
-- - Related tables grouped together in IDE
-- - Clear ownership and responsibility
-- - Reduced cognitive load when reading schema

-- ✅ MAINTENANCE BENEFITS:
-- - Easy to identify table purposes
-- - Clear separation of concerns
-- - Better organization for large teams

-- ✅ QUERY BENEFITS:
-- - JOINs are more intuitive
-- - Table relationships clearer
-- - Better autocomplete in IDEs