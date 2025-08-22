-- Migration: Replace all enums with selected set
-- This migration drops all existing enums and recreates only the specified ones

-- Drop all existing enums (in reverse dependency order)
DROP TYPE IF EXISTS income_class_enum CASCADE;
DROP TYPE IF EXISTS family_position_enum CASCADE;
DROP TYPE IF EXISTS household_unit_enum CASCADE;
DROP TYPE IF EXISTS tenure_status_enum CASCADE;
DROP TYPE IF EXISTS household_type_enum CASCADE;
DROP TYPE IF EXISTS birth_place_level_enum CASCADE;
DROP TYPE IF EXISTS ethnicity_enum CASCADE;
DROP TYPE IF EXISTS religion_enum CASCADE;
DROP TYPE IF EXISTS blood_type_enum CASCADE;
DROP TYPE IF EXISTS employment_status_enum CASCADE;
DROP TYPE IF EXISTS education_level_enum CASCADE;
DROP TYPE IF EXISTS citizenship_enum CASCADE;
DROP TYPE IF EXISTS civil_status_enum CASCADE;
DROP TYPE IF EXISTS sex_enum CASCADE;

-- Recreate only the selected enums
-- Personal Information
CREATE TYPE sex_enum AS ENUM ('male', 'female');
CREATE TYPE civil_status_enum AS ENUM ('single', 'married', 'divorced', 'separated', 'widowed', 'others');
CREATE TYPE citizenship_enum AS ENUM ('filipino', 'dual_citizen', 'foreigner');

-- Education
CREATE TYPE education_level_enum AS ENUM ('elementary', 'high_school', 'college', 'post_graduate', 'vocational');

-- Employment
CREATE TYPE employment_status_enum AS ENUM (
    'employed', 'unemployed', 'underemployed', 'self_employed', 'student', 
    'retired', 'homemaker', 'unable_to_work', 'looking_for_work', 'not_in_labor_force'
);

-- Health and Identity
CREATE TYPE blood_type_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

CREATE TYPE religion_enum AS ENUM (
    'roman_catholic', 'islam', 'iglesia_ni_cristo', 'christian', 'aglipayan_church',
    'seventh_day_adventist', 'bible_baptist_church', 'jehovahs_witnesses',
    'church_of_jesus_christ_latter_day_saints', 'united_church_of_christ_philippines', 'others'
);

CREATE TYPE ethnicity_enum AS ENUM (
    -- Major ethnic groups
    'tagalog', 'cebuano', 'ilocano', 'bisaya', 'hiligaynon', 'bikolano', 'waray', 'kapampangan', 'pangasinense',
    -- Muslim/Moro groups  
    'maranao', 'maguindanao', 'tausug', 'yakan', 'samal', 'badjao',
    -- Indigenous Peoples
    'aeta', 'agta', 'ati', 'batak', 'bukidnon', 'gaddang', 'higaonon', 'ibaloi', 'ifugao', 'igorot',
    'ilongot', 'isneg', 'ivatan', 'kalinga', 'kankanaey', 'mangyan', 'mansaka', 'palawan', 'subanen',
    'tboli', 'teduray', 'tumandok',
    -- Other groups
    'chinese', 'others'
);

-- Income Classifications (NEDA standards)
CREATE TYPE income_class_enum AS ENUM (
    'rich', 'high_income', 'upper_middle_income', 'middle_class', 
    'lower_middle_class', 'low_income', 'poor', 'not_determined'
);