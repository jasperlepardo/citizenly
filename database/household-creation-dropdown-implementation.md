# Household Creation with Dropdown Selection

## 🎯 **Implementation for Street Name & Subdivision Dropdowns**

### **Current Schema Design (Perfect for Dropdowns)**
Your current two-table structure is actually **ideal** for dropdown implementation:

```sql
geo_subdivisions    → Subdivision dropdown
geo_street_names    → Street name dropdown (filtered by subdivision)
```

---

## 🔄 **Database Views for Dropdown Data**

### **1. Subdivision Dropdown View**
```sql
-- View for subdivision dropdown options
CREATE OR REPLACE VIEW subdivision_dropdown_options AS
SELECT 
    s.id,
    s.name,
    s.type,
    s.barangay_code,
    b.name as barangay_name,
    CONCAT(s.name, ' (', s.type, ')') as display_name,
    CONCAT(s.name, ' (', s.type, '), ', b.name) as full_display_name
FROM geo_subdivisions s
JOIN psgc_barangays b ON s.barangay_code = b.code
WHERE s.is_active = true
ORDER BY s.barangay_code, s.type, s.name;
```

### **2. Street Name Dropdown View**
```sql
-- View for street name dropdown options (with subdivision context)
CREATE OR REPLACE VIEW street_dropdown_options AS
SELECT 
    st.id,
    st.name,
    st.barangay_code,
    st.subdivision_id,
    b.name as barangay_name,
    sub.name as subdivision_name,
    sub.type as subdivision_type,
    -- Display options for different contexts
    st.name as display_name,
    CONCAT(st.name, 
           CASE WHEN sub.name IS NOT NULL 
                THEN ', ' || sub.name 
                ELSE '' END) as street_with_subdivision,
    CONCAT(st.name, 
           CASE WHEN sub.name IS NOT NULL 
                THEN ', ' || sub.name || ' (' || sub.type || ')' 
                ELSE '' END,
           ', ', b.name) as full_display_name
FROM geo_street_names st
JOIN psgc_barangays b ON st.barangay_code = b.code
LEFT JOIN geo_subdivisions sub ON st.subdivision_id = sub.id
WHERE st.is_active = true
ORDER BY st.barangay_code, sub.name NULLS LAST, st.name;
```

### **3. Combined Address Options View**
```sql
-- Combined view for complete address selection
CREATE OR REPLACE VIEW address_selection_options AS
SELECT 
    st.id as street_id,
    st.name as street_name,
    st.subdivision_id,
    sub.name as subdivision_name,
    sub.type as subdivision_type,
    st.barangay_code,
    b.name as barangay_name,
    -- Formatted display options
    CASE 
        WHEN sub.name IS NOT NULL THEN
            CONCAT('📍 ', st.name, ' • ', sub.name, ' (', sub.type, ')')
        ELSE
            CONCAT('📍 ', st.name, ' • Direct Street')
    END as dropdown_display,
    -- Full address for confirmation
    CONCAT(st.name, 
           CASE WHEN sub.name IS NOT NULL 
                THEN ', ' || sub.name || ' (' || sub.type || ')' 
                ELSE '' END,
           ', Brgy. ', b.name) as full_address_preview
FROM geo_street_names st
JOIN psgc_barangays b ON st.barangay_code = b.code
LEFT JOIN geo_subdivisions sub ON st.subdivision_id = sub.id
WHERE st.is_active = true
ORDER BY st.barangay_code, sub.name NULLS LAST, st.name;
```

---

## 🎯 **API Endpoints Implementation**

### **1. Get Subdivisions for Barangay**
```sql
-- Function: Get subdivision options for specific barangay
CREATE OR REPLACE FUNCTION get_subdivision_options(p_barangay_code VARCHAR(10))
RETURNS TABLE(
    id UUID,
    name VARCHAR(100),
    type VARCHAR(20),
    display_name TEXT,
    resident_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.type,
        CONCAT(s.name, ' (', s.type, ')') as display_name,
        COALESCE(COUNT(h.id), 0)::INTEGER as resident_count
    FROM geo_subdivisions s
    LEFT JOIN households h ON s.id = h.subdivision_id AND h.is_active = true
    WHERE s.barangay_code = p_barangay_code 
    AND s.is_active = true
    GROUP BY s.id, s.name, s.type
    ORDER BY s.type, s.name;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT * FROM get_subdivision_options('137404001');
```

### **2. Get Streets for Barangay (with optional subdivision filter)**
```sql
-- Function: Get street options for barangay (optionally filtered by subdivision)
CREATE OR REPLACE FUNCTION get_street_options(
    p_barangay_code VARCHAR(10),
    p_subdivision_id UUID DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    name VARCHAR(100),
    subdivision_id UUID,
    subdivision_name VARCHAR(100),
    display_name TEXT,
    full_display TEXT,
    household_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        st.id,
        st.name,
        st.subdivision_id,
        sub.name as subdivision_name,
        -- Simple display for dropdown
        st.name as display_name,
        -- Full context for detailed view
        CASE 
            WHEN sub.name IS NOT NULL THEN
                CONCAT(st.name, ' (', sub.name, ' ', sub.type, ')')
            ELSE
                st.name
        END as full_display,
        COALESCE(COUNT(h.id), 0)::INTEGER as household_count
    FROM geo_street_names st
    LEFT JOIN geo_subdivisions sub ON st.subdivision_id = sub.id
    LEFT JOIN households h ON st.id = h.street_id AND h.is_active = true
    WHERE st.barangay_code = p_barangay_code 
    AND st.is_active = true
    AND (p_subdivision_id IS NULL OR st.subdivision_id = p_subdivision_id)
    GROUP BY st.id, st.name, st.subdivision_id, sub.name, sub.type
    ORDER BY sub.name NULLS LAST, st.name;
END;
$$ LANGUAGE plpgsql;

-- Usage Examples:
-- All streets in barangay: SELECT * FROM get_street_options('137404001');
-- Streets in specific subdivision: SELECT * FROM get_street_options('137404001', 'uuid-here');
```

### **3. Combined Address Search Function**
```sql
-- Function: Search addresses with autocomplete
CREATE OR REPLACE FUNCTION search_addresses(
    p_barangay_code VARCHAR(10),
    p_search_term TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
    street_id UUID,
    street_name VARCHAR(100),
    subdivision_id UUID,
    subdivision_name VARCHAR(100),
    subdivision_type VARCHAR(20),
    match_score INTEGER,
    dropdown_text TEXT,
    preview_address TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        st.id as street_id,
        st.name as street_name,
        st.subdivision_id,
        sub.name as subdivision_name,
        sub.type as subdivision_type,
        -- Simple scoring based on position of match
        CASE 
            WHEN p_search_term IS NULL THEN 100
            WHEN LOWER(st.name) LIKE LOWER(p_search_term || '%') THEN 90
            WHEN LOWER(st.name) LIKE LOWER('%' || p_search_term || '%') THEN 70
            WHEN LOWER(sub.name) LIKE LOWER('%' || p_search_term || '%') THEN 60
            ELSE 50
        END as match_score,
        -- Dropdown display text
        CASE 
            WHEN sub.name IS NOT NULL THEN
                CONCAT('🛣️ ', st.name, ' • 🏘️ ', sub.name)
            ELSE
                CONCAT('🛣️ ', st.name, ' • Direct Street')
        END as dropdown_text,
        -- Full address preview
        CONCAT(st.name, 
               CASE WHEN sub.name IS NOT NULL 
                    THEN ', ' || sub.name || ' (' || sub.type || ')' 
                    ELSE ' (Direct Street)' END) as preview_address
    FROM geo_street_names st
    LEFT JOIN geo_subdivisions sub ON st.subdivision_id = sub.id
    WHERE st.barangay_code = p_barangay_code 
    AND st.is_active = true
    AND (p_search_term IS NULL 
         OR LOWER(st.name) LIKE LOWER('%' || p_search_term || '%')
         OR LOWER(sub.name) LIKE LOWER('%' || p_search_term || '%'))
    ORDER BY match_score DESC, sub.name NULLS LAST, st.name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT * FROM search_addresses('137404001', 'rizal', 10);
```

---

## 💻 **Frontend Implementation Examples**

### **1. React/Next.js Implementation**

#### **Subdivision Dropdown Component:**
```jsx
// components/SubdivisionSelect.jsx
import { useState, useEffect } from 'react';

export default function SubdivisionSelect({ barangayCode, value, onChange }) {
  const [subdivisions, setSubdivisions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!barangayCode) return;
    
    setLoading(true);
    fetch(`/api/subdivisions?barangay=${barangayCode}`)
      .then(res => res.json())
      .then(data => {
        setSubdivisions(data);
        setLoading(false);
      });
  }, [barangayCode]);

  return (
    <div className="form-group">
      <label>Subdivision/Zone (Optional)</label>
      <select 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value || null)}
        disabled={loading || !barangayCode}
        className="form-control"
      >
        <option value="">-- No Subdivision (Direct Street) --</option>
        {subdivisions.map(sub => (
          <option key={sub.id} value={sub.id}>
            {sub.display_name} ({sub.resident_count} households)
          </option>
        ))}
      </select>
      {loading && <small>Loading subdivisions...</small>}
    </div>
  );
}
```

#### **Street Name Dropdown Component:**
```jsx
// components/StreetSelect.jsx
import { useState, useEffect } from 'react';

export default function StreetSelect({ 
  barangayCode, 
  subdivisionId, 
  value, 
  onChange 
}) {
  const [streets, setStreets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!barangayCode) return;
    
    setLoading(true);
    const url = `/api/streets?barangay=${barangayCode}${
      subdivisionId ? `&subdivision=${subdivisionId}` : ''
    }`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setStreets(data);
        setLoading(false);
      });
  }, [barangayCode, subdivisionId]);

  return (
    <div className="form-group">
      <label>Street Name <span className="required">*</span></label>
      <select 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || !barangayCode}
        required
        className="form-control"
      >
        <option value="">-- Select Street --</option>
        {streets.map(street => (
          <option key={street.id} value={street.id}>
            {street.display_name}
            {street.household_count > 0 && ` (${street.household_count} households)`}
          </option>
        ))}
      </select>
      {loading && <small>Loading streets...</small>}
      
      {value && streets.find(s => s.id === value) && (
        <small className="form-text text-muted">
          📍 Full Address: {streets.find(s => s.id === value)?.full_display}
        </small>
      )}
    </div>
  );
}
```

#### **Complete Household Creation Form:**
```jsx
// components/HouseholdCreateForm.jsx
import { useState } from 'react';
import SubdivisionSelect from './SubdivisionSelect';
import StreetSelect from './StreetSelect';

export default function HouseholdCreateForm() {
  const [formData, setFormData] = useState({
    barangay_code: '',
    subdivision_id: null,
    street_id: '',
    household_number: '',
    house_number: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('/api/households', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        // Auto-populate geographic codes from selected street/subdivision
      })
    });
    
    if (response.ok) {
      alert('Household created successfully!');
      // Reset form or redirect
    }
  };

  return (
    <form onSubmit={handleSubmit} className="household-form">
      <h2>Create New Household</h2>
      
      {/* Barangay Selection */}
      <div className="form-group">
        <label>Barangay <span className="required">*</span></label>
        <select 
          value={formData.barangay_code} 
          onChange={(e) => setFormData({
            ...formData, 
            barangay_code: e.target.value,
            subdivision_id: null, // Reset when barangay changes
            street_id: ''
          })}
          required
        >
          <option value="">-- Select Barangay --</option>
          {/* Populate from user's assigned barangays */}
        </select>
      </div>

      {/* Subdivision Selection (Optional) */}
      <SubdivisionSelect
        barangayCode={formData.barangay_code}
        value={formData.subdivision_id}
        onChange={(subdivisionId) => setFormData({
          ...formData, 
          subdivision_id: subdivisionId,
          street_id: '' // Reset street when subdivision changes
        })}
      />

      {/* Street Selection (Required) */}
      <StreetSelect
        barangayCode={formData.barangay_code}
        subdivisionId={formData.subdivision_id}
        value={formData.street_id}
        onChange={(streetId) => setFormData({
          ...formData, 
          street_id: streetId
        })}
      />

      {/* House Number */}
      <div className="form-group">
        <label>House Number</label>
        <input
          type="text"
          value={formData.house_number}
          onChange={(e) => setFormData({
            ...formData, 
            house_number: e.target.value
          })}
          placeholder="e.g. 123, Block 5 Lot 10"
          className="form-control"
        />
      </div>

      {/* Household Number */}
      <div className="form-group">
        <label>Household Number <span className="required">*</span></label>
        <input
          type="text"
          value={formData.household_number}
          onChange={(e) => setFormData({
            ...formData, 
            household_number: e.target.value
          })}
          placeholder="e.g. HH-001234"
          required
          className="form-control"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Create Household
      </button>
    </form>
  );
}
```

### **2. API Routes (Next.js)**

#### **Subdivisions API:**
```javascript
// pages/api/subdivisions.js
export default async function handler(req, res) {
  const { barangay } = req.query;
  
  if (!barangay) {
    return res.status(400).json({ error: 'Barangay code required' });
  }

  const { data, error } = await supabase.rpc('get_subdivision_options', {
    p_barangay_code: barangay
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
}
```

#### **Streets API:**
```javascript
// pages/api/streets.js
export default async function handler(req, res) {
  const { barangay, subdivision } = req.query;
  
  if (!barangay) {
    return res.status(400).json({ error: 'Barangay code required' });
  }

  const { data, error } = await supabase.rpc('get_street_options', {
    p_barangay_code: barangay,
    p_subdivision_id: subdivision || null
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
}
```

---

## 🎯 **User Experience Flow**

### **Step-by-Step Dropdown Behavior:**

```
1. 📍 User selects BARANGAY
   └── Triggers subdivision dropdown population

2. 🏘️ User selects SUBDIVISION (optional)
   ├── "Sunshine Village (Subdivision)"
   ├── "Zone 1 (Zone)" 
   ├── "Sitio Maligaya (Sitio)"
   └── "-- No Subdivision (Direct Street) --"

3. 🛣️ User selects STREET NAME
   ├── If subdivision selected: Shows only streets in that subdivision
   ├── If no subdivision: Shows all direct streets in barangay
   └── Display: "🛣️ Rizal Street • 🏘️ Sunshine Village"

4. ✅ Address Preview Shown
   └── "123 Rizal Street, Sunshine Village (Subdivision), Brgy. San Jose"
```

### **Smart Features:**
- **Cascading dropdowns** (subdivision filters streets)
- **Optional subdivisions** (can select direct streets)
- **Visual indicators** (icons, household counts)
- **Address preview** (shows full address before saving)
- **Search functionality** (type to filter options)

This implementation keeps your current two-table structure while providing excellent user experience for household creation! 🏠✨