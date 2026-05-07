from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest


@dataclass
class ScoreResult:
    riskScore: float
    reason: str


MODEL_PATH = Path(__file__).resolve().parent / "models" / "isoforest.joblib"


def featurize(tx: dict[str, Any]) -> np.ndarray:
    amount = float(tx.get("amount", "0") or 0.0)
    gas = float(tx.get("gasFeeWei", "0") or 0.0)
    nonce = float(tx.get("nonce", 0) or 0.0)
    chain_id = float(tx.get("chainId", 0) or 0.0)
    # Basic features; designed to work with synthetic simulation traffic.
    return np.array([[amount, np.log1p(gas), nonce, chain_id]], dtype=np.float32)


def load_or_default_model() -> IsolationForest:
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)
    # Default model trained on a broad synthetic distribution.
    rng = np.random.default_rng(7)
    x = np.column_stack(
        [
            rng.lognormal(mean=0.0, sigma=1.2, size=10_000),  # amount
            rng.normal(loc=18.0, scale=1.0, size=10_000).clip(0, 30),  # log gas
            rng.integers(0, 200, size=10_000),
            rng.choice([1, 137, 31337], size=10_000),
        ]
    ).astype(np.float32)
    m = IsolationForest(n_estimators=300, contamination=0.02, random_state=7)
    m.fit(x)
    return m


MODEL = load_or_default_model()


def score(tx: dict[str, Any]) -> ScoreResult:
    x = featurize(tx)

    amount = float(tx.get("amount", "0") or 0.0)
    gas = float(tx.get("gasFeeWei", "0") or 0.0)

    # Heuristic pre-filters (fast, explainable).
    if amount <= 0:
        return ScoreResult(riskScore=0.75, reason="zero_or_negative_amount")
    if gas > 100e9:
        return ScoreResult(riskScore=0.85, reason="abnormally_high_gas")

    # IsolationForest score: higher => more normal, lower => anomalous.
    raw = float(MODEL.score_samples(x)[0])
    # Normalize to 0..1 risk (approx). Raw typically in [-0.8..0.2]
    risk = float(np.clip((0.1 - raw) / 0.6, 0.0, 1.0))

    reason = "isolation_forest_anomaly" if risk >= 0.65 else "normal"
    return ScoreResult(riskScore=risk, reason=reason)

