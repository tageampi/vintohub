import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoriesShowcase from "@/components/home/CategoriesShowcase";
import FeaturedSellers from "@/components/home/FeaturedSellers";
import SellerCTA from "@/components/home/SellerCTA";
import BlogPosts from "@/components/home/BlogPosts";
import { Helmet } from "react-helmet-async";

export default function HomePage() {
  return (
    <MainLayout>
      <Helmet>
        <title>VintoHub - Thrift. Craft. Repeat.</title>
        <meta name="description" content="Discover unique handcrafted goods and thrifted treasures from independent creators." />
      </Helmet>
      
      <HeroSection />
      <FeaturedProducts />
      <CategoriesShowcase />
      <FeaturedSellers />
      <SellerCTA />
      <BlogPosts />
    </MainLayout>
  );
}
