import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const [productCount, orderCount, userCount, totalRevenue] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count(),
    db.order.aggregate({ _sum: { total: true } }),
  ]);

  const revenue = totalRevenue._sum.total || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="商品总数" value={String(productCount)} color="blue" href="/admin/products" />
        <StatCard label="订单总数" value={String(orderCount)} color="green" href="/admin/orders" />
        <StatCard label="用户总数" value={String(userCount)} color="purple" />
        <StatCard label="总营收" value={`¥${revenue.toFixed(2)}`} color="orange" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: string;
  color: string;
  href?: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  const card = (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]?.split(" ")[1] || ""}`}>
        {value}
      </p>
    </div>
  );

  if (href) return <Link href={href}>{card}</Link>;
  return card;
}
