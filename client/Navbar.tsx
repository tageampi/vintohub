import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  User as UserIcon,
  Heart, 
  ShoppingCart, 
  Search, 
  Menu, 
  Store 
} from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { wishlistItems } = useWishlist();
  const { getCartItemCount } = useCart();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold font-poppins text-primary-600">
              Vinto<span className="text-primary-800">Hub</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Search for handmade, vintage, pre-loved..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/products">
              <Button variant="ghost" className="px-3 py-2 text-sm">
                Explore
              </Button>
            </Link>
            
            {user?.role === "seller" ? (
              <Link href="/seller">
                <Button variant="ghost" className="px-3 py-2 text-sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth?signup=seller">
                <Button variant="ghost" className="px-3 py-2 text-sm">
                  Sell
                </Button>
              </Link>
            )}
            
            <Link href="/wishlist">
              <Button variant="ghost" className="px-3 py-2 text-sm relative">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
            </Link>
            
            <Link href="/cart">
              <Button variant="ghost" className="px-3 py-2 text-sm relative">
                <ShoppingCart className="h-5 w-5" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Button>
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 text-sm">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/orders">Orders</Link>
                  </DropdownMenuItem>
                  {user.role === "seller" && (
                    <DropdownMenuItem>
                      <Link href="/seller">Seller Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" className="px-3 py-2 text-sm">
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </form>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-3 bg-white rounded-md shadow-lg">
            <div className="py-1">
              <Link href="/products">
                <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Explore
                </a>
              </Link>
              
              {user?.role === "seller" ? (
                <Link href="/seller">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Dashboard
                  </a>
                </Link>
              ) : (
                <Link href="/auth?signup=seller">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sell
                  </a>
                </Link>
              )}
              
              <Link href="/wishlist">
                <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
                </a>
              </Link>
              
              <Link href="/cart">
                <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Cart {getCartItemCount() > 0 && `(${getCartItemCount()})`}
                </a>
              </Link>
              
              {user ? (
                <>
                  <Link href="/profile">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </a>
                  </Link>
                  <Link href="/orders">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Orders
                    </a>
                  </Link>
                  <a 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => logoutMutation.mutate()}
                  >
                    Logout
                  </a>
                </>
              ) : (
                <Link href="/auth">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Login / Sign Up
                  </a>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Navigation */}
      <div className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="overflow-x-auto py-2">
            <div className="flex space-x-6 whitespace-nowrap">
              <Link href="/products">
                <a className={`text-sm font-medium pb-2 ${location === '/products' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
                  All
                </a>
              </Link>
              <Link href="/products?category=thrifted">
                <a className={`text-sm font-medium pb-2 ${location === '/products?category=thrifted' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
                  Thrifted
                </a>
              </Link>
              <Link href="/products?category=handcrafted">
                <a className={`text-sm font-medium pb-2 ${location === '/products?category=handcrafted' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
                  Handcrafted
                </a>
              </Link>
              <Link href="/products?category=artisanal">
                <a className={`text-sm font-medium pb-2 ${location === '/products?category=artisanal' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
                  Artisanal
                </a>
              </Link>
              <Link href="/products?category=pre_order">
                <a className={`text-sm font-medium pb-2 ${location === '/products?category=pre_order' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
                  Pre-order
                </a>
              </Link>
              <Link href="/products?tags=fashion">
                <a className={`text-sm font-medium pb-2 ${location === '/products?tags=fashion' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
                  Fashion
                </a>
              </Link>
              <Link href="/products?tags=home">
                <a className={`text-sm font-medium pb-2 ${location === '/products?tags=home' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
                  Home Decor
                </a>
              </Link>
              <Link href="/products?tags=jewelry">
                <a className={`text-sm font-medium pb-2 ${location === '/products?tags=jewelry' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
                  Jewelry
                </a>
              </Link>
              <Link href="/products?tags=art">
                <a className={`text-sm font-medium pb-2 ${location === '/products?tags=art' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
                  Art
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
