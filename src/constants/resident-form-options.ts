/**
 * Resident Form Options Constants
 * 
 * @fileoverview Static option arrays for resident form dropdowns and selections.
 * All options are synchronized with database enum values to ensure data integrity.
 * 
 * @version 1.0.0
 * @since 2025-01-01
 * 
 * @example
 * ```typescript
 * import { SEX_OPTIONS, CIVIL_STATUS_OPTIONS } from '@/constants/resident-form-options';
 * 
 * // Use in form components
 * <Select options={SEX_OPTIONS} />
 * <Select options={CIVIL_STATUS_OPTIONS} />
 * ```
 */

type OptionType = { value: string; label: string };

export const SEX_OPTIONS: OptionType[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const CIVIL_STATUS_OPTIONS: OptionType[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'others', label: 'Others' },
];

export const CITIZENSHIP_OPTIONS: OptionType[] = [
  { value: 'filipino', label: 'Filipino' },
  { value: 'dual_citizen', label: 'Dual Citizen' },
  { value: 'foreigner', label: 'Foreigner' },
];

export const EDUCATION_LEVEL_OPTIONS: OptionType[] = [
  { value: 'elementary', label: 'Elementary' },
  { value: 'high_school', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'post_graduate', label: 'Post Graduate' },
  { value: 'vocational', label: 'Vocational' },
];

export const EMPLOYMENT_STATUS_OPTIONS: OptionType[] = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'underemployed', label: 'Underemployed' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'unable_to_work', label: 'Unable to Work' },
  { value: 'looking_for_work', label: 'Looking for Work' },
  { value: 'not_in_labor_force', label: 'Not in Labor Force' },
];

export const BLOOD_TYPE_OPTIONS: OptionType[] = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

export const RELIGION_OPTIONS: OptionType[] = [
  { value: 'roman_catholic', label: 'Roman Catholic' },
  { value: 'islam', label: 'Islam' },
  { value: 'iglesia_ni_cristo', label: 'Iglesia ni Cristo' },
  { value: 'christian', label: 'Christian' },
  { value: 'aglipayan_church', label: 'Aglipayan Church' },
  { value: 'seventh_day_adventist', label: 'Seventh Day Adventist' },
  { value: 'bible_baptist_church', label: 'Bible Baptist Church' },
  { value: 'jehovahs_witnesses', label: "Jehovah's Witnesses" },
  {
    value: 'church_of_jesus_christ_latter_day_saints',
    label: 'Church of Jesus Christ of Latter-day Saints',
  },
  { value: 'united_church_of_christ_philippines', label: 'United Church of Christ Philippines' },
  { value: 'others', label: 'Others (specify)' },
];

export const ETHNICITY_OPTIONS: OptionType[] = [
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
  { value: 'tboli', label: "T'boli" },
  { value: 'teduray', label: 'Teduray' },
  { value: 'tumandok', label: 'Tumandok' },
  // Other groups
  { value: 'chinese', label: 'Chinese' },
  { value: 'others', label: 'Others' },
];