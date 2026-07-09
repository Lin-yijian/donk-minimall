import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MEMBERSHIP_TIERS, calculateTier, type MembershipTier } from "@/lib/membership";
import { mockPay } from "@/lib/utils";

// POST /api/orders — 从购物车创建订单（模拟支付）
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);

  // 获取购物车
  const cartItems = await db.cart.findMany({
    where: { userId },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "购物车是空的" }, { status: 400 });
  }

  // 检查库存
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      return NextResponse.json(
        { error: `"${item.product.name}" 库存不足` },
        { status: 400 }
      );
    }
  }

  // 计算金额
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 获取会员折扣（基于当前等级，后续订单生效）
  const currentTier = (session.user.membershipTier || "REGULAR") as MembershipTier;
  const discountRate = MEMBERSHIP_TIERS[currentTier].discount;
  const discount = Math.round((subtotal * (1 - discountRate)) * 100) / 100;
  const total = Math.round((subtotal - discount) * 100) / 100;

  // 模拟支付
  const payment = mockPay();

  // 创建订单
  const order = await db.order.create({
    data: {
      userId,
      status: "PAID", // 模拟已支付
      subtotal,
      discount,
      shipping: 0,
      total,
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          productPrice: item.product.price,
          productImage: item.product.image,
          quantity: item.quantity,
        })),
      },
    },
  });

  // 扣减库存
  for (const item of cartItems) {
    await db.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  // 清空购物车
  await db.cart.deleteMany({ where: { userId } });

  // 更新累计消费和会员等级
  const user = await db.user.findUnique({ where: { id: userId } });
  if (user) {
    const newTotalSpent = user.totalSpent + total;
    const newTier = calculateTier(newTotalSpent);
    await db.user.update({
      where: { id: userId },
      data: {
        totalSpent: newTotalSpent,
        membershipTier: newTier,
      },
    });
  }

  return NextResponse.json({
    orderId: order.id,
    status: "PAID",
    total,
    discount,
    transactionId: payment.transactionId,
  });
}

// GET /api/orders — 获取我的订单列表
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const orders = await db.order.findMany({
    where: { userId: parseInt(session.user.id) },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
