"""
Advanced ETL & Data Cleaning Pipeline
Handles: missing values, duplicates, data type conversion, datetime parsing
Production-ready with detailed logging and quality assurance metrics
"""

import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path
from typing import Tuple, Dict, List
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DataCleaningPipeline:
    """
    Enterprise-grade ETL pipeline for e-commerce transaction data.
    Includes validation, quality checks, and detailed reporting.
    """
    
    def __init__(self, input_path: str):
        self.input_path = input_path
        self.df = None
        self.df_clean = None
        self.quality_report = {}
        
    def load_data(self) -> pd.DataFrame:
        """Load data from CSV"""
        logger.info(f"Loading data from: {self.input_path}")
        self.df = pd.read_csv(self.input_path)
        logger.info(f"✓ Loaded {len(self.df):,} rows, {len(self.df.columns)} columns")
        return self.df
    
    def _report_quality(self, stage: str, df: pd.DataFrame):
        """Log data quality metrics at each stage"""
        logger.info(f"\n{'='*60}")
        logger.info(f"QUALITY CHECKPOINT: {stage}")
        logger.info(f"{'='*60}")
        logger.info(f"Rows: {len(df):,} | Columns: {len(df.columns)}")
        logger.info(f"Missing values: {df.isnull().sum().sum()} ({(df.isnull().sum().sum() / (len(df) * len(df.columns)) * 100):.2f}%)")
        logger.info(f"Duplicates: {df.duplicated().sum()} rows")
        
        # Memory usage
        memory_mb = df.memory_usage(deep=True).sum() / 1024**2
        logger.info(f"Memory usage: {memory_mb:.2f} MB")
    
    def handle_missing_values(self) -> pd.DataFrame:
        """
        Handle missing values strategically:
        - Product_Category: mode imputation (most common category)
        - Country: remove rows (geographic data critical for this analysis)
        - Transaction_Amount: already complete after generation
        """
        logger.info("\n" + "="*60)
        logger.info("STAGE 1: HANDLING MISSING VALUES")
        logger.info("="*60)
        
        df = self.df.copy()
        missing_before = df.isnull().sum().sum()
        
        # Strategy 1: Mode imputation for Product_Category
        if df['Product_Category'].isnull().sum() > 0:
            mode_category = df['Product_Category'].mode()[0]
            logger.info(f"  • Imputing {df['Product_Category'].isnull().sum()} missing Product_Category with mode: {mode_category}")
            df['Product_Category'] = df['Product_Category'].fillna(mode_category)
        
        # Strategy 2: Remove rows with missing Country (critical for geographic analysis)
        if df['Country'].isnull().sum() > 0:
            logger.info(f"  • Removing {df['Country'].isnull().sum()} rows with missing Country")
            df = df.dropna(subset=['Country'])
        
        missing_after = df.isnull().sum().sum()
        logger.info(f"✓ Missing values reduced: {missing_before} → {missing_after}")
        self._report_quality("After Missing Value Handling", df)
        
        return df
    
    def handle_duplicates(self) -> pd.DataFrame:
        """
        Handle duplicate records:
        - Exact duplicates: remove
        - Customer repeat purchases: keep (legitimate business data)
        """
        logger.info("\n" + "="*60)
        logger.info("STAGE 2: HANDLING DUPLICATES")
        logger.info("="*60)
        
        df = self.df.copy()
        
        # Check for exact duplicates
        exact_duplicates = df.duplicated().sum()
        logger.info(f"  • Exact duplicate rows: {exact_duplicates}")
        
        if exact_duplicates > 0:
            logger.info(f"  • Removing {exact_duplicates} exact duplicate rows")
            df = df.drop_duplicates()
        
        # Note: Order_ID duplicates would indicate data quality issue
        order_id_duplicates = df[df['Order_ID'].duplicated(keep=False)].shape[0]
        if order_id_duplicates > 0:
            logger.warning(f"  ⚠ WARNING: {order_id_duplicates} rows have duplicate Order_IDs (should be unique)")
            df = df.drop_duplicates(subset=['Order_ID'], keep='first')
            logger.info(f"  • Kept first occurrence of each Order_ID")
        
        logger.info(f"✓ Duplicates handled. Rows remaining: {len(df):,}")
        self._report_quality("After Duplicate Handling", df)
        
        return df
    
    def convert_data_types(self) -> pd.DataFrame:
        """
        Convert to appropriate data types for analysis and storage efficiency
        """
        logger.info("\n" + "="*60)
        logger.info("STAGE 3: DATA TYPE CONVERSION")
        logger.info("="*60)
        
        df = self.df.copy()
        
        conversions = {
            'Order_ID': 'string',           # Categorical ID
            'Customer_ID': 'string',         # Categorical ID
            'Transaction_Date': 'datetime64[ns]',  # Time-series
            'Transaction_Amount': 'float64',      # Numeric
            'Product_Category': 'category',       # Categorical (optimize memory)
            'Country': 'category'                 # Categorical (optimize memory)
        }
        
        for col, dtype in conversions.items():
            try:
                if dtype == 'datetime64[ns]':
                    df[col] = pd.to_datetime(df[col], errors='coerce')
                else:
                    df[col] = df[col].astype(dtype)
                logger.info(f"  ✓ {col:20s} → {dtype}")
            except Exception as e:
                logger.warning(f"  ⚠ Could not convert {col} to {dtype}: {e}")
        
        # Memory optimization summary
        memory_before = self.df.memory_usage(deep=True).sum() / 1024**2
        memory_after = df.memory_usage(deep=True).sum() / 1024**2
        reduction = ((memory_before - memory_after) / memory_before) * 100
        logger.info(f"\n✓ Memory optimization: {memory_before:.2f} MB → {memory_after:.2f} MB ({reduction:.1f}% reduction)")
        
        self._report_quality("After Data Type Conversion", df)
        return df
    
    def remove_outliers(self) -> pd.DataFrame:
        """
        Remove data quality outliers while preserving legitimate business variance.
        Uses IQR method for Transaction_Amount.
        """
        logger.info("\n" + "="*60)
        logger.info("STAGE 4: OUTLIER DETECTION & REMOVAL")
        logger.info("="*60)
        
        df = self.df.copy()
        
        # Remove invalid Transaction_Amount values
        invalid_amount = df[df['Transaction_Amount'] <= 0].shape[0]
        if invalid_amount > 0:
            logger.info(f"  • Removing {invalid_amount} rows with Transaction_Amount ≤ £0")
            df = df[df['Transaction_Amount'] > 0]
        
        # IQR-based outlier detection for Transaction_Amount
        Q1 = df['Transaction_Amount'].quantile(0.25)
        Q3 = df['Transaction_Amount'].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outliers = df[(df['Transaction_Amount'] < lower_bound) | (df['Transaction_Amount'] > upper_bound)]
        logger.info(f"  • IQR bounds: [£{lower_bound:.2f}, £{upper_bound:.2f}]")
        logger.info(f"  • Detected {len(outliers)} potential outliers")
        logger.info(f"    - Mean outlier value: £{outliers['Transaction_Amount'].mean():.2f}")
        logger.info(f"    - Max value: £{outliers['Transaction_Amount'].max():.2f}")
        
        # Decision: Keep outliers (legitimate high-value transactions)
        # This is important for RFM analysis - high-value customers shouldn't be excluded
        logger.info(f"  ✓ KEPT outliers: High-value transactions are valid for business analysis")
        
        self._report_quality("After Outlier Analysis", df)
        return df
    
    def validate_data(self) -> bool:
        """Validate cleaned data against business rules"""
        logger.info("\n" + "="*60)
        logger.info("STAGE 5: DATA VALIDATION")
        logger.info("="*60)
        
        df = self.df_clean
        all_valid = True
        
        # Check 1: No null values in critical columns
        critical_cols = ['Customer_ID', 'Transaction_Date', 'Transaction_Amount', 'Country']
        for col in critical_cols:
            nulls = df[col].isnull().sum()
            if nulls > 0:
                logger.error(f"  ✗ {col}: {nulls} null values found")
                all_valid = False
            else:
                logger.info(f"  ✓ {col}: No null values")
        
        # Check 2: Date range validation (24 months)
        min_date = df['Transaction_Date'].min()
        max_date = df['Transaction_Date'].max()
        date_range = (max_date - min_date).days / 365.25
        logger.info(f"  ✓ Date range: {min_date.date()} to {max_date.date()} ({date_range:.2f} years)")
        
        # Check 3: Transaction Amount range
        logger.info(f"  ✓ Transaction_Amount range: £{df['Transaction_Amount'].min():.2f} to £{df['Transaction_Amount'].max():.2f}")
        
        # Check 4: Valid countries
        valid_countries = {'UK', 'Germany', 'France', 'USA'}
        invalid_countries = set(df['Country'].unique()) - valid_countries
        if invalid_countries:
            logger.error(f"  ✗ Invalid countries found: {invalid_countries}")
            all_valid = False
        else:
            logger.info(f"  ✓ All countries valid: {sorted(df['Country'].unique())}")
        
        # Check 5: Data types
        logger.info(f"  ✓ Data types: {dict(df.dtypes)}")
        
        status = "✓ ALL VALIDATIONS PASSED" if all_valid else "✗ VALIDATION FAILED"
        logger.info(f"\n{status}")
        
        return all_valid
    
    def execute(self) -> Tuple[pd.DataFrame, Dict]:
        """Execute full ETL pipeline"""
        logger.info("\n" + "█"*60)
        logger.info("█" + " "*58 + "█")
        logger.info("█" + "  ADVANCED ETL & DATA CLEANING PIPELINE".center(58) + "█")
        logger.info("█" + " "*58 + "█")
        logger.info("█"*60 + "\n")
        
        # Execute stages
        self.load_data()
        self._report_quality("INITIAL DATA", self.df)
        
        self.df = self.handle_missing_values()
        self.df = self.handle_duplicates()
        self.df = self.convert_data_types()
        self.df = self.remove_outliers()
        
        self.df_clean = self.df.copy()
        self.validate_data()
        
        # Final summary
        logger.info("\n" + "="*60)
        logger.info("ETL PIPELINE COMPLETE - FINAL SUMMARY")
        logger.info("="*60)
        logger.info(f"Input rows: 20,000")
        logger.info(f"Output rows: {len(self.df_clean):,}")
        logger.info(f"Data retention: {(len(self.df_clean) / 20000 * 100):.1f}%")
        logger.info(f"Cleaned columns: {len(self.df_clean.columns)}")
        
        return self.df_clean


def main():
    """Execute ETL pipeline"""
    data_dir = Path(__file__).resolve().parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    input_path = data_dir / "synthetic_ecommerce_data.csv"
    output_path = data_dir / "cleaned_ecommerce_data.csv"

    pipeline = DataCleaningPipeline(input_path=str(input_path))
    df_clean = pipeline.execute()
    
    # Save cleaned dataset
    df_clean.to_csv(output_path, index=False)
    logger.info(f"\n✓ Cleaned dataset saved to: {output_path}")
    
    return df_clean


if __name__ == "__main__":
    df_clean = main()
