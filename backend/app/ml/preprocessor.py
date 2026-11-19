"""
TRIO Preprocessing and Data Validation Engine
Enforces strict chronological train/test splitting, leakage-free feature scaling,
robust CSV ingestion with auto-detection of timestamps and dynamic numeric features.
"""

from typing import Tuple, List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import re
import logging

logger = logging.getLogger("trio.preprocessor")


class DataPreprocessor:
    """
    Robust Data Preprocessor for Industrial Time-Series Telemetry.
    - Handles arbitrary sensor counts (N >= 2)
    - Auto-detects timestamp columns in diverse formats
    - Cleans numeric columns with dirty strings (whitespace, commas, units)
    - Sorts timestamps chronologically and handles duplicates safely
    - Imputes missing values (ffill -> bfill -> median -> 0.0)
    - Strict chronological splitting to prevent data leakage
    """

    TIMESTAMP_CANDIDATE_NAMES = {
        "timestamp", "time", "date", "datetime", "ts",
        "timestamputc", "timeutc", "recordedat", "epoch",
        "time_stamp", "date_time", "datetime_utc", "clock"
    }

    LABEL_PATTERNS = {
        "ground_truth", "is_unknown", "is_anomaly", "label",
        "target", "attack", "status", "class", "anomaly", "state"
    }

    def __init__(self, feature_cols: Optional[List[str]] = None, train_ratio: float = 0.7):
        self.feature_cols = feature_cols or []
        self.train_ratio = train_ratio
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.feature_means_: Dict[str, float] = {}

    def _is_timestamp_col(self, col_name: str, series: pd.Series) -> bool:
        """Heuristically identify if a column represents time/date."""
        normalized = re.sub(r"[^a-zA-Z0-9]", "", str(col_name)).lower()
        if normalized in self.TIMESTAMP_CANDIDATE_NAMES:
            return True

        # Check if already datetime dtype
        if pd.api.types.is_datetime64_any_dtype(series):
            return True

        # Sample non-empty string values to see if parseable as datetime
        if series.dtype == object or str(series.dtype) == "string":
            sample = series.dropna().head(10).astype(str)
            if len(sample) >= 3:
                try:
                    parsed = pd.to_datetime(sample, errors="coerce")
                    if parsed.notnull().sum() >= len(sample) * 0.8:
                        return True
                except Exception:
                    pass

        return False

    def _try_clean_numeric_series(self, series: pd.Series) -> Optional[pd.Series]:
        """
        Attempts to clean and convert a series to float numeric values.
        Strips whitespace, thousands separators (commas), quotes, units.
        Handles both US/UK format (1,200.50) and European format (1.200,50 or 25,4).
        Returns numeric Series if >= 70% of non-empty values are valid numbers, else None.
        """
        if pd.api.types.is_numeric_dtype(series):
            return pd.to_numeric(series, errors="coerce")

        if series.dtype == object or str(series.dtype) == "string":
            s = series.astype(str).str.strip().str.replace(r"^[\"']|[\"']$", "", regex=True)
            non_empty = s[~s.isin(["", "nan", "null", "none", "n/a", "na", "-", "?"])]
            if len(non_empty) == 0:
                return None

            # Detect European decimal comma (e.g. "25,4" or "1.200,50")
            has_eu_comma_dec = non_empty.str.contains(r"^\s*-?\d+,\d+\s*$", regex=True).mean() > 0.5
            has_eu_thousands = non_empty.str.contains(r"^\s*-?\d{1,3}(?:\.\d{3})+(?:,\d+)?\s*$", regex=True).mean() > 0.5

            if has_eu_thousands or has_eu_comma_dec:
                cleaned_str = s.str.replace(".", "", regex=False).str.replace(",", ".", regex=False)
            else:
                cleaned_str = s.str.replace(",", "", regex=False)

            cleaned_str = cleaned_str.replace(["nan", "null", "none", "n/a", "na", "-", "?", "inf", "-inf"], np.nan)
            converted = pd.to_numeric(cleaned_str, errors="coerce")
            valid_ratio = converted.notnull().sum() / max(1, len(non_empty))
            if valid_ratio >= 0.7:
                return converted

        return None

    def validate_dataset(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Validates the incoming dataset and returns structural metadata and diagnostics.
        """
        row_count = len(df)
        col_count = len(df.columns)
        errors: List[str] = []

        if row_count == 0:
            errors.append("The uploaded CSV file is empty (0 rows).")

        # Clean column names
        cleaned_cols = [str(c).strip() for c in df.columns]
        df.columns = cleaned_cols

        # Detect timestamp column
        timestamp_col = None
        for col in df.columns:
            if self._is_timestamp_col(col, df[col]):
                timestamp_col = col
                break

        # Detect valid numeric sensor columns
        numeric_cols: List[str] = []
        missing_counts: Dict[str, int] = {}

        for col in df.columns:
            # Skip timestamp column
            if col == timestamp_col:
                continue

            # Skip ground truth labels
            norm_col = col.lower().strip()
            if any(norm_col == p or norm_col.startswith(p) for p in self.LABEL_PATTERNS):
                continue

            num_series = self._try_clean_numeric_series(df[col])
            if num_series is not None:
                numeric_cols.append(col)
                missing_counts[col] = int(num_series.isnull().sum())
            else:
                missing_counts[col] = int(df[col].isnull().sum())

        total_missing = sum(missing_counts.values())

        # Check for transposed / sensor-oriented matrix candidate
        is_transposed_candidate = False
        transposition_reason = ""
        if row_count < 50 and col_count >= 50:
            is_transposed_candidate = True
            transposition_reason = (
                f"Dataset contains {row_count} rows and {col_count} columns. "
                "This indicates a transposed/sensor-oriented layout where sensors are rows and observations are columns."
            )

        if row_count < 50:
            errors.append(
                f"Your uploaded CSV contains {row_count} observations. "
                "TRIO requires at least 50 observations for this training workflow. "
                "Please upload a dataset containing at least 50 chronological observations."
            )

        if len(numeric_cols) < 2:
            errors.append(
                f"Dataset contains {len(numeric_cols)} numeric sensor columns (minimum required is 2). "
                f"Detected numeric features: {numeric_cols if numeric_cols else 'None'}."
            )

        is_valid = (row_count >= 50) and (len(numeric_cols) >= 2)

        return {
            "row_count": row_count,
            "column_count": col_count,
            "total_missing": total_missing,
            "missing_per_column": missing_counts,
            "numeric_columns": numeric_cols,
            "timestamp_column": timestamp_col,
            "all_columns": list(df.columns),
            "is_transposed_candidate": is_transposed_candidate,
            "transposition_reason": transposition_reason,
            "is_valid": is_valid,
            "errors": errors,
        }

    def clean_and_prepare(
        self,
        df: pd.DataFrame,
        feature_cols: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Cleans missing values, handles duplicate and unsorted timestamps,
        and converts numeric columns to float.
        """
        cleaned = df.copy()
        cleaned.columns = [str(c).strip() for c in cleaned.columns]

        # 1. Detect or synthesize timestamp column
        timestamp_col = None
        for col in cleaned.columns:
            if self._is_timestamp_col(col, cleaned[col]):
                timestamp_col = col
                break

        if timestamp_col:
            try:
                dt_series = pd.to_datetime(cleaned[timestamp_col], errors="coerce")
                if dt_series.notnull().sum() >= len(cleaned) * 0.8:
                    if not dt_series.is_monotonic_increasing:
                        cleaned["_dt_sort"] = dt_series
                        cleaned = cleaned.sort_values(by="_dt_sort").drop(columns=["_dt_sort"]).reset_index(drop=True)
                    if cleaned[timestamp_col].duplicated().any():
                        cleaned = cleaned.drop_duplicates(subset=[timestamp_col], keep="first").reset_index(drop=True)
            except Exception as e:
                logger.warning("Timestamp normalization warning: %s", e)
        else:
            cleaned["timestamp"] = [f"T{i+1:05d}" for i in range(len(cleaned))]

        # 2. Convert and clean target feature columns
        target_cols = feature_cols or self.feature_cols
        for col in target_cols:
            if col in cleaned.columns:
                cleaned_num = self._try_clean_numeric_series(cleaned[col])
                if cleaned_num is not None:
                    cleaned[col] = cleaned_num
                else:
                    cleaned[col] = pd.to_numeric(cleaned[col], errors="coerce")
                # Forward-fill time series observations
                cleaned[col] = cleaned[col].ffill()
                # Backward-fill initial gap
                cleaned[col] = cleaned[col].bfill()
                # Impute with column median
                if cleaned[col].isnull().any():
                    col_median = cleaned[col].median()
                    cleaned[col] = cleaned[col].fillna(col_median if pd.notnull(col_median) else 0.0)
                # Handle inf / -inf
                cleaned[col] = cleaned[col].replace([np.inf, -np.inf], 0.0)
                # Final safety guarantee: if any NaN still exists (e.g. all empty) fill with 0.0
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
        split_idx = max(10, min(split_idx, len(df) - 5))
        train_df = df.iloc[:split_idx].copy().reset_index(drop=True)
        test_df = df.iloc[split_idx:].copy().reset_index(drop=True)
        return train_df, test_df

    def fit_transform_train(self, train_df: pd.DataFrame, feature_cols: List[str]) -> np.ndarray:
        """
        Fits scaler strictly on the training partition only.
        """
        self.feature_cols = feature_cols
        X_train = train_df[feature_cols].values.astype(float)
        X_train = np.nan_to_num(X_train, nan=0.0, posinf=0.0, neginf=0.0)
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
        X_test = np.nan_to_num(X_test, nan=0.0, posinf=0.0, neginf=0.0)
        return self.scaler.transform(X_test)
