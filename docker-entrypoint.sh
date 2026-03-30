#!/bin/sh
set -e

# Run database migrations/schema sync
npx prisma db push --schema=prisma/schema.prisma --skip-generate

# Seed a default admin only when the database is empty
if node <<'NODE'
const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();

  try {
    const adminCount = await prisma.admin.count();
    process.exit(adminCount === 0 ? 0 : 1);
  } finally {
    await prisma.$disconnect();
  }
})().catch(async (error) => {
  console.error("Failed to check admin users", error);
  process.exit(2);
});
NODE
then
  node <<'NODE'
const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

(async () => {
  const prisma = new PrismaClient();
  const email = process.env.ADMIN_EMAIL || "admin@almadeco.com";
  const password = process.env.ADMIN_PASSWORD || "alma-admin-2024";

  try {
    const passwordHash = await hash(password, 12);

    await prisma.admin.create({
      data: {
        email,
        passwordHash,
      },
    });

    console.log(`Seeded default admin user: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
})().catch(async (error) => {
  console.error("Failed to seed admin user", error);
  process.exit(1);
});
NODE
fi

exec "$@"
