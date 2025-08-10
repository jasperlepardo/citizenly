# OSC/OSY Status Mapping - Complete Matrix

## 🎯 Age-Based Classification Overview

| Age Range | Classification | Auto-Calculated Fields |
|-----------|---------------|------------------------|
| 0-5 years | Pre-school age | Neither OSC nor OSY |
| 6-14 years | School age (OSC potential) | `is_out_of_school_children` |
| 15-24 years | Youth age (OSY potential) | `is_out_of_school_youth` |
| 25+ years | Adult | Neither OSC nor OSY |

## 📊 Complete Status Matrix

### Ages 6-14: Out-of-School Children (OSC) Logic

| Age | Education Level | Education Status | Employment Status | OSC Status | Reasoning |
|-----|----------------|------------------|-------------------|------------|-----------|
| 6-14 | any | `currently_studying` | any | ❌ FALSE | Currently enrolled in school |
| 6-14 | any | `graduated` | any | ❌ FALSE | Completed their education level |
| 6-14 | any | `not_studying` | any | ✅ TRUE | Not enrolled in formal education |
| 6-14 | any | `dropped_out` | any | ✅ TRUE | Left school without completing |

**OSC Summary**: Ages 6-14 are OSC if `education_status` ∈ {'not_studying', 'dropped_out'}

---

### Ages 15-24: Out-of-School Youth (OSY) Logic

| Age | Education Level | Education Status | Employment Status | OSY Status | Reasoning |
|-----|----------------|------------------|-------------------|------------|-----------|
| 15-24 | `elementary` | `currently_studying` | any | ❌ FALSE | Currently attending school |
| 15-24 | `elementary` | `graduated` | `employed` | ❌ FALSE | Employed (not unemployed) |
| 15-24 | `elementary` | `graduated` | `self_employed` | ❌ FALSE | Self-employed (not unemployed) |
| 15-24 | `elementary` | `graduated` | `unemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `elementary` | `graduated` | `underemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `elementary` | `graduated` | `not_in_labor_force` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `elementary` | `not_studying` | `employed` | ❌ FALSE | Employed (not unemployed) |
| 15-24 | `elementary` | `not_studying` | `self_employed` | ❌ FALSE | Self-employed (not unemployed) |
| 15-24 | `elementary` | `not_studying` | `unemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `elementary` | `not_studying` | `underemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `elementary` | `not_studying` | `not_in_labor_force` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `elementary` | `dropped_out` | `employed` | ❌ FALSE | Employed (not unemployed) |
| 15-24 | `elementary` | `dropped_out` | `self_employed` | ❌ FALSE | Self-employed (not unemployed) |
| 15-24 | `elementary` | `dropped_out` | `unemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `elementary` | `dropped_out` | `underemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `elementary` | `dropped_out` | `not_in_labor_force` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |

| Age | Education Level | Education Status | Employment Status | OSY Status | Reasoning |
|-----|----------------|------------------|-------------------|------------|-----------|
| 15-24 | `high_school` | `currently_studying` | any | ❌ FALSE | Currently attending school |
| 15-24 | `high_school` | `graduated` | `employed` | ❌ FALSE | Employed (not unemployed) |
| 15-24 | `high_school` | `graduated` | `self_employed` | ❌ FALSE | Self-employed (not unemployed) |
| 15-24 | `high_school` | `graduated` | `unemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `high_school` | `graduated` | `underemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `high_school` | `graduated` | `not_in_labor_force` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `high_school` | `not_studying` | `employed` | ❌ FALSE | Employed (not unemployed) |
| 15-24 | `high_school` | `not_studying` | `self_employed` | ❌ FALSE | Self-employed (not unemployed) |
| 15-24 | `high_school` | `not_studying` | `unemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `high_school` | `not_studying` | `underemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `high_school` | `not_studying` | `not_in_labor_force` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `high_school` | `dropped_out` | `employed` | ❌ FALSE | Employed (not unemployed) |
| 15-24 | `high_school` | `dropped_out` | `self_employed` | ❌ FALSE | Self-employed (not unemployed) |
| 15-24 | `high_school` | `dropped_out` | `unemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `high_school` | `dropped_out` | `underemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `high_school` | `dropped_out` | `not_in_labor_force` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |

| Age | Education Level | Education Status | Employment Status | OSY Status | Reasoning |
|-----|----------------|------------------|-------------------|------------|-----------|
| 15-24 | `vocational` | `currently_studying` | any | ❌ FALSE | Currently attending school |
| 15-24 | `vocational` | `graduated` | `employed` | ❌ FALSE | Employed (not unemployed) |
| 15-24 | `vocational` | `graduated` | `self_employed` | ❌ FALSE | Self-employed (not unemployed) |
| 15-24 | `vocational` | `graduated` | `unemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `vocational` | `graduated` | `underemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `vocational` | `graduated` | `not_in_labor_force` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `vocational` | `not_studying` | `employed` | ❌ FALSE | Employed (not unemployed) |
| 15-24 | `vocational` | `not_studying` | `self_employed` | ❌ FALSE | Self-employed (not unemployed) |
| 15-24 | `vocational` | `not_studying` | `unemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `vocational` | `not_studying` | `underemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `vocational` | `not_studying` | `not_in_labor_force` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `vocational` | `dropped_out` | `employed` | ❌ FALSE | Employed (not unemployed) |
| 15-24 | `vocational` | `dropped_out` | `self_employed` | ❌ FALSE | Self-employed (not unemployed) |
| 15-24 | `vocational` | `dropped_out` | `unemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `vocational` | `dropped_out` | `underemployed` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |
| 15-24 | `vocational` | `dropped_out` | `not_in_labor_force` | ✅ TRUE | ✓ Not in school, ✓ No college, ✓ Unemployed |

| Age | Education Level | Education Status | Employment Status | OSY Status | Reasoning |
|-----|----------------|------------------|-------------------|------------|-----------|
| 15-24 | `college` | any | any | ❌ FALSE | **Completed college - NOT OSY** |
| 15-24 | `post_graduate` | any | any | ❌ FALSE | **Completed post-graduate - NOT OSY** |

---

## 🔍 Key Decision Points

### OSC (Ages 6-14) - Simple Logic:
```
IF age BETWEEN 6 AND 14 THEN
    OSC = education_status IN ('not_studying', 'dropped_out')
ELSE
    OSC = FALSE
```

### OSY (Ages 15-24) - Complex Logic:
```
IF age BETWEEN 15 AND 24 THEN
    OSY = (education_status IN ('not_studying', 'dropped_out')) 
          AND (education_level NOT IN ('college', 'post_graduate'))
          AND (employment_status NOT IN ('employed', 'self_employed'))
ELSE
    OSY = FALSE
```

## 📈 Summary Statistics

### OSC Scenarios (Ages 6-14):
- ✅ **OSC = TRUE**: 2 education statuses → 2 scenarios result in OSC
- ❌ **OSC = FALSE**: 2 education statuses → 2 scenarios don't result in OSC

### OSY Scenarios (Ages 15-24):
- ✅ **OSY = TRUE**: 36 combinations result in OSY status
- ❌ **OSY = FALSE**: 24 combinations don't result in OSY status

**Total possible combinations**: 60 for ages 15-24

## 🎯 Real-World Examples

### Common OSC Cases:
1. **7-year-old, not studying** → OSC ✅
2. **10-year-old, dropped out** → OSC ✅
3. **8-year-old, currently studying** → NOT OSC ❌

### Common OSY Cases:
1. **18-year-old, high school graduate, unemployed** → OSY ✅
2. **20-year-old, vocational graduate, looking for work** → OSY ✅
3. **22-year-old, high school dropout, employed** → NOT OSY ❌
4. **19-year-old, college graduate** → NOT OSY ❌

## 🚨 Important Notes

1. **College/Post-Graduate Completion** = Automatic exclusion from OSY regardless of employment
2. **Employment Status** = Key factor for OSY determination (employed/self-employed excludes from OSY)
3. **Age Boundaries** = Strict enforcement (exactly 6-14 for OSC, 15-24 for OSY)
4. **Real-time Updates** = Status recalculates whenever any relevant field changes

This comprehensive mapping ensures accurate OSC/OSY classification for all possible resident scenarios!