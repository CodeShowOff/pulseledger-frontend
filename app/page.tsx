"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import {
  Activity,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  LineChart,
  Lock,
  MessageCircle,
  Shield,
  ShoppingBag,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  const dashboardHref = user?.role === "coach"
    ? "/coach/dashboard"
    : user?.role === "client"
    ? "/client/dashboard"
    : user?.role === "admin"
    ? "/admin/dashboard"
    : "/";

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero__inner">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="home-hero__title"
          >
            Transform Health Journeys with{" "}
            <span style={{ color: "#3b82f6" }}>
              PulseLedger
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="home-hero__subtitle"
          >
            Connecting health coaches and clients.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="home-hero__actions"
          >
            {user ? (
              <Link href={dashboardHref} className="home-hero__primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/register" className="home-hero__primary">
                  Get Started Free
                </Link>
                <Link href="/auth/login" className="home-hero__secondary">
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="home-hero__trust"
          >
            <div className="home-hero__trust-item">
              <CheckCircle2 size={18} />
              <span>No credit card required</span>
            </div>
            <div className="home-hero__trust-item">
              <Shield size={18} />
              <span>HIPAA compliant</span>
            </div>
            <div className="home-hero__trust-item">
              <Users size={18} />
              <span>Trusted by 100+ coaches</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="home-section home-section--alt">
        <div className="home-section__inner">
          <header className="home-section__header">
            <h2 className="home-section__title">
              Everything You Need to Succeed
            </h2>
            <p className="home-section__subtitle">
              PulseLedger provides powerful tools for coaches and clients to
              collaborate, track progress, and achieve health goals efficiently.
            </p>
          </header>

          <motion.div 
            className="home-feature-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
          >
            <motion.div 
              className="home-feature-card"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="home-feature-card__icon">
                <TrendingUp size={22} />
              </div>
              <h3 className="home-feature-card__title">Progress Tracking</h3>
              <p className="home-feature-card__text">
                Monitor weight, BMI, body measurements, and other vital metrics
                with intuitive charts and historical data visualization.
              </p>
            </motion.div>

            <motion.div 
              className="home-feature-card"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="home-feature-card__icon">
                <ShoppingBag size={22} />
              </div>
              <h3 className="home-feature-card__title">
                Product Marketplace
              </h3>
              <p className="home-feature-card__text">
                Coaches can list supplements, meal plans, or equipment. Clients
                can browse and order directly through the platform.
              </p>
            </motion.div>

            <motion.div 
              className="home-feature-card"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="home-feature-card__icon">
                <BarChart3 size={22} />
              </div>
              <h3 className="home-feature-card__title">Analytics Dashboard</h3>
              <p className="home-feature-card__text">
                Gain insights with comprehensive stats, client trends, revenue
                reports, and subscription analytics—all in one place.
              </p>
            </motion.div>

            <motion.div 
              className="home-feature-card"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="home-feature-card__icon">
                <Lock size={22} />
              </div>
              <h3 className="home-feature-card__title">Secure & Private</h3>
              <p className="home-feature-card__text">
                Enterprise-grade security with encrypted data, role-based
                access, and full compliance with health data regulations.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* For Coaches & Clients Section */}
      <section className="home-section">
        <div className="home-section__inner">
          <header className="home-section__header">
            <h2 className="home-section__title">Built for Everyone</h2>
            <p className="home-section__subtitle">
              Whether you're a coach managing multiple clients or a client
              working towards your wellness goals, PulseLedger has you covered.
            </p>
          </header>

          <motion.div 
            className="home-role-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
          >
            <motion.div 
              className="home-role-card"
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
              }}
            >
              <h3 className="home-role-card__title">For Coaches</h3>
              <p className="home-role-card__text">
                Streamline client management, automate plan creation, track
                revenue from subscriptions and product sales, and grow your
                coaching business with powerful analytics.
              </p>
              <ul className="home-role-card__list">
                <li>✓ Unlimited client profiles</li>
                <li>✓ Plan templates & customization</li>
                <li>✓ Revenue & subscription tracking</li>
                <li>✓ Real-time progress monitoring</li>
              </ul>
            </motion.div>

            <motion.div 
              className="home-role-card"
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
              }}
            >
              <h3 className="home-role-card__title">For Clients</h3>
              <p className="home-role-card__text">
                Get personalized guidance, stay accountable with daily tasks,
                track your progress visually, and communicate seamlessly with
                your dedicated coach.
              </p>
              <ul className="home-role-card__list">
                <li>✓ Custom fitness & nutrition plans</li>
                <li>✓ Progress logs & visual charts</li>
                <li>✓ Task completion tracking</li>
                <li>✓ Order supplements & products</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="home-section home-section--alt">
        <div className="home-section__inner">
          <header className="home-section__header">
            <h2 className="home-section__title">How PulseLedger Works</h2>
            <p className="home-section__subtitle">
              Get started in minutes. Our intuitive platform makes health
              coaching and client management effortless.
            </p>
          </header>

          <motion.ol 
            className="home-steps"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
          >
            <motion.li 
              className="home-step"
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
              }}
            >
              <span className="home-step__badge">Step 1</span>
              <h3 className="home-step__title">Sign Up</h3>
              <p className="home-step__text">
                Create your free account as a coach or client. Set up your
                profile and preferences in under 2 minutes.
              </p>
            </motion.li>
            <motion.li 
              className="home-step"
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
              }}
            >
              <span className="home-step__badge">Step 2</span>
              <h3 className="home-step__title">Create or Join Plans</h3>
              <p className="home-step__text">
                Coaches design custom plans with tasks, nutrition guides, and
                goals. Clients subscribe to plans and get instant access.
              </p>
            </motion.li>
            <motion.li 
              className="home-step"
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
              }}
            >
              <span className="home-step__badge">Step 3</span>
              <h3 className="home-step__title">Track Progress</h3>
              <p className="home-step__text">
                Log daily metrics like weight, measurements, and achievements.
                Watch your progress visualized with charts and trends.
              </p>
            </motion.li>
            <motion.li 
              className="home-step"
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
              }}
            >
              <span className="home-step__badge">Step 4</span>
              <h3 className="home-step__title">Achieve Goals Together</h3>
              <p className="home-step__text">
                Stay motivated with ongoing support, task reminders, and
                real-time feedback from your coach—all in one place.
              </p>
            </motion.li>
          </motion.ol>
        </div>
      </section>

      {/* Why Choose PulseLedger Section */}
      <section className="home-section">
        <div className="home-section__inner">
          <header className="home-section__header">
            <h2 className="home-section__title">
              Why Choose PulseLedger?
            </h2>
            <p className="home-section__subtitle">
              We've built the most comprehensive, user-friendly platform for
              health coaching—backed by security, scalability, and support.
            </p>
          </header>

          <ul className="home-reasons">
            <li className="home-reason">
              <span className="home-reason__dot">●</span>
              <span>
                <strong>All-in-One Solution:</strong> No need to juggle
                spreadsheets, messaging apps, and payment tools. Everything is
                integrated seamlessly.
              </span>
            </li>
            <li className="home-reason">
              <span className="home-reason__dot">●</span>
              <span>
                <strong>Real-Time Collaboration:</strong> Instant
                notifications, task updates, and progress syncing keep coaches
                and clients connected.
              </span>
            </li>
            <li className="home-reason">
              <span className="home-reason__dot">●</span>
              <span>
                <strong>Data-Driven Insights:</strong> Advanced analytics help
                coaches optimize plans and clients visualize their health
                journey.
              </span>
            </li>
            <li className="home-reason">
              <span className="home-reason__dot">●</span>
              <span>
                <strong>Flexible Subscriptions:</strong> Offer monthly,
                quarterly, or custom subscription models—clients can upgrade or
                pause anytime.
              </span>
            </li>
            <li className="home-reason">
              <span className="home-reason__dot">●</span>
              <span>
                <strong>Mobile-Friendly:</strong> Access your dashboard,
                track progress, and communicate on any device—desktop, tablet,
                or phone.
              </span>
            </li>
            <li className="home-reason">
              <span className="home-reason__dot">●</span>
              <span>
                <strong>Enterprise Security:</strong> Your data is encrypted
                end-to-end. We comply with HIPAA and GDPR standards for health
                data privacy.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="home-section home-section--alt">
        <div className="home-section__inner">
          <header className="home-section__header">
            <h2 className="home-section__title">Trust & Security First</h2>
            <p className="home-section__subtitle">
              Your health data deserves the highest level of protection. We
              take security seriously.
            </p>
          </header>

          <div className="home-trust-grid">
            <div className="home-trust-card">
              <Shield size={28} style={{ color: "#2563eb" }} />
              <h3 className="home-trust-card__title">
                End-to-End Encryption
              </h3>
              <p className="home-trust-card__text">
                All data transmitted between your device and our servers is
                encrypted using industry-standard TLS protocols.
              </p>
            </div>

            <div className="home-trust-card">
              <Lock size={28} style={{ color: "#2563eb" }} />
              <h3 className="home-trust-card__title">
                Role-Based Access Control
              </h3>
              <p className="home-trust-card__text">
                Coaches see only their clients. Clients see only their data.
                Admins have audited oversight capabilities.
              </p>
            </div>

            <div className="home-trust-card">
              <CheckCircle2 size={28} style={{ color: "#2563eb" }} />
              <h3 className="home-trust-card__title">HIPAA Compliant</h3>
              <p className="home-trust-card__text">
                We follow strict health data regulations to ensure your
                personal information remains private and secure.
              </p>
            </div>

            <div className="home-trust-card">
              <Activity size={28} style={{ color: "#2563eb" }} />
              <h3 className="home-trust-card__title">
                99.9% Uptime Guarantee
              </h3>
              <p className="home-trust-card__text">
                Our infrastructure is monitored 24/7 to ensure your coaching
                business runs without interruption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="home-section home-cta">
        <div className="home-section__inner home-cta__inner">
          <div className="home-cta__content">
            <h2 className="home-section__title">
              Ready to Transform Your Health Journey?
            </h2>
            <p className="home-section__subtitle">
              Join hundreds of coaches and thousands of clients already using
              PulseLedger to achieve their wellness goals. Start your free
              account today—no credit card required.
            </p>
            <div className="home-cta__actions">
              {user ? (
                <Link href={dashboardHref} className="home-hero__primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/register" className="home-hero__primary">
                    Get Started Free
                  </Link>
                  <Link href="/auth/login" className="home-hero__secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}