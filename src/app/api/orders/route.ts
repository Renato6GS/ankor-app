import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "../../../lib/db";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const where = auth.role === "ADMIN" ? {} : { userId: auth.userId };

  const orders = await prisma.order.findMany({
    where,
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
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { items } = await req.json();
  const userId = auth.userId;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "items son requeridos" },
      { status: 400 },
    );
  }

  const productIds = items.map((i: { productId: number }) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },});

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
  return NextResponse.json(order, { status: 201 });}
