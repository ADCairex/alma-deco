from fastapi import APIRouter, HTTPException

from app.schemas.product import Product
from app.services.product_service import get_all_products, get_product_by_id

router = APIRouter(prefix="/api", tags=["products"])


@router.get("/products", response_model=list[Product])
async def list_products():
    return get_all_products()


@router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product
