# Product Requirements Document

**Records of Barangay Inhabitant System (RBI System)**  
**Version:** 1.0  
**Date:** August 1, 2025  
**Author:** Product Owner  
**Scope:** Residents & Households Management  
**Backend:** Supabase (PostgreSQL + Auth)  

---

## 1. Executive Summary

### 1.1 Product Vision
Build a modern, mobile-first Progressive Web App (PWA) for barangay officials to efficiently manage resident registration and household composition. The system provides real-time demographic insights while maintaining data integrity and security through role-based access control.

### 1.2 Business Objectives
- **Digitize** manual resident registration processes
- **Centralize** household and resident data in a single system
- **Enable** real-time demographic reporting and analytics
- **Support** offline operations for field workers
- **Ensure** data security and privacy compliance
- **Provide** mobile-responsive interface for any device

### 1.3 Success Metrics
- 100% of active residents digitally registered within 6 months
- 90% reduction in manual paperwork processing time
- 95% system uptime and availability
- Zero data breaches or unauthorized access incidents
- <3 second page load times on mobile devices

---

## 2. Product Scope

### 2.1 In Scope
- **Resident Management**: Full CRUD operations for resident profiles
- **Household Management**: Composition tracking and address linking
- **Demographics Analytics**: Population pyramids and statistical dashboards
- **Role-Based Access**: Multi-level user permissions (Super Admin, Barangay Admin, Clerk, Resident)
- **PWA Features**: Offline support, installability, push notifications
- **Mobile-First Design**: Responsive layouts optimized for smartphones/tablets
- **Address Management**: PSGC-compliant geographic hierarchy
- **Family Relationships**: Explicit relationship tracking between residents
- **Audit Trail**: Complete change history for accountability

### 2.2 Out of Scope (Future Phases)
- Municipal/Provincial level aggregation
- Document management and file storage
- Payment processing or fee collection
- Integration with other government systems
- Advanced reporting and data export features
- Multi-language support

---

## 3. User Personas & Roles

### 3.1 Primary Users

#### **Barangay Administrator**
- **Role**: Overall system administrator for their barangay
- **Goals**: Monitor population demographics, manage staff access, ensure data accuracy
- **Pain Points**: Manual record-keeping, inconsistent data, limited mobility
- **Usage**: Daily dashboard reviews, weekly staff management, monthly reporting

#### **Clerk/Field Staff**
- **Role**: Front-line data entry and resident interaction
- **Goals**: Quickly register new residents, update household information, work offline
- **Pain Points**: Poor mobile experience, connectivity issues, complex forms
- **Usage**: Continuous data entry, frequent household visits, mobile-heavy usage

#### **Super Administrator**
- **Role**: System-wide administrator across multiple barangays
- **Goals**: User management, system configuration, cross-barangay analytics
- **Pain Points**: Fragmented systems, inconsistent data standards
- **Usage**: Periodic system maintenance, user provisioning, high-level reporting

### 3.2 Secondary Users

#### **Resident (Self-Service)**
- **Role**: View and request updates to personal information
- **Goals**: Verify personal data accuracy, request corrections
- **Pain Points**: No visibility into official records, manual update processes
- **Usage**: Occasional profile reviews, annual information updates

---

## 4. Functional Requirements

### 4.1 Dashboard Module

#### 4.1.1 Overview Statistics
- **Total Active Residents**: Real-time count with trend indicators
- **Total Households**: Count with average household size
- **Population Pyramid**: Age-gender distribution visualization
- **New Registrations**: Recent additions with configurable time periods

#### 4.1.2 Quick Actions
- **Add New Resident**: Direct access to registration form
- **Create Household**: Quick household creation workflow
- **Recent Activity**: Last 10 system changes with user attribution
- **Search Residents**: Global search with auto-suggestions

#### 4.1.3 Analytics Widgets
- **Dependency Ratios**: Young (0-14), Working (15-64), Old (65+) dependents
- **Sex Distribution**: Male/Female breakdown with trend analysis
- **Civil Status Distribution**: Single, Married, Widowed, Divorced, Separated, Annulled, Registered Partnership, Live-in
- **Education Levels**: Distribution across education levels and current status
- **Employment Analytics**: Employment status breakdown, top PSOC occupations (all levels)
- **Citizenship Distribution**: Filipino, Dual Citizen, Foreign National breakdown
- **Ethnicity Breakdown**: LGU Form 10 compliant ethnic groups (Tagalog, Cebuano, Indigenous groups, etc.)
- **Religious Affiliation**: Distribution across religious denominations
- **Voting Statistics**: Voter registration rates and participation by year
- **Health Demographics**: Blood type distribution, BMI analysis
- **Address Distribution**: Population density by street, subdivision, and geographic hierarchy

### 4.2 Residents Module

#### 4.2.1 Profile Management
**Personal Information**
- Full name (First, Middle, Last, Extension Name)
- Birthdate with age calculation
- Sex (Male, Female) - using standardized enum
- Civil status (Single, Married, Widowed, Divorced, Separated, Annulled, Registered Partnership, Live-in) - LGU Form 10 compliant
- Citizenship (Filipino, Dual Citizen, Foreign National)

**Education & Employment**
- Education level (No Formal Education, Elementary, High School, College, Post-Graduate, Vocational, Graduate, Undergraduate)
- Education status (Currently Studying, Not Studying, Graduated, Dropped Out)
- Occupation using unified PSOC search (Major Group to Unit Sub-Group levels)
- Employment status (Employed, Unemployed, Underemployed, Self-Employed, Student, Retired, Homemaker, Unable to Work, Looking for Work, Not in Labor Force)
- Workplace information (optional)

**PSOC Hierarchy Support (5 Levels)**
- Major Group (e.g., "1 - Managers")
- Sub-Major Group (e.g., "11 - Chief Executives, Senior Officials And Legislators") 
- Minor Group (e.g., "111 - Legislators And Senior Officials")
- Unit Group (e.g., "1111 - Legislators")
- Unit Sub-Group (e.g., "111102 - Congressman") 
- Position Titles (custom job titles under unit groups)
- Cross-Referenced Occupations (related job suggestions)

**Contact & Documentation**
- Email address with validation
- Mobile number (required) and telephone number (optional)
- PhilSys Card Number (securely hashed with last 4 digits for lookup)
- Profile photo upload with image optimization

**Physical & Identity Information**
- Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-, Unknown)
- Height (in meters) and weight (in kg)
- Complexion description
- Ethnicity (LGU Form 10 compliant - Tagalog, Cebuano, Indigenous groups, Mixed heritage, etc.)
- Religion (Roman Catholic, Protestant, Islam, Indigenous beliefs, etc.)

**Voting Information**
- Voter registration status
- Resident voter status
- Last voted year

**Family Information**
- Mother's maiden name (First, Middle, Last)

**Address Override**
- Individual address components (can override household address)
- Region, Province, City/Municipality, Barangay codes (PSGC compliant)
- House/Block/Lot, Street, Subdivision, ZIP code

#### 4.2.2 Residency Information
- Current household assignment with role (Head, Member)
- Residency verification status
- Registration date and source
- Migration history with dates and reasons
- Previous addresses (if applicable)

#### 4.2.3 Search & Filtering
- **Full-Text Search**: Name, contact information, occupation description, workplace
- **Advanced Filters**: 
  - Demographics: Age range, sex, civil status, citizenship, ethnicity, religion
  - Education: Education level and status
  - Employment: PSOC occupation codes, employment status, workplace
  - Physical: Blood type, height/weight ranges
  - Location: Region, Province, City/Municipality, Barangay, Street, Subdivision
  - Voting: Voter registration status, last voted year
- **Household Filters**: By household head, address, member count
- **Status Filters**: Active, Inactive, Migrated residents
- **Export Options**: CSV, PDF reports with filtered results

#### 4.2.4 Bulk Operations
- Import residents from CSV/Excel templates
- Bulk status updates (Active/Inactive)
- Mass household assignments
- Batch verification status changes

### 4.3 Households Module

#### 4.3.1 Household Profile
**Basic Information**
- Unique household number
- Complete address with PSGC hierarchy
- Household head designation (required, unique per household)
- Creation date and last update

**Composition Management**
- Add/remove household members
- Assign/reassign household head
- Member relationship tracking
- Household size calculations

**Address Details**
- Street name (required)
- House/Lot number
- Subdivision/Zone/Sitio/Purok (optional)
- Complete PSGC hierarchy (Region → Province → City/Municipality → Barangay)

#### 4.3.2 Member Management
- **Head Assignment**: One head per household, validation enforced
- **Member Addition**: Link existing residents or create new profiles
- **Relationship Mapping**: Define relationships between members
- **Member History**: Track join/leave dates and reasons

#### 4.3.3 Household Analytics
- Average household size per street/subdivision
- Head of household demographics
- Household composition patterns
- Address distribution mapping

### 4.4 Settings Module

#### 4.4.1 User Management
**User Accounts**
- Create user profiles with role assignment
- Jurisdiction scoping (barangay-level access control)
- Account activation/deactivation
- Password reset and security settings

**Role Management**
- Role-based permissions matrix
- Custom permission assignments
- Audit trail for role changes
- Bulk user operations

#### 4.4.2 Geographic Configuration
**PSGC Hierarchy Management (Read-Only)**
- Region, Province, City/Municipality, Barangay data (official PSA source)
- Hierarchy validation and consistency checks
- Reference data updates and synchronization

**Local Address Management (Barangay Admin)**
- **Subdivision Management**: Create/edit Zones, Sitios, Puroks within barangay
- **Street Name Management**: Add/edit streets within subdivisions or directly under barangay
- **Household Number Management**: Assign specific household numbers to streets
- **Address Hierarchy**: Visual management of complete address structure
- **Occupation Status**: Track which household numbers are occupied
- **Bulk Operations**: Import/export address data, mass updates
- **Validation Rules**: Ensure address completeness and consistency

#### 4.4.3 System Configuration
**Notification Settings**
- Push notification templates
- Email notification preferences
- SMS integration settings (future)
- Alert thresholds and triggers

**Data Management**
- Audit log retention policies
- Data export configurations
- Backup and recovery settings
- System maintenance schedules

#### 4.4.4 Reference Data Management
**PSOC Occupation Codes (Read-Only)**
- Official PSA hierarchical occupation classification (Major → Sub-Major → Minor → Unit → Unit Sub-Groups)
- Position titles and job names under unit groups
- Cross-referenced related occupations (e.g., Finance Manager shows related Accountant positions)
- Unified search interface across all PSOC levels with relationship suggestions
- Real-time occupation lookup and selection with "Title - Subtitle" display format
- Reference data synchronization with PSA updates

**Standardized Enums (System Managed)**
- Sex, Civil Status, Education Level/Status, Employment Status
- Citizenship, Blood Type, Religion, Ethnicity (LGU Form 10 compliant)
- Automatic dropdown population and validation
- Multi-language display support (future)

### 4.5 Family Relationships Module

#### 4.5.1 Relationship Types
- **Spouse**: Bidirectional relationship with automatic reciprocity
- **Parent/Child**: Hierarchical relationships with age validation
- **Sibling**: Peer relationships within households
- **Guardian/Ward**: Legal guardian relationships
- **Other**: Custom relationship types with descriptions

#### 4.5.2 Relationship Management
- **Create Relationships**: Link residents with relationship types
- **Validate Relationships**: Age-appropriate and logical consistency
- **Relationship History**: Track changes over time
- **Visual Family Tree**: Graphical representation of relationships

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- **Page Load Time**: <3 seconds on 3G mobile connections
- **API Response Time**: <500ms for standard CRUD operations
- **Database Query Performance**: <200ms for complex analytics queries
- **Concurrent Users**: Support 50+ simultaneous users per barangay
- **Data Synchronization**: <5 seconds for offline-to-online sync

### 5.2 Security Requirements
- **Authentication**: Multi-factor authentication for admin users
- **Authorization**: Row-level security with role-based access control
- **Data Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Audit Logging**: Complete audit trail for all data changes
- **Session Management**: Secure session handling with automatic timeout
- **Data Privacy**: GDPR-compliant data handling and user consent

### 5.3 Availability & Reliability
- **Uptime**: 99.5% availability during business hours
- **Disaster Recovery**: <4 hour recovery time objective
- **Data Backup**: Daily automated backups with point-in-time recovery
- **Error Handling**: Graceful degradation with user-friendly error messages
- **Monitoring**: Real-time system health monitoring and alerting

### 5.4 Usability Requirements
- **Mobile-First**: Optimized for smartphones and tablets
- **Accessibility**: WCAG 2.1 AA compliance
- **Browser Support**: Modern browsers (Chrome, Safari, Firefox, Edge)
- **Offline Capability**: Core functions available without internet
- **User Training**: <30 minute onboarding for new users

### 5.5 Scalability Requirements
- **Data Volume**: Support 10,000+ residents per barangay
- **Geographic Expansion**: Easy addition of new barangays
- **Feature Extensibility**: Modular architecture for future enhancements
- **API Scalability**: RESTful APIs for third-party integrations

---

## 6. Technical Architecture

### 6.1 Technology Stack
- **Frontend**: Next.js 14+ with TypeScript
- **UI Framework**: Tailwind CSS with Headless UI components
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **PWA Framework**: Next.js PWA plugin with service workers
- **State Management**: Zustand or React Query for server state
- **Validation**: Zod for type-safe validation schemas

### 6.2 Database Design

#### 6.2.1 Core Tables
```sql
-- Enums for Data Standardization
sex_enum, civil_status_enum, education_level_enum, education_status_enum
employment_status_enum, citizenship_enum, blood_type_enum, religion_enum, ethnicity_enum

-- Reference Data (PSGC & PSOC Compliant)
psgc_regions, psgc_provinces, psgc_cities_municipalities, psgc_barangays
psoc_major_groups, psoc_sub_major_groups, psoc_minor_groups, psoc_unit_groups, psoc_unit_sub_groups
psoc_position_titles, psoc_occupation_cross_references

-- Access Control
roles, user_profiles, barangay_accounts

-- Geography & Addressing
subdivisions, street_names, street_locations, household_numbers, addresses

-- Core Entities
residents, households, household_members, resident_relationships

-- Analytics & Reporting
barangay_dashboard_summaries, audit_logs

-- Views for UI
psoc_occupation_search, psgc_address_hierarchy, settings_management_summary
```

#### 6.2.2 Key Design Patterns
- **Enum-Based Validation**: Standardized data types for all categorical fields
- **LGU Form 10 Compliance**: Ethnicity and demographic data follows official standards
- **Complete PSOC Integration**: 5-level occupation hierarchy (Major Group → Sub-Major → Minor → Unit → Unit Sub-Group)
- **PSOC Cross-References**: Related occupation suggestions (e.g., search 1211 shows related 2411 titles)
- **PhilSys Security**: Hashed card numbers with last-4-digit lookup
- **PSGC Direct Reference**: Direct use of official geographic codes with proper column naming
- **Flexible Addressing**: Individual address override capability
- **Position Titles Support**: Specific job titles under unit groups with unified search
- **Unified Search Views**: Flattened hierarchies for efficient UI searching with cross-references
- **Comprehensive Audit Trail**: Full change tracking with user attribution
- **Barangay-Scoped RLS**: Data isolation by jurisdiction

### 6.3 Security Architecture
- **Row-Level Security (RLS)**: Supabase policies for data isolation
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions by user role
- **API Rate Limiting**: Protection against abuse and DoS attacks

---

## 7. User Experience Design

### 7.1 Design Principles
- **Mobile-First**: Design for smallest screen first, then scale up
- **Progressive Disclosure**: Show only relevant information at each step
- **Consistent Navigation**: Intuitive navigation patterns across all pages
- **Accessibility**: Keyboard navigation, screen reader support, high contrast
- **Offline-First**: Graceful handling of connectivity issues

### 7.2 Key User Flows

#### 7.2.1 New Resident Registration
1. Navigate to Residents → Add New
2. Complete personal information form
3. Select/create household assignment
4. Upload profile photo (optional)
5. Review and confirm details
6. System generates resident ID
7. Success confirmation with next actions

#### 7.2.2 Household Creation
1. Navigate to Households → Create New
2. Enter household number and address
3. Select household head from existing residents
4. Add additional household members
5. Define member relationships
6. Review household composition
7. Save and generate household profile

#### 7.2.3 Dashboard Analytics Review
1. Login and view dashboard overview
2. Review population statistics
3. Analyze demographic trends
4. Export reports as needed
5. Drill down into specific segments
6. Schedule automated reports

### 7.3 Responsive Design Strategy
- **Mobile (320-768px)**: Single column, touch-optimized, collapsed navigation
- **Tablet (768-1024px)**: Two column layout, expanded forms
- **Desktop (1024px+)**: Multi-column layout, side navigation, data tables

---

## 8. Data Migration & Integration

### 8.1 Initial Data Setup
- **PSGC Reference Data**: Import official geographic codes
- **PSOC Classification**: Load occupation hierarchy
- **Sample Users**: Create initial admin accounts
- **Test Data**: Generate realistic sample residents and households

### 8.2 Data Import Capabilities
- **CSV Import**: Bulk resident data from existing spreadsheets
- **Validation Rules**: Data quality checks during import
- **Error Handling**: Clear error messages for invalid data
- **Mapping Tools**: Column mapping for different data formats

---

## 9. Testing Strategy

### 9.1 Testing Types
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint and database testing
- **End-to-End Tests**: Complete user workflow testing
- **Performance Tests**: Load testing and optimization
- **Security Tests**: Penetration testing and vulnerability scanning

### 9.2 Test Coverage Requirements
- **Code Coverage**: Minimum 80% test coverage
- **Critical Paths**: 100% coverage for user registration and data modification
- **Security Tests**: All authentication and authorization flows
- **Mobile Testing**: All major mobile browsers and devices

---

## 10. Deployment & Operations

### 10.1 Deployment Strategy
- **Environment**: Vercel for frontend, Supabase for backend
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- **Environment Management**: Development, Staging, Production environments
- **Database Migrations**: Version-controlled schema changes

### 10.2 Monitoring & Maintenance
- **Application Monitoring**: Real-time error tracking and performance monitoring
- **Database Monitoring**: Query performance and connection pool monitoring
- **User Analytics**: Usage patterns and feature adoption tracking
- **Security Monitoring**: Authentication attempts and suspicious activity

---

## 11. Success Criteria & KPIs

### 11.1 Launch Criteria
- [ ] All core CRUD operations functional
- [ ] Mobile responsive design complete
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] User acceptance testing completed
- [ ] Documentation and training materials ready

### 11.2 Post-Launch KPIs
- **Adoption**: 90% of target users actively using system within 3 months
- **Performance**: <3 second average page load time
- **Reliability**: <1% error rate on critical operations
- **User Satisfaction**: >4.0/5.0 user satisfaction score
- **Data Quality**: <1% data validation errors

---

## 12. Risk Assessment

### 12.1 Technical Risks
- **Data Migration**: Risk of data loss during initial migration
  - *Mitigation*: Comprehensive backup and rollback procedures
- **Performance**: System slowdown with large datasets
  - *Mitigation*: Database optimization and caching strategies
- **Security**: Unauthorized data access
  - *Mitigation*: Multiple security layers and regular audits

### 12.2 Business Risks
- **User Adoption**: Resistance to digital transformation
  - *Mitigation*: Comprehensive training and change management
- **Data Quality**: Incomplete or inaccurate existing data
  - *Mitigation*: Data validation tools and cleanup procedures
- **Connectivity**: Limited internet access in rural areas
  - *Mitigation*: Offline-first PWA capabilities

---

## 13. Future Roadmap

### 13.1 Phase 2 Features (6-12 months)
- Municipal-level aggregation and reporting
- Document management and file storage
- Advanced analytics and data visualization
- Mobile app development (native iOS/Android)

### 13.2 Phase 3 Features (12-18 months)
- Integration with national ID systems
- Real-time population tracking
- GIS mapping and location services
- Multi-language support

---

## Appendix

### A. Glossary
- **PSGC**: Philippine Standard Geographic Code
- **PSOC**: Philippine Standard Occupational Classification
- **PWA**: Progressive Web Application
- **RLS**: Row-Level Security
- **CRUD**: Create, Read, Update, Delete operations

### B. References
- Philippine Statistics Authority PSGC Documentation
- PSOC 2012 Classification System
- Supabase Documentation and Best Practices
- Next.js PWA Implementation Guide

---

*This PRD is a living document and will be updated as requirements evolve and new insights are gathered during development.*