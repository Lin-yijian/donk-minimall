import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const updated = await db.product.update({
    where: { id: parseInt(id) },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: parseFloat(body.price),
      comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
      image: body.image,
      stock: parseInt(body.stock),
      isFeatured: body.isFeatured || false,
      isActive: body.isActive !== false,
      categoryId: parseInt(body.categoryId),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { id } = await params;
  await db.product.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
