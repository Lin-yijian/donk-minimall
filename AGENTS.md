<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# MiniMall — 微型电商项目

## 项目概述

MiniMall 是一个基于 **Next.js 16 App Router** 的微型全栈电商系统，支持商品浏览、用户认证、购物车、订单管理、模拟支付、后台管理，以及**星悦会员等级体系**（按累计消费金额自动升降级并享受折扣）。

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.2.10 | 全栈框架（App Router + Server Components） |
| React | 19.2.x | UI 框架（Next.js 内置） |
| TypeScript | ~5.6 | 类型安全 |
| Tailwind CSS | 4.3.2 | 原子化 CSS（v4 CSS-first 配置） |
| Prisma | 5.22.0 | ORM |
| SQLite | 内嵌 `file:./dev.db` | 数据库 |
| Auth.js v5 | 待安装 `next-auth@beta` | 用户认证 |
| bcryptjs | 最新 | 密码哈希 |
| Zod | 最新 | Server Actions 参数校验 |

---

## Node.js 版本要求

- **Next.js 16** 要求 Node.js >= 20.9.0
- **Prisma 5.22.0** 兼容 Node.js 20+

---

## 项目目录结构

```
minimall/
├── prisma/
│   ├── schema.prisma          # 数据库 Schema（7个模型）
│   ├── seed.ts                # 种子数据
│   └── dev.db                 # SQLite 数据库文件
├── src/
│   ├── app/                   # App Router 页面
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页（精选商品）
│   │   ├── globals.css        # 全局样式（Tailwind v4 CSS-first）
│   │   ├── products/          # 商品浏览
│   │   │   ├── page.tsx       # 商品列表（搜索+分类筛选）
│   │   │   └── [slug]/page.tsx # 商品详情
│   │   ├── cart/page.tsx      # 购物车
│   │   ├── orders/            # 订单
│   │   │   ├── page.tsx       # 我的订单
│   │   │   └── [id]/page.tsx  # 订单详情
│   │   ├── auth/              # 认证
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── admin/             # 后台管理（需 ADMIN 角色）
│   │   │   ├── layout.tsx     # 权限守卫
│   │   │   ├── page.tsx       # 仪表盘
│   │   │   ├── products/      # 商品 CRUD
│   │   │   ├── orders/        # 订单管理
│   │   │   └── categories/    # 分类管理
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── components/
│   │   ├── ui/                # 通用 UI（Button, Input, Card...）
│   │   ├── layout/            # Header, Footer, Navbar
│   │   ├── product/           # ProductCard, ProductGrid, SearchBar
│   │   ├── cart/              # CartItem, CartSummary
│   │   ├── order/             # OrderCard, OrderStatusBadge
│   │   ├── user/              # MemberCard（星悦等级展示）
│   │   └── admin/             # AdminSidebar, DataTable, ProductForm
│   ├── lib/
│   │   ├── db.ts              # Prisma Client 单例
│   │   ├── auth.ts            # Auth.js v5 配置
│   │   ├── membership.ts      # 星悦会员等级计算
│   │   └── utils.ts           # 工具函数（格式化价格、模拟支付）
│   ├── actions/               # Server Actions
│   │   ├── auth.ts            # 注册/登录
│   │   ├── product.ts         # 商品 CRUD
│   │   ├── cart.ts            # 购物车操作
│   │   └── order.ts           # 订单创建/查询
│   └── middleware.ts          # 路由守卫
├── public/uploads/            # 商品图片
├── package.json
├── tsconfig.json
├── next.config.ts
├── .env                       # DATABASE_URL
└── .claude/
    └── settings.local.json    # Claude Code 本地权限配置
```

---

## 数据库 Schema（7 个模型）

### User — 用户
- `id`, `email` (unique), `name`, `password` (bcrypt), `role` (CUSTOMER|ADMIN)
- **会员字段**: `totalSpent` (累计消费), `membershipTier` (REGULAR|STAR_1|STAR_2|STAR_3)
- 关系: `carts[]`, `orders[]`

### Category — 商品分类
- `id`, `name` (unique), `slug` (unique)
- 关系: `products[]`

### Product — 商品
- `id`, `name`, `slug` (unique), `description`, `price`, `comparePrice`, `image`, `images`, `stock`, `isFeatured`, `isActive`
- 关系: `categoryId` → Category, `cartItems[]`, `orderItems[]`

### Cart — 购物车
- `id`, `quantity`, 冗余快照 (`productName`, `productPrice`, `productImage`)
- 关系: `userId` → User, `productId` → Product
- 约束: `@@unique([userId, productId])`

### Order — 订单
- `id`, `status` (PENDING|PAID|SHIPPED|DELIVERED|CANCELLED), `subtotal`, `discount`, `shipping`, `total`
- 关系: `userId` → User, `items[]`

### OrderItem — 订单明细
- `id`, 快照字段 (`productName`, `productPrice`, `productImage`), `quantity`
- 关系: `orderId` → Order, `productId` → Product

---

## 星悦会员等级体系

| 等级 | 名称 | 累计消费门槛 | 折扣 |
|------|------|-------------|------|
| REGULAR | 普通会员 | 默认（< ¥800） | 无折扣 |
| STAR_1 | 星悦一级 ⭐ | ≥ ¥800 | 9.8 折 |
| STAR_2 | 星悦二级 ⭐⭐ | ≥ ¥8,000 | 9 折 |
| STAR_3 | 星悦三级 ⭐⭐⭐ | ≥ ¥80,000 | 8.8 折 |

**核心规则**：
1. 订单支付成功后累加 `totalSpent`，根据累计消费 **只升不降**
2. 折扣仅适用于**后续订单**（触发升级的当前订单不享受新折扣）
3. 下单时读取 `membershipTier` 计算折扣价
4. 核心逻辑文件：`src/lib/membership.ts`

---

## 功能模块与路由

| 模块 | 路由 | 认证要求 |
|------|------|---------|
| **首页** | `/` | 公开 |
| **商品列表** | `/products` | 公开 |
| **商品详情** | `/products/[slug]` | 公开 |
| **购物车** | `/cart` | 需登录 |
| **订单列表** | `/orders` | 需登录 |
| **订单详情** | `/orders/[id]` | 需登录 |
| **登录** | `/auth/login` | 公开 |
| **注册** | `/auth/register` | 公开 |
| **后台仪表盘** | `/admin` | ADMIN 角色 |
| **商品管理** | `/admin/products` | ADMIN 角色 |
| **订单管理** | `/admin/orders` | ADMIN 角色 |
| **分类管理** | `/admin/categories` | ADMIN 角色 |

---

## Next.js 16 编码约定

1. **默认 Server Components** — `app/` 下所有组件默认为 RSC，只在需要交互时添加 `'use client'`
2. **Server Actions** — 数据变更放在 `src/actions/`，用 `"use server"` 标记
3. **数据读取** — 直接在 Server Components 中使用 `db.xxx.findMany()`，无需 API 路由
4. **缓存** — Next.js 16 默认动态渲染，需要缓存时显式使用 `"use cache"` 指令
5. **Tailwind CSS v4** — 使用 CSS-first 配置 (`@theme inline`)，不再使用 `tailwind.config.js`
6. **类型安全** — Server Actions 参数用 Zod 校验，Prisma 提供完整类型推导

---

## 常用命令

```bash
# 开发
npm run dev                 # 启动开发服务器（Turbopack 默认）
npm run build               # 生产构建
npm run start               # 启动生产服务器

# 数据库
npx prisma db push          # 推送 Schema 到 SQLite
npx prisma generate         # 重新生成 Prisma Client
npx prisma studio           # 数据库可视化管理（端口 5555）
npx prisma migrate dev      # 创建迁移文件

# 种子数据
npx tsx prisma/seed.ts      # 写入种子数据

# 权限配置
# 权限规则位于 .claude/settings.local.json
```

---

## 当前状态

- [x] Step 1: 项目初始化 + Prisma Schema + SQLite + 工具库
- [ ] Step 2: 认证系统（待实施）
- [ ] Step 3: 商品浏览（待实施）
- [ ] Step 4: 购物车（待实施）
- [ ] Step 5: 订单（待实施）
- [ ] Step 6: 后台管理（待实施）
- [ ] Step 7: 收尾优化（待实施）
