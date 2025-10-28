# Quick Guide to Push TalentFlow to GitHub

## Step 1: Create Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: **`talentflow`**
3. Description: **`TalentFlow - A Mini Hiring Platform built with React & TypeScript`**
4. Set visibility to **Public**
5. **DO NOT** check "Initialize with README"
6. Click **"Create repository"**

## Step 2: Push Code to GitHub

After creating the repository, run these commands in your terminal:

```bash
cd C:\ENTNT-2\talentflow

# Add all files
git add .

# Commit
git commit -m "Initial commit - TalentFlow hiring platform with jobs, candidates, and assessments management"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/talentflow.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Netlify

### Option A: Deploy via Netlify Website

1. Go to: https://www.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **"Deploy with GitHub"**
4. Choose your `talentflow` repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Click **"Deploy site"**

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## Step 4: Update README.md

After deployment, update the URLs in README.md:

**Current (line 6-7):**
```markdown
**Deployed App:** [View Live](https://talentflow-hiring.vercel.app) *(Deploy after finalization)*  
**GitHub Repository:** [View on GitHub](https://github.com/yourusername/talentflow) *(Setup after finalization)*
```

**Replace with:**
```markdown
**Deployed App:** https://your-talentflow.netlify.app  
**GitHub Repository:** https://github.com/YOUR_USERNAME/talentflow
```

## Your Deliverables Will Be:

1. ✅ **Deployed App Link**: `https://your-talentflow.netlify.app`
2. ✅ **GitHub Repository Link**: `https://github.com/YOUR_USERNAME/talentflow`
3. ✅ **README**: Already complete with setup, architecture, and technical decisions

## That's It! 🎉

Your TalentFlow application will be live and ready for submission!
