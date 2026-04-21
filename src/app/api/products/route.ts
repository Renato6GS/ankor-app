import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { name, description, price, image, stock, categoryId } =
    await req.json();

  if (!name || price == null || categoryId == null) {
    return NextResponse.json(
      { error: "name, price y categoryId son requeridos" },
      { status: 400 },
    );
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      image,
      stock: stock ?? 0,
      categoryId,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
