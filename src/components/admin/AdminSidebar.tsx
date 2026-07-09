"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "仪表盘", icon: "📊" },
  { href: "/admin/products", label: "商品管理", icon: "📦" },
  { href: "/admin/categories", label: "分类管理", icon: "📂" },
  { href: "/admin/orders", label: "订单管理", icon: "📋" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 bg-white border-r shrink-0 py-6">
      <div className="px-4 mb-4">
        <h2 className="font-bold text-sm text-gray-400 uppercase tracking-wider">
          后台管理
        </h2>
      </div>
      <nav className="space-y-0.5 px-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === link.href
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
