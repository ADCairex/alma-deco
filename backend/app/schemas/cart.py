from pydantic import BaseModel, Field


class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(ge=1)


class CartValidationRequest(BaseModel):
    items: list[CartItem]


class ValidatedCartItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    subtotal: float
    image_url: str


class CartValidationResponse(BaseModel):
    items: list[ValidatedCartItem]
    subtotal: float
    tax: float
    shipping: float
    total: float
