import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

// V6 (INTENCIONAL): el POST debería requerir rol ADMIN, pero no valida sesión.
// Cualquiera puede crear productos haciendo un POST a /api/products.
// Mitigación posterior: verificar sesión iron-session y user.role === ADMIN.
export async function POST(req: Request) {
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
