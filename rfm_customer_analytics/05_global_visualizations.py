"""
Global Visualizations: RFM Heatmap & Interactive Country Map
Seaborn correlation heatmap and Plotly interactive geographic analysis
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class GlobalVisualizations:
    """
    Production-grade visualization engine for RFM analysis and geographic insights.
    """
    
    def __init__(self, rfm_data: pd.DataFrame, transaction_data: pd.DataFrame, output_dir: str = None):
        """
        Initialize visualization engine
        
        Args:
            rfm_data: RFM segmentation data with customer segments
            transaction_data: Original transaction data with geographic info
            output_dir: Directory to save output files (defaults to script dir/data)
        """
        self.rfm_data = rfm_data
        self.transaction_data = transaction_data
        self.output_dir = output_dir or str(Path(__file__).resolve().parent / "data")
        
        # Merge for geographic analysis
        self.merged_data = self._prepare_merged_data()
    
    def _prepare_merged_data(self) -> pd.DataFrame:
        """Merge RFM data with transaction data for geographic analysis"""
        # Get country for each customer (most frequent)
        customer_country = self.transaction_data.groupby('Customer_ID')['Country'].agg(
            lambda x: x.mode()[0] if len(x.mode()) > 0 else x.iloc[0]
        ).reset_index()
        customer_country.columns = ['Customer_ID', 'Country']
        
        # Merge with RFM data
        merged = self.rfm_data.merge(customer_country, on='Customer_ID', how='left')
        return merged
    
    def create_rfm_correlation_heatmap(self) -> str:
        """
        Create professional Seaborn heatmap showing correlation between RFM metrics.
        Visualization helps identify relationships between customer behavior dimensions.
        """
        logger.info("\n" + "="*60)
        logger.info("CREATING RFM CORRELATION HEATMAP")
        logger.info("="*60)
        
        # Select RFM metrics for correlation
        rfm_metrics = self.rfm_data[['Recency', 'Frequency', 'Monetary', 'R_Score', 'F_Score', 'M_Score', 'RFM_Score']]
        
        # Calculate correlation matrix
        correlation_matrix = rfm_metrics.corr()
        
        logger.info("\nCorrelation Matrix:")
        logger.info(correlation_matrix.to_string())
        
        # Create figure
        plt.figure(figsize=(12, 9))
        
        # Create heatmap with professional styling
        sns.heatmap(
            correlation_matrix,
            annot=True,                    # Show correlation values
            fmt='.2f',                     # Format to 2 decimal places
            cmap='RdYlGn',                 # Red-Yellow-Green colormap (intuitive)
            center=0,                      # Center colormap at 0
            square=True,                   # Square cells
            linewidths=2,                  # Cell borders
            cbar_kws={'label': 'Correlation Coefficient'},
            vmin=-1, vmax=1               # Correlation range
        )
        
        plt.title('RFM Metrics Correlation Matrix\nCustomer Behavior Dimensions', 
                  fontsize=16, fontweight='bold', pad=20)
        plt.xlabel('RFM Metrics', fontsize=12, fontweight='bold')
        plt.ylabel('RFM Metrics', fontsize=12, fontweight='bold')
        plt.xticks(rotation=45, ha='right')
        plt.yticks(rotation=0)
        plt.tight_layout()
        
        # Save figure
        output_path = Path(self.output_dir) / 'rfm_correlation_heatmap.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        logger.info(f"✓ Heatmap saved to: {output_path}")
        
        plt.close()
        return output_path
    
    def create_segment_distribution_heatmap(self) -> str:
        """
        Create heatmap showing segment distribution by country.
        Shows which segments are strongest in which geographic markets.
        """
        logger.info("\n" + "="*60)
        logger.info("CREATING SEGMENT-BY-COUNTRY HEATMAP")
        logger.info("="*60)
        
        # Create crosstab of countries and segments
        segment_by_country = pd.crosstab(
            self.merged_data['Country'],
            self.merged_data['Segment'],
            normalize='index'  # Normalize by country (% within each country)
        ) * 100
        
        logger.info("\nSegment Distribution by Country (%):")
        logger.info(segment_by_country.to_string())
        
        # Create figure
        plt.figure(figsize=(12, 8))
        
        # Create heatmap
        sns.heatmap(
            segment_by_country,
            annot=True,
            fmt='.1f',
            cmap='YlOrRd',
            linewidths=2,
            cbar_kws={'label': 'Percentage (%)'},
            vmin=0, vmax=50
        )
        
        plt.title('Customer Segment Distribution by Country\n(% within each country)',
                  fontsize=16, fontweight='bold', pad=20)
        plt.xlabel('Customer Segment', fontsize=12, fontweight='bold')
        plt.ylabel('Country', fontsize=12, fontweight='bold')
        plt.xticks(rotation=45, ha='right')
        plt.yticks(rotation=0)
        plt.tight_layout()
        
        # Save figure
        output_path = Path(self.output_dir) / 'segment_by_country_heatmap.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        logger.info(f"✓ Heatmap saved to: {output_path}")
        
        plt.close()
        return output_path
    
    def create_interactive_champions_map(self) -> str:
        """
        Create interactive Plotly map showing Champions count by country.
        Includes geographic visualization with hover details.
        """
        logger.info("\n" + "="*60)
        logger.info("CREATING INTERACTIVE CHAMPIONS MAP")
        logger.info("="*60)
        
        # Count Champions by country
        champions_by_country = self.merged_data[
            self.merged_data['Segment'] == 'Champions'
        ].groupby('Country').agg({
            'Customer_ID': 'count',
            'Monetary': ['sum', 'mean'],
            'Frequency': 'mean'
        }).reset_index()
        
        champions_by_country.columns = ['Country', 'Champions_Count', 'Total_Monetary', 'Avg_Monetary', 'Avg_Frequency']
        
        # Add ISO codes for Plotly
        iso_codes = {
            'USA': 'USA',
            'UK': 'GBR',
            'Germany': 'DEU',
            'France': 'FRA'
        }
        champions_by_country['ISO_Code'] = champions_by_country['Country'].map(iso_codes)
        
        logger.info("\nChampions by Country:")
        logger.info(champions_by_country.to_string(index=False))
        
        # Create choropleth map
        fig = go.Figure(data=go.Choropleth(
            locations=champions_by_country['ISO_Code'],
            z=champions_by_country['Champions_Count'],
            text=champions_by_country['Country'],
            colorscale='Greens',
            autocolorscale=False,
            reversescale=False,
            marker_line_color='darkgray',
            marker_line_width=2,
            colorbar=dict(
                title='Champion<br>Customers',
                thickness=15,
                len=0.7
            ),
            customdata=champions_by_country[['Champions_Count', 'Total_Monetary', 'Avg_Monetary']],
            hovertemplate='<b>%{text}</b><br>' +
                         'Champions: %{customdata[0]}<br>' +
                         'Total Value: £%{customdata[1]:.0f}<br>' +
                         'Avg Value: £%{customdata[2]:.2f}<extra></extra>'
        ))
        
        fig.update_layout(
            title={
                'text': '<b>Global Champions Distribution by Country</b>',
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 18}
            },
            geo=dict(
                showland=True,
                landcolor='rgb(243, 243, 243)',
                projection_type='natural earth',
                coastlinecolor='rgb(204, 204, 204)',
            ),
            height=600,
            margin={'l': 0, 'r': 0, 't': 50, 'b': 0}
        )
        
        # Save figure
        output_path = Path(self.output_dir) / 'interactive_champions_map.html'
        fig.write_html(output_path)
        logger.info(f"✓ Interactive map saved to: {output_path}")
        
        return output_path
    
    def create_segment_metrics_dashboard(self) -> str:
        """
        Create comprehensive dashboard with multiple segment visualizations.
        """
        logger.info("\n" + "="*60)
        logger.info("CREATING SEGMENT METRICS DASHBOARD")
        logger.info("="*60)
        
        # Create subplot figure with 4 visualizations
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Segment Count Distribution', 'Average RFM Scores by Segment',
                          'Average Monetary Value by Segment', 'Average Recency by Segment'),
            specs=[[{'type': 'pie'}, {'type': 'bar'}],
                   [{'type': 'bar'}, {'type': 'bar'}]]
        )
        
        # Data preparation
        segment_summary = self.rfm_data.groupby('Segment').agg({
            'Customer_ID': 'count',
            'RFM_Score': 'mean',
            'Monetary': 'mean',
            'Recency': 'mean'
        }).reset_index()
        segment_summary.columns = ['Segment', 'Count', 'Avg_RFM_Score', 'Avg_Monetary', 'Avg_Recency']
        # Ensure consistent segment order and a 5-color palette
        segments_order = ['Champions', 'Potential Loyalists', 'At-Risk', 'Lost', 'Other']
        segment_summary = (
            segment_summary.set_index('Segment')
            .reindex(segments_order)
            .fillna(0)
            .reset_index()
        )

        # Define a clear 5-color palette and map it to segments
        color_map = {
            'Champions': '#00CC96',            # strong green
            'Potential Loyalists': '#00BF7D',  # green
            'Other': '#FFA630',                # orange
            'At-Risk': '#EF553B',              # red/orange
            'Lost': '#636EFA'                  # purple/neutral
        }
        colors = [color_map.get(s, '#888888') for s in segment_summary['Segment']]

        # 1. Pie chart - Segment distribution
        fig.add_trace(
            go.Pie(
                labels=segment_summary['Segment'],
                values=segment_summary['Count'],
                name='Customer Count',
                textposition='inside',
                textinfo='label+percent',
                marker=dict(colors=colors)
            ),
            row=1, col=1
        )

        # 2. Bar chart - Average RFM Scores
        fig.add_trace(
            go.Bar(
                x=segment_summary['Segment'],
                y=segment_summary['Avg_RFM_Score'],
                name='Avg RFM Score',
                marker_color=colors,
                text=segment_summary['Avg_RFM_Score'].round(2),
                textposition='outside'
            ),
            row=1, col=2
        )

        # 3. Bar chart - Average Monetary Value
        fig.add_trace(
            go.Bar(
                x=segment_summary['Segment'],
                y=segment_summary['Avg_Monetary'],
                name='Avg Monetary Value',
                marker_color=colors,
                text=['£' + f"{v:.2f}" for v in segment_summary['Avg_Monetary']],
                textposition='outside'
            ),
            row=2, col=1
        )

        # 4. Bar chart - Average Recency
        fig.add_trace(
            go.Bar(
                x=segment_summary['Segment'],
                y=segment_summary['Avg_Recency'],
                name='Avg Recency (days)',
                marker_color=colors,
                text=segment_summary['Avg_Recency'].round(0).astype(int).astype(str),
                textposition='outside'
            ),
            row=2, col=2
        )
        
        # Update layout
        fig.update_layout(
            title_text='<b>Customer Segment Analysis Dashboard</b>',
            height=800,
            showlegend=False,
            hovermode='x unified'
        )
        
        # Update axes labels
        fig.update_xaxes(title_text='Segment', row=1, col=2)
        fig.update_yaxes(title_text='Avg RFM Score', row=1, col=2)
        
        fig.update_xaxes(title_text='Segment', row=2, col=1)
        fig.update_yaxes(title_text='Avg Monetary (£)', row=2, col=1)
        
        fig.update_xaxes(title_text='Segment', row=2, col=2)
        fig.update_yaxes(title_text='Avg Recency (days)', row=2, col=2)
        
        # Save figure
        output_path = Path(self.output_dir) / 'segment_metrics_dashboard.html'
        fig.write_html(output_path)
        logger.info(f"✓ Dashboard saved to: {output_path}")
        
        return output_path
    
    def create_all_visualizations(self) -> dict:
        """Create all visualizations"""
        logger.info("\n" + "█"*70)
        logger.info("█" + " "*68 + "█")
        logger.info("█" + "  GLOBAL VISUALIZATIONS - RFM & GEOGRAPHIC ANALYSIS".center(68) + "█")
        logger.info("█" + " "*68 + "█")
        logger.info("█"*70)
        
        outputs = {
            'rfm_correlation_heatmap': self.create_rfm_correlation_heatmap(),
            'segment_by_country_heatmap': self.create_segment_distribution_heatmap(),
            'interactive_champions_map': self.create_interactive_champions_map(),
            'segment_metrics_dashboard': self.create_segment_metrics_dashboard()
        }
        
        logger.info("\n" + "="*60)
        logger.info("ALL VISUALIZATIONS CREATED")
        logger.info("="*60)
        for name, path in outputs.items():
            logger.info(f"✓ {name}: {path}")
        
        return outputs


def main():
    """Execute visualization creation"""
    # Setup local data paths
    data_dir = Path(__file__).resolve().parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Load data
    rfm_data = pd.read_csv(data_dir / "rfm_segmentation.csv")
    transaction_data = pd.read_csv(data_dir / "cleaned_ecommerce_data.csv")
    transaction_data['Transaction_Date'] = pd.to_datetime(transaction_data['Transaction_Date'])
    
    # Initialize visualization engine
    viz_engine = GlobalVisualizations(rfm_data, transaction_data, str(data_dir))
    
    # Create all visualizations
    outputs = viz_engine.create_all_visualizations()
    
    return outputs


if __name__ == "__main__":
    outputs = main()
