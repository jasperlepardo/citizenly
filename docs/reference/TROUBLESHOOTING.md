# Troubleshooting Guide

> **Common issues and solutions for the Citizenly project**
> 
> This document provides solutions to frequently encountered problems during development, deployment, and operation of the Citizenly platform.

## 📖 Table of Contents

1. [🚀 Setup Issues](#-setup-issues)
2. [🔐 Authentication Problems](#-authentication-problems)
3. [🗄️ Database Issues](#️-database-issues)
4. [🌐 API Errors](#-api-errors)
5. [🎨 Frontend Issues](#-frontend-issues)
6. [🚢 Deployment Problems](#-deployment-problems)
7. [⚡ Performance Issues](#-performance-issues)
8. [🧪 Testing Problems](#-testing-problems)
9. [🔧 Development Tools](#-development-tools)
10. [📱 Common Error Messages](#-common-error-messages)

---

## 🚀 Setup Issues

### **Problem: npm install fails**
```bash
Error: ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
rm -rf node_modules package-lock.json

# Reinstall with legacy peer deps
npm install --legacy-peer-deps

# Or use exact versions
npm ci
```

### **Problem: Environment variables not loading**
```
Error: Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL
```

**Solution:**
```bash
# 1. Create .env.local file
cp .env.example .env.local

# 2. Fill in required variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# 3. Restart dev server
npm run dev
```

### **Problem: Port 3000 already in use**
```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

---

## 🔐 Authentication Problems

### **Problem: User can't log in**
```
Error: Invalid login credentials
```

**Troubleshooting Steps:**
```typescript
// 1. Check Supabase connection
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
console.log('Auth error:', error);

// 2. Verify user exists
const { data: user } = await supabase
  .from('auth_user_profiles')
  .select('*')
  .eq('email', email)
  .single();

// 3. Check user confirmation status
SELECT email_confirmed_at FROM auth.users WHERE email = 'user@example.com';

// 4. Reset password if needed
await supabase.auth.resetPasswordForEmail(email);
```

### **Problem: Session expired unexpectedly**
```
Error: JWT expired
```

**Solution:**
```typescript
// Update session refresh settings
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Manual refresh
const { data: { session }, error } = await supabase.auth.refreshSession();
```

### **Problem: OAuth login not working**
```
Error: Redirect URI mismatch
```

**Solution:**
```bash
# 1. Check Supabase OAuth settings
# Dashboard > Authentication > Providers

# 2. Add correct redirect URLs
http://localhost:3000/auth/callback  # Development
https://yourapp.vercel.app/auth/callback  # Production

# 3. Update environment variables
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🗄️ Database Issues

### **Problem: Database connection refused**
```
Error: ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# 1. Check if database is running
docker ps | grep postgres

# 2. Start database if needed
docker-compose up -d postgres

# 3. Check connection string
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# 4. For Supabase local
npx supabase start
```

### **Problem: Migration failed**
```
Error: Migration 20240115_create_table.sql failed
```

**Solution:**
```bash
# 1. Check migration status
npx supabase migration list

# 2. Rollback if needed
npx supabase migration rollback

# 3. Fix migration file and retry
npx supabase migration up

# 4. Reset database if necessary
npx supabase db reset
```

### **Problem: RLS policy blocking access**
```
Error: new row violates row-level security policy
```

**Solution:**
```sql
-- 1. Check current policies
SELECT * FROM pg_policies WHERE tablename = 'residents';

-- 2. Temporarily disable RLS for debugging
ALTER TABLE residents DISABLE ROW LEVEL SECURITY;

-- 3. Fix policy
DROP POLICY IF EXISTS "barangay_isolation" ON residents;
CREATE POLICY "barangay_isolation" ON residents
FOR ALL USING (
  barangay_code = get_user_barangay_code()
);

-- 4. Re-enable RLS
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
```

---

## 🌐 API Errors

### **Problem: API returns 401 Unauthorized**
```json
{ "error": "Authentication required" }
```

**Solution:**
```typescript
// 1. Check if token is being sent
const response = await fetch('/api/residents', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});

// 2. Verify token in API route
export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// 3. Check middleware configuration
export const config = {
  matcher: ['/api/residents/:path*']
};
```

### **Problem: CORS error**
```
Access to fetch at 'api/residents' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
```typescript
// Add CORS headers to API route
export async function GET(request: Request) {
  const response = Response.json({ data: [] });
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

// Or use middleware
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

---

## 🎨 Frontend Issues

### **Problem: Hydration mismatch**
```
Error: Hydration failed because the initial UI does not match what was rendered on the server
```

**Solution:**
```typescript
// 1. Ensure consistent rendering
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;

// 2. Use suppressHydrationWarning for dynamic content
<div suppressHydrationWarning>
  {new Date().toLocaleString()}
</div>

// 3. Move client-only code to useEffect
useEffect(() => {
  // Client-only code here
  window.localStorage.getItem('theme');
}, []);
```

### **Problem: Component not rendering**
```
Warning: Cannot update a component while rendering a different component
```

**Solution:**
```typescript
// 1. Move state updates to useEffect
useEffect(() => {
  setState(newValue); // Don't do this during render
}, [dependency]);

// 2. Use useCallback for event handlers
const handleClick = useCallback(() => {
  setState(value);
}, [value]);

// 3. Check for infinite loops
useEffect(() => {
  fetchData();
}, []); // Add dependencies or empty array
```

### **Problem: Tailwind classes not working**
```
CSS classes not applying to components
```

**Solution:**
```javascript
// 1. Check tailwind.config.js
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  // ...
}

// 2. Don't use dynamic class names
// ❌ Wrong
const color = 'red';
<div className={`text-${color}-500`} />

// ✅ Correct
<div className={color === 'red' ? 'text-red-500' : 'text-blue-500'} />

// 3. Clear build cache
rm -rf .next
npm run dev
```

---

## 🚢 Deployment Problems

### **Problem: Build fails on Vercel**
```
Error: Build failed with exit code 1
```

**Solution:**
```bash
# 1. Check build locally
npm run build

# 2. Ensure all env variables are set in Vercel
# Dashboard > Settings > Environment Variables

# 3. Check Node version
# package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}

# 4. Clear cache and rebuild
vercel --force
```

### **Problem: API routes return 500 in production**
```
Error: Internal Server Error
```

**Solution:**
```typescript
// 1. Add error handling
export async function GET(request: Request) {
  try {
    // Your code
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// 2. Check environment variables
console.log('Env check:', {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});

// 3. Enable Vercel logs
// Dashboard > Functions > Logs
```

---

## ⚡ Performance Issues

### **Problem: Slow page load**
```
First Contentful Paint > 3s
```

**Solution:**
```typescript
// 1. Optimize images
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>

// 2. Code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
});

// 3. Optimize bundle
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  compress: true,
}

// 4. Analyze bundle
npm run analyze
```

### **Problem: Database queries slow**
```
Query execution time > 1000ms
```

**Solution:**
```sql
-- 1. Add indexes
CREATE INDEX idx_residents_barangay ON residents(barangay_code);
CREATE INDEX idx_residents_name ON residents(last_name, first_name);

-- 2. Optimize queries
-- ❌ Slow
SELECT * FROM residents r
JOIN households h ON r.household_id = h.id
JOIN psgc_barangays b ON r.barangay_code = b.code;

-- ✅ Fast (with specific columns)
SELECT r.id, r.first_name, r.last_name, h.address
FROM residents r
JOIN households h ON r.household_id = h.id
WHERE r.barangay_code = '123456';

-- 3. Use database views
CREATE VIEW api_residents_summary AS
SELECT /* optimized query */;

-- 4. Analyze query
EXPLAIN ANALYZE SELECT * FROM residents;
```

---

## 🧪 Testing Problems

### **Problem: Tests failing with module not found**
```
Cannot find module '@/components/Button'
```

**Solution:**
```javascript
// jest.config.js
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

### **Problem: Async test timeout**
```
Timeout - Async callback was not invoked within 5000ms
```

**Solution:**
```typescript
// 1. Increase timeout
test('async operation', async () => {
  // Test code
}, 10000);

// 2. Use proper async/await
test('fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// 3. Mock external calls
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        data: mockData
      }))
    }))
  }))
}));
```

---

## 🔧 Development Tools

### **ESLint errors**
```bash
# Fix all auto-fixable issues
npm run lint:fix

# Ignore specific rule
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unused = 'variable';

# Update .eslintrc.json for project-wide rules
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```

### **TypeScript errors**
```bash
# Check types
npm run type-check

# Ignore type error
// @ts-ignore
problemCode();

# Better: Fix the type
interface Props {
  name?: string;
}

# Clear TypeScript cache
rm -rf node_modules/.cache/typescript
```

### **Git issues**
```bash
# Merge conflicts
git status
# Edit conflicted files
git add .
git commit -m "Resolve merge conflicts"

# Undo last commit
git reset --soft HEAD~1

# Clean working directory
git clean -fd
git checkout .
```

---

## 📱 Common Error Messages

### **Quick Reference Table**

| Error | Cause | Solution |
|-------|-------|----------|
| `ENOENT: no such file or directory` | File missing | Check file path, run `npm install` |
| `Module not found` | Import error | Check import path, install package |
| `Unexpected token '<'` | HTML returned instead of JSON | Check API endpoint URL |
| `Network request failed` | Connection issue | Check internet, API status |
| `Invalid hook call` | React hooks misuse | Check hooks rules, component type |
| `Maximum update depth exceeded` | Infinite loop | Check useEffect dependencies |
| `NEXT_NOT_FOUND` | Page doesn't exist | Check routing, file location |
| `Failed to compile` | Syntax error | Check error location, fix syntax |

---

## 🆘 Getting Help

### **Debug Steps**
1. **Check browser console** for client errors
2. **Check terminal** for server errors
3. **Check network tab** for API issues
4. **Enable debug mode**: `DEBUG=* npm run dev`
5. **Check Vercel logs** for production issues

### **Useful Commands**
```bash
# Clear all caches
rm -rf .next node_modules package-lock.json
npm install
npm run dev

# Reset database
npx supabase db reset

# Check system info
npx envinfo --system --browsers --npmPackages

# Run diagnostics
npm run doctor
```

### **Support Channels**
- GitHub Issues: Report bugs
- Discord: Community help
- Stack Overflow: Tag with `nextjs`, `supabase`
- Documentation: Check official docs

---

💡 **Remember**: Most issues have been encountered before. Check error messages carefully, search for solutions, and don't hesitate to ask for help.

🔗 **Related Documentation**: 
- [Environment Setup](./ENVIRONMENT_SETUP.md) for initial configuration
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) for development process
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) for deployment issues