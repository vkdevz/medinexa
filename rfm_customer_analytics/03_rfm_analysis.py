"""
RFM (Recency, Frequency, Monetary) Analysis Engine
Quintile-based segmentation: Champions, Potential Loyalists, At-Risk, Lost
Production-ready with detailed customer insights and segment profiles
"""

import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class RFMAnalysisEngine:
    """
    Enterprise-grade RFM analysis with quintile-based segmentation.
    Combines Recency, Frequency, and Monetary metrics for customer lifetime value assessment.
    """
    
    def __init__(self, df: pd.DataFrame, reference_date: datetime = None):
        """
        Initialize RFM engine
        
        Args:
            df: Cleaned transaction dataframe
            reference_date: Analysis date (defaults to max date in dataset)
        """
        self.df = df.copy()
        self.reference_date = reference_date or df['Transaction_Date'].max()
        self.rfm_data = None
        self.customer_segments = None
        
        logger.info(f"RFM Engine initialized. Reference date: {self.reference_date.date()}")
    
    def calculate_rfm_metrics(self) -> pd.DataFrame:
        """
        Calculate RFM metrics for each customer:
        
        R (Recency): Days since last purchase (lower is better)
        F (Frequency): Total number of transactions (higher is better)
        M (Monetary): Total spending (higher is better)
        """
        logger.info("\n" + "="*60)
        logger.info("CALCULATING RFM METRICS")
        logger.info("="*60)
        
        # Group by Customer_ID
        rfm_df = self.df.groupby('Customer_ID').agg({
            'Transaction_Date': 'max',        # Most recent transaction
            'Order_ID': 'count',               # Number of transactions
            'Transaction_Amount': 'sum'        # Total spending
        }).reset_index()
        
        # Rename columns
        rfm_df.columns = ['Customer_ID', 'LastPurchaseDate', 'Frequency', 'Monetary']
        
        # Calculate Recency (days since last purchase)
        rfm_df['Recency'] = (self.reference_date - rfm_df['LastPurchaseDate']).dt.days
        
        # Drop the date column (no longer needed)
        rfm_df = rfm_df.drop('LastPurchaseDate', axis=1)
        
        logger.info(f"✓ RFM metrics calculated for {len(rfm_df):,} unique customers")
        logger.info(f"\nRecency (days since last purchase):")
        logger.info(f"  Min: {rfm_df['Recency'].min()} | Max: {rfm_df['Recency'].max()} | Mean: {rfm_df['Recency'].mean():.1f}")
        logger.info(f"\nFrequency (number of purchases):")
        logger.info(f"  Min: {rfm_df['Frequency'].min()} | Max: {rfm_df['Frequency'].max()} | Mean: {rfm_df['Frequency'].mean():.1f}")
        logger.info(f"\nMonetary (total spending in £):")
        logger.info(f"  Min: £{rfm_df['Monetary'].min():.2f} | Max: £{rfm_df['Monetary'].max():.2f} | Mean: £{rfm_df['Monetary'].mean():.2f}")
        
        self.rfm_data = rfm_df
        return rfm_df
    
    @staticmethod
    def _assign_score(series: pd.Series, higher_is_better: bool = True) -> pd.Series:
        """Score a numeric series into 1-5 bins using percentile ranks.

        Uses first-occurrence ranking to ensure all score buckets can be populated even
        when the data contains many repeated values.
        """
        rank_pct = series.rank(method='first', pct=True)
        score_bins = pd.cut(
            rank_pct,
            bins=[0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
            labels=[1, 2, 3, 4, 5],
            include_lowest=True,
        ).astype(int)
        if higher_is_better:
            return score_bins
        return 6 - score_bins
    
    def assign_quintile_scores(self) -> pd.DataFrame:
        """
        Assign scaled 1-5 scores for each RFM metric.
        
        Scoring logic:
        - Recency: 5 = most recent (best), 1 = least recent (worst)
        - Frequency: 5 = most frequent (best), 1 = least frequent (worst)
        - Monetary: 5 = highest spend (best), 1 = lowest spend (worst)
        """
        logger.info("\n" + "="*60)
        logger.info("ASSIGNING RFM SCORES (1-5)")
        logger.info("="*60)
        
        rfm = self.rfm_data.copy()
        
        # Recency: Lower days = better score
        rfm['R_Score'] = self._assign_score(rfm['Recency'], higher_is_better=False)
        
        # Frequency: Higher count = better score
        rfm['F_Score'] = self._assign_score(rfm['Frequency'], higher_is_better=True)
        
        # Monetary: Higher spend = better score
        rfm['M_Score'] = self._assign_score(rfm['Monetary'], higher_is_better=True)
        
        # Composite RFM Score (simple average, could be weighted)
        rfm['RFM_Score'] = (rfm['R_Score'] + rfm['F_Score'] + rfm['M_Score']) / 3
        
        logger.info("✓ RFM scores assigned")
        logger.info(f"\nScore distribution:")
        logger.info(f"  R_Score (Recency):    {dict(rfm['R_Score'].value_counts().sort_index())}")
        logger.info(f"  F_Score (Frequency):  {dict(rfm['F_Score'].value_counts().sort_index())}")
        logger.info(f"  M_Score (Monetary):   {dict(rfm['M_Score'].value_counts().sort_index())}")
        
        self.rfm_data = rfm
        return rfm
    
    def segment_customers(self) -> pd.DataFrame:
        """
        Segment customers into 5 strategic tiers based on RFM scores:
        
        Champions (R≥4, F≥4, M≥4): Best customers with strongest value
        Potential Loyalists (R≥3, F≥3, M≥3): Strong engagement with growth opportunity
        At-Risk (R≤2, F≤2): Customers with weakening activity
        Lost (R=1, F=1, M=1): Inactive and low-value customers
        Other: Mixed RFM signals requiring further action
        """
        logger.info("\n" + "="*60)
        logger.info("CUSTOMER SEGMENTATION")
        logger.info("="*60)
        
        rfm = self.rfm_data.copy()
        
        def assign_segment(row):
            """Assign customer segment based on RFM scores"""
            r, f, m = row['R_Score'], row['F_Score'], row['M_Score']
            
            # Champions: Best customers
            if r >= 4 and f >= 4 and m >= 4:
                return 'Champions'
            
            # Potential Loyalists: Strong and growing customers
            elif r >= 3 and f >= 3 and m >= 3:
                return 'Potential Loyalists'
            
            # Lost: Inactive customers with the lowest scores
            elif r == 1 and f == 1 and m == 1:
                return 'Lost'
            
            # At-Risk: Declining engagement and lower purchase frequency
            elif r <= 2 and f <= 2:
                return 'At-Risk'
            
            # Default: Other (mixed or moderate RFM performance)
            else:
                return 'Other'
        
        rfm['Segment'] = rfm.apply(assign_segment, axis=1)
        
        # Distribution
        segment_dist = rfm['Segment'].value_counts()
        logger.info("\n✓ Customer Segmentation Complete:")
        for segment, count in segment_dist.items():
            pct = (count / len(rfm)) * 100
            logger.info(f"  {segment:20s}: {count:5,} customers ({pct:5.1f}%)")
        
        # Segment profiles
        logger.info("\n" + "="*60)
        logger.info("SEGMENT PROFILES")
        logger.info("="*60)
        
        for segment in ['Champions', 'Potential Loyalists', 'At-Risk', 'Lost', 'Other']:
            segment_data = rfm[rfm['Segment'] == segment]
            if len(segment_data) > 0:
                logger.info(f"\n{segment}:")
                logger.info(f"  Count: {len(segment_data):,} customers")
                logger.info(f"  Avg Recency: {segment_data['Recency'].mean():.1f} days")
                logger.info(f"  Avg Frequency: {segment_data['Frequency'].mean():.1f} purchases")
                logger.info(f"  Avg Monetary: £{segment_data['Monetary'].mean():.2f}")
                logger.info(f"  Avg RFM Score: {segment_data['RFM_Score'].mean():.2f}/5")
        
        self.customer_segments = rfm
        return rfm
    
    def get_segment_summary(self) -> pd.DataFrame:
        """Return comprehensive segment summary statistics"""
        segments = ['Champions', 'Potential Loyalists', 'At-Risk', 'Lost', 'Other']
        summary_data = []
        
        for segment in segments:
            segment_data = self.customer_segments[self.customer_segments['Segment'] == segment]
            if len(segment_data) > 0:
                summary_data.append({
                    'Segment': segment,
                    'Customer_Count': len(segment_data),
                    'Percentage': (len(segment_data) / len(self.customer_segments)) * 100,
                    'Avg_Recency_Days': segment_data['Recency'].mean(),
                    'Avg_Frequency': segment_data['Frequency'].mean(),
                    'Avg_Monetary_Value': segment_data['Monetary'].mean(),
                    'Total_Monetary_Value': segment_data['Monetary'].sum(),
                    'Avg_RFM_Score': segment_data['RFM_Score'].mean()
                })
        
        return pd.DataFrame(summary_data)
    
    def export_results(self, output_path: str):
        """Export segmented customer data to CSV"""
        self.customer_segments.to_csv(output_path, index=False)
        logger.info(f"\n✓ RFM segmentation results exported to: {output_path}")


def main():
    """Execute RFM analysis"""
    logger.info("\n" + "█"*60)
    logger.info("█" + " "*58 + "█")
    logger.info("█" + "  RFM ANALYSIS & CUSTOMER SEGMENTATION".center(58) + "█")
    logger.info("█" + " "*58 + "█")
    logger.info("█"*60)
    
    # Setup local data paths
    data_dir = Path(__file__).resolve().parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Load cleaned data
    input_path = data_dir / "cleaned_ecommerce_data.csv"
    df = pd.read_csv(input_path)
    df['Transaction_Date'] = pd.to_datetime(df['Transaction_Date'])
    
    # Initialize and execute RFM engine
    rfm_engine = RFMAnalysisEngine(df)
    rfm_engine.calculate_rfm_metrics()
    rfm_engine.assign_quintile_scores()
    rfm_engine.segment_customers()
    
    # Get segment summary
    summary = rfm_engine.get_segment_summary()
    logger.info("\n" + "="*60)
    logger.info("SEGMENT SUMMARY TABLE")
    logger.info("="*60)
    print(summary.to_string(index=False))
    
    # Export
    output_path = data_dir / "rfm_segmentation.csv"
    rfm_engine.export_results(str(output_path))
    
    return rfm_engine.customer_segments


if __name__ == "__main__":
    customer_segments = main()
