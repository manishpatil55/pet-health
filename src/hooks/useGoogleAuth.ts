import { useCallback } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const provider = new GoogleAuthProvider();

export const useGoogleAuth = () => {
  const { setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Send ONLY the idToken — backend extracts name/email/picture itself
      const data = await authService.googleLogin({ idToken });

      setAuth(data.accessToken, data.user);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Please allow popups for this site.');
        return;
      }
      toast.error('Google sign-in failed. Please try again.');
    }
  }, [setAuth, navigate]);

  const googleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      navigate('/signin');
    }
  }, [clearAuth, navigate]);

  return { signInWithGoogle, googleSignOut };
};
