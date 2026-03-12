export default function TermsPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="font-display text-4xl text-brand-900">Terms & Conditions</h1>
          <p className="text-gray-500 mt-2 text-sm">Last updated: January 2025</p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-100 p-8 space-y-8">
          {[
            {
              title: '1. Acceptance of Terms',
              body: 'By accessing and using Apni Rasoi, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our website or services.',
            },
            {
              title: '2. Products & Pricing',
              body: 'All product prices are listed in Indian Rupees (₹) inclusive of applicable taxes. We reserve the right to change prices at any time without prior notice. Prices at the time of your order confirmation are final.',
            },
            {
              title: '3. Orders & Payment',
              body: 'An order is confirmed only after payment is successfully processed. We accept UPI, credit/debit cards, net banking, and Cash on Delivery (COD). COD is available for orders up to ₹5,000.',
            },
            {
              title: '4. Cancellations',
              body: 'Orders can be cancelled within 2 hours of placement. Once the order is dispatched, cancellations are not accepted. To cancel, contact support@apnirasoi.com with your order number.',
            },
            {
              title: '5. Intellectual Property',
              body: 'All content on this website — including text, images, recipes, and branding — is the intellectual property of Apni Rasoi. Reproduction without written permission is prohibited.',
            },
            {
              title: '6. Limitation of Liability',
              body: 'Apni Rasoi shall not be liable for any indirect or consequential damages arising from the use of our products or services. Our maximum liability is limited to the value of the order in question.',
            },
            {
              title: '7. Governing Law',
              body: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Jaipur, Rajasthan.',
            },
            {
              title: '8. Changes to Terms',
              body: 'We reserve the right to update these Terms at any time. Continued use of the site after changes constitutes acceptance of the new Terms.',
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