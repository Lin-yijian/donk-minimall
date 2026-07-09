# MiniMall — 微型电商

基于 **Next.js 16** 的全栈微型电商系统，支持商品浏览、用户认证、购物车、订单管理、会员等级、后台管理。

## 技术栈

| 技术 | 版本 | 
|------|------|
| Next.js | 16.2.10 (App Router) |
| React | 19.2 |
| TypeScript | 5.6+ |
| Tailwind CSS | 4.3 |
| Prisma | 5.22 |
| SQLite | 文件数据库 |
| Auth.js v5 | 5.0.0-beta.31 |
| Vitest | 2.1 |

## 快速开始

**环境要求：** Node.js >= 20.9.0

```bash
npm install
npx prisma db push
npm run db:seed    # 写入种子数据
npm run dev        # http://localhost:3000
```

**测试账号：** `admin@minimall.com` / `admin123`

## 功能

- 🏠 **首页** — 精选商品 + 分类导航
- 🛍️ **商品浏览** — 列表、搜索、分类筛选、详情
- 🔑 **用户认证** — 注册、登录、JWT 会话
- 🛒 **购物车** — 加入购物车、修改数量、删除
- 📦 **订单管理** — 下单（模拟支付）、订单列表、订单详情
- ⭐ **会员等级** — 星悦三级，累计消费自动升级，享受折扣
- 📊 **后台管理** — 仪表盘、商品 CRUD、订单管理、分类管理

## 星悦会员

| 等级 | 累计消费 | 折扣 |
|------|---------|------|
| 普通会员 | < ¥800 | 无 |
| ⭐ 星悦一级 | ≥ ¥800 | 9.8 折 |
| ⭐⭐ 星悦二级 | ≥ ¥8,000 | 9 折 |
| ⭐⭐⭐ 星悦三级 | ≥ ¥80,000 | 8.8 折 |

## 项目结构

```
src/
├── app/              # App Router 页面
│   ├── admin/        # 后台管理
│   ├── auth/         # 登录/注册
│   ├── cart/         # 购物车
│   ├── orders/       # 订单
│   ├── products/     # 商品
│   └── api/          # API 路由
├── components/       # React 组件
├── lib/              # 工具库 (db, auth, membership, utils)
├── actions/          # Server Actions
└── __tests__/        # 测试 (52 个)
```

## 命令

```bash
npm run dev        # 开发服务器
npm run build      # 生产构建
npm run test       # 运行测试
npm run db:seed    # 写入种子数据
npx prisma studio  # 数据库管理界面
```
