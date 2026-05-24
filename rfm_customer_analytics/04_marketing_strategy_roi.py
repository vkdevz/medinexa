"""
Business Strategy & ROI Analysis
Marketing Action Plans for Each Customer Segment
Data-driven recommendations with financial projections
"""

import pandas as pd
import numpy as np
import logging
from pathlib import Path
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class MarketingStrategyROI:
    """
    Enterprise marketing strategy engine with ROI calculations for each segment.
    Provides data-driven email campaign and discount strategies.
    """
    
    # Email engagement assumptions (based on e-commerce benchmarks)
    EMAIL_ASSUMPTIONS = {
        'Champions': {'open_rate': 0.45, 'click_rate': 0.12, 'conversion_rate': 0.08},
        'Potential Loyalists': {'open_rate': 0.35, 'click_rate': 0.08, 'conversion_rate': 0.05},
        'At-Risk': {'open_rate': 0.20, 'click_rate': 0.04, 'conversion_rate': 0.02},
        'Lost': {'open_rate': 0.10, 'click_rate': 0.02, 'conversion_rate': 0.01}
    }
    
    # Campaign costs (per customer)
    CAMPAIGN_COSTS = {
        'email': 0.50,           # £0.50 per email
        'sms': 0.15,             # £0.15 per SMS
        'discount_5pct': 0.00,   # No direct cost (margin impact)
        'discount_10pct': 0.00,
        'discount_20pct': 0.00
    }
    
    def __init__(self, rfm_data: pd.DataFrame, transaction_data: pd.DataFrame):
        """
        Initialize strategy engine
        
        Args:
            rfm_data: RFM segmentation with customer segments
            transaction_data: Original transaction data for context
        """
        self.rfm_data = rfm_data
        self.transaction_data = transaction_data
        self.strategies = {}
        
    def calculate_ltv(self, customer_segment: str) -> float:
        """
        Calculate estimated Lifetime Value for segment.
        LTV = Avg Purchase Value × Purchase Frequency × Retention Span
        """
        segment_data = self.rfm_data[self.rfm_data['Segment'] == customer_segment]
        
        if len(segment_data) == 0:
            return 0
        
        avg_purchase_value = segment_data['Monetary'].mean() / segment_data['Frequency'].mean()
        
        # Retention spans vary by segment
        retention_spans = {
            'Champions': 3.0,           # 3 years for champions
            'Potential Loyalists': 2.0,  # 2 years for potential loyalists
            'At-Risk': 1.0,              # 1 year for at-risk
            'Lost': 0.5                  # 0.5 years for lost (recovery unlikely)
        }
        
        ltv = avg_purchase_value * segment_data['Frequency'].mean() * retention_spans.get(customer_segment, 1)
        return ltv
    
    def design_strategy_champions(self) -> Dict:
        """
        CHAMPIONS STRATEGY
        Customers: High R, F, M scores. Most loyal and highest-value.
        Goal: Maximize lifetime value, increase purchase frequency, create brand advocates.
        """
        segment_data = self.rfm_data[self.rfm_data['Segment'] == 'Champions']
        count = len(segment_data)
        avg_monetary = segment_data['Monetary'].mean()
        
        ltv = self.calculate_ltv('Champions')
        
        strategy = {
            'segment': 'Champions',
            'customer_count': count,
            'avg_ltv': ltv,
            
            'marketing_strategy': {
                'primary_channel': 'Email + VIP SMS',
                'email_frequency': 'Bi-weekly (premium content, early access)',
                'message_tone': 'Exclusive, appreciative, premium',
                'discount_strategy': 'No discounts (preserve margin). Instead: Loyalty rewards, VIP benefits.',
                'vip_benefits': [
                    'Free shipping on all orders',
                    'Priority customer support (dedicated account manager)',
                    'Early access to new products (3 days before launch)',
                    'Exclusive VIP member-only sales',
                    'Complimentary gift wrapping',
                    '2x points on loyalty program'
                ],
            },
            
            'campaigns': [
                {
                    'name': 'VIP Birthday Campaign',
                    'frequency': '1x per year',
                    'content': 'Personalized birthday email with £15 gift voucher',
                    'send_cost': 0.50,
                    'expected_response': 0.45,
                    'expected_aov_uplift': 45.00,
                    'expected_roi': 'Very High'
                },
                {
                    'name': 'Win-back Cross-sell',
                    'frequency': 'Quarterly',
                    'content': 'Recommend products from their non-preferred categories based on purchase history',
                    'send_cost': 0.50,
                    'expected_response': 0.12,
                    'expected_aov_uplift': 25.00,
                    'expected_roi': 'High'
                },
                {
                    'name': 'VIP Flash Sale',
                    'frequency': 'Monthly (48-hour window)',
                    'content': 'Exclusive 15% discount on curated items (Champions only)',
                    'send_cost': 0.50,
                    'discount_impact': -0.15,  # 15% margin impact
                    'expected_conversion': 0.25,
                    'expected_aov_uplift': 80.00,
                    'expected_roi': 'High (volume offsets discount)'
                }
            ],
            
            'annual_roi_projection': {
                'total_customers': count,
                'annual_campaign_cost': count * 0.50 * 26,  # 26 campaigns/year
                'expected_avg_increase': avg_monetary * 0.30,  # 30% increase in spend
                'expected_annual_revenue_impact': (avg_monetary * 0.30) * count,
                'net_roi': '250-350% (highest ROI segment)',
            }
        }
        return strategy
    
    def design_strategy_potential_loyalists(self) -> Dict:
        """
        POTENTIAL LOYALISTS STRATEGY
        Customers: Medium-high R, F, M. Growing engagement with growth potential.
        Goal: Move toward Champions tier through engagement & incentives.
        """
        segment_data = self.rfm_data[self.rfm_data['Segment'] == 'Potential Loyalists']
        count = len(segment_data)
        avg_monetary = segment_data['Monetary'].mean()
        ltv = self.calculate_ltv('Potential Loyalists')
        
        strategy = {
            'segment': 'Potential Loyalists',
            'customer_count': count,
            'avg_ltv': ltv,
            
            'marketing_strategy': {
                'primary_channel': 'Email + SMS',
                'email_frequency': 'Weekly (engagement focused)',
                'message_tone': 'Personal, growth-oriented, aspirational',
                'discount_strategy': '5-10% periodic discounts to increase frequency and AOV',
                'loyalty_focus': 'Build habit formation - encourage repeat purchases',
                'key_insight': 'These customers are on the edge of Champions tier. Push to move them up.'
            },
            
            'campaigns': [
                {
                    'name': 'Category Expansion Campaign',
                    'frequency': 'Bi-weekly',
                    'content': 'Introduce complementary product categories (customers only 40% of catalog depth)',
                    'send_cost': 0.50,
                    'discount': '5% for trying a new category',
                    'expected_conversion': 0.15,
                    'expected_aov_uplift': 35.00,
                    'expected_roi': 'High'
                },
                {
                    'name': 'Frequency Incentive (Loyalty Points)',
                    'frequency': 'Ongoing (real-time notifications)',
                    'content': 'SMS reminder: "3 more purchases to unlock VIP status!"',
                    'send_cost': 0.15,
                    'expected_conversion': 0.20,
                    'expected_aov_uplift': 20.00,
                    'expected_roi': 'Very High'
                },
                {
                    'name': 'Limited-Time Flash Offers',
                    'frequency': '2x per week',
                    'content': 'Targeted 10% discount on trending/high-margin items',
                    'send_cost': 0.50,
                    'discount_impact': -0.10,  # 10% margin impact
                    'expected_conversion': 0.18,
                    'expected_aov_uplift': 50.00,
                    'expected_roi': 'High'
                },
                {
                    'name': 'Referral Program Launch',
                    'frequency': '1x per month',
                    'content': 'Offer £10 credit for each friend referred + £10 for friend',
                    'send_cost': 0.50,
                    'expected_conversion': 0.08,
                    'expected_referral_value': 60.00,
                    'expected_roi': 'Very High (long-term customer acquisition)'
                }
            ],
            
            'annual_roi_projection': {
                'total_customers': count,
                'annual_campaign_cost': (count * 0.50 * 26) + (count * 0.15 * 104),  # Mixed email/SMS
                'expected_avg_increase': avg_monetary * 0.35,  # 35% increase (upgrade goal)
                'expected_annual_revenue_impact': (avg_monetary * 0.35) * count,
                'net_roi': '180-250% (strong segment)',
            }
        }
        return strategy
    
    def design_strategy_at_risk(self) -> Dict:
        """
        AT-RISK STRATEGY
        Customers: Low R, F, M. Engagement declining, risk of churn.
        Goal: Re-engage with compelling offers, understand churn drivers.
        """
        segment_data = self.rfm_data[self.rfm_data['Segment'] == 'At-Risk']
        count = len(segment_data)
        avg_monetary = segment_data['Monetary'].mean()
        ltv = self.calculate_ltv('At-Risk')
        
        strategy = {
            'segment': 'At-Risk',
            'customer_count': count,
            'avg_ltv': ltv,
            
            'marketing_strategy': {
                'primary_channel': 'Email + SMS (urgency)',
                'email_frequency': 'Targeted re-engagement (2x per week)',
                'message_tone': 'Apologetic, "We miss you", win-back focused',
                'discount_strategy': 'Aggressive: 15-20% discount to trigger re-engagement',
                'key_insight': 'This segment has already shown interest. Goal is to save relationships before they become Lost.',
                'timing': 'Send immediately (while sentiment still exists)'
            },
            
            'campaigns': [
                {
                    'name': '"We Miss You" Win-Back Campaign',
                    'frequency': '1x per week for 4 weeks',
                    'content': 'Email: "It\'s been [X days]. We\'ve added new products in your favorite categories. Here\'s 20% off to welcome you back."',
                    'send_cost': 0.50,
                    'discount': '20% on first purchase back',
                    'discount_impact': -0.20,
                    'expected_conversion': 0.25,  # Higher response due to urgency
                    'expected_aov_uplift': 40.00,
                    'expected_roi': 'Medium-High (saves 40-50% of segment)'
                },
                {
                    'name': 'Churn Prevention SMS Blast',
                    'frequency': '1x after 45 days of inactivity',
                    'content': 'SMS: "Don\'t miss 15% off. Reply SHOP to claim."',
                    'send_cost': 0.15,
                    'discount': '15% coupon code',
                    'expected_conversion': 0.12,
                    'expected_aov_uplift': 25.00,
                    'expected_roi': 'High'
                },
                {
                    'name': 'Feedback Survey + Incentive',
                    'frequency': '1x',
                    'content': 'Email asking "Why did you stop shopping? Take 2-min survey, get £5 credit."',
                    'send_cost': 0.50,
                    'incentive_cost': 5.00,  # £5 credit for survey completion
                    'expected_completion': 0.10,  # 10% response
                    'value': 'Qualitative insights into churn drivers',
                    'expected_roi': 'Medium (insights + re-engagement)'
                },
                {
                    'name': 'Special Clearance Offer',
                    'frequency': 'Quarterly',
                    'content': 'Email: "Clear old inventory with 20-30% clearance deals"',
                    'send_cost': 0.50,
                    'discount_impact': -0.25,  # Higher discount on low-margin items
                    'expected_conversion': 0.08,
                    'expected_aov_uplift': 30.00,
                    'expected_roi': 'Low-Medium (recovery efforts may fail)'
                }
            ],
            
            'annual_roi_projection': {
                'total_customers': count,
                'annual_campaign_cost': count * 0.50 * 26 + count * 0.15 * 12,  # Regular emails + SMS
                'expected_recovery_rate': 0.40,  # Recover 40% of segment
                'expected_avg_increase': avg_monetary * 0.20,  # 20% increase (from base)
                'expected_annual_revenue_impact': (avg_monetary * 0.20) * count * 0.40,
                'net_roi': '50-120% (depends on recovery rate)',
            }
        }
        return strategy
    
    def design_strategy_lost(self) -> Dict:
        """
        LOST STRATEGY
        Customers: Very low R, F, M. Inactive, minimal engagement.
        Goal: Last-ditch re-activation or graceful exit.
        """
        segment_data = self.rfm_data[self.rfm_data['Segment'] == 'Lost']
        count = len(segment_data)
        avg_monetary = segment_data['Monetary'].mean()
        ltv = self.calculate_ltv('Lost')
        
        strategy = {
            'segment': 'Lost',
            'customer_count': count,
            'avg_ltv': ltv,
            
            'marketing_strategy': {
                'primary_channel': 'Email (low-cost channel)',
                'email_frequency': 'Minimal (3-4x per year max)',
                'message_tone': 'Last-chance, value-focused',
                'discount_strategy': 'High discounts (25%+) but limited frequency',
                'key_insight': 'ROI low. Consider: Segment for list cleansing or special resurrection campaigns only.',
                'cost_management': 'Minimize spend. Only contact if potential high-value re-activation.'
            },
            
            'campaigns': [
                {
                    'name': 'Last-Chance Win-Back Campaign',
                    'frequency': '1x per year (e.g., holiday season)',
                    'content': 'Email: "Final offer: 25% off everything. Don\'t miss out again."',
                    'send_cost': 0.50,
                    'discount': '25% site-wide',
                    'discount_impact': -0.25,
                    'expected_conversion': 0.03,  # Very low response expected
                    'expected_aov_uplift': 35.00,
                    'expected_roi': 'Low'
                },
                {
                    'name': 'Email List Cleanse',
                    'frequency': '1x per year',
                    'content': 'Email: "Confirm you want to stay on our list" (engagement requirement)',
                    'send_cost': 0.30,
                    'expected_confirmation': 0.05,  # 5% re-confirm
                    'value': 'Reduce mailing costs, improve deliverability',
                    'expected_roi': 'Medium (cost reduction benefit)'
                },
                {
                    'name': 'Special Occasion Re-engagement',
                    'frequency': '2x per year (holidays, clearance)',
                    'content': 'Email: "Huge clearance. 30-40% off. Last chance."',
                    'send_cost': 0.30,
                    'discount_impact': -0.35,
                    'expected_conversion': 0.02,
                    'expected_aov_uplift': 25.00,
                    'expected_roi': 'Very Low'
                }
            ],
            
            'annual_roi_projection': {
                'total_customers': count,
                'annual_campaign_cost': count * 0.30 * 4,  # Minimal email frequency
                'expected_recovery_rate': 0.05,  # Only 5% expected to recover
                'expected_avg_increase': avg_monetary * 0.10,  # 10% (low)
                'expected_annual_revenue_impact': (avg_monetary * 0.10) * count * 0.05,
                'net_roi': '-20% to 30% (breakeven strategy)',
                'recommendation': 'Consider removing from active campaigns or focus on list cleanse.'
            }
        }
        return strategy
    
    def generate_comprehensive_report(self) -> str:
        """Generate comprehensive marketing strategy report"""
        report = "\n" + "█"*70 + "\n"
        report += "█" + " "*68 + "█\n"
        report += "█" + "  MARKETING STRATEGY & ROI ANALYSIS REPORT".center(68) + "█\n"
        report += "█" + " "*68 + "█\n"
        report += "█"*70 + "\n\n"
        
        strategies = [
            self.design_strategy_champions(),
            self.design_strategy_potential_loyalists(),
            self.design_strategy_at_risk(),
            self.design_strategy_lost()
        ]
        
        for strategy in strategies:
            segment = strategy['segment']
            report += f"\n{'='*70}\n"
            report += f"SEGMENT: {segment.upper()}\n"
            report += f"{'='*70}\n"
            report += f"Customer Count: {strategy['customer_count']:,}\n"
            report += f"Average LTV: £{strategy['avg_ltv']:.2f}\n\n"
            
            report += f"MARKETING STRATEGY:\n"
            for key, value in strategy['marketing_strategy'].items():
                if isinstance(value, list):
                    report += f"  {key}:\n"
                    for item in value:
                        report += f"    • {item}\n"
                else:
                    report += f"  {key}: {value}\n"
            
            report += f"\nCAMPAIGNS:\n"
            for i, campaign in enumerate(strategy['campaigns'], 1):
                report += f"\n  Campaign {i}: {campaign['name']}\n"
                for key, value in campaign.items():
                    if key != 'name':
                        report += f"    • {key}: {value}\n"
            
            report += f"\nANNUAL ROI PROJECTION:\n"
            for key, value in strategy['annual_roi_projection'].items():
                report += f"  {key}: {value}\n"
            
            self.strategies[segment] = strategy
        
        return report


def main():
    """Execute marketing strategy and ROI analysis"""
    # Setup local data paths
    data_dir = Path(__file__).resolve().parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Load data
    rfm_data = pd.read_csv(data_dir / "rfm_segmentation.csv")
    transaction_data = pd.read_csv(data_dir / "cleaned_ecommerce_data.csv")
    
    # Initialize strategy engine
    strategy_engine = MarketingStrategyROI(rfm_data, transaction_data)
    
    # Generate comprehensive report
    report = strategy_engine.generate_comprehensive_report()
    logger.info(report)
    
    # Save report
    output_path = data_dir / "marketing_strategy_roi.txt"
    with open(output_path, 'w') as f:
        f.write(report)
    
    logger.info(f"\n✓ Marketing strategy report saved to: {output_path}")
    
    return strategy_engine


if __name__ == "__main__":
    strategy_engine = main()
