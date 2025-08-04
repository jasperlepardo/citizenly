# User Access Implementation Plan
## For Original Schema (Residents & Households Already Implemented)

## 🎯 **GOAL**
Implement user authentication and access control using the **original schema.sql** structure, focusing only on user management since residents/households are already working.

---

## 📋 **ORIGINAL SCHEMA USER TABLES**

```sql
-- From schema.sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{}'
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 **MINIMAL SCHEMA ENHANCEMENTS**

### **Add Only Essential Fields:**
```sql
-- Add minimal fields needed for user management
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);

-- Optional: Add status for user approval workflow
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
```

**That's it!** No barangay_accounts table needed.

---

## 🏗️ **USER ACCESS ARCHITECTURE**

### **1. Simplified User Model**
```typescript
interface UserProfile {
  id: string                    // References auth.users(id)
  email: string
  first_name: string
  last_name: string
  mobile_number?: string        // Added field
  role_id: string              // References roles(id)
  barangay_code: string        // Single barangay assignment
  is_active: boolean
  status?: string              // 'active', 'pending', 'suspended'
  created_at: string
}

interface Role {
  id: string
  name: string                 // 'super_admin', 'barangay_admin', 'clerk', 'resident'
  permissions: Record<string, any>
}
```

### **2. Access Control Logic**
```typescript
// Single barangay per user (no barangay_accounts needed)
const canAccessBarangay = (userBarangayCode: string, resourceBarangayCode: string) => {
  return userBarangayCode === resourceBarangayCode
}

// Role-based permissions
const hasPermission = (role: Role, permission: string) => {
  return role.permissions[permission] === true || role.permissions.all === true
}
```

---

## 💻 **IMPLEMENTATION COMPONENTS**

### **1. Updated AuthContext**
```typescript
// src/contexts/AuthContext.tsx - Simplified for original schema
interface AuthContextType {
  // Core state
  user: User | null
  userProfile: UserProfile | null
  role: Role | null
  loading: boolean
  
  // Methods
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  
  // Access control
  hasPermission: (permission: string) => boolean
  isInRole: (roleName: string) => boolean
  canAccessBarangay: (barangayCode: string) => boolean
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        roles (*)
      `)
      .eq('id', userId)
      .single()

    if (!error && profile) {
      setUserProfile(profile)
      setRole(profile.roles)
    }
  }

  // Access control methods
  const hasPermission = (permission: string): boolean => {
    if (!role?.permissions) return false
    return role.permissions.all === true || role.permissions[permission] === true
  }

  const isInRole = (roleName: string): boolean => {
    return role?.name === roleName
  }

  const canAccessBarangay = (barangayCode: string): boolean => {
    return userProfile?.barangay_code === barangayCode
  }

  // ... rest of implementation
}
```

### **2. Simplified Signup Process**
```typescript
// src/app/signup/page.tsx - Admin-created users
export default function SignupPage() {
  // Option 1: Admin-only user creation (recommended)
  // - Only admins can create new users
  // - No self-signup to avoid approval complexity
  
  // Option 2: Self-signup with admin approval
  // - Users can request accounts
  // - Admins approve via status field
  
  const handleSubmit = async (formData: SignupFormData) => {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError || !authData.user) {
      setErrors({ general: authError.message })
      return
    }

    // Create user profile (simple version)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile_number: formData.mobileNumber,
        role_id: formData.roleId,           // Required in original schema
        barangay_code: formData.barangayCode,
        status: 'pending'                   // Optional approval workflow
      })

    if (profileError) {
      setErrors({ general: 'Profile creation failed: ' + profileError.message })
      return
    }

    setStep('success')
  }
}
```

### **3. RLS Policies for Original Schema**
```sql
-- Enable RLS on user_profiles (already in original schema)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY user_profiles_own_read ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile (limited fields)
CREATE POLICY user_profiles_own_update ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow signup (insert own profile)
CREATE POLICY user_profiles_signup ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can manage all profiles in their barangay
CREATE POLICY user_profiles_admin_manage ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile
            JOIN roles ON admin_profile.role_id = roles.id
            WHERE admin_profile.id = auth.uid()
            AND roles.name IN ('super_admin', 'barangay_admin')
            AND (
                roles.name = 'super_admin' OR 
                admin_profile.barangay_code = user_profiles.barangay_code
            )
        )
    );
```

### **4. User Management Components**
```typescript
// src/components/admin/UserManagement.tsx
export default function UserManagement() {
  const { userProfile, hasPermission } = useAuth()
  
  // Only admins can access
  if (!hasPermission('users.manage')) {
    return <div>Access denied</div>
  }

  const createUser = async (userData: CreateUserData) => {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    })

    // Create profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user!.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        mobile_number: userData.mobileNumber,
        role_id: userData.roleId,
        barangay_code: userProfile!.barangay_code, // Same barangay as admin
        status: 'active'
      })
  }

  // List users in same barangay
  const { data: users } = useSWR(
    ['users', userProfile?.barangay_code],
    () => supabase
      .from('user_profiles')
      .select(`
        *,
        roles (name)
      `)
      .eq('barangay_code', userProfile!.barangay_code)
  )

  return (
    <div>
      {/* User list and creation form */}
    </div>
  )
}
```

---

## 🔄 **MIGRATION STEPS**

### **Step 1: Revert Database**
```bash
# Run the revert script
# REVERT_TO_ORIGINAL_SCHEMA.sql
```

### **Step 2: Add Minimal Enhancements**
```sql
-- Add only essential fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
```

### **Step 3: Update Code**
1. **Replace AuthContext** with simplified version
2. **Update signup/login** components  
3. **Add RLS policies** for user management
4. **Create admin user management** interface

### **Step 4: Test User Access**
1. ✅ Login/logout works
2. ✅ Role-based access control
3. ✅ Barangay-scoped data access
4. ✅ Admin user management

---

## 🎯 **USER WORKFLOWS**

### **Admin Workflow:**
1. **Login** → AuthContext loads profile + role
2. **Create users** → Admin interface for user management
3. **Assign roles** → Clerk, Resident, etc.
4. **Manage barangay** → Only users in same barangay

### **User Workflow:**
1. **Login** → Access based on role permissions
2. **View data** → Scoped to assigned barangay
3. **Perform actions** → Based on role permissions
4. **Update profile** → Limited self-management

---

## ✅ **BENEFITS OF THIS APPROACH**

1. **Minimal Schema Changes** - Only 2 optional columns added
2. **No Complex Tables** - No barangay_accounts needed
3. **Simple Access Control** - One barangay per user
4. **Fast Implementation** - Reuses existing auth patterns
5. **Original Schema Intact** - Easy to maintain

---

## 🚀 **IMPLEMENTATION ORDER**

1. **Revert to original schema** ✅
2. **Add minimal fields** ✅  
3. **Update AuthContext** (simplified)
4. **Fix signup/login** (no barangay_accounts)
5. **Add RLS policies** (user management)
6. **Test user access** workflows

This gives you clean user access that works perfectly with the original schema while your residents and households modules remain unchanged!