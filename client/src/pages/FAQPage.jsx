import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    category: 'Orders & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Metro cities: 2–3 days. Tier 2/3 cities: 3–5 days. Remote areas: 5–7 days.' },
      { q: 'Do you offer free shipping?', a: 'Yes! Free shipping on all orders above ₹499. Below that, a flat ₹49 shipping fee applies.' },
      { q: 'Can I track my order?', a: 'Yes. Once dispatched, you\'ll receive a tracking link via email and SMS. You can also track from "My Orders" in your account.' },
      { q: 'What if my jar arrives broken?', a: 'Email us at support@apnirasoi.com with a photo within 24 hours of delivery and we\'ll send a replacement immediately.' },
    ],
  },
  {
    category: 'Products',
    items: [
      { q: 'Are your pickles preservative-free?', a: 'Yes. We use only natural preservatives — salt, oil, and spices. No artificial additives or chemical preservatives ever.' },
      { q: 'What is the shelf life of your pickles?', a: 'Unopened jars last 12 months from the manufacturing date. Once opened, consume within 3 months and refrigerate after opening.' },
      { q: 'Do you have options for people with nut allergies?', a: 'Most of our pickles are nut-free, but some seasonal products may contain sesame or mustard. Check the ingredient list on each product page.' },
      { q: 'Are your products suitable for vegans?', a: 'Yes, all our pickles are 100% vegan — no animal products of any kind.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'We accept returns within 7 days for sealed, unopened products. Opened jars cannot be returned for food safety reasons unless defective.' },
      { q: 'How long do refunds take?', a: 'Refunds are processed within 5–7 business days to your original payment method after we receive and inspect the return.' },
      { q: 'Can I cancel my order?', a: 'Yes, within 2 hours of placing the order. Once dispatched, cancellation is not possible. Email us at support@apnirasoi.com.' },
    ],
  },
  {
    category: 'Account & Payments',
    items: [
      { q: 'Do I need an account to order?', a: 'You need an account to place an order so we can track your orders and send delivery updates.' },
      { q: 'What payment methods do you accept?', a: 'UPI, credit/debit cards, net banking, and Cash on Delivery (COD up to ₹5,000).' },
      { q: 'Is it safe to pay on your site?', a: 'Absolutely. All payments are processed via Razorpay with 256-bit SSL encryption. We never store your card details.' },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-brand-50 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group">
        <span className={cn(
          'text-sm font-medium transition-colors',
          open ? 'text-brand-700' : 'text-gray-800 group-hover:text-brand-700'
        )}>
          {q}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200',
          open && 'rotate-180 text-brand-600'
        )} />
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="bg-cream min-h-screen">
      <section className="bg-gradient-to-br from-brand-950 to-brand-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">❓</div>
          <h1 className="font-display text-4xl font-bold mb-3">Frequently Asked Questions</h1>
          <p className="text-brand-200">Everything you need to know about Apni Rasoi.</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        {FAQS.map((section) => (
          <div key={section.category} className="bg-white rounded-2xl border border-brand-100 px-6 py-2">
            <h2 className="font-display text-lg text-brand-900 py-4 border-b border-brand-50">
              {section.category}
            </h2>
            {section.items.map((item) => (
              <FAQItem key={item.q} {...item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}