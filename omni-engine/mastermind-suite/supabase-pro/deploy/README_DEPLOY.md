# 🚀 THE DEPLOYMENT PIPE (How to Ship)

Since you have all the backend logic, this is how you actually put it in the hands of users.

### 1. The Frontend (Next.js)
The code in `supabase-pro/frontend` is a Next.js app. 
- **Action**: Connect this folder to **Vercel** or **Netlify**.
- **Result**: Your HUD (`/mastermind-nexus`) becomes a live website.

### 2. The Edge (Supabase)
The logic in `supabase-pro/supabase/functions` handles the "Bridge".
- **Action**: Install the Supabase CLI and run `supabase link` and `supabase functions deploy`.
- **Result**: Your frontend can now securely trigger your Python agents via HTTP.

### 3. The Automation (GitHub Actions)
The file `.github/workflows/deploy.yml` is the "Silent Robot".
- **Action**: Every time you `git push`, this script runs the Mastermind Security Audit and then pushes the update to production.
- **Result**: You never have to manually deploy again.

### 4. The Artifacts (Zenith Capsule)
- **Action**: Run `./ship_it.sh` locally to ensure your `MICROWAVE_BUNDLE` is synced before a push.
