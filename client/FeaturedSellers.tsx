import { useQuery } from "@tanstack/react-query";
import { Shop, User } from "@shared/schema";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedSellers() {
  const { data: shops = [], isLoading } = useQuery<Shop[]>({
    queryKey: ["/api/shops"],
  });

  // Get just the first 6 shops
  const featuredShops = shops.slice(0, 6);

  // Sample shop categories mapping (in a real app this would come from the API)
  const shopCategories = {
    1: "Ceramics & Pottery",
    2: "Vintage Clothing",
    3: "Macrame & Fiber Art",
    4: "Fine Art & Painting",
    5: "Sustainable Home Decor",
    6: "Handmade Jewelry"
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold font-poppins">Featured Sellers</h2>
          <Link href="/shops">
            <a className="text-primary-600 hover:text-primary-700 font-medium">
              View all <i className="fas fa-arrow-right ml-1"></i>
            </a>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="rounded-full h-24 w-24 md:h-28 md:w-28 mx-auto mb-3" />
                <Skeleton className="h-4 w-20 mx-auto mb-2" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        ) : featuredShops.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {featuredShops.map((shop) => (
              <Link key={shop.id} href={`/shops/${shop.id}`}>
                <a className="text-center group">
                  <div className="rounded-full overflow-hidden border-2 border-primary-200 mx-auto mb-3 h-24 w-24 md:h-28 md:w-28">
                    <img 
                      src={shop.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=6b46c1&color=fff`} 
                      alt={shop.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-sm group-hover:text-primary-600">{shop.name}</h3>
                  <p className="text-xs text-gray-500">{shopCategories[shop.id as keyof typeof shopCategories] || "Handmade Goods"}</p>
                  <div className="flex justify-center mt-1 text-yellow-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No sellers available at the moment.</p>
            <Link href="/auth?signup=seller">
              <a className="text-primary-600 font-medium hover:underline mt-2 inline-block">
                Become a seller
              </a>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
