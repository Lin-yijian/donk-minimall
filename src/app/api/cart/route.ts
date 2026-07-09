import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/cart — 获取当前用户购物车
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const items = await db.cart.findMany({
    where: { userId: parseInt(session.user.id) },
    include: { product: { select: { slug: true, stock: true, isActive: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

// POST /api/cart — 添加到购物车
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { productId, quantity = 1 } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: "缺少商品信息" }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "商品不存在或已下架" }, { status: 404 });
  }
  if (product.stock < quantity) {
    return NextResponse.json({ error: "库存不足" }, { status: 400 });
  }

  const userId = parseInt(session.user.id);

  const existing = await db.cart.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await db.cart.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + quantity,
        productPrice: product.price,
        productName: product.name,
        productImage: product.image,
      },
    });
  } else {
    await db.cart.create({
      data: {
        userId,
        productId,
        quantity,
        productName: product.name,
        productPrice: product.price,
        productImage: product.image,
      },
    });
  }

  const count = await db.cart.count({ where: { userId } });
  return NextResponse.json({ success: true, count });
}
