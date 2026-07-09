import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { id: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { name, slug } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "分类名称不能为空" }, { status: 400 });
  }

  const category = await db.category.create({
    data: {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
    },
  });

  return NextResponse.json(category, { status: 201 });
}
