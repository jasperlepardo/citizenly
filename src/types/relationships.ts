/**
 * Relationship and Household Member Types
 * Interfaces for managing family relationships and household memberships
 */

// =============================================================================
// HOUSEHOLD MEMBERS TABLE
// =============================================================================

/**
 * Household member interface matching household_members table exactly (7 fields)
 */
export interface HouseholdMember {
  id: string; // UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  household_code: string; // VARCHAR(50) NOT NULL REFERENCES households(code)
  resident_id: string; // UUID NOT NULL REFERENCES residents(id)
  family_position: 'father' | 'mother' | 'son' | 'daughter' | 'grandmother' | 'grandfather' | 'father_in_law' | 'mother_in_law' | 'brother_in_law' | 'sister_in_law' | 'spouse' | 'sibling' | 'guardian' | 'ward' | 'other'; // family_position_enum NOT NULL DEFAULT 'other'
  is_active?: boolean | null; // BOOLEAN DEFAULT true (nullable in database)
  created_at?: string | null; // TIMESTAMPTZ DEFAULT NOW() (nullable in database)
  updated_at?: string | null; // TIMESTAMPTZ DEFAULT NOW() (nullable in database)
}

// =============================================================================
// RESIDENT RELATIONSHIPS TABLE
// =============================================================================

/**
 * Resident relationship interface matching resident_relationships table exactly (8 fields)
 */
export interface ResidentRelationship {
  id: string; // UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  resident_a_id: string; // UUID NOT NULL REFERENCES residents(id)
  resident_b_id: string; // UUID NOT NULL REFERENCES residents(id)
  relationship_type: 'Spouse' | 'Parent' | 'Child' | 'Sibling' | 'Guardian' | 'Ward' | 'Other'; // VARCHAR(50) NOT NULL with CHECK constraint
  relationship_description?: string | null; // TEXT
  is_active?: boolean | null; // BOOLEAN DEFAULT true (nullable in database)
  created_at?: string | null; // TIMESTAMPTZ DEFAULT NOW() (nullable in database)
  updated_at?: string | null; // TIMESTAMPTZ DEFAULT NOW() (nullable in database)
}

// =============================================================================
// EXTENDED INTERFACES WITH JOINED DATA
// =============================================================================

/**
 * Household member with resident details
 */
export interface HouseholdMemberWithResident extends HouseholdMember {
  resident: {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    extension_name?: string | null;
    sex: 'male' | 'female';
    birthdate: string;
    civil_status?: string | null;
    mobile_number?: string | null;
    email?: string | null;
  };
}

/**
 * Resident relationship with participant details
 */
export interface ResidentRelationshipWithParticipants extends ResidentRelationship {
  resident_a: {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    extension_name?: string | null;
  };
  resident_b: {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    extension_name?: string | null;
  };
}

// =============================================================================
// FORM AND API INTERFACES
// =============================================================================

/**
 * Form data for adding household member (matches database structure)
 */
export interface HouseholdMemberFormData {
  household_code: string; // Maps to household_code
  resident_id: string; // Maps to resident_id
  family_position: 'father' | 'mother' | 'son' | 'daughter' | 'grandmother' | 'grandfather' | 'father_in_law' | 'mother_in_law' | 'brother_in_law' | 'sister_in_law' | 'spouse' | 'sibling' | 'guardian' | 'ward' | 'other'; // Maps to family_position (required)
}

/**
 * Form data for creating resident relationship (matches database structure)
 */
export interface ResidentRelationshipFormData {
  resident_a_id: string; // Maps to resident_a_id (UUID)
  resident_b_id: string; // Maps to resident_b_id (UUID)
  relationship_type: 'Spouse' | 'Parent' | 'Child' | 'Sibling' | 'Guardian' | 'Ward' | 'Other'; // Maps to relationship_type (required)
  relationship_description?: string; // Maps to relationship_description (optional)
}