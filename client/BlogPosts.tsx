import { Link } from "wouter";

const blogPosts = [
  {
    title: "The Ultimate Guide to Sustainable Thrifting",
    excerpt: "Learn how to shop responsibly while finding unique treasures for your wardrobe and home.",
    image: "https://images.unsplash.com/photo-1489367874814-f5d040621dd8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "Sustainability",
    categoryColor: "green",
    date: "June 12, 2023",
    readTime: "5 min read",
    link: "/blog/sustainable-thrifting"
  },
  {
    title: "10 Tips for Growing Your Handcrafted Business",
    excerpt: "Expert advice on scaling your handmade business while maintaining quality and authenticity.",
    image: "https://images.unsplash.com/photo-1551462147-37885acc36f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "Business",
    categoryColor: "primary",
    date: "May 28, 2023",
    readTime: "8 min read",
    link: "/blog/handcrafted-business-tips"
  },
  {
    title: "Summer Craft Trends to Watch in 2023",
    excerpt: "Discover the hottest handcrafted trends for the upcoming summer season.",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "Trends",
    categoryColor: "orange",
    date: "June 5, 2023",
    readTime: "4 min read",
    link: "/blog/summer-craft-trends"
  }
];

const getCategoryStyle = (color: string) => {
  switch (color) {
    case 'green':
      return 'bg-green-100 text-green-700';
    case 'orange':
      return 'bg-orange-100 text-orange-700';
    case 'primary':
    default:
      return 'bg-primary-100 text-primary-700';
  }
};

export default function BlogPosts() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold font-poppins">From Our Blog</h2>
          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
            View all <i className="fas fa-arrow-right ml-1"></i>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <Link key={index} href={post.link}>
              <a className="group">
                <div className="rounded-lg overflow-hidden mb-4">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div>
                  <span className={`text-xs font-medium px-2 py-1 ${getCategoryStyle(post.categoryColor)} rounded-full`}>
                    {post.category}
                  </span>
                  <h3 className="mt-3 text-lg font-medium group-hover:text-primary-600 transition">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-gray-600 text-sm">
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>{post.readTime}</span>
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
