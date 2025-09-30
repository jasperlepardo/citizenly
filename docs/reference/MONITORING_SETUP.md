# Monitoring Setup

> **Logging, analytics, and observability for the Citizenly project**

## 📖 Monitoring Stack

- **Analytics**: Vercel Analytics
- **Error Tracking**: Sentry (optional)
- **Logging**: Console + Structured logs
- **Database Monitoring**: Supabase Dashboard
- **Uptime**: Better Uptime / Pingdom

## 📊 Application Monitoring

### **Vercel Analytics Setup**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### **Custom Analytics Events**
```typescript
// lib/analytics.ts
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  // Vercel Analytics
  if (window.va) {
    window.va('track', eventName, properties);
  }
  
  // Console in dev
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Event:', eventName, properties);
  }
}

// Usage
trackEvent('resident_created', { barangay: '123456' });
trackEvent('clearance_issued', { type: 'barangay_clearance' });
```

## 📝 Logging Strategy

### **Structured Logging**
```typescript
// lib/logger.ts
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

class Logger {
  private context: string;
  
  constructor(context: string) {
    this.context = context;
  }
  
  private log(level: LogLevel, message: string, data?: any) {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      data,
      environment: process.env.NODE_ENV
    };
    
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service
      this.sendToLoggingService(log);
    } else {
      console[level](log);
    }
  }
  
  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }
  
  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }
  
  error(message: string, error?: any) {
    this.log(LogLevel.ERROR, message, {
      error: error?.message,
      stack: error?.stack
    });
  }
}

// Usage
const logger = new Logger('ResidentAPI');
logger.info('Resident created', { id: '123' });
logger.error('Failed to create resident', error);
```

## 🚨 Error Tracking

### **Error Boundary**
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error tracking service
    console.error('Application error:', error);
    trackEvent('error_boundary', {
      message: error.message,
      stack: error.stack
    });
  }, [error]);
  
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### **API Error Tracking**
```typescript
// middleware/errorTracking.ts
export async function trackApiError(
  request: Request,
  error: any
) {
  const errorData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers),
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };
  
  // Log locally
  console.error('API Error:', errorData);
  
  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    await sendToMonitoring(errorData);
  }
}
```

## 📈 Performance Monitoring

### **Web Vitals Tracking**
```typescript
// app/components/WebVitals.tsx
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    const vitals = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id
    };
    
    // Send to analytics
    trackEvent('web_vitals', vitals);
    
    // Alert on poor performance
    if (metric.rating === 'poor') {
      console.warn('Poor web vital:', vitals);
    }
  });
  
  return null;
}
```

## 🗄️ Database Monitoring

### **Query Performance**
```sql
-- Monitor slow queries
CREATE OR REPLACE FUNCTION log_slow_queries()
RETURNS event_trigger AS $$
DECLARE
  query_duration interval;
BEGIN
  -- Log queries taking > 1 second
  IF current_query_duration() > interval '1 second' THEN
    INSERT INTO query_logs (
      query_text,
      duration,
      timestamp
    ) VALUES (
      current_query(),
      current_query_duration(),
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### **Connection Monitoring**
```typescript
// lib/db/monitoring.ts
let activeConnections = 0;
const maxConnections = 20;

export async function monitorConnection<T>(
  operation: () => Promise<T>
): Promise<T> {
  activeConnections++;
  
  if (activeConnections > maxConnections * 0.8) {
    logger.warn('High database connection usage', {
      active: activeConnections,
      max: maxConnections
    });
  }
  
  try {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    
    if (duration > 1000) {
      logger.warn('Slow database operation', { duration });
    }
    
    return result;
  } finally {
    activeConnections--;
  }
}
```

## 📱 Health Checks

### **Health Endpoint**
```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    app: 'healthy',
    database: await checkDatabase(),
    supabase: await checkSupabase(),
    timestamp: new Date().toISOString()
  };
  
  const isHealthy = Object.values(checks)
    .every(status => status === 'healthy');
  
  return Response.json(
    checks,
    { status: isHealthy ? 200 : 503 }
  );
}

async function checkDatabase() {
  try {
    await db.raw('SELECT 1');
    return 'healthy';
  } catch {
    return 'unhealthy';
  }
}
```

## 📊 Dashboards

### **Metrics to Track**
```typescript
interface MetricsDashboard {
  // Application Metrics
  activeUsers: number;
  requestsPerMinute: number;
  errorRate: number;
  avgResponseTime: number;
  
  // Business Metrics
  residentsCreated: number;
  clearancesIssued: number;
  activeBarangays: number;
  
  // Infrastructure
  cpuUsage: number;
  memoryUsage: number;
  databaseConnections: number;
  diskUsage: number;
}
```

## 🔔 Alerting

### **Alert Rules**
```yaml
alerts:
  - name: high_error_rate
    condition: error_rate > 5%
    duration: 5m
    severity: warning
    
  - name: database_down
    condition: database_health != healthy
    duration: 1m
    severity: critical
    
  - name: slow_response
    condition: p95_response_time > 2000ms
    duration: 10m
    severity: warning
```

## 🛠️ Tools Integration

### **Environment Variables**
```env
# Monitoring Services
SENTRY_DSN=https://your-dsn@sentry.io/project
LOGTAIL_TOKEN=your-logtail-token
DATADOG_API_KEY=your-datadog-key
NEW_RELIC_LICENSE_KEY=your-newrelic-key
```

🔗 **Related**: [Performance Guidelines](./PERFORMANCE_GUIDELINES.md) | [Troubleshooting](./TROUBLESHOOTING.md)