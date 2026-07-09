"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

const statusOptions = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const statusMap: Record<string, string> = { PENDING: "待支付", PAID: "已支付", SHIPPED: "已发货", DELIVERED: "已送达", CANCELLED: "已取消" };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders").then(r => r.json()).then(d => { setOrders(d.items || []); setLoading(false); });
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  if (loading) return <div className="text-center py-16 text-gray-400">加载中...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">订单管理</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">用户</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">金额</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">折扣</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">时间</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{o.id}</td>
                <td className="px-4 py-3 text-sm">{o.user?.name || o.user?.email}</td>
                <td className="px-4 py-3 text-sm font-medium">{formatPrice(o.total)}</td>
                <td className="px-4 py-3 text-sm text-green-600">{o.discount > 0 ? `-${formatPrice(o.discount)}` : "-"}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o.id, e.target.value)}
                    className="text-xs border rounded px-2 py-0.5"
                  >
                    {statusOptions.map(s => <option key={s} value={s}>{statusMap[s]}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("zh-CN")}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{o.items?.length || 0} 件</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
