import { getProductBySlug } from "@/actions/product";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const images = JSON.parse(product.images || "[]") as string[];
  const displayImages = images.length > 0 ? images : [product.image];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 面包屑 */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-blue-600">商品</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-blue-600"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 商品图片 */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={displayImages[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {displayImages.length > 1 && (
            <div className="flex gap-2">
              {displayImages.map((img: string, i: number) => (
                <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {product.category.name}
            </Link>
          )}

          <div className="mt-6 bg-gray-50 rounded-xl p-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-red-600">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.comparePrice!)}
                </span>
              )}
              {hasDiscount && (
                <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded">
                  省{formatPrice(product.comparePrice! - product.price)}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-2">
              库存：{product.stock > 0 ? `${product.stock} 件` : "暂时缺货"}
            </p>
          </div>

          <div className="mt-8">
            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="font-medium mb-3">商品详情</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
