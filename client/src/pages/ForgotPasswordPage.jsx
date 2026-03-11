import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSubmitted(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm border border-brand-100 p-8 lg:p-10 text-center">
          <div className="text-4xl mb-4">{submitted ? '📬' : '🔑'}</div>
          <h1 className="font-display text-2xl text-brand-900 mb-2">
            {submitted ? 'Check your inbox' : 'Forgot password?'}
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            {submitted
              ? `We sent a reset link to ${email}. Check your inbox (and spam folder).`
              : "No worries — enter your email and we'll send you a reset link."}
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Email Address</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="border-brand-200 focus:border-brand-500 h-11" />
              </div>
              <Button type="submit" disabled={loading}
                className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold h-11">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <Button onClick={() => setSubmitted(false)} variant="outline"
              className="border-brand-200 text-brand-700">
              Try a different email
            </Button>
          )}

          <Link to="/login" className="block mt-6 text-sm text-brand-600 hover:text-brand-800 transition-colors">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}