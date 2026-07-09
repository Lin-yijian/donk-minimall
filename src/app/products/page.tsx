import { getProducts, getCategories } from "@/actions/product";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    keyword?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const keyword = params.keyword || "";
  const categorySlug = params.category || "";
  const page = parseInt(params.page || "1");

  const [{ items, total, totalPages }, categories] = await Promise.all([
    getProducts({ keyword, categorySlug, page }),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">全部商品</h1>

      <div className="flex gap-8">
        {/* 左侧筛选 */}
        <aside className="hidden lg:block w-48 shrink-0">
          <h3 className="font-medium mb-3">商品分类</h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="/products"
                className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !categorySlug
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                全部分类 ({total} 件)
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    categorySlug === cat.slug
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* 右侧商品列表 */}
        <div className="flex-1">
          {/* 搜索框 */}
          <form className="mb-6">
            <div className="flex gap-2">
              <input
                name="keyword"
                type="text"
                defaultValue={keyword}
                placeholder="搜索商品..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                搜索
              </button>
              {categorySlug && (
                <input type="hidden" name="category" value={categorySlug} />
              )}
            </div>
          </form>

          {/* 移动端分类筛选 */}
          <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-2">
            <Link
              href="/products"
              className={`shrink-0 px-3 py-1 rounded-full text-xs ${
                !categorySlug
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              全部
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`shrink-0 px-3 py-1 rounded-full text-xs ${
                  categorySlug === cat.slug
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* 商品网格 */}
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-4">🔍</p>
              <p>没有找到相关商品</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/products?${new URLSearchParams({ ...(keyword && { keyword }), ...(categorySlug && { category: categorySlug }), page: String(p) }).toString()}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm ${
                    page === p
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
