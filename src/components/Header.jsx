import { Link } from "@inertiajs/react";

const Header = () => (
  <header className="bg-white text-black shadow-sm">
    <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-10">
        {/* Logo */}
        <Link href="/">
          <img 
            src="/static/logo/logo.png" 
            alt="Allsafe Logo" 
            className="h-8 transition-transform hover:scale-105" 
          />
        </Link>
        
        {/* Navigation Menu */}
        <ul className="flex space-x-6">
          <li>
            <Link
              href="/resource_dashboard"
              className="text-gray-700 hover:text-blue-600 font-medium text-lg px-3 py-2 rounded-md transition-colors duration-200 hover:bg-blue-50"
            >
              Resource
            </Link>
          </li>
          <li>
            <Link
              href="/management"
              className="text-gray-700 hover:text-blue-600 font-medium text-lg px-3 py-2 rounded-md transition-colors duration-200 hover:bg-blue-50"
            >
              Management
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="text-gray-600 font-medium px-4 py-2 rounded-full bg-gray-100">
        Daniel.Destaw@yahoo.com
      </div>
    </nav>
  </header>
);

export default Header;