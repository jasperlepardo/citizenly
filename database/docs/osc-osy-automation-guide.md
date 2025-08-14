# Out-of-School Children (OSC) and Out-of-School Youth (OSY) Automation

## ✅ Automated Classification System

The system automatically calculates and updates OSC/OSY status using database triggers based on the official definitions:

### 📚 Official Definitions

**Out-of-School Children (OSC)**: Individuals aged **6 to 14** who are not enrolled in formal education.

**Out-of-School Youth (OSY)**: Individuals aged **15 to 24** who are not attending school, haven't completed a college or post-secondary course, and are not employed.

## 🤖 How Automation Works

### Trigger Function: `update_resident_sectoral_status()`

This function runs automatically whenever a resident record is created or updated. It calculates the age from birthdate and applies the following logic:

### OSC Calculation (Ages 6-14)
```sql
-- Auto-calculate Out-of-School Children (OSC): Ages 6-14 not enrolled in formal education
IF current_age BETWEEN 6 AND 14 THEN
    NEW.is_out_of_school_children := (NEW.education_status IN ('not_studying', 'dropped_out'));
ELSE
    NEW.is_out_of_school_children := false;
END IF;
```

**Conditions:**
- ✅ Age between 6-14 years old
- ✅ `education_status` = 'not_studying' OR 'dropped_out'

### OSY Calculation (Ages 15-24)
```sql
-- Auto-calculate Out-of-School Youth (OSY): Ages 15-24 not attending school, 
-- haven't completed college/post-secondary course, and are not employed
IF current_age BETWEEN 15 AND 24 THEN
    NEW.is_out_of_school_youth := (
        NEW.education_status IN ('not_studying', 'dropped_out') 
        AND NEW.education_level NOT IN ('college', 'post_graduate') -- Haven't completed college/post-secondary
        AND NEW.employment_status NOT IN ('employed', 'self_employed') -- Not employed
    );
ELSE
    NEW.is_out_of_school_youth := false;
END IF;
```

**Conditions (ALL must be true):**
- ✅ Age between 15-24 years old
- ✅ `education_status` = 'not_studying' OR 'dropped_out' (not attending school)
- ✅ `education_level` ≠ 'college' AND ≠ 'post_graduate' (haven't completed college/post-secondary)
- ✅ `employment_status` ≠ 'employed' AND ≠ 'self_employed' (not employed)

## 📊 Required Fields for Automation

### Essential Fields:
1. **`birthdate`** - Used to calculate age
2. **`education_status`** - Currently studying or not
3. **`education_level`** - Highest education completed
4. **`employment_status`** - Current employment situation

### Education Status Values:
- `'currently_studying'` - Currently enrolled
- `'not_studying'` - Not currently enrolled
- `'graduated'` - Completed education
- `'dropped_out'` - Left school without completing

### Education Level Values:
- `'elementary'` - Elementary level
- `'high_school'` - High school level
- `'college'` - College/university level
- `'post_graduate'` - Post-graduate level
- `'vocational'` - Vocational/technical education

### Employment Status Values:
- `'employed'` - Currently employed
- `'self_employed'` - Self-employed/business owner
- `'unemployed'` - Looking for work
- `'underemployed'` - Working but seeking better employment
- `'not_in_labor_force'` - Not seeking employment

## 🎯 Example Scenarios

### Scenario 1: 8-year-old not in school
```sql
birthdate = '2016-01-01' -- Age 8
education_status = 'not_studying'
```
**Result**: `is_out_of_school_children = TRUE`

### Scenario 2: 12-year-old currently studying
```sql
birthdate = '2012-06-15' -- Age 12
education_status = 'currently_studying'
```
**Result**: `is_out_of_school_children = FALSE`

### Scenario 3: 18-year-old, high school dropout, unemployed
```sql
birthdate = '2006-03-20' -- Age 18
education_status = 'dropped_out'
education_level = 'high_school'
employment_status = 'unemployed'
```
**Result**: `is_out_of_school_youth = TRUE`

### Scenario 4: 20-year-old, college graduate, employed
```sql
birthdate = '2004-05-10' -- Age 20
education_status = 'graduated'
education_level = 'college'
employment_status = 'employed'
```
**Result**: `is_out_of_school_youth = FALSE` (completed college)

### Scenario 5: 22-year-old, high school level, but employed
```sql
birthdate = '2002-09-25' -- Age 22
education_status = 'not_studying'
education_level = 'high_school'
employment_status = 'employed'
```
**Result**: `is_out_of_school_youth = FALSE` (employed)

## 🔄 When Automation Runs

The automation triggers on:
- ✅ **INSERT** - New resident registration
- ✅ **UPDATE** - Any change to resident data
- ✅ **Birthdate changes** - Age recalculation
- ✅ **Education status changes** - School enrollment updates
- ✅ **Education level changes** - Completion updates
- ✅ **Employment status changes** - Job situation updates

## 📋 Reporting Queries

### Get all Out-of-School Children in a barangay:
```sql
SELECT first_name, last_name, age, education_status
FROM residents 
WHERE barangay_code = 'YOUR_BARANGAY_CODE' 
AND is_out_of_school_children = true;
```

### Get all Out-of-School Youth in a barangay:
```sql
SELECT first_name, last_name, age, education_level, employment_status
FROM residents 
WHERE barangay_code = 'YOUR_BARANGAY_CODE' 
AND is_out_of_school_youth = true;
```

### OSC/OSY Summary by age:
```sql
SELECT 
    age,
    COUNT(*) FILTER (WHERE is_out_of_school_children) as osc_count,
    COUNT(*) FILTER (WHERE is_out_of_school_youth) as osy_count
FROM residents 
WHERE barangay_code = 'YOUR_BARANGAY_CODE'
GROUP BY age
ORDER BY age;
```

## 🎯 Benefits of Automation

1. **Real-time Updates** - Status updates immediately when data changes
2. **Consistent Logic** - Same criteria applied to all residents
3. **Reduced Errors** - No manual calculation mistakes
4. **Compliance** - Follows official OSC/OSY definitions exactly
5. **Reporting Ready** - Instant statistics for government reporting
6. **Historical Tracking** - Automatic updates as residents age or change status

## 🛠️ Maintenance Notes

- The automation is built into the database schema
- No manual intervention required
- Status updates automatically with any data change
- Age calculations are based on current date vs birthdate
- All logic is transparent and auditable

The system ensures accurate, up-to-date OSC and OSY classifications for all residents without manual effort!