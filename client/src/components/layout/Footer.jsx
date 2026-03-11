import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const LINKS = {
  Shop: [
    { label: 'All Pickles',    href: '/products?category=pickles' },
    { label: 'Seasonal Items', href: '/products?isSeasonal=true' },
    { label: 'Bestsellers',    href: '/products?isBestseller=true' },
    { label: 'New Arrivals',   href: '/products?isNewArrival=true' },
  ],
  Help: [
    { label: 'Track Order',    href: '/orders' },
    { label: 'Returns Policy', href: '/returns' },
    { label: 'Shipping Info',  href: '/shipping' },
    { label: 'Contact Us',     href: '/contact' },
  ],
  Company: [
    { label: 'About Us',       href: '/about' },
    { label: 'Our Story',      href: '/about#story' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use',   href: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center">
                <span className="text-white text-lg">🌿</span>
              </div>
              <span className="font-display text-2xl font-bold text-white">Apni Rasoi</span>
            </div>
            <p className="text-brand-300 text-sm leading-relaxed max-w-xs">
              Authentic, handmade pickles and seasonal Indian delicacies — crafted with love, 
              traditional recipes, and the finest ingredients.
            </p>

            <div className="flex flex-col gap-2 mt-6 text-sm text-brand-300">
              <a href="mailto:hello@apnirasoi.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> hello@apnirasoi.com
              </a>
              <a href="tel:+919999999999" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> +91 99999 99999
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> New Delhi, India
              </span>
            </div>

            <div className="flex items-center gap-3 mt-6">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-brand-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                  <Icon className="w-4 h-4 text-brand-200" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Groups */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-brand-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-brand-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-400">
          <p>© {new Date().getFullYear()} Apni Rasoi. All rights reserved.</p>
          <p>Made with 🌿 in India</p>
        </div>
      </div>
    </footer>
  );
}