from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field

from .model import score


class TxIn(BaseModel):
    from_: str = Field(alias="from")
    to: str
    amount: str
    gasFeeWei: str
    nonce: int
    chainId: int


app = FastAPI(title="DeFiSecure AI Engine", version="1.0.0")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/score")
def score_tx(tx: TxIn):
    r = score(tx.model_dump(by_alias=True))
    return {"riskScore": r.riskScore, "reason": r.reason}

