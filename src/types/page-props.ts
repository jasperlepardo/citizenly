/**
 * Page Component Props
 * Consolidated prop interfaces from page components
 */

// =============================================================================
// DASHBOARD PAGE TYPES
// =============================================================================

/**
 * Dashboard page props
 */
export interface DashboardPageProps {
  searchParams?: {
    tab?: string;
    period?: string;
    view?: string;
  };
}

/**
 * Reports page props
 */
export interface ReportsPageProps {
  searchParams?: {
    report?: string;
    format?: string;
    period?: string;
    barangay?: string;
  };
}

// =============================================================================
// RESIDENT PAGE TYPES
// =============================================================================

/**
 * Resident detail page props
 * Consolidates from src/app/(dashboard)/residents/[id]/page.tsx
 */
export interface ResidentDetailPageProps {
  params: {
    id: string;
  };
  searchParams?: {
    tab?: string;
    edit?: string;
  };
}

/**
 * Resident list page props
 */
export interface ResidentListPageProps {
  searchParams?: {
    page?: string;
    limit?: string;
    search?: string;
    sex?: string;
    age_min?: string;
    age_max?: string;
    civil_status?: string;
    barangay?: string;
    sort?: string;
    order?: string;
  };
}

/**
 * Resident creation page props
 */
export interface ResidentCreatePageProps {
  searchParams?: {
    step?: string;
    household_id?: string;
    return_url?: string;
  };
}

// =============================================================================
// HOUSEHOLD PAGE TYPES
// =============================================================================

/**
 * Household detail page props
 * Consolidates from src/app/(dashboard)/households/[id]/page.tsx
 */
export interface HouseholdDetailPageProps {
  params: {
    id: string;
  };
  searchParams?: {
    tab?: string;
    edit?: string;
  };
}

/**
 * Household member interface for detail pages
 * Consolidates from household detail page components
 */
export interface HouseholdMember {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  sex: 'male' | 'female';
  birthdate: string;
  relationship_to_head?: string;
  is_head: boolean;
  education_attainment?: string;
  employment_status?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Household interface for detail pages
 * Consolidates from household detail page components
 */
export interface Household {
  id: string;
  code: string;
  street_name?: string;
  subdivision_name?: string;
  household_number?: string;
  barangay_code: string;
  head_resident_id?: string;
  household_type?: string;
  tenure_status?: string;
  monthly_income?: number;
  income_class?: string;
  no_of_families?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members?: HouseholdMember[];
  address_info?: {
    barangay_name: string;
    city_municipality_name: string;
    province_name?: string;
    region_name: string;
  };
}

// =============================================================================
// ADMIN PAGE TYPES
// =============================================================================

/**
 * Admin users page props
 * Consolidates from src/app/(dashboard)/admin/users/page.tsx
 */
export interface AdminUsersPageProps {
  searchParams?: {
    page?: string;
    limit?: string;
    search?: string;
    role?: string;
    status?: string;
    barangay?: string;
  };
}

/**
 * User request interface for admin pages
 * Consolidates from admin user management components
 */
export interface UserRequest {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  barangay_code: string;
  barangay_name?: string;
  role_name: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
}

/**
 * User card props for admin components
 * Consolidates from admin user management components
 */
export interface UserCardProps {
  user: UserRequest;
  onEdit?: (user: UserRequest) => void;
  onDelete?: (userId: string) => void;
  onActivate?: (userId: string) => void;
  onDeactivate?: (userId: string) => void;
  onResetPassword?: (userId: string) => void;
  loading?: boolean;
}

// =============================================================================
// REPORT PAGE TYPES
// =============================================================================

/**
 * Report page props with specific report type
 */
export interface ReportPageProps {
  params: {
    reportType: string;
  };
  searchParams?: {
    barangay?: string;
    year?: string;
    quarter?: string;
    format?: 'html' | 'pdf' | 'csv';
    print?: string;
  };
}

/**
 * Resident interface for reports
 * Consolidates from report components
 */
export interface ReportResident {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension_name?: string;
  sex: 'male' | 'female';
  birthdate: string;
  age?: number;
  civil_status?: string;
  education_attainment?: string;
  employment_status?: string;
  occupation?: string;
  household_code?: string;
  relationship_to_head?: string;
  is_voter?: boolean;
}

/**
 * Household interface for reports
 * Consolidates from report components
 */
export interface ReportHousehold {
  id: string;
  code: string;
  household_number?: string;
  street_name?: string;
  subdivision_name?: string;
  household_type?: string;
  tenure_status?: string;
  monthly_income?: number;
  income_class?: string;
  no_of_families?: number;
  members?: ReportResident[];
  head?: ReportResident;
}

/**
 * Address information for reports
 * Consolidates from report components
 */
export interface ReportAddressInfo {
  barangay_name: string;
  barangay_code: string;
  city_municipality_name: string;
  province_name?: string;
  region_name: string;
  full_address: string;
}

// =============================================================================
// SETTINGS AND PROFILE PAGE TYPES
// =============================================================================

/**
 * Settings page props
 */
export interface SettingsPageProps {
  searchParams?: {
    section?: string;
    tab?: string;
  };
}

/**
 * Profile page props
 */
export interface ProfilePageProps {
  searchParams?: {
    edit?: string;
    section?: string;
  };
}

// =============================================================================
// SEARCH AND FILTER TYPES
// =============================================================================

/**
 * Page search params for data tables
 */
export interface DataTableSearchParams {
  page?: string;
  limit?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, string>;
}

/**
 * Geographic filter search params
 */
export interface GeographicFilterParams {
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
}

/**
 * Date range filter params
 */
export interface DateRangeFilterParams {
  start_date?: string;
  end_date?: string;
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

// =============================================================================
// LAYOUT AND TEMPLATE TYPES
// =============================================================================

/**
 * Layout props with common page structure
 */
export interface LayoutProps {
  children: React.ReactNode;
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[]>;
}

/**
 * Error page props
 */
export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Loading page props
 */
export interface LoadingPageProps {
  message?: string;
  progress?: number;
}

/**
 * Not found page props
 */
export interface NotFoundPageProps {
  resource?: string;
  suggestedLinks?: Array<{
    label: string;
    href: string;
  }>;
}
