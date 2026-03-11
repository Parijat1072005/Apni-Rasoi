import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, MapPin, Lock, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useAuthStore from '../store/authStore.js';
import { userService } from '../services/userService.js';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const user      = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  });

  const onUpdateProfile = async (data) => {
    setSaving(true);
    try {
      const res = await userService.updateProfile(data);
      updateUser(res.data.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) { toast.error('Passwords do not match'); return; }
    try {
      await authService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl text-brand-900 mb-8">My Account</h1>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-brand-100 p-6 mb-6 flex items-center gap-5">
        <div className="relative">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user?.avatar?.url} />
            <AvatarFallback className="bg-brand-100 text-brand-700 font-display text-3xl">
              {user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <p className="font-display text-xl text-brand-900">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <p className="text-xs text-brand-600 mt-1 capitalize">{user?.role}</p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-brand-50 border border-brand-100 mb-6">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white gap-1.5">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white gap-1.5">
            <Lock className="w-4 h-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={handleSubmit(onUpdateProfile)}
            className="bg-white rounded-2xl border border-brand-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Personal Information</h2>
            {[
              { id: 'name',  label: 'Full Name',    type: 'text' },
              { id: 'phone', label: 'Phone Number', type: 'tel' },
            ].map(({ id, label, type }) => (
              <div key={id} className="space-y-1.5">
                <Label className="text-gray-700 font-medium">{label}</Label>
                <Input type={type} className="border-brand-200 h-10" {...register(id)} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-medium">Email Address</Label>
              <Input value={user?.email} disabled className="border-brand-100 bg-gray-50 h-10" />
              <p className="text-xs text-gray-400">Email cannot be changed</p>
            </div>
            <Button type="submit" disabled={saving} className="bg-brand-700 hover:bg-brand-800 text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={handleSubmit(onChangePassword)}
            className="bg-white rounded-2xl border border-brand-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Change Password</h2>
            {[
              { id: 'currentPassword', label: 'Current Password' },
              { id: 'newPassword',     label: 'New Password' },
              { id: 'confirmPassword', label: 'Confirm New Password' },
            ].map(({ id, label }) => (
              <div key={id} className="space-y-1.5">
                <Label className="text-gray-700 font-medium">{label}</Label>
                <Input type="password" className="border-brand-200 h-10" {...register(id)} />
              </div>
            ))}
            <Button type="submit" className="bg-brand-700 hover:bg-brand-800 text-white">
              Update Password
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}