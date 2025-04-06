import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { HelmetProvider } from "react-helmet-async";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductsPage from "@/pages/products-page";
import ProductPage from "@/pages/product-page";
import CartPage from "@/pages/cart-page";
import WishlistPage from "@/pages/wishlist-page";
import SellerDashboard from "@/pages/seller-dashboard";
import SellerProducts from "@/pages/seller-dashboard/products";
import SellerOrders from "@/pages/seller-dashboard/orders";
import SellerAnalytics from "@/pages/seller-dashboard/analytics";
import SellerMessages from "@/pages/seller-dashboard/messages";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id" component={ProductPage} />
      <Route path="/wishlist" component={WishlistPage} />
      <Route path="/cart" component={CartPage} />
      <ProtectedRoute path="/seller" component={SellerDashboard} />
      <ProtectedRoute path="/seller/products" component={SellerProducts} />
      <ProtectedRoute path="/seller/orders" component={SellerOrders} />
      <ProtectedRoute path="/seller/analytics" component={SellerAnalytics} />
      <ProtectedRoute path="/seller/messages" component={SellerMessages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router />
      <Toaster />
    </HelmetProvider>
  );
}

export default App;
