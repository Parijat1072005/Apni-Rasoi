import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useAuthStore from '../store/authStore.js';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(60),
  email:    z.string().email('Valid email required'),
  phone:    z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase and number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const register_  = useAuthStore((s) => s.register);
  const isLoading  = useAuthStore((s) => s.isLoading);
  const navigate   = useNavigate();

  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ name, email, phone, password }) => {
    const result = await register_({ name, email, phone: phone || undefined, password });
    if (result.success) navigate('/');
    else setError('root', { message: result.message });
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm border border-brand-100 p-8 lg:p-10">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center">
                <span className="text-white text-xl">🌿</span>
              </div>
              <span className="font-display text-2xl font-bold text-brand-800">Apni Rasoi</span>
            </Link>
            <h1 className="font-display text-2xl text-brand-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Join the Apni Rasoi family</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {errors.root.message}
              </div>
            )}

            {[
              { id: 'name',  label: 'Full Name',     type: 'text',  placeholder: 'Priya Sharma' },
              { id: 'email', label: 'Email Address', type: 'email', placeholder: 'priya@example.com' },
              { id: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '9876543210' },
            ].map(({ id, label, type, placeholder }) => (
              <div key={id} className="space-y-1.5">
                <Label htmlFor={id} className="text-gray-700 font-medium">{label}</Label>
                <Input id={id} type={type} placeholder={placeholder}
                  className="border-brand-200 focus:border-brand-500 h-11"
                  {...register(id)} />
                {errors[id] && <p className="text-red-500 text-xs">{errors[id].message}</p>}
              </div>
            ))}

            {['password', 'confirmPassword'].map((id) => (
              <div key={id} className="space-y-1.5">
                <Label htmlFor={id} className="text-gray-700 font-medium">
                  {id === 'password' ? 'Password' : 'Confirm Password'}
                </Label>
                <div className="relative">
                  <Input id={id} type={showPassword ? 'text' : 'password'}
                    placeholder={id === 'password' ? 'Min 8 chars, upper, lower, number' : 'Repeat password'}
                    className="border-brand-200 focus:border-brand-500 h-11 pr-10"
                    {...register(id)} />
                  {id === 'password' && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {errors[id] && <p className="text-red-500 text-xs">{errors[id].message}</p>}
              </div>
            ))}

            <Button type="submit" disabled={isLoading}
              className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold h-11 text-base mt-2">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-700 font-semibold hover:text-brand-900 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}