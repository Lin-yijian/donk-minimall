import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PUT /api/cart/:id — 更新数量
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const { quantity } = await request.json();

  if (!quantity || quantity < 1) {
    return NextResponse.json({ error: "数量至少为1" }, { status: 400 });
  }

  const cartItem = await db.cart.findUnique({ where: { id: parseInt(id) } });
  if (!cartItem || cartItem.userId !== parseInt(session.user.id)) {
    return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
  }

  const updated = await db.cart.update({
    where: { id: parseInt(id) },
    data: { quantity },
  });

  return NextResponse.json({ item: updated });
}

// DELETE /api/cart/:id — 移除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  const cartItem = await db.cart.findUnique({ where: { id: parseInt(id) } });
  if (!cartItem || cartItem.userId !== parseInt(session.user.id)) {
    return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
  }

  await db.cart.delete({ where: { id: parseInt(id) } });

  return NextResponse.json({ success: true });
}
