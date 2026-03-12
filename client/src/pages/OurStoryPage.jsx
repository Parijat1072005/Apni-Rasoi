import { Link } from 'react-router-dom';

const TIMELINE = [
  { year: '1985', title: 'The Recipe is Born',       desc: 'Sunita Devi\'s mother teaches her the family mango achaar recipe in a small Rajasthan village. It becomes the most requested dish at every family gathering.' },
  { year: '2005', title: 'Neighbours Start Asking',  desc: 'Word spreads. Neighbours begin requesting jars. What starts as gifting becomes a waiting list of over 40 families every season.' },
  { year: '2018', title: 'Apni Rasoi is Founded',    desc: 'With ₹50,000 and a dream, Apni Rasoi is registered. First batch of 200 jars sells out in a week through word of mouth alone.' },
  { year: '2020', title: 'Going Online',             desc: 'Launched our first website during the pandemic. Orders poured in from Indians missing home food across the country.' },
  { year: '2022', title: '20+ Varieties',            desc: 'Expanded from 3 to 20+ pickle varieties. Added seasonal collections for Holi, Diwali, and other festivals.' },
  { year: '2024', title: '5000+ Happy Jars',         desc: 'Crossed 5,000 jars delivered. Still made the same way — by hand, in small batches, with the original recipes.' },
];

export default function OurStoryPage() {
  return (
    <div className="bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🌿</div>
          <h1 className="font-display text-5xl font-bold mb-4">Our Story</h1>
          <p className="text-brand-200 text-lg leading-relaxed">
            A family recipe. A kitchen in Rajasthan. And a stubborn belief that 
            food made the old way simply tastes better.
          </p>
        </div>
      </section>

      {/* Opening */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          Apni Rasoi was never meant to be a business. It started as a mother's love 
          for her family — sun-dried mangoes, cold-pressed mustard oil, hand-ground 
          spices, and a patience that no factory can replicate.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed">
          When people started asking "where can I buy this?", the answer was simple: 
          you can't. So we decided to change that.
        </p>
      </section>

      {/* Timeline */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="font-display text-3xl text-brand-900 text-center mb-12">
          How We Got Here
        </h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-brand-200 hidden sm:block" />

          <div className="space-y-8">
            {TIMELINE.map((item, i) => (
              <div key={item.year} className="flex gap-6 items-start">
                {/* Year bubble */}
                <div className="shrink-0 w-32 text-right hidden sm:block">
                  <span className="inline-block bg-brand-700 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {item.year}
                  </span>
                </div>

                {/* Dot */}
                <div className="hidden sm:flex w-4 shrink-0 items-center justify-center mt-1.5">
                  <div className="w-3 h-3 rounded-full bg-brand-700 border-2 border-white ring-2 ring-brand-300" />
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-2xl border border-brand-100 p-5">
                  <span className="inline-block sm:hidden bg-brand-700 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">
                    {item.year}
                  </span>
                  <h3 className="font-display text-lg text-brand-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-brand-950 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl mb-6">What We Will Never Do</h2>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { emoji: '🚫', text: 'Add artificial preservatives' },
              { emoji: '🚫', text: 'Use machine-made spice blends' },
              { emoji: '🚫', text: 'Rush a batch to meet demand' },
            ].map(({ emoji, text }) => (
              <div key={text} className="bg-brand-900 rounded-2xl p-5 border border-brand-800">
                <div className="text-3xl mb-3">{emoji}</div>
                <p className="text-brand-200 text-sm">{text}</p>
              </div>
            ))}
          </div>
          <p className="text-brand-300 mb-8">
            Every jar that leaves our kitchen is one we'd be proud to put on our own table.
          </p>
          <Link to="/products"
            className="inline-block bg-turmeric hover:bg-yellow-500 text-brand-950 font-bold px-8 py-3 rounded-xl transition-colors">
            Shop Our Collection
          </Link>
        </div>
      </section>
    </div>
  );
}