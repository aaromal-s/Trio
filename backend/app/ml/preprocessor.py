"""
TRIO Preprocessing and Data Validation Engine
Enforces strict chronological train/test splitting and leakage-free feature scaling.
"""

from typing import Tuple, List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

class DataPreprocessor:
    def __init__(self, feature_cols: Optional[List[str]] = None, train_ratio: float = 0.7):
        self.feature_cols = feature_cols or []
        self.train_ratio = train_ratio
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.feature_means_: Dict[str, float] = {}
        
    def validate_dataset(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Validates the incoming dataset and returns structural metadata.
        """
        row_count = len(df)
        col_count = len(df.columns)
        missing_counts = df.isnull().sum().to_dict()
        total_missing = int(sum(missing_counts.values()))
        
        # Candidate numeric features
        numeric_cols = [c for c in df.select_dtypes(include=[np.number]).columns 
                        if not c.startswith("ground_truth") and c not in ["is_unknown", "is_anomaly"]]
        
        # Timestamp column detection
        timestamp_col = None
        for col in ["timestamp", "time", "date", "datetime", "Time", "Timestamp"]:
            if col in df.columns:
                timestamp_col = col
                break
                
        return {
            "row_count": row_count,
            "column_count": col_count,
            "total_missing": total_missing,
            "missing_per_column": missing_counts,
            "numeric_columns": numeric_cols,
            "timestamp_column": timestamp_col,
            "all_columns": list(df.columns),
            "is_valid": row_count >= 50 and len(numeric_cols) >= 2
        }

    def clean_and_prepare(self, df: pd.DataFrame, feature_cols: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Cleans missing values using forward fill followed by backward fill / median.
        """
        cleaned = df.copy()
        target_cols = feature_cols or self.feature_cols
        
        for col in target_cols:
            if col in cleaned.columns:
                # Forward fill time series first
                cleaned[col] = cleaned[col].ffill().bfill()
                if cleaned[col].isnull().any():
                    cleaned[col] = cleaned[col].fillna(0.0)
                    
        return cleaned

    def chronological_split(
        self, 
        df: pd.DataFrame, 
        train_ratio: Optional[float] = None
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Splits data chronologically without shuffling to prevent temporal data leakage.
        """
        ratio = train_ratio if train_ratio is not None else self.train_ratio
        split_idx = int(len(df) * ratio)
        train_df = df.iloc[:split_idx].copy().reset_index(drop=True)
        test_df = df.iloc[split_idx:].copy().reset_index(drop=True)
        return train_df, test_df

    def fit_transform_train(self, train_df: pd.DataFrame, feature_cols: List[str]) -> np.ndarray:
        """
        Fits scaler strictly on the training partition only.
        """
        self.feature_cols = feature_cols
        X_train = train_df[feature_cols].values.astype(float)
        X_scaled = self.scaler.fit_transform(X_train)
        self.is_fitted = True
        
        for idx, col in enumerate(feature_cols):
            self.feature_means_[col] = float(self.scaler.mean_[idx])
            
        return X_scaled

    def transform_test(self, test_df: pd.DataFrame) -> np.ndarray:
        """
        Transforms test observations using parameters fitted strictly on training data.
        """
        if not self.is_fitted:
            raise ValueError("Scaler has not been fitted. Call fit_transform_train first.")
        X_test = test_df[self.feature_cols].values.astype(float)
        return self.scaler.transform(X_test)

