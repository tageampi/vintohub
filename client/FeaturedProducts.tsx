import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "../products/ProductCard";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedProducts() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Take only the first 4 products for featured section
  const featuredProducts = products.slice(0, 4);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold font-poppins">Featured Products</h2>
          <Link href="/products">
            <a className="text-primary-600 hover:text-primary-700 font-medium">
              View all <i className="fas fa-arrow-right ml-1"></i>
            </a>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
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
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No products available at the moment.</p>
            <Link href="/auth?signup=seller">
              <a className="text-primary-600 font-medium hover:underline mt-2 inline-block">
                Become a seller and add products
              </a>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
