import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductGrid from '../components/product/ProductGrid.jsx';
import { productService } from '../services/productService.js';
import { categoryService } from '../services/categoryService.js';

const FEATURES = [
  { icon: Truck,      title: 'Free Shipping',  desc: 'On orders above ₹499' },
  { icon: Shield,     title: '100% Authentic', desc: 'Traditional recipes only' },
  { icon: RefreshCw,  title: 'Easy Returns',   desc: '7-day return policy' },
  { icon: Headphones, title: '24/7 Support',   desc: 'Always here for you' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma',   city: 'Delhi',  rating: 5, text: 'The mango pickle tastes exactly like my nani used to make. Absolutely authentic!' },
  { name: 'Rohit Mehta',    city: 'Mumbai', rating: 5, text: 'Ordered the Holi Gujiya box — my family finished it in one day. Will order again!' },
  { name: 'Sunita Agarwal', city: 'Jaipur', rating: 5, text: 'Best quality pickles I have had outside my own home kitchen. Highly recommend.' },
];

// Fallback boxes shown while categories are loading or if fewer than 4 exist
const FALLBACK_BOXES = [
  { emoji: '🫙', label: 'Mango Pickle',   bg: 'from-yellow-900 to-yellow-700', filter: 'isFeatured=true' },
  { emoji: '🌶️', label: 'Mixed Achaar',   bg: 'from-red-900   to-red-700',    filter: 'isBestseller=true' },
  { emoji: '🍋', label: 'Lemon Pickle',   bg: 'from-lime-900  to-lime-700',   filter: 'isNewArrival=true' },
  { emoji: '🎊', label: 'Seasonal Items', bg: 'from-purple-900 to-purple-700', filter: 'isSeasonal=true' },
];

const BOX_GRADIENTS = [
  'from-yellow-900 to-yellow-700',
  'from-red-900   to-red-700',
  'from-lime-900  to-lime-700',
  'from-purple-900 to-purple-700',
];

export default function HomePage() {
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn:  () => productService.getAll({ isFeatured: true, limit: 8 }),
    select:   (d) => d.data.data,
  });

  const { data: bestsellerData, isLoading: bestsellerLoading } = useQuery({
    queryKey: ['products', 'bestsellers'],
    queryFn:  () => productService.getAll({ isBestseller: true, limit: 4 }),
    select:   (d) => d.data.data,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoryService.getAll(),
    select:   (d) => d.data.data.categories || [],
    staleTime: 1000 * 60 * 10,
  });

  const { data: seasonalData } = useQuery({
    queryKey: ['categories', 'seasonal'],
    queryFn:  () => categoryService.getSeasonal(),
    select:   (d) => d.data.data.categories || [],
  });

  // Pick first 4 non-seasonal categories for hero boxes
  const heroCategories = (categoriesData || [])
    .filter((c) => !c.isSeasonal)
    .slice(0, 4);

  // If we have fewer than 4 real categories, pad with fallbacks
  const heroBoxes = heroCategories.length >= 4
    ? heroCategories.map((cat, i) => ({
        type:     'category',
        id:       cat._id,
        emoji:    cat.image?.url ? null : '🫙',
        imageUrl: cat.image?.url || null,
        label:    cat.name,
        bg:       BOX_GRADIENTS[i],
        to:       `/products?category=${cat._id}`,
      }))
    : FALLBACK_BOXES.map((fb, i) => ({
        type:  'filter',
        emoji: fb.emoji,
        label: fb.label,
        bg:    fb.bg,
        to:    `/products?${fb.filter}`,
      }));

  return (
    <div className="bg-cream">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-700/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-turmeric/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <Badge className="bg-turmeric/20 text-turmeric border-turmeric/30 mb-6 text-sm">
                🫙 Handcrafted with Love
              </Badge>
              <h1 className="font-display text-5xl lg:text-7xl font-bold leading-tight mb-6">
                Taste of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-turmeric to-brand-300">
                  Ghar Ka Khana
                </span>
              </h1>
              <p className="text-brand-200 text-lg leading-relaxed mb-8 max-w-lg">
                Authentic handmade pickles, traditional achaar, and seasonal Indian delicacies —
                crafted from recipes passed down through generations.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-turmeric hover:bg-yellow-500 text-brand-950 font-bold px-8">
                  <Link to="/products">Shop Now <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-brand-400 text-black hover:bg-white/10 px-8">
                  <Link to="/products?isSeasonal=true">Seasonal Specials</Link>
                </Button>
              </div>
              <div className="flex items-center gap-8 mt-10">
                {[['500+', 'Happy Customers'], ['50+', 'Recipes'], ['100%', 'Natural']].map(([num, label]) => (
                  <div key={label}>
                    <p className="font-display text-2xl font-bold text-turmeric">{num}</p>
                    <p className="text-brand-300 text-sm">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — 4 category boxes (real links) */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {heroBoxes.map((box, i) => (
                <Link
                  key={box.to + i}
                  to={box.to}
                  className={`bg-gradient-to-br ${box.bg} rounded-2xl p-6 flex flex-col items-center justify-center gap-3 aspect-square shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 cursor-pointer`}>
                  {box.imageUrl ? (
                    <img
                      src={box.imageUrl}
                      alt={box.label}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-5xl">{box.emoji}</span>
                  )}
                  <p className="text-white font-medium text-center text-sm leading-snug">{box.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Features Bar ──────────────────────────────────────────────── */}
      <section className="bg-white border-y border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-700" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────────────── */}
      {categoriesData?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-brand-600 font-medium text-sm uppercase tracking-widest mb-2">Browse</p>
              <h2 className="font-display text-3xl lg:text-4xl text-brand-900">Our Categories</h2>
            </div>
            <Link to="/products" className="text-brand-700 hover:text-brand-900 text-sm font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoriesData.slice(0, 6).map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-brand-100 hover:border-brand-300 hover:shadow-md transition-all duration-200">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 overflow-hidden flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  {cat.image?.url
                    ? <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" />
                    : <span className="text-3xl">🫙</span>
                  }
                </div>
                <p className="text-sm font-medium text-gray-700 text-center leading-tight group-hover:text-brand-700 transition-colors">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Seasonal Banner ────────────────────────────────────────────────── */}
      {seasonalData?.length > 0 && (
        <section className="mx-4 sm:mx-6 lg:mx-8 xl:mx-auto max-w-7xl mb-16">
          <div className="bg-gradient-to-r from-purple-700 via-pink-700 to-orange-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-3">🎊 Limited Time</Badge>
                <h2 className="font-display text-3xl lg:text-4xl font-bold mb-3">
                  {seasonalData[0].name} is here!
                </h2>
                <p className="text-white/80 max-w-md">
                  {seasonalData[0].description || 'Celebrate with our authentic seasonal delicacies, crafted fresh for the occasion.'}
                </p>
              </div>
              <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-white/90 font-bold shrink-0 px-8">
                <Link to={`/products?category=${seasonalData[0]._id}`}>Shop Now</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-600 font-medium text-sm uppercase tracking-widest mb-2">Handpicked</p>
            <h2 className="font-display text-3xl lg:text-4xl text-brand-900">Featured Products</h2>
          </div>
          <Link to="/products?isFeatured=true" className="text-brand-700 hover:text-brand-900 text-sm font-medium flex items-center gap-1">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid products={featuredData} isLoading={featuredLoading} cols={4} />
      </section>

      {/* ── Bestsellers ────────────────────────────────────────────────────── */}
      <section className="bg-brand-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-turmeric font-medium text-sm uppercase tracking-widest mb-2">Most Loved</p>
              <h2 className="font-display text-3xl lg:text-4xl text-white">Bestsellers</h2>
            </div>
            <Link to="/products?isBestseller=true" className="text-brand-300 hover:text-white text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={bestsellerData} isLoading={bestsellerLoading} cols={4} />
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-brand-600 font-medium text-sm uppercase tracking-widest mb-2">What Customers Say</p>
          <h2 className="font-display text-3xl lg:text-4xl text-brand-900">Loved Across India</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm">
              <div className="flex text-turmeric mb-4 text-lg">{'★'.repeat(t.rating)}</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center font-display font-bold text-brand-700">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-50 border-t border-brand-100 py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="font-display text-3xl text-brand-900 mb-3">Stay in the Loop</h2>
          <p className="text-gray-500 mb-6 text-sm">Get notified about seasonal arrivals, new pickles, and exclusive deals.</p>
          <form className="flex gap-3 max-w-sm mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 rounded-lg border border-brand-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button type="submit" className="bg-brand-700 hover:bg-brand-800 text-white shrink-0">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

    </div>
  );
}