# Project Instructions for Claude

## MANDATORY ACTIONS

### ALWAYS Do This First

1. **ALWAYS** check database/schema.sql before any database work
2. **ALWAYS** read CODING_STANDARDS.md + NAMING_CONVENTIONS.md before writing code
3. **ALWAYS** explain your plan before executing SQL scripts
4. **ALWAYS** use docs/reference/NAMING_CONVENTIONS.md for all naming decisions

### NEVER Do This

- Don't create new files unless absolutely necessary
- Don't skip reading standards before coding
- Don't guess at naming conventions
- Don't execute SQL without explaining the plan first

## INSTRUCTION MATRIX

### When User Says "Create/Build/Implement..."

**API Endpoint:**

1. READ: docs/reference/API_DESIGN_STANDARDS.md
2. READ: docs/reference/API_USAGE_EXAMPLES.md
3. READ: docs/reference/SECURITY_GUIDELINES.md
4. THEN: Implement following those patterns

**React Component:**

1. READ: docs/reference/COMPONENT_LIBRARY.md
2. READ: docs/reference/CODING_STANDARDS.md
3. READ: docs/reference/DESIGN_REFERENCE.md
4. THEN: Build component using existing patterns

**Database Schema/Migration:**

1. READ: database/schema.sql
2. READ: docs/reference/DATABASE_SCHEMA_DOCUMENTATION.md
3. READ: docs/reference/SCHEMA_MIGRATION_MATRIX.md
4. EXPLAIN: Migration plan before executing
5. THEN: Implement migration

**Any Code:**

1. READ: docs/reference/CODING_STANDARDS.md
2. READ: docs/reference/NAMING_CONVENTIONS.md
3. THEN: Write code following standards

### When User Says "Fix/Debug/Troubleshoot..."

**Code Issues:**

1. READ: docs/reference/TROUBLESHOOTING.md
2. READ: relevant domain docs if needed
3. THEN: Diagnose and fix

**Performance Issues:**

1. READ: docs/reference/PERFORMANCE_GUIDELINES.md
2. READ: docs/reference/DATABASE_SCHEMA_DOCUMENTATION.md
3. THEN: Optimize

**Deployment Issues:**

1. READ: docs/reference/DEPLOYMENT_GUIDE.md
2. READ: docs/reference/MONITORING_SETUP.md
3. THEN: Resolve

### When User Says "How to/Explain/Understand..."

**System Architecture:**

1. READ: docs/reference/ARCHITECTURE_OVERVIEW.md
2. THEN: Explain based on current implementation

**Barangay/Domain Knowledge:**

1. READ: docs/reference/BARANGAY_SYSTEM_GUIDE.md
2. READ: docs/reference/USER_ROLES_PERMISSIONS.md
3. THEN: Explain in context

**Process Questions:**

1. READ: docs/reference/DEVELOPMENT_WORKFLOW.md
2. READ: docs/reference/GIT_WORKFLOW_CONVENTIONS.md
3. THEN: Explain the process

## TASK-SPECIFIC COMMANDS

### Database Work

```
BEFORE any database task:
1. Read database/schema.sql
2. Read docs/reference/DATABASE_SCHEMA_DOCUMENTATION.md
3. If migration needed: Read docs/reference/SCHEMA_MIGRATION_MATRIX.md
4. EXPLAIN your plan before executing
```

### API Development

```
BEFORE building any API:
1. Read docs/reference/API_DESIGN_STANDARDS.md
2. Read docs/reference/API_USAGE_EXAMPLES.md
3. Read docs/reference/SECURITY_GUIDELINES.md
4. Follow established patterns exactly
```

### Component Development

```
BEFORE building any component:
1. Read docs/reference/COMPONENT_LIBRARY.md
2. Check if component already exists
3. Read docs/reference/CODING_STANDARDS.md
4. Use existing design tokens and patterns
```

### Code Review/Quality

```
BEFORE reviewing or improving code:
1. Read docs/reference/CODE_REVIEW_GUIDELINES.md
2. Read docs/reference/CODING_STANDARDS.md
3. Check against NAMING_CONVENTIONS.md
4. Verify tests exist per TESTING_STRATEGY.md
```

## DECISION FLOWCHART

**User Request → Assessment:**

1. Is it new code? → Read CODING_STANDARDS.md + NAMING_CONVENTIONS.md first
2. Is it database? → Read schema.sql + DATABASE_SCHEMA_DOCUMENTATION.md first
3. Is it API? → Read API_DESIGN_STANDARDS.md + API_USAGE_EXAMPLES.md first
4. Is it component? → Read COMPONENT_LIBRARY.md first
5. Is it domain-specific? → Read BARANGAY_SYSTEM_GUIDE.md + USER_ROLES_PERMISSIONS.md first
6. Is it process? → Read DEVELOPMENT_WORKFLOW.md first
7. Is it troubleshooting? → Read TROUBLESHOOTING.md first

**Remember: READ FIRST, CODE SECOND**
