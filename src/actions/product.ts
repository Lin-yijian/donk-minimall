"use server";

import { db } from "@/lib/db";

export async function getFeaturedProducts() {
  return db.product.findMany({
    where: { isFeatured: true, isActive: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

export async function getProducts({
  keyword,
  categorySlug,
  page = 1,
  pageSize = 12,
}: {
  keyword?: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}) {
  const where: any = { isActive: true };

  if (keyword) {
    where.OR = [
      { name: { contains: keyword } },
      { description: { contains: keyword } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    db.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function getCategories() {
  return db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}
