import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Store, Package, DollarSign } from "lucide-react";

export default function SellerCTA() {
  return (
    <section className="py-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-4">Start Selling on VintoHub</h2>
          <p className="text-lg mb-8 text-primary-50">
            Turn your passion into profit. Join thousands of creators selling their unique products without high fees or limitations.
          </p>
          <div className="flex flex-wrap gap-8 justify-center mb-10">
            <div className="flex flex-col items-center max-w-[160px]">
              <div className="bg-white/20 rounded-full h-16 w-16 flex items-center justify-center mb-3">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Create a Shop</h3>
              <p className="text-sm text-primary-100">Set up your shop in minutes</p>
            </div>
            <div className="flex flex-col items-center max-w-[160px]">
              <div className="bg-white/20 rounded-full h-16 w-16 flex items-center justify-center mb-3">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">List Products</h3>
              <p className="text-sm text-primary-100">Upload your unique items</p>
            </div>
            <div className="flex flex-col items-center max-w-[160px]">
              <div className="bg-white/20 rounded-full h-16 w-16 flex items-center justify-center mb-3">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Start Selling</h3>
              <p className="text-sm text-primary-100">Reach buyers worldwide</p>
            </div>
          </div>
          <Link href="/auth?signup=seller">
            <Button 
              className="bg-white text-primary-600 hover:bg-primary-50 transition border-none"
              size="lg"
            >
              Open Your Shop
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
