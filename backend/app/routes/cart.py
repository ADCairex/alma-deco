from fastapi import APIRouter

from app.schemas.cart import CartValidationRequest, CartValidationResponse
from app.services.cart_service import validate_cart

router = APIRouter(prefix="/api", tags=["cart"])


@router.post("/cart/validate", response_model=CartValidationResponse)
async def validate_cart_endpoint(request: CartValidationRequest):
    return validate_cart(request.items)
