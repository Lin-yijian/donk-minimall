import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const keyword = searchParams.get("keyword") || "";
  const categoryId = searchParams.get("categoryId");

  const where: any = {};
  if (keyword) {
    where.name = { contains: keyword };
  }
  if (categoryId) {
    where.categoryId = parseInt(categoryId);
  }

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: "商品名称不能为空" }, { status: 400 });
  }

  const product = await db.product.create({
    data: {
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      description: body.description || "",
      price: parseFloat(body.price) || 0,
      comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
      image: body.image || "",
      stock: parseInt(body.stock) || 0,
      isFeatured: body.isFeatured || false,
      isActive: body.isActive !== false,
      categoryId: parseInt(body.categoryId),
    },
  });

  return NextResponse.json(product, { status: 201 });
}
