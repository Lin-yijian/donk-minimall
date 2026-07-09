"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: number; name: string; slug: string; price: number; stock: number;
  isFeatured: boolean; isActive: boolean; category?: { name: string } | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", description: "", price: "", comparePrice: "", image: "", stock: "0", isFeatured: false, isActive: true, categoryId: "" });
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.items || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const openForm = (p?: Product) => {
    if (p) {
      setEditing(p);
      setForm({ name: p.name, slug: p.slug, description: "", price: String(p.price), comparePrice: "", image: "", stock: String(p.stock), isFeatured: p.isFeatured, isActive: p.isActive, categoryId: "" });
    } else {
      setEditing(null);
      setForm({ name: "", slug: "", description: "", price: "", comparePrice: "", image: "", stock: "0", isFeatured: false, isActive: true, categoryId: "" });
    }
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { setError("名称不能为空"); return; }
    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowForm(false); fetchProducts(); }
    else { const d = await res.json(); setError(d.error || "操作失败"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  if (loading) return <div className="text-center py-16 text-gray-400">加载中...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <button onClick={() => openForm()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">新增商品</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">名称</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">价格</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">库存</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">分类</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{p.id}</td>
                <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                <td className="px-4 py-3 text-sm">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 text-sm">{p.stock}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.category?.name}</td>
                <td className="px-4 py-3 text-sm">{p.isActive ? <span className="text-green-600">上架</span> : <span className="text-gray-400">下架</span>}</td>
                <td className="px-4 py-3 text-sm space-x-2">
                  <button onClick={() => openForm(p)} className="text-blue-600 hover:text-blue-800">编辑</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editing ? "编辑商品" : "新增商品"}</h2>
            {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded mb-3 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">名称 *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Slug</label><input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">价格 *</label><input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">划线价</label><input type="number" step="0.01" value={form.comparePrice} onChange={e => setForm({...form, comparePrice: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">库存</label><input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">分类</label><select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="w-full border rounded-lg px-3 py-2"><option value="">选择分类</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">图片URL</label><input type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} /> 精选</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /> 上架</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">取消</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
