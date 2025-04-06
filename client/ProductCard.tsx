import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  // Function to generate category badge styling
  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'thrifted':
        return 'bg-blue-100 text-blue-700';
      case 'handcrafted':
        return 'bg-primary-100 text-primary-700';
      case 'artisanal':
        return 'bg-yellow-100 text-yellow-700';
      case 'pre_order':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', '-');
  };

  // Default placeholder image if no images are provided
  const defaultImage = "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/products/${product.id}`}>
        <a className="block">
          <div className="relative pb-[100%] overflow-hidden">
            <img 
              src={product.images?.[0] || defaultImage} 
              alt={product.title} 
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <button 
                className={`bg-white rounded-full p-2 shadow ${isInWishlist(product.id) ? 'text-primary-600' : 'hover:text-primary-600'} transition`}
                onClick={handleToggleWishlist}
              >
                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center mb-1">
              <Badge variant="outline" className={`text-xs ${getCategoryBadgeStyle(product.category)}`}>
                {formatCategoryName(product.category)}
              </Badge>
              <span className="ml-auto text-sm text-gray-500">
                {/* Rating would typically come from reviews, adding hardcoded value for now */}
                4.8 <i className="fas fa-star text-yellow-400"></i>
              </span>
            </div>
            <h3 className="text-sm font-medium mb-1 truncate">{product.title}</h3>
            <p className="text-gray-500 text-xs truncate mb-2">
              By Shop Name {/* Would normally use shop name from product.shopId */}
            </p>
            <div className="flex justify-between items-center">
              <span className="font-semibold">{formatCurrency(product.price / 100)}</span>
              <Button 
                size="sm" 
                className="text-xs rounded-full"
                onClick={handleAddToCart}
              >
                Add to cart
              </Button>
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
}
