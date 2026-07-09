import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 开始写入种子数据...");

  // 1. 创建管理员账号
  const admin = await db.user.upsert({
    where: { email: "admin@minimall.com" },
    update: {},
    create: {
      email: "admin@minimall.com",
      name: "管理员",
      password: await bcrypt.hash("admin123", 12),
      role: "ADMIN",
      totalSpent: 0,
      membershipTier: "REGULAR",
    },
  });
  console.log(`  ✅ 管理员: ${admin.email} / admin123`);

  // 2. 创建分类
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: "electronics" },
      update: {},
      create: { name: "数码电子", slug: "electronics" },
    }),
    db.category.upsert({
      where: { slug: "clothing" },
      update: {},
      create: { name: "服饰鞋包", slug: "clothing" },
    }),
    db.category.upsert({
      where: { slug: "home" },
      update: {},
      create: { name: "家居生活", slug: "home" },
    }),
    db.category.upsert({
      where: { slug: "food" },
      update: {},
      create: { name: "食品饮料", slug: "food" },
    }),
  ]);
  console.log(`  ✅ 分类: ${categories.map((c) => c.name).join(", ")}`);

  // 3. 创建商品
  const products = [
    {
      name: "无线蓝牙耳机 Pro",
      slug: "wireless-earbuds-pro",
      description:
        "高品质无线蓝牙耳机，支持主动降噪，续航长达30小时，IPX5防水，触控操作。适合通勤、运动、办公等多种场景。",
      price: 299,
      comparePrice: 499,
      image: "https://picsum.photos/seed/earbuds/400/400",
      stock: 150,
      isFeatured: true,
      isActive: true,
      categoryId: categories[0].id,
    },
    {
      name: "机械键盘 RGB 版",
      slug: "mechanical-keyboard-rgb",
      description:
        "87键紧凑布局，Cherry MX 青轴，RGB背光，铝合金面板，Type-C可拆卸线缆。程序员必备利器。",
      price: 459,
      comparePrice: 599,
      image: "https://picsum.photos/seed/keyboard/400/400",
      stock: 80,
      isFeatured: true,
      isActive: true,
      categoryId: categories[0].id,
    },
    {
      name: "便携充电宝 20000mAh",
      slug: "portable-charger-20000",
      description:
        "20000mAh大容量，支持65W快充，同时充3台设备，LED电量显示，轻薄便携。",
      price: 159,
      comparePrice: 229,
      image: "https://picsum.photos/seed/charger/400/400",
      stock: 200,
      isFeatured: true,
      isActive: true,
      categoryId: categories[0].id,
    },
    {
      name: "男士休闲运动鞋",
      slug: "mens-sneakers",
      description: "透气飞织鞋面，EVA缓震中底，防滑橡胶大底，适合日常穿着和轻度运动。",
      price: 329,
      comparePrice: 499,
      image: "https://picsum.photos/seed/sneakers/400/400",
      stock: 120,
      isFeatured: true,
      isActive: true,
      categoryId: categories[1].id,
    },
    {
      name: "简约双肩包",
      slug: "minimalist-backpack",
      description: "防泼水面料，15.6寸笔记本仓，多功能分区，人体工学背板，通勤出行必备。",
      price: 199,
      comparePrice: 289,
      image: "https://picsum.photos/seed/backpack/400/400",
      stock: 90,
      isFeatured: true,
      isActive: true,
      categoryId: categories[1].id,
    },
    {
      name: "记忆棉护颈枕",
      slug: "memory-foam-pillow",
      description: "慢回弹记忆棉，人体工学曲线设计，透气天丝枕套，有效缓解颈椎疲劳。",
      price: 129,
      comparePrice: 199,
      image: "https://picsum.photos/seed/pillow/400/400",
      stock: 60,
      isFeatured: true,
      isActive: true,
      categoryId: categories[2].id,
    },
    {
      name: "智能台灯 护眼版",
      slug: "smart-desk-lamp",
      description:
        "无频闪LED光源，触控调光调色温，定时休息提醒，USB充电口，Ra95高显色。",
      price: 249,
      comparePrice: 349,
      image: "https://picsum.photos/seed/lamp/400/400",
      stock: 45,
      isFeatured: false,
      isActive: true,
      categoryId: categories[2].id,
    },
    {
      name: "不锈钢保温杯 500ml",
      slug: "thermos-cup-500",
      description: "316不锈钢内胆，真空断热技术，12小时保温保冷，食品级硅胶密封圈。",
      price: 89,
      comparePrice: 129,
      image: "https://picsum.photos/seed/cup/400/400",
      stock: 300,
      isFeatured: false,
      isActive: true,
      categoryId: categories[2].id,
    },
    {
      name: "坚果大礼包 12袋装",
      slug: "nut-gift-box",
      description: "精选6种坚果组合，每日坚果独立包装，原味烘培无添加，健康零食首选。",
      price: 99,
      comparePrice: 158,
      image: "https://picsum.photos/seed/nuts/400/400",
      stock: 500,
      isFeatured: false,
      isActive: true,
      categoryId: categories[3].id,
    },
    {
      name: "有机绿茶 明前龙井",
      slug: "organic-green-tea",
      description: "2026年明前采摘，一芽一叶，手工炒制，豆香浓郁，回甘持久。送礼自用皆宜。",
      price: 188,
      comparePrice: 288,
      image: "https://picsum.photos/seed/tea/400/400",
      stock: 30,
      isFeatured: false,
      isActive: true,
      categoryId: categories[3].id,
    },
    {
      name: "无线鼠标 静音版",
      slug: "silent-wireless-mouse",
      description: "2.4G无线连接，静音按键，1600DPI精准定位，人体工学设计，1节电池用一年。",
      price: 69,
      comparePrice: 99,
      image: "https://picsum.photos/seed/mouse/400/400",
      stock: 250,
      isFeatured: false,
      isActive: true,
      categoryId: categories[0].id,
    },
    {
      name: "女士帆布托特包",
      slug: "canvas-tote-bag",
      description: "加厚帆布面料，大容量设计，内置拉链袋，可肩背可手提，百搭实用。",
      price: 149,
      comparePrice: 219,
      image: "https://picsum.photos/seed/tote/400/400",
      stock: 70,
      isFeatured: false,
      isActive: true,
      categoryId: categories[1].id,
    },
  ];

  for (const product of products) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log(`  ✅ 商品: ${products.length} 个`);

  console.log("\n🎉 种子数据写入完成！");
  console.log("   管理员: admin@minimall.com / admin123");
}

main()
  .catch((e) => {
    console.error("种子数据写入失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
