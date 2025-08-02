# RBI System - User Experience Workflow
## Clean and Focused User Journey Guide

---

## 👥 **User Roles**

| Role | Access Level | Primary Functions |
|------|-------------|-------------------|
| **Super Admin** | System-wide | Manage multiple barangays, system settings |
| **Barangay Admin** | Barangay-scoped | Full resident/household management, reports |
| **Clerk/Staff** | Barangay-scoped | Data entry, basic operations |
| **Resident** | Own data only | View profile, request updates |

---

## 🏠 **Core Workflows**

### **1. Resident Management**

#### **Browse Residents**
```
Dashboard → Residents
├── 📊 Quick Stats (Total, New, Pending, Senior Citizens)
├── 🔍 Search Bar (Name, Phone, ID)
├── 🏷️ Quick Filters (OFW, PWD, Senior Citizen)
├── 📋 Data Table (Name, Age, Sex, Household, Actions)
└── ➕ Add New Resident
```

#### **View Resident Details**
```
Residents → [Select Resident] → Profile
├── 📋 Header (Photo, Name, PhilSys ID, Basic Info)
├── 📑 Tabs:
│   ├── Personal (Demographics, Education, Employment)
│   ├── Address (Auto-populated from household)
│   ├── Sectoral (Auto-calculated: OFW, PWD, SC, Labor Force)
│   └── Migration (If applicable: Previous address, reasons)
└── 🔗 Actions (Edit, Print Certificate, Generate ID)
```

#### **Register New Resident (5 Steps)**
```
Step 1: Personal Information
├── Name, birthdate, sex, civil status
├── Contact details (mobile, email)
└── PhilSys card number (secure)

Step 2: Demographics & Identity
├── Education level & status
├── Blood type, ethnicity, religion
└── Voting registration status

Step 3: Employment & Occupation
├── 🔍 PSOC Occupation Search
├── Employment status & workplace
└── Monthly salary

Step 4: Household Assignment
├── Option A: Assign to existing household
├── Option B: Create new household
└── Define family relationship

Step 5: Review & Save
├── Validate information
├── Generate hierarchical resident ID
└── Success confirmation
```

#### **Edit Resident**
```
Resident Details → Edit
├── Pre-populated 5-step form
├── Highlight changed fields
├── Show audit trail (previous values)
└── Update auto-calculated fields
```

---

### **2. Household Management**

#### **Browse Households**
```
Dashboard → Households
├── 📊 Stats (Total, Average Size, Income Distribution)
├── 🔍 Search (Household Number, Head Name, Address)
├── 📋 Table (ID, Head, Members, Address, Income Class)
└── ➕ Create New Household
```

#### **Create New Household (Key Steps)**
```
Step 1: Basic Information
├── Household number (unique per barangay)
└── Select household head

Step 2: Address Setup
├── Auto-populated: Region, Province, City, Barangay
├── Select: Subdivision (optional)
├── Select: Street name
└── Enter: House number

Step 3: Household Profile
├── Household type (nuclear, extended, single-parent, etc.)
├── Tenure status (owner, renter)
├── Unit type (house, condo, etc.)
└── Number of families

Step 4: Add Members
├── Link existing residents
├── Define family positions
└── Set relationships

Result: Auto-generated hierarchical ID
Format: RRPPMMBBB-SSSS-TTTT-HHHH
```

---

### **3. Search & Discovery**

#### **Global Search**
```
Search: "Juan Dela Cruz"
Results:
├── 👤 Exact resident matches
├── 🏠 Household head matches  
├── 📱 Phone number matches
└── 🆔 PhilSys ID matches (last 4 digits)
```

#### **Advanced Filtering**
```
Filters Available:
├── Demographics: Age range, sex, civil status
├── Location: Street, subdivision, household
├── Employment: PSOC occupation, employment status
├── Sectoral: OFW, PWD, Senior Citizen, Solo Parent
├── Income: Household income class
└── Migration: Migrant status, previous location
```

#### **PSOC Occupation Search**
```
Search: "teacher"
Results Priority:
1. Unit Sub-Groups: "Teaching Professionals - Elementary Teacher"
2. Position Titles: "Math Teacher", "Science Teacher"
3. Cross-References: "Education Administrator"
4. Unit Groups: "Teaching Professionals"
5. Broader matches: Any occupation containing "teacher"
```

---

## 📊 **Analytics & Reports**

### **Dashboard Overview**
```
Key Metrics:
├── 👥 Population: Total residents, households
├── 📈 Growth: New registrations this month
├── 👨‍👩‍👧‍👦 Demographics: Age distribution, sex ratio
├── 💼 Employment: Top occupations, employment rate
├── 🏠 Housing: Average household size, tenure types
└── 🎯 Sectoral: OFW, PWD, Senior Citizens counts
```

### **Report Generation**
```
Available Reports:
├── 📋 Barangay Certificate Statistics
├── 📊 Population Demographics
├── 💰 Income Distribution Analysis
├── 🗳️ Voting Population Report
├── 👥 Sectoral Information Summary
└── 🏠 Household Composition Report

Export Formats: PDF, Excel, CSV
Schedule: Daily, Weekly, Monthly
```

---

## 📱 **Mobile Experience**

### **Mobile Layout Priorities**
```
Smartphone View:
├── 🔍 Prominent search bar (top)
├── 📊 Key stats cards (scrollable)
├── 📋 Simplified data table
├── 👆 Large touch targets (44px min)
└── ⚡ Quick action buttons (floating)
```

### **Offline Capabilities**
```
PWA Features:
├── 📊 View cached dashboard data
├── 📝 Continue data entry (sync later)
├── 🔍 Search locally stored data
├── 📷 Take profile photos
└── 🔄 Auto-sync when reconnected
```

---

## 🎯 **Key UX Principles**

### **1. Auto-Population Strategy**
- **Address fields**: Auto-filled from user's assigned barangay
- **Sectoral information**: Auto-calculated from age and employment
- **Household statistics**: Auto-updated when members change
- **Income classification**: Auto-determined from household income

### **2. Validation & Error Prevention**
- **Real-time validation**: Immediate feedback on form errors
- **Relationship logic**: Prevent impossible family relationships
- **Duplicate detection**: Warn about potential duplicate residents
- **Required fields**: Clear visual indicators

### **3. Search-First Design**
- **Global search**: Available from every page
- **Intelligent results**: Prioritized by relevance and user context
- **Quick filters**: Common searches accessible as one-click filters
- **Recent searches**: Remember frequently used search terms

### **4. Role-Based Interface**
- **Context-aware menus**: Show only relevant actions for user role
- **Permission-based visibility**: Hide restricted features
- **Scoped data**: Barangay users see only their data
- **Quick role switching**: For multi-barangay administrators

---

## 🎨 **Design System & Visual Guidelines**

### **📐 Figma References**

#### **App Layout & Screens**
**Citizenly App Design**: [Citizenly Layout](https://www.figma.com/design/srcDxfJEqx3qfPiQRrSR52/Citizenly?node-id=1-829&t=OndQULNKpeMqYE59-4)
- **Navigation Structure**: Sidebar navigation, dashboard layout
- **Page Templates**: Residents list, details, forms
- **Responsive Behavior**: Mobile and desktop layouts
- **Workflow Screens**: Registration forms, household management

#### **Design System Components**  
**JSPR Design System**: [Component Library](https://www.figma.com/design/UqZjAbFtUqskUKPkZIB8lx/JSPR-%7C-Design-System?t=5AC2fFPemOImA5UD-0)
- **Component Library**: Buttons, inputs, cards, modals
- **Typography Scale**: Headings, body text, captions
- **Color Palette**: Primary, secondary, semantic colors
- **Spacing System**: Consistent margins and padding

#### **Iconography Library**
**JSPR Iconography**: [Icon Library](https://www.figma.com/design/CYygNIegdzFYCkeIh8tema/JSPR-%7C-Iconography---Tailwind?node-id=2098-10628&t=CS8rjlKi6yUeTQ8M-0)
- **Icon Set**: Navigation, actions, status, content icons
- **Format**: SVG icons optimized for Tailwind CSS
- **Usage**: Navigation menus, buttons, status indicators, form elements

### **Color System (Reference Figma for exact values)**
- **Primary Blue**: Navigation, main actions
- **Success Green**: Completed tasks, valid data
- **Warning Yellow**: Pending actions, attention needed
- **Error Red**: Validation errors, critical issues
- **Neutral Gray**: Secondary info, disabled states

### **Status Indicators**
- **🟢 Active**: Current residents, verified data
- **🟡 Pending**: Awaiting verification, incomplete
- **🔴 Inactive**: Moved out, marked as deceased
- **⚪ Draft**: Incomplete registrations

### **Component Usage Priority**
1. **Use Figma components first** - Maintain design consistency
2. **Follow spacing system** - Use design tokens from Figma
3. **Implement responsive breakpoints** - Mobile-first approach
4. **Apply consistent typography** - Heading and text styles from design system

---

This streamlined UX workflow focuses on the essential user journeys for efficient barangay resident management, emphasizing clarity, speed, and mobile-first design.