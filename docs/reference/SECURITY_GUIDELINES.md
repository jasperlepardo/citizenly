# Security Guidelines

> **Comprehensive security patterns and best practices for the Citizenly project**
> 
> This document outlines security measures, authentication patterns, and best practices to protect user data and system integrity.

## 📖 Table of Contents

1. [🔐 Security Principles](#-security-principles)
2. [🛡️ Authentication](#️-authentication)
3. [🔑 Authorization](#-authorization)
4. [🗄️ Database Security](#️-database-security)
5. [🌐 API Security](#-api-security)
6. [🖥️ Frontend Security](#️-frontend-security)
7. [🔒 Data Protection](#-data-protection)
8. [🚨 Common Vulnerabilities](#-common-vulnerabilities)
9. [📋 Security Checklist](#-security-checklist)
10. [🆘 Incident Response](#-incident-response)

---

## 🔐 Security Principles

### **Core Security Principles**
- **Defense in Depth**: Multiple layers of security
- **Least Privilege**: Minimum necessary access
- **Zero Trust**: Verify everything, trust nothing
- **Secure by Default**: Security built-in, not added
- **Fail Secure**: Deny access when in doubt
- **Data Minimization**: Collect only necessary data

### **Security Requirements**
- All data transmission must be encrypted (HTTPS)
- All user inputs must be validated and sanitized
- All database queries must use parameterization
- All sensitive data must be encrypted at rest
- All authentication must use secure tokens
- All actions must be logged for audit

---

## 🛡️ Authentication

### **Authentication Strategy**
```typescript
// Supabase Auth configuration
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce' // Proof Key for Code Exchange
    }
  }
);
```

### **Secure Login Implementation**
```typescript
// app/api/auth/login/route.ts
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid credentials format' },
        { status: 400 }
      );
    }
    
    // Rate limiting check
    const rateLimitOk = await checkRateLimit(request);
    if (!rateLimitOk) {
      return Response.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password
    });
    
    if (error) {
      // Log failed attempt
      await logFailedLogin(email, request);
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Log successful login
    await logSuccessfulLogin(data.user.id, request);
    
    // Return session
    return Response.json({
      data: {
        user: data.user,
        session: data.session
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
```

### **Password Requirements**
```typescript
// lib/validation/auth.ts
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];
  
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');
  
  return { score: Math.min(score, 5), feedback };
}
```

### **Session Management**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  
  // Refresh session if needed
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (!session) {
    // Redirect to login for protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Check session expiry
  if (session && isSessionExpired(session)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}
```

---

## 🔑 Authorization

### **Role-Based Access Control (RBAC)**
```typescript
// lib/auth/permissions.ts
export enum Role {
  SUPER_ADMIN = 'super_admin',
  BARANGAY_ADMIN = 'barangay_admin',
  RESIDENT = 'resident'
}

export const permissions = {
  [Role.SUPER_ADMIN]: [
    'system.manage',
    'users.manage',
    'barangays.manage',
    'residents.manage.all',
    'reports.view.all'
  ],
  [Role.BARANGAY_ADMIN]: [
    'residents.manage.own_barangay',
    'households.manage.own_barangay',
    'reports.view.own_barangay',
    'exports.create.own_barangay'
  ],
  [Role.RESIDENT]: [
    'profile.view.own',
    'profile.update.own',
    'household.view.own'
  ]
};

export function hasPermission(
  userRole: Role,
  permission: string
): boolean {
  const rolePermissions = permissions[userRole] || [];
  return rolePermissions.includes(permission);
}
```

### **Authorization Middleware**
```typescript
// lib/auth/authorize.ts
export function authorize(requiredPermission: string) {
  return async function(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user profile with role
    const profile = await getUserProfile(user.id);
    
    if (!hasPermission(profile.role, requiredPermission)) {
      return Response.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Continue with request
    return null;
  };
}

// Usage in API route
export async function GET(request: Request) {
  const authError = await authorize('residents.manage.own_barangay')(request);
  if (authError) return authError;
  
  // Authorized logic here
  const residents = await getResidents();
  return Response.json({ data: residents });
}
```

---

## 🗄️ Database Security

### **Row-Level Security (RLS)**
```sql
-- Enable RLS on all tables
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_user_profiles ENABLE ROW LEVEL SECURITY;

-- Barangay isolation policy
CREATE POLICY "barangay_isolation" ON residents
FOR ALL USING (
  barangay_code = (
    SELECT barangay_code 
    FROM auth_user_profiles 
    WHERE id = auth.uid()
  )
);

-- User can only update own profile
CREATE POLICY "own_profile_update" ON auth_user_profiles
FOR UPDATE USING (id = auth.uid());

-- Super admin bypass
CREATE POLICY "super_admin_bypass" ON residents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth_user_profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
);
```

### **Data Encryption**
```sql
-- Encrypt sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt PII data
ALTER TABLE residents 
ADD COLUMN ssn_encrypted BYTEA;

-- Encryption function
CREATE OR REPLACE FUNCTION encrypt_sensitive(text_value TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(
    text_value,
    current_setting('app.encryption_key')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decryption function (restricted access)
CREATE OR REPLACE FUNCTION decrypt_sensitive(encrypted_value BYTEA)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(
    encrypted_value,
    current_setting('app.encryption_key')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **SQL Injection Prevention**
```typescript
// ❌ NEVER DO THIS - Vulnerable to SQL injection
const query = `SELECT * FROM residents WHERE name = '${userInput}'`;

// ✅ Always use parameterized queries
const { data, error } = await supabase
  .from('residents')
  .select('*')
  .eq('name', userInput);

// ✅ Or with raw SQL (parameterized)
const { data, error } = await supabase.rpc('search_residents', {
  search_term: userInput
});
```

---

## 🌐 API Security

### **Rate Limiting**
```typescript
// lib/security/rate-limit.ts
const rateLimitMap = new Map();

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const requests = rateLimitMap.get(identifier) || [];
  const recentRequests = requests.filter((time: number) => time > windowStart);
  
  if (recentRequests.length >= limit) {
    return false; // Rate limit exceeded
  }
  
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  
  return true;
}

// Usage in API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (!await rateLimit(`login:${ip}`, 5, 60000)) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Continue with request
}
```

### **CORS Configuration**
```typescript
// lib/security/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS() {
  return new Response(null, { 
    status: 200, 
    headers: corsHeaders 
  });
}
```

### **API Key Management**
```typescript
// For external API access
export async function validateApiKey(
  apiKey: string
): Promise<boolean> {
  // Hash the API key for comparison
  const hashedKey = await hashApiKey(apiKey);
  
  // Check against database
  const { data } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', hashedKey)
    .eq('is_active', true)
    .single();
  
  if (!data) return false;
  
  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return false;
  }
  
  // Log API key usage
  await logApiKeyUsage(data.id);
  
  return true;
}
```

---

## 🖥️ Frontend Security

### **XSS Prevention**
```typescript
// ❌ NEVER DO THIS - XSS vulnerable
function DisplayContent({ content }: { content: string }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

// ✅ Safe rendering
function DisplayContent({ content }: { content: string }) {
  return <div>{content}</div>;
}

// ✅ If HTML is needed, sanitize first
import DOMPurify from 'isomorphic-dompurify';

function DisplayRichContent({ html }: { html: string }) {
  const cleanHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
  
  return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
}
```

### **CSRF Protection**
```typescript
// lib/security/csrf.ts
import { randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export async function validateCSRFToken(
  token: string,
  sessionToken: string
): Promise<boolean> {
  return token === sessionToken;
}

// Usage in forms
function ContactForm() {
  const [csrfToken] = useState(() => generateCSRFToken());
  
  const handleSubmit = async (data: FormData) => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(data)
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {/* Form fields */}
    </form>
  );
}
```

### **Content Security Policy**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;
```

---

## 🔒 Data Protection

### **PII Handling**
```typescript
// lib/security/pii.ts
export const PII_FIELDS = [
  'ssn',
  'dateOfBirth',
  'phoneNumber',
  'email',
  'address'
];

// Mask PII for logging
export function maskPII(data: any): any {
  const masked = { ...data };
  
  PII_FIELDS.forEach(field => {
    if (masked[field]) {
      masked[field] = '***REDACTED***';
    }
  });
  
  return masked;
}

// Encrypt PII before storage
export async function encryptPII(data: any): Promise<any> {
  const encrypted = { ...data };
  
  for (const field of PII_FIELDS) {
    if (encrypted[field]) {
      encrypted[field] = await encrypt(encrypted[field]);
    }
  }
  
  return encrypted;
}
```

### **Audit Logging**
```typescript
// lib/security/audit.ts
export async function auditLog(
  action: string,
  userId: string,
  details: any,
  request: Request
): Promise<void> {
  const log = {
    action,
    user_id: userId,
    ip_address: request.headers.get('x-forwarded-for'),
    user_agent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
    details: maskPII(details) // Don't log PII
  };
  
  await supabase
    .from('audit_logs')
    .insert(log);
}
```

---

## 🚨 Common Vulnerabilities

### **OWASP Top 10 Mitigations**

#### **1. Injection**
```typescript
// Always use parameterized queries
const { data } = await supabase
  .from('users')
  .select()
  .eq('email', userInput); // Safe
```

#### **2. Broken Authentication**
```typescript
// Implement proper session management
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
```

#### **3. Sensitive Data Exposure**
```typescript
// Always use HTTPS and encrypt sensitive data
const encrypted = await encrypt(sensitiveData);
```

#### **4. XML External Entities (XXE)**
```typescript
// Disable XML external entity processing
// Use JSON instead of XML when possible
```

#### **5. Broken Access Control**
```typescript
// Implement proper authorization checks
if (!hasPermission(user.role, 'admin.access')) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

#### **6. Security Misconfiguration**
```typescript
// Use secure defaults and remove unnecessary features
// Keep dependencies updated
```

#### **7. Cross-Site Scripting (XSS)**
```typescript
// Sanitize all user inputs
const clean = DOMPurify.sanitize(userInput);
```

#### **8. Insecure Deserialization**
```typescript
// Validate all incoming data
const validated = schema.parse(untrustedData);
```

#### **9. Using Components with Known Vulnerabilities**
```bash
# Regularly update dependencies
npm audit fix
```

#### **10. Insufficient Logging & Monitoring**
```typescript
// Log all security events
await auditLog('failed_login', userId, details, request);
```

---

## 📋 Security Checklist

### **Development**
- [ ] All inputs validated and sanitized
- [ ] Parameterized queries used
- [ ] Authentication implemented correctly
- [ ] Authorization checks in place
- [ ] Sensitive data encrypted
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Dependencies up to date

### **Deployment**
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API keys rotated regularly
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Incident response plan ready
- [ ] Security scanning enabled
- [ ] Rate limiting configured

### **Testing**
- [ ] Security tests written
- [ ] Penetration testing performed
- [ ] OWASP ZAP scan completed
- [ ] Dependency vulnerabilities checked
- [ ] Access control tested
- [ ] Input validation tested
- [ ] XSS prevention tested
- [ ] SQL injection tested

---

## 🆘 Incident Response

### **Response Plan**
1. **Detect** - Identify the security incident
2. **Contain** - Limit the damage
3. **Investigate** - Determine scope and impact
4. **Remediate** - Fix the vulnerability
5. **Recover** - Restore normal operations
6. **Review** - Learn and improve

### **Emergency Contacts**
```typescript
// config/security.ts
export const SECURITY_CONTACTS = {
  securityTeam: 'security@citizenly.app',
  incidentResponse: 'incident@citizenly.app',
  dataProtection: 'dpo@citizenly.app'
};
```

### **Incident Logging**
```typescript
export async function logSecurityIncident(
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: any
): Promise<void> {
  // Log to database
  await supabase
    .from('security_incidents')
    .insert({
      type,
      severity,
      details,
      timestamp: new Date().toISOString(),
      status: 'open'
    });
  
  // Alert security team for high/critical
  if (severity === 'high' || severity === 'critical') {
    await notifySecurityTeam(type, severity, details);
  }
}
```

---

💡 **Remember**: Security is not a feature, it's a requirement. Every line of code should be written with security in mind.

🔗 **Related Documentation**: 
- [Authentication & Authorization](./USER_ROLES_PERMISSIONS.md) for detailed RBAC
- [API Design Standards](./API_DESIGN_STANDARDS.md) for secure API patterns
- [Testing Strategy](./TESTING_STRATEGY.md) for security testing approaches