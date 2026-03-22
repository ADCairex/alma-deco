from fastapi import APIRouter

from app.schemas.payment import (
    PayPalCaptureOrderRequest,
    PayPalCaptureOrderResponse,
    PayPalCreateOrderRequest,
    PayPalCreateOrderResponse,
)
from app.services.cart_service import validate_cart
from app.services.order_service import create_order as save_order
from app.services.order_service import delete_pending_order, get_pending_order, save_pending_order
from app.services.paypal_service import capture_order, create_order

router = APIRouter(tags=["paypal"])


@router.post(
    "/api/payments/paypal/create-order",
    response_model=PayPalCreateOrderResponse,
)
async def paypal_create_order(request: PayPalCreateOrderRequest):
    cart = validate_cart(request.items)
    order_id = await create_order(request.items)
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
    save_pending_order(order_id, items_data, cart.total)
    return PayPalCreateOrderResponse(order_id=order_id)


@router.post(
    "/api/payments/paypal/capture-order",
    response_model=PayPalCaptureOrderResponse,
)
async def paypal_capture_order(request: PayPalCaptureOrderRequest):
    result = await capture_order(request.order_id)
    if result.get("status") == "COMPLETED":
        pending = get_pending_order(request.order_id)
        if pending:
            save_order(
                order_id=request.order_id,
                payment_method="paypal",
                total_amount=float(pending.total),
                items=pending.items,
            )
            delete_pending_order(request.order_id)
    return PayPalCaptureOrderResponse(**result)
