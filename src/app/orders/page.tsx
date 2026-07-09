"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface OrderItem {
  id: number;
  productName: string;
  productPrice: number;
  productImage?: string;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

const statusMap: Record<string, string> = {
  PENDING: "待支付",
  PAID: "已支付",
  SHIPPED: "已发货",
  DELIVERED: "已送达",
  CANCELLED: "已取消",
};

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-600",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => {
        if (res.status === 401) {
          router.push("/auth/login?callbackUrl=/orders");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setOrders(data.orders || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">我的订单</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-400 mb-4">还没有订单</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            去逛逛 →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm text-gray-400">
                  订单号：{order.id}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    statusColor[order.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {statusMap[order.status] || order.status}
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {order.items.slice(0, 4).map((item) => (
                  <img
                    key={item.id}
                    src={item.productImage || ""}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg bg-gray-100 shrink-0"
                  />
                ))}
                {order.items.length > 4 && (
                  <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-xs text-gray-400 shrink-0">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <span className="text-sm text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                  {" · "}
                  {order.items.reduce((s, i) => s + i.quantity, 0)} 件商品
                </span>
                <span className="font-bold text-red-600">
                  {formatPrice(order.total)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
