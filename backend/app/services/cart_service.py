import logging

from fastapi import HTTPException

from app.schemas.cart import (
    CartItem,
    CartValidationResponse,
    ValidatedCartItem,
)
from app.services.product_service import get_product_by_id

logger = logging.getLogger(__name__)

TAX_RATE = 0.21  # 21 % IVA
SHIPPING_FLAT = 5.99  # Flat shipping cost


def validate_cart(items: list[CartItem]) -> CartValidationResponse:
    """Validate cart items against current product data and compute totals."""
    validated: list[ValidatedCartItem] = []

    for item in items:
        product = get_product_by_id(item.product_id)
        if product is None:
            raise HTTPException(
                status_code=400,
                detail=f"Producto no encontrado: {item.product_id}",
            )
        if item.quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para {product.name}. Disponible: {product.stock}",
            )
        line_subtotal = round(product.price * item.quantity, 2)
        validated.append(
            ValidatedCartItem(
                product_id=product.id,
                name=product.name,
                price=product.price,
                quantity=item.quantity,
                subtotal=line_subtotal,
                image_url=product.image_url,
            )
        )

    subtotal = round(sum(v.subtotal for v in validated), 2)
    tax = round(subtotal * TAX_RATE, 2)
    shipping = SHIPPING_FLAT if subtotal > 0 else 0.0
    total = round(subtotal + tax + shipping, 2)

    logger.info("Cart validated: %d items, total=%.2f EUR", len(validated), total)

    return CartValidationResponse(
        items=validated,
        subtotal=subtotal,
        tax=tax,
        shipping=shipping,
        total=total,
    )
