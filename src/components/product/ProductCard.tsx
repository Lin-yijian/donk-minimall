import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    slug: string;
    name: string;
    price: number;
    comparePrice?: number | null;
    image: string;
    category?: { name: string; slug: string } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        {product.category && (
          <span className="text-xs text-gray-400 mb-2 inline-block">
            {product.category.name}
          </span>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-red-600">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.comparePrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
