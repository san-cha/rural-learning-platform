import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold text-white">SarvaShiksha</h2>
          <p className="text-sm mt-2">
            Empowering education for every learner, everywhere.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-white mb-2">Explore</h3>
            <ul className="space-y-1">
              <li><Link to="/features" className="hover:text-white">Features</Link></li>
              <li><Link to="/auth" className="hover:text-white">Get Started</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Support</h3>
            <ul className="space-y-1">
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Social */}
        <div>
          <h3 className="font-semibold text-white mb-2">Stay Connected</h3>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">🌐</a>
            <a href="#" className="hover:text-white">📘</a>
            <a href="#" className="hover:text-white">🐦</a>
          </div>
        </div>

      </div>

      {/* Bottom Line */}
      <div className="text-center text-xs text-gray-500 mt-8 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} LearnHub. All rights reserved.
      </div>
    </footer>
  );
}
