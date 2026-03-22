from pydantic import BaseModel

from app.schemas.cart import CartItem


class StripeCheckoutRequest(BaseModel):
    items: list[CartItem]


class StripeCheckoutResponse(BaseModel):
    url: str


class PayPalCreateOrderRequest(BaseModel):
    items: list[CartItem]


class PayPalCreateOrderResponse(BaseModel):
    order_id: str


class PayPalCaptureOrderRequest(BaseModel):
    order_id: str


class PayPalCaptureOrderResponse(BaseModel):
    status: str
    order_id: str
