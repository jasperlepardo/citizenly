# Updated Address Business Rules - RBI System

## 🏠 **CORRECTED Business Rules**

### **New Requirements:**
1. **House Number**: REQUIRED per household
2. **Street**: REQUIRED per household (NOT subdivision)
3. **Subdivision**: OPTIONAL (households can be directly on streets)
4. **Geographic Hierarchy**: Barangay → City/Municipality → Province → Region (ALL REQUIRED)

---

## 📍 **Updated Address Hierarchy**

### **REQUIRED Components:**
```
🏠 House Number (REQUIRED)
    ↓
🛣️ Street Name (REQUIRED)
    ↓  
🏘️ Subdivision/Village (OPTIONAL)
    ↓
🏛️ Barangay (REQUIRED)
    ↓
🏙️ City/Municipality (REQUIRED)
    ↓
🏞️ Province (REQUIRED)
    ↓
🌍 Region (REQUIRED)
```

### **Business Logic:**
- **Every household MUST have a house number** (123, Block 5 Lot 10, Unit 4B, etc.)
- **Every household MUST be on a street** (Rizal Street, National Highway, etc.)
- **Subdivision is optional** (street can be directly in barangay or within subdivision)
- **Complete geographic hierarchy required** for government compliance

---

## ✅ **Valid Address Combinations**

### **✅ VALID Examples:**
```
✅ House + Street + Subdivision + Barangay + City + Province + Region
   "123 Rizal Street, Sunshine Village, Brgy. San Jose, Makati City, Metro Manila, NCR"

✅ House + Street + Barangay + City + Province + Region (no subdivision)
   "456 National Highway, Brgy. Poblacion, Makati City, Metro Manila, NCR"
```

### **❌ INVALID Examples:**
```
❌ No house number: "Rizal Street, Brgy. San Jose" (missing house number)
❌ No street: "123 Sunshine Village, Brgy. San Jose" (missing street)
❌ Incomplete hierarchy: "123 Rizal Street, Brgy. San Jose" (missing city/province/region)
```

---

## 🔧 **Database Schema Updates**

### **Updated Households Table:**
```sql
-- Update households table with new constraints
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_number VARCHAR(20) NOT NULL UNIQUE,
    
    -- ADDRESS COMPONENTS (Updated rules)
    house_number VARCHAR(50) NOT NULL,                      -- ✅ NOW REQUIRED
    street_id UUID NOT NULL REFERENCES geo_street_names(id), -- ✅ NOW REQUIRED
    subdivision_id UUID REFERENCES geo_subdivisions(id),     -- ✅ STILL OPTIONAL
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code), -- ✅ REQUIRED
    
    -- DERIVED GEOGRAPHIC HIERARCHY (auto-populated from barangay)
    city_municipality_code VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) NOT NULL REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) NOT NULL REFERENCES psgc_regions(code),
    
    -- METADATA
    head_of_household_id UUID REFERENCES residents(id),
    household_type household_type_enum DEFAULT 'regular',
    is_active BOOLEAN DEFAULT true,
    
    -- AUDIT
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- CONSTRAINTS
    CONSTRAINT chk_house_number_not_empty CHECK (TRIM(house_number) != ''),
    CONSTRAINT chk_valid_household_number CHECK (household_number ~ '^[A-Z0-9-]+$')
);
```

### **Database Constraints:**
```sql
-- 1. House number is required and not empty
ALTER TABLE households 
ADD CONSTRAINT chk_house_number_required 
CHECK (house_number IS NOT NULL AND TRIM(house_number) != '');

-- 2. Street is required
ALTER TABLE households 
ADD CONSTRAINT chk_street_required 
CHECK (street_id IS NOT NULL);

-- 3. Geographic hierarchy consistency
ALTER TABLE households 
ADD CONSTRAINT chk_geographic_hierarchy_consistent
CHECK (
    -- Barangay must match street's barangay
    barangay_code = (SELECT barangay_code FROM geo_street_names WHERE id = street_id)
);

-- 4. Auto-populate geographic hierarchy trigger
CREATE OR REPLACE FUNCTION auto_populate_geographic_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-populate city, province, region from barangay
    SELECT 
        b.city_municipality_code,
        b.province_code,
        b.region_code
    INTO 
        NEW.city_municipality_code,
        NEW.province_code,
        NEW.region_code
    FROM psgc_barangays b
    WHERE b.code = NEW.barangay_code;
    
    -- Validate that all are populated
    IF NEW.city_municipality_code IS NULL 
       OR NEW.province_code IS NULL 
       OR NEW.region_code IS NULL THEN
        RAISE EXCEPTION 'Invalid barangay code - missing geographic hierarchy data';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_populate_geographic_hierarchy
    BEFORE INSERT OR UPDATE ON households
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_geographic_hierarchy();
```

---

## 🎯 **Updated Dropdown Implementation**

### **Required Form Fields:**
```jsx
// components/HouseholdCreateForm.jsx (Updated with new requirements)
export default function HouseholdCreateForm() {
  const [formData, setFormData] = useState({
    // REQUIRED FIELDS
    household_number: '',
    house_number: '',      // ✅ NOW REQUIRED
    barangay_code: '',     // ✅ REQUIRED
    street_id: '',         // ✅ NOW REQUIRED
    
    // OPTIONAL FIELDS  
    subdivision_id: null,  // ✅ STILL OPTIONAL
    
    // AUTO-POPULATED
    city_municipality_code: '',
    province_code: '',
    region_code: ''
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* 1. HOUSEHOLD NUMBER (Required) */}
      <div className="form-group">
        <label>Household Number <span className="required">*</span></label>
        <input
          type="text"
          value={formData.household_number}
          onChange={(e) => setFormData({...formData, household_number: e.target.value})}
          placeholder="e.g. HH-001234"
          required
          className="form-control"
        />
      </div>

      {/* 2. HOUSE NUMBER (Required) */}
      <div className="form-group">
        <label>House Number <span className="required">*</span></label>
        <input
          type="text"
          value={formData.house_number}
          onChange={(e) => setFormData({...formData, house_number: e.target.value})}
          placeholder="e.g. 123, Block 5 Lot 10, Unit 4B"
          required
          className="form-control"
        />
        <small className="form-text text-muted">
          <strong>Required:</strong> Every household must have a specific house/unit identifier
        </small>
      </div>

      {/* 3. BARANGAY (Required) */}
      <div className="form-group">
        <label>Barangay <span className="required">*</span></label>
        <select 
          value={formData.barangay_code} 
          onChange={(e) => setFormData({
            ...formData, 
            barangay_code: e.target.value,
            street_id: '',        // Reset dependent fields
            subdivision_id: null
          })}
          required
          className="form-control"
        >
          <option value="">-- Select Barangay --</option>
          {/* Barangay options */}
        </select>
      </div>

      {/* 4. STREET (Required) */}
      <StreetSelect
        barangayCode={formData.barangay_code}
        subdivisionId={formData.subdivision_id}
        value={formData.street_id}
        onChange={(streetId) => setFormData({...formData, street_id: streetId})}
        required={true}  // ✅ NOW REQUIRED
      />

      {/* 5. SUBDIVISION (Optional) */}
      <SubdivisionSelect
        barangayCode={formData.barangay_code}
        value={formData.subdivision_id}
        onChange={(subdivisionId) => setFormData({
          ...formData, 
          subdivision_id: subdivisionId,
          street_id: ''  // Reset street when subdivision changes
        })}
        required={false}  // ✅ STILL OPTIONAL
      />

      {/* 6. AUTO-POPULATED GEOGRAPHIC INFO (Display Only) */}
      {formData.barangay_code && (
        <div className="alert alert-info">
          <strong>Complete Address Will Be:</strong><br/>
          {[
            formData.house_number,
            streetName, // from selected street
            subdivisionName, // if selected
            `Brgy. ${barangayName}`,
            cityName,
            provinceName,
            regionName
          ].filter(Boolean).join(', ')}
        </div>
      )}

      <button type="submit" className="btn btn-primary">
        Create Household
      </button>
    </form>
  );
}
```

---

## 📊 **Validation Rules Summary**

### **Database Level:**
```sql
-- All required fields
house_number IS NOT NULL AND TRIM(house_number) != ''
street_id IS NOT NULL
barangay_code IS NOT NULL
city_municipality_code IS NOT NULL  -- auto-populated
province_code IS NOT NULL           -- auto-populated  
region_code IS NOT NULL             -- auto-populated

-- Optional field
subdivision_id CAN BE NULL
```

### **Application Level:**
```javascript
// Form validation
const validateHouseholdForm = (data) => {
  const errors = [];
  
  if (!data.house_number?.trim()) {
    errors.push('House number is required');
  }
  
  if (!data.street_id) {
    errors.push('Street selection is required');
  }
  
  if (!data.barangay_code) {
    errors.push('Barangay selection is required');
  }
  
  // subdivision_id is optional - no validation needed
  
  return errors;
};
```

---

## 🎯 **Key Changes from Previous Rules**

### **What Changed:**
1. **House Number**: Previously optional → Now **REQUIRED**
2. **Street**: Previously optional → Now **REQUIRED** 
3. **Subdivision**: Still optional (no change)
4. **Geographic Hierarchy**: Now enforced as **REQUIRED** (barangay → city → province → region)

### **What This Means:**
- **Every household must have a specific address** (house number + street)
- **No more vague addresses** like "somewhere in the barangay"
- **Government compliance** with complete geographic hierarchy
- **Better data quality** for official records and reports

### **Migration Impact:**
- Existing households without house numbers or streets will need data cleanup
- All households must be updated to include complete geographic hierarchy
- Forms must be updated to require these fields

This creates a **complete, standardized addressing system** that meets government requirements while maintaining flexibility for different address types! 🏠✅