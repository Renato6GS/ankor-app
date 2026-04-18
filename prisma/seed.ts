import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { OrderStatus, PrismaClient, Role } from "@generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Limpiar datos existentes
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Usuarios
  const admin = await prisma.user.create({
    data: {
      email: "admin@ankor.gt",
      password: await bcrypt.hash("admin123", 10),
      name: "Admin ANKOR",
      role: Role.ADMIN,
      address: "Ciudad de Guatemala, Zona 10",
      phone: "5555-0001",
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "maria@gmail.com",
      password: await bcrypt.hash("maria123", 10),
      name: "Maria Lopez",
      role: Role.CUSTOMER,
      address: "Antigua Guatemala, Sacatepequez",
      phone: "5555-0002",
    },
  });

  // Categorias
  const vestidos = await prisma.category.create({
    data: { name: "Vestidos", slug: "vestidos" },
  });

  const accesorios = await prisma.category.create({
    data: { name: "Accesorios", slug: "accesorios" },
  });

  const calzado = await prisma.category.create({
    data: { name: "Calzado", slug: "calzado" },
  });

  // Productos
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Vestido Floral Verano",
        description: "Vestido ligero con estampado floral, ideal para clima calido",
        price: 349.99,
        image: "https://picsum.photos/seed/vestido1/400/500",
        stock: 25,
        categoryId: vestidos.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Vestido Negro Elegante",
        description: "Vestido de noche con corte clasico y tela satinada",
        price: 599.99,
        image: "https://picsum.photos/seed/vestido2/400/500",
        stock: 15,
        categoryId: vestidos.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Vestido Casual Lino",
        description: "Vestido de lino con bolsillos laterales, comodo y fresco",
        price: 279.99,
        image: "https://picsum.photos/seed/vestido3/400/500",
        stock: 30,
        categoryId: vestidos.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Bolso de Cuero Artesanal",
        description: "Bolso hecho a mano con cuero genuino guatemalteco",
        price: 450.0,
        image: "https://picsum.photos/seed/bolso1/400/500",
        stock: 10,
        categoryId: accesorios.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Collar de Jade",
        description: "Collar con piedra de jade autentica, acabado en plata",
        price: 189.99,
        image: "https://picsum.photos/seed/collar1/400/500",
        stock: 20,
        categoryId: accesorios.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Aretes Tejidos",
        description: "Aretes artesanales tejidos a mano con hilos de colores",
        price: 89.99,
        image: "https://picsum.photos/seed/aretes1/400/500",
        stock: 40,
        categoryId: accesorios.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sandalias de Plataforma",
        description: "Sandalias con plataforma de 5cm, correa ajustable",
        price: 329.99,
        image: "https://picsum.photos/seed/sandalia1/400/500",
        stock: 18,
        categoryId: calzado.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Tacones Rojos Clasicos",
        description: "Tacones de 8cm en color rojo, suela antideslizante",
        price: 499.99,
        image: "https://picsum.photos/seed/tacon1/400/500",
        stock: 12,
        categoryId: calzado.id,
      },
    }),
  ]);

  // Pedidos
  const order1 = await prisma.order.create({
    data: {
      userId: customer.id,
      total: 639.98,
      status: OrderStatus.DELIVERED,
      items: {
        create: [
          { productId: products[0].id, quantity: 1, price: 349.99 },
          { productId: products[4].id, quantity: 1, price: 189.99 },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: customer.id,
      total: 599.99,
      status: OrderStatus.CONFIRMED,
      items: {
        create: [
          { productId: products[1].id, quantity: 1, price: 599.99 },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      userId: admin.id,
      total: 829.98,
      status: OrderStatus.PENDING,
      items: {
        create: [
          { productId: products[6].id, quantity: 1, price: 329.99 },
          { productId: products[7].id, quantity: 1, price: 499.99 },
        ],
      },
    },
  });

  console.log("Seed completado:");
  console.log(`  - ${2} usuarios (admin + customer)`);
  console.log(`  - ${3} categorias`);
  console.log(`  - ${products.length} productos`);
  console.log(`  - ${3} pedidos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
