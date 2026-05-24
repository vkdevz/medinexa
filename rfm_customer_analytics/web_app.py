"""
Streamlit web app for the RFM pipeline.

Upload a CSV (raw or already cleaned), run the ETL (optional), RFM analysis,
marketing report and visualizations, and preview/download outputs.

Run locally:
  source .venv/bin/activate
  pip install -r rfm_customer_analytics/requirements.txt
  streamlit run rfm_customer_analytics/web_app.py
"""

import sys
import uuid
import importlib.util
from pathlib import Path

import pandas as pd
import streamlit as st
import streamlit.components.v1 as components

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


def run_main_from_script(script_filename: str):
    """Dynamically import a script from the local package and call its main()."""
    script_path = Path(__file__).resolve().parent / script_filename
    if not script_path.exists():
        raise FileNotFoundError(f"Script not found: {script_path}")

    # unique module name to avoid collisions
    name = f"script_{script_filename.replace('.', '_')}_{uuid.uuid4().hex}"
    spec = importlib.util.spec_from_file_location(name, str(script_path))
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    if hasattr(module, "main"):
        return module.main()
    return None


st.set_page_config(page_title="RFM Pipeline", layout="wide")
st.title("RFM Customer Analytics — Upload CSV & Run Pipeline")

uploaded_file = st.file_uploader("Upload your CSV file (Kaggle/raw or cleaned)", type=["csv"]) 
col1, col2 = st.columns([3, 1])
with col1:
    is_clean = st.checkbox("My file is already cleaned (skip ETL '02')", value=False)
    generate_marketing = st.checkbox("Generate marketing report (04)", value=True)
    generate_visuals = st.checkbox("Generate visualizations (05)", value=True)
with col2:
    run_button = st.button("Run pipeline")


if uploaded_file is None:
    st.info("Upload a CSV to get started. If you already have a cleaned file, enable 'skip ETL'.")
else:
    st.write(f"Uploaded: {uploaded_file.name} — {uploaded_file.size} bytes")

    # determine target path depending on whether we'll run ETL
    target_path = DATA_DIR / ("cleaned_ecommerce_data.csv" if is_clean else "synthetic_ecommerce_data.csv")

    if st.button("Save uploaded file to pipeline input"):
        with open(target_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        st.success(f"Saved uploaded file to: {target_path}")
        # show preview
        try:
            df_preview = pd.read_csv(target_path, nrows=5)
            st.subheader("Preview (first 5 rows)")
            st.dataframe(df_preview)
        except Exception as e:
            st.warning(f"Could not preview file: {e}")

    if run_button:
        if uploaded_file is None:
            st.warning("Please upload a CSV file first.")
        else:
            # save uploaded file (always overwrite)
            with open(target_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
            st.info(f"Saved uploaded file to {target_path}")

            try:
                # Run ETL if needed
                if not is_clean:
                    with st.spinner("Running ETL: 02_etl_cleaning_pipeline.py"):
                        run_main_from_script("02_etl_cleaning_pipeline.py")

                # Run RFM analysis
                with st.spinner("Running RFM analysis: 03_rfm_analysis.py"):
                    run_main_from_script("03_rfm_analysis.py")
                st.success("RFM analysis finished")

                # Show segmentation output
                seg_path = DATA_DIR / "rfm_segmentation.csv"
                if seg_path.exists():
                    df_seg = pd.read_csv(seg_path)
                    st.subheader("RFM Segmentation — preview")
                    st.dataframe(df_seg.head(50))
                    st.download_button("Download segmentation CSV", data=seg_path.read_bytes(), file_name="rfm_segmentation.csv", mime="text/csv")
                else:
                    st.error("RFM segmentation file not found at data/rfm_segmentation.csv")

                # Optionally run marketing report
                if generate_marketing:
                    with st.spinner("Generating marketing strategy report: 04_marketing_strategy_roi.py"):
                        run_main_from_script("04_marketing_strategy_roi.py")
                    rpt = DATA_DIR / "marketing_strategy_roi.txt"
                    if rpt.exists():
                        txt = rpt.read_text()
                        st.subheader("Marketing Strategy Report")
                        st.code(txt)
                        st.download_button("Download marketing report", data=txt.encode("utf-8"), file_name="marketing_strategy_roi.txt", mime="text/plain")
                    else:
                        st.warning("Marketing report not found after running step 04")

                # Optionally run visualizations
                if generate_visuals:
                    with st.spinner("Generating visualizations: 05_global_visualizations.py"):
                        run_main_from_script("05_global_visualizations.py")

                    # PNGs
                    heat1 = DATA_DIR / "rfm_correlation_heatmap.png"
                    heat2 = DATA_DIR / "segment_by_country_heatmap.png"
                    if heat1.exists():
                        st.image(str(heat1), caption="RFM correlation heatmap", use_column_width=True)
                        st.download_button("Download heatmap PNG", data=heat1.read_bytes(), file_name="rfm_correlation_heatmap.png", mime="image/png")
                    if heat2.exists():
                        st.image(str(heat2), caption="Segment-by-country heatmap", use_column_width=True)
                        st.download_button("Download country heatmap PNG", data=heat2.read_bytes(), file_name="segment_by_country_heatmap.png", mime="image/png")

                    # Interactive HTMLs
                    map_html = DATA_DIR / "interactive_champions_map.html"
                    dash_html = DATA_DIR / "segment_metrics_dashboard.html"
                    if map_html.exists():
                        st.subheader("Interactive Champions Map")
                        components.html(map_html.read_text(), height=600, scrolling=True)
                        st.download_button("Download interactive map (HTML)", data=map_html.read_bytes(), file_name="interactive_champions_map.html", mime="text/html")
                    if dash_html.exists():
                        st.subheader("Segment Metrics Dashboard")
                        components.html(dash_html.read_text(), height=800, scrolling=True)
                        st.download_button("Download dashboard (HTML)", data=dash_html.read_bytes(), file_name="segment_metrics_dashboard.html", mime="text/html")

            except Exception as e:
                st.exception(e)


st.markdown("---")
st.markdown("""**Notes:** Run this app inside the project venv. Example commands:
```
source .venv/bin/activate
pip install -r rfm_customer_analytics/requirements.txt
streamlit run rfm_customer_analytics/web_app.py
```""")
