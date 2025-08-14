# Workforce Age Employment Logic

## 🎯 **Concept: Employment Status Based on Workforce Age**

The employment field is **only asked/filled for individuals who are considered of workforce age**. For younger individuals not yet in the workforce, this field remains NULL.

## 📊 **Age-Based Employment Field Logic**

| Age Range | Employment Field | Reasoning |
|-----------|------------------|-----------|
| 0-14 years | NULL (not asked) | Too young for workforce |
| 15+ years | Required/Optional | Workforce age - employment status relevant |

## 🔄 **Updated OSY Logic with NULL Employment Handling**

```sql
-- OSY calculation now handles NULL employment_status for younger youth
IF current_age BETWEEN 15 AND 24 THEN
    NEW.is_out_of_school_youth := (
        NEW.education_status IN ('not_studying', 'dropped_out') 
        AND NEW.education_level NOT IN ('college', 'post_graduate')
        AND (NEW.employment_status IS NULL OR NEW.employment_status NOT IN ('employed', 'self_employed'))
    );
```

### Key Changes:
- ✅ **NULL employment_status** = Considered for OSY (not employed)
- ✅ **Non-employed statuses** = Considered for OSY
- ❌ **Employed/Self-employed** = Not OSY

## 📋 **OSY Status Matrix with NULL Handling**

| Age | Education Level | Education Status | Employment Status | OSY Status | Reasoning |
|-----|----------------|------------------|-------------------|------------|-----------|
| 15-17 | `high_school` | `not_studying` | **NULL** | ✅ **TRUE** | Young, not studying, no employment data |
| 15-17 | `high_school` | `dropped_out` | **NULL** | ✅ **TRUE** | Young dropout, no employment data |
| 18-24 | `high_school` | `not_studying` | **NULL** | ✅ **TRUE** | Not studying, no employment data |
| 18-24 | `high_school` | `not_studying` | `unemployed` | ✅ **TRUE** | Not studying, unemployed |
| 18-24 | `high_school` | `not_studying` | `employed` | ❌ FALSE | Not studying but employed |
| 18-24 | `college` | any | any | ❌ FALSE | College graduate |

## 🎯 **Real-World Application**

### Form/UI Logic:
```javascript
// Pseudo-code for form logic
if (age >= 15) {
    showEmploymentField();
} else {
    employmentStatus = null; // Don't ask for employment
}
```

### Database Handling:
- **Ages 0-14**: `employment_status` = NULL (not applicable)
- **Ages 15+**: `employment_status` = actual status or NULL if not provided

## 📊 **Example Scenarios**

### ✅ **OSY Cases (TRUE):**

1. **15-year-old high school dropout, no employment data**
   ```sql
   age = 15, education_level = 'high_school', education_status = 'dropped_out', employment_status = NULL
   Result: OSY = TRUE (young dropout, employment not tracked yet)
   ```

2. **19-year-old not studying, unemployed**
   ```sql
   age = 19, education_level = 'high_school', education_status = 'not_studying', employment_status = 'unemployed'
   Result: OSY = TRUE (not studying, not employed)
   ```

3. **17-year-old not studying, no employment data**
   ```sql
   age = 17, education_level = 'high_school', education_status = 'not_studying', employment_status = NULL
   Result: OSY = TRUE (not studying, employment status not tracked)
   ```

### ❌ **NOT OSY Cases (FALSE):**

1. **16-year-old currently studying**
   ```sql
   age = 16, education_level = 'high_school', education_status = 'currently_studying', employment_status = NULL
   Result: OSY = FALSE (currently studying)
   ```

2. **22-year-old working**
   ```sql
   age = 22, education_level = 'high_school', education_status = 'not_studying', employment_status = 'employed'
   Result: OSY = FALSE (employed)
   ```

3. **20-year-old college graduate**
   ```sql
   age = 20, education_level = 'college', education_status = 'graduated', employment_status = 'unemployed'
   Result: OSY = FALSE (college graduate)
   ```

## 🎯 **Benefits of This Approach**

1. **Age-Appropriate Data Collection**: Only asks employment questions when relevant
2. **Flexible OSY Classification**: Handles both tracked and untracked employment statuses  
3. **Realistic for Younger Youth**: 15-17 year olds may not have employment status tracked yet
4. **Covers Transition Period**: Accounts for youth transitioning from school age to workforce age
5. **Data Quality**: Avoids forced/artificial employment statuses for younger individuals

## 🔍 **Implementation Notes**

- **Database**: `employment_status` is nullable, no default value
- **Forms**: Show employment field only for ages 15+ (configurable threshold)
- **Reports**: Handle NULL employment gracefully in OSY calculations
- **Validation**: No constraint requiring employment_status for any age
- **Updates**: OSY status recalculates properly whether employment_status is NULL or has a value

This approach provides **flexibility** while maintaining **accurate OSY classification** for youth regardless of whether employment data is available.