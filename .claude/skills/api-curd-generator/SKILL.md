---
name: api-crud-generator
version: 1.0
description: Use when the user says "生成CRUD"、"生成接口"、"生成管理页面" or asks to generate API routes and admin pages from a Prisma model for a Next.js App Router project
---

# API CRUD 生成器

## 概述

根据指定的 Prisma 模型，自动生成标准的 Next.js App Router 管理后台 CRUD 代码。生成内容包括 5 个 API Route Handler 和前端管理页面（列表 + 创建/编辑表单）。

## 执行步骤

按顺序严格执行以下 4 步，每步完成后向用户确认再进入下一步。

### 第 1 步：确认模型信息

向用户确认以下信息（用户未提供时主动询问）：

1. **模型名称** — 如 `Product`、`Category`（必须与 `prisma/schema.prisma` 中一致）
2. **API 路径** — 如 `/api/admin/products`
3. **页面路由** — 如 `/admin/products`
4. **模型的字段列表** — 读取 `prisma/schema.prisma` 确认字段名和类型

```
请确认以下信息：
- 模型：Product
- API 路径：/api/admin/products
- 页面路由：/admin/products
- 字段：name(String), slug(String), price(Float), ...
```

### 第 2 步：生成 API Route Handlers

生成以下文件结构：

```
src/app/api/admin/[model]/
├── route.ts          # GET 列表 + POST 创建
└── [id]/
    └── route.ts      # GET 详情 + PUT 更新 + DELETE 删除
```

#### `route.ts` — GET 列表 + POST 创建

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/{model} — 获取列表（支持分页和搜索）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const keyword = searchParams.get("keyword") || "";

  const where: any = {};
  // 按名称搜索（根据模型实际字段调整）
  if (keyword) {
    where.name = { contains: keyword };
  }

  const [items, total] = await Promise.all([
    db.{model}.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      // 如果有关联，用 include
    }),
    db.{model}.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// POST /api/admin/{model} — 创建
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 输入验证
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "名称不能为空" }, { status: 400 });
    }
    // 根据模型字段补充验证规则...

    const item = await db.{model}.create({
      data: {
        name: body.name.trim(),
        // 映射其他字段...
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "数据已存在" }, { status: 409 });
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
```

#### `[id]/route.ts` — GET 详情 + PUT 更新 + DELETE 删除

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/{model}/:id — 获取详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await db.{model}.findUnique({ where: { id: parseInt(id) } });

  if (!item) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }

  // 移除敏感字段（如 password）
  const { password, ...safeItem } = item as any;
  return NextResponse.json(safeItem);
}

// PUT /api/admin/{model}/:id — 更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.{model}.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    const updated = await db.{model}.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name?.trim(),
        // 映射其他字段...
      },
    });

    const { password, ...safeItem } = updated as any;
    return NextResponse.json(safeItem);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "数据已存在" }, { status: 409 });
    }
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// DELETE /api/admin/{model}/:id — 删除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.{model}.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    await db.{model}.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
```

### 第 3 步：生成前端管理页面

生成一个 `page.tsx` 文件，包含数据表格 + 新增/编辑表单弹窗，使用 Tailwind CSS 样式。

```typescript
"use client";

import { useEffect, useState } from "react";

interface Item {
  id: number;
  name: string;
  // 其他字段...
  createdAt: string;
}

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({ name: "" /* 其他字段 */ });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 分页
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");

  // 加载数据
  const fetchItems = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "10", keyword });
    const res = await fetch(`/api/admin/{model}?${params}`);
    const data = await res.json();
    setItems(data.items);
    setTotalPages(data.totalPages);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [page, keyword]);

  // 打开表单（新增/编辑）
  const openForm = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name /* 映射其他字段 */ });
    } else {
      setEditingItem(null);
      setFormData({ name: "" /* 重置 */ });
    }
    setError("");
    setShowForm(true);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("名称不能为空");
      return;
    }
    setSubmitting(true);
    setError("");

    const url = editingItem
      ? `/api/admin/{model}/${editingItem.id}`
      : `/api/admin/{model}`;
    const method = editingItem ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowForm(false);
      fetchItems();
    } else {
      const data = await res.json();
      setError(data.error || "操作失败");
    }
    setSubmitting(false);
  };

  // 删除
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除吗？")) return;
    await fetch(`/api/admin/{model}/${id}`, { method: "DELETE" });
    fetchItems();
  };

  return (
    <div className="p-6">
      {/* 标题和操作栏 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{页面标题}</h1>
        <button
          onClick={() => openForm()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          新增
        </button>
      </div>

      {/* 搜索框 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索..."
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          className="border rounded-lg px-4 py-2 w-64"
        />
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">名称</th>
              {/* 根据模型字段生成表头 */}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">创建时间</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">加载中...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">暂无数据</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{item.id}</td>
                  <td className="px-4 py-3 text-sm">{item.name}</td>
                  {/* 根据模型字段生成数据列 */}
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button
                      onClick={() => openForm(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-sm text-gray-500">第 {page} / {totalPages} 页</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? "编辑" : "新增"}
            </h2>
            {error && (
              <div className="bg-red-50 text-red-600 px-3 py-2 rounded mb-3 text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="请输入名称"
                />
              </div>
              {/* 根据模型字段生成表单控件 */}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "提交中..." : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

**代码生成规则：**
- `{model}` → 替换为小写驼峰模型名（如 `product`、`category`）
- `{页面标题}` → 替换为中文名称（如"商品管理"、"分类管理"）
- 表格列和表单字段根据 Prisma 模型的实际字段生成
- 对关联字段用 `include` 加载并在表格中展示关联名称
- 密码字段（`password`、`hashedPassword` 等）**永远不出现在列表和 API 响应中**
- id 列用 `parseInt(id)` 解析（因为本项目用自增 Int 主键）

### 第 4 步：确认并验证

生成完成后，向用户展示：

```
✅ 已生成以下文件：
  src/app/api/admin/{model}/route.ts       — GET 列表 + POST 创建
  src/app/api/admin/{model}/[id]/route.ts  — GET 详情 + PUT 更新 + DELETE 删除
  src/app/admin/{model}/page.tsx           — 管理页面（数据表格 + 新增/编辑弹窗）

📋 验证步骤：
  1. npx prisma generate  （如模型有变更）
  2. npm run dev
  3. 访问 http://localhost:3000/admin/{model} 查看管理页面
  4. 测试：GET /api/admin/{model} 返回列表
  5. 测试：POST /api/admin/{model} 创建数据
```

## 注意事项

1. **所有 UI 文案使用中文** — 按钮、提示、错误信息、占位符
2. **Params 语法** — 使用 Next.js 16 的 `Promise<{ id: string }>` 异步 params
3. **输入验证** — 创建和更新前检查必填字段，返回中文错误提示
4. **密码保护** — `password`、`hashedPassword`、`passwordHash` 等字段通过解构排除，**绝对不通过 API 返回**
5. **错误处理** — 捕获 Prisma 唯一约束错误 `P2002`，返回友好中文提示
6. **分页** — 列表默认每页 10 条，支持 `page` 和 `pageSize` 参数
7. **搜索** — 默认按 `name` 字段模糊搜索，根据模型字段调整

## 常见错误

| 问题 | 原因 | 修复 |
|------|------|------|
| `params.id` 直接访问报错 | Next.js 16 params 是 Promise | 使用 `const { id } = await params` |
| Prisma 错误 `P2002` | 唯一字段重复 | 已捕获返回 409 |
| `parseInt(id)` 返回 NaN | 模型用了 String ID | 改用 `where: { id }` (不转换) |
| 关联数据不显示 | 未使用 `include` | 在 `findMany` 中添加 `include: { relation: true }` |
