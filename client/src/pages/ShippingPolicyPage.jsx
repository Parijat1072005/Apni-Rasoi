export default function ShippingPolicyPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🚚</div>
          <h1 className="font-display text-4xl text-brand-900">Shipping Policy</h1>
          <p className="text-gray-500 mt-2 text-sm">Last updated: January 2025</p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-100 p-8 space-y-8 prose prose-sm max-w-none">

          <section>
            <h2 className="font-display text-xl text-brand-900 mb-3">Delivery Timeframes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-brand-50">
                    <th className="text-left px-4 py-2 border border-brand-100 text-brand-800">Zone</th>
                    <th className="text-left px-4 py-2 border border-brand-100 text-brand-800">Estimated Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Metro Cities (Delhi, Mumbai, Bangalore…)', '2–3 business days'],
                    ['Tier 2 & 3 Cities',                        '3–5 business days'],
                    ['Remote / Rural Areas',                      '5–7 business days'],
                  ].map(([zone, time]) => (
                    <tr key={zone} className="border-b border-brand-50">
                      <td className="px-4 py-2 border border-brand-100 text-gray-700">{zone}</td>
                      <td className="px-4 py-2 border border-brand-100 text-gray-700">{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {[
            {
              title: 'Shipping Charges',
              body: 'We offer free shipping on all orders above ₹499. Orders below ₹499 are charged a flat shipping fee of ₹49. During sale events or with valid promo codes, free shipping may be available at a lower threshold.',
            },
            {
              title: 'Order Processing',
              body: 'Orders are processed within 1–2 business days of payment confirmation. You will receive an email with your tracking number once your order is dispatched. Orders placed on weekends or public holidays are processed the next business day.',
            },
            {
              title: 'Packaging',
              body: 'All our pickles are packed in airtight, food-grade glass jars. Each jar is bubble-wrapped and packed in a sturdy corrugated box to prevent breakage during transit. We take extra care with seasonal hampers and gifting orders.',
            },
            {
              title: 'Tracking Your Order',
              body: 'Once your order is shipped, you\'ll receive a tracking link via email and SMS. You can also track your order from the "My Orders" section in your account.',
            },
            {
              title: 'Delivery Issues',
              body: 'If your order is delayed beyond the estimated delivery window, please contact us at support@apnirasoi.com with your order number. We will investigate and resolve the issue within 2 business days.',
            },
          ].map(({ title, body }) => (
            <section key={title}>
              <h2 className="font-display text-xl text-brand-900 mb-3">{title}</h2>
              <p className="text-gray-600 leading-relaxed">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}