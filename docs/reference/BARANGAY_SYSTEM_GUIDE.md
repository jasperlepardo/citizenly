# Barangay System Guide

> **Understanding the Philippine administrative system for the Citizenly project**
> 
> This document explains the Philippine barangay system, its structure, and how it's implemented in the Citizenly platform.

## 📖 Table of Contents

1. [🏛️ Philippine Administrative Structure](#️-philippine-administrative-structure)
2. [🏘️ What is a Barangay?](#️-what-is-a-barangay)
3. [📊 Geographic Hierarchy](#-geographic-hierarchy)
4. [🗂️ PSGC System](#️-psgc-system)
5. [👥 Barangay Demographics](#-barangay-demographics)
6. [🏢 Barangay Administration](#-barangay-administration)
7. [📋 Data Management](#-data-management)
8. [🔗 System Implementation](#-system-implementation)

---

## 🏛️ Philippine Administrative Structure

### **Administrative Levels**
```
Philippines (Country)
    ├── Regions (17 Administrative Regions)
    │   ├── Provinces (82 Provinces)
    │   │   ├── Cities/Municipalities (1,488 Cities/Municipalities)
    │   │   │   └── Barangays (42,047 Barangays)
```

### **Key Facts**
- **Barangay**: Smallest administrative division
- **Average Population**: 2,500 people per barangay
- **Urban vs Rural**: Varies significantly
- **Governance**: Led by elected Barangay Captain

---

## 🏘️ What is a Barangay?

### **Definition**
A barangay is the smallest administrative division in the Philippines, similar to a village, district, or ward in other countries. The word "barangay" originated from "balangay," a type of boat used by early Filipino ancestors.

### **Functions**
- **Basic Services**: Health, sanitation, education support
- **Peace and Order**: Community security and dispute resolution
- **Record Keeping**: Birth, death, marriage, residency records
- **Community Development**: Local projects and initiatives
- **Social Services**: Assistance programs for residents

### **Legal Basis**
- Local Government Code of 1991 (Republic Act No. 7160)
- Establishes structure, powers, and responsibilities
- Mandates democratic governance at the grassroots level

---

## 📊 Geographic Hierarchy

### **Region Level**
```typescript
interface Region {
  code: string;        // "01" - "17", "NCR", "BARMM"
  name: string;        // "Region I - Ilocos Region"
  shortName: string;   // "Region I"
  islandGroup: 'Luzon' | 'Visayas' | 'Mindanao';
}

// Examples
const regions = [
  { code: "NCR", name: "National Capital Region", islandGroup: "Luzon" },
  { code: "01", name: "Region I - Ilocos Region", islandGroup: "Luzon" },
  { code: "BARMM", name: "Bangsamoro Autonomous Region", islandGroup: "Mindanao" }
];
```

### **Province Level**
```typescript
interface Province {
  code: string;        // "0128" (Region 01, Province 28)
  name: string;        // "Ilocos Norte"
  regionCode: string;  // "01"
  capital: string;     // "Laoag City"
}
```

### **City/Municipality Level**
```typescript
interface CityMunicipality {
  code: string;        // "012801" (Province 0128, City 01)
  name: string;        // "Laoag City"
  provinceCode: string; // "0128"
  classification: 'City' | 'Municipality';
  incomeClass: '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th';
}
```

### **Barangay Level**
```typescript
interface Barangay {
  code: string;        // "012801001" (City 012801, Barangay 001)
  name: string;        // "Barangay 1 (Poblacion)"
  cityCode: string;    // "012801"
  classification: 'Urban' | 'Rural';
  population?: number;
}
```

---

## 🗂️ PSGC System

### **Philippine Standard Geographic Code**
The PSGC is the systematic classification and coding of geographic areas in the Philippines. It's maintained by the Philippine Statistics Authority (PSA).

### **Code Structure**
```
10-digit code: RRPPCCBBBB
RR = Region code (2 digits)
PP = Province code (2 digits)
CC = City/Municipality code (2 digits)
BBBB = Barangay code (4 digits)

Example: 0128010001
01 = Region I
28 = Ilocos Norte
01 = Laoag City
0001 = Barangay 1
```

### **Database Implementation**
```sql
-- PSGC tables structure
CREATE TABLE psgc_regions (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  island_group VARCHAR(20)
);

CREATE TABLE psgc_provinces (
  code VARCHAR(4) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region_code VARCHAR(2) REFERENCES psgc_regions(code)
);

CREATE TABLE psgc_cities (
  code VARCHAR(6) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  province_code VARCHAR(4) REFERENCES psgc_provinces(code),
  classification VARCHAR(20),
  income_class VARCHAR(10)
);

CREATE TABLE psgc_barangays (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city_code VARCHAR(6) REFERENCES psgc_cities(code),
  classification VARCHAR(20),
  population INTEGER
);
```

---

## 👥 Barangay Demographics

### **Typical Barangay Data**
```typescript
interface BarangayDemographics {
  // Population
  totalPopulation: number;
  households: number;
  averageHouseholdSize: number;
  
  // Age distribution
  children: number;      // 0-14 years
  youth: number;         // 15-24 years
  adults: number;        // 25-59 years
  seniors: number;       // 60+ years
  
  // Gender distribution
  male: number;
  female: number;
  
  // Socioeconomic
  employmentRate: number;
  povertyIncidence: number;
  literacyRate: number;
}
```

### **Sectoral Groups**
```typescript
enum SectoralGroup {
  CHILDREN = 'Children (0-14)',
  YOUTH = 'Youth (15-30)',
  WOMEN = 'Women',
  SENIOR_CITIZENS = 'Senior Citizens (60+)',
  PWD = 'Persons with Disabilities',
  SOLO_PARENTS = 'Solo Parents',
  INDIGENOUS_PEOPLES = 'Indigenous Peoples',
  FARMERS = 'Farmers',
  FISHER_FOLKS = 'Fisher Folks',
  URBAN_POOR = 'Urban Poor'
}
```

---

## 🏢 Barangay Administration

### **Organizational Structure**
```
Barangay Government
    ├── Punong Barangay (Barangay Captain)
    ├── Sangguniang Barangay (Barangay Council)
    │   ├── 7 Kagawad (Councilors)
    │   ├── SK Chairperson (Youth Representative)
    │   └── Barangay Secretary
    ├── Barangay Treasurer
    └── Lupong Tagapamayapa (Peace and Order Committee)
```

### **Services Provided**
1. **Civil Registration**: Birth, death, marriage certificates
2. **Clearances**: Barangay clearance, business permits
3. **Health Services**: Health center, vaccination programs
4. **Education Support**: Day care centers, scholarships
5. **Social Services**: Senior citizen benefits, PWD assistance
6. **Peace and Order**: Tanod (village watchmen), dispute mediation

### **Required Records**
```typescript
interface BarangayRecords {
  // Resident Records
  residentRegistry: ResidentProfile[];
  householdRegistry: Household[];
  
  // Civil Documents
  barangayClearances: Clearance[];
  businessPermits: BusinessPermit[];
  
  // Health Records
  vaccinationRecords: VaccinationRecord[];
  healthProfiles: HealthProfile[];
  
  // Social Services
  seniorCitizenRegistry: SeniorCitizen[];
  pwdRegistry: PWD[];
  indigentRegistry: IndigentFamily[];
}
```

---

## 📋 Data Management

### **Resident Information**
```typescript
interface ResidentProfile {
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  
  // Demographics
  birthDate: Date;
  birthPlace: string;
  sex: 'Male' | 'Female';
  civilStatus: CivilStatus;
  
  // Contact Information
  mobileNumber?: string;
  email?: string;
  
  // Address
  houseNumber: string;
  street: string;
  barangayCode: string;
  
  // Socioeconomic
  occupation?: string;
  monthlyIncome?: number;
  educationalAttainment?: string;
  
  // Sectoral Membership
  sectoralGroups: SectoralGroup[];
}
```

### **Household Information**
```typescript
interface Household {
  // Identification
  householdNumber: string;
  
  // Location
  address: {
    houseNumber: string;
    street: string;
    subdivision?: string;
    barangayCode: string;
  };
  
  // Composition
  headOfHousehold: string; // Resident ID
  members: string[];        // Resident IDs
  totalMembers: number;
  
  // Economic Status
  householdIncome?: number;
  socialClass?: 'A' | 'B' | 'C' | 'D' | 'E';
  
  // Housing
  ownershipStatus: 'Owned' | 'Rented' | 'Others';
  housingType: 'Concrete' | 'Semi-concrete' | 'Wood' | 'Others';
}
```

---

## 🔗 System Implementation

### **Database Schema**
```sql
-- Barangay-specific tables
CREATE TABLE barangay_officials (
  id UUID PRIMARY KEY,
  barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
  position VARCHAR(50),
  name VARCHAR(100),
  term_start DATE,
  term_end DATE
);

CREATE TABLE barangay_projects (
  id UUID PRIMARY KEY,
  barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
  project_name VARCHAR(200),
  budget DECIMAL(12, 2),
  status VARCHAR(20),
  start_date DATE,
  completion_date DATE
);

CREATE TABLE barangay_clearances (
  id UUID PRIMARY KEY,
  resident_id UUID REFERENCES residents(id),
  barangay_code VARCHAR(10),
  purpose VARCHAR(100),
  issue_date DATE,
  expiry_date DATE,
  or_number VARCHAR(50)
);
```

### **API Endpoints**
```typescript
// Barangay-specific API routes
GET    /api/barangays                    // List all barangays
GET    /api/barangays/:code              // Get specific barangay
GET    /api/barangays/:code/residents    // Get barangay residents
GET    /api/barangays/:code/households   // Get barangay households
GET    /api/barangays/:code/statistics   // Get barangay statistics
POST   /api/barangays/:code/clearances   // Issue barangay clearance
```

### **Access Control**
```typescript
// Barangay-based access control
function getBarangayAccess(user: User): string[] {
  switch(user.role) {
    case 'super_admin':
      return ['*']; // Access to all barangays
    
    case 'barangay_admin':
      return [user.barangayCode]; // Own barangay only
    
    case 'resident':
      return [user.barangayCode]; // View only, own barangay
    
    default:
      return [];
  }
}
```

### **Multi-tenancy Implementation**
```sql
-- Row-level security for barangay isolation
CREATE POLICY "barangay_data_isolation" ON residents
FOR ALL USING (
  barangay_code = ANY(
    SELECT get_user_barangay_access(auth.uid())
  )
);

-- Function to get user's barangay access
CREATE FUNCTION get_user_barangay_access(user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  user_role TEXT;
  user_barangay TEXT;
BEGIN
  SELECT role, barangay_code INTO user_role, user_barangay
  FROM auth_user_profiles
  WHERE id = user_id;
  
  IF user_role = 'super_admin' THEN
    RETURN ARRAY(SELECT code FROM psgc_barangays);
  ELSE
    RETURN ARRAY[user_barangay];
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📊 Analytics & Reporting

### **Barangay Dashboard Metrics**
```typescript
interface BarangayDashboard {
  // Population metrics
  totalResidents: number;
  totalHouseholds: number;
  populationGrowthRate: number;
  
  // Demographics
  ageDistribution: AgeGroup[];
  genderDistribution: GenderCount;
  
  // Sectoral data
  sectoralGroups: {
    group: SectoralGroup;
    count: number;
    percentage: number;
  }[];
  
  // Economic indicators
  employmentRate: number;
  averageHouseholdIncome: number;
  povertyIncidence: number;
  
  // Service delivery
  clearancesIssued: number;
  healthServicesProvided: number;
  socialServicesProvided: number;
}
```

### **Report Generation**
```typescript
// Generate barangay reports
async function generateBarangayReport(
  barangayCode: string,
  reportType: 'demographic' | 'economic' | 'health' | 'comprehensive'
): Promise<Report> {
  const data = await getBarangayData(barangayCode);
  
  switch(reportType) {
    case 'demographic':
      return generateDemographicReport(data);
    case 'economic':
      return generateEconomicReport(data);
    case 'health':
      return generateHealthReport(data);
    case 'comprehensive':
      return generateComprehensiveReport(data);
  }
}
```

---

## 🌐 Integration Points

### **Government Systems**
- **PSA (Philippine Statistics Authority)**: PSGC updates
- **DILG (Department of Interior and Local Government)**: Compliance reporting
- **DOH (Department of Health)**: Health data submission
- **DSWD (Department of Social Welfare)**: Social services coordination
- **PhilSys (National ID System)**: Identity verification

### **Data Standards**
- Follow PSA statistical standards
- Comply with Data Privacy Act of 2012
- Use standard government forms and formats
- Maintain interoperability with national systems

---

💡 **Remember**: The barangay system is the foundation of Philippine local governance. Understanding its structure and requirements is crucial for building an effective management system.

🔗 **Related Documentation**: 
- [Database Schema Documentation](./DATABASE_SCHEMA_DOCUMENTATION.md) for technical implementation
- [User Roles & Permissions](./USER_ROLES_PERMISSIONS.md) for access control
- [Data Flow Diagrams](./DATA_FLOW_DIAGRAMS.md) for system processes