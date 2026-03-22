# Alma Deco — Guía para Claude

## Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS v3
- **Backend**: FastAPI + Python 3.12 + SQLAlchemy + PostgreSQL
- **Pagos**: Stripe Checkout + PayPal Orders v2
- **Contenedores**: Docker Compose (db, backend, frontend, pgAdmin)

## Estructura clave

```
alma-deco/
├── backend/
│   ├── app/
│   │   ├── main.py              # App FastAPI, monta /uploads como estáticos
│   │   ├── core/config.py       # Settings (ADMIN_TOKEN, etc.)
│   │   ├── data/products.json   # Seed inicial (carga si BD vacía)
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── init_db.py       # Crea tablas + seed desde products.json
│   │   │   ├── models.py        # ProductModel, PendingOrderModel, OrderModel
│   │   │   └── session.py
│   │   ├── routes/
│   │   │   ├── admin.py         # /api/admin/* (protegido por X-Admin-Token)
│   │   │   ├── products.py      # GET /api/products, GET /api/products/{id}
│   │   │   ├── cart.py
│   │   │   ├── health.py
│   │   │   ├── stripe.py
│   │   │   └── paypal.py
│   │   ├── schemas/
│   │   │   ├── product.py       # Product, ProductCreate, ProductUpdate
│   │   │   ├── order.py         # OrderSchema, MetricsResponse
│   │   │   ├── cart.py
│   │   │   └── payment.py
│   │   └── services/
│   │       ├── product_service.py   # get_all_products, get_product_by_id, CRUD
│   │       ├── order_service.py
│   │       ├── stripe_service.py
│   │       └── paypal_service.py
│   ├── uploads/                 # Imágenes subidas por admin (servidas en /uploads/*)
│   ├── requirements.txt         # Incluye python-multipart
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   └── hero.mp4             # Vídeo del hero (copiado desde "ALMA DECO/")
│   └── src/
│       ├── api/
│       │   ├── client.ts        # getProducts(), getProduct(id), pagos
│       │   └── adminClient.ts   # CRUD admin + uploadProductImages()
│       ├── components/
│       │   ├── ProductCard.tsx  # Tarjeta con Link state={{ product }}
│       │   ├── CartItemRow.tsx  # Imagen y nombre son Link a /products/:id
│       │   └── ...
│       ├── hooks/useProducts.ts
│       ├── pages/
│       │   ├── Home.tsx         # Hero vídeo en bucle + Top Ventas + secciones
│       │   ├── Products.tsx     # Grid de ProductCard
│       │   ├── ProductDetail.tsx # Detalle con galería, qty, añadir al carrito
│       │   ├── Cart.tsx
│       │   ├── Checkout.tsx
│       │   └── admin/
│       │       ├── AdminApp.tsx
│       │       ├── AdminLogin.tsx   # Contraseña: VITE_ADMIN_PASSWORD
│       │       ├── AdminLayout.tsx
│       │       ├── Dashboard.tsx    # Métricas y gráficas
│       │       └── ProductsAdmin.tsx # CRUD productos con upload de imágenes
│       ├── types/
│       │   ├── product.ts       # { id, name, price, currency, image_url, images[], description, category, stock }
│       │   └── cart.ts
│       └── utils/
│           └── imageUrl.ts      # resolveImageUrl(): añade API_BASE a URLs relativas /uploads/*
├── db/
│   └── init.sql                 # Esquema SQL (seed comentado, lo hace init_db.py)
├── docker-compose.yml
├── CLAUDE.md                    # Este archivo
└── README.md
```

## Convenciones importantes

### URLs de imágenes
Siempre usar `resolveImageUrl(url)` de `src/utils/imageUrl.ts` para mostrar imágenes de productos.
- URLs absolutas (`https://...`) → pasan sin cambios
- URLs relativas (`/uploads/abc.jpg`) → se antepone `VITE_API_BASE_URL` (http://localhost:8000)

### Navegación a detalle de producto
Los `<Link>` a `/products/:id` siempre deben pasar `state={{ product }}`:
```tsx
<Link to={`/products/${product.id}`} state={{ product }}>...</Link>
```
`ProductDetail` usa ese state para mostrar los datos sin hacer petición extra a la API. Si se accede directamente por URL, cae en `GET /api/products/{id}`.

### Imágenes de productos
- Se suben vía `POST /api/admin/upload` (requiere `python-multipart`)
- Se guardan en `backend/uploads/` con UUID como nombre
- La URL relativa (`/uploads/uuid.jpg`) se guarda en BD
- FastAPI las sirve como archivos estáticos en `/uploads/*`
- El campo `images[]` en BD es JSONB; si está vacío, el backend usa `[image_url]`

### Admin
- URL: `/admin` (no aparece en nav pública)
- Autenticación: contraseña en frontend (`VITE_ADMIN_PASSWORD`) + token en API (`X-Admin-Token: ADMIN_TOKEN`)
- Token por defecto: `alma-admin-2024`

### Seed de datos
- `init_db.py` carga `data/products.json` solo si la tabla `products` está vacía
- IDs de seed: `prod-001` a `prod-010`

## Rutas del backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products` | Lista todos los productos |
| GET | `/api/products/{id}` | Obtiene producto por ID |
| POST | `/api/cart/validate` | Valida carrito |
| POST | `/api/payments/stripe/create-checkout-session` | Crea sesión Stripe |
| POST | `/api/payments/paypal/create-order` | Crea orden PayPal |
| POST | `/api/payments/paypal/capture-order` | Captura orden PayPal |
| POST | `/api/webhooks/stripe` | Webhook Stripe |
| GET | `/api/admin/metrics` | Métricas del dashboard |
| GET | `/api/admin/orders` | Lista de pedidos |
| GET | `/api/admin/products` | Lista productos (admin) |
| POST | `/api/admin/products` | Crear producto |
| PUT | `/api/admin/products/{id}` | Actualizar producto |
| DELETE | `/api/admin/products/{id}` | Eliminar producto |
| POST | `/api/admin/upload` | Subir imágenes (multipart) |

## Rutas del frontend

| Ruta | Componente |
|------|-----------|
| `/` | `Home` — hero vídeo + top ventas + banners |
| `/products` | `Products` — grid de productos |
| `/products/:id` | `ProductDetail` — galería, qty, carrito |
| `/cart` | `Cart` |
| `/checkout` | `Checkout` |
| `/success` | `Success` |
| `/cancel` | `Cancel` |
| `/admin/*` | `AdminApp` (fuera del Layout principal) |

## Docker

```bash
# Levantar todo
docker-compose up --build

# Reconstruir solo backend (tras cambios en requirements.txt o Dockerfile)
docker-compose up --build backend

# Ver logs
docker-compose logs -f backend
```

### Puertos
| Servicio | Puerto |
|----------|--------|
| Frontend | 5173 |
| Backend API | 8000 |
| PostgreSQL | 5433 (host) → 5432 (contenedor) |
| pgAdmin | 5050 |

## Variables de entorno

### `backend/.env`
```
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/almadeco
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
FRONTEND_SUCCESS_URL=http://localhost:5173/success
FRONTEND_CANCEL_URL=http://localhost:5173/cancel
ADMIN_TOKEN=alma-admin-2024
```

### `frontend/.env`
```
VITE_API_BASE_URL=http://localhost:8000
VITE_PAYPAL_CLIENT_ID=...
VITE_ADMIN_TOKEN=alma-admin-2024
VITE_ADMIN_PASSWORD=alma-admin-2024
```
