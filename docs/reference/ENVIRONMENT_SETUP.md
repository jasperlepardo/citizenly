# Environment Setup Guide

> **Local development environment setup for the Citizenly project**

## 📖 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm 9+
- Git
- VS Code (recommended)

### **Clone & Install**
```bash
git clone https://github.com/your-org/citizenly.git
cd citizenly
npm install
```

### **Environment Variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Database Setup**
```bash
# Using Supabase CLI
npx supabase init
npx supabase start
npx supabase db reset
```

### **Run Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

## 🛠️ VS Code Setup

### **Recommended Extensions**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### **Settings**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 🔧 Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --ext .ts,.tsx",
  "lint:fix": "eslint . --ext .ts,.tsx --fix",
  "type-check": "tsc --noEmit",
  "test": "jest",
  "test:watch": "jest --watch",
  "db:reset": "npx supabase db reset",
  "db:migrate": "npx supabase migration up"
}
```

## 📋 Verification

```bash
# Check installation
npm run type-check
npm run lint
npm test
npm run build
```

🔗 **Related**: [Troubleshooting](./TROUBLESHOOTING.md) | [Development Workflow](./DEVELOPMENT_WORKFLOW.md)