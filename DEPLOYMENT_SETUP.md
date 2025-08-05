# 🚀 Automated Deployment Setup Guide

This guide will help you complete the automated deployment setup for both your main app and Storybook.

## 📋 Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. Go to GitHub Repository Settings

- Navigate to: **Settings** → **Secrets and variables** → **Actions**
- Click **"New repository secret"**

### 2. Add Required Secrets

#### VERCEL_TOKEN

```
Name: VERCEL_TOKEN
Value: <your-vercel-token>
```

**How to get your Vercel token:**

1. Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Give it a name like "GitHub Actions"
4. Set scope to your team/account
5. Copy the generated token

#### VERCEL_ORG_ID

```
Name: VERCEL_ORG_ID
Value: team_ECQY2ysqMz8q0PWlhjmjOzEo
```

#### VERCEL_STORYBOOK_PROJECT_ID

```
Name: VERCEL_STORYBOOK_PROJECT_ID
Value: <storybook-project-id>
```

**How to get Storybook project ID:**

1. In your terminal, run: `vercel switch citizenly-storybook`
2. Run: `cat .vercel/project.json`
3. Copy the `projectId` value
4. Switch back: `vercel switch citizenly`

## 🔧 Complete Setup Process

### Step 1: Create Vercel Token

```bash
# 1. Visit https://vercel.com/account/tokens
# 2. Create new token with full access
# 3. Copy the token (starts with "vercel_token_...")
```

### Step 2: Get Storybook Project ID

```bash
# Temporarily switch to storybook project
vercel switch citizenly-storybook

# Get the project ID
cat .vercel/project.json
# Copy the "projectId" value

# Switch back to main project
vercel switch citizenly
```

### Step 3: Add GitHub Secrets

1. Go to your GitHub repo: https://github.com/jasperlepardo/citizenly
2. Navigate: **Settings** → **Secrets and variables** → **Actions**
3. Add each secret:
   - `VERCEL_TOKEN` = your token from Step 1
   - `VERCEL_ORG_ID` = `team_ECQY2ysqMz8q0PWlhjmjOzEo`
   - `VERCEL_STORYBOOK_PROJECT_ID` = project ID from Step 2

### Step 4: Test the Setup

```bash
# Commit and push these deployment configurations
git add .
git commit -m "feat: add automated Storybook deployment configuration"
git push

# Check if the workflow runs
gh workflow list
gh workflow run deploy-storybook.yml
```

## 🎯 What Happens After Setup

### Automatic Deployments

- **Main App**: Deploys to https://www.citizenly.co on push to `main`
- **Storybook**: Deploys automatically when components change
- **PR Previews**: Storybook previews created for each PR

### Workflow Triggers

The Storybook deployment will run when:

- Components are modified (`src/components/**`)
- Stories are updated (`src/stories/**`)
- Storybook config changes (`.storybook/**`)
- Dependencies change (`package.json`)
- Manual workflow dispatch

### PR Integration

- Automatic Storybook preview deployment
- Comment on PR with preview link
- Updates on each new commit

## 🧪 Testing the Setup

### 1. Manual Workflow Trigger

```bash
# Test the deployment workflow
gh workflow run deploy-storybook.yml
```

### 2. Component Change Test

```bash
# Make a small change to any component
echo "// Test change" >> src/components/atoms/Button.tsx

# Commit and push
git add .
git commit -m "test: trigger Storybook deployment"
git push
```

### 3. Monitor Deployments

- **GitHub Actions**: https://github.com/jasperlepardo/citizenly/actions
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Storybook URL**: https://storybook-static-jasper-lepardos-projects.vercel.app

## 🔍 Troubleshooting

### Common Issues

**1. Workflow fails with "secrets not found"**

- Double-check all three secrets are added correctly
- Verify secret names match exactly (case-sensitive)

**2. Vercel deployment fails**

- Check your Vercel token has correct permissions
- Verify organization ID is correct
- Ensure Storybook project ID is from the right project

**3. Build failures**

- Test locally: `npm run build-storybook`
- Check for missing dependencies
- Verify Storybook configuration

### Debug Commands

```bash
# Check current setup
npm run deploy:status

# Test configurations
npm run deploy:test

# Manual Storybook deployment
npm run deploy:storybook
```

## 📈 Success Indicators

✅ **Setup Complete When:**

- GitHub Actions workflow runs without errors
- Storybook deploys successfully
- PR comments appear with preview links
- Both sites accessible at their URLs

✅ **URLs to Verify:**

- Main app: https://www.citizenly.co
- Storybook: https://storybook-static-jasper-lepardos-projects.vercel.app

## 🎉 Next Steps

Once setup is complete:

1. Make component changes to test auto-deployment
2. Create a PR to test preview functionality
3. Monitor deployment status in GitHub Actions
4. Share Storybook URL with your team for component library access

Your automated deployment pipeline will be fully operational! 🚀
