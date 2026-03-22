import datetime
import logging
from collections import defaultdict

from app.db.models import OrderModel, PendingOrderModel
from app.db.session import SessionLocal
from app.schemas.order import CategoryRevenue, MetricsResponse, MonthlyRevenue, OrderSchema

logger = logging.getLogger(__name__)


def save_pending_order(session_id: str, items: list[dict], total: float) -> None:
    with SessionLocal() as session:
        pending = PendingOrderModel(session_id=session_id, items=items, total=total)
        session.merge(pending)
        session.commit()
    logger.info("Pending order saved: %s", session_id)


def get_pending_order(session_id: str) -> PendingOrderModel | None:
    with SessionLocal() as session:
        return session.get(PendingOrderModel, session_id)


def delete_pending_order(session_id: str) -> None:
    with SessionLocal() as session:
        row = session.get(PendingOrderModel, session_id)
        if row:
            session.delete(row)
            session.commit()


def create_order(
    order_id: str,
    payment_method: str,
    total_amount: float,
    items: list[dict],
    status: str = "completed",
) -> None:
    with SessionLocal() as session:
        existing = session.get(OrderModel, order_id)
        if existing:
            logger.info("Order %s already exists, skipping", order_id)
            return
        order = OrderModel(
            id=order_id,
            status=status,
            payment_method=payment_method,
            total_amount=total_amount,
            items=items,
        )
        session.add(order)
        session.commit()
    logger.info("Order created: %s (%.2f EUR, %s)", order_id, total_amount, payment_method)


def get_orders(limit: int = 50) -> list[OrderSchema]:
    with SessionLocal() as session:
        rows = (
            session.query(OrderModel)
            .order_by(OrderModel.created_at.desc())
            .limit(limit)
            .all()
        )
        return [_row_to_schema(r) for r in rows]


def get_metrics() -> MetricsResponse:
    with SessionLocal() as session:
        rows = session.query(OrderModel).all()

    if not rows:
        return MetricsResponse(
            total_revenue=0,
            total_orders=0,
            avg_order_value=0,
            orders_this_month=0,
            revenue_this_month=0,
            monthly=[],
            by_category=[],
        )

    now = datetime.datetime.utcnow()
    current_month = now.strftime("%Y-%m")

    total_revenue = sum(float(r.total_amount) for r in rows)
    total_orders = len(rows)
    avg_order_value = round(total_revenue / total_orders, 2) if total_orders else 0

    orders_this_month = sum(
        1 for r in rows if r.created_at.strftime("%Y-%m") == current_month
    )
    revenue_this_month = round(
        sum(
            float(r.total_amount)
            for r in rows
            if r.created_at.strftime("%Y-%m") == current_month
        ),
        2,
    )

    # Monthly breakdown (last 6 months)
    monthly_map: dict[str, dict] = defaultdict(lambda: {"revenue": 0.0, "orders": 0})
    for r in rows:
        month_key = r.created_at.strftime("%Y-%m")
        monthly_map[month_key]["revenue"] += float(r.total_amount)
        monthly_map[month_key]["orders"] += 1

    # Build last 6 months in order
    monthly = []
    for i in range(5, -1, -1):
        d = now - datetime.timedelta(days=i * 30)
        key = d.strftime("%Y-%m")
        data = monthly_map.get(key, {"revenue": 0.0, "orders": 0})
        monthly.append(
            MonthlyRevenue(
                month=key,
                revenue=round(data["revenue"], 2),
                orders=data["orders"],
            )
        )

    # Category breakdown from order items
    cat_map: dict[str, dict] = defaultdict(lambda: {"revenue": 0.0, "units": 0})
    for r in rows:
        for item in r.items:
            cat = item.get("category", "Sin categoría")
            cat_map[cat]["revenue"] += item.get("subtotal", 0)
            cat_map[cat]["units"] += item.get("quantity", 0)

    by_category = [
        CategoryRevenue(
            category=cat,
            revenue=round(data["revenue"], 2),
            units_sold=data["units"],
        )
        for cat, data in sorted(cat_map.items(), key=lambda x: x[1]["revenue"], reverse=True)
    ]

    return MetricsResponse(
        total_revenue=round(total_revenue, 2),
        total_orders=total_orders,
        avg_order_value=avg_order_value,
        orders_this_month=orders_this_month,
        revenue_this_month=revenue_this_month,
        monthly=monthly,
        by_category=by_category,
    )


def _row_to_schema(row: OrderModel) -> OrderSchema:
    return OrderSchema(
        id=row.id,
        created_at=row.created_at,
        status=row.status,
        payment_method=row.payment_method,
        total_amount=float(row.total_amount),
        items=row.items,
    )
