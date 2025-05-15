import { Link } from "@inertiajs/react";

const Header = () => (
  <header className="bg-white text-black py-6 px-4 border-b border-gray-200">
    <nav className="flex justify-between items-center">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href="/">
          <img src="/static/logo/logo.png" alt="Allsafe Logo" className="h-8 pl-24" />
        </Link>
        {/* Navigation Menu */}
        <ul className="flex gap-4 pl-10">
          <li>
            <Link
              href="/resource_dashboard"
              className="font-normal text-lg hover:text-blue-600 px-3 py-1"
            >
              Resource
            </Link>
          </li>
          <li>
            <Link
              href="/management"
              className="font-thin text-lg hover:text-blue-600 px-3 py-1"
            >
              Management
            </Link>
          </li>
        </ul>
      </div>
      <div className="font-light">Daniel.Destaw@yahoo.com</div>
    </nav>
  </header>
);

export default Header;
