// Database enum constants - sourced from database schema
// These should ideally be generated from the database or kept in sync with schema changes

export const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const;

export const CIVIL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'others', label: 'Others' },
] as const;

export const CITIZENSHIP_OPTIONS = [
  { value: 'filipino', label: 'Filipino' },
  { value: 'dual_citizen', label: 'Dual Citizen' },
  { value: 'foreign_national', label: 'Foreign National' },
] as const;

export const EDUCATION_LEVEL_OPTIONS = [
  { value: 'elementary', label: 'Elementary' },
  { value: 'high_school', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'post_graduate', label: 'Post-Graduate' },
  { value: 'vocational', label: 'Vocational' },
] as const;

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'underemployed', label: 'Underemployed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'unable_to_work', label: 'Unable to Work' },
  { value: 'looking_for_work', label: 'Looking for Work' },
  { value: 'not_in_labor_force', label: 'Not in Labor Force' },
] as const;

export const BLOOD_TYPE_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  { value: 'unknown', label: 'Unknown' },
] as const;

export const RELIGION_OPTIONS = [
  { value: 'roman_catholic', label: 'Roman Catholic' },
  { value: 'islam', label: 'Islam' },
  { value: 'iglesia_ni_cristo', label: 'Iglesia ni Cristo' },
  { value: 'christian', label: 'Christian' },
  { value: 'aglipayan_church', label: 'Aglipayan Church' },
  { value: 'seventh_day_adventist', label: 'Seventh Day Adventist' },
  { value: 'bible_baptist_church', label: 'Bible Baptist Church' },
  { value: 'jehovahs_witnesses', label: 'Jehovah\'s Witnesses' },
  { value: 'church_of_jesus_christ_latter_day_saints', label: 'Church of Jesus Christ of Latter-day Saints' },
  { value: 'united_church_of_christ_philippines', label: 'United Church of Christ Philippines' },
  { value: 'protestant', label: 'Protestant' },
  { value: 'buddhism', label: 'Buddhism' },
  { value: 'baptist', label: 'Baptist' },
  { value: 'methodist', label: 'Methodist' },
  { value: 'pentecostal', label: 'Pentecostal' },
  { value: 'evangelical', label: 'Evangelical' },
  { value: 'mormon', label: 'Mormon' },
  { value: 'orthodox', label: 'Orthodox' },
  { value: 'hinduism', label: 'Hinduism' },
  { value: 'judaism', label: 'Judaism' },
  { value: 'indigenous_beliefs', label: 'Indigenous Beliefs' },
  { value: 'atheist', label: 'Atheist' },
  { value: 'agnostic', label: 'Agnostic' },
  { value: 'no_religion', label: 'No Religion' },
  { value: 'others', label: 'Others' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const ETHNICITY_OPTIONS = [
  // Major ethnic groups
  { value: 'tagalog', label: 'Tagalog' },
  { value: 'cebuano', label: 'Cebuano' },
  { value: 'ilocano', label: 'Ilocano' },
  { value: 'bisaya', label: 'Bisaya' },
  { value: 'hiligaynon', label: 'Hiligaynon' },
  { value: 'bikolano', label: 'Bikolano' },
  { value: 'waray', label: 'Waray' },
  { value: 'kapampangan', label: 'Kapampangan' },
  { value: 'pangasinense', label: 'Pangasinense' },
  
  // Muslim/Moro groups
  { value: 'maranao', label: 'Maranao' },
  { value: 'maguindanao', label: 'Maguindanao' },
  { value: 'tausug', label: 'Tausug' },
  { value: 'yakan', label: 'Yakan' },
  { value: 'samal', label: 'Samal' },
  { value: 'badjao', label: 'Badjao' },
  
  // Indigenous Peoples
  { value: 'aeta', label: 'Aeta' },
  { value: 'agta', label: 'Agta' },
  { value: 'ati', label: 'Ati' },
  { value: 'batak', label: 'Batak' },
  { value: 'bukidnon', label: 'Bukidnon' },
  { value: 'gaddang', label: 'Gaddang' },
  { value: 'higaonon', label: 'Higaonon' },
  { value: 'ibaloi', label: 'Ibaloi' },
  { value: 'ifugao', label: 'Ifugao' },
  { value: 'igorot', label: 'Igorot' },
  { value: 'ilongot', label: 'Ilongot' },
  { value: 'isneg', label: 'Isneg' },
  { value: 'ivatan', label: 'Ivatan' },
  { value: 'kalinga', label: 'Kalinga' },
  { value: 'kankanaey', label: 'Kankanaey' },
  { value: 'mangyan', label: 'Mangyan' },
  { value: 'mansaka', label: 'Mansaka' },
  { value: 'palawan', label: 'Palawan' },
  { value: 'subanen', label: 'Subanen' },
  { value: 'tboli', label: 'T\'boli' },
  { value: 'teduray', label: 'Teduray' },
  { value: 'tumandok', label: 'Tumandok' },
  
  // Other groups
  { value: 'chinese', label: 'Chinese' },
  { value: 'other', label: 'Other' },
  { value: 'not_reported', label: 'Prefer not to say' },
] as const;

// Type helpers to extract the value types
export type SexValue = typeof SEX_OPTIONS[number]['value'];
export type CivilStatusValue = typeof CIVIL_STATUS_OPTIONS[number]['value'];
export type CitizenshipValue = typeof CITIZENSHIP_OPTIONS[number]['value'];
export type EducationLevelValue = typeof EDUCATION_LEVEL_OPTIONS[number]['value'];
export type EmploymentStatusValue = typeof EMPLOYMENT_STATUS_OPTIONS[number]['value'];
export type BloodTypeValue = typeof BLOOD_TYPE_OPTIONS[number]['value'];
export type ReligionValue = typeof RELIGION_OPTIONS[number]['value'];
export type EthnicityValue = typeof ETHNICITY_OPTIONS[number]['value'];