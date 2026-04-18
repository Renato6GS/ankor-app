import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

// V6 (INTENCIONAL): lista TODOS los pedidos de TODOS los usuarios sin filtrar.
// No valida sesión y no acota el resultado al userId del solicitante.
// Mitigación posterior: requerir sesión y filtrar where: { userId: session.userId }
// (o requerir rol ADMIN para ver el listado completo).
export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const { userId, items } = await req.json();

  if (!userId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "userId e items son requeridos" },
      { status: 400 },
    );
  }

  const productIds = items.map((i: { productId: number }) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const total = items.reduce(
    (acc: number, item: { productId: number; quantity: number }) => {
      const product = products.find((p) => p.id === item.productId);
      return acc + (product ? product.price * item.quantity : 0);
    },
    0,
  );

  const order = await prisma.order.create({
    data: {
      userId,
      total,
      items: {
        create: items.map(
          (item: { productId: number; quantity: number }) => {
            const product = products.find((p) => p.id === item.productId);
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product?.price ?? 0,
            };
          },
        ),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(order, { status: 201 });
}
