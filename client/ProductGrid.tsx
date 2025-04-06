import { Product } from "@shared/schema";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

type ProductGridProps = {
  products: Product[];
  isLoading: boolean;
};

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden border border-gray-200 bg-white">
            <div className="relative pb-[100%]">
              <Skeleton className="absolute inset-0 h-full w-full" />
            </div>
            <div className="p-4">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-2" />
              <Skeleton className="h-6 w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // If no products available
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">No products found matching your criteria.</p>
        <p className="text-sm text-gray-400">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  // Render products grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
