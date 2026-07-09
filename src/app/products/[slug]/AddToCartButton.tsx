"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  productId: number;
  stock: number;
}

export default function AddToCartButton({ productId, stock }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAddToCart() {
    setLoading(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    if (res.ok) {
      router.push("/cart");
    } else if (res.status === 401) {
      router.push("/auth/login");
    }
    setLoading(false);
  }

  const soldOut = stock <= 0;

  return (
    <button
      onClick={handleAddToCart}
      disabled={soldOut || loading}
      className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
    >
      {soldOut ? "暂时缺货" : loading ? "加入中..." : "加入购物车"}
    </button>
  );
}
