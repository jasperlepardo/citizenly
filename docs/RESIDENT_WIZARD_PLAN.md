# Resident Creation Wizard Plan

Based on the current database schema, this document outlines the complete plan for creating a new resident wizard interface.

## **Step 1: Personal Information**

**Fields from `residents` table:**
- `first_name` (required)
- `middle_name` (optional)
- `last_name` (required)
- `extension_name` (Jr., Sr., III, etc.)
- `birthdate` (required)
- `sex` (required - enum: male/female)
- `civil_status` (default: single)
- `civil_status_others_specify` (if "others" selected)

**Auto-populated:**
- `name` - via `auto_populate_resident_full_name()` trigger
- Age calculation from birthdate

## **Step 2: Birth Place & Identity**

**Fields:**
- `birth_place_code` - PSGC code lookup
- `birth_place_level` - enum (region/province/city_municipality/barangay)
- `birth_place_name` - auto-populated via `auto_populate_birth_place_name()`
- `philsys_card_number` (optional)
- `philsys_last4` (if PhilSys provided)
- `citizenship` (default: filipino)
- `ethnicity` (default: not_reported)
- `religion` (default: prefer_not_to_say)
- `religion_others_specify` (if needed)

**UI Components:**
- Birth place search using `search_birth_places()` function
- Cascading dropdowns for geographic selection

## **Step 3: Physical Characteristics**

**Fields:**
- `blood_type` (default: unknown)
- `height` (optional)
- `weight` (optional)
- `complexion` (optional)

## **Step 4: Mother's Information**

**Fields:**
- `mother_maiden_first`
- `mother_maiden_middle`
- `mother_maiden_last`

## **Step 5: Education & Employment**

**Fields:**
- `education_attainment` (enum)
- `is_graduate` (boolean)
- `employment_status` (enum)
- `psoc_code` - occupation lookup
- `occupation_title` - auto-populated via `auto_populate_employment_name()`
- `employment_code` and `employment_name` - auto-populated

**UI Components:**
- Occupation search using `search_psoc_occupations()` function
- Conditional fields based on employment status

## **Step 6: Contact Information**

**Fields:**
- `email` (optional)
- `mobile_number` (optional)
- `telephone_number` (optional)

## **Step 7: Address & Household Assignment**

**Two Options:**

### **Option A: Join Existing Household**
- Search existing households using `search_households()` function
- Select household and relationship to head
- Address auto-populated from household via `auto_populate_resident_address()`

### **Option B: Create New Household**
- **Household Information:**
  - `household_type` (enum)
  - `tenure_status` (enum)
  - `household_unit` (enum)
  - `monthly_income` (triggers `determine_income_class()`)
- **Address Selection:**
  - Barangay (filtered by user's jurisdiction via `user_barangay_code()`)
  - Subdivision (optional)
  - Street (optional)  
  - House number
- **Auto-generated:**
  - `code` via `generate_hierarchical_household_id()`
  - `name` via `auto_populate_name()` trigger
  - Address fields via `auto_populate_household_address()`

## **Step 8: Voting Information**

**Fields:**
- `is_voter` (boolean)
- `is_resident_voter` (boolean)
- `last_voted_date` (optional)

## **Step 9: Review & Submit**

**Display:**
- Complete resident information
- Household assignment details
- Auto-calculated sectoral information (via `auto_populate_sectoral_info()`)

## **Technical Implementation Plan**

### **Form Validation:**
- Use schema enums for dropdowns
- Required field validation
- Age validation (birthdate not in future)
- PhilSys format validation
- Email/phone format validation

### **Auto-Population Triggers:**
- All auto-populate functions will fire on INSERT
- Sectoral info calculated via `update_resident_sectoral_status()`
- Geographic hierarchy resolved via `auto_populate_geo_hierarchy()`

### **Security:**
- Form respects RLS policies
- User can only create residents in their assigned barangay
- `created_by` auto-populated via `populate_user_tracking_fields()`

### **Search Integration:**
- Birth place search with fuzzy matching
- Occupation search with PSOC hierarchy
- Household search with permissions filtering

### **Error Handling:**
- Database constraint violations
- Duplicate PhilSys number detection
- Invalid geographic code handling
- Household capacity limits

## **Database Functions Utilized**

### **Auto-Population Functions:**
- `auto_populate_resident_full_name()` - Generates full name from components
- `auto_populate_birth_place_name()` - Resolves birth place names from codes
- `auto_populate_employment_name()` - Fetches occupation titles from PSOC
- `auto_populate_sectoral_info()` - Determines sectoral classifications
- `auto_populate_geo_hierarchy()` - Resolves complete address hierarchy
- `auto_populate_resident_address()` - Copies address from household
- `generate_hierarchical_household_id()` - Creates unique household codes
- `auto_populate_household_address()` - Builds complete address strings

### **Search Functions:**
- `search_birth_places()` - Searches PSGC locations
- `search_psoc_occupations()` - Searches occupation hierarchy
- `search_households()` - Finds households with RLS filtering

### **Classification Functions:**
- `determine_income_class()` - Categorizes by income brackets
- `update_resident_sectoral_status()` - Updates sectoral classifications

### **Security Functions:**
- `user_barangay_code()` - Gets user's jurisdiction
- `populate_user_tracking_fields()` - Sets created_by/updated_by

## **Implementation Notes**

1. **Multi-step Form:** Use React/Next.js form wizard with state management
2. **Real-time Validation:** Validate each step before proceeding
3. **Auto-save:** Consider saving draft progress for long forms
4. **Mobile Responsive:** Ensure wizard works on all devices
5. **Accessibility:** Follow WCAG guidelines for form accessibility
6. **Performance:** Lazy load dropdown options and search results
7. **User Experience:** Show progress indicator and allow step navigation