import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { CartProvider } from "@/hooks/use-cart";
import { ChatProvider } from "@/hooks/use-chat";

type MainLayoutProps = {
  children: React.ReactNode;
  hideFooter?: boolean;
};

export default function MainLayout({ children, hideFooter = false }: MainLayoutProps) {
  return (
    <WishlistProvider>
      <CartProvider>
        <ChatProvider>
          <div className="flex flex-col min-h-screen font-inter text-gray-800 bg-gray-50">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            {!hideFooter && <Footer />}
          </div>
        </ChatProvider>
      </CartProvider>
    </WishlistProvider>
  );
}
