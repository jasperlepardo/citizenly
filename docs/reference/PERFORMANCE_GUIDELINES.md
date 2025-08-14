# Performance Guidelines

> **Optimization patterns and best practices for the Citizenly project**

## 📖 Core Principles

- **Measure First**: Profile before optimizing
- **User-Centric**: Optimize perceived performance
- **Progressive**: Start fast, enhance progressively
- **Efficient**: Minimize resource usage

## 🎯 Performance Targets

| Metric | Target | Max |
|--------|--------|-----|
| First Contentful Paint | < 1.0s | 2.5s |
| Time to Interactive | < 2.0s | 3.8s |
| Cumulative Layout Shift | < 0.1 | 0.25 |
| API Response Time | < 200ms | 500ms |
| Database Query Time | < 50ms | 200ms |

## 🚀 Frontend Optimization

### **React Performance**
```typescript
// ✅ Memoize expensive calculations
const expensiveValue = useMemo(() => 
  calculateComplexValue(data), [data]
);

// ✅ Prevent unnecessary re-renders
const MemoizedComponent = memo(Component, (prev, next) => 
  prev.id === next.id
);

// ✅ Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ Virtualize long lists
import { FixedSizeList } from 'react-window';
```

### **Next.js Optimization**
```typescript
// ✅ Use Image optimization
import Image from 'next/image';

// ✅ Static generation when possible
export async function generateStaticParams() {
  return paths;
}

// ✅ Streaming SSR
import { Suspense } from 'react';
```

### **Bundle Optimization**
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
}
```

## 🗄️ Database Optimization

### **Query Optimization**
```sql
-- ✅ Use indexes
CREATE INDEX idx_residents_barangay ON residents(barangay_code);
CREATE INDEX idx_residents_search ON residents(last_name, first_name);

-- ✅ Use views for complex queries
CREATE VIEW api_residents_summary AS
SELECT /* optimized columns */ FROM residents;

-- ✅ Limit results
SELECT * FROM residents LIMIT 20;

-- ✅ Use EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM residents WHERE barangay_code = '123';
```

### **Supabase RLS**
```sql
-- ✅ Efficient policies
CREATE POLICY "efficient_check" ON residents
USING (barangay_code = auth.jwt() ->> 'barangay_code');
```

## 🌐 API Optimization

### **Response Optimization**
```typescript
// ✅ Pagination
const page = parseInt(searchParams.get('page') || '1');
const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

// ✅ Select only needed fields
const residents = await db
  .from('residents')
  .select('id, first_name, last_name')
  .range((page - 1) * limit, page * limit - 1);

// ✅ Caching headers
return new Response(JSON.stringify(data), {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
  }
});
```

## 📊 Monitoring

### **Web Vitals**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to analytics endpoint
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### **Performance Monitoring**
```typescript
// Track API performance
const start = performance.now();
const response = await fetch('/api/residents');
const duration = performance.now() - start;

if (duration > 1000) {
  console.warn(`Slow API call: ${duration}ms`);
}
```

## ⚡ Quick Wins

1. **Enable compression**: Already in Next.js
2. **Optimize images**: Use next/image
3. **Remove unused CSS**: PurgeCSS with Tailwind
4. **Code split**: Dynamic imports
5. **Prefetch links**: Use next/link
6. **Cache API responses**: Use SWR or React Query
7. **Minimize JavaScript**: Tree shaking
8. **Use CDN**: Vercel Edge Network

## 🔧 Tools

- **Lighthouse**: Chrome DevTools
- **Bundle Analyzer**: `npm run analyze`
- **React DevTools Profiler**: Component performance
- **Vercel Analytics**: Production metrics

🔗 **Related**: [Architecture Overview](./ARCHITECTURE_OVERVIEW.md) | [API Design Standards](./API_DESIGN_STANDARDS.md)