# 🔍 Get Storybook Project ID

To complete the automated deployment setup, you need to get the Storybook project ID.

## Method 1: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find the `citizenly-storybook` project
3. Click on the project name
4. In the URL, you'll see: `https://vercel.com/team-name/project-name/settings`
5. Or go to **Settings** → **General**
6. Copy the **Project ID** from the settings page

## Method 2: Via Terminal (Alternative)

```bash
# Try to get project info directly
vercel projects list --format json 2>/dev/null | grep citizenly-storybook -A 5 -B 5

# Or inspect a deployment
vercel inspect storybook-static-jasper-lepardos-projects.vercel.app
```

## Method 3: Create New Link (If needed)

If the above doesn't work, you can create a temporary Vercel project link:

```bash
# In a temporary directory
mkdir temp-storybook && cd temp-storybook
vercel link
# Select your team and the citizenly-storybook project
cat .vercel/project.json
cd .. && rm -rf temp-storybook
```

## Required GitHub Secrets

Once you have the Storybook project ID, add these to GitHub:

1. Go to: https://github.com/jasperlepardo/citizenly/settings/secrets/actions
2. Add these secrets:

```
VERCEL_TOKEN=<your-vercel-token-from-vercel.com/account/tokens>
VERCEL_ORG_ID=team_ECQY2ysqMz8q0PWlhjmjOzEo
VERCEL_STORYBOOK_PROJECT_ID=<project-id-from-above>
```

## Test Automated Deployment

After adding the secrets:

```bash
# Trigger the workflow manually
gh workflow run deploy-storybook.yml

# Or make a component change
echo "// Trigger deployment" >> src/components/atoms/Button.tsx
git add . && git commit -m "test: trigger Storybook deployment" && git push
```

The automation is ready - just needs the project ID! 🚀
