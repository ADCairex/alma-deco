CREATE TABLE IF NOT EXISTS products (
    id          VARCHAR(50)     PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    price       NUMERIC(10, 2)  NOT NULL,
    currency    VARCHAR(10)     NOT NULL,
    image_url   TEXT            NOT NULL,
    images      JSONB,
    description TEXT            NOT NULL,
    category    VARCHAR(100)    NOT NULL,
    stock       INTEGER         NOT NULL
);

-- INSERT INTO products (id, name, price, currency, image_url, description, category, stock) VALUES
-- ('prod-001', 'Jarrón Cerámico Atenas',             45.99,  'EUR', 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=400&h=400&fit=crop', 'Jarrón artesanal de cerámica con acabado mate en tonos tierra. Perfecto para flores secas o como pieza decorativa.',             'Jarrones',    15),
-- ('prod-002', 'Lámpara de Mesa Nórdica',            79.50,  'EUR', 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop', 'Lámpara de mesa con base de madera natural y pantalla de lino. Luz cálida para crear ambientes acogedores.',                  'Iluminación',  8),
-- ('prod-003', 'Cuadro Abstracto Océano',           120.00,  'EUR', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop', 'Lienzo pintado a mano con técnica mixta en tonos azules y dorados. 60x80 cm con marco de madera.',                             'Arte',         5),
-- ('prod-004', 'Set de 2 Cojines Boho',              34.90,  'EUR', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop', 'Cojines decorativos de algodón con flecos y patrones geométricos. Incluye relleno. 45x45 cm.',                                 'Textiles',    20),
-- ('prod-005', 'Vela Aromática Sándalo y Vainilla',  18.50,  'EUR', 'https://images.unsplash.com/photo-1602607616974-0514061dab4c?w=400&h=400&fit=crop', 'Vela de cera de soja con aroma de sándalo y vainilla. Duración aproximada de 45 horas. Recipiente de vidrio reutilizable.',    'Velas',       30),
-- ('prod-006', 'Maceta Colgante Terracota',          22.00,  'EUR', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop', 'Maceta de terracota con soporte de macramé hecho a mano. Ideal para plantas colgantes de interior.',                           'Jarrones',    12),
-- ('prod-007', 'Espejo Redondo Dorado',              89.99,  'EUR', 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop', 'Espejo decorativo con marco metálico dorado. Diámetro 60 cm. Ideal para recibidores y salones.',                                'Espejos',      7),
-- ('prod-008', 'Reloj de Pared Minimalista',         42.00,  'EUR', 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=400&fit=crop', 'Reloj de pared con diseño minimalista en negro mate. Movimiento silencioso. Diámetro 30 cm.',                                    'Relojes',     10),
-- ('prod-009', 'Alfombra Kilim Vintage',            155.00,  'EUR', 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=400&fit=crop', 'Alfombra estilo kilim con patrones étnicos en tonos cálidos. 120x180 cm. Algodón 100% lavable.',                                 'Textiles',     4),
-- ('prod-010', 'Portavelas Cristal Ahumado',         15.90,  'EUR', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=400&fit=crop', 'Set de 3 portavelas de cristal ahumado en diferentes alturas. Crean un ambiente íntimo y elegante.',                             'Velas',       25)
-- ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS pending_orders (
    session_id  VARCHAR(200)    PRIMARY KEY,
    items       JSONB           NOT NULL,
    total       NUMERIC(10, 2)  NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id              VARCHAR(200)    PRIMARY KEY,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    status          VARCHAR(50)     NOT NULL,
    payment_method  VARCHAR(20)     NOT NULL,
    total_amount    NUMERIC(10, 2)  NOT NULL,
    items           JSONB           NOT NULL
);
