# Subdivision Requires Street Name - Business Rule Analysis

## 🔄 **SUPERSEDED BY UPDATED BUSINESS RULES**

**⚠️ IMPORTANT: This document has been superseded by the updated business rules.**

**New Rules (see `updated-address-business-rules.md`):**
- **House Number**: REQUIRED for all households
- **Street**: REQUIRED for all households  
- **Subdivision**: OPTIONAL (households can be directly on streets)
- **Geographic Hierarchy**: Barangay → City → Province → Region (ALL REQUIRED)

---

## 🔄 **Previous Business Rule Analysis** (Now Outdated)

---

## 📊 **Valid vs Invalid Address Combinations**

### **✅ VALID Combinations:**
```
✅ House + Street + Subdivision + Barangay     (Full hierarchy)
✅ House + Street + Barangay                   (Street without subdivision)  
✅ House + Barangay                            (Direct to barangay)
✅ Street + Subdivision + Barangay             (No house number)
✅ Street + Barangay                           (Street only)
✅ Barangay only                               (Minimum required)
```

### **❌ INVALID Combinations:**
```
❌ House + Subdivision + Barangay              (Subdivision WITHOUT street)
❌ Subdivision + Barangay                      (Subdivision WITHOUT street)
```

### **📝 Business Logic:**
- **Subdivision** implies you're within an organized development
- **Organized developments** always have internal street names
- **Therefore**: If you specify subdivision, you must specify the street within it

---

## 🔧 **Database Constraint Implementation**

### **Option 1: Database CHECK Constraint**
```sql
-- Add constraint to households table
ALTER TABLE households 
ADD CONSTRAINT chk_subdivision_requires_street 
CHECK (
    (subdivision_id IS NULL) OR 
    (subdivision_id IS NOT NULL AND street_id IS NOT NULL)
);
```

### **Option 2: Trigger-based Validation**
```sql
-- Validation function
CREATE OR REPLACE FUNCTION validate_subdivision_street_rule()
RETURNS TRIGGER AS $$
BEGIN
    -- If subdivision is specified, street must also be specified
    IF NEW.subdivision_id IS NOT NULL AND NEW.street_id IS NULL THEN
        RAISE EXCEPTION 'Street name is required when subdivision is specified';
    END IF;
    
    -- If street has a subdivision, the household subdivision must match or be null
    IF NEW.street_id IS NOT NULL THEN
        DECLARE
            street_subdivision_id UUID;
        BEGIN
            SELECT subdivision_id INTO street_subdivision_id 
            FROM geo_street_names 
            WHERE id = NEW.street_id;
            
            -- If street belongs to a subdivision, household subdivision must match
            IF street_subdivision_id IS NOT NULL AND 
               (NEW.subdivision_id IS NULL OR NEW.subdivision_id != street_subdivision_id) THEN
                RAISE EXCEPTION 'Household subdivision must match the street''s subdivision';
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to households
CREATE TRIGGER trigger_validate_subdivision_street
    BEFORE INSERT OR UPDATE ON households
    FOR EACH ROW
    EXECUTE FUNCTION validate_subdivision_street_rule();
```

### **Option 3: Application-Level Validation (Recommended)**
```sql
-- Function to get valid address combinations for dropdown
CREATE OR REPLACE FUNCTION get_valid_address_combinations(p_barangay_code VARCHAR(10))
RETURNS TABLE(
    combination_type VARCHAR(30),
    street_id UUID,
    street_name VARCHAR(100),
    subdivision_id UUID,
    subdivision_name VARCHAR(100),
    subdivision_type VARCHAR(20),
    display_text TEXT,
    full_address_preview TEXT,
    is_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    -- Combination 1: Streets WITH subdivisions (VALID)
    SELECT 
        'street_with_subdivision'::VARCHAR(30) as combination_type,
        st.id as street_id,
        st.name as street_name,
        st.subdivision_id,
        sub.name as subdivision_name,
        sub.type as subdivision_type,
        CONCAT('🛣️ ', st.name, ' • 🏘️ ', sub.name, ' (', sub.type, ')') as display_text,
        CONCAT(st.name, ', ', sub.name, ', Brgy. ', b.name) as full_address_preview,
        true as is_valid
    FROM geo_street_names st
    JOIN geo_subdivisions sub ON st.subdivision_id = sub.id
    JOIN psgc_barangays b ON st.barangay_code = b.code
    WHERE st.barangay_code = p_barangay_code 
    AND st.is_active = true 
    AND sub.is_active = true

    UNION ALL

    -- Combination 2: Streets WITHOUT subdivisions (VALID)
    SELECT 
        'street_only'::VARCHAR(30) as combination_type,
        st.id as street_id,
        st.name as street_name,
        null as subdivision_id,
        null as subdivision_name,
        null as subdivision_type,
        CONCAT('🛣️ ', st.name, ' (Direct to Barangay)') as display_text,
        CONCAT(st.name, ', Brgy. ', b.name) as full_address_preview,
        true as is_valid
    FROM geo_street_names st
    JOIN psgc_barangays b ON st.barangay_code = b.code
    WHERE st.barangay_code = p_barangay_code
    AND st.subdivision_id IS NULL
    AND st.is_active = true

    -- Note: NO subdivision-only option since subdivision requires street

    ORDER BY combination_type, subdivision_name NULLS LAST, street_name;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 **Updated Frontend Implementation**

### **React Component with New Rule:**
```jsx
// components/AddressSelector.jsx (Updated with business rule)
import { useState, useEffect } from 'react';

export default function AddressSelector({ barangayCode, value, onChange }) {
  const [addressOptions, setAddressOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!barangayCode) return;
    
    setLoading(true);
    fetch(`/api/valid-address-combinations?barangay=${barangayCode}`)
      .then(res => res.json())
      .then(data => {
        setAddressOptions(data);
        setLoading(false);
      });
  }, [barangayCode]);

  const handleSelectionChange = (e) => {
    if (!e.target.value) {
      onChange({ street_id: null, subdivision_id: null, preview: '' });
      return;
    }

    const selectedOption = addressOptions.find(opt => 
      `${opt.street_id || 'null'}-${opt.subdivision_id || 'null'}` === e.target.value
    );
    
    onChange({
      street_id: selectedOption?.street_id || null,
      subdivision_id: selectedOption?.subdivision_id || null,
      preview: selectedOption?.full_address_preview || '',
      combination_type: selectedOption?.combination_type
    });
  };

  const currentValue = value ? 
    `${value.street_id || 'null'}-${value.subdivision_id || 'null'}` : '';

  return (
    <div className="form-group">
      <label>Street & Subdivision</label>
      <select 
        value={currentValue} 
        onChange={handleSelectionChange}
        disabled={loading || !barangayCode}
        className="form-control"
      >
        <option value="">-- Select Street Location --</option>
        
        {/* Streets within subdivisions */}
        <optgroup label="🏘️ Streets within Subdivisions/Villages">
          {addressOptions
            .filter(opt => opt.combination_type === 'street_with_subdivision')
            .map(opt => (
              <option 
                key={`${opt.street_id}-${opt.subdivision_id}`} 
                value={`${opt.street_id}-${opt.subdivision_id}`}
              >
                {opt.display_text}
              </option>
            ))
          }
        </optgroup>
        
        {/* Direct streets (no subdivision) */}
        <optgroup label="🛣️ Direct Streets (No Subdivision)">
          {addressOptions
            .filter(opt => opt.combination_type === 'street_only')
            .map(opt => (
              <option 
                key={`${opt.street_id}-null`} 
                value={`${opt.street_id}-null`}
              >
                {opt.display_text}
              </option>
            ))
          }
        </optgroup>
      </select>
      
      {loading && <small>Loading street options...</small>}
      
      {value?.preview && (
        <div className="address-preview mt-2 p-2 bg-light rounded-sm">
          <small><strong>Address Preview:</strong> {value.preview}</small>
        </div>
      )}
      
      <div className="form-text text-muted">
        <small>
          <strong>Rule:</strong> Subdivisions/villages always require a specific street name.
          You can select direct streets without subdivisions.
        </small>
      </div>
    </div>
  );
}
```

### **Alternative: Two-Step Selection (Clearer UX)**
```jsx
// components/TwoStepAddressSelector.jsx
export default function TwoStepAddressSelector({ barangayCode, value, onChange }) {
  const [step, setStep] = useState(1); // 1: Choose type, 2: Choose specific
  const [addressType, setAddressType] = useState(''); // 'with_subdivision' or 'direct_street'
  
  return (
    <div className="address-selector">
      {/* Step 1: Choose address type */}
      <div className="form-group">
        <label>Address Type</label>
        <div className="btn-group-toggle" data-toggle="buttons">
          <label className={`btn btn-outline-primary ${addressType === 'with_subdivision' ? 'active' : ''}`}>
            <input 
              type="radio" 
              name="addressType" 
              value="with_subdivision"
              checked={addressType === 'with_subdivision'}
              onChange={(e) => {
                setAddressType(e.target.value);
                setStep(2);
              }}
            />
            🏘️ Street within Subdivision/Village
          </label>
          <label className={`btn btn-outline-primary ${addressType === 'direct_street' ? 'active' : ''}`}>
            <input 
              type="radio" 
              name="addressType" 
              value="direct_street"
              checked={addressType === 'direct_street'}
              onChange={(e) => {
                setAddressType(e.target.value);
                setStep(2);
              }}
            />
            🛣️ Direct Street (No Subdivision)
          </label>
        </div>
      </div>

      {/* Step 2: Choose specific street */}
      {step === 2 && (
        <div className="form-group">
          <label>
            {addressType === 'with_subdivision' 
              ? 'Select Street within Subdivision' 
              : 'Select Direct Street'
            }
          </label>
          <select 
            value={`${value?.street_id || ''}-${value?.subdivision_id || ''}`}
            onChange={(e) => {
              const [streetId, subdivisionId] = e.target.value.split('-');
              const selectedOption = addressOptions.find(opt => 
                opt.street_id === (streetId || null) && 
                opt.subdivision_id === (subdivisionId || null)
              );
              
              onChange({
                street_id: streetId || null,
                subdivision_id: subdivisionId || null,
                preview: selectedOption?.full_address_preview || ''
              });
            }}
            className="form-control"
          >
            <option value="">-- Select Street --</option>
            {addressOptions
              .filter(opt => 
                addressType === 'with_subdivision' 
                  ? opt.combination_type === 'street_with_subdivision'
                  : opt.combination_type === 'street_only'
              )
              .map(opt => (
                <option 
                  key={`${opt.street_id}-${opt.subdivision_id || ''}`}
                  value={`${opt.street_id}-${opt.subdivision_id || ''}`}
                >
                  {opt.display_text}
                </option>
              ))
            }
          </select>
        </div>
      )}

      {value?.preview && (
        <div className="alert alert-info">
          <strong>Selected Address:</strong> {value.preview}
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 **Data Management Impact**

### **Creating Streets within Subdivisions:**
```sql
-- When creating a street within a subdivision:
INSERT INTO geo_street_names (name, barangay_code, subdivision_id) 
VALUES ('Rizal Street', '137404001', uuid_of_sunshine_village);

-- This street can ONLY be used with its subdivision
-- Households using this street MUST specify the subdivision
```

### **Creating Direct Streets:**
```sql
-- When creating a direct street (no subdivision):
INSERT INTO geo_street_names (name, barangay_code, subdivision_id) 
VALUES ('National Highway', '137404001', null);

-- This street can be used WITHOUT subdivision
-- Households can reference this street directly
```

### **Household Creation Rules:**
```sql
-- ✅ VALID: Street with its subdivision
INSERT INTO households (street_id, subdivision_id, barangay_code)
VALUES (rizal_street_id, sunshine_village_id, '137404001');

-- ✅ VALID: Direct street without subdivision  
INSERT INTO households (street_id, subdivision_id, barangay_code)
VALUES (national_highway_id, null, '137404001');

-- ❌ INVALID: Subdivision without street (violates new rule)
INSERT INTO households (street_id, subdivision_id, barangay_code)
VALUES (null, sunshine_village_id, '137404001');
```

---

## 🎯 **Summary of Changes**

### **✅ New Business Rule Implemented:**
- **"If subdivision is selected, street name is required"**
- Subdivisions always imply organized developments with internal streets
- Maintains flexibility for direct streets without subdivisions

### **📊 Valid Address Patterns:**
```
✅ Street + Subdivision → "Rizal Street, Sunshine Village" 
✅ Street Only → "National Highway" (no subdivision)
❌ Subdivision Only → NOT ALLOWED (must have street)
✅ Neither → "Purok 3" (direct to barangay)
```

### **🔧 Implementation Options:**
1. **Database constraint** (strictest validation)
2. **Trigger validation** (business logic at DB level)  
3. **Application validation** (recommended - better UX)

This business rule makes logical sense for Philippine addresses - subdivisions are organized developments that always have internal street systems! 🏘️✅