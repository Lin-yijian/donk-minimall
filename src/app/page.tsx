import { getFeaturedProducts, getCategories } from "@/actions/product";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* 顶部 Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">欢迎来到 MiniMall</h1>
          <p className="text-blue-100 text-lg mb-8">精选好物，品质生活</p>
          <Link
            href="/products"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
          >
            立即选购
          </Link>
        </div>
      </section>

      {/* 分类导航 */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">商品分类</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-2">
                {cat.slug === "electronics" ? "📱" :
                 cat.slug === "clothing" ? "👗" :
                 cat.slug === "home" ? "🏠" : "🍔"}
              </div>
              <h3 className="font-medium">{cat.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{cat._count.products} 件商品</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 精选商品 */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">精选好物</h2>
          <Link href="/products" className="text-blue-600 hover:underline text-sm">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
