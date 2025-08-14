# Household Search for Resident Creation

## ✅ **Complete Implementation**

The household search functionality allows users to search and select households when creating residents, with full address display and automatic field population.

## 🔍 **Key Features:**

### **1. Household Search View**
- **Complete address display** with all geographic fields
- **Formatted full address** for easy reading
- **Geographic codes** for auto-population
- **RLS compliance** with security barriers

### **2. Search Function**
- **Flexible search** by household number, house number, street, subdivision, or full address
- **User barangay filtering** for RLS compliance
- **Smart ordering** prioritizing exact matches
- **Configurable limits** (default 50 results)

### **3. Auto-Population Trigger**
- **Priority 1**: Auto-populate from selected household
- **Priority 2**: Fallback to user's assigned barangay
- **Geographic hierarchy** properly handled
- **Independent cities** support

## 📊 **Database Objects:**

### **View: `household_search`**
```sql
-- Returns complete household information with formatted addresses
SELECT 
    h.id, h.code, h.household_number, h.house_number,
    s.name as street_name, sub.name as subdivision_name,
    b.name as barangay_name, c.name as city_municipality_name,
    p.name as province_name, r.name as region_name,
    full_address, -- Formatted complete address
    geographic_codes... -- For auto-population
FROM households h -- With all geographic joins
```

### **Function: `search_households()`**
```sql
SELECT * FROM search_households(
    search_term TEXT DEFAULT NULL,      -- Optional search filter
    user_barangay_code TEXT DEFAULT NULL,  -- RLS filtering
    limit_results INTEGER DEFAULT 50    -- Result limit
);
```

### **Function: `get_household_for_resident()`**
```sql
SELECT * FROM get_household_for_resident(household_id UUID);
-- Returns household details for resident auto-population
```

### **Updated Trigger: `auto_populate_resident_address()`**
- **Enhanced** to handle household_id priority
- **Fallback** to user barangay if no household
- **Proper handling** of independent cities

## 🎯 **Real Usage Examples:**

### **1. Search by Household Number:**
```sql
SELECT * FROM search_households('HH-001');
-- Returns households matching "HH-001"
```

### **2. Search by Street Name:**
```sql
SELECT * FROM search_households('Rizal');
-- Returns households on streets containing "Rizal"
```

### **3. Search with RLS Filtering:**
```sql
SELECT * FROM search_households('', '137404001');
-- Returns all households in specific barangay
```

### **4. Get Specific Household:**
```sql
SELECT * FROM get_household_for_resident('uuid-here');
-- Returns household details for auto-population
```

## 📋 **UI Implementation Flow:**

### **Frontend Process:**
```javascript
1. User types in search box
2. Call: search_households(searchTerm, userBarangayCode)
3. Display results with full_address
4. User selects household
5. Set resident.household_id = selected_household.id
6. Auto-population happens via trigger
7. Geographic fields automatically filled
```

### **Result Display Format:**
```
🏠 HH-001234
📍 123 Rizal Street, Sunshine Subdivision, Barangay San Jose, 
    Makati City, Metro Manila, NCR
👥 5 members • Created: Jan 15, 2025
```

## 🎯 **Auto-Population Logic:**

### **When Creating Resident:**

**Step 1 - User Action:**
```sql
INSERT INTO residents (
    first_name, last_name, household_id, ...
) VALUES (
    'Juan', 'Dela Cruz', 'uuid-of-selected-household', ...
);
```

**Step 2 - Trigger Auto-Population:**
```sql
-- Trigger automatically fills:
barangay_code = '137404001'        -- From household
city_municipality_code = '137404'  -- From household  
province_code = '1374'             -- From household
region_code = '13'                 -- From household
household_code = 'HH-001234'       -- From household
```

**Step 3 - User sees:**
```
✅ Resident created successfully!
📍 Auto-populated: Barangay San Jose, Makati City, NCR
🏠 Assigned to: Household HH-001234
```

## ✅ **Benefits:**

### **For Users:**
- **Easy household selection** with complete address visibility
- **No manual entry** of geographic fields
- **Error prevention** through auto-population
- **Fast search** with flexible criteria

### **For Data Quality:**
- **Consistent addressing** from household source
- **Geographic accuracy** maintained
- **Referential integrity** ensured
- **RLS compliance** built-in

### **For Performance:**
- **Indexed searches** for fast results
- **Limited results** prevent overload
- **Efficient queries** with proper joins
- **Security barriers** for RLS

## 🔧 **Technical Notes:**

### **RLS Security:**
- View uses `security_barrier = true`
- User barangay filtering enforced
- Auth context properly handled

### **Performance Optimizations:**
- Smart ordering prioritizes exact matches
- Configurable result limits
- Proper indexing on search fields
- Efficient geographic joins

### **Independent City Handling:**
- Province code properly NULL for independent cities
- Region code correctly resolved
- Geographic hierarchy maintained

The household search functionality provides a **complete solution** for resident creation with **full address visibility**, **automatic field population**, and **proper security compliance**!