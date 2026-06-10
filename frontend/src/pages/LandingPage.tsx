import { useState, useEffect, useMemo, useCallback, type FormEvent, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, Award, GraduationCap, ChevronRight,
  Star, Phone, Mail, MapPin, ArrowRight, Moon, Sun, Menu, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    grade: '',
    message: ''
  });

  // Handle scroll with throttling for performance
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll for anchor links
  const handleSmoothScroll = useCallback((e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMenuOpen(false);
    }
  }, []);

  // Handle form submission
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormStatus({ type: 'error', message: 'Please fill in all required fields' });
      setTimeout(() => setFormStatus({ type: '', message: '' }), 3000);
      return;
    }

    setFormStatus({ type: 'sending', message: 'Sending...' });
    
    // Simulate API call (replace with actual endpoint)
    setTimeout(() => {
      setFormStatus({ type: 'success', message: 'Thank you! We\'ll contact you soon.' });
      setFormData({ name: '', phone: '', grade: '', message: '' });
      setTimeout(() => setFormStatus({ type: '', message: '' }), 4000);
    }, 1500);
  };

  // Memoized data to prevent unnecessary re-renders
  const stats = useMemo(() => [
    { label: 'Current Students', value: '1,247', icon: Users },
    { label: 'Faculty Members', value: '84', icon: GraduationCap },
    { label: 'Years Established', value: '18', icon: Award },
    { label: 'Huffaz Graduates', value: '312', icon: BookOpen },
  ], []);

  const sections = useMemo(() => [
    { name: 'Early Years', desc: 'Play-based Islamic foundation for children ages 2-5, focusing on social skills and basic Arabic.', icon: '🌱', color: 'from-green-400 to-emerald-600' },
    { name: 'Primary School', desc: 'Strong academic foundation in core subjects with integrated Islamic studies and Quran reading.', icon: '📚', color: 'from-blue-400 to-indigo-600' },
    { name: 'Junior Secondary', desc: 'Comprehensive JSS curriculum preparing students for senior secondary with character development.', icon: '🏫', color: 'from-purple-400 to-violet-600' },
    { name: 'Senior Secondary', desc: 'SS 1-3 intensive preparation for WAEC, NECO, and university entrance examinations.', icon: '🎓', color: 'from-rose-400 to-pink-600' },
    { name: 'Islamic Sciences', desc: 'Deep study of Quran, Hadith, Fiqh, and Arabic language for religious scholarship.', icon: '☪️', color: 'from-amber-400 to-orange-600' },
    { name: 'Tahfiz Program', desc: 'Complete Quran memorization in 2-3 years under certified Huffaz with daily progress tracking.', icon: '📖', color: 'from-teal-400 to-emerald-600' },
  ], []);

  const features = useMemo(() => [
    { title: 'Parent Communication', desc: 'Real-time SMS alerts for attendance, grades, and school events', icon: '📱' },
    { title: 'Digital Report Cards', desc: 'Computer-generated termly reports with detailed performance analytics', icon: '📊' },
    { title: 'Tahfiz Dashboard', desc: 'Track memorization progress with weekly assessment reports', icon: '📈' },
    { title: 'Online Payments', desc: 'Secure fee payment via Paystack with instant receipt generation', icon: '💳' },
    { title: 'Modern Labs', desc: 'Fully equipped science and computer laboratories', icon: '🔬' },
    { title: 'Boarding Facilities', desc: 'Separate hostels for boys and girls with 24/7 supervision', icon: '🏘️' },
  ], []);

  const testimonials = useMemo(() => [
    { name: 'Alhaji Musa Bello', role: 'Parent of SS3 Student', text: 'My daughter finished with 8 distinctions and completed her Hifz. The transformation in her character is remarkable.', rating: 5, location: 'Kaduna' },
    { name: 'Hajiya Aisha Usman', role: 'Parent of Primary 5 Student', text: 'The school portal keeps me updated on everything from attendance to homework. Best decision for my son.', rating: 5, location: 'Abuja' },
    { name: 'Ibrahim Sadiq', role: 'Alumni 2022', text: 'Currently studying Medicine. The foundation from Darul Hikmah gave me discipline and academic excellence.', rating: 5, location: 'Kano' },
  ], []);

  const contactInfo = useMemo(() => [
    { icon: MapPin, label: 'Visit Us', value: 'Tudun Wada, Kaduna State', detail: 'Open Mon-Fri, 8am - 4pm' },
    { icon: Phone, label: 'Call Us', value: '+234 916 591 3821', detail: 'Admissions hotline available' },
    { icon: Mail, label: 'Email', value: 'info@darulhikmah.edu.ng', detail: 'Responses within 24 hours' },
  ], []);

  return (
    <div className={`${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-800'} transition-colors duration-300`}>
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? theme === 'dark' 
            ? 'bg-slate-950/90 backdrop-blur-lg border-b border-slate-800 shadow-lg' 
            : 'bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group" onClick={(e) => handleSmoothScroll(e, 'hero')}>
            <div className="relative">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">
                DH
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"></div>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm tracking-tight">Darul Hikmah</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Science & Tech Academy</div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {['About', 'Programs', 'Admissions', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                onClick={(e) => handleSmoothScroll(e, item.toLowerCase())}
                className={`transition-colors hover:text-emerald-500 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                theme === 'dark' 
                  ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Portal Button */}
            <Link 
              to="/login"
              className="hidden md:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all hover:scale-105"
            >
              Staff Portal <ArrowRight size={16} />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-lg transition-all ${
                theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={`md:hidden border-t py-4 px-4 space-y-3 ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {['About', 'Programs', 'Admissions', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={(e) => handleSmoothScroll(e, item.toLowerCase())}
                className={`block py-2 text-sm font-medium transition-colors hover:text-emerald-500 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {item}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg w-full"
            >
              Staff Portal <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className={`relative min-h-screen flex items-center pt-16 overflow-hidden ${
        theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
      }`}>
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 text-xs font-medium px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Established 2007
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Where</span>{' '}
                <span className="text-emerald-500">Knowledge</span>{' '}
                <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Means</span>{' '}
                <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>Responsibility</span>
              </h1>
              
              <p className="text-base md:text-lg leading-relaxed text-slate-500 max-w-md">
                Darul Hikmah combines academic excellence with Islamic values. Our students consistently rank among the best in national examinations.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-4">
                <Link
                  to="/login"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-lg transition-all hover:scale-105 inline-flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  Apply Now <ChevronRight size={18} />
                </Link>
                <a
                  href="#programs"
                  onClick={(e) => handleSmoothScroll(e, 'programs')}
                  className={`border-2 font-medium px-6 py-3 rounded-lg transition-all hover:scale-105 ${
                    theme === 'dark'
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  View Programs
                </a>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-6 pt-6 flex-wrap">
                {[
                  { label: '98% Pass Rate', icon: '✓' },
                  { label: '312 Huffaz', icon: '✓' },
                  { label: '15+ Awards', icon: '✓' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold text-sm">✓</span>
                    <span className="text-xs font-medium text-slate-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="hidden md:block relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className={`p-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                      DH
                    </div>
                    <div>
                      <div className="font-bold">Student Dashboard</div>
                      <div className="text-xs text-emerald-500">Term 1, 2025</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Attendance', value: '96%', color: 'emerald', width: '96%' },
                      { label: 'Exam Average', value: '78%', color: 'indigo', width: '78%' },
                      { label: 'Hifz Progress', value: '18/30 Juz', color: 'amber', width: '60%' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-${item.color}-500`} 
                            style={{ width: item.width }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t dark:border-slate-700">
                    {[
                      { label: 'Subjects', value: '8' },
                      { label: 'Assignments', value: '12' },
                      { label: 'Rank', value: '#3' },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="font-bold text-lg">{item.value}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                ⭐ Top School 2025
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 border-y ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto">
                    <Icon size={20} className="text-emerald-500" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className={`py-20 ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-block bg-emerald-500/10 text-emerald-600 text-xs font-medium px-3 py-1 rounded-full mb-3">
              Our Programs
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Six Pathways to Success</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">From early years to advanced Islamic studies, we nurture every child's potential.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sections.map((sec, idx) => (
              <div
                key={idx}
                className={`group p-6 rounded-xl border transition-all hover:-translate-y-1 cursor-default ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${sec.color} flex items-center justify-center text-xl mb-4 shadow-lg`}>
                  {sec.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{sec.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{sec.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-emerald-500 text-xs font-medium">
                  Learn More <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className={`py-20 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-indigo-500/10 text-indigo-500 text-xs font-medium px-3 py-1 rounded-full">
                Why Choose Us
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Technology Meets Tradition</h2>
              <p className="text-slate-500 leading-relaxed">
                We've built a school management system that keeps parents informed and students motivated. Real-time updates, digital records, and complete transparency.
              </p>
              
              <div className="space-y-3">
                {features.map((feat, idx) => (
                  <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-white'
                  }`}>
                    <div className="text-xl">{feat.icon}</div>
                    <div>
                      <div className="font-medium text-sm">{feat.title}</div>
                      <div className="text-xs text-slate-500">{feat.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Student-Teacher Ratio', value: '15:1', desc: 'Personalized attention' },
                { label: 'Graduate Success', value: '94%', desc: 'University admission rate' },
                { label: 'Tahfiz Completion', value: '3 Yrs', desc: 'Average completion time' },
                { label: 'Parent Satisfaction', value: '96%', desc: 'Annual survey result' },
              ].map((item, idx) => (
                <div key={idx} className={`p-5 rounded-xl border ${
                  theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-white'
                }`}>
                  <div className="text-2xl font-bold text-emerald-500 mb-1">{item.value}</div>
                  <div className="font-medium text-sm mb-1">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-20 ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-500/10 text-amber-500 text-xs font-medium px-3 py-1 rounded-full mb-3">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">From Parents & Alumni</h2>
            <p className="text-slate-500">Real stories from our school community</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-xl border ${
                  theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 italic text-slate-600">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t dark:border-slate-800">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions CTA */}
      <section id="admissions" className="py-16 bg-gradient-to-r from-emerald-600 to-emerald-700 relative overflow-hidden">
        <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22 opacity=%220.05%22%3E%3Cpath fill=%22white%22 d=%22M10,10 L90,10 L90,90 L10,90 Z%22%3E%3C/path%3E%3C/svg%3E')] bg-repeat`}></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Begin Your Child's Journey</h2>
          <p className="text-emerald-100 text-base mb-6 max-w-xl mx-auto">
            Admissions open for 2025/2026 session. Limited spaces available in our Tahfiz program.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/login"
              className="bg-white text-emerald-600 font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              Apply Online <ArrowRight size={18} />
            </Link>
            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, 'contact')}
              className="border-2 border-white/30 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-all"
            >
              Request Info
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`py-20 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="inline-block bg-emerald-500/10 text-emerald-500 text-xs font-medium px-3 py-1 rounded-full">
                Get In Touch
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">We're Here to Help</h2>
              <p className="text-slate-500">Visit our campus or reach out to our admissions team. We're available Monday through Friday.</p>
              
              <div className="space-y-4">
                {contactInfo.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className={`flex gap-4 p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-slate-800' : 'bg-white'
                    }`}>
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-emerald-500" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{item.label}</div>
                        <div className="font-medium">{item.value}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Contact Form */}
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <h3 className="font-bold text-xl mb-4">Send a Message</h3>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'
                    }`}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                    Grade of Interest
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="">Select a grade</option>
                    <option>Nursery (2-5 years)</option>
                    <option>Primary 1-6</option>
                    <option>JSS 1-3</option>
                    <option>SS 1-3</option>
                    <option>Tahfiz Program</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  ></textarea>
                </div>
                
                {formStatus.message && (
                  <div className={`text-sm text-center py-2 rounded-lg ${
                    formStatus.type === 'success' ? 'text-emerald-500 bg-emerald-500/10' : 
                    formStatus.type === 'error' ? 'text-red-500 bg-red-500/10' : 'text-slate-500'
                  }`}>
                    {formStatus.message}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={formStatus.type === 'sending'}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formStatus.type === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 border-t ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-800'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  DH
                </div>
                <div>
                  <div className="text-white text-sm font-bold">Darul Hikmah Academy</div>
                  <div className="text-[9px] text-slate-500 font-mono">Science & Technology</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 text-xs text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">Staff Login →</Link>
            </div>
          </div>
          
          <div className="text-center text-[10px] text-slate-600 pt-6 mt-6 border-t dark:border-slate-800">
            © 2007-{new Date().getFullYear()} Darul Hikmah Science & Technology Academy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};