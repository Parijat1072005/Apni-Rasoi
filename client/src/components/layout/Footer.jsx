import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const SHOP_LINKS = [
  { label: 'All Pickles',     to: '/products' },
  { label: 'Seasonal Items',  to: '/products?isSeasonal=true' },
  { label: 'Bestsellers',     to: '/products?isBestseller=true' },
  { label: 'New Arrivals',    to: '/products?isNewArrival=true' },
];

const HELP_LINKS = [
  { label: 'Track Order',     to: '/track-order' },
  { label: 'Returns Policy',  to: '/return-policy' },
  { label: 'Shipping Info',   to: '/shipping-policy' },
  { label: 'Contact Us',      to: '/contact' },
  { label: 'FAQs',            to: '/faq' },
];

const COMPANY_LINKS = [
  { label: 'About Us',        to: '/about' },
  { label: 'Our Story',       to: '/our-story' },
  { label: 'Privacy Policy',  to: '/privacy-policy' },
  { label: 'Terms of Use',    to: '/terms' },
];

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-brand-700 flex items-center justify-center">
                <span className="text-white text-lg">🌿</span>
              </div>
              <span className="font-display font-bold text-xl text-white">Apni Rasoi</span>
            </Link>
            <p className="text-brand-300 text-sm leading-relaxed mb-6">
              Authentic, handmade pickles and seasonal Indian delicacies — crafted with love,
              traditional recipes, and the finest ingredients.
            </p>
            <div className="space-y-2 mb-6">
              <a href="mailto:parijat1072005@gmail.com"
                className="flex items-center gap-2.5 text-brand-300 hover:text-white text-sm transition-colors">
                <Mail className="w-4 h-4 shrink-0" /> parijat1072005@gmail.com
              </a>
              <a href="tel:+919311843699"
                className="flex items-center gap-2.5 text-brand-300 hover:text-white text-sm transition-colors">
                <Phone className="w-4 h-4 shrink-0" /> +91 9311843699
              </a>
              <div className="flex items-center gap-2.5 text-brand-300 text-sm">
                <MapPin className="w-4 h-4 shrink-0" /> New Delhi, India
              </div>
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                { icon: Facebook,  href: 'https://facebook.com',  label: 'Facebook'  },
                { icon: Twitter,   href: 'https://twitter.com',   label: 'Twitter'   },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  className="w-9 h-9 rounded-full bg-brand-800 hover:bg-brand-700 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-brand-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="font-semibold text-white text-sm uppercase tracking-widest mb-4">Shop</p>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}
                    className="text-brand-300 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="font-semibold text-white text-sm uppercase tracking-widest mb-4">Help</p>
            <ul className="space-y-2.5">
              {HELP_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}
                    className="text-brand-300 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="font-semibold text-white text-sm uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}
                    className="text-brand-300 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-brand-400 text-sm">
            © {new Date().getFullYear()} Apni Rasoi. All rights reserved.
          </p>
          <p className="text-brand-400 text-sm flex items-center gap-1">
            Made with 🌿 in India
          </p>
        </div>
      </div>
    </footer>
  );
}