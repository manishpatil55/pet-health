import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronLeft, ChevronRight, ArrowLeft, ChevronRight as ArrowIcon, Mail, Lock, User } from 'lucide-react';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { queryClient } from '@/App';

// ─── ZOD SCHEMAS ─────────────────────────────────────────────────────────────
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

const signupSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Please enter a valid email'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[a-zA-Z]/, 'Must contain at least one letter')
            .regex(/\d/, 'Must contain at least one number'),
    });

const forgotSchema = z.object({
    email: z.string().email('Please enter a valid email'),
});

const verifySchema = z.object({
    code: z.string().length(6, 'Verification code must be 6 digits'),
});

const resetSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[a-zA-Z]/, 'Must contain at least one letter')
            .regex(/\d/, 'Must contain at least one number'),
        confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });


// ─── THEME TOKENS ────────────────────────────────────────────────────────────
// Original design colors and tokens preserved intact
const PETS = [
    {
        url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1600&auto=format&fit=crop",
        name: "Cooper",
        breed: "Australian Shepherd",
        accent: "#4FB6B2",
    },
    {
        url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=1600&auto=format&fit=crop",
        name: "Mochi",
        breed: "Ginger Cat",
        accent: "#CFEDEA",
    },
    {
        url: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?q=80&w=1600&auto=format&fit=crop",
        name: "Snowball",
        breed: "Holland Lop Rabbit",
        accent: "#6BCB77",
    },
    {
        url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=1600&auto=format&fit=crop",
        name: "Peanut",
        breed: "Golden Hamster",
        accent: "#F2B544",
    },
    {
        url: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=1600&auto=format&fit=crop",
        name: "Rio",
        breed: "Scarlet Macaw",
        accent: "#4FB6B2",
    },
    {
        url: "https://images.unsplash.com/photo-1612774412771-005ed8e861d2?q=80&w=1600&auto=format&fit=crop",
        name: "Biscuit",
        breed: "Corgi",
        accent: "#CFEDEA",
    },
];

const themes = {
    dark: {
        pageBg: '#08080c',
        panelBg: '#0c0c12',
        carouselBg: '#0a0a0f',
        heading: 'text-white',
        subtext: 'text-white/30',
        bodyText: 'text-white/90',
        mutedText: 'text-white/20',
        faintText: 'text-white/10',
        inputBg: 'bg-white/[0.03]',
        inputBorder: 'border-white/[0.07]',
        inputFocusBorder: 'focus:border-[#4FB6B2]/40',
        inputFocusBg: 'focus:bg-white/[0.05]',
        inputText: 'text-white/90',
        iconDefault: 'text-white/15',
        iconFocus: 'peer-focus:text-[#4FB6B2]/60',
        labelDefault: 'text-white/25',
        labelFocus: 'peer-focus:text-[#4FB6B2]/70',
        labelFilled: 'peer-[:not(:placeholder-shown)]:text-white/30',
        eyeBtn: 'text-white/15 hover:text-white/40',
        toggleOff: 'bg-white/[0.04] border-white/[0.1]',
        toggleOffHover: 'group-hover:border-white/20',
        toggleKnobOff: 'bg-white/25',
        toggleLabelOff: 'text-white/25',
        toggleLabelOn: 'text-white/50',
        googleBtnBg: 'bg-white/[0.03]',
        googleBtnBorder: 'border-white/[0.07]',
        googleBtnText: 'text-white/60',
        googleBtnHoverBg: 'hover:bg-white/[0.06]',
        googleBtnHoverBorder: 'hover:border-white/[0.12]',
        googleBtnHoverText: 'hover:text-white/80',
        dividerLine: 'to-white/[0.06]',
        dividerText: 'text-white/15',
        footerText: 'text-white/10',
        footerHover: 'hover:text-white/25',
        auroraFrom: 'from-[#4FB6B2]/[0.03]',
        aurOrb1: 'bg-[#CFEDEA]/[0.03]',
        aurOrb2: 'bg-[#4FB6B2]/[0.02]',
        overlayL: 'via-[#0c0c12]/30',
        overlayLEnd: 'to-[#0c0c12]/80',
        overlayBFrom: 'from-[#0a0a0f]/90',
        overlayBTo: 'to-[#0a0a0f]/20',
        vignette: 'rgba(10,10,15,0.5)',
        carouselLabel: 'text-white/25',
        carouselName: 'text-white',
        carouselBreed: 'text-white/35',
        carouselCount: 'text-white/20',
        carouselCountDim: 'text-white/10',
        navBtnBg: 'bg-white/[0.05]',
        navBtnBorder: 'border-white/[0.07]',
        navBtnText: 'text-white/30 hover:text-white/70',
        glowShadow: '0_0_30px_rgba(79,182,178,0.06),inset_0_1px_0_rgba(255,255,255,0.03)',
        edgeGlow: 'via-[#4FB6B2]/15',
        noise: 0.012,
        mobileImgOpacity: 'opacity-[0.05]',
        cardBorder: 'sm:border-white/[0.06]',
        cardShadow: 'sm:shadow-[0_0_80px_rgba(0,0,0,0.6)]',
        backText: 'text-white/25 hover:text-white/50',
        linkSwitch: 'text-[#4FB6B2]/60 hover:text-[#4FB6B2]',
        forgotLink: 'text-[#4FB6B2]/50 hover:text-[#4FB6B2]',
    },
    light: {
        pageBg: '#f0fcfb',
        panelBg: '#ffffff',
        carouselBg: '#004442',
        heading: 'text-[#131d1e]',
        subtext: 'text-[#3d4948]',
        bodyText: 'text-[#131d1e]',
        mutedText: 'text-[#6d7978]',
        faintText: 'text-[#bdc9c7]',
        inputBg: 'bg-[#eaf6f5]',
        inputBorder: 'border-[#bdc9c7]/40',
        inputFocusBorder: 'focus:border-[#006a67]',
        inputFocusBg: 'focus:bg-white',
        inputText: 'text-[#131d1e]',
        iconDefault: 'text-[#3d4948]',
        iconFocus: 'peer-focus:text-[#006a67]',
        labelDefault: 'text-[#3d4948]',
        labelFocus: 'peer-focus:text-[#006a67]',
        labelFilled: 'peer-[:not(:placeholder-shown)]:text-[#3d4948]',
        eyeBtn: 'text-[#3d4948] hover:text-[#006a67]',
        toggleOff: 'bg-[#eaf6f5] border-[#bdc9c7]/40',
        toggleOffHover: 'group-hover:border-[#006a67]/50',
        toggleKnobOff: 'bg-[#bdc9c7]',
        toggleLabelOff: 'text-[#6d7978]',
        toggleLabelOn: 'text-[#131d1e]',
        googleBtnBg: 'bg-white',
        googleBtnBorder: 'border-[#bdc9c7]/50',
        googleBtnText: 'text-[#3d4948]',
        googleBtnHoverBg: 'hover:bg-[#eaf6f5]',
        googleBtnHoverBorder: 'hover:border-[#006a67]/30',
        googleBtnHoverText: 'hover:text-[#131d1e]',
        dividerLine: 'to-[#bdc9c7]/50',
        dividerText: 'text-[#6d7978]',
        footerText: 'text-[#6d7978]',
        footerHover: 'hover:text-[#006a67]',
        auroraFrom: 'from-[#8ff3ef]/30',
        aurOrb1: 'bg-[#93f59c]/20',
        aurOrb2: 'bg-[#4fb6b2]/15',
        overlayL: 'via-[#004442]/30',
        overlayLEnd: 'to-[#004442]/80',
        overlayBFrom: 'from-[#004442]/90',
        overlayBTo: 'to-[#004442]/20',
        vignette: 'rgba(0,68,66,0.3)',
        carouselLabel: 'text-white/60',
        carouselName: 'text-white',
        carouselBreed: 'text-white/80',
        carouselCount: 'text-white/40',
        carouselCountDim: 'text-white/20',
        navBtnBg: 'bg-white/10',
        navBtnBorder: 'border-white/20',
        navBtnText: 'text-white/50 hover:text-white',
        glowShadow: '0_0_30px_rgba(0,106,103,0.08),inset_0_1px_0_rgba(255,255,255,1)',
        edgeGlow: 'via-[#4fb6b2]/20',
        noise: 0.012,
        mobileImgOpacity: 'opacity-[0.03]',
        cardBorder: 'sm:border-[#bdc9c7]/40',
        cardShadow: 'sm:shadow-[0_32px_80px_rgba(19,29,30,0.08)]',
        backText: 'text-[#3d4948] hover:text-[#006a67]',
        linkSwitch: 'text-[#006a67] hover:text-[#4fb6b2]',
        forgotLink: 'text-[#3d4948] hover:text-[#006a67]',
    },
};

type ViewState = 'login' | 'signup' | 'forgot' | 'verify' | 'reset';

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function Login({ initialView = 'login' }: { initialView?: ViewState }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Core state mappings
    const setAuth = useAuthStore(s => s.setAuth);
    const storeSetRememberMe = useAuthStore(s => s.setRememberMe);
    const { signInWithGoogle } = useGoogleAuth();
    
    const location = useLocation();

    const getViewFromPath = useCallback((): ViewState => {
        const path = location.pathname;
        if (path === ROUTES.SIGNUP) return 'signup';
        if (path === ROUTES.FORGOT_PASSWORD) return 'forgot';
        if (path === ROUTES.VERIFY_OTP) return 'verify';
        if (path === ROUTES.RESET_PASSWORD) return 'reset';
        return 'login';
    }, [location.pathname]);

    // UI state
    const [view, setViewInternal] = useState<ViewState>(getViewFromPath());
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transDir, setTransDir] = useState<'up' | 'down'>('up');
    const [showPassword, setShowPassword] = useState(false);
    const [currentPet, setCurrentPet] = useState(0);
    const [rememberMe, setRememberMe] = useState(true);
    
    // Form and validation state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [pendingEmail, setPendingEmail] = useState(searchParams.get('email') || '');
    const resetToken = searchParams.get('token');
    
    const formRef = useRef<HTMLDivElement>(null);

    // Initial setup
    useEffect(() => {
        if (initialView === 'reset' && !resetToken) {
            setError("Invalid reset token.");
        }
    }, [initialView, resetToken]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentPet((p) => (p + 1) % PETS.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    // Helper functions
    const nextPet = () => setCurrentPet((p) => (p + 1) % PETS.length);
    const prevPet = () => setCurrentPet((p) => (p - 1 + PETS.length) % PETS.length);
    const t = themes.light; // Switched to light theme per latest requirement
    const pet = PETS[currentPet];

    const changeView = useCallback((v: ViewState) => {
        const dir = (v === 'signup' || v === 'forgot') ? 'up' : 'down';
        setTransDir(dir);
        setIsTransitioning(true);
        setError(null);
        setSuccessMessage(null);
        setTimeout(() => {
            // Update the URL to match the view smoothly so browser reloads start well
            const pathMap: Record<ViewState, string> = {
                login: ROUTES.LOGIN,
                signup: ROUTES.SIGNUP,
                forgot: ROUTES.FORGOT_PASSWORD,
                verify: ROUTES.VERIFY_OTP,
                reset: ROUTES.RESET_PASSWORD
            };
            window.history.pushState(null, '', pathMap[v] || ROUTES.LOGIN);
            
            setViewInternal(v);
            setIsTransitioning(false);
            formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
    }, []);

    // ─── AUTH HANDLERS ─────────────────────────────────────────────────────────

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const data = Object.fromEntries(new FormData(e.currentTarget));
        
        try {
            const parsed = loginSchema.parse(data);
            setLoading(true);
            setPendingEmail(parsed.email);
            const res = await authService.login(parsed);
            
            // Clear any old user's data from React Query cache before switching user
            queryClient.clear();
            
            storeSetRememberMe(rememberMe);
            setAuth(res.accessToken, res.user);
            toast.success('Welcome back!');
            navigate(ROUTES.DASHBOARD);
        } catch (err: any) {
            setLoading(false);
            if (err instanceof z.ZodError) {
                setError((err as any).errors[0].message);
            } else {
                const code = err?.response?.data?.code;
                if (code === 'EMAIL_NOT_VERIFIED') {
                    changeView('verify');
                    authService.resendOtp(data.email as string).catch(() => {});
                } else {
                    setError(err?.response?.data?.message || 'Login failed');
                }
            }
        }
    };

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const data = Object.fromEntries(new FormData(e.currentTarget));

        try {
            const parsed = signupSchema.parse(data);
            setLoading(true);
            setPendingEmail(parsed.email);
            
            await authService.signup(parsed);
            toast.success('OTP sent to your email!');
            changeView('verify');
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                setError((err as any).errors[0].message);
            } else {
                setError(err?.response?.data?.message || 'Signup failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const code = new FormData(e.currentTarget).get('code') as string;

        try {
            verifySchema.parse({ code });
            setLoading(true);
            await authService.verifyEmail({ email: pendingEmail, otp: code });
            setSuccessMessage('Email verified! You can now sign in.');
            changeView('login');
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                setError((err as any).errors[0].message);
            } else {
                setError(err?.response?.data?.message || 'Verification failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const data = Object.fromEntries(new FormData(e.currentTarget));

        try {
            const parsed = forgotSchema.parse(data);
            setLoading(true);
            await authService.forgotPassword(parsed.email);
            setSuccessMessage('Reset link sent to your email.');
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                setError((err as any).errors[0].message);
            } else {
                setError(err?.response?.data?.message || 'Request failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const data = Object.fromEntries(new FormData(e.currentTarget));

        try {
            const parsed = resetSchema.parse(data);
            if (!resetToken) throw new Error("Missing reset token");
            
            setLoading(true);
            await authService.resetPassword({ email: pendingEmail, token: resetToken, newPassword: parsed.newPassword });
            setSuccessMessage('Password reset successfully! Please log in.');
            changeView('login');
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                setError((err as any).errors[0].message);
            } else {
                setError(err?.response?.data?.message || err.message || 'Reset failed');
            }
        } finally {
            setLoading(false);
        }
    };

    // ─── UI COMPONENTS ───────────────────────────────────────────────────────────

    const transitionClass = isTransitioning
        ? `opacity-0 ${transDir === 'up' ? 'translate-y-6' : '-translate-y-6'} scale-[0.98]`
        : 'opacity-100 translate-y-0 scale-100';

    const renderField = (id: string, name: string, label: string, opts?: {
        type?: string; isPassword?: boolean;
        icon?: React.ComponentType<{ className?: string }>;
        autoComplete?: string;
        defaultValue?: string;
    }) => {
        const { type = 'text', isPassword, icon: Icon, autoComplete, defaultValue } = opts || {};
        const autofillBg = '#131319';
        const autofillText = '#e5e5e5';

        return (
            <div className="relative group" key={id}>
                <div className="absolute -inset-[1px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#4FB6B2]/0 via-[#4FB6B2]/0 to-[#CFEDEA]/0 group-focus-within:from-[#4FB6B2]/20 group-focus-within:via-[#4FB6B2]/10 group-focus-within:to-[#CFEDEA]/20 blur-sm transition-all duration-500 pointer-events-none" />

                <div className="relative">
                    <input
                        id={id} name={name}
                        type={isPassword ? (showPassword ? 'text' : 'password') : type}
                        autoComplete={autoComplete || (isPassword ? 'current-password' : undefined)}
                        placeholder=" " required
                        defaultValue={defaultValue}
                        className={`peer w-full h-12 sm:h-[54px] rounded-xl sm:rounded-2xl ${t.inputBg} border ${t.inputBorder} ${t.inputFocusBorder} ${t.inputFocusBg} outline-none pl-12 sm:pl-14 pr-4 sm:pr-5 pt-5 sm:pt-6 pb-1 sm:pb-1.5 text-[14px] sm:text-[15px] ${t.inputText} font-medium tracking-wide transition-all duration-400 placeholder-transparent focus:shadow-[${t.glowShadow}]`}
                        style={{ caretColor: pet.accent }}
                    />

                    <style>{`
                        #${id}:-webkit-autofill, #${id}:-webkit-autofill:hover, #${id}:-webkit-autofill:focus, #${id}:-webkit-autofill:active {
                            -webkit-box-shadow: 0 0 0 30px ${autofillBg} inset !important;
                            -webkit-text-fill-color: ${autofillText} !important;
                            transition: background-color 5000s ease-in-out 0s;
                            border-color: rgba(255,255,255,0.08) !important;
                        }
                    `}</style>

                    {Icon && (
                        <div className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 ${t.iconDefault} ${t.iconFocus} transition-colors duration-400`}>
                            <Icon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
                        </div>
                    )}

                    <label
                        htmlFor={id}
                        className={`absolute left-12 sm:left-14 top-1/2 -translate-y-1/2 ${t.labelDefault} text-xs sm:text-sm font-medium tracking-wide pointer-events-none transition-all duration-300 peer-focus:top-2.5 sm:peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[9px] sm:peer-focus:text-[10px] ${t.labelFocus} peer-focus:tracking-[0.15em] peer-focus:uppercase peer-focus:font-semibold peer-[:not(:placeholder-shown)]:top-2.5 sm:peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[9px] sm:peer-[:not(:placeholder-shown)]:text-[10px] ${t.labelFilled} peer-[:not(:placeholder-shown)]:tracking-[0.15em] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:font-semibold`}
                    >
                        {label}
                    </label>

                    {isPassword && (
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 ${t.eyeBtn} focus:text-[#4FB6B2]/60 transition-colors duration-300 p-1`}
                            aria-label="Toggle password">
                            {showPassword ? <EyeOff className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
                        </button>
                    )}

                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#4FB6B2]/60 to-transparent peer-focus:w-3/4 transition-all duration-600 rounded-full" />
                </div>
            </div>
        );
    };

    const Toggle = () => (
        <button type="button" onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer"
        >
            <div className={`relative w-10 sm:w-11 h-[22px] sm:h-6 rounded-full border transition-all duration-400 ${rememberMe
                ? 'bg-[#4FB6B2]/20 border-[#4FB6B2]/40'
                : `${t.toggleOff} ${t.toggleOffHover}`
                }`}>
                <div className={`absolute top-[2px] w-[16px] sm:w-[18px] h-[16px] sm:h-[18px] rounded-full transition-all duration-400 shadow-md ${rememberMe
                    ? 'left-[calc(100%-18px)] sm:left-[calc(100%-20px)] bg-[#4FB6B2] shadow-[#4FB6B2]/30'
                    : `left-[2px] ${t.toggleKnobOff}`
                    }`} />
            </div>
            <span className={`text-[12px] sm:text-[13px] transition-colors duration-300 ${rememberMe ? t.toggleLabelOn : `${t.toggleLabelOff} group-hover:text-white/40`}`}>
                Remember me
            </span>
        </button>
    );

    const PrimaryBtn = ({ children }: { children: React.ReactNode }) => (
        <button type="submit" disabled={loading}
            className={`w-full h-12 sm:h-[54px] rounded-xl sm:rounded-2xl font-semibold text-[14px] sm:text-[15px] tracking-wide text-white bg-gradient-to-r from-[#006a67] to-[#4fb6b2] hover:brightness-110 shadow-[0_8px_28px_rgba(0,106,103,0.25)] hover:shadow-[0_12px_36px_rgba(0,106,103,0.35)] hover:scale-[1.015] active:scale-[0.985] transition-all duration-300 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed hover:scale-100 hover:brightness-100' : ''}`}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-[rgba(255,255,255,0.2)] border-t-white rounded-full animate-spin" />
            ) : (
                <>{children} <ArrowIcon className="w-4 h-4 ml-1" /></>
            )}
        </button>
    );

    const GoogleBtn = ({ text }: { text: string }) => (
        <button type="button" onClick={signInWithGoogle} className={`w-full h-12 sm:h-[54px] rounded-xl sm:rounded-2xl font-semibold text-[14px] sm:text-[15px] tracking-wide ${t.googleBtnText} ${t.googleBtnBg} border ${t.googleBtnBorder} ${t.googleBtnHoverBg} ${t.googleBtnHoverBorder} ${t.googleBtnHoverText} transition-all duration-300 flex items-center justify-center gap-3`}>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {text}
        </button>
    );

    const Divider = () => (
        <div className="flex items-center gap-4 py-1">
            <div className={`flex-1 h-[1px] bg-gradient-to-r from-transparent ${t.dividerLine}`} />
            <span className={`text-[11px] ${t.dividerText} uppercase tracking-[0.2em] font-medium`}>or</span>
            <div className={`flex-1 h-[1px] bg-gradient-to-l from-transparent ${t.dividerLine}`} />
        </div>
    );

    // ─── RENDERS ────────────────────────────────────────────────────────────────

    const ErrorBox = () => error ? (
        <div className="mt-3 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
        </div>
    ) : null;
    
    const SuccessBox = () => successMessage ? (
        <div className="mt-3 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-green-500/10 border border-green-500/20 text-green-400">
            {successMessage}
        </div>
    ) : null;

    const renderLogin = () => (
        <>
            <div className="mb-6 sm:mb-8">
                <h1 className={`text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.1] font-bold ${t.heading} tracking-tight`}>
                    Welcome<br />
                    <span className="bg-gradient-to-r from-[#4FB6B2] via-[#3FA39F] to-[#4FB6B2] bg-clip-text text-transparent">back</span>
                </h1>
                <p className={`mt-2 sm:mt-3 ${t.subtext} text-[13px] sm:text-[14px] font-light tracking-wide`}>Sign in to continue to your account</p>
                <ErrorBox />
                <SuccessBox />
            </div>
            <form className="space-y-3 sm:space-y-3.5" onSubmit={handleLogin} noValidate>
                {renderField('email', 'email', 'Email address', { type: 'email', icon: Mail, autoComplete: 'email', defaultValue: pendingEmail })}
                {renderField('password', 'password', 'Password', { isPassword: true, icon: Lock, autoComplete: 'current-password' })}
                <div className="flex items-center justify-between pt-1">
                    <Toggle />
                    <button type="button" onClick={() => changeView('forgot')}
                        className={`text-[12px] sm:text-[13px] ${t.forgotLink} transition-colors duration-300`}>
                        Forgot password?
                    </button>
                </div>
                <div className="pt-2 sm:pt-3 space-y-2.5 sm:space-y-3">
                    <PrimaryBtn>Sign in</PrimaryBtn>
                    <Divider />
                    <GoogleBtn text="Sign in with Google" />
                </div>
            </form>
            <p className={`mt-6 sm:mt-8 text-center text-[12px] sm:text-[13px] ${t.mutedText}`}>
                Don't have an account?{' '}
                <button type="button" onClick={() => changeView('signup')}
                    className={`${t.linkSwitch} font-medium transition-colors duration-300`}>
                    Create one
                </button>
            </p>
        </>
    );

    const renderSignup = () => (
        <>
            <div className="mb-5 sm:mb-7">
                <h1 className={`text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.1] font-bold ${t.heading} tracking-tight`}>
                    Create<br />
                    <span className="bg-gradient-to-r from-[#4FB6B2] via-[#3FA39F] to-[#4FB6B2] bg-clip-text text-transparent">account</span>
                </h1>
                <p className={`mt-2 sm:mt-3 ${t.subtext} text-[13px] sm:text-[14px] font-light tracking-wide`}>Join the family. Your pets will thank you.</p>
                <ErrorBox />
            </div>
            <form className="space-y-3 sm:space-y-3.5" onSubmit={handleSignup} noValidate>
                {renderField('name-s', 'name', 'Full name', { icon: User, autoComplete: 'name' })}
                {renderField('email-s', 'email', 'Email address', { type: 'email', icon: Mail, autoComplete: 'email', defaultValue: pendingEmail })}
                {renderField('pass-s', 'password', 'Create password', { isPassword: true, icon: Lock, autoComplete: 'new-password' })}
                <div className="pt-2 sm:pt-3 space-y-2.5 sm:space-y-3">
                    <PrimaryBtn>Create account</PrimaryBtn>
                    <Divider />
                    <GoogleBtn text="Sign up with Google" />
                </div>
            </form>
            <p className={`mt-6 sm:mt-8 text-center text-[12px] sm:text-[13px] ${t.mutedText}`}>
                Already have an account?{' '}
                <button type="button" onClick={() => changeView('login')}
                    className={`${t.linkSwitch} font-medium transition-colors duration-300`}>
                    Sign in
                </button>
            </p>
        </>
    );

    const renderForgot = () => (
        <>
            <button type="button" onClick={() => changeView('login')}
                className={`flex items-center gap-2 text-[12px] sm:text-[13px] ${t.backText} transition-colors duration-300 mb-6 sm:mb-8 group`}>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300" /> Back to sign in
            </button>
            <div className="mb-6 sm:mb-8">
                <h1 className={`text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.1] font-bold ${t.heading} tracking-tight`}>
                    Forgot<br />
                    <span className="bg-gradient-to-r from-[#4FB6B2] via-[#3FA39F] to-[#4FB6B2] bg-clip-text text-transparent">password?</span>
                </h1>
                <p className={`mt-2 sm:mt-3 ${t.subtext} text-[13px] sm:text-[14px] font-light tracking-wide`}>No worries — we'll email you a reset link.</p>
                <ErrorBox />
                <SuccessBox />
            </div>
            <form className="space-y-3 sm:space-y-3.5" onSubmit={handleForgot} noValidate>
                {renderField('email-f', 'email', 'Email address', { type: 'email', icon: Mail })}
                <div className="pt-2 sm:pt-3">
                    <PrimaryBtn>Send reset link</PrimaryBtn>
                </div>
            </form>
        </>
    );

    const renderVerify = () => (
        <>
            <div className="mb-6 sm:mb-8">
                <h1 className={`text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.1] font-bold ${t.heading} tracking-tight`}>
                    Verify<br />
                    <span className="bg-gradient-to-r from-[#4FB6B2] via-[#3FA39F] to-[#4FB6B2] bg-clip-text text-transparent">email</span>
                </h1>
                <p className={`mt-2 sm:mt-3 ${t.subtext} text-[13px] sm:text-[14px] font-light tracking-wide`}>We've sent a 6-digit code to <b>{pendingEmail}</b></p>
                <ErrorBox />
                <SuccessBox />
            </div>
            <form className="space-y-3 sm:space-y-3.5" onSubmit={handleVerify} noValidate>
                {renderField('code', 'code', 'Verification Code', { icon: Mail, autoComplete: 'one-time-code' })}
                <div className="pt-2 sm:pt-3 space-y-3">
                    <PrimaryBtn>Verify & Continue</PrimaryBtn>
                    <button
                        type="button"
                        onClick={() => {
                            authService.resendOtp(pendingEmail)
                                .then(() => toast.success('New code sent!'))
                                .catch(() => toast.error('Failed to resend code'));
                        }}
                        className={`w-full text-center text-xs font-medium ${t.linkSwitch} cursor-pointer hover:underline`}
                    >
                        Didn't get a code? Resend
                    </button>
                </div>
            </form>
            <p className={`mt-6 sm:mt-8 text-center text-[12px] sm:text-[13px] ${t.mutedText}`}>
                Wrong email?{' '}
                <button type="button" onClick={() => changeView('signup')}
                    className={`${t.linkSwitch} font-medium transition-colors duration-300`}>
                    Back to signup
                </button>
            </p>
        </>
    );
    
    const renderReset = () => (
        <>
            <div className="mb-6 sm:mb-8">
                <h1 className={`text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.1] font-bold ${t.heading} tracking-tight`}>
                    Secure<br />
                    <span className="bg-gradient-to-r from-[#4FB6B2] via-[#3FA39F] to-[#4FB6B2] bg-clip-text text-transparent">password</span>
                </h1>
                <p className={`mt-2 sm:mt-3 ${t.subtext} text-[13px] sm:text-[14px] font-light tracking-wide`}>Create a secure new password for your account.</p>
                <ErrorBox />
            </div>
            <form className="space-y-3 sm:space-y-3.5" onSubmit={handleReset} noValidate>
                <input type="hidden" name="token" value={resetToken || ''} />
                {renderField('newPassword', 'newPassword', 'New Password', { isPassword: true, icon: Lock, autoComplete: 'new-password' })}
                {renderField('confirmPassword', 'confirmPassword', 'Confirm Password', { isPassword: true, icon: Lock, autoComplete: 'new-password' })}
                <div className="pt-2 sm:pt-3">
                    <PrimaryBtn>Update Password</PrimaryBtn>
                </div>
            </form>
            <p className={`mt-6 sm:mt-8 text-center text-[12px] sm:text-[13px] ${t.mutedText}`}>
                Remembered it?{' '}
                <button type="button" onClick={() => changeView('login')}
                    className={`${t.linkSwitch} font-medium transition-colors duration-300`}>
                    Sign in here
                </button>
            </p>
        </>
    );

    const renderView = () => {
        switch (view) {
            case 'signup': return renderSignup();
            case 'forgot': return renderForgot();
            case 'verify': return renderVerify();
            case 'reset': return renderReset();
            default: return renderLogin();
        }
    };

    return (
        <div className="h-[100dvh] w-full flex items-center justify-center p-0 sm:p-4 lg:p-6 font-sans transition-colors duration-500 overflow-hidden"
            style={{ backgroundColor: t.pageBg }}>
            <div className={`w-full sm:max-w-[1300px] h-[100dvh] sm:h-[760px] lg:h-[820px] lg:max-h-[92vh] flex flex-col lg:flex-row sm:rounded-[28px] overflow-hidden sm:border ${t.cardBorder} ${t.cardShadow} transition-colors duration-500`}>

                {/* ═══════ LEFT — FORM PANEL ═══════ */}
                <div
                    className="w-full lg:w-[42%] min-w-0 relative flex flex-col flex-1 lg:flex-initial overflow-y-auto transition-colors duration-500"
                    style={{ backgroundColor: t.panelBg }}>

                    {/* Mobile background image */}
                    <div className="lg:hidden absolute inset-0 pointer-events-none">
                        {PETS.map((p, i) => (
                            <img key={p.url} src={p.url} alt=""
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1.2s] ${i === currentPet ? t.mobileImgOpacity : 'opacity-0'}`}
                                loading="lazy"
                            />
                        ))}
                    </div>

                    {/* Aurora gradient accent */}
                    <div className="absolute top-0 left-0 right-0 h-[200px] sm:h-[300px] pointer-events-none z-[1]">
                        <div className={`absolute inset-0 bg-gradient-to-b ${t.auroraFrom} via-transparent to-transparent`} />
                        <div className={`absolute top-0 right-0 w-28 sm:w-40 h-28 sm:h-40 ${t.aurOrb1} rounded-full blur-[40px] sm:blur-[60px]`} />
                        <div className={`absolute top-8 sm:top-10 left-6 sm:left-10 w-24 sm:w-32 h-24 sm:h-32 ${t.aurOrb2} rounded-full blur-[30px] sm:blur-[50px]`} />
                    </div>

                    {/* Noise texture */}
                    <div className="absolute inset-0 pointer-events-none z-[1]"
                        style={{
                            opacity: t.noise,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`
                        }}
                    />

                    {/* Content — scrollable when viewport is small */}
                    <div ref={formRef} className="relative z-10 flex flex-col min-h-full overflow-y-auto px-6 sm:px-10 lg:px-12 py-6 sm:py-8 lg:py-10">

                        {/* Ultra-Minimalist Back Link */}
                        <div className="mb-10 sm:mb-12 w-fit">
                            <Link to={ROUTES.LANDING} className="group inline-flex items-center gap-2.5 focus:outline-none">
                                <ArrowLeft className="w-4 h-4 text-[#006a67] group-hover:-translate-x-1 group-hover:text-[#4fb6b2] transition-all duration-300" />
                                <span className="text-[14px] sm:text-[15px] font-extrabold tracking-tight text-[#131d1e] group-hover:text-[#006a67] transition-colors duration-300">
                                    Return to Paw<span className="text-[#006a67] group-hover:text-[#4fb6b2] transition-colors duration-300">Health</span>
                                </span>
                            </Link>
                        </div>

                        {/* Form area */}
                        <div className={`flex-1 flex flex-col justify-center max-w-md w-full mx-auto lg:mx-0 lg:max-w-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${transitionClass}`}>
                            <style dangerouslySetInnerHTML={{ __html: `@keyframes progress-fill { from { width: 0%; } to { width: 100%; } }` }} />
                            {renderView()}
                        </div>

                        {/* Footer */}
                        <div className={`shrink-0 mt-auto flex items-center justify-between text-[11px] sm:text-[12px] ${t.footerText} pt-6`}>
                            <span>© {new Date().getFullYear()} PawHealth</span>
                            <div className="flex gap-3 sm:gap-4">
                                <button type="button" className={`${t.footerHover} transition-colors duration-300`}>Privacy</button>
                                <button type="button" className={`${t.footerHover} transition-colors duration-300`}>Terms</button>
                            </div>
                        </div>
                    </div>

                    {/* Right edge glow line (desktop) */}
                    <div className={`hidden lg:block absolute right-0 top-[15%] bottom-[15%] w-[1px] bg-gradient-to-b from-transparent ${t.edgeGlow} to-transparent`} />
                </div>

                {/* ═══════ RIGHT — CAROUSEL PANEL ═══════ */}
                <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden transition-colors duration-500"
                    style={{ backgroundColor: t.carouselBg }}>

                    {/* Background images */}
                    {PETS.map((p, i) => (
                        <img
                            key={p.url}
                            src={p.url}
                            alt={p.name}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1.2s] ease-[cubic-bezier(0.4,0,0.2,1)] ${i === currentPet ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.06]'}`}
                        />
                    ))}

                    {/* Cinematic overlays */}
                    <div className={`absolute inset-0 bg-gradient-to-l from-transparent ${t.overlayL} ${t.overlayLEnd} z-[1]`} />
                    <div className={`absolute inset-0 bg-gradient-to-t ${t.overlayBFrom} via-transparent ${t.overlayBTo} z-[2]`} />

                    {/* Vignette */}
                    <div className="absolute inset-0 z-[3] pointer-events-none"
                        style={{ boxShadow: `inset 0 0 120px 40px ${t.vignette}` }}
                    />

                    {/* Pet info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <p className={`${t.carouselLabel} text-[11px] uppercase tracking-[0.3em] font-medium mb-2`}>
                                    Featured companion
                                </p>
                                <h2
                                    className={`text-4xl font-bold ${t.carouselName} tracking-tight transition-colors duration-500`}
                                    style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
                                >
                                    {pet.name}
                                </h2>
                                <p className={`${t.carouselBreed} text-sm font-light mt-1 tracking-wide`}>{pet.breed}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`${t.carouselCount} text-sm font-mono`}>
                                    {String(currentPet + 1).padStart(2, '0')}
                                </span>
                                <div className={`w-8 h-[1px] bg-white/10`} />
                                <span className={`${t.carouselCountDim} text-sm font-mono`}>
                                    {String(PETS.length).padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Thumbnail strip */}
                        <div className="flex items-center gap-3">
                            {PETS.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPet(i)}
                                    className={`relative rounded-xl overflow-hidden transition-all duration-500 flex-shrink-0 ${i === currentPet
                                        ? 'w-20 h-16 ring-2 ring-offset-1 ring-offset-transparent opacity-100'
                                        : 'w-14 h-14 opacity-35 hover:opacity-65 grayscale hover:grayscale-0'
                                        }`}
                                    style={{
                                        ['--tw-ring-color' as string]: i === currentPet ? pet.accent : undefined,
                                    } as React.CSSProperties}
                                >
                                    <img src={p.url} alt={p.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {i === currentPet && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                                            style={{ backgroundColor: pet.accent }}
                                        >
                                            <div className="h-full bg-white/30" style={{ animation: 'progress-fill 6s linear forwards' }} />
                                        </div>
                                    )}
                                </button>
                            ))}

                            {/* Nav arrows */}
                            <div className="flex items-center gap-1.5 ml-auto">
                                <button type="button" onClick={prevPet}
                                    className={`w-10 h-10 rounded-full ${t.navBtnBg} backdrop-blur-sm border ${t.navBtnBorder} flex items-center justify-center ${t.navBtnText} hover:bg-white/[0.08] transition-all duration-300`}
                                    aria-label="Previous pet"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={nextPet}
                                    className={`w-10 h-10 rounded-full ${t.navBtnBg} backdrop-blur-sm border ${t.navBtnBorder} flex items-center justify-center ${t.navBtnText} hover:bg-white/[0.08] transition-all duration-300`}
                                    aria-label="Next pet"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Accent glow orb */}
                    <div
                        className="absolute top-1/3 right-1/4 w-60 h-60 rounded-full blur-[100px] z-[0] transition-colors duration-1000 opacity-15"
                        style={{ backgroundColor: pet.accent }}
                    />
                </div>
            </div>
        </div>
    );
}
