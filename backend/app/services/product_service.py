from fastapi import HTTPException

from app.db.models import ProductModel
from app.db.session import SessionLocal
from app.schemas.product import Product, ProductCreate, ProductUpdate


def _row_to_schema(row: ProductModel) -> Product:
    images: list[str] = list(row.images) if row.images else [row.image_url]
    return Product(
        id=row.id,
        name=row.name,
        price=float(row.price),
        currency=row.currency,
        image_url=row.image_url,
        images=images,
        description=row.description,
        category=row.category,
        stock=row.stock,
    )


def get_all_products() -> list[Product]:
    with SessionLocal() as session:
        rows = session.query(ProductModel).all()
    return [_row_to_schema(r) for r in rows]


def get_product_by_id(product_id: str) -> Product | None:
    with SessionLocal() as session:
        row = session.get(ProductModel, product_id)
    return _row_to_schema(row) if row else None


def create_product(data: ProductCreate) -> Product:
    with SessionLocal() as session:
        existing = session.get(ProductModel, data.id)
        if existing:
            raise HTTPException(status_code=409, detail=f"Ya existe un producto con id '{data.id}'")
        payload = data.model_dump()
        row = ProductModel(**payload)
        session.add(row)
        session.commit()
        session.refresh(row)
        return _row_to_schema(row)


def update_product(product_id: str, data: ProductUpdate) -> Product:
    with SessionLocal() as session:
        row = session.get(ProductModel, product_id)
        if not row:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(row, field, value)
        session.commit()
        session.refresh(row)
        return _row_to_schema(row)


def delete_product(product_id: str) -> None:
    with SessionLocal() as session:
        row = session.get(ProductModel, product_id)
        if not row:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        session.delete(row)
        session.commit()
