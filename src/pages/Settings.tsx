/**
 * Settings.tsx — Clinical Sanctuary Edition
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User, Lock, Bell, Palette, Database, AlertTriangle,
  Eye, EyeOff, LogOut, Trash2, Moon, Sun, Shield, Download,
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

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

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

  // Section header helper
  const SectionHeader = ({ icon: Icon, label, color = '#4fb6b2' }: { icon: React.ElementType; label: string; color?: string }) => (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15` }}
      >
        <Icon className="h-4.5 w-4.5" style={{ color }} />
      </div>
      <h2
        className="text-sm font-bold"
        style={{ color: '#131d1e', fontFamily: 'Manrope, sans-serif' }}
      >
        {label}
      </h2>
    </div>
  );

  const Divider = () => <div className="h-px" style={{ background: 'rgba(189,201,199,.12)' }} />;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <h1
          className="font-black tracking-tight"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: '#131d1e',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
          }}
        >
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6d7978' }}>Manage your account & preferences</p>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-2xl"
      >
        {/* ── Account ── */}
        <motion.div variants={fadeUp}>
          <Card>
            <SectionHeader icon={User} label="Account" />
            <div className="space-y-0">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: '#131d1e' }}>Name</p>
                  <p className="text-xs" style={{ color: '#6d7978' }}>{user?.name ?? '—'}</p>
                </div>
              </div>
              <Divider />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: '#131d1e' }}>Email</p>
                  <p className="text-xs" style={{ color: '#6d7978' }}>{user?.email ?? '—'}</p>
                </div>
              </div>
              <Divider />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: '#131d1e' }}>Password</p>
                  <p className="text-xs" style={{ color: '#bdc9c7' }}>Change your account password</p>
                </div>
                <Button variant="secondary" size="sm" pill onClick={() => setPasswordModal(true)}>
                  <Lock className="h-3.5 w-3.5 mr-1.5" /> Change
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Preferences ── */}
        <motion.div variants={fadeUp}>
          <Card>
            <SectionHeader icon={Bell} label="Preferences" color="#006e29" />
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-bold" style={{ color: '#131d1e' }}>Weight Unit</p>
                <p className="text-xs" style={{ color: '#bdc9c7' }}>Default unit for weight tracking</p>
              </div>
              <div className="flex gap-1 p-1 rounded-full" style={{ background: '#eaf6f5' }}>
                {(['kg', 'lbs'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setWeightUnit(u)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200"
                    style={{
                      background: weightUnit === u ? 'linear-gradient(135deg, #006a67, #4fb6b2)' : 'transparent',
                      color: weightUnit === u ? '#ffffff' : '#6d7978',
                      boxShadow: weightUnit === u ? '0 2px 8px rgba(0,106,103,.25)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Appearance ── */}
        <motion.div variants={fadeUp}>
          <Card>
            <SectionHeader icon={Palette} label="Appearance" color="#d69c2c" />
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-bold" style={{ color: '#131d1e' }}>Dark Mode</p>
                <p className="text-xs" style={{ color: '#bdc9c7' }}>Switch between light and dark themes</p>
              </div>
              <button
                onClick={() => {
                  setDarkMode(!darkMode);
                  toast.success(darkMode ? 'Light mode enabled' : 'Dark mode coming soon!');
                }}
                className="relative w-14 h-7 rounded-full transition-all duration-300"
                style={{
                  background: darkMode
                    ? 'linear-gradient(135deg, #006a67, #4fb6b2)'
                    : '#d9e5e4',
                  boxShadow: darkMode ? '0 2px 8px rgba(0,106,103,.25)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <div
                  className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300"
                  style={{ transform: darkMode ? 'translateX(30px)' : 'translateX(2px)' }}
                >
                  {darkMode ? <Moon className="h-3 w-3 text-[#006a67]" /> : <Sun className="h-3 w-3 text-[#bdc9c7]" />}
                </div>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* ── Data ── */}
        <motion.div variants={fadeUp}>
          <Card>
            <SectionHeader icon={Database} label="Data & Sessions" color="#006a67" />
            <div className="space-y-0">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: '#131d1e' }}>Export as PDF</p>
                  <p className="text-xs" style={{ color: '#bdc9c7' }}>Download all your pet's data</p>
                </div>
                <Button variant="secondary" size="sm" pill onClick={() => toast.success('Export feature coming soon!')}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Export
                </Button>
              </div>
              <Divider />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: '#131d1e' }}>Sessions</p>
                  <p className="text-xs" style={{ color: '#bdc9c7' }}>Log out of all other sessions</p>
                </div>
                <Button variant="secondary" size="sm" pill className="gap-1" onClick={handleLogoutAll}>
                  <Shield className="h-3.5 w-3.5" /> Logout All
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Danger Zone ── */}
        <motion.div variants={fadeUp}>
          <Card
            style={{
              border: '1.5px solid rgba(186,26,26,.15)',
              background: 'rgba(186,26,26,.02)',
            }}
          >
            <SectionHeader icon={AlertTriangle} label="Danger Zone" color="#ba1a1a" />
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-bold" style={{ color: '#131d1e' }}>Delete Account</p>
                <p className="text-xs" style={{ color: '#bdc9c7' }}>Permanently delete your account and all data</p>
              </div>
              <Button variant="danger" size="sm" pill className="gap-1" onClick={() => setDeleteConfirm(true)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* ── Logout ── */}
        <motion.div variants={fadeUp}>
          <Button variant="secondary" fullWidth className="gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </motion.div>
      </motion.div>

      {/* ── Modals ── */}
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
    </div>
  );
};

export default Settings;
