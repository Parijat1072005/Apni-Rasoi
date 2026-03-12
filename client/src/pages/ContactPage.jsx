import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CONTACT_INFO = [
  { icon: Mail,    label: 'Email',    value: 'support@apnirasoi.com',    href: 'mailto:support@apnirasoi.com' },
  { icon: Phone,   label: 'Phone',    value: '+91 98765 43210',           href: 'tel:+919876543210' },
  { icon: MapPin,  label: 'Address',  value: 'Jaipur, Rajasthan, India',  href: null },
  { icon: Clock,   label: 'Hours',    value: 'Mon–Sat, 9am – 6pm IST',    href: null },
];

export default function ContactPage() {
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' });
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send — wire up to your email service when ready
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-950 to-brand-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">💬</div>
          <h1 className="font-display text-4xl font-bold mb-3">Get in Touch</h1>
          <p className="text-brand-200">We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl text-brand-900 mb-6">Contact Information</h2>
            <div className="space-y-4 mb-10">
              {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                    {href
                      ? <a href={href} className="text-brand-700 hover:text-brand-900 font-medium transition-colors">{value}</a>
                      : <p className="text-gray-700 font-medium">{value}</p>
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
              <h3 className="font-semibold text-brand-900 mb-2">🚚 Order Support</h3>
              <p className="text-sm text-gray-600">
                For order tracking, delivery issues, or returns, please email us with your 
                order number and we'll resolve it within one business day.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-brand-100 p-6">
            {sent ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-display text-xl text-brand-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 text-sm">We'll get back to you within 24 hours.</p>
                <Button onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }); }}
                  className="mt-6 bg-brand-700 hover:bg-brand-800 text-white">
                  Send Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-display text-xl text-brand-900 mb-2">Send a Message</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Your Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Priya Sharma" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="priya@email.com" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Question about my order" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Message</Label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5} required
                    placeholder="Tell us how we can help..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full bg-brand-700 hover:bg-brand-800 text-white gap-2">
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}