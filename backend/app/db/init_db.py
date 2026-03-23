import json
import logging
from pathlib import Path

from sqlalchemy import text

from app.db.base import Base
from app.db.models import ProductModel
from app.db.session import SessionLocal, engine

logger = logging.getLogger(__name__)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    _migrate()
    with SessionLocal() as session:
        if session.query(ProductModel).count() == 0:
            _seed(session)


def _migrate() -> None:
    """Aplica migraciones incrementales (idempotentes)."""
    with engine.connect() as conn:
        conn.execute(text(
            "ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB"
        ))
        conn.commit()


def _seed(session) -> None:
    data_path = Path(__file__).parent.parent / "data" / "products.json"
    with open(data_path, encoding="utf-8") as f:
        raw = json.load(f)
    for item in raw:
        session.add(ProductModel(**item))
    session.commit()
    logger.info("Seeded %d products into database", len(raw))
