// Organism Components - Complex UI sections and business logic

// General UI Organisms
export { DataTable } from './DataTable';
export type { TableColumn, TableAction, DataTableProps } from './DataTable';
export { Navigation } from './Navigation';
export { default as Sidebar, SidebarHeader, SidebarFooter, ToggleButton } from './Sidebar';
export type { SidebarProps, NavigationItem } from './Sidebar';
export { Table } from './Table';
export { CreateHouseholdModal } from './CreateHouseholdModal';
export { PopulationPyramid } from './PopulationPyramid';

// Address Components
export { GeographicLocationStep } from './GeographicLocationStep';

// Search Components

// Authentication Components
export { DevLogin } from './DevLogin';
export { LoginForm } from './LoginForm';
export { ProtectedRoute } from './ProtectedRoute';
export { UserProfile } from './UserProfile';

// Form Sections
// PersonalInformation moved to Form/Resident/PersonalInformation/FormField/BasicInformation

// Form Components - Specific imports to avoid conflicts
export { PersonalInformationForm } from './Form/Resident/PersonalInformation';

// Barangay Components
// SectoralInfo moved to Form/Resident/SectoralInformation structure

// RBI-Specific Components - Specific imports to avoid conflicts
export { default as FamilyRelationshipSelector } from './RbiSpecific/FamilyRelationshipSelector';
export { default as HouseholdTypeSelector } from './RbiSpecific/HouseholdTypeSelector';
export { default as MigrantInformation } from './RbiSpecific/MigrantInformation';
export { default as RbiMotherMaidenName } from './RbiSpecific/MotherMaidenName';
export { default as RbiPhysicalCharacteristics } from './RbiSpecific/PhysicalCharacteristics';
export { default as ResidentStatusSelector } from './RbiSpecific/ResidentStatusSelector';
