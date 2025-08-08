# RBI System - Field Mapping Reference

## Database Schema to UI Form Mapping - Implementation Status Guide

---

## 📊 **Implementation Status Overview**

This document provides comprehensive field mapping for all implementation tiers with current status indicators.

### **Status Legend**

- ✅ **Implemented** - Feature complete and functional
- 🔶 **Partial** - Partially implemented, needs enhancement
- ❌ **Not Implemented** - Planned but not yet built
- 📋 **Planned** - Scheduled for future implementation

### **Current Implementation Level: ~65% Complete**

| Module                     | Implementation Status | MVP Tier  | Standard Tier | Enterprise Tier |
| -------------------------- | --------------------- | --------- | ------------- | --------------- |
| **Personal Information**   | ✅ 90% Complete       | ✅ Full   | ✅ Full       | ✅ Full         |
| **Contact & Address**      | ✅ 95% Complete       | ✅ Full   | ✅ Full       | ✅ Enhanced     |
| **Education & Employment** | 🔶 60% Complete       | 🔶 Basic  | ✅ Full       | ✅ Advanced     |
| **Health & Demographics**  | 🔶 50% Complete       | 🔶 Basic  | ✅ Full       | ✅ Enhanced     |
| **Sectoral Information**   | ✅ 85% Complete       | ✅ Manual | ✅ Auto-calc  | ✅ AI-powered   |
| **Family Relationships**   | ❌ 0% Complete        | ❌ None   | 🔶 Basic      | ✅ Full         |
| **Household Management**   | ✅ 90% Complete       | ✅ Full   | ✅ Full       | ✅ Enhanced     |
| **Analytics & Reporting**  | 🔶 40% Complete       | 🔶 Basic  | ✅ Standard   | ✅ Enterprise   |

### **Implementation Tiers Explained**

#### 🟢 **MVP Tier** - Free Tier Optimized

- Essential features only
- Client-side calculations
- Basic UI components
- Manual data entry

#### 🟡 **Standard Tier** - Balanced Features

- Enhanced UI/UX
- Server-side processing
- Auto-calculations
- Advanced search

#### 🔴 **Enterprise Tier** - Full Feature Set

- AI-powered features
- Complex analytics
- Advanced reporting
- Full automation

---

## 👤 **RESIDENTS MODULE**

### **Personal Information Section**

| UI Field Label                | Database Column            | Data Type         | Validation               | UI Component  | Status | Notes                   |
| ----------------------------- | -------------------------- | ----------------- | ------------------------ | ------------- | ------ | ----------------------- |
| **PhilSys Card Number (PCN)** | `philsys_card_number_hash` | BYTEA             | Hashed, secure           | Masked Input  | ✅     | Fully encrypted storage |
| **Last 4 Digits**             | `philsys_last4`            | VARCHAR(4)        | Auto-extracted           | Display Only  | ✅     | Auto-generated from PCN |
| **First Name**                | `first_name`               | VARCHAR(100)      | Required, 2-100 chars    | Text Input    | ✅     | Basic validation        |
| **Middle Name**               | `middle_name`              | VARCHAR(100)      | Optional                 | Text Input    | ✅     | Optional field          |
| **Last Name**                 | `last_name`                | VARCHAR(100)      | Required, 2-100 chars    | Text Input    | ✅     | Basic validation        |
| **Extension Name**            | `extension_name`           | VARCHAR(20)       | Optional (Jr., Sr., III) | Dropdown      | ✅     | Common suffixes         |
| **Date of Birth**             | `birthdate`                | DATE              | Required, valid date     | Date Picker   | ✅     | Age calculation         |
| **Age**                       | _computed_                 | _calculated_      | Auto-calculated          | Display Only  | ✅     | Client-side calc        |
| **Place of Birth**            | `birthplace`               | TEXT              | Optional                 | Text Input    | ✅     | Free text field         |
| **Sex**                       | `sex`                      | sex_enum          | Required                 | Radio Buttons | ✅     | Male/Female/Other       |
| **Civil Status**              | `civil_status`             | civil_status_enum | Required                 | Dropdown      | ✅     | Standard options        |
| **Citizenship**               | `citizenship`              | citizenship_enum  | Default: 'filipino'      | Dropdown      | ✅     | Multiple citizenship    |

### **Contact Information Section**

| UI Field Label        | Database Column           | Data Type    | Validation            | UI Component | Status | Tier Support |
| --------------------- | ------------------------- | ------------ | --------------------- | ------------ | ------ | ------------ |
| **Email Address**     | `email`                   | VARCHAR(255) | Optional, valid email | Email Input  | ✅     | All tiers    |
| **Mobile Number**     | `mobile_number`           | VARCHAR(20)  | Required, PH format   | Phone Input  | ✅     | All tiers    |
| **Telephone Number**  | `telephone_number`        | TEXT         | Optional              | Phone Input  | ✅     | All tiers    |
| **Emergency Contact** | `emergency_contact_name`  | VARCHAR(200) | Optional              | Text Input   | 🔶     | Standard+    |
| **Emergency Phone**   | `emergency_contact_phone` | VARCHAR(20)  | Optional, PH format   | Phone Input  | 🔶     | Standard+    |

### **Address Section**

| UI Field Label        | Database Column          | Data Type   | Validation        | UI Component     | Status | Implementation      |
| --------------------- | ------------------------ | ----------- | ----------------- | ---------------- | ------ | ------------------- |
| **Household**         | `household_id`           | VARCHAR(22) | Required          | Household Search | ✅     | Auto-suggestion     |
| **Region**            | `region_code`            | VARCHAR(10) | Auto-populated    | Display Only     | ✅     | From user barangay  |
| **Province**          | `province_code`          | VARCHAR(10) | Auto-populated    | Display Only     | ✅     | From user barangay  |
| **City/Municipality** | `city_municipality_code` | VARCHAR(10) | Auto-populated    | Display Only     | ✅     | From user barangay  |
| **Barangay**          | `barangay_code`          | VARCHAR(10) | Auto-populated    | Display Only     | ✅     | From user barangay  |
| **Subdivision**       | _from household_         | TEXT        | Auto-populated    | Display Only     | ✅     | From household data |
| **Street Name**       | _from household_         | TEXT        | Auto-populated    | Display Only     | ✅     | From household data |
| **House Number**      | _from household_         | TEXT        | Auto-populated    | Display Only     | ✅     | From household data |
| **ZIP Code**          | `zip_code`               | TEXT        | Optional override | Text Input       | ✅     | Manual override     |
| **GPS Coordinates**   | `latitude, longitude`    | DECIMAL     | Optional          | Map Picker       | ❌     | Enterprise tier     |

### **Education & Employment Section**

| UI Field Label                     | Database Column     | Data Type              | Validation           | UI Component   | Status | Tier              |
| ---------------------------------- | ------------------- | ---------------------- | -------------------- | -------------- | ------ | ----------------- |
| **Highest Educational Attainment** | `education_level`   | education_level_enum   | Optional             | Dropdown       | ✅     | All               |
| **Education Status**               | `education_status`  | education_status_enum  | Optional             | Dropdown       | ✅     | All               |
| **School Name**                    | `school_name`       | VARCHAR(255)           | Optional             | Text Input     | 🔶     | Standard+         |
| **Course/Degree**                  | `course_degree`     | VARCHAR(255)           | Optional             | Text Input     | ❌     | Standard+         |
| **Graduation Year**                | `graduation_year`   | INTEGER                | Optional, valid year | Number Input   | ❌     | Standard+         |
| **Employment Status**              | `employment_status` | employment_status_enum | Optional             | Dropdown       | ✅     | All               |
| **Profession/Occupation**          | `psoc_code`         | VARCHAR(10)            | Optional             | PSOC Search    | ✅     | Enhanced search   |
| **Occupation Level**               | `psoc_level`        | VARCHAR(20)            | Auto-set from PSOC   | Hidden Field   | ✅     | Auto-populated    |
| **Occupation Title**               | `occupation_title`  | VARCHAR(200)           | Auto-populated       | Display Only   | 🔶     | Needs enhancement |
| **Workplace**                      | `workplace`         | VARCHAR(255)           | Optional             | Text Input     | ❌     | Not implemented   |
| **Work Address**                   | `work_address`      | TEXT                   | Optional             | Text Area      | ❌     | Standard+         |
| **Monthly Salary**                 | `salary`            | DECIMAL(12,2)          | Optional, positive   | Currency Input | ✅     | Privacy controls  |
| **Income Source**                  | `income_source`     | income_source_enum     | Optional             | Dropdown       | 🔶     | Basic options     |

### **Health & Demographics Section**

| UI Field Label         | Database Column      | Data Type       | Validation         | UI Component   | Status | Notes             |
| ---------------------- | -------------------- | --------------- | ------------------ | -------------- | ------ | ----------------- |
| **Blood Type**         | `blood_type`         | blood_type_enum | Default: 'unknown' | Dropdown       | ✅     | Standard options  |
| **Height (meters)**    | `height_m`           | DECIMAL(4,2)    | Optional, positive | Number Input   | ✅     | Metric system     |
| **Weight (kg)**        | `weight_kg`          | DECIMAL(5,2)    | Optional, positive | Number Input   | ✅     | BMI calculation   |
| **BMI**                | _computed_           | _calculated_    | Auto-calculated    | Display Only   | ✅     | Client-side calc  |
| **BMI Category**       | _computed_           | _calculated_    | Auto-categorized   | Display Only   | ✅     | Health categories |
| **Disabilities**       | `disabilities`       | TEXT            | Optional           | Checkbox Group | 🔶     | Basic checkboxes  |
| **Medical Conditions** | `medical_conditions` | TEXT            | Optional           | Text Area      | ❌     | Privacy concerns  |
| **Allergies**          | `allergies`          | TEXT            | Optional           | Text Area      | ❌     | Privacy concerns  |

### **Sectoral Information Section**

| UI Field Label                     | Database Column          | Data Type | Validation               | UI Component | Status | Automation         |
| ---------------------------------- | ------------------------ | --------- | ------------------------ | ------------ | ------ | ------------------ |
| **Senior Citizen**                 | `is_senior_citizen`      | BOOLEAN   | Auto-calculated from age | Checkbox     | ✅     | Age ≥ 60           |
| **PWD (Person with Disability)**   | `is_pwd`                 | BOOLEAN   | Manual selection         | Checkbox     | ✅     | Manual input       |
| **Indigenous People**              | `is_indigenous_people`   | BOOLEAN   | Manual selection         | Checkbox     | ✅     | Manual input       |
| **Solo Parent**                    | `is_solo_parent`         | BOOLEAN   | Manual selection         | Checkbox     | ✅     | Manual input       |
| **OFW (Overseas Filipino Worker)** | `is_ofw`                 | BOOLEAN   | Manual selection         | Checkbox     | ✅     | Manual input       |
| **Unemployed**                     | `is_unemployed`          | BOOLEAN   | Auto-calculated          | Checkbox     | 🔶     | Partial automation |
| **Out of School Youth**            | `is_out_of_school_youth` | BOOLEAN   | Auto-calculated          | Checkbox     | 🔶     | Age + education    |
| **4Ps Beneficiary**                | `is_4ps_beneficiary`     | BOOLEAN   | Manual selection         | Checkbox     | ✅     | Manual input       |
| **Pregnant**                       | `is_pregnant`            | BOOLEAN   | Manual selection         | Checkbox     | ✅     | Female only        |
| **Lactating**                      | `is_lactating`           | BOOLEAN   | Manual selection         | Checkbox     | ✅     | Female only        |
| **Voter**                          | `is_voter`               | BOOLEAN   | Manual selection         | Checkbox     | ✅     | Age validation     |

### **Family Relationship Section** ❌ _Not Yet Implemented_

| UI Field Label           | Database Column                         | Data Type         | Validation | UI Component  | Status | Tier       |
| ------------------------ | --------------------------------------- | ----------------- | ---------- | ------------- | ------ | ---------- |
| **Relationship to Head** | `relationship_to_head`                  | relationship_enum | Required   | Dropdown      | ❌     | Standard+  |
| **Mother's Name**        | `mother_first_name, mother_maiden_name` | VARCHAR           | Optional   | Name Input    | ❌     | Standard+  |
| **Father's Name**        | `father_first_name, father_last_name`   | VARCHAR           | Optional   | Name Input    | ❌     | Standard+  |
| **Spouse Name**          | `spouse_id`                             | VARCHAR(22)       | Optional   | Person Search | ❌     | Enterprise |
| **Emergency Contact**    | `emergency_contact_id`                  | VARCHAR(22)       | Optional   | Person Search | ❌     | Standard+  |

### **Migration Information Section**

| UI Field Label        | Database Column     | Data Type            | Validation | UI Component  | Status | Tier       |
| --------------------- | ------------------- | -------------------- | ---------- | ------------- | ------ | ---------- |
| **Resident Status**   | `resident_status`   | resident_status_enum | Required   | Radio Buttons | ✅     | All        |
| **Date Moved In**     | `date_moved_in`     | DATE                 | Optional   | Date Picker   | ✅     | All        |
| **Previous Address**  | `previous_address`  | TEXT                 | Optional   | Text Area     | ✅     | All        |
| **Reason for Moving** | `reason_for_moving` | TEXT                 | Optional   | Text Area     | 🔶     | Standard+  |
| **Migration Type**    | `migration_type`    | migration_type_enum  | Optional   | Dropdown      | ❌     | Enterprise |

---

## 🏠 **HOUSEHOLDS MODULE**

### **Household Information Section**

| UI Field Label             | Database Column          | Data Type           | Validation         | UI Component    | Status | Notes              |
| -------------------------- | ------------------------ | ------------------- | ------------------ | --------------- | ------ | ------------------ |
| **Household ID**           | `id`                     | VARCHAR(22)         | Auto-generated     | Display Only    | ✅     | ULID format        |
| **House Number**           | `house_number`           | TEXT                | Required           | Text Input      | ✅     | Address component  |
| **Street Name**            | `street`                 | TEXT                | Optional           | Text Input      | ✅     | Address component  |
| **Subdivision**            | `subdivision`            | TEXT                | Optional           | Text Input      | ✅     | Address component  |
| **Barangay**               | `barangay_code`          | VARCHAR(10)         | Auto-set from user | Display Only    | ✅     | User's barangay    |
| **Household Type**         | `household_type`         | household_type_enum | Required           | Visual Selector | ✅     | Visual icons       |
| **Ownership Type**         | `ownership_type`         | ownership_type_enum | Required           | Radio Buttons   | ✅     | Property status    |
| **Construction Materials** | `construction_materials` | TEXT                | Optional           | Checkbox Group  | 🔶     | Multiple materials |
| **Water Source**           | `water_source`           | water_source_enum   | Required           | Dropdown        | ✅     | Standard sources   |
| **Electricity**            | `has_electricity`        | BOOLEAN             | Required           | Radio Buttons   | ✅     | Yes/No             |
| **Internet Access**        | `has_internet`           | BOOLEAN             | Optional           | Radio Buttons   | ✅     | Yes/No             |
| **Household Head**         | `head_id`                | VARCHAR(22)         | Required           | Person Search   | ✅     | Resident lookup    |

### **Household Composition**

| UI Field Label      | Database Column | Data Type    | Validation      | UI Component | Status | Automation        |
| ------------------- | --------------- | ------------ | --------------- | ------------ | ------ | ----------------- |
| **Total Members**   | _computed_      | _calculated_ | Auto-calculated | Display Only | ✅     | Count residents   |
| **Adult Members**   | _computed_      | _calculated_ | Auto-calculated | Display Only | ✅     | Age ≥ 18          |
| **Minor Members**   | _computed_      | _calculated_ | Auto-calculated | Display Only | ✅     | Age < 18          |
| **Senior Citizens** | _computed_      | _calculated_ | Auto-calculated | Display Only | ✅     | Age ≥ 60          |
| **PWD Members**     | _computed_      | _calculated_ | Auto-calculated | Display Only | ✅     | PWD flag count    |
| **Working Members** | _computed_      | _calculated_ | Auto-calculated | Display Only | 🔶     | Employment status |
| **Students**        | _computed_      | _calculated_ | Auto-calculated | Display Only | 🔶     | Education status  |

---

## 📊 **ANALYTICS & REPORTING**

### **Population Analytics** 🔶 _40% Complete_

| Metric                     | Calculation                | Status | Tier Support |
| -------------------------- | -------------------------- | ------ | ------------ |
| **Total Population**       | COUNT(residents)           | ✅     | All tiers    |
| **Gender Distribution**    | GROUP BY sex               | ✅     | All tiers    |
| **Age Demographics**       | Age groups calculation     | ✅     | All tiers    |
| **Civil Status Breakdown** | GROUP BY civil_status      | ✅     | All tiers    |
| **Educational Levels**     | GROUP BY education_level   | ✅     | All tiers    |
| **Employment Statistics**  | GROUP BY employment_status | 🔶     | Standard+    |
| **Sectoral Populations**   | SUM sectoral flags         | ✅     | All tiers    |
| **Migration Patterns**     | Date-based analysis        | ❌     | Enterprise   |
| **Health Statistics**      | BMI, disabilities analysis | 🔶     | Standard+    |
| **Household Composition**  | Family structure analysis  | 🔶     | Standard+    |

### **Export Capabilities**

| Format                | Status | Tier       | Features               |
| --------------------- | ------ | ---------- | ---------------------- |
| **CSV Export**        | ✅     | All        | Basic data export      |
| **Excel Export**      | ❌     | Standard+  | Formatted spreadsheets |
| **PDF Reports**       | ❌     | Standard+  | Formatted documents    |
| **JSON Export**       | ✅     | All        | API data format        |
| **Scheduled Reports** | ❌     | Enterprise | Automated generation   |

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Core Completion (Next 4 weeks)**

- ✅ Complete workplace/occupation title fields
- ✅ Enhance PSOC search integration
- ✅ Implement basic family relationships
- ✅ Add emergency contact fields

### **Phase 2: Standard Tier Features (Weeks 5-8)**

- 🔶 Enhanced education/employment tracking
- 🔶 Advanced search and filtering
- 🔶 Basic analytics and reporting
- 🔶 Export capabilities

### **Phase 3: Enterprise Features (Weeks 9-12)**

- ❌ Full family tree relationships
- ❌ Advanced migration tracking
- ❌ Complex analytics dashboards
- ❌ Automated reporting system

---

## 🔧 **Technical Implementation**

### **Feature Flags for Tiers**

```typescript
// Feature configuration by tier
export const tierFeatures = {
  mvp: {
    familyRelationships: false,
    advancedSearch: false,
    complexAnalytics: false,
    automatedCalculations: false,
  },
  standard: {
    familyRelationships: true,
    advancedSearch: true,
    complexAnalytics: true,
    automatedCalculations: true,
  },
  enterprise: {
    familyRelationships: true,
    advancedSearch: true,
    complexAnalytics: true,
    automatedCalculations: true,
    aiFeatures: true,
    scheduledReports: true,
  },
};
```

### **Progressive Enhancement Example**

```typescript
// Component that adapts based on implementation tier
const PSOCSearch = () => {
  const tier = useImplementationTier();

  if (tier === 'mvp') {
    return <SimplePSOCDropdown />; // Basic dropdown
  }

  if (tier === 'standard') {
    return <EnhancedPSOCSearch />; // Search with autocomplete
  }

  return <AIPoweredPSOCSearch />; // AI-powered suggestions
};
```

---

## 📋 **Quick Reference**

### **Status Summary**

- **✅ Ready for Production**: 60% of all features
- **🔶 Needs Enhancement**: 25% of all features
- **❌ Not Implemented**: 15% of all features

### **Priority Implementation Order**

1. **Complete partial features** (🔶 → ✅)
2. **Add Standard tier enhancements**
3. **Implement Enterprise features**
4. **Add AI-powered capabilities**

### **Upgrade Path**

- **MVP → Standard**: Enable server-side processing, add enhanced features
- **Standard → Enterprise**: Add AI features, advanced analytics, automation

---

**Documentation Status**: ✅ Unified Field Mapping Complete  
**Implementation Status**: 65% Complete with clear roadmap  
**Next Steps**: Complete partial features and enhance Standard tier capabilities
