import json
from pathlib import Path

notebook = {
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# 📊 RFM Customer Analytics - Google Colab\n",
    "This notebook contains the complete RFM analytics pipeline, including data generation, ETL cleaning, RFM analysis, marketing strategy ROI calculations, and visualizations.\n",
    "\n",
    "You can run the pipeline step-by-step or launch the interactive **Streamlit** dashboard directly from this notebook using a public tunnel."
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🛠️ Step 0: Setup Repository & Install Dependencies\n",
    "Clone the repository and install the requirements."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 1. Clone the repository\n",
    "!git clone https://github.com/vkdevz/rfm_project_01.git\n",
    "%cd rfm_project_01\n",
    "\n",
    "# 2. Install required packages\n",
    "!pip install -r requirements.txt\n",
    "!pip install watchdog"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 📦 Step 1: Generate Synthetic Ecommerce Data\n",
    "Generates 20,000 transaction-level rows with realistic noise (duplicates, outliers, missing values)."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "!python rfm_customer_analytics/01_synthetic_data_generation.py"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🧹 Step 2: Run the ETL Data Cleaning Pipeline\n",
    "Cleans the synthetic data, imputes missing product categories, resolves duplicate orders, and validates the clean dataset."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "!python rfm_customer_analytics/02_etl_cleaning_pipeline.py"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🎯 Step 3: Run the RFM Segmentation Analysis\n",
    "Calculates Recency, Frequency, and Monetary metrics, performs quintile scoring, and groups customers into tiers (Champions, Potential Loyalists, At-Risk, Lost)."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "!python rfm_customer_analytics/03_rfm_analysis.py"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 💰 Step 4: Generate Marketing Strategies & ROI Report\n",
    "Calculates specific marketing campaigns and projects their annual ROI for each segment."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "!python rfm_customer_analytics/04_marketing_strategy_roi.py"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 📈 Step 5: Generate Dashboards & Charts\n",
    "Generates static PNG plots and interactive HTML dashboards."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "!python rfm_customer_analytics/05_global_visualizations.py"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 📈 View Results Inline\n",
    "You can view the generated text reports and static visualizations directly in the notebook."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "print(\"--- MARKETING STRATEGY REPORT ---\\n\")\n",
    "with open(\"rfm_customer_analytics/data/marketing_strategy_roi.txt\", \"r\") as f:\n",
    "    print(f.read())"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "from IPython.display import Image, display\n",
    "\n",
    "print(\"--- RFM Correlation Heatmap ---\\n\")\n",
    "display(Image(\"rfm_customer_analytics/data/rfm_correlation_heatmap.png\"))\n",
    "\n",
    "print(\"\\n--- Segment by Country Heatmap ---\\n\")\n",
    "display(Image(\"rfm_customer_analytics/data/segment_by_country_heatmap.png\"))"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🚀 Host the Interactive Streamlit Web Application\n",
    "You can run the interactive web application right inside Google Colab and expose it to the web using **localtunnel**.\n",
    "\n",
    "### Instructions:\n",
    "1. Run the cell below to print your Colab Instance **Public IP Address** (you will need to paste this in the localtunnel page to unlock access).\n",
    "2. Click the localtunnel URL (ending in `.loca.lt`) that appears under the second cell.\n",
    "3. Paste the IP address in the localtunnel prompt and submit to view the dashboard!"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Print the public IP of the Google Colab instance\n",
    "# You must copy this IP address and paste it into the localtunnel password page!\n",
    "!curl ipv4.icanhazip.com"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Install localtunnel globally\n",
    "!npm install -g localtunnel\n",
    "\n",
    "# Run streamlit in the background and pipe output to a log file\n",
    "import subprocess\n",
    "subprocess.Popen([\"streamlit\", \"run\", \"rfm_customer_analytics/web_app.py\", \"--server.port\", \"8501\"])\n",
    "\n",
    "# Expose port 8501 using localtunnel\n",
    "!npx localtunnel --port 8501"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "name": "python"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 0
}

output_path = Path(__file__).resolve().parent.parent / "rfm_colab_notebook.ipynb"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(notebook, f, indent=1)

print(f"Successfully generated Colab notebook at: {output_path}")
