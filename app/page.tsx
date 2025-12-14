"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Heart,
  LineChart,
  Lock,
  MessageCircle,
  Shield,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

// Animated counter component
function AnimatedCounter({ end, duration = 2, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);
  
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  const dashboardHref = user?.role === "coach"
    ? "/coach/dashboard"
    : user?.role === "client"
    ? "/client/dashboard"
    : user?.role === "admin"
    ? "/admin/dashboard"
    : "/";

  const features = [
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Track weight, BMI, and vital metrics with beautiful charts and insights.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Stay connected with instant messaging between coaches and clients.",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: ClipboardCheck,
      title: "Custom Plans",
      description: "Create personalized nutrition and workout plans for every client.",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: ShoppingBag,
      title: "Marketplace",
      description: "Sell supplements, meal plans, and equipment directly to clients.",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Get detailed insights with comprehensive dashboards and reports.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with encrypted data and HIPAA compliance.",
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Account",
      description: "Sign up as a coach or client in under 2 minutes. No credit card required.",
      icon: UserCheck,
    },
    {
      number: "02",
      title: "Set Goals",
      description: "Define your health objectives and preferences for personalized guidance.",
      icon: Target,
    },
    {
      number: "03",
      title: "Track Progress",
      description: "Log metrics, complete tasks, and watch your transformation unfold.",
      icon: LineChart,
    },
    {
      number: "04",
      title: "Achieve Results",
      description: "Reach your goals with continuous support and real-time feedback.",
      icon: Sparkles,
    },
  ];

  const stats = [
    { value: 100, suffix: "+", label: "Active Coaches" },
    { value: 2000, suffix: "+", label: "Happy Clients" },
    { value: 7000, suffix: "+", label: "Goals Achieved" },
    { value: 99, suffix: "%", label: "Satisfaction Rate" },
  ];

  return (
    <main className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__bg" />
        <div className="landing-hero__glow landing-hero__glow--1" />
        <div className="landing-hero__glow landing-hero__glow--2" />
        
        <div className="landing-hero__container">
          <motion.div
            className="landing-hero__content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="landing-hero__badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Sparkles size={14} />
              <span>The Future of Health Coaching</span>
            </motion.div>

            <motion.h1
              className="landing-hero__title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Transform Health Journeys
              <span className="landing-hero__title-gradient"> with PulseLedger</span>
            </motion.h1>

            <motion.p
              className="landing-hero__subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              The all-in-one platform connecting health coaches and clients. 
              Track progress, manage plans, and achieve wellness goals together.
            </motion.p>

            <motion.div
              className="landing-hero__actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              {user ? (
                <Link href={dashboardHref} className="landing-btn landing-btn--primary">
                  Go to Dashboard
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link href="/auth/register" className="landing-btn landing-btn--primary">
                    Get Started Free
                    <ArrowRight size={18} />
                  </Link>
                  <Link href="/auth/login" className="landing-btn landing-btn--secondary">
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>

            <motion.div
              className="landing-hero__trust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <div className="landing-hero__trust-item">
                <CheckCircle2 size={16} />
                <span>Free to start</span>
              </div>
              <div className="landing-hero__trust-item">
                <Shield size={16} />
                <span>HIPAA Compliant</span>
              </div>
              <div className="landing-hero__trust-item">
                <Users size={16} />
                <span>Trusted by 100+ coaches</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="landing-hero__visual"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: "easeOut" }}
          >
            <div className="landing-hero__card landing-hero__card--main">
              <div className="landing-hero__card-header">
                <div className="landing-hero__card-avatar">
                  <Heart size={20} className="text-white" />
                </div>
                <div>
                  <div className="landing-hero__card-title">Health Dashboard</div>
                  <div className="landing-hero__card-subtitle">Live tracking</div>
                </div>
              </div>
              <div className="landing-hero__card-stats">
                <div className="landing-hero__stat">
                  <span className="landing-hero__stat-value">-8.5 kg</span>
                  <span className="landing-hero__stat-label">Weight Lost</span>
                </div>
                <div className="landing-hero__stat">
                  <span className="landing-hero__stat-value">92%</span>
                  <span className="landing-hero__stat-label">Goal Progress</span>
                </div>
              </div>
              <div className="landing-hero__card-chart">
                <svg viewBox="0 0 200 60" className="landing-hero__chart-svg">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 50 Q 25 45, 50 35 T 100 25 T 150 15 T 200 10"
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    className="landing-hero__chart-line"
                  />
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <path
                    d="M0 50 Q 25 45, 50 35 T 100 25 T 150 15 T 200 10 V 60 H 0 Z"
                    fill="url(#chartGradient)"
                  />
                </svg>
              </div>
            </div>

            <motion.div
              className="landing-hero__card landing-hero__card--floating landing-hero__card--float1"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Activity size={18} className="text-emerald-500" />
              <span>+15% this week</span>
            </motion.div>

            <motion.div
              className="landing-hero__card landing-hero__card--floating landing-hero__card--float2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Zap size={18} className="text-amber-500" />
              <span>Goal achieved!</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats">
        <div className="landing-container">
          <div className="landing-stats__grid">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="landing-stats__item"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="landing-stats__value">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="landing-stats__label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-container">
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="landing-section-tag">Features</span>
            <h2 className="landing-section-title">
              Everything you need to succeed
            </h2>
            <p className="landing-section-subtitle">
              Powerful tools designed for health coaches and their clients to 
              collaborate, track, and achieve goals together.
            </p>
          </motion.div>

          <div className="landing-features__grid">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="landing-feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className={`landing-feature-card__icon bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="landing-feature-card__title">{feature.title}</h3>
                <p className="landing-feature-card__text">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Coaches & Clients Section */}
      <section className="landing-roles">
        <div className="landing-container">
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="landing-section-tag">Who It's For</span>
            <h2 className="landing-section-title">Built for everyone</h2>
            <p className="landing-section-subtitle">
              Whether you're a coach managing clients or working toward your own wellness goals.
            </p>
          </motion.div>

          <div className="landing-roles__grid">
            <motion.div
              className="landing-role-card landing-role-card--coach"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="landing-role-card__badge">For Coaches</div>
              <h3 className="landing-role-card__title">
                Grow your coaching business
              </h3>
              <p className="landing-role-card__text">
                Manage clients, create plans, track revenue, and scale your health coaching 
                practice with powerful tools.
              </p>
              <ul className="landing-role-card__list">
                <li><CheckCircle2 size={18} /> Unlimited client profiles</li>
                <li><CheckCircle2 size={18} /> Plan templates & customization</li>
                <li><CheckCircle2 size={18} /> Revenue & subscription tracking</li>
                <li><CheckCircle2 size={18} /> Real-time progress monitoring</li>
                <li><CheckCircle2 size={18} /> Built-in marketplace</li>
              </ul>
              {!user && (
                <Link href="/auth/register" className="landing-role-card__link">
                  Start as Coach <ChevronRight size={16} />
                </Link>
              )}
            </motion.div>

            <motion.div
              className="landing-role-card landing-role-card--client"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="landing-role-card__badge">For Clients</div>
              <h3 className="landing-role-card__title">
                Achieve your health goals
              </h3>
              <p className="landing-role-card__text">
                Get personalized guidance, stay accountable, and track your transformation 
                with expert support.
              </p>
              <ul className="landing-role-card__list">
                <li><CheckCircle2 size={18} /> Custom fitness & nutrition plans</li>
                <li><CheckCircle2 size={18} /> Progress logs & visual charts</li>
                <li><CheckCircle2 size={18} /> Direct chat with your coach</li>
                <li><CheckCircle2 size={18} /> Task completion tracking</li>
                <li><CheckCircle2 size={18} /> Shop supplements & products</li>
              </ul>
              {!user && (
                <Link href="/auth/register" className="landing-role-card__link">
                  Start as Client <ChevronRight size={16} />
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="landing-steps">
        <div className="landing-container">
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="landing-section-tag">How It Works</span>
            <h2 className="landing-section-title">Get started in minutes</h2>
            <p className="landing-section-subtitle">
              Our intuitive platform makes health coaching and client management effortless.
            </p>
          </motion.div>

          <div className="landing-steps__grid">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="landing-step"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="landing-step__number">{step.number}</div>
                <div className="landing-step__icon">
                  <step.icon size={24} />
                </div>
                <h3 className="landing-step__title">{step.title}</h3>
                <p className="landing-step__text">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="landing-trust">
        <div className="landing-container">
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="landing-section-tag">Security</span>
            <h2 className="landing-section-title">Your data is safe with us</h2>
            <p className="landing-section-subtitle">
              Enterprise-grade security and privacy protection for your health data.
            </p>
          </motion.div>

          <div className="landing-trust__grid">
            <motion.div
              className="landing-trust-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.5 }}
            >
              <div className="landing-trust-item__icon">
                <Shield size={28} />
              </div>
              <h3 className="landing-trust-item__title">End-to-End Encryption</h3>
              <p className="landing-trust-item__text">
                All data encrypted using industry-standard TLS protocols.
              </p>
            </motion.div>

            <motion.div
              className="landing-trust-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="landing-trust-item__icon">
                <Lock size={28} />
              </div>
              <h3 className="landing-trust-item__title">Role-Based Access</h3>
              <p className="landing-trust-item__text">
                Strict access controls ensure data privacy for all users.
              </p>
            </motion.div>

            <motion.div
              className="landing-trust-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="landing-trust-item__icon">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="landing-trust-item__title">HIPAA Compliant</h3>
              <p className="landing-trust-item__text">
                Following strict health data regulations for your protection.
              </p>
            </motion.div>

            <motion.div
              className="landing-trust-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="landing-trust-item__icon">
                <Activity size={28} />
              </div>
              <h3 className="landing-trust-item__title">99.9% Uptime</h3>
              <p className="landing-trust-item__text">
                Reliable infrastructure monitored 24/7 for your peace of mind.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta__bg" />
        <div className="landing-container">
          <motion.div
            className="landing-cta__content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="landing-cta__title">
              Ready to transform your health journey?
            </h2>
            <p className="landing-cta__text">
              Join thousands of coaches and clients already achieving their wellness goals. 
              Start your free account today.
            </p>
            <div className="landing-cta__actions">
              {user ? (
                <Link href={dashboardHref} className="landing-btn landing-btn--white">
                  Go to Dashboard
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link href="/auth/register" className="landing-btn landing-btn--white">
                    Get Started Free
                    <ArrowRight size={18} />
                  </Link>
                  <Link href="/auth/login" className="landing-btn landing-btn--outline-white">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <p className="landing-cta__note">
              No credit card required • Free plan available
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}