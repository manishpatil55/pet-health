/**
 * PawHealth – Clinical Sanctuary Landing Page
 * Landing.tsx  |  Replace your existing src/pages/Landing.tsx with this file.
 *
 * Prerequisites (add to your index.html <head> if not already present):
 * <link rel="preconnect" href="https://fonts.googleapis.com" />
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
 * <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
 *
 * Dependencies already in your project:
 *   react-router-dom, framer-motion, lucide-react,
 *   @/components/ui/Button, @/constants/routes, tailwindcss
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  PawPrint, Shield, FileText, TrendingUp,
  Star, Check, Minus, Lock, Cloud, Smartphone,
  Share2, Download, Menu, X, Play, Bell, Users,
  Heart, Mail, Globe, Zap, Activity,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

// ─── Images (referrerPolicy="no-referrer" fixes Google CDN CORS issue) ───────
const IMG = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASRxLWJdwaiDEM4jsn532Gvg8GUmhjd20ismMpZqUz_1m17khkEFzaUp9WyX9HYUu524Yo7dh9NCSliAoamH19EAOlupkbw1ukN-k-0K6YVm-CdbfHBGguhPgcBH2hsXlh_q8rrKd8rIaMRBblcIwMrOldtuTMdQUDz1B3Ak0JtTJPNz_bIRxgdFVkFDrWsAcNropuNTjty55EUV1gAVXtWr7HC2Suk506ahnDliY2zYuynYw5uP4eJew6rrxPr3ott2QnifToouWn',
  cat: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5AAb8Clgx4JYskVOUSjpqHZjDMi5do-8vqmaRQOdSmHLaut5mAg3uxm139xOTNileG0h9OnRlFgpN2KMXQeQeX0pDOGUcQH3PvKkN5ADEotdfY8bCmEXRwi1MjoeMbEcA-ZslarbJBCXAyoJE0koLQJ-gChNexj8DirScogZ07An9eQ7PA64J-dWF9MfPyt25iVN8nRIvGSu-oJaNWojDYKgUD35wDoDPblGVKoP9qfSYVDz_OTfIRHaYB_XvHIV1j9kqiL8q5Ir8',
  dogPark: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgKxFqBpURHGUnpfiw_M594Te5YY5ga69L_poTVAGLRfyFTGr3KMZc1D9Os8NG5-dWYCW2zgp4qk50ii4FArg1rDmX_CGy3m7RHRt-wuJW57J_WyMg6BiYLB-eiPA6g1bIETNyW3uAH-72H5Y8bK_PKDptQsz4I-ZRIqHYeTQBKqrM0UWWBBzJlhHR7jN0bKdZz-6h03xpkd41THyQK9YPA0tMCuh1QOgzeFaJCyANKcJzMUWf_TCZbu8tmRx6ySogqgGcMdcZNNdV',
  puppy: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApcrtxzNUXqWrJCmFGpoxUo-lqQQaL8ijOVmxtF1hWdWg2fsMlEeL1kdODq8-ahW1qLxGPOSR9ofF1QENr-W6SPhmvKn99jJgO_My7S-bx-55psiyuI1sQEmfFVrov148x_uT99cckLNfyEjMvLafxWXPy_NokEm-i4p5xmgwufE6dBd1LwxLZnrUeA_DLyLDH8FUltftYep5wQSV-iJxCg05eBsSQ-MXF8t5J44rDKnyJ29raZh4LhwRiLigWzSlz_uoFwoLZnhnY',
  tiny: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuekf-0p0SVKsIVrOKgjHA25Spb6pdC7tmKbnAjle0FQF7QmLJOixG84NEpPGULz9_uItW_U_FEwM23tT17xXfnrxXTvdQGyRjkCgtJ2Uj3B9Poy0X3alg74eLS35JaPJJhAoSa8zFy2X7_ZAWL1bluTMym92xeHyuN2ToFfHVS6Qzopgm8EQKVZMnhzdeRL-PKe6KsLpP4RsgvzTKwOY0gxucQdOLRD-aaMW9n8AjRzLbcvT24cpSFdEw63WmwkJ-hwrcxMFz8gCn',
} as const;

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};
const VP = { once: true, margin: '-60px' } as const;

// ─── Shared types ─────────────────────────────────────────────────────────────
// (Feature interface unused)
interface Testimonial { initial: string; name: string; sub: string; text: string; dark?: boolean }
interface Plan { name: string; price: string; period: string; badge?: string; features: { yes: boolean; text: string }[]; cta: string; highlight?: boolean }

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const startTime = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setCount(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  const display =
    count >= 10000 ? `${Math.floor(count / 1000)}k`
      : count >= 1000 ? `${(count / 1000).toFixed(1)}k`
        : count.toString();

  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── Global keyframes (injected once) ────────────────────────────────────────
const KEYFRAMES = `
  @keyframes pawFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes pawFloatB  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)}  }
  @keyframes shimmerBtn { 0%{background-position:-200% 0}  100%{background-position:200% 0} }
  @keyframes marqRun    { 0%{transform:translateX(0)}       100%{transform:translateX(-50%)} }
  @keyframes pulseRing  { 0%{transform:scale(1);opacity:.55} 100%{transform:scale(1.32);opacity:0} }
  @keyframes breathe    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  .paw-float   { animation: pawFloat  4.5s ease-in-out infinite }
  .paw-float-b { animation: pawFloatB 6s   ease-in-out 1.3s infinite }
  .marq-run    { animation: marqRun   32s  linear infinite; will-change:transform }
  .breathe     { animation: breathe   3s   ease-in-out infinite }
  .shimmer-cta {
    background: linear-gradient(110deg,#006a67 35%,#4fb6b2 50%,#006a67 65%);
    background-size:200% 100%;
    animation: shimmerBtn 2.8s linear infinite;
    color:#fff; font-weight:700; border:none; cursor:pointer;
    transition: box-shadow .2s, transform .15s;
  }
  .shimmer-cta:hover { box-shadow: 0 8px 28px rgba(0,106,103,.38) }
  .shimmer-cta:active { transform:scale(.97) }
  .ring-pulse::before {
    content:''; position:absolute; inset:-7px; border-radius:50%;
    border:2px solid #4fb6b2;
    animation: pulseRing 2.3s ease-out infinite;
  }
  .card-lift { transition: box-shadow .28s, transform .28s }
  .card-lift:hover { box-shadow:0 20px 48px rgba(19,29,30,.12); transform:translateY(-3px) }
  ::-webkit-scrollbar       { width:5px }
  ::-webkit-scrollbar-track { background:#eaf6f5 }
  ::-webkit-scrollbar-thumb { background:#4fb6b2; border-radius:99px }
  ::selection { background:#8ff3ef; color:#004442 }
`;

// ══════════════════════════════════════════════════════════════════════════════
//  SECTIONS
// ══════════════════════════════════════════════════════════════════════════════

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#reviews', label: 'Reviews' },
    { href: '#pricing', label: 'Pricing' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#f0fcfb]/90 backdrop-blur-xl shadow-sm' : 'bg-transparent'
        }`}
    >
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 no-underline">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#006a67] to-[#4fb6b2] flex items-center justify-center shadow-sm">
            <PawPrint className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black text-[#006a67]" style={{ fontFamily: 'Manrope, sans-serif' }}>
            PawHealth
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-[#3d4948] text-sm font-semibold hover:text-[#006a67] transition-colors no-underline"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm" className="text-[#006a67] font-bold rounded-2xl">
              Login
            </Button>
          </Link>
          <Link to={ROUTES.SIGNUP}>
            <button
              className="shimmer-cta px-5 py-2 rounded-2xl text-sm shadow-md"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Get Started Free
            </button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-xl text-[#3d4948] hover:bg-[#eaf6f5] transition-colors"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-[#bdc9c7]/30 px-6 py-6"
          >
            <div className="flex flex-col gap-5">
              {navLinks.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-[#3d4948] font-semibold text-base hover:text-[#006a67] transition-colors no-underline"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <div className="flex gap-3 pt-2 border-t border-[#eaf6f5]">
                <Link to={ROUTES.LOGIN} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full rounded-2xl">
                    Login
                  </Button>
                </Link>
                <Link to={ROUTES.SIGNUP} className="flex-1">
                  <button className="shimmer-cta w-full py-2 rounded-2xl text-sm">
                    Sign Up Free
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center pt-24 pb-16 lg:pb-20 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 75% 60% at 88% -8%,  rgba(79,182,178,.20) 0%,transparent 55%),
          radial-gradient(ellipse 55% 50% at -5%  65%,  rgba(0,106,103,.13) 0%,transparent 55%),
          radial-gradient(ellipse 45% 55% at 50% 108%, rgba(147,245,156,.12) 0%,transparent 55%),
          #f0fcfb`,
      }}
    >
      {/* Blobs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-60"
        style={{ background: 'radial-gradient(circle,rgba(79,182,178,.14) 0%,transparent 70%)', filter: 'blur(80px)', transform: 'translate(30%,-30%)' }} />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-50"
        style={{ background: 'radial-gradient(circle,rgba(0,110,41,.1) 0%,transparent 70%)', filter: 'blur(60px)', transform: 'translate(-30%,30%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── Left copy ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="z-10"
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-xs font-bold text-[#006a67] mb-7 shadow-sm">
                <span className="breathe w-2 h-2 rounded-full bg-[#006e29] inline-block" />
                Trusted by 12,000+ pet parents worldwide
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp}>
              <h1
                className="text-[2.8rem] sm:text-5xl xl:text-[5rem] font-black text-[#131d1e] leading-[1.04] tracking-tight mb-6"
                style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.025em' }}
              >
                Your pet's health,{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg,#006a67 0%,#4fb6b2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  organised
                </span>
              </h1>
            </motion.div>

            {/* Subtext */}
            <motion.div variants={fadeUp}>
              <p className="text-[#3d4948] text-lg xl:text-xl leading-relaxed mb-10 max-w-[480px]">
                Monitor vitals, schedule vet visits, and manage medications — all in one
                beautifully calm sanctuary. Clinical precision meets domestic peace.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link to={ROUTES.SIGNUP}>
                <button
                  className="shimmer-cta flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base shadow-lg w-full sm:w-auto"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 16 }}
                >
                  <Zap className="h-4 w-4" />
                  Start for free
                </button>
              </Link>
              <button
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-[#006a67] bg-white hover:bg-[#eaf6f5] transition-colors shadow-sm w-full sm:w-auto"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', border: 'none', cursor: 'pointer' }}
              >
                <Play className="h-4 w-4" />
                Watch demo
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp} className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {['A', 'S', 'R', 'M'].map((l, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-[3px] border-white flex items-center justify-center text-xs font-bold text-[#006a67]"
                    style={{
                      background: ['#dfebea', '#8ff3ef', '#93f59c', '#dfebea'][i],
                      zIndex: 4 - i,
                    }}
                  >{l}</div>
                ))}
                <div
                  className="w-9 h-9 rounded-full border-[3px] border-white flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#006a67,#4fb6b2)', zIndex: 0 }}
                >+k</div>
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-[#d69c2c] fill-[#d69c2c]" />
                  ))}
                </div>
                <span className="text-xs text-[#3d4948] font-medium">4.9 · 2,800+ reviews</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: hero visual ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="relative hidden lg:block"
          >
            {/* Main image */}
            <div className="paw-float-b relative">
              <div className="rounded-[2rem] overflow-hidden shadow-[0_32px_80px_rgba(19,29,30,0.18)]">
                <img
                  src={IMG.hero}
                  alt="Happy Golden Retriever"
                  referrerPolicy="no-referrer"
                  className="w-full object-cover"
                  style={{ height: 500 }}
                />
              </div>

              {/* Health vitals glass card */}
              <div
                className="absolute bottom-7 left-5 right-5 rounded-2xl p-5"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 16px 40px rgba(19,29,30,0.13)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#8ff3ef] flex items-center justify-center">
                      <PawPrint className="h-4 w-4 text-[#006a67]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#131d1e]" style={{ fontFamily: 'Manrope,sans-serif' }}>
                        Buddy · Golden Retriever
                      </p>
                      <p className="text-[10px] text-[#3d4948]">Updated 2h ago</p>
                    </div>
                  </div>
                  <span className="bg-[#93f59c] text-[#006e29] text-[10px] font-bold px-3 py-1 rounded-full">
                    Healthy ✓
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Weight', val: '28.4 kg', col: '#131d1e' },
                    { label: 'Next Vaccine', val: '12 days', col: '#006a67' },
                    { label: 'Mood', val: '😄 Great', col: '#131d1e' },
                  ].map(s => (
                    <div key={s.label} className="bg-[#eaf6f5] rounded-xl p-2 text-center">
                      <p className="text-[9px] text-[#3d4948] mb-1">{s.label}</p>
                      <p className="text-[11px] font-black" style={{ fontFamily: 'Manrope,sans-serif', color: s.col }}>{s.val}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] mb-1.5">
                  <span className="font-semibold text-[#3d4948]">Daily Health Score</span>
                  <span className="font-black text-[#006a67]">94%</span>
                </div>
                <div className="h-2 bg-[#d9e5e4] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '94%' }}
                    transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(135deg,#006a67,#4fb6b2)' }}
                  />
                </div>
              </div>
            </div>

            {/* Floating medication widget */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="paw-float absolute top-8 -left-14 xl:-left-16 rounded-2xl p-4 w-44 shadow-[0_20px_48px_rgba(19,29,30,0.13)]"
              style={{
                background: 'rgba(143,243,239,0.18)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.4)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-[#006a67]" />
                <span className="text-xs font-bold text-[#131d1e]" style={{ fontFamily: 'Manrope,sans-serif' }}>
                  Medications
                </span>
              </div>
              {[
                { name: 'Apoquel', dot: '#006e29' },
                { name: 'Fish Oil', dot: '#006a67' },
                { name: 'Probiotic', dot: '#d69c2c' },
              ].map(m => (
                <div key={m.name} className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-[#3d4948]">{m.name}</span>
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: m.dot }} />
                </div>
              ))}
              <div className="mt-2.5 text-center text-[10px] font-bold text-[#006a67] bg-[rgba(143,243,239,0.5)] rounded-lg py-1">
                Due in 1h
              </div>
            </motion.div>

            {/* Floating vet card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="paw-float-b absolute top-2 -right-12 xl:-right-14 rounded-2xl p-4 w-44 shadow-[0_20px_48px_rgba(19,29,30,0.13)]"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#006a67,#4fb6b2)' }}
                >
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#131d1e]" style={{ fontFamily: 'Manrope,sans-serif' }}>Dr. Priya</p>
                  <p className="text-[9px] text-[#3d4948]">Veterinarian</p>
                </div>
              </div>
              <p className="text-[10px] text-[#3d4948]">Next visit</p>
              <p className="text-xs font-black text-[#006a67]" style={{ fontFamily: 'Manrope,sans-serif' }}>Mar 28, 2026</p>
              <div className="mt-2 text-center text-[10px] font-bold text-[#006e29] bg-[#93f59c] rounded-lg py-1">
                Confirmed ✓
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile hero image (below copy on small screens) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 lg:hidden"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={IMG.hero}
              alt="Happy Golden Retriever"
              referrerPolicy="no-referrer"
              className="w-full h-64 sm:h-80 object-cover object-[center_30%]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Trust Marquee ────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Shield, label: 'GDPR Compliant' },
  { icon: Lock, label: 'End-to-End Encrypted' },
  { icon: Cloud, label: 'Real-time Sync' },
  { icon: Smartphone, label: 'Cross-platform' },
  { icon: Activity, label: '24/7 Vet Support' },
  { icon: Share2, label: 'Share with Vet' },
  { icon: FileText, label: 'PDF Reports' },
  { icon: Bell, label: 'Smart Reminders' },
];

function TrustBar() {
  const doubled = [...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS];
  return (
    <div className="overflow-hidden border-y border-[#bdc9c7]/25 bg-white py-4">
      <div className="marq-run flex gap-0" style={{ width: 'max-content' }}>
        {doubled.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-2 px-7 text-xs font-semibold text-[#3d4948] whitespace-nowrap"
            style={{
              borderRight: (i + 1) % TRUST_ITEMS.length === 0
                ? '1px solid rgba(189,201,199,.4)' : undefined,
            }}
          >
            <t.icon className="h-4 w-4 text-[#4fb6b2]" />
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { target: 12000, suffix: 'k+', label: 'Pet Parents' },
  { target: 98, suffix: '%', label: 'Satisfaction Rate' },
  { target: 340, suffix: 'k+', label: 'Health Records' },
  { target: 49, suffix: '★', label: 'App Store Rating' },
];

function StatsSection() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={VP}
      className="py-16 sm:py-20 bg-[#f0fcfb] px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
        {STATS.map((s, i) => (
          <motion.div key={i} variants={fadeUp} className="text-center">
            <div
              className="text-4xl sm:text-5xl font-black mb-2"
              style={{
                fontFamily: 'Manrope,sans-serif',
                background: 'linear-gradient(135deg,#006a67,#4fb6b2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <AnimatedCounter target={s.target} suffix={s.suffix} />
            </div>
            <p className="text-[#3d4948] text-sm font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Features Bento ───────────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-[#eaf6f5] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VP} className="mb-14">
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-[0.18em] uppercase text-[#006a67] mb-3">
            Everything you need
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl xl:text-[3rem] font-black text-[#131d1e] mb-4 leading-tight"
            style={{ fontFamily: 'Manrope,sans-serif', letterSpacing: '-0.02em' }}
          >
            Precision care for every paw
          </motion.h2>
          <motion.div variants={fadeUp}
            className="w-16 h-1.5 rounded-full"
            style={{ background: 'linear-gradient(135deg,#006a67,#4fb6b2)' }}
          />
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {/* Card 1 — sparkline (xl: spans 2 cols) */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={VP}
            className="card-lift bg-white rounded-3xl p-8 xl:col-span-2 overflow-hidden relative"
          >
            <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#006a67]/5 blur-3xl" />
            <div className="w-12 h-12 bg-[#8ff3ef] rounded-2xl flex items-center justify-center mb-6">
              <FileText className="h-6 w-6 text-[#006a67]" />
            </div>
            <h3 className="text-xl font-bold text-[#131d1e] mb-3" style={{ fontFamily: 'Manrope,sans-serif' }}>
              Complete Health History
            </h3>
            <p className="text-[#3d4948] text-sm leading-relaxed mb-7 max-w-md">
              All records in one place — from historical vaccine dates to allergy notes. Export a clean PDF for any vet visit.
            </p>
            {/* Sparkline */}
            <div className="bg-[#eaf6f5] rounded-2xl p-5">
              <div className="flex justify-between text-xs mb-3">
                <span className="font-bold text-[#3d4948]">Weight trend · 6 months</span>
                <span className="font-bold text-[#006e29]">↑ On track</span>
              </div>
              <svg viewBox="0 0 320 56" className="w-full h-12">
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4fb6b2" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#4fb6b2" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 44 L45 40 L90 35 L135 30 L180 25 L225 20 L270 16 L320 11"
                  stroke="#006a67" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0 44 L45 40 L90 35 L135 30 L180 25 L225 20 L270 16 L320 11 L320 56 L0 56Z"
                  fill="url(#sg)" />
                <circle cx="320" cy="11" r="5" fill="#006a67" />
                <circle cx="320" cy="11" r="9" fill="rgba(0,106,103,0.15)" />
              </svg>
              <div className="grid grid-cols-6 mt-2">
                {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(m => (
                  <span key={m} className="text-center text-[9px] text-[#6d7978]">{m}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 2 — reminders */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={VP}
            className="card-lift bg-white rounded-3xl p-8 overflow-hidden relative"
          >
            <div className="pointer-events-none absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-[#006e29]/5 blur-2xl" />
            <div className="w-12 h-12 bg-[#93f59c] rounded-2xl flex items-center justify-center mb-6">
              <Bell className="h-6 w-6 text-[#006e29]" />
            </div>
            <h3 className="text-xl font-bold text-[#131d1e] mb-3" style={{ fontFamily: 'Manrope,sans-serif' }}>
              Smart Reminders
            </h3>
            <p className="text-[#3d4948] text-sm leading-relaxed mb-5">
              Never miss a vaccine or dose. Smart alerts adapt to your schedule.
            </p>
            <div className="space-y-2.5">
              {[
                { label: 'Rabies Booster', time: '3 days', dot: '#ba1a1a' },
                { label: 'Fish Oil Capsule', time: 'Daily 8am', dot: '#d69c2c' },
                { label: 'Vet Checkup', time: '12 days', dot: '#006e29' },
                { label: 'Flea Treatment', time: '30 days', dot: '#006a67' },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-3 bg-[#eaf6f5] rounded-xl px-3 py-2.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.dot }} />
                  <span className="flex-1 text-xs font-semibold text-[#131d1e]">{r.label}</span>
                  <span className="text-[10px] text-[#3d4948]">{r.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3 — vitals bars */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={VP}
            className="card-lift bg-white rounded-3xl p-8"
          >
            <div className="w-12 h-12 bg-[#8ff3ef] rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-[#006a67]" />
            </div>
            <h3 className="text-xl font-bold text-[#131d1e] mb-3" style={{ fontFamily: 'Manrope,sans-serif' }}>
              Growth & Vitals
            </h3>
            <p className="text-[#3d4948] text-sm leading-relaxed mb-6">
              Beautiful charts for weight, activity and appetite. See your pet thrive over time.
            </p>
            {[
              { label: 'Weight', val: 94, color: '#006a67' },
              { label: 'Activity', val: 78, color: '#006e29' },
              { label: 'Appetite', val: 89, color: '#d69c2c' },
            ].map(b => (
              <div key={b.label} className="mb-3.5">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#3d4948]">{b.label}</span>
                  <span className="font-black" style={{ fontFamily: 'Manrope,sans-serif', color: b.color }}>{b.val}%</span>
                </div>
                <div className="h-2 bg-[#d9e5e4] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: b.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${b.val}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
                    viewport={{ once: true }}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Card 4 — multi-pet */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={VP}
            className="card-lift bg-white rounded-3xl p-8"
          >
            <div className="w-12 h-12 bg-[#dfebea] rounded-2xl flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-[#006a67]" />
            </div>
            <h3 className="text-xl font-bold text-[#131d1e] mb-3" style={{ fontFamily: 'Manrope,sans-serif' }}>
              Multi-Pet Profiles
            </h3>
            <p className="text-[#3d4948] text-sm leading-relaxed">
              Manage all your pets under one account. Each gets their own profile, timeline and health dashboard — no limit on pets.
            </p>
          </motion.div>

          {/* Card 5 — dark export card (xl: full width) */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={VP}
            className="rounded-3xl p-8 md:col-span-2 xl:col-span-3 overflow-hidden relative"
            style={{ background: '#004442' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
              <div>
                <div className="w-12 h-12 bg-[rgba(143,243,239,0.18)] rounded-2xl flex items-center justify-center mb-6">
                  <Share2 className="h-6 w-6 text-[#8ff3ef]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Manrope,sans-serif' }}>
                  Direct Vet Export
                </h3>
                <p className="text-[rgba(143,243,239,0.75)] text-sm leading-relaxed mb-6">
                  Generate a complete, formatted health summary PDF in one tap and share it directly with your vet — before, during, or after visits. No more "I can't remember."
                </p>
                <button
                  className="flex items-center gap-2 text-[#8ff3ef] text-sm font-bold px-4 py-2.5 rounded-2xl transition-colors"
                  style={{ background: 'rgba(143,243,239,0.12)', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(143,243,239,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(143,243,239,0.12)')}
                >
                  <Download className="h-4 w-4" />
                  See a sample report
                </button>
              </div>
              {/* PDF mock */}
              <div
                className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
              >
                <div className="flex justify-between items-center mb-5">
                  <span className="text-white font-bold text-sm">Buddy · Health Report</span>
                  <span
                    className="text-[#8ff3ef] text-[10px] font-bold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(143,243,239,0.2)' }}
                  >Mar 2026</span>
                </div>
                {[
                  { label: 'Overall Health', w: '94%', c: '#8ff3ef' },
                  { label: 'Vaccinations', w: '100%', c: '#93f59c' },
                  { label: 'Medications', w: '78%', c: '#fabc4a' },
                  { label: 'Activity Level', w: '85%', c: 'rgba(143,243,239,.6)' },
                ].map(b => (
                  <div key={b.label} className="mb-3.5">
                    <div className="flex justify-between text-[10px] mb-1.5">
                      <span className="text-white/50">{b.label}</span>
                      <span className="font-bold" style={{ color: b.c }}>{b.w}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: b.w, background: b.c }} />
                    </div>
                  </div>
                ))}
                <button
                  className="mt-4 w-full bg-white text-[#006a67] font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export PDF
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const STEPS = [
  { n: '01', icon: Users, head: 'Create your account', body: 'Sign up in under 30 seconds. No credit card needed. Instant access.', primary: true },
  { n: '02', icon: PawPrint, head: 'Add your pet\'s profile', body: 'Name, breed, age, existing records — we guide you every step.', primary: false },
  { n: '03', icon: Activity, head: 'Start tracking', body: 'Log vitals, set reminders, watch your pet\'s health sanctuary grow.', primary: false },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#f0fcfb] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VP}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-[0.18em] uppercase text-[#006a67] mb-3">
            Simple by design
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#131d1e] mb-4"
            style={{ fontFamily: 'Manrope,sans-serif', letterSpacing: '-0.02em' }}
          >
            Up and running in minutes
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#3d4948] text-base max-w-md mx-auto leading-relaxed">
            No steep learning curve. PawHealth feels intuitive from day one.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 relative">
          {/* Desktop connector */}
          <div
            className="hidden md:block absolute top-8 left-[calc(33.33%+20px)] right-[calc(33.33%+20px)] h-px"
            style={{
              background: 'repeating-linear-gradient(90deg,#bdc9c7 0,#bdc9c7 8px,transparent 8px,transparent 18px)',
            }}
          />
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={VP}
              transition={{ delay: i * 0.14 }}
              className="text-center"
            >
              <div className="flex justify-center mb-3">
                {s.primary ? (
                  <div className="ring-pulse relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#006a67,#4fb6b2)' }}
                  >
                    <s.icon className="h-7 w-7 text-white" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#eaf6f5] flex items-center justify-center shadow-sm">
                    <s.icon className="h-7 w-7 text-[#006a67]" />
                  </div>
                )}
              </div>
              <div
                className="text-5xl font-black text-[#d9e5e4] mb-3 leading-none"
                style={{ fontFamily: 'Manrope,sans-serif', letterSpacing: '-0.04em' }}
              >{s.n}</div>
              <h3 className="text-lg font-bold text-[#131d1e] mb-2" style={{ fontFamily: 'Manrope,sans-serif' }}>
                {s.head}
              </h3>
              <p className="text-[#3d4948] text-sm leading-relaxed max-w-[220px] mx-auto">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Clinical Sanctuary (photo collage + copy) ────────────────────────────────
function SanctuarySection() {
  const benefits = [
    { icon: Lock, title: 'Secure cloud storage', sub: '256-bit encryption for all medical PDFs' },
    { icon: Users, title: 'Multi-pet profiles', sub: 'No limit — each pet gets a full dashboard' },
    { icon: Share2, title: 'Direct vet export', sub: 'One-tap PDF generation and instant sharing' },
    { icon: Smartphone, title: 'Works on all devices', sub: 'iOS, Android, and web — always in sync' },
  ];
  return (
    <section className="py-20 sm:py-28 bg-[#eaf6f5] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 xl:gap-24 items-center">

          {/* Masonry collage */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VP}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <div className="bg-white p-2.5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <img src={IMG.cat} alt="Cute cat"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-xl" />
                </div>
                <div className="bg-white p-2.5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <img src={IMG.dogPark} alt="Happy dog in park"
                    referrerPolicy="no-referrer"
                    className="w-full h-52 object-cover rounded-xl" />
                </div>
              </div>
              <div className="flex flex-col gap-4 pt-8">
                <div className="bg-white p-2.5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <img src={IMG.puppy} alt="Golden retriever puppy"
                    referrerPolicy="no-referrer"
                    className="w-full h-52 object-cover rounded-xl" />
                </div>
                <div className="bg-white p-2.5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <img src={IMG.tiny} alt="Small puppy"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-xl" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VP}
          >
            <motion.p variants={fadeUp} className="text-xs font-bold tracking-[0.18em] uppercase text-[#006a67] mb-4">
              Clinical Sanctuary
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl xl:text-[2.8rem] font-black text-[#131d1e] mb-6 leading-tight"
              style={{ fontFamily: 'Manrope,sans-serif', letterSpacing: '-0.02em' }}
            >
              Designed for the modern pet parent.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#3d4948] text-base leading-relaxed mb-10">
              We believe health management shouldn't feel like a chore. PawHealth combines clinical rigour with a soft, editorial interface that makes caring for your pets a genuine pleasure.
            </motion.p>
            <div className="space-y-5">
              {benefits.map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#93f59c] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-[#006e29]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#131d1e] text-sm">{item.title}</p>
                    <p className="text-xs text-[#3d4948] mt-0.5">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS: Testimonial[] = [
  {
    initial: 'A', name: 'Ananya Sharma', sub: '2 dogs · Mumbai', dark: false,
    text: 'PawHealth completely changed how I manage my dogs\' health. The reminder system alone saved me from missing a critical rabies booster. The interface is absolutely stunning.',
  },
  {
    initial: 'P', name: 'Dr. Priya Nair', sub: 'Veterinarian, Bangalore', dark: true,
    text: 'As a vet, I recommend PawHealth to all my clients. The export feature gives me exactly what I need during consultations — no more blank stares when I ask about vaccination dates.',
  },
  {
    initial: 'R', name: 'Rohan Mehta', sub: '3 cats, 1 dog · Pune', dark: false,
    text: 'Managing four pets was chaos before PawHealth. Now I have one calm place for everything and I actually look forward to logging their health data. The design is so relaxing.',
  },
];

function TestimonialsSection() {
  return (
    <section id="reviews" className="py-20 sm:py-28 bg-[#f0fcfb] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VP} className="mb-14">
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-[0.18em] uppercase text-[#006a67] mb-3">
            Pet parents love it
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#131d1e] mb-4"
            style={{ fontFamily: 'Manrope,sans-serif', letterSpacing: '-0.02em' }}
          >
            Words from the sanctuary
          </motion.h2>
          <motion.div variants={fadeUp}
            className="w-16 h-1.5 rounded-full"
            style={{ background: 'linear-gradient(135deg,#006a67,#4fb6b2)' }}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={VP}
              transition={{ delay: i * 0.12 }}
              className="card-lift rounded-3xl p-8"
              style={{ background: t.dark ? '#004442' : '#ffffff' }}
            >
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4"
                    style={{
                      color: t.dark ? '#72d7d2' : '#d69c2c',
                      fill: t.dark ? '#72d7d2' : '#d69c2c',
                    }}
                  />
                ))}
              </div>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: t.dark ? 'rgba(143,243,239,0.8)' : '#3d4948' }}
              >
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    background: t.dark ? 'rgba(143,243,239,0.15)' : '#93f59c',
                    color: t.dark ? '#8ff3ef' : '#006e29',
                  }}
                >
                  {t.initial}
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ fontFamily: 'Manrope,sans-serif', color: t.dark ? '#ffffff' : '#131d1e' }}
                  >
                    {t.name}
                  </p>
                  <p className="text-[11px]" style={{ color: t.dark ? 'rgba(143,243,239,0.5)' : '#3d4948' }}>
                    {t.sub}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
const PLANS: Plan[] = [
  {
    name: 'Free', price: '₹0', period: '/mo',
    features: [
      { yes: true, text: '1 pet profile' },
      { yes: true, text: 'Basic health records' },
      { yes: true, text: '3 reminders/month' },
      { yes: false, text: 'PDF exports' },
      { yes: false, text: 'Growth analytics' },
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro', price: '₹299', period: '/mo', badge: 'Most popular',
    features: [
      { yes: true, text: 'Up to 5 pet profiles' },
      { yes: true, text: 'Full records & docs' },
      { yes: true, text: 'Unlimited reminders' },
      { yes: true, text: 'PDF exports' },
      { yes: true, text: 'Growth analytics' },
    ],
    cta: 'Start Free Trial', highlight: true,
  },
  {
    name: 'Clinic', price: '₹799', period: '/mo',
    features: [
      { yes: true, text: 'Unlimited pets' },
      { yes: true, text: 'Team access (5 members)' },
      { yes: true, text: 'Priority vet support' },
      { yes: true, text: 'API access' },
      { yes: true, text: 'Custom branding' },
    ],
    cta: 'Contact Sales',
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#eaf6f5] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VP}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-[0.18em] uppercase text-[#006a67] mb-3">
            Simple pricing
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#131d1e] mb-3"
            style={{ fontFamily: 'Manrope,sans-serif', letterSpacing: '-0.02em' }}
          >
            Start free, grow as you need
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#3d4948] text-base max-w-sm mx-auto">
            No hidden fees. Cancel anytime.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {PLANS.map((p, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={VP}
              transition={{ delay: i * 0.12 }}
              className={`card-lift rounded-3xl p-8 relative ${p.highlight ? 'shadow-[0_24px_60px_rgba(0,68,66,0.28)]' : ''}`}
              style={{ background: p.highlight ? '#004442' : '#ffffff' }}
            >
              {p.badge && (
                <span
                  className="absolute top-5 right-5 text-[10px] font-black px-3 py-1 rounded-full"
                  style={{ background: '#8ff3ef', color: '#004442' }}
                >
                  {p.badge}
                </span>
              )}
              <p
                className="text-[10px] font-bold tracking-[0.18em] uppercase mb-3"
                style={{ color: p.highlight ? 'rgba(143,243,239,0.6)' : '#3d4948' }}
              >
                {p.name}
              </p>
              <div className="mb-7">
                <span
                  className="text-4xl font-black"
                  style={{ fontFamily: 'Manrope,sans-serif', color: p.highlight ? '#ffffff' : '#131d1e' }}
                >
                  {p.price}
                </span>
                <span className="text-sm" style={{ color: p.highlight ? 'rgba(255,255,255,0.4)' : '#3d4948' }}>
                  {p.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-xs">
                    {f.yes
                      ? <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: p.highlight ? '#8ff3ef' : '#006e29' }} />
                      : <Minus className="h-3.5 w-3.5 flex-shrink-0" style={{ color: p.highlight ? 'rgba(255,255,255,0.25)' : '#bdc9c7' }} />
                    }
                    <span style={{
                      color: p.highlight
                        ? (f.yes ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)')
                        : (f.yes ? '#3d4948' : '#bdc9c7'),
                    }}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
              {p.highlight ? (
                <Link to={ROUTES.SIGNUP}>
                  <button
                    className="w-full font-bold text-sm py-3 rounded-2xl text-[#006a67] bg-white hover:bg-[#8ff3ef] transition-colors"
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {p.cta}
                  </button>
                </Link>
              ) : (
                <Link to={p.name === 'Free' ? ROUTES.SIGNUP : ROUTES.LOGIN}>
                  <button
                    className="w-full font-bold text-sm py-3 rounded-2xl text-[#006a67] bg-[#eaf6f5] hover:bg-[#dfebea] transition-colors"
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {p.cta}
                  </button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VP}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="rounded-[2rem] p-12 sm:p-16 lg:p-20 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#006a67 0%,#4fb6b2 100%)' }}
        >
          {/* Decorative paw prints */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.07]">
            <PawPrint className="absolute text-white" style={{ width: 200, height: 200, top: -40, left: -40, transform: 'rotate(12deg)' }} />
            <Heart className="absolute text-white" style={{ width: 160, height: 160, bottom: -30, right: -30, transform: 'rotate(-15deg)' }} />
          </div>

          <div className="relative z-10">
            <h2
              className="text-3xl sm:text-5xl xl:text-6xl font-black text-white mb-5 leading-tight"
              style={{ fontFamily: 'Manrope,sans-serif', letterSpacing: '-0.025em' }}
            >
              Start your sanctuary today.
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Join 12,000+ pet parents who have upgraded their care experience. Free forever — upgrade when you're ready.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to={ROUTES.SIGNUP}>
                <button
                  className="bg-white text-[#006a67] font-black text-base px-10 py-4 rounded-2xl shadow-xl hover:bg-[#f0fcfb] transition-all active:scale-95 w-full sm:w-auto"
                  style={{ border: 'none', cursor: 'pointer', fontFamily: 'Manrope,sans-serif' }}
                >
                  Create Free Account
                </button>
              </Link>
              <button
                className="text-white font-bold text-base px-10 py-4 rounded-2xl transition-all active:scale-95 w-full sm:w-auto"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              >
                Book a Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function FooterSection() {
  const footerLinks = {
    Platform: ['Features', 'Security', 'Pricing', 'Mobile App'],
    Resources: ['Help Center', 'Vet Directory', 'Health Blog', 'API Docs'],
  };
  return (
    <footer className="bg-[#eaf6f5] pt-16 pb-10 px-4 sm:px-6 lg:px-8 border-t border-[#bdc9c7]/25">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-12 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-4">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006a67] to-[#4fb6b2] flex items-center justify-center">
                <PawPrint className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black text-[#004442]" style={{ fontFamily: 'Manrope,sans-serif' }}>
                PawHealth
              </span>
            </div>
            <p className="text-[#3d4948] text-sm leading-relaxed max-w-xs mb-6">
              Elevating pet healthcare through breathable precision and editorial design. The standard for modern veterinary care management.
            </p>
            <div className="flex gap-3">
              {[Globe, Mail, Share2].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-xl bg-[#dfebea] flex items-center justify-center text-[#3d4948] hover:bg-[#4fb6b2] hover:text-white transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="col-span-1 lg:col-span-2">
              <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#131d1e] mb-5">{heading}</h4>
              <ul className="space-y-3">
                {links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-[#3d4948] hover:text-[#006a67] transition-colors no-underline font-medium">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 lg:col-span-4">
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#131d1e] mb-5">Newsletter</h4>
            <p className="text-sm text-[#3d4948] leading-relaxed mb-4">
              Clinical updates and pet health tips, delivered monthly. No spam, ever.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-white border border-[#bdc9c7]/40 rounded-2xl px-4 py-2.5 text-sm text-[#131d1e] focus:outline-none focus:border-[#006a67] focus:ring-2 focus:ring-[#006a67]/15 transition-all"
              />
              <button
                className="shimmer-cta px-4 py-2.5 rounded-2xl text-sm whitespace-nowrap"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#bdc9c7]/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#3d4948] font-medium">© 2026 PawHealth Clinical Sanctuary. Built with precision.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map(l => (
              <a key={l} href="#" className="text-xs text-[#3d4948] hover:text-[#006a67] transition-colors no-underline font-medium">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ROOT EXPORT
// ══════════════════════════════════════════════════════════════════════════════
const Landing = () => {
  return (
    <>
      {/* Inject global keyframes + utility classes */}
      <style>{KEYFRAMES}</style>

      <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <Navbar />
        <main>
          <HeroSection />
          <TrustBar />
          <StatsSection />
          <FeaturesSection />
          <HowItWorksSection />
          <SanctuarySection />
          <TestimonialsSection />
          <PricingSection />
          <CTASection />
        </main>
        <FooterSection />
      </div>
    </>
  );
};

export default Landing;