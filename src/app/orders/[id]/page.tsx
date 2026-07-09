"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface OrderItem {
  id: number;
  productName: string;
  productPrice: number;
  productImage?: string;
  quantity: number;
  productId: number;
}

interface Order {
  id: number;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  shipping: number;
  createdAt: string;
  items: OrderItem[];
}

const statusSteps = [
  { key: "PAID", label: "已支付", icon: "💰" },
  { key: "SHIPPED", label: "已发货", icon: "📦" },
  { key: "DELIVERED", label: "已送达", icon: "✅" },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (res.status === 401) {
          router.push("/auth/login");
          return null;
        }
        if (res.status === 404) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setOrder(data.order);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-gray-400">订单不存在</p>
      </div>
    );
  }

  const currentStep = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/orders" className="text-sm text-gray-400 hover:text-blue-600">
        ← 返回订单列表
      </Link>

      <div className="mt-4 bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold">订单详情</h1>
            <p className="text-sm text-gray-400 mt-1">
              订单号：{order.id} ·{" "}
              {new Date(order.createdAt).toLocaleString("zh-CN")}
            </p>
          </div>
          <span className="text-green-600 font-medium">💰 已支付</span>
        </div>

        {/* 商品列表 */}
        <div className="space-y-3 mb-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 items-center">
              <img
                src={item.productImage || ""}
                alt={item.productName}
                className="w-16 h-16 object-cover rounded-lg bg-gray-100"
              />
              <div className="flex-1">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-medium hover:text-blue-600"
                >
                  {item.productName}
                </Link>
                <p className="text-sm text-gray-400">
                  {formatPrice(item.productPrice)} × {item.quantity}
                </p>
              </div>
              <span className="font-medium">
                {formatPrice(item.productPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* 金额明细 */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">商品小计</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">会员折扣</span>
              <span className="text-green-600">−{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">运费</span>
            <span>{order.shipping > 0 ? formatPrice(order.shipping) : "免运费"}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>实付款</span>
            <span className="text-red-600">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
