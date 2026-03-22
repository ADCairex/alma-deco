import logging

import stripe
from fastapi import HTTPException

from app.core.config import settings
from app.schemas.cart import CartItem, CartValidationResponse
from app.services.cart_service import validate_cart

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_checkout_session(
    items: list[CartItem], cart: CartValidationResponse | None = None
) -> tuple[str, str]:
    """Create a Stripe Checkout Session and return (redirect_url, session_id)."""
    if cart is None:
        cart = validate_cart(items)

    line_items = []
    for item in cart.items:
        line_items.append(
            {
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": item.name,
                        "images": [item.image_url],
                    },
                    "unit_amount": int(item.price * 100),  # cents
                },
                "quantity": item.quantity,
            }
        )

    # Add tax as a separate line item
    if cart.tax > 0:
        line_items.append(
            {
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": "IVA (21%)"},
                    "unit_amount": int(cart.tax * 100),
                },
                "quantity": 1,
            }
        )

    # Add shipping as a separate line item
    if cart.shipping > 0:
        line_items.append(
            {
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": "Envío"},
                    "unit_amount": int(cart.shipping * 100),
                },
                "quantity": 1,
            }
        )

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=settings.FRONTEND_SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=settings.FRONTEND_CANCEL_URL,
        )
        logger.info("Stripe session created: %s", session.id)
        return session.url, session.id
    except stripe.StripeError as e:
        logger.error("Stripe error: %s", str(e))
        raise HTTPException(status_code=502, detail="Error al crear sesión de pago con Stripe")


def verify_webhook(payload: bytes, sig_header: str) -> dict:
    """Verify and parse a Stripe webhook event."""
    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET,
        )
        logger.info("Stripe webhook verified: %s", event["type"])
        return event
    except stripe.SignatureVerificationError:
        logger.warning("Stripe webhook signature verification failed")
        raise HTTPException(status_code=400, detail="Firma de webhook inválida")
    except ValueError:
        logger.warning("Stripe webhook payload inválido")
        raise HTTPException(status_code=400, detail="Payload inválido")
