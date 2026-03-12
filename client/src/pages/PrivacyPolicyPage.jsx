export default function PrivacyPolicyPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-display text-4xl text-brand-900">Privacy Policy</h1>
          <p className="text-gray-500 mt-2 text-sm">Last updated: January 2025</p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-100 p-8 space-y-8">
          {[
            {
              title: 'Information We Collect',
              body: 'We collect information you provide directly — name, email address, delivery address, and phone number when you register or place an order. We also collect payment information, though we do not store full card details (processed securely via Razorpay).',
            },
            {
              title: 'How We Use Your Information',
              items: [
                'Process and deliver your orders',
                'Send order confirmation and shipping updates',
                'Respond to customer support queries',
                'Send promotional emails (you can unsubscribe anytime)',
                'Improve our products and services',
              ],
            },
            {
              title: 'Data Sharing',
              body: 'We do not sell, trade, or rent your personal information to third parties. We share data only with trusted service providers required to operate our business — delivery partners, payment processors, and email service providers — under strict confidentiality agreements.',
            },
            {
              title: 'Cookies',
              body: 'We use cookies to keep you logged in and remember your cart. We do not use third-party tracking cookies. You can disable cookies in your browser settings, though this may affect your shopping experience.',
            },
            {
              title: 'Data Security',
              body: 'We use industry-standard SSL encryption for all data transmission. Passwords are hashed using bcrypt and never stored in plain text. Access to customer data is restricted to authorised personnel only.',
            },
            {
              title: 'Your Rights',
              body: 'You may request access to, correction of, or deletion of your personal data at any time by emailing support@apnirasoi.com. We will respond within 7 business days.',
            },
            {
              title: 'Contact',
              body: 'For any privacy-related questions, contact our data officer at privacy@apnirasoi.com.',
            },
          ].map(({ title, body, items }) => (
            <section key={title}>
              <h2 className="font-display text-xl text-brand-900 mb-3">{title}</h2>
              {body  && <p className="text-gray-600 leading-relaxed">{body}</p>}
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