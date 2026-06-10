import { useState, useEffect, useMemo, useCallback, type FormEvent, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, Award, GraduationCap,
  Star, Phone, Mail, MapPin, ArrowRight,
  Moon, Sun, Menu, X, ChevronRight,
  Layers, Cpu, Shield, CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ─── Islamic geometric SVG pattern (inline, no external deps) ─── */
const GeometricPattern = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    width="400" height="400"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    aria-hidden="true"
  >
    <path d="M50 0 L100 50 L50 100 L0 50 Z" stroke="currentColor" strokeWidth="0.4" />
    <path d="M50 10 L90 50 L50 90 L10 50 Z" stroke="currentColor" strokeWidth="0.3" />
    <path d="M50 20 L80 50 L50 80 L20 50 Z" stroke="currentColor" strokeWidth="0.25" />
    <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.3" />
    <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.25" />
    <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.2" />
    <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.2" />
    <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.15" />
    <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.15" />
  </svg>
);

/* ─── Dot grid pattern ─── */
const DotGrid = ({ className = '' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true">
    <defs>
      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="currentColor" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
);

export const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [formData, setFormData]     = useState({ name: '', phone: '', grade: '', message: '' });

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { setScrolled(window.scrollY > 20); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = useCallback((e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false); }
  }, []);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormStatus({ type: 'error', message: 'Please fill in all required fields' });
      setTimeout(() => setFormStatus({ type: '', message: '' }), 3000);
      return;
    }
    setFormStatus({ type: 'sending', message: 'Sending…' });
    setTimeout(() => {
      setFormStatus({ type: 'success', message: "Thank you! We'll be in touch shortly." });
      setFormData({ name: '', phone: '', grade: '', message: '' });
      setTimeout(() => setFormStatus({ type: '', message: '' }), 5000);
    }, 1500);
  };

  const stats = useMemo(() => [
    { label: 'Current Students', value: '1,247', icon: Users,         color: 'text-emerald-500', bg: 'bg-emerald-500/8' },
    { label: 'Faculty Members',  value: '84',    icon: GraduationCap, color: 'text-indigo-500',  bg: 'bg-indigo-500/8'  },
    { label: 'Years of Service', value: '18',    icon: Award,         color: 'text-amber-500',   bg: 'bg-amber-500/8'   },
    { label: 'Huffaz Graduates', value: '312',   icon: BookOpen,      color: 'text-teal-500',    bg: 'bg-teal-500/8'    },
  ], []);

  const programs = useMemo(() => [
    { name: 'Early Years',       desc: 'Play-based Islamic foundation for children ages 2–5.',                  icon: Layers,  tag: 'Ages 2–5',   accent: 'text-green-500',  accentBg: 'bg-green-500/8',  border: 'border-l-green-500' },
    { name: 'Primary School',    desc: 'Core curriculum with integrated Islamic studies and Quran reading.',   icon: BookOpen, tag: 'Pry 1–6',    accent: 'text-blue-500',   accentBg: 'bg-blue-500/8',   border: 'border-l-blue-500'  },
    { name: 'Junior Secondary',  desc: 'Comprehensive JSS curriculum with character development focus.',       icon: Users,    tag: 'JSS 1–3',    accent: 'text-violet-500', accentBg: 'bg-violet-500/8', border: 'border-l-violet-500'},
    { name: 'Senior Secondary',  desc: 'Intensive SS preparation for WAEC, NECO and university entrance.',   icon: Award,    tag: 'SS 1–3',     accent: 'text-rose-500',   accentBg: 'bg-rose-500/8',   border: 'border-l-rose-500'  },
    { name: 'Islamic Sciences',  desc: 'Deep study of Quran, Hadith, Fiqh and Arabic language.',             icon: Shield,   tag: 'All levels', accent: 'text-amber-500',  accentBg: 'bg-amber-500/8',  border: 'border-l-amber-500' },
    { name: 'Tahfiz Program',    desc: 'Complete Quran memorisation in 2–3 years under certified Huffaz.',   icon: GraduationCap, tag: '2–3 yrs', accent: 'text-teal-500',   accentBg: 'bg-teal-500/8',   border: 'border-l-teal-500'  },
  ], []);

  const features = useMemo(() => [
    { title: 'Parent Communication', desc: 'Real-time SMS alerts for attendance, grades, and school events',         icon: Phone },
    { title: 'Digital Report Cards',  desc: 'Computer-generated termly reports with detailed performance analytics', icon: Award },
    { title: 'Tahfiz Dashboard',      desc: 'Track memorisation progress with weekly assessment reports',             icon: BookOpen },
    { title: 'Online Payments',       desc: 'Secure fee payment via Paystack with instant receipt generation',       icon: Cpu },
    { title: 'Modern Laboratories',   desc: 'Fully equipped science and computer laboratories on campus',            icon: Layers },
    { title: 'Boarding Facilities',   desc: 'Separate hostels for boys and girls with 24/7 supervision',            icon: Shield },
  ], []);

  const testimonials = useMemo(() => [
    { name: 'Alhaji Musa Bello',  role: 'Parent · SS3 Student',  text: 'My daughter finished with 8 distinctions and completed her Hifz. The transformation in her character is remarkable.', rating: 5, location: 'Kaduna' },
    { name: 'Hajiya Aisha Usman', role: 'Parent · Primary 5',    text: 'The school portal keeps me updated on everything from attendance to homework. Best decision for my son.', rating: 5, location: 'Abuja' },
    { name: 'Ibrahim Sadiq',      role: 'Alumni 2022',            text: 'Currently studying Medicine at ABU Zaria. The foundation from Darul Hikmah gave me discipline and academic excellence.', rating: 5, location: 'Kano' },
  ], []);

  const contactInfo = useMemo(() => [
    { icon: MapPin, label: 'Location',  value: 'Tudun Wada, Kaduna State',     detail: 'Open Mon–Fri, 8am – 4pm' },
    { icon: Phone,  label: 'Call',      value: '+234 916 591 3821',            detail: 'Admissions hotline available' },
    { icon: Mail,   label: 'Email',     value: 'info@darulhikmah.edu.ng',     detail: 'Response within 24 hours' },
  ], []);

  /* ── computed class tokens ── */
  const navBg = scrolled
    ? isDark ? 'bg-[hsl(222,47%,5%)]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-xl'
             : 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm'
    : 'bg-transparent';

  const inputCls = isDark
    ? 'bg-slate-800/60 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10';

  return (
    <div className={`${isDark ? 'bg-[hsl(222,47%,5%)] text-slate-200' : 'bg-white text-slate-800'} transition-colors duration-300`}>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 md:h-[70px] flex items-center justify-between gap-4">

          {/* Wordmark */}
          <a href="/" className="flex items-center gap-3 group shrink-0" onClick={(e) => handleSmoothScroll(e, 'hero')}>
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:shadow-emerald-600/50 transition-shadow">
                <span className="text-white font-black text-xs tracking-tight">DH</span>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full ring-[1.5px] ring-white dark:ring-[hsl(222,47%,5%)]" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm tracking-tight leading-tight">Darul Hikmah</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">Science & Tech Academy</div>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {['About', 'Programs', 'Admissions', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={(e) => handleSmoothScroll(e, item.toLowerCase())}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${isDark ? 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 text-amber-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <Link
              to="/login"
              className="hidden md:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5"
            >
              Staff Portal <ArrowRight size={15} />
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={`md:hidden border-t px-4 py-4 space-y-1 animate-slide-down ${isDark ? 'bg-[hsl(222,47%,6%)] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
            {['About', 'Programs', 'Admissions', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={(e) => handleSmoothScroll(e, item.toLowerCase())}
                className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                {item}
              </a>
            ))}
            <div className="pt-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-3 px-4 rounded-xl w-full transition-colors"
              >
                Staff Portal <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section id="hero" className={`relative min-h-screen flex items-center pt-16 overflow-hidden ${isDark ? 'bg-[hsl(222,47%,5%)]' : 'bg-slate-50'}`}>
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <GeometricPattern className={`absolute -right-20 top-0 w-[600px] h-[600px] opacity-[0.025] ${isDark ? 'text-white' : 'text-slate-900'}`} />
          <div className={`absolute top-32 right-20 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-emerald-500/6' : 'bg-emerald-400/8'}`} />
          <div className={`absolute -bottom-10 -left-20 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-indigo-500/5' : 'bg-indigo-400/6'}`} />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24 w-full">
          <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-center">

            {/* Left — 3/5 */}
            <div className="md:col-span-3 space-y-7">
              <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Established 2007 · Kaduna, Nigeria
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight">
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>Where </span>
                  <span className="text-emerald-500">Knowledge</span>
                  <br />
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>Meets </span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Responsibility</span>
                </h1>
                <p className={`mt-5 text-base md:text-lg leading-relaxed max-w-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Darul Hikmah combines rigorous academic excellence with deep Islamic values. Our students consistently rank among Nigeria's best in national examinations.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-600/25 inline-flex items-center gap-2"
                >
                  Apply for Admission <ChevronRight size={17} />
                </Link>
                <a
                  href="#programs"
                  onClick={(e) => handleSmoothScroll(e, 'programs')}
                  className={`font-semibold px-6 py-3 rounded-xl border transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  View Programs
                </a>
              </div>

              {/* Trust badges */}
              <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                {['98% WAEC Pass Rate', '312 Huffaz Graduates', 'NECO Best School 2024'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — 2/5: Dashboard preview card */}
            <div className="hidden md:block md:col-span-2">
              <div className={`relative rounded-2xl overflow-hidden border shadow-2xl ${isDark ? 'bg-[hsl(222,47%,9%)] border-white/[0.07]' : 'bg-white border-slate-200/70'}`}>
                {/* Card header */}
                <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                      <span className="text-white font-black text-[10px]">DH</span>
                    </div>
                    <div>
                      <div className="font-bold text-xs">Student Portal</div>
                      <div className="text-[10px] text-emerald-500 font-medium">Term 1, 2025/26</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">● Live</span>
                </div>

                {/* Progress bars */}
                <div className="px-5 py-5 space-y-4">
                  {[
                    { label: 'Attendance',  value: '96%',     pct: '96%',  color: 'bg-emerald-500' },
                    { label: 'Exam Average', value: '78%',   pct: '78%',  color: 'bg-indigo-500' },
                    { label: 'Hifz Progress', value: '18 Juz', pct: '60%', color: 'bg-amber-500' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[11px] mb-1.5">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                      <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: item.pct }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini stats */}
                <div className={`grid grid-cols-3 divide-x border-t ${isDark ? 'border-white/[0.06] divide-white/[0.06]' : 'border-slate-100 divide-slate-100'}`}>
                  {[{ l: 'Subjects', v: '8' }, { l: 'Assignments', v: '12' }, { l: 'Rank', v: '#3' }].map((s) => (
                    <div key={s.l} className="text-center py-4">
                      <div className="font-extrabold text-base">{s.v}</div>
                      <div className={`text-[9px] uppercase tracking-wider mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div className="flex justify-end mt-3">
                <div className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/30">
                  <Star size={10} fill="white" /> Top School Award 2025
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════ */}
      <section className={`py-14 border-y ${isDark ? 'border-white/[0.06] bg-[hsl(222,47%,8%)]' : 'border-slate-100 bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center space-y-3">
                  <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mx-auto`}>
                    <Icon size={20} className={stat.color} />
                  </div>
                  <div className={`text-3xl font-extrabold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
                  <div className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROGRAMS
      ══════════════════════════════════════ */}
      <section id="programs" className={`py-20 ${isDark ? 'bg-[hsl(222,47%,5%)]' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="mb-12">
            <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              <Layers size={12} /> Our Programs
            </div>
            <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Six Pathways to Excellence
            </h2>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              From early years to advanced Islamic scholarship — we nurture every student's full potential.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((prog, idx) => {
              const Icon = prog.icon;
              return (
                <div
                  key={idx}
                  className={`group p-6 rounded-xl border-l-[3px] ${prog.border} border border-l-[3px] transition-all hover:-translate-y-0.5 hover:shadow-md cursor-default ${
                    isDark ? 'border-white/[0.06] bg-[hsl(222,47%,9%)] hover:bg-[hsl(222,47%,11%)]' : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                  style={{ borderLeftWidth: '3px' }}
                >
                  <div className={`w-9 h-9 rounded-lg ${prog.accentBg} flex items-center justify-center mb-4`}>
                    <Icon size={17} className={prog.accent} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{prog.name}</h3>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${prog.accentBg} ${prog.accent}`}>{prog.tag}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{prog.desc}</p>
                  <div className={`mt-4 flex items-center gap-1 text-xs font-semibold ${prog.accent}`}>
                    Learn more <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES / WHY US
      ══════════════════════════════════════ */}
      <section id="about" className={`py-20 ${isDark ? 'bg-[hsl(222,47%,8%)]' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-2 gap-14 items-center">

            {/* Left */}
            <div className="space-y-6">
              <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                <Cpu size={12} /> Why Choose Us
              </div>
              <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Technology Meets Tradition
              </h2>
              <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                We've built a complete school management system that keeps parents informed and students motivated — real-time updates, digital records, and full transparency.
              </p>

              <div className="space-y-2">
                {features.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div key={idx} className={`flex items-start gap-4 p-3.5 rounded-xl transition-colors group ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-white'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5 text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'} transition-colors`}>
                        <Icon size={15} />
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{feat.title}</div>
                        <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{feat.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: metrics grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Student–Teacher Ratio', value: '15:1',  desc: 'Personalised attention',     color: 'text-emerald-500', top: 'border-t-emerald-500' },
                { label: 'Graduate University Rate', value: '94%', desc: 'Successful admissions',      color: 'text-indigo-500',  top: 'border-t-indigo-500'  },
                { label: 'Tahfiz Completion',      value: '3 Yrs', desc: 'Average memorisation time', color: 'text-amber-500',   top: 'border-t-amber-500'  },
                { label: 'Parent Satisfaction',    value: '96%',  desc: 'Annual survey result',       color: 'text-teal-500',    top: 'border-t-teal-500'   },
              ].map((item, idx) => (
                <div key={idx} className={`p-5 rounded-xl border-t-2 ${item.top} border border-t-2 ${isDark ? 'border-white/[0.06] bg-[hsl(222,47%,9%)]' : 'border-slate-200 bg-white'}`}>
                  <div className={`text-2xl font-extrabold ${item.color} tabular-nums`}>{item.value}</div>
                  <div className={`font-semibold text-sm mt-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.label}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section className={`py-20 ${isDark ? 'bg-[hsl(222,47%,5%)]' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="mb-12">
            <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
              <Star size={11} fill="currentColor" /> Testimonials
            </div>
            <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              From Parents &amp; Alumni
            </h2>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Real stories from our school community.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className={`relative p-6 rounded-xl border flex flex-col ${isDark ? 'border-white/[0.06] bg-[hsl(222,47%,9%)]' : 'border-slate-200 bg-slate-50'}`}
              >
                {/* Quote mark */}
                <span className="absolute top-4 right-5 text-5xl font-serif leading-none text-emerald-500/15 select-none">&ldquo;</span>

                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className={`text-sm leading-relaxed flex-1 mb-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>"{t.text}"</p>

                <div className={`flex items-center gap-3 pt-4 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600/30 to-emerald-400/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.name}</div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.role} · {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ADMISSIONS CTA
      ══════════════════════════════════════ */}
      <section id="admissions" className="py-20 bg-emerald-600 relative overflow-hidden">
        {/* Dot grid overlay */}
        <DotGrid className="absolute inset-0 text-white/[0.06]" />
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-[10px] font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Admissions 2025/2026 Open
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Begin Your Child's Journey
          </h2>
          <p className="text-emerald-100 text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Limited spaces remain in our Tahfiz programme and Senior Secondary classes. Apply today to secure your child's place.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/login"
              className="bg-white text-emerald-700 font-bold px-7 py-3.5 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
            >
              Apply Online <ArrowRight size={17} />
            </Link>
            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, 'contact')}
              className="border-2 border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-all"
            >
              Contact Admissions
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CONTACT
      ══════════════════════════════════════ */}
      <section id="contact" className={`py-20 ${isDark ? 'bg-[hsl(222,47%,8%)]' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12">

            {/* Left */}
            <div className="space-y-6">
              <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                <Mail size={12} /> Get In Touch
              </div>
              <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                We're Here to Help
              </h2>
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                Visit our campus or reach out to our admissions team. Available Monday through Friday.
              </p>

              <div className="space-y-3">
                {contactInfo.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className={`flex gap-4 p-4 rounded-xl ${isDark ? 'bg-[hsl(222,47%,9%)] border border-white/[0.06]' : 'bg-white border border-slate-200'}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                        <Icon size={17} className="text-emerald-500" />
                      </div>
                      <div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</div>
                        <div className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.value}</div>
                        <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact form */}
            <div className={`p-6 sm:p-7 rounded-xl border ${isDark ? 'bg-[hsl(222,47%,9%)] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-bold text-lg mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Send a Message</h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {[
                  { label: 'Full Name *', key: 'name', type: 'text',  placeholder: 'Your full name' },
                  { label: 'Phone Number *', key: 'phone', type: 'tel', placeholder: '+234 000 000 0000' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={(formData as any)[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-all ${inputCls}`}
                      required={field.label.includes('*')}
                    />
                  </div>
                ))}

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Grade of Interest
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-all ${inputCls}`}
                  >
                    <option value="">Select a level</option>
                    <option>Nursery (2–5 years)</option>
                    <option>Primary 1–6</option>
                    <option>JSS 1–3</option>
                    <option>SS 1–3</option>
                    <option>Tahfiz Programme</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Any questions or specific requirements…"
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-all resize-none ${inputCls}`}
                  />
                </div>

                {formStatus.message && (
                  <div className={`text-sm text-center py-2.5 rounded-xl font-medium ${
                    formStatus.type === 'success' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400' :
                    formStatus.type === 'error'   ? 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400' :
                    'text-slate-500 bg-slate-50'
                  }`}>
                    {formStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formStatus.type === 'sending'}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm"
                >
                  {formStatus.type === 'sending' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending…
                    </span>
                  ) : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className={`border-t ${isDark ? 'bg-[hsl(222,47%,5%)] border-white/[0.06]' : 'bg-slate-900 border-slate-800'}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <span className="text-white font-black text-[10px]">DH</span>
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Darul Hikmah Academy</div>
                  <div className="text-[9px] text-slate-500 font-mono tracking-widest">Science & Technology</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nurturing academic excellence and Islamic character since 2007 in Kaduna, Nigeria.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Quick Links</p>
              <div className="space-y-2">
                {['About', 'Programs', 'Admissions', 'Contact'].map((l) => (
                  <a key={l} href={`#${l.toLowerCase()}`} onClick={(e) => handleSmoothScroll(e, l.toLowerCase())} className="block text-xs text-slate-400 hover:text-slate-200 transition-colors">{l}</a>
                ))}
              </div>
            </div>

            {/* Contact mini */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Contact</p>
              <div className="space-y-2 text-xs text-slate-400">
                <p>Tudun Wada, Kaduna State</p>
                <p>+234 916 591 3821</p>
                <p>info@darulhikmah.edu.ng</p>
                <Link to="/login" className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors mt-1 font-medium">
                  Staff Portal <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          <div className={`pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-600`}>
            <p>© 2007–{new Date().getFullYear()} Darul Hikmah Science &amp; Technology Academy. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};