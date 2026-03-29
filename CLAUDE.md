# Alma Deco — Guía del nuevo frontend

## Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TypeScript
- **Estilos**: Tailwind CSS v4 vía `@import "tailwindcss"` + `@theme` en `src/app/globals.css`
- **Datos**: Prisma + SQLite (`prisma/dev.db`)

## Estructura clave

```txt
new-frontend/
├── prisma/
│   └── schema.prisma            # Modelos Product, Order, OrderItem, Admin
├── src/
│   ├── app/
│   │   ├── (shop)/              # Grupo de rutas públicas (no afecta la URL)
│   │   │   ├── layout.tsx       # Navbar + Footer del storefront
│   │   │   ├── page.tsx         # Homepage editorial
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   └── success/
│   │   ├── admin/               # Sección administrativa con layout propio
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   ├── products/
│   │   │   └── orders/
│   │   ├── api/                 # Route handlers del App Router
│   │   ├── layout.tsx           # Root layout global
│   │   └── globals.css          # Tokens de diseño, tipografía y utilidades globales
│   ├── components/
│   │   ├── shop/                # Componentes públicos
│   │   └── admin/               # Componentes del panel
│   ├── lib/
│   │   ├── prisma.ts            # Prisma singleton para desarrollo
│   │   └── utils.ts             # Helpers compartidos
│   └── types/
│       └── index.ts             # Tipos compartidos
```

## Convenciones importantes

### App Router
- Usar **`src/app`** exclusivamente.
- Las páginas viven en `page.tsx`.
- Los layouts compartidos viven en `layout.tsx`.
- Los endpoints HTTP viven en `src/app/api/**/route.ts`.

### Route groups
- `src/app/(shop)` agrupa la experiencia pública sin cambiar la URL final.
- `src/app/admin` usa layout separado para backoffice.

### Prisma
- `src/lib/prisma.ts` centraliza una única instancia de `PrismaClient` para evitar conexiones duplicadas en desarrollo.
- En SQLite, `Product.images` **NO** usa `String[]`; se guarda como `String` con JSON serializado (`"[]"`, `["/img/a.jpg"]`, etc.).

### Diseño
- La identidad visual vive en `src/app/globals.css` usando custom properties + `@theme` de Tailwind v4.
- Headings con **Playfair Display** y cuerpo con **Inter**.
- El storefront debe mantener una estética editorial, premium, minimal y cálida.

### Idioma
- Todo el storefront público debe mostrarse en español.
- El admin puede priorizar claridad funcional por sobre tono de marca.

## Notas de trabajo

- No correr build después de cambios.
- Si Next.js cambia APIs o convenciones, revisar primero `node_modules/next/dist/docs/`.
- `prisma/dev.db` debe permanecer ignorado en Git.
