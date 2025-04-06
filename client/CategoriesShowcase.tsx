import { Link } from "wouter";

const categories = [
  {
    name: "Thrifted",
    description: "Vintage & pre-loved",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    link: "/products?category=thrifted"
  },
  {
    name: "Handcrafted",
    description: "Made with love",
    image: "https://images.unsplash.com/photo-1606760664668-c2a0b3582588?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    link: "/products?category=handcrafted"
  },
  {
    name: "Artisanal",
    description: "Unique creations",
    image: "https://images.unsplash.com/photo-1579762593175-20226054cad0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    link: "/products?category=artisanal"
  },
  {
    name: "Pre-order",
    description: "Custom & made-to-order",
    image: "https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    link: "/products?category=pre_order"
  }
];

export default function CategoriesShowcase() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold font-poppins mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link key={index} href={category.link}>
              <a className="category-card relative rounded-lg overflow-hidden group">
                <div className="relative pb-[130%] overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                    <p className="text-white/90 text-sm">{category.description}</p>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
