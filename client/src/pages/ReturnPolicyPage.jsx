export default function ReturnPolicyPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">↩️</div>
          <h1 className="font-display text-4xl text-brand-900">Return Policy</h1>
          <p className="text-gray-500 mt-2 text-sm">Last updated: January 2025</p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-100 p-8 space-y-8">
          {[
            {
              title: '7-Day Return Window',
              body: 'We accept returns within 7 days of delivery. To be eligible, the product must be unused and in its original sealed condition. Opened jars cannot be returned for hygiene and food safety reasons, unless the product is defective.',
            },
            {
              title: 'Eligible Return Reasons',
              items: [
                'Product received is damaged or broken',
                'Wrong product delivered',
                'Product is expired or has quality issues',
                'Jar is unsealed or tampered upon delivery',
              ],
            },
            {
              title: 'Non-Returnable Items',
              items: [
                'Opened or partially consumed products',
                'Products without original packaging',
                'Items purchased during clearance sales',
                'Gift cards and vouchers',
              ],
            },
            {
              title: 'How to Initiate a Return',
              body: 'Email us at support@apnirasoi.com with your order number, reason for return, and clear photos of the product and packaging. Our team will respond within 24 hours with return instructions.',
            },
            {
              title: 'Refund Process',
              body: 'Once we receive and inspect the returned item, refunds are processed within 5–7 business days to your original payment method. For COD orders, refunds are made via bank transfer. You will be notified by email once the refund is initiated.',
            },
          ].map(({ title, body, items }) => (
            <section key={title}>
              <h2 className="font-display text-xl text-brand-900 mb-3">{title}</h2>
              {body && <p className="text-gray-600 leading-relaxed">{body}</p>}
              {items && (
                <ul className="space-y-2 mt-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
                      <span className="text-brand-600 mt-0.5">✓</span> {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}