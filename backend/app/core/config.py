from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/almadeco"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # PayPal
    PAYPAL_CLIENT_ID: str = ""
    PAYPAL_CLIENT_SECRET: str = ""
    PAYPAL_BASE_URL: str = "https://api-m.sandbox.paypal.com"

    # Frontend URLs
    FRONTEND_SUCCESS_URL: str = "http://localhost:5173/success"
    FRONTEND_CANCEL_URL: str = "http://localhost:5173/cancel"

    # CORS (comma-separated list of allowed origins, e.g. for ngrok: "http://localhost:5173,https://xxx.ngrok-free.app")
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # Admin
    ADMIN_TOKEN: str = "alma-admin-2024"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
