import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutGrid, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  MessageCircle, 
  Settings, 
  Menu, 
  X, 
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

type SellerDashboardLayoutProps = {
  children: ReactNode;
  title: string;
};

export default function SellerDashboardLayout({ children, title }: SellerDashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role !== 'seller') {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You must be logged in as a seller to access the dashboard.",
    });
    return null;
  }

  const routes = [
    { title: "Dashboard", href: "/seller", icon: <LayoutGrid className="h-5 w-5" /> },
    { title: "Products", href: "/seller/products", icon: <Package className="h-5 w-5" /> },
    { title: "Orders", href: "/seller/orders", icon: <ShoppingBag className="h-5 w-5" /> },
    { title: "Analytics", href: "/seller/analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { title: "Messages", href: "/seller/messages", icon: <MessageCircle className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{title} | Seller Dashboard | VintoHub</title>
      </Helmet>
      
      {/* Mobile Sidebar Toggle */}
      <div className="sticky top-0 z-30 flex h-16 items-center bg-white px-4 shadow-sm lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="ml-4 flex-1">
          <h1 className="font-semibold text-lg">Seller Dashboard</h1>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/">
            <a className="flex items-center">
              <span className="text-xl font-bold text-primary-600">Vinto<span className="text-primary-800">Hub</span></span>
            </a>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="flex flex-col gap-1 px-3 py-4">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <Button 
                  variant={location === route.href ? "default" : "ghost"}
                  className={`w-full justify-start`}
                >
                  {route.icon}
                  <span className="ml-2">{route.title}</span>
                </Button>
              </Link>
            ))}
          </div>
          
          <div className="px-3 py-2 mt-auto">
            <div className="rounded-md border p-3 mb-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name || user?.username} />
                  <AvatarFallback>
                    {user?.name?.[0] || user?.username?.[0] || "S"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{user?.name || user?.username}</p>
                  <p className="truncate text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <div className="mt-3 flex flex-col gap-2">
                <Link href="/seller/settings">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Settings className="h-3.5 w-3.5 mr-1" />
                    Settings
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <div className="lg:pl-64">
        <div className="container py-8 px-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
