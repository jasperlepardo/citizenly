# Revised OSY Mapping - Non-Workforce Only

## 🎯 **Updated OSY Definition**

**Out-of-School Youth (OSY)**: Ages 15-24 who are not attending school, haven't completed college/post-secondary course, and **are not considered part of the workforce**.

## 📊 **Employment Status Categories**

### Workforce Categories (NOT OSY):
- `'employed'` - Currently working
- `'unemployed'` - Looking for work (part of labor force)
- `'underemployed'` - Working but seeking better employment
- `'self_employed'` - Business owner/freelancer
- `'looking_for_work'` - Actively job hunting
- `'retired'` - Former workforce
- `'homemaker'` - Managing household (considered productive work)
- `'unable_to_work'` - Cannot participate in workforce

### Non-Workforce Categories (Potential OSY):
- `'student'` - Should be studying but not currently enrolled
- `'not_in_labor_force'` - Not seeking employment, not working

## 🔄 **Revised OSY Logic**

```sql
IF current_age BETWEEN 15 AND 24 THEN
    NEW.is_out_of_school_youth := (
        NEW.education_status IN ('not_studying', 'dropped_out')     -- Not in school
        AND NEW.education_level NOT IN ('college', 'post_graduate') -- No college degree  
        AND NEW.employment_status IN ('student', 'not_in_labor_force') -- Not workforce
    );
```

## 📋 **Complete OSY Matrix (Revised)**

| Age | Education Level | Education Status | Employment Status | OSY Status | Reasoning |
|-----|----------------|------------------|-------------------|------------|-----------|
| 15-24 | `elementary` | `not_studying` | `student` | ✅ **TRUE** | Not in school, no college, not workforce |
| 15-24 | `elementary` | `not_studying` | `not_in_labor_force` | ✅ **TRUE** | Not in school, no college, not workforce |
| 15-24 | `elementary` | `dropped_out` | `student` | ✅ **TRUE** | Left school, no college, not workforce |
| 15-24 | `elementary` | `dropped_out` | `not_in_labor_force` | ✅ **TRUE** | Left school, no college, not workforce |
| 15-24 | `high_school` | `not_studying` | `student` | ✅ **TRUE** | Not in school, no college, not workforce |
| 15-24 | `high_school` | `not_studying` | `not_in_labor_force` | ✅ **TRUE** | Not in school, no college, not workforce |
| 15-24 | `high_school` | `dropped_out` | `student` | ✅ **TRUE** | Left school, no college, not workforce |
| 15-24 | `high_school` | `dropped_out` | `not_in_labor_force` | ✅ **TRUE** | Left school, no college, not workforce |
| 15-24 | `vocational` | `not_studying` | `student` | ✅ **TRUE** | Not in school, no college, not workforce |
| 15-24 | `vocational` | `not_studying` | `not_in_labor_force` | ✅ **TRUE** | Not in school, no college, not workforce |
| 15-24 | `vocational` | `dropped_out` | `student` | ✅ **TRUE** | Left school, no college, not workforce |
| 15-24 | `vocational` | `dropped_out` | `not_in_labor_force` | ✅ **TRUE** | Left school, no college, not workforce |

### All Other Combinations = NOT OSY ❌

**Automatic Exclusions:**
- Any `college` or `post_graduate` education level
- Any `currently_studying` or `graduated` education status  
- Any workforce employment status: `employed`, `unemployed`, `underemployed`, `self_employed`, `looking_for_work`, `retired`, `homemaker`, `unable_to_work`

## 🎯 **Real-World Examples**

### ✅ **OSY Examples (TRUE):**
1. **18-year-old high school dropout, not in labor force**
   - Age: 18, Education: `high_school`, Status: `dropped_out`, Employment: `not_in_labor_force`
   - **Result: OSY** (not seeking work, not studying)

2. **20-year-old, identifies as student but not enrolled**
   - Age: 20, Education: `high_school`, Status: `not_studying`, Employment: `student`
   - **Result: OSY** (should be studying but isn't)

3. **22-year-old vocational dropout, not participating in labor force**
   - Age: 22, Education: `vocational`, Status: `dropped_out`, Employment: `not_in_labor_force`
   - **Result: OSY** (not working, not studying)

### ❌ **NOT OSY Examples (FALSE):**
1. **19-year-old high school graduate, unemployed but looking for work**
   - Age: 19, Education: `high_school`, Status: `graduated`, Employment: `unemployed`
   - **Result: NOT OSY** (part of workforce - actively seeking employment)

2. **21-year-old high school dropout, working**
   - Age: 21, Education: `high_school`, Status: `dropped_out`, Employment: `employed`
   - **Result: NOT OSY** (part of workforce - employed)

3. **17-year-old, currently in vocational school**
   - Age: 17, Education: `vocational`, Status: `currently_studying`, Employment: `student`
   - **Result: NOT OSY** (currently enrolled in education)

4. **23-year-old college graduate, unemployed**
   - Age: 23, Education: `college`, Status: `graduated`, Employment: `unemployed`
   - **Result: NOT OSY** (completed college education)

5. **20-year-old homemaker**
   - Age: 20, Education: `high_school`, Status: `not_studying`, Employment: `homemaker`
   - **Result: NOT OSY** (homemaker considered productive workforce)

## 📊 **Summary**

**OSY = TRUE only when ALL conditions met:**
1. ✅ Age 15-24
2. ✅ Education status: `not_studying` OR `dropped_out`
3. ✅ Education level: NOT `college` or `post_graduate`
4. ✅ Employment status: `student` OR `not_in_labor_force` ONLY

**Total OSY scenarios**: 12 specific combinations
**Total non-OSY scenarios**: All other combinations

This revised logic focuses on youth who are truly outside both the education system and the workforce, representing those who need targeted intervention programs.