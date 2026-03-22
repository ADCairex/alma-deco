import logging

import httpx
from fastapi import HTTPException

from app.core.config import settings
from app.schemas.cart import CartItem
from app.services.cart_service import validate_cart

logger = logging.getLogger(__name__)


async def _get_access_token() -> str:
    """Obtain an OAuth2 access token from PayPal using client credentials."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.PAYPAL_BASE_URL}/v1/oauth2/token",
            data={"grant_type": "client_credentials"},
            auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
            headers={"Accept": "application/json"},
        )
    if response.status_code != 200:
        logger.error("PayPal auth failed: %s", response.text)
        raise HTTPException(status_code=502, detail="Error de autenticación con PayPal")
    return response.json()["access_token"]


async def create_order(items: list[CartItem]) -> str:
    """Create a PayPal order and return the order ID."""
    cart = validate_cart(items)
    token = await _get_access_token()

    purchase_items = []
    for item in cart.items:
        purchase_items.append(
            {
                "name": item.name,
                "quantity": str(item.quantity),
                "unit_amount": {
                    "currency_code": "EUR",
                    "value": f"{item.price:.2f}",
                },
            }
        )

    order_body = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "EUR",
                    "value": f"{cart.total:.2f}",
                    "breakdown": {
                        "item_total": {
                            "currency_code": "EUR",
                            "value": f"{cart.subtotal:.2f}",
                        },
                        "tax_total": {
                            "currency_code": "EUR",
                            "value": f"{cart.tax:.2f}",
                        },
                        "shipping": {
                            "currency_code": "EUR",
                            "value": f"{cart.shipping:.2f}",
                        },
                    },
                },
                "items": purchase_items,
            }
        ],
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders",
            json=order_body,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
        )

    if response.status_code not in (200, 201):
        logger.error("PayPal create order failed: %s", response.text)
        raise HTTPException(status_code=502, detail="Error al crear orden en PayPal")

    order_id = response.json()["id"]
    logger.info("PayPal order created: %s", order_id)
    return order_id


async def capture_order(order_id: str) -> dict:
    """Capture a previously approved PayPal order."""
    token = await _get_access_token()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
        )

    if response.status_code not in (200, 201):
        logger.error("PayPal capture failed: %s", response.text)
        raise HTTPException(status_code=502, detail="Error al capturar pago en PayPal")

    data = response.json()
    status = data.get("status", "UNKNOWN")
    logger.info("PayPal order %s captured: %s", order_id, status)
    return {"status": status, "order_id": order_id}
