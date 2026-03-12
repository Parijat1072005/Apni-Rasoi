import { Link } from 'react-router-dom';
import { Heart, Leaf, Users, Award } from 'lucide-react';

const TEAM = [
  { name: 'Sunita Devi',   role: 'Head Chef & Founder',     emoji: '👩‍🍳', bio: 'Cooking traditional recipes for over 30 years.' },
  { name: 'Ramesh Kumar',  role: 'Operations & Logistics',  emoji: '📦', bio: 'Ensures every jar reaches you fresh and on time.' },
  { name: 'Priya Sharma',  role: 'Quality Control',         emoji: '🔍', bio: 'Every batch is tasted and approved personally.' },
];

const VALUES = [
  { icon: Leaf,  title: 'All Natural',       desc: 'No preservatives, no artificial colours. Just real ingredients.' },
  { icon: Heart, title: 'Made with Love',    desc: 'Every jar is handcrafted in small batches by our kitchen team.' },
  { icon: Users, title: 'Family Recipes',    desc: 'Recipes passed down through three generations of our family.' },
  { icon: Award, title: 'Quality First',     desc: 'We reject any batch that does not meet our taste standards.' },
];

export default function AboutPage() {
  return (
    <div className="bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-950 to-brand-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🫙</div>
          <h1 className="font-display text-5xl font-bold mb-4">Our Story</h1>
          <p className="text-brand-200 text-lg leading-relaxed max-w-2xl mx-auto">
            Apni Rasoi started in a small home kitchen in Rajasthan, where our founder 
            Sunita Devi had been making pickles for family and neighbours for decades. 
            What began as gifts became a business built on one simple belief — 
            food made with love tastes better.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl text-brand-900">What We Stand For</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-brand-100 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-brand-700" />
              </div>
              <h3 className="font-semibold text-brand-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="bg-white border-y border-brand-100 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl text-brand-900 mb-4">From Kitchen to Doorstep</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We started with just three varieties — mango, lemon, and mixed vegetable achaar. 
                Today we offer over 20 varieties including seasonal specialties for every festival.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Every single jar is still made in the same way — sun-dried ingredients, 
                cold-pressed mustard oil, hand-ground spices. We have never taken a shortcut 
                and never will.
              </p>
              <p className="text-gray-600 leading-relaxed">
                When you order from Apni Rasoi, you are not just buying a pickle. 
                You are getting a piece of a tradition that has survived for generations.
              </p>
            </div>
            <div className="bg-brand-50 rounded-3xl p-8 text-center">
              <div className="text-7xl mb-4">🌿</div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[['2018', 'Founded'], ['20+', 'Varieties'], ['5000+', 'Happy Jars']].map(([num, label]) => (
                  <div key={label}>
                    <p className="font-display text-2xl font-bold text-brand-700">{num}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl text-brand-900">Meet the Team</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {TEAM.map((member) => (
            <div key={member.name} className="bg-white rounded-2xl p-6 border border-brand-100 text-center">
              <div className="text-5xl mb-3">{member.emoji}</div>
              <h3 className="font-semibold text-brand-900">{member.name}</h3>
              <p className="text-brand-600 text-sm mb-2">{member.role}</p>
              <p className="text-gray-500 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-950 text-white py-16 text-center">
        <h2 className="font-display text-3xl mb-4">Taste the Difference</h2>
        <p className="text-brand-300 mb-8">Join thousands of families who have made Apni Rasoi part of their meals.</p>
        <Link to="/products"
          className="inline-block bg-turmeric hover:bg-yellow-500 text-brand-950 font-bold px-8 py-3 rounded-xl transition-colors">
          Shop Now
        </Link>
      </section>
    </div>
  );
}