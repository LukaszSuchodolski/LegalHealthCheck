import json
import os
from pathlib import Path
from threading import RLock

# core/files.py -> app -> backend -> <ROOT>  (trzy poziomy w górę)
DATA_DIR = Path(os.getenv("LHC_DATA_DIR", Path(__file__).resolve().parents[3] / "data")).resolve()
_lock = RLock()


def read_json(rel_path: str):
    p = DATA_DIR / rel_path
    with _lock, p.open("r", encoding="utf-8") as f:
        return json.load(f)
