"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Dumbbell,
  Utensils,
  TrendingUp,
  MessageCircle,
  ShoppingBag,
  BarChart3,
  Shield,
  Users,
  Target,
  Zap,
} from "lucide-react";

/* ── Transformation carousel data ── */
const transformations = [
  {
    name: "Patrick",
    before: "/images/exercise1.jpg",
    after: "/images/exercise2.jpg",
    weightBefore: "140 kg",
    weightAfter: "80 kg",
  },
  {
    name: "Sophia",
    before: "/images/exercise3.jpg",
    after: "/images/exercise1.jpg",
    weightBefore: "58 kg",
    weightAfter: "54 kg",
  },
  {
    name: "James",
    before: "/images/exercise2.jpg",
    after: "/images/exercise3.jpg",
    weightBefore: "105 kg",
    weightAfter: "82 kg",
  },
];

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuresGridRef = useRef<HTMLDivElement | null>(null);

  const dashboardHref =
    user?.role === "coach"
      ? "/coach/dashboard"
      : user?.role === "client"
      ? "/client/dashboard"
      : user?.role === "admin"
      ? "/admin/dashboard"
      : "/";

  const nextSlide = useCallback(
    () => setCurrentSlide((i) => (i + 1) % transformations.length),
    []
  );
  const prevSlide = useCallback(
    () =>
      setCurrentSlide(
        (i) => (i - 1 + transformations.length) % transformations.length
      ),
    []
  );

  useEffect(() => {
    const id = setInterval(nextSlide, 5000);
    return () => clearInterval(id);
  }, [nextSlide]);

  const scrollFeatureCards = useCallback((direction: "prev" | "next") => {
    const grid = featuresGridRef.current;
    if (!grid) return;
    const amount = Math.round(grid.clientWidth * 0.8);
    grid.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  }, []);

  /* ── Data ── */
  const features = [
    {
      icon: Dumbbell,
      title: "Custom Workouts",
      text: "Personalized workout routines crafted for every body type and goal.",
    },
    {
      icon: Utensils,
      title: "Nutrition Plans",
      text: "Macro-optimized meal plans designed by certified coaches.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      text: "Visual charts and insights that keep you motivated every day.",
    },
    {
      icon: MessageCircle,
      title: "1-on-1 Coaching",
      text: "Real-time chat with your coach for guidance and accountability.",
    },
    {
      icon: ShoppingBag,
      title: "Marketplace",
      text: "Shop supplements, gear, and plans from top coaches.",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      text: "Detailed dashboards so coaches and clients see every metric.",
    },
  ];

  const steps = [
    { num: "01", title: "Sign Up", text: "Create a free account in under 2 minutes." },
    { num: "02", title: "Set Goals", text: "Tell us your targets — we'll build the roadmap." },
    { num: "03", title: "Get Your Plan", text: "Receive workouts and nutrition tailored to you." },
    { num: "04", title: "See Results", text: "Track progress and celebrate every milestone." },
  ];

  /* ── Render ── */
  return (
    <main className="hp">
      {/* ===== HERO ===== */}
      <section className="hp-hero">
        <div className="hp-hero__bg" />
        <div className="hp-hero__inner">
          {/* Text */}
          <motion.div
            className="hp-hero__text"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hp-hero__title">
              Transform Health Journeys
              <span className="hp-hero__title-accent"> with FitCoach</span>
            </h1>
            <p className="hp-hero__sub">
              Personalized coaching to help you reach your health &amp; fitness goals.
            </p>
            <div className="hp-hero__actions">
              {user ? (
                <Link href={dashboardHref} className="hp-btn hp-btn--primary">
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link href="/auth/register" className="hp-btn hp-btn--primary">
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <Link href="/auth/login" className="hp-btn hp-btn--secondary hp-hero__signin">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <motion.div
              className="hp-hero__trust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <div className="hp-hero__trust-item">
                <CheckCircle2 size={16} />
                <span>Free to start</span>
              </div>
              <div className="hp-hero__trust-item">
                <Shield size={16} />
                <span>HIPAA Compliant</span>
              </div>
              <div className="hp-hero__trust-item">
                <Users size={16} />
                <span>Trusted by 100+ coaches</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            className="hp-hero__img"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.9 }}
          >
            <Image
              src="/images/hero.png"
              alt="Fitness couple"
              width={620}
              height={600}
              priority
              className="hp-hero__photo"
            />
          </motion.div>
        </div>

        {/* Angled divider */}
        <div className="hp-hero__divider" />
      </section>

      {/* ===== FEATURES ===== */}
      <section className="hp-features">
        <div className="hp-container">
          <motion.div
            className="hp-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="hp-section-title">
              Everything You Need to <span>Succeed</span>
            </h2>
            <p className="hp-section-sub">
              Powerful tools for coaches and clients to collaborate, track, and
              crush goals together.
            </p>
          </motion.div>

          <div className="hp-features__grid" ref={featuresGridRef}>
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="hp-feature"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <div className="hp-feature__icon">
                  <f.icon size={26} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="hp-features__nav" aria-label="Feature slides navigation">
            <button
              type="button"
              className="hp-features__nav-btn"
              onClick={() => scrollFeatureCards("prev")}
              aria-label="Previous feature"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="hp-features__nav-btn"
              onClick={() => scrollFeatureCards("next")}
              aria-label="Next feature"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ===== REAL RESULTS (carousel) ===== */}
      <section className="hp-results">
        <div className="hp-results__bg-top" />
        <div className="hp-container">
          <motion.h2
            className="hp-section-title hp-section-title--center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Real <span>Results</span>
          </motion.h2>

          <div className="hp-carousel">
            <button
              className="hp-carousel__arrow hp-carousel__arrow--left"
              onClick={prevSlide}
              aria-label="Previous"
            >
              <ChevronLeft size={32} />
            </button>

            <div className="hp-carousel__track">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  className="hp-carousel__slide"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.45 }}
                >
                  <div className="hp-carousel__images">
                    <div className="hp-carousel__img-wrapper">
                      <Image
                        src={transformations[currentSlide].before}
                        alt={`${transformations[currentSlide].name} before`}
                        width={900}
                        height={1200}
                        sizes="(max-width: 768px) 45vw, 240px"
                        className="hp-carousel__img"
                      />
                    </div>
                    <div className="hp-carousel__img-wrapper">
                      <Image
                        src={transformations[currentSlide].after}
                        alt={`${transformations[currentSlide].name} after`}
                        width={900}
                        height={1200}
                        sizes="(max-width: 768px) 45vw, 240px"
                        className="hp-carousel__img"
                      />
                    </div>
                  </div>
                  <h3 className="hp-carousel__name">
                    {transformations[currentSlide].name}
                  </h3>
                  <p className="hp-carousel__weight">
                    {transformations[currentSlide].weightBefore}{" "}
                    <span>→</span>{" "}
                    {transformations[currentSlide].weightAfter}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              className="hp-carousel__arrow hp-carousel__arrow--right"
              onClick={nextSlide}
              aria-label="Next"
            >
              <ChevronRight size={32} />
            </button>
          </div>

          {/* Dots */}
          <div className="hp-carousel__dots">
            {transformations.map((_, i) => (
              <button
                key={i}
                className={`hp-carousel__dot${i === currentSlide ? " active" : ""}`}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="hp-results__bg-bot" />
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="hp-steps">
        <div className="hp-container">
          <motion.div
            className="hp-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="hp-section-title">
              How It <span>Works</span>
            </h2>
          </motion.div>

          <div className="hp-steps__grid">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className="hp-step"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
              >
                <span className="hp-step__num">{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOR COACHES & CLIENTS ===== */}
      <section className="hp-roles">
        <div className="hp-container">
          <motion.div
            className="hp-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="hp-section-title">
              Built for <span>Everyone</span>
            </h2>
          </motion.div>

          <div className="hp-roles__grid">
            {/* Coach card */}
            <motion.div
              className="hp-role hp-role--coach"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="hp-role__badge">For Coaches</div>
              <h3>Grow your coaching business</h3>
              <ul>
                <li><CheckCircle2 size={16} /> Unlimited client profiles</li>
                <li><CheckCircle2 size={16} /> Custom workout &amp; diet plans</li>
                <li><CheckCircle2 size={16} /> Revenue tracking</li>
                <li><CheckCircle2 size={16} /> Built-in marketplace</li>
              </ul>
              {!user && (
                <Link href="/auth/register" className="hp-role__link">
                  Start as Coach <ChevronRight size={16} />
                </Link>
              )}
            </motion.div>

            {/* Client card */}
            <motion.div
              className="hp-role hp-role--client"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <div className="hp-role__badge">For Clients</div>
              <h3>Achieve your health goals</h3>
              <ul>
                <li><CheckCircle2 size={16} /> Personalized routines</li>
                <li><CheckCircle2 size={16} /> Diet &amp; meal plans</li>
                <li><CheckCircle2 size={16} /> Progress charts</li>
                <li><CheckCircle2 size={16} /> Direct chat with coach</li>
              </ul>
              {!user && (
                <Link href="/auth/register" className="hp-role__link">
                  Start as Client <ChevronRight size={16} />
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== GALLERY STRIP ===== */}
      <section className="hp-gallery">
        <div className="hp-gallery__track">
          {["/images/exercise1.jpg", "/images/exercise2.jpg", "/images/exercise3.jpg", "/images/exercise1.jpg", "/images/exercise2.jpg", "/images/exercise3.jpg"].map(
            (src, i) => (
              <div key={i} className="hp-gallery__item">
                <Image
                  src={src}
                  alt="Training"
                  width={900}
                  height={1200}
                  sizes="220px"
                  className="hp-gallery__img"
                />
              </div>
            )
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="hp-cta">
        <div className="hp-container">
          <motion.div
            className="hp-cta__inner"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Transform Your Health Journey?</h2>
            <p>
              Join thousands of coaches and clients already achieving their wellness goals.
              Start your free account today.
            </p>
            <div className="hp-cta__actions">
              {user ? (
                <Link href={dashboardHref} className="hp-btn hp-btn--primary hp-btn--lg">
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link href="/auth/register" className="hp-btn hp-btn--primary hp-btn--lg">
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <Link href="/auth/login" className="hp-btn hp-btn--secondary hp-btn--lg">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <span className="hp-cta__note">No credit card required</span>
          </motion.div>
        </div>
      </section>
    </main>
  );
}