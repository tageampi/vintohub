import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold font-poppins mb-4">
            Thrift. Craft. Repeat.
          </h1>
          <p className="text-lg md:text-xl mb-8 text-primary-50">
            Discover unique handcrafted goods and thrifted treasures from independent creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button 
                className="bg-white text-primary-600 hover:bg-primary-50 transition border-none"
                size="lg"
              >
                Start Shopping
              </Button>
            </Link>
            <Link href="/auth?signup=seller">
              <Button 
                variant="outline" 
                className="bg-transparent text-white border border-white hover:bg-primary-600 transition"
                size="lg"
              >
                Open Your Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
