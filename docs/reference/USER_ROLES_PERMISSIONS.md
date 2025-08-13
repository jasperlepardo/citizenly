# User Roles & Permissions

> **Role-based access control (RBAC) documentation for the Citizenly project**

## 📖 Role Hierarchy

```
Super Admin
    ├── Barangay Admin
    │   └── Resident
```

## 👥 Role Definitions

### **Super Admin**
- **Purpose**: System-wide administration
- **Access**: All barangays, all features
- **Key Permissions**:
  - Manage all users
  - Access all barangays
  - System configuration
  - View system analytics
  - Database management

### **Barangay Admin**
- **Purpose**: Barangay-level management
- **Access**: Own barangay only
- **Key Permissions**:
  - Manage barangay residents
  - Issue barangay clearances
  - View barangay analytics
  - Export barangay data
  - Manage households

### **Resident**
- **Purpose**: Self-service access
- **Access**: Own profile only
- **Key Permissions**:
  - View own profile
  - Update contact information
  - View household members
  - Request documents

## 🔐 Permission Matrix

| Feature | Super Admin | Barangay Admin | Resident |
|---------|------------|----------------|----------|
| **User Management** |
| Create users | ✅ | ✅ (own barangay) | ❌ |
| Delete users | ✅ | ❌ | ❌ |
| Assign roles | ✅ | ❌ | ❌ |
| **Resident Management** |
| View all residents | ✅ | ✅ (own barangay) | ❌ |
| Create residents | ✅ | ✅ (own barangay) | ❌ |
| Edit residents | ✅ | ✅ (own barangay) | ✅ (self) |
| Delete residents | ✅ | ✅ (own barangay) | ❌ |
| **Household Management** |
| View households | ✅ | ✅ (own barangay) | ✅ (own) |
| Create households | ✅ | ✅ (own barangay) | ❌ |
| Edit households | ✅ | ✅ (own barangay) | ❌ |
| **Reports & Analytics** |
| System analytics | ✅ | ❌ | ❌ |
| Barangay analytics | ✅ | ✅ (own barangay) | ❌ |
| Export data | ✅ | ✅ (own barangay) | ❌ |
| **Document Issuance** |
| Issue clearances | ✅ | ✅ (own barangay) | ❌ |
| Approve requests | ✅ | ✅ (own barangay) | ❌ |

## 💻 Implementation

### **Database Schema**
```sql
-- User roles enum
CREATE TYPE user_role AS ENUM ('super_admin', 'barangay_admin', 'resident');

-- User profiles with roles
ALTER TABLE auth_user_profiles 
ADD COLUMN role user_role DEFAULT 'resident',
ADD COLUMN barangay_code VARCHAR(10);
```

### **TypeScript Types**
```typescript
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  BARANGAY_ADMIN = 'barangay_admin',
  RESIDENT = 'resident'
}

export interface UserPermissions {
  canManageUsers: boolean;
  canManageResidents: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  canIssueDocuments: boolean;
  barangayAccess: string[]; // Barangay codes
}
```

### **Permission Checking**
```typescript
export function getUserPermissions(role: UserRole): UserPermissions {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return {
        canManageUsers: true,
        canManageResidents: true,
        canViewAnalytics: true,
        canExportData: true,
        canIssueDocuments: true,
        barangayAccess: ['*']
      };
    
    case UserRole.BARANGAY_ADMIN:
      return {
        canManageUsers: true,
        canManageResidents: true,
        canViewAnalytics: true,
        canExportData: true,
        canIssueDocuments: true,
        barangayAccess: ['own']
      };
    
    case UserRole.RESIDENT:
      return {
        canManageUsers: false,
        canManageResidents: false,
        canViewAnalytics: false,
        canExportData: false,
        canIssueDocuments: false,
        barangayAccess: ['own']
      };
  }
}
```

### **Row-Level Security**
```sql
-- Super admin bypass
CREATE POLICY "super_admin_all_access" ON residents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth_user_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Barangay admin access
CREATE POLICY "barangay_admin_own_barangay" ON residents
FOR ALL USING (
  barangay_code = (
    SELECT barangay_code FROM auth_user_profiles
    WHERE id = auth.uid() AND role = 'barangay_admin'
  )
);

-- Resident self-access
CREATE POLICY "resident_self_access" ON residents
FOR SELECT USING (
  id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM auth_user_profiles
    WHERE id = auth.uid() AND role = 'resident'
  )
);
```

## 🛡️ Security Considerations

1. **Principle of Least Privilege**: Users get minimum necessary access
2. **Role Escalation Prevention**: Only super admins can assign roles
3. **Audit Logging**: Track all permission changes
4. **Regular Review**: Periodic access audits
5. **Separation of Duties**: Critical actions require appropriate role

🔗 **Related**: [Security Guidelines](./SECURITY_GUIDELINES.md) | [API Design Standards](./API_DESIGN_STANDARDS.md)