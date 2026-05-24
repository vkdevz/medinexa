#!/usr/bin/env python3
"""Prepare `public/` folder by copying the latest artifacts from data/.

Usage:
  python scripts/prepare_public.py

This copies generated HTML dashboards, images and reports into `public/`
so they can be deployed as a static site (e.g., Vercel static deployment).
"""

from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "rfm_customer_analytics" / "data"
PUBLIC = ROOT / "public"
PUBLIC.mkdir(parents=True, exist_ok=True)

files_to_copy = [
    "segment_metrics_dashboard.html",
    "interactive_champions_map.html",
    "rfm_correlation_heatmap.png",
    "segment_by_country_heatmap.png",
    "marketing_strategy_roi.txt",
    "rfm_segmentation.csv",
]

copied = []
for fname in files_to_copy:
    src = DATA_DIR / fname
    dst = PUBLIC / fname
    if src.exists():
        shutil.copy2(src, dst)
        copied.append(fname)

index_html = PUBLIC / "index.html"
with open(index_html, "w") as fh:
    fh.write("""
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>RFM Customer Analytics — Reports</title>
    <style>body{font-family:system-ui,Arial,sans-serif;margin:24px}</style>
  </head>
  <body>
    <h1>RFM Customer Analytics — Reports</h1>
    <p>The site hosts the latest generated dashboards and reports.</p>
    <ul>
      <li><a href="segment_metrics_dashboard.html">Segment Metrics Dashboard (interactive)</a></li>
      <li><a href="interactive_champions_map.html">Interactive Champions Map</a></li>
      <li><a href="rfm_segmentation.csv">Download RFM segmentation (CSV)</a></li>
      <li><a href="marketing_strategy_roi.txt">Marketing strategy & ROI report (TXT)</a></li>
      <li><a href="rfm_correlation_heatmap.png">RFM Correlation Heatmap (PNG)</a></li>
      <li><a href="segment_by_country_heatmap.png">Segment-by-Country Heatmap (PNG)</a></li>
    </ul>
    <hr>
    <p>If any files are missing, run <code>python scripts/prepare_public.py</code> locally to copy them from <code>rfm_customer_analytics/data/</code>.</p>
  </body>
</html>
""")

print(f"Prepared public/ with {len(copied)} files: {copied}")

if len(copied) == 0:
    print("Warning: no artifact files were found in rfm_customer_analytics/data/")
    sys.exit(2)
