"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface CartItem {
  id: number;
  quantity: number;
  productName: string;
  productPrice: number;
  productImage: string;
  productId: number;
  product: { slug: string; stock: number; isActive: boolean };
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchCart = async () => {
    const res = await fetch("/api/cart");
    if (res.status === 401) {
      router.push("/auth/login?callbackUrl=/cart");
      return;
    }
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(id);
    await fetch(`/api/cart/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    await fetchCart();
    setUpdating(null);
  };

  const removeItem = async (id: number) => {
    if (!confirm("确定要移除这个商品吗？")) return;
    setUpdating(id);
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    await fetchCart();
    setUpdating(null);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );
  const total = subtotal;

  const handleCheckout = async () => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/orders/${data.orderId}`);
    } else {
      const data = await res.json();
      alert(data.error || "下单失败");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">购物车</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-gray-400 mb-4">购物车是空的</p>
          <Link
            href="/products"
            className="text-blue-600 hover:underline"
          >
            去逛逛 →
          </Link>
        </div>
      ) : (
        <>
          {/* 购物车列表 */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 flex gap-4 items-center shadow-sm"
              >
                <img
                  src={item.productImage || ""}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-medium hover:text-blue-600 line-clamp-1"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-red-600 font-semibold mt-1">
                    {formatPrice(item.productPrice)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={updating === item.id}
                    className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={updating === item.id}
                    className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(item.productPrice * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-gray-400 hover:text-red-500 mt-1"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 结算栏 */}
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500">
                共 {items.reduce((s, i) => s + i.quantity, 0)} 件商品
              </span>
              <span className="text-2xl font-bold text-red-600">
                {formatPrice(total)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              提交订单
            </button>
          </div>
        </>
      )}
    </div>
  );
}
