# Backup & Recovery

> **Database backup and disaster recovery procedures for the Citizenly project**

## 📖 Backup Strategy

### **Backup Types**
- **Automated**: Daily snapshots by Supabase
- **Manual**: Before major deployments
- **Continuous**: Point-in-time recovery (PITR)

### **Backup Schedule**
| Type | Frequency | Retention |
|------|-----------|-----------|
| Daily Snapshots | Every 24h | 30 days |
| Weekly Archives | Sunday 2AM | 12 weeks |
| Monthly Archives | 1st of month | 12 months |
| Pre-deployment | Manual | 7 days |

## 🔄 Automated Backups

### **Supabase Backups**
```bash
# Supabase automatically handles:
- Daily backups (Pro plan)
- Point-in-time recovery (Pro plan)
- 30-day retention
- Encrypted storage
```

### **Manual Backup Script**
```bash
#!/bin/bash
# scripts/backup-database.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Upload to storage
aws s3 cp ${BACKUP_FILE}.gz s3://backups/database/

# Clean old local backups
find ./backups -name "*.gz" -mtime +7 -delete

echo "✅ Backup completed: ${BACKUP_FILE}.gz"
```

## 🚨 Recovery Procedures

### **Quick Recovery (< 1 hour old)**
```bash
# 1. Use Supabase Dashboard
# Dashboard > Database > Backups > Restore

# 2. Or via CLI
supabase db restore --backup-id <backup-id>
```

### **Point-in-Time Recovery**
```sql
-- Restore to specific timestamp
supabase db restore --pitr "2024-01-15 14:30:00"
```

### **Manual Recovery**
```bash
# 1. Download backup
aws s3 cp s3://backups/database/backup_20240115.sql.gz .

# 2. Decompress
gunzip backup_20240115.sql.gz

# 3. Restore
psql $DATABASE_URL < backup_20240115.sql
```

## 📋 Pre-Deployment Backup

### **Deployment Backup Script**
```typescript
// scripts/pre-deploy-backup.ts
async function createDeploymentBackup() {
  const timestamp = new Date().toISOString();
  
  // 1. Create backup
  console.log('📦 Creating backup...');
  const backupId = await supabase.createBackup({
    name: `deploy-${timestamp}`,
    description: `Pre-deployment backup for ${process.env.DEPLOY_VERSION}`
  });
  
  // 2. Verify backup
  console.log('✅ Verifying backup...');
  const backup = await supabase.getBackup(backupId);
  
  if (backup.status !== 'completed') {
    throw new Error('Backup failed');
  }
  
  // 3. Tag backup
  await tagBackup(backupId, {
    type: 'pre-deployment',
    version: process.env.DEPLOY_VERSION,
    timestamp
  });
  
  console.log(`✅ Backup created: ${backupId}`);
  return backupId;
}
```

## 🔁 Rollback Procedures

### **Application Rollback**
```bash
# 1. Stop traffic
npm run maintenance:enable

# 2. Rollback database
supabase db restore --backup-id <pre-deploy-backup>

# 3. Rollback application
vercel rollback <deployment-url>

# 4. Verify
npm run health-check

# 5. Resume traffic
npm run maintenance:disable
```

### **Data-Only Rollback**
```sql
-- Restore specific tables
BEGIN;
  -- Restore residents table
  TRUNCATE residents CASCADE;
  COPY residents FROM '/backup/residents_20240115.csv';
  
  -- Restore households table
  TRUNCATE households CASCADE;
  COPY households FROM '/backup/households_20240115.csv';
COMMIT;
```

## 🛡️ Disaster Recovery

### **Recovery Time Objectives**
| Scenario | RTO | RPO |
|----------|-----|-----|
| Hardware failure | 1 hour | 1 hour |
| Data corruption | 2 hours | 24 hours |
| Region failure | 4 hours | 1 hour |
| Complete disaster | 24 hours | 24 hours |

### **DR Procedures**
```markdown
## Level 1: Minor Issue
1. Identify affected data
2. Restore from latest snapshot
3. Verify data integrity
4. Resume operations

## Level 2: Major Outage
1. Activate incident response
2. Switch to backup region
3. Restore from geo-replicated backup
4. Verify all services
5. Communicate with users

## Level 3: Complete Disaster
1. Activate DR plan
2. Provision new infrastructure
3. Restore from offsite backups
4. Rebuild configuration
5. Extensive testing
6. Gradual traffic migration
```

## 🧪 Backup Testing

### **Monthly Backup Test**
```bash
#!/bin/bash
# scripts/test-backup-recovery.sh

# 1. Create test database
createdb test_recovery

# 2. Restore backup
pg_restore -d test_recovery latest_backup.dump

# 3. Run integrity checks
psql test_recovery -c "SELECT COUNT(*) FROM residents;"
psql test_recovery -c "SELECT COUNT(*) FROM households;"

# 4. Clean up
dropdb test_recovery

echo "✅ Backup test completed successfully"
```

## 📊 Backup Monitoring

### **Backup Health Check**
```typescript
// Monitor backup status
async function monitorBackups() {
  const backups = await supabase.listBackups();
  const latestBackup = backups[0];
  
  const hoursSinceBackup = 
    (Date.now() - latestBackup.created_at) / (1000 * 60 * 60);
  
  if (hoursSinceBackup > 25) {
    alert('No backup in last 25 hours!');
  }
  
  return {
    lastBackup: latestBackup.created_at,
    backupCount: backups.length,
    oldestBackup: backups[backups.length - 1].created_at
  };
}
```

## 🔐 Security Considerations

1. **Encryption**: All backups encrypted at rest
2. **Access Control**: Limited to authorized personnel
3. **Audit Trail**: Log all backup/restore operations
4. **Testing**: Regular recovery drills
5. **Offsite Storage**: Geographic redundancy

## 📝 Backup Checklist

### **Daily**
- [ ] Verify automated backup completed
- [ ] Check backup size and duration
- [ ] Monitor storage usage

### **Weekly**
- [ ] Test restore procedure
- [ ] Review backup logs
- [ ] Clean old backups

### **Monthly**
- [ ] Full recovery drill
- [ ] Update documentation
- [ ] Review retention policy

🔗 **Related**: [Deployment Guide](./DEPLOYMENT_GUIDE.md) | [Monitoring Setup](./MONITORING_SETUP.md)