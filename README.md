# Alma Deco – Tienda Online de Artículos de Decoración

Monorepo con **frontend** (Vite + React + TypeScript + Tailwind CSS) y **backend** (FastAPI + Python).

Incluye integración de pagos con **Stripe Checkout** y **PayPal** (Orders v2), y un **panel de administración** accesible en `/admin`.

---

## Inicio Rápido con Docker (recomendado)

Levanta toda la infraestructura (PostgreSQL, backend, frontend y pgAdmin) con un solo comando:

```bash
# 1. Copia y configura las variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edita backend/.env con tus claves de Stripe y PayPal

# 2. Construye y arranca todos los servicios
docker-compose up --build
```

Una vez levantado:

| Servicio   | URL                        |
| ---------- | -------------------------- |
| Tienda     | http://localhost:5173      |
| API        | http://localhost:8000      |
| Docs API   | http://localhost:8000/docs |
| Panel Admin| http://localhost:5173/admin|
| pgAdmin    | http://localhost:5050      |

> **pgAdmin:** usuario `admin@almadeco.com` / contraseña `admin`. La base de datos PostgreSQL está disponible en el host `db`, puerto `5432`.

### Comandos útiles

```bash
# Levantar en segundo plano
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio concreto
docker-compose logs -f backend

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (borra la base de datos)
docker-compose down -v

# Reconstruir un servicio concreto
docker-compose up --build backend
```

---

## Inicio Manual (sin Docker)

### 1. Base de datos

Necesitas PostgreSQL corriendo localmente. Crea la base de datos y ejecuta el esquema inicial:

```bash
psql -U postgres -c "CREATE DATABASE almadeco;"
psql -U postgres -d almadeco -f db/init.sql
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # Edita con tus claves
uvicorn app.main:app --reload
```

El backend estará en **http://localhost:8000**.
Verifica con: `GET http://localhost:8000/api/health`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # Edita si es necesario
npm run dev
```

El frontend estará en **http://localhost:5173**.

---

## Panel de Administración

Accede a **http://localhost:5173/admin** (la URL no aparece en la navegación pública).

- **Contraseña por defecto:** `alma-admin-2024`
- Cambiable via la variable de entorno `VITE_ADMIN_PASSWORD` (frontend) y `ADMIN_TOKEN` (backend)

El panel incluye:
- **Dashboard** — ingresos totales, pedidos, ticket medio, gráficas mensuales y por categoría
- **Productos** — tabla completa con edición, creación y eliminación de productos

Los pedidos se registran automáticamente al completarse un pago (Stripe webhook o captura PayPal).

---

## Variables de Entorno

### Backend (`backend/.env`)

| Variable               | Descripción                                  | Ejemplo                           |
| ---------------------- | -------------------------------------------- | --------------------------------- |
| `DATABASE_URL`         | Cadena de conexión a PostgreSQL              | `postgresql+psycopg2://...`       |
| `STRIPE_SECRET_KEY`    | Clave secreta de Stripe (test)               | `sk_test_...`                     |
| `STRIPE_WEBHOOK_SECRET`| Secreto del webhook de Stripe                | `whsec_...`                       |
| `PAYPAL_CLIENT_ID`     | Client ID de PayPal (sandbox)                | `AaBbCc...`                       |
| `PAYPAL_CLIENT_SECRET` | Client Secret de PayPal (sandbox)            | `EeFfGg...`                       |
| `FRONTEND_SUCCESS_URL` | URL de redirección tras pago exitoso         | `http://localhost:5173/success`   |
| `FRONTEND_CANCEL_URL`  | URL de redirección tras pago cancelado       | `http://localhost:5173/cancel`    |
| `ADMIN_TOKEN`          | Token de autenticación para la API admin     | `alma-admin-2024`                 |

### Frontend (`frontend/.env`)

| Variable               | Descripción                                  | Ejemplo                           |
| ---------------------- | -------------------------------------------- | --------------------------------- |
| `VITE_API_BASE_URL`    | URL base del backend                         | `http://localhost:8000`           |
| `VITE_PAYPAL_CLIENT_ID`| Client ID de PayPal (sandbox) para SDK       | `AaBbCc...`                       |
| `VITE_ADMIN_TOKEN`     | Token enviado a la API admin                 | `alma-admin-2024`                 |
| `VITE_ADMIN_PASSWORD`  | Contraseña del panel de administración       | `alma-admin-2024`                 |

---

## Flujo de Pagos

### Stripe Checkout

```
┌──────────┐     POST /api/payments/stripe/create-checkout-session     ┌──────────┐
│ Frontend │ ──────────────────────────────────────────────────────────▶│ Backend  │
│          │◀───────────────── { url: "https://checkout.stripe.com/…" }│          │
└────┬─────┘                                                           └────┬─────┘
     │  redirect to Stripe Checkout                                         │
     ▼                                                                      │
┌──────────┐                                                                │
│  Stripe  │  ── webhook POST /api/webhooks/stripe ────────────────────────▶│
│ Checkout │                                                                │
└────┬─────┘                                                                │
     │  redirect a /success o /cancel                                       │
     ▼                                                                      │
┌──────────┐                                                                │
│ Frontend │  (página de resultado)                                         │
└──────────┘
```

### PayPal

```
┌──────────┐  POST /api/payments/paypal/create-order  ┌──────────┐  create order  ┌────────┐
│ Frontend │ ────────────────────────────────────────▶ │ Backend  │ ─────────────▶ │ PayPal │
│ (Botón)  │◀──────────── { order_id }                │          │◀── order_id ── │  API   │
└────┬─────┘                                           └──────────┘                └────────┘
     │  usuario aprueba pago en popup PayPal
     ▼
┌──────────┐  POST /api/payments/paypal/capture-order  ┌──────────┐  capture      ┌────────┐
│ Frontend │ ─────────────────────────────────────────▶│ Backend  │ ────────────▶ │ PayPal │
│          │◀──────────── { status: "COMPLETED" }      │          │◀── status ─── │  API   │
└────┬─────┘                                           └──────────┘                └────────┘
     │  navegar a /success
     ▼
┌──────────┐
│ Frontend │  (página de éxito)
└──────────┘
```

---

## Estructura del Proyecto

```
alma-deco/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/config.py
│   │   ├── data/products.json
│   │   ├── db/              # Modelos SQLAlchemy y sesión
│   │   ├── routes/
│   │   │   ├── admin.py     # Rutas del panel admin (protegidas)
│   │   │   ├── products.py
│   │   │   ├── cart.py
│   │   │   ├── stripe.py
│   │   │   └── paypal.py
│   │   ├── schemas/
│   │   │   ├── product.py
│   │   │   ├── cart.py
│   │   │   ├── order.py     # Schemas de órdenes y métricas
│   │   │   └── payment.py
│   │   └── services/
│   │       ├── product_service.py
│   │       ├── cart_service.py
│   │       ├── order_service.py  # Lógica de órdenes y métricas
│   │       ├── stripe_service.py
│   │       └── paypal_service.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/       # Panel de administración
│   │   │   │   ├── AdminApp.tsx
│   │   │   │   ├── AdminLogin.tsx
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── ProductsAdmin.tsx
│   │   │   └── (tienda pública)
│   │   ├── components/
│   │   ├── store/
│   │   ├── api/
│   │   │   ├── client.ts       # API pública
│   │   │   └── adminClient.ts  # API admin (con token)
│   │   ├── hooks/
│   │   └── types/
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── db/
│   └── init.sql             # Schema: products, orders, pending_orders
├── docker-compose.yml
└── README.md
```

---

## Notas de Seguridad

- **Panel admin no indexado** – la URL `/admin` no aparece en ningún enlace público de la tienda.
- **Contraseña admin hardcodeada** – seguridad básica; configurable via variables de entorno.
- **No se almacenan datos de tarjetas** – toda la información de pago es manejada por Stripe/PayPal.
- **Validación server-side** – los precios y totales se calculan en el backend, nunca se confía en el frontend.
- **CORS** configurado para permitir solo el origen del frontend.
- **Webhooks** verifican firma para confirmar autenticidad.

---

## Licencia

MIT
