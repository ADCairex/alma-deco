import datetime

from pydantic import BaseModel


class OrderItemSchema(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    subtotal: float


class OrderSchema(BaseModel):
    id: str
    created_at: datetime.datetime
    status: str
    payment_method: str
    total_amount: float
    items: list[OrderItemSchema]


class MonthlyRevenue(BaseModel):
    month: str  # "2024-01"
    revenue: float
    orders: int


class CategoryRevenue(BaseModel):
    category: str
    revenue: float
    units_sold: int


class MetricsResponse(BaseModel):
    total_revenue: float
    total_orders: int
    avg_order_value: float
    orders_this_month: int
    revenue_this_month: float
    monthly: list[MonthlyRevenue]
    by_category: list[CategoryRevenue]
