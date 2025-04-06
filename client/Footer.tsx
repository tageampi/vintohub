import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold font-poppins mb-4">VintoHub</h3>
            <p className="text-gray-300 mb-4">
              A marketplace for unique thrifted and handcrafted goods from independent creators.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-pinterest text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary-300">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products">
                  <a className="text-gray-300 hover:text-white transition">
                    All Products
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=thrifted">
                  <a className="text-gray-300 hover:text-white transition">
                    Thrifted
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=handcrafted">
                  <a className="text-gray-300 hover:text-white transition">
                    Handcrafted
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=artisanal">
                  <a className="text-gray-300 hover:text-white transition">
                    Artisanal
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary-300">Sell</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/auth?signup=seller">
                  <a className="text-gray-300 hover:text-white transition">
                    Sell on VintoHub
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/seller">
                  <a className="text-gray-300 hover:text-white transition">
                    Seller Dashboard
                  </a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Seller Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Seller FAQ
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary-300">Help</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Privacy Settings
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Terms & Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} VintoHub. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
