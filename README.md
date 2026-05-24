# RFM Customer Analytics — Deployment

This repository contains the RFM analysis pipeline and generated visualizations.

Quick steps to host the generated reports on Vercel (static site):

1. Prepare the `public/` folder locally (copies generated HTML/PNG/TXT/CSV files):

```bash
source .venv/bin/activate
python scripts/prepare_public.py
```

2. Initialize a GitHub repository (if you haven't) and push this code:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

3. Deploy on Vercel:
  - Go to https://vercel.com/import and import your GitHub repo.
  - Set the **Framework Preset** to **Other** (no framework).
  - Set the **Build Command** to: `python scripts/prepare_public.py`
  - Set the **Output Directory** to: `public`
  - Deploy. Vercel will run the build command, copy artifacts into `public/` and serve the static files.

Notes:
- This approach serves the generated dashboards and reports as a static site.
- If you want a live web app to accept CSV uploads and run the pipeline on-demand, you should
  deploy a Python web backend (e.g. on Render, Railway, or Fly) because Streamlit and long-running
  Python servers are not a good fit for Vercel's serverless model.
