import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useAuthStore from '../store/authStore.js';

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const login      = useAuthStore((s) => s.login);
  const isLoading  = useAuthStore((s) => s.isLoading);
  const navigate   = useNavigate();
  const { register, handleSubmit, setError, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) navigate('/');
    else setError('root', { message: result.message });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 to-brand-800 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Apni Rasoi</h1>
          <p className="text-brand-300 text-sm mt-1">Admin Dashboard</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-brand-600" />
            <p className="font-semibold text-gray-800">Admin Sign In</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {errors.root.message}
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-medium">Email</Label>
              <Input type="email" placeholder="admin@apnirasoi.com"
                className="border-gray-200 h-11" {...register('email', { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} placeholder="Password"
                  className="border-gray-200 h-11 pr-10" {...register('password', { required: true })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={isLoading}
              className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold h-11 mt-2">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}