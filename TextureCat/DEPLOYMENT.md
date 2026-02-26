# GitHub Pages Deployment Guide

## Quick Start

### Option 1: Using GitHub Actions (Recommended)

1. **Create the workflow file:**
   Create `.github/workflows/deploy.yml` in your repository with this content:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: ['main']
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Build
           run: npm run build
           env:
             VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
             VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: ./dist

     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       needs: build
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

2. **Configure GitHub Repository:**
   - Go to your repository on GitHub
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Add these secrets:
     - `VITE_SUPABASE_URL` - Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

3. **Enable GitHub Pages:**
   - Go to **Settings** → **Pages**
   - Under "Build and deployment", select **GitHub Actions** as the source

4. **Deploy:**
   - Push your code to the `main` branch
   - GitHub Actions will automatically build and deploy
   - Your site will be live at `https://yourusername.github.io/repository-name/`

### Option 2: Manual Deployment to gh-pages Branch

1. **Build locally:**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy the dist folder:**
   ```bash
   # Install gh-pages if you haven't already
   npm install -g gh-pages

   # Deploy dist folder to gh-pages branch
   gh-pages -d dist
   ```

3. **Configure GitHub Pages:**
   - Go to **Settings** → **Pages**
   - Under "Build and deployment", select **Deploy from a branch**
   - Select `gh-pages` branch and `/ (root)` folder
   - Click **Save**

### Option 3: Direct Commit to gh-pages Branch

1. **Build locally:**
   ```bash
   npm install
   npm run build
   ```

2. **Push dist to gh-pages:**
   ```bash
   cd dist
   git init
   git add -A
   git commit -m 'Deploy to GitHub Pages'
   git push -f git@github.com:USERNAME/REPO.git main:gh-pages
   cd ..
   ```

3. **Configure GitHub Pages:**
   - Go to **Settings** → **Pages**
   - Select `gh-pages` branch as the source
   - Click **Save**

## Troubleshooting

### White Screen or 404 Error

1. **Check the base path:**
   - The `vite.config.ts` is configured with `base: './'` for relative paths
   - This works for both root domains and subdirectories

2. **Verify GitHub Pages is enabled:**
   - Go to Settings → Pages
   - Make sure a source is selected (either GitHub Actions or gh-pages branch)
   - Wait a few minutes for deployment to complete

3. **Check the Console:**
   - Open browser DevTools (F12)
   - Look for errors in the Console tab
   - Check if assets are loading correctly

4. **Verify Environment Variables:**
   - Make sure your Supabase credentials are set correctly
   - For GitHub Actions, add them as repository secrets
   - For local builds, use a `.env` file

### Assets Not Loading

- Ensure `.nojekyll` file exists in the dist folder (automatically added during build)
- Check that all asset paths are relative (`./assets/...` not `/assets/...`)
- Verify the build completed successfully without errors

## Important Notes

- The build is configured with relative paths for maximum compatibility
- `.nojekyll` file prevents GitHub Pages from processing with Jekyll
- Environment variables must be configured for Supabase to work
- The site will work on any subdirectory or custom domain
