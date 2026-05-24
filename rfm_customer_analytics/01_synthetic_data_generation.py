"""
Synthetic E-Commerce Dataset Generator
Senior Data Strategist Portfolio Project
Generated dataset includes realistic noise: missing values, duplicates, and outliers
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
from pathlib import Path
from typing import Tuple

# Set random seeds for reproducibility
np.random.seed(42)
random.seed(42)

class SyntheticDataGenerator:
    """
    Enterprise-grade synthetic data generator for e-commerce customer transactions.
    Introduces realistic data quality issues: missing values, duplicates, outliers.
    """
    
    def __init__(self, num_rows: int = 20000):
        self.num_rows = num_rows
        self.start_date = datetime(2022, 1, 1)
        self.end_date = datetime(2023, 12, 31)
        self.countries = ['UK', 'Germany', 'France', 'USA']
        self.categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Books', 'Beauty']
        
    def generate_order_ids(self) -> np.ndarray:
        """Generate unique Order IDs (ORD-XXXXX format)"""
        return np.array([f'ORD-{i:05d}' for i in range(1, self.num_rows + 1)])
    
    def generate_customer_ids(self) -> np.ndarray:
        """
        Generate Customer IDs with realistic duplicates.
        ~70% unique customers making repeat purchases, creating realistic distribution.
        """
        unique_customers = int(self.num_rows * 0.65)  # ~65% unique
        customer_ids = np.array([f'CUST-{i:06d}' for i in range(1, unique_customers + 1)])
        
        # Create repeat customers (65% of data is from ~2800 unique customers)
        repeated_ids = np.random.choice(customer_ids, size=self.num_rows - unique_customers, replace=True)
        all_customer_ids = np.concatenate([customer_ids, repeated_ids])
        np.random.shuffle(all_customer_ids)
        
        return all_customer_ids[:self.num_rows]
    
    def generate_transaction_dates(self) -> np.ndarray:
        """Generate transaction dates across 24 months"""
        days_between = (self.end_date - self.start_date).days
        random_days = np.random.randint(0, days_between, size=self.num_rows)
        dates = np.array([self.start_date + timedelta(days=int(day)) for day in random_days])
        return dates
    
    def generate_transaction_amounts(self) -> np.ndarray:
        """
        Generate transaction amounts with:
        - Primary distribution: lognormal (realistic e-commerce pattern)
        - Outliers: ~2% extreme values
        - Some zero/negative values (data quality issues)
        """
        # Main distribution: lognormal (realistic for e-commerce)
        amounts = np.random.lognormal(mean=3.5, sigma=1.2, size=self.num_rows)
        
        # Add outliers (~2% extremely high values)
        outlier_indices = np.random.choice(self.num_rows, size=int(self.num_rows * 0.02), replace=False)
        amounts[outlier_indices] = np.random.uniform(5000, 15000, size=len(outlier_indices))
        
        # Introduce data quality issues (~1% invalid values)
        invalid_indices = np.random.choice(self.num_rows, size=int(self.num_rows * 0.01), replace=False)
        amounts[invalid_indices] = np.random.choice([0, -np.random.uniform(10, 100)], size=len(invalid_indices))
        
        return amounts
    
    def generate_product_categories(self) -> np.ndarray:
        """Generate product categories"""
        return np.random.choice(self.categories, size=self.num_rows)
    
    def generate_countries(self) -> np.ndarray:
        """Generate countries with realistic geographic distribution"""
        # Realistic distribution: USA 40%, UK 25%, Germany 20%, France 15%
        return np.random.choice(
            self.countries,
            size=self.num_rows,
            p=[0.4, 0.25, 0.2, 0.15]
        )
    
    def introduce_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Introduce missing values at ~3% rate across specific columns
        (realistic business scenario)
        """
        df_copy = df.copy()
        missing_rate = 0.03
        
        # Missing values in optional fields
        for col in ['Product_Category', 'Country']:
            missing_indices = np.random.choice(
                df_copy.index,
                size=int(len(df_copy) * missing_rate),
                replace=False
            )
            df_copy.loc[missing_indices, col] = np.nan
        
        return df_copy
    
    def generate(self) -> pd.DataFrame:
        """Generate complete synthetic dataset with noise"""
        print(f"Generating {self.num_rows:,} rows of synthetic e-commerce data...")
        
        data = {
            'Order_ID': self.generate_order_ids(),
            'Customer_ID': self.generate_customer_ids(),
            'Transaction_Date': self.generate_transaction_dates(),
            'Transaction_Amount': self.generate_transaction_amounts(),
            'Product_Category': self.generate_product_categories(),
            'Country': self.generate_countries()
        }
        
        df = pd.DataFrame(data)
        
        # Introduce realistic missing values
        df = self.introduce_missing_values(df)
        
        print(f"✓ Generated dataset shape: {df.shape}")
        print(f"✓ Unique customers: {df['Customer_ID'].nunique():,}")
        print(f"✓ Missing values introduced: {df.isnull().sum().sum()} cells (~{(df.isnull().sum().sum() / (df.shape[0] * df.shape[1]) * 100):.2f}%)")
        print(f"✓ Outliers in Transaction_Amount: {(df['Transaction_Amount'] > 5000).sum()} rows")
        
        return df


def main():
    """Main execution"""
    # Generate synthetic dataset
    generator = SyntheticDataGenerator(num_rows=20000)
    df = generator.generate()
    
    # Display sample and basic statistics
    print("\n" + "="*80)
    print("SAMPLE DATA (First 10 rows)")
    print("="*80)
    print(df.head(10).to_string())
    
    print("\n" + "="*80)
    print("DATA QUALITY REPORT")
    print("="*80)
    print(df.info())
    print("\n" + df.describe().to_string())
    
    # Save to CSV in local project data folder
    output_dir = Path(__file__).resolve().parent / "data"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "synthetic_ecommerce_data.csv"
    df.to_csv(output_path, index=False)
    print(f"\n✓ Dataset saved to: {output_path}")
    
    return df


if __name__ == "__main__":
    df = main()
