import logging

from fastapi import APIRouter, Request

from app.schemas.payment import StripeCheckoutRequest, StripeCheckoutResponse
from app.services.order_service import create_order, delete_pending_order, get_pending_order, save_pending_order
from app.services.stripe_service import create_checkout_session, verify_webhook
from app.services.cart_service import validate_cart

logger = logging.getLogger(__name__)

router = APIRouter(tags=["stripe"])


@router.post(
    "/api/payments/stripe/create-checkout-session",
    response_model=StripeCheckoutResponse,
)
async def stripe_create_session(request: StripeCheckoutRequest):
    cart = validate_cart(request.items)
    url, session_id = create_checkout_session(request.items, cart)
    items_data = [
        {
            "product_id": i.product_id,
            "name": i.name,
            "price": i.price,
            "quantity": i.quantity,
            "subtotal": i.subtotal,
            "category": "",
        }
        for i in cart.items
    ]
    save_pending_order(session_id, items_data, cart.total)
    return StripeCheckoutResponse(url=url)


@router.post("/api/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    event = verify_webhook(payload, sig_header)

    event_type = event.get("type", "")

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        session_id = session.get("id")
        amount_total = session.get("amount_total", 0) / 100
        logger.info(
            "Pago completado — Session: %s, Amount: %.2f %s",
            session_id,
            amount_total,
            session.get("currency", "").upper(),
        )
        pending = get_pending_order(session_id)
        if pending:
            create_order(
                order_id=session_id,
                payment_method="stripe",
                total_amount=float(pending.total),
                items=pending.items,
            )
            delete_pending_order(session_id)
        else:
            create_order(
                order_id=session_id,
                payment_method="stripe",
                total_amount=amount_total,
                items=[],
            )
    elif event_type == "checkout.session.expired":
        session_id = event["data"]["object"].get("id")
        logger.info("Sesion de checkout expirada: %s", session_id)
        delete_pending_order(session_id)
    else:
        logger.info("Stripe event received: %s", event_type)

    return {"received": True}
