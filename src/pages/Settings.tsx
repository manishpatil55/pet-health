import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User, Lock, Bell, Palette, Database, AlertTriangle,
  Eye, EyeOff, LogOut, Trash2, Moon, Sun,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';
import { queryClient } from '@/App';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Must contain a letter')
      .regex(/\d/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const Settings = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [passwordModal, setPasswordModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onChangePassword = async (data: PasswordFormData) => {
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordModal(false);
      reset();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await authService.deleteAccount();
      toast.success('Account deleted');
      clearAuth();
      navigate(ROUTES.LANDING);
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.clear();
      clearAuth();
      toast.success('Logged out');
      navigate(ROUTES.LOGIN);
    } catch {
      toast.error('Logout failed');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await authService.logoutAll();
      queryClient.clear();
      clearAuth();
      toast.success('All sessions logged out');
      navigate(ROUTES.LOGIN);
    } catch {
      toast.error('Failed to logout all sessions');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-[#2F3A3A]">Settings</h1>

      {/* Account */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-[#4FB6B2]" />
          <h2 className="text-base font-semibold text-[#2F3A3A]">Account</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#2F3A3A]">Name</p>
              <p className="text-sm text-[#7A8A8A]">{user?.name ?? '—'}</p>
            </div>
          </div>
          <div className="border-t border-[#E6EEEE]" />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#2F3A3A]">Email</p>
              <p className="text-sm text-[#7A8A8A]">{user?.email ?? '—'}</p>
            </div>
          </div>
          <div className="border-t border-[#E6EEEE]" />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#2F3A3A]">Password</p>
              <p className="text-xs text-[#7A8A8A]">Change your account password</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setPasswordModal(true)}>
              <Lock className="h-3.5 w-3.5" /> Change
            </Button>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-[#4FB6B2]" />
          <h2 className="text-base font-semibold text-[#2F3A3A]">Preferences</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#2F3A3A]">Weight Unit</p>
              <p className="text-xs text-[#7A8A8A]">Default unit for weight tracking</p>
            </div>
            <div className="flex gap-1">
              {(['kg', 'lbs'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setWeightUnit(u)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    weightUnit === u ? 'bg-[#4FB6B2] text-white' : 'bg-[#F7FAFA] text-[#7A8A8A]'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-[#4FB6B2]" />
          <h2 className="text-base font-semibold text-[#2F3A3A]">Appearance</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-[#2F3A3A]">Dark Mode</p>
            <p className="text-xs text-[#7A8A8A]">Switch between light and dark themes</p>
          </div>
          <button
            onClick={() => {
              setDarkMode(!darkMode);
              toast.success(darkMode ? 'Light mode enabled' : 'Dark mode coming soon!');
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-[#4FB6B2]' : 'bg-[#E6EEEE]'
            }`}
          >
            <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform flex items-center justify-center ${
              darkMode ? 'translate-x-6' : 'translate-x-0.5'
            }`}>
              {darkMode ? <Moon className="h-3 w-3 text-[#4FB6B2]" /> : <Sun className="h-3 w-3 text-[#7A8A8A]" />}
            </div>
          </button>
        </div>
      </Card>

      {/* Data */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-[#4FB6B2]" />
          <h2 className="text-base font-semibold text-[#2F3A3A]">Data</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#2F3A3A]">Export as PDF</p>
              <p className="text-xs text-[#7A8A8A]">Download all your pet's data</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => toast.success('Export feature coming soon!')}>
              Export
            </Button>
          </div>
          <div className="border-t border-[#E6EEEE]" />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#2F3A3A]">Sessions</p>
              <p className="text-xs text-[#7A8A8A]">Log out of all sessions</p>
            </div>
            <Button variant="secondary" size="sm" className="gap-1" onClick={handleLogoutAll}>
              <LogOut className="h-3.5 w-3.5" /> Logout All
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="!border !border-[#E76F51]/30">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-[#E76F51]" />
          <h2 className="text-base font-semibold text-[#E76F51]">Danger Zone</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-[#2F3A3A]">Delete Account</p>
            <p className="text-xs text-[#7A8A8A]">Permanently delete your account and all data</p>
          </div>
          <Button variant="danger" size="sm" className="gap-1" onClick={() => setDeleteConfirm(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </Card>

      {/* Logout */}
      <Button variant="secondary" fullWidth className="gap-2" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Log out
      </Button>

      {/* Change Password Modal */}
      <Modal open={passwordModal} onClose={() => { setPasswordModal(false); reset(); }} title="Change Password">
        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-[#7A8A8A]">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Input label="New Password" type={showPassword ? 'text' : 'password'} error={errors.newPassword?.message} {...register('newPassword')} />
          <Input label="Confirm New Password" type={showPassword ? 'text' : 'password'} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Button type="submit" fullWidth isLoading={isSubmitting}>Change Password</Button>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        message="This will permanently delete your account, all pets, and all health records. This cannot be undone."
        confirmLabel="Delete My Account"
        variant="danger"
        isLoading={deleteLoading}
      />
    </motion.div>
  );
};

export default Settings;
