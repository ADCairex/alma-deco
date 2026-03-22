import logging
import mimetypes
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Header, HTTPException, UploadFile

from app.core.config import settings
from app.schemas.order import MetricsResponse, OrderSchema
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.services import order_service, product_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])

UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _verify_token(x_admin_token: str | None) -> None:
    if x_admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Token de administrador inválido")


# --- Upload ---

@router.post("/upload")
async def upload_images(
    files: list[UploadFile],
    x_admin_token: str | None = Header(default=None),
):
    _verify_token(x_admin_token)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    urls: list[str] = []
    for file in files:
        content_type = file.content_type or mimetypes.guess_type(file.filename or "")[0] or ""
        if content_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail=f"Tipo de archivo no permitido: {content_type}")
        data = await file.read()
        if len(data) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="El archivo supera el tamaño máximo de 10 MB")
        suffix = Path(file.filename or "img.jpg").suffix or ".jpg"
        filename = f"{uuid4().hex}{suffix}"
        (UPLOAD_DIR / filename).write_bytes(data)
        urls.append(f"/uploads/{filename}")
    return {"urls": urls}


# --- Metrics ---

@router.get("/metrics", response_model=MetricsResponse)
def get_metrics(x_admin_token: str | None = Header(default=None)):
    _verify_token(x_admin_token)
    return order_service.get_metrics()


# --- Orders ---

@router.get("/orders", response_model=list[OrderSchema])
def list_orders(x_admin_token: str | None = Header(default=None)):
    _verify_token(x_admin_token)
    return order_service.get_orders()


# --- Products ---

@router.get("/products", response_model=list[Product])
def list_products(x_admin_token: str | None = Header(default=None)):
    _verify_token(x_admin_token)
    return product_service.get_all_products()


@router.post("/products", response_model=Product, status_code=201)
def create_product(
    data: ProductCreate,
    x_admin_token: str | None = Header(default=None),
):
    _verify_token(x_admin_token)
    return product_service.create_product(data)


@router.put("/products/{product_id}", response_model=Product)
def update_product(
    product_id: str,
    data: ProductUpdate,
    x_admin_token: str | None = Header(default=None),
):
    _verify_token(x_admin_token)
    return product_service.update_product(product_id, data)


@router.delete("/products/{product_id}", status_code=204)
def delete_product(
    product_id: str,
    x_admin_token: str | None = Header(default=None),
):
    _verify_token(x_admin_token)
    product_service.delete_product(product_id)
