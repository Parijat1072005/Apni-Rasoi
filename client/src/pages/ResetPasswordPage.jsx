import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token }   = useParams();
  const navigate    = useNavigate();
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(token, { password });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — link may have expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm border border-brand-100 p-8 lg:p-10">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="font-display text-2xl text-brand-900">Set new password</h1>
            <p className="text-gray-500 text-sm mt-1">Make it strong and memorable</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'New Password',     value: password, set: setPassword },
              { label: 'Confirm Password', value: confirm,  set: setConfirm },
            ].map(({ label, value, set }, i) => (
              <div key={label} className="space-y-1.5">
                <Label className="text-gray-700 font-medium">{label}</Label>
                <div className="relative">
                  <Input type={showPw ? 'text' : 'password'} value={value}
                    onChange={(e) => set(e.target.value)} placeholder="Min 8 characters"
                    className="border-brand-200 h-11 pr-10" />
                  {i === 0 && (
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <Button type="submit" disabled={loading}
              className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold h-11">
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
          <Link to="/login" className="block text-center mt-6 text-sm text-brand-600 hover:text-brand-800">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}