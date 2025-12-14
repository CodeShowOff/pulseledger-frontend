"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";
import getErrorMessage from "@/lib/getErrorMessage";
import Link from "next/link";
import Image from "next/image";
import { 
  Instagram, Facebook, Twitter, Linkedin, Youtube, Globe, Phone, Mail,
  MapPin, Calendar, Award, Users, FileText, ShoppingBag, Star, 
  ChevronRight, ChevronLeft, CheckCircle2, Sparkles, TrendingUp,
  Clock, Target, Heart, ArrowRight, Send
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import "./coach-profile.css";

interface PublicCoachProfileResponse {
  success: boolean;
  data?: {
    coach: {
      id: string;
      fullName: string;
      email: string;
      phone?: string | null;
      avatarUrl?: string | null;
      specialization?: string | null;
      experienceYears?: number | null;
      bio?: string | null;
      description?: string | null;
      address?: {
        city?: string | null;
        state?: string | null;
      } | null;
      memberSince?: string | null;
      referralCode: string;
      socialMedia?: {
        instagram?: string | null;
        facebook?: string | null;
        twitter?: string | null;
        linkedin?: string | null;
        youtube?: string | null;
        website?: string | null;
      } | null;
      awards?: Array<{
        url: string;
        publicId: string;
        uploadedAt: string;
      }>;
      transformations?: Array<{
        url: string;
        publicId: string;
        uploadedAt: string;
      }>;
    };
    stats: {
      clientsCount: number;
      plansCount: number;
      productsCount: number;
    };
    plans: Array<{
      _id: string;
      title: string;
      description?: string;
      durationWeeks?: number;
      price?: number;
      createdAt?: string;
    }>;
  };
  message?: string;
}

function PublicCoachProfileContent() {
  const params = useParams<{ referralCode: string }>();
  const referralCode = params?.referralCode;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PublicCoachProfileResponse["data"] | null>(null);
  const [contactFormData, setContactFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    height: "",
    weight: "",
    age: "",
    gender: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const contactFormRef = useRef<HTMLDivElement>(null);
  const [activeGalleryTab, setActiveGalleryTab] = useState<"awards" | "transformations">("transformations");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [progressData, setProgressData] = useState<Array<{ week: string; avgBMI: number }>>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!referralCode) {
      setError("Coach not found");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await api.get<PublicCoachProfileResponse>(
          `/coach/public-profile/${encodeURIComponent(referralCode)}`
        );
        if (!cancelled) {
          if (!res.data.success || !res.data.data) {
            setError(res.data.message || "Coach not found");
          } else {
            setProfile(res.data.data);
            try {
              const progressRes = await api.get(`/coach/public-profile/${encodeURIComponent(referralCode)}/progress`);
              if (progressRes.data && Array.isArray(progressRes.data)) {
                setProgressData(progressRes.data);
              }
            } catch {
              // Progress data not available
            }
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Unable to load coach profile."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [referralCode]);

  const handleJoinClick = () => {
    const existingParams = new URLSearchParams(searchParams?.toString() || "");
    existingParams.set("coach", referralCode || "");
    router.push(`/auth/register?${existingParams.toString()}`);
  };

  const scrollToContactForm = () => {
    contactFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);
    try {
      await api.post("/contact-requests", {
        ...contactFormData,
        height: contactFormData.height ? Number(contactFormData.height) : null,
        weight: contactFormData.weight ? Number(contactFormData.weight) : null,
        age: Number(contactFormData.age),
        referralCode,
      });
      setSubmitSuccess(true);
      setContactFormData({
        firstName: "", lastName: "", email: "", phone: "",
        height: "", weight: "", age: "", gender: "", message: "",
      });
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to submit. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const galleryItems = activeGalleryTab === "awards" 
    ? (profile?.coach.awards || []) 
    : (profile?.coach.transformations || []);

  const nextGallerySlide = () => {
    setGalleryIndex((prev) => (prev + 1) % Math.max(1, galleryItems.length));
  };

  const prevGallerySlide = () => {
    setGalleryIndex((prev) => (prev - 1 + galleryItems.length) % Math.max(1, galleryItems.length));
  };

  if (loading) {
    return (
      <div className="cpp-loading">
        <div className="cpp-loading__spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="cpp-error">
        <div className="cpp-error__content">
          <h1>Oops!</h1>
          <p>{error || "Coach not found."}</p>
          <Link href="/" className="cpp-btn cpp-btn--primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { coach, stats, plans } = profile;
  const location = [coach.address?.city, coach.address?.state].filter(Boolean).join(", ");
  const hasSocialLinks = coach.socialMedia && Object.values(coach.socialMedia).some(Boolean);
  const hasGalleryItems = (coach.awards?.length || 0) > 0 || (coach.transformations?.length || 0) > 0;

  return (
    <div className={`cpp ${isVisible ? 'cpp--visible' : ''}`}>
      {/* Hero Section */}
      <section className="cpp-hero">
        <div className="cpp-hero__bg">
          <div className="cpp-hero__gradient" />
          <div className="cpp-hero__pattern" />
        </div>
        
        <div className="cpp-hero__content">
          <div className="cpp-hero__avatar-wrapper">
            {coach.avatarUrl ? (
              <Image
                src={coach.avatarUrl}
                alt={coach.fullName}
                width={180}
                height={180}
                className="cpp-hero__avatar"
                priority
              />
            ) : (
              <div className="cpp-hero__avatar cpp-hero__avatar--placeholder">
                {coach.fullName?.[0]?.toUpperCase() || "C"}
              </div>
            )}
            <div className="cpp-hero__verified">
              <CheckCircle2 size={24} />
            </div>
          </div>

          <div className="cpp-hero__info">
            <div className="cpp-hero__badge">
              <Sparkles size={14} />
              <span>PulseLedger Certified Coach</span>
            </div>
            
            <h1 className="cpp-hero__name">{coach.fullName}</h1>
            
            <p className="cpp-hero__tagline">
              {coach.specialization || "Fitness & Wellness Coach"}
            </p>

            <div className="cpp-hero__meta">
              {location && (
                <span className="cpp-hero__meta-item">
                  <MapPin size={16} />
                  {location}
                </span>
              )}
              {coach.experienceYears && (
                <span className="cpp-hero__meta-item">
                  <Clock size={16} />
                  {coach.experienceYears}+ Years Experience
                </span>
              )}
              {coach.memberSince && (
                <span className="cpp-hero__meta-item">
                  <Calendar size={16} />
                  Member since {new Date(coach.memberSince).getFullYear()}
                </span>
              )}
            </div>

            <div className="cpp-hero__actions">
              <button onClick={scrollToContactForm} className="cpp-btn cpp-btn--primary cpp-btn--lg">
                <Send size={18} />
                Get in Touch
              </button>
              <button onClick={handleJoinClick} className="cpp-btn cpp-btn--secondary cpp-btn--lg">
                Join with {coach.fullName.split(" ")[0]}
                <ArrowRight size={18} />
              </button>
            </div>

            {hasSocialLinks && (
              <div className="cpp-hero__social">
                {coach.socialMedia?.instagram && (
                  <a href={coach.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="cpp-social-link" title="Instagram">
                    <Instagram size={20} />
                  </a>
                )}
                {coach.socialMedia?.facebook && (
                  <a href={coach.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="cpp-social-link" title="Facebook">
                    <Facebook size={20} />
                  </a>
                )}
                {coach.socialMedia?.twitter && (
                  <a href={coach.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="cpp-social-link" title="Twitter">
                    <Twitter size={20} />
                  </a>
                )}
                {coach.socialMedia?.linkedin && (
                  <a href={coach.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="cpp-social-link" title="LinkedIn">
                    <Linkedin size={20} />
                  </a>
                )}
                {coach.socialMedia?.youtube && (
                  <a href={coach.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="cpp-social-link" title="YouTube">
                    <Youtube size={20} />
                  </a>
                )}
                {coach.socialMedia?.website && (
                  <a href={coach.socialMedia.website} target="_blank" rel="noopener noreferrer" className="cpp-social-link" title="Website">
                    <Globe size={20} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="cpp-stats">
        <div className="cpp-stats__container">
          <div className="cpp-stats__item">
            <div className="cpp-stats__icon">
              <Users size={24} />
            </div>
            <div className="cpp-stats__content">
              <span className="cpp-stats__number">{stats.clientsCount}</span>
              <span className="cpp-stats__label">Happy Clients</span>
            </div>
          </div>
          <div className="cpp-stats__divider" />
          <div className="cpp-stats__item">
            <div className="cpp-stats__icon">
              <FileText size={24} />
            </div>
            <div className="cpp-stats__content">
              <span className="cpp-stats__number">{stats.plansCount}</span>
              <span className="cpp-stats__label">Custom Plans</span>
            </div>
          </div>
          <div className="cpp-stats__divider" />
          <div className="cpp-stats__item">
            <div className="cpp-stats__icon">
              <ShoppingBag size={24} />
            </div>
            <div className="cpp-stats__content">
              <span className="cpp-stats__number">{stats.productsCount}</span>
              <span className="cpp-stats__label">Products</span>
            </div>
          </div>
          {coach.experienceYears && (
            <>
              <div className="cpp-stats__divider" />
              <div className="cpp-stats__item">
                <div className="cpp-stats__icon">
                  <Award size={24} />
                </div>
                <div className="cpp-stats__content">
                  <span className="cpp-stats__number">{coach.experienceYears}+</span>
                  <span className="cpp-stats__label">Years Exp.</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="cpp-main">
        {/* About Section */}
        {(coach.description || coach.bio) && (
          <section className="cpp-section cpp-about">
            <div className="cpp-section__header">
              <h2 className="cpp-section__title">
                <Heart size={24} />
                About Me
              </h2>
            </div>
            <div className="cpp-about__content">
              {coach.description && (
                <div className="cpp-about__text">
                  <p>{coach.description}</p>
                </div>
              )}
              {coach.bio && coach.bio !== coach.description && (
                <div className="cpp-about__text cpp-about__text--secondary">
                  <p>{coach.bio}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Gallery Section - Awards & Transformations */}
        {hasGalleryItems && (
          <section className="cpp-section cpp-gallery">
            <div className="cpp-section__header">
              <h2 className="cpp-section__title">
                <Star size={24} />
                Achievements & Results
              </h2>
              <div className="cpp-gallery__tabs">
                {(coach.transformations?.length || 0) > 0 && (
                  <button
                    className={`cpp-gallery__tab ${activeGalleryTab === 'transformations' ? 'cpp-gallery__tab--active' : ''}`}
                    onClick={() => { setActiveGalleryTab('transformations'); setGalleryIndex(0); }}
                  >
                    <TrendingUp size={18} />
                    Transformations
                  </button>
                )}
                {(coach.awards?.length || 0) > 0 && (
                  <button
                    className={`cpp-gallery__tab ${activeGalleryTab === 'awards' ? 'cpp-gallery__tab--active' : ''}`}
                    onClick={() => { setActiveGalleryTab('awards'); setGalleryIndex(0); }}
                  >
                    <Award size={18} />
                    Awards
                  </button>
                )}
              </div>
            </div>
            
            <div className="cpp-gallery__carousel">
              <button className="cpp-gallery__nav cpp-gallery__nav--prev" onClick={prevGallerySlide} disabled={galleryItems.length <= 1}>
                <ChevronLeft size={24} />
              </button>
              
              <div className="cpp-gallery__viewport">
                {galleryItems.length > 0 && (
                  <div className="cpp-gallery__slide">
                    <Image
                      src={galleryItems[galleryIndex]?.url}
                      alt={activeGalleryTab === 'awards' ? 'Award' : 'Transformation'}
                      width={600}
                      height={400}
                      className="cpp-gallery__image"
                    />
                  </div>
                )}
              </div>
              
              <button className="cpp-gallery__nav cpp-gallery__nav--next" onClick={nextGallerySlide} disabled={galleryItems.length <= 1}>
                <ChevronRight size={24} />
              </button>
            </div>
            
            {galleryItems.length > 1 && (
              <div className="cpp-gallery__dots">
                {galleryItems.map((_, idx) => (
                  <button
                    key={idx}
                    className={`cpp-gallery__dot ${idx === galleryIndex ? 'cpp-gallery__dot--active' : ''}`}
                    onClick={() => setGalleryIndex(idx)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Plans Section */}
        {plans && plans.length > 0 && (
          <section className="cpp-section cpp-plans">
            <div className="cpp-section__header">
              <h2 className="cpp-section__title">
                <Target size={24} />
                Training Plans
              </h2>
              <p className="cpp-section__subtitle">
                Personalized programs designed to help you achieve your goals
              </p>
            </div>
            
            <div className="cpp-plans__grid">
              {plans.map((plan) => (
                <div key={plan._id} className="cpp-plan-card">
                  <div className="cpp-plan-card__header">
                    <h3 className="cpp-plan-card__title">{plan.title}</h3>
                    {plan.durationWeeks && (
                      <span className="cpp-plan-card__duration">
                        <Clock size={14} />
                        {plan.durationWeeks} weeks
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="cpp-plan-card__description">{plan.description}</p>
                  )}
                  <div className="cpp-plan-card__footer">
                    {plan.price != null && (
                      <span className="cpp-plan-card__price">₹{plan.price.toLocaleString()}</span>
                    )}
                    <button onClick={scrollToContactForm} className="cpp-btn cpp-btn--outline cpp-btn--sm">
                      Get Started
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Progress Chart */}
        {progressData && progressData.length > 0 && (
          <section className="cpp-section cpp-progress">
            <div className="cpp-section__header">
              <h2 className="cpp-section__title">
                <TrendingUp size={24} />
                Client Progress
              </h2>
              <p className="cpp-section__subtitle">
                Average BMI improvements across all clients
              </p>
            </div>
            
            <div className="cpp-progress__chart">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBMIPublic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.98)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgBMI"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorBMIPublic)"
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section ref={contactFormRef} id="contact-form" className="cpp-section cpp-contact">
          <div className="cpp-contact__wrapper">
            <div className="cpp-contact__info">
              <h2 className="cpp-contact__title">Let's Start Your Journey</h2>
              <p className="cpp-contact__description">
                Ready to transform your life? Get in touch and let's discuss how I can help you achieve your fitness goals.
              </p>
              
              <div className="cpp-contact__methods">
                {coach.phone && (
                  <a href={`tel:${coach.phone}`} className="cpp-contact__method">
                    <div className="cpp-contact__method-icon">
                      <Phone size={24} />
                    </div>
                    <div className="cpp-contact__method-info">
                      <span className="cpp-contact__method-label">Call me</span>
                      <span className="cpp-contact__method-value">{coach.phone}</span>
                    </div>
                  </a>
                )}
                <a href={`mailto:${coach.email}`} className="cpp-contact__method">
                  <div className="cpp-contact__method-icon">
                    <Mail size={24} />
                  </div>
                  <div className="cpp-contact__method-info">
                    <span className="cpp-contact__method-label">Email me</span>
                    <span className="cpp-contact__method-value">{coach.email}</span>
                  </div>
                </a>
              </div>

              <div className="cpp-contact__cta">
                <p>Use my referral code to join:</p>
                <div className="cpp-contact__referral">
                  <span>{coach.referralCode}</span>
                </div>
              </div>
            </div>

            <div className="cpp-contact__form-wrapper">
              {submitSuccess && (
                <div className="cpp-alert cpp-alert--success">
                  <CheckCircle2 size={20} />
                  <span>Message sent successfully! I'll get back to you soon.</span>
                </div>
              )}

              <form onSubmit={handleContactFormSubmit} className="cpp-form">
                <div className="cpp-form__row">
                  <div className="cpp-form__group">
                    <label className="cpp-form__label">First Name *</label>
                    <input
                      type="text"
                      required
                      maxLength={50}
                      className="cpp-form__input"
                      value={contactFormData.firstName}
                      onChange={(e) => setContactFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="cpp-form__group">
                    <label className="cpp-form__label">Last Name *</label>
                    <input
                      type="text"
                      required
                      maxLength={50}
                      className="cpp-form__input"
                      value={contactFormData.lastName}
                      onChange={(e) => setContactFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="cpp-form__row">
                  <div className="cpp-form__group">
                    <label className="cpp-form__label">Email</label>
                    <input
                      type="email"
                      className="cpp-form__input"
                      value={contactFormData.email}
                      onChange={(e) => setContactFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="cpp-form__group">
                    <label className="cpp-form__label">Phone *</label>
                    <input
                      type="tel"
                      required
                      className="cpp-form__input"
                      value={contactFormData.phone}
                      onChange={(e) => setContactFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="cpp-form__row cpp-form__row--triple">
                  <div className="cpp-form__group">
                    <label className="cpp-form__label">Age *</label>
                    <input
                      type="number"
                      required
                      min="10"
                      max="120"
                      className="cpp-form__input"
                      value={contactFormData.age}
                      onChange={(e) => setContactFormData(prev => ({ ...prev, age: e.target.value }))}
                    />
                  </div>
                  <div className="cpp-form__group">
                    <label className="cpp-form__label">Height (cm)</label>
                    <input
                      type="number"
                      min="50"
                      max="300"
                      className="cpp-form__input"
                      value={contactFormData.height}
                      onChange={(e) => setContactFormData(prev => ({ ...prev, height: e.target.value }))}
                    />
                  </div>
                  <div className="cpp-form__group">
                    <label className="cpp-form__label">Weight (kg)</label>
                    <input
                      type="number"
                      min="20"
                      max="500"
                      className="cpp-form__input"
                      value={contactFormData.weight}
                      onChange={(e) => setContactFormData(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="cpp-form__group">
                  <label className="cpp-form__label">Gender *</label>
                  <select
                    required
                    className="cpp-form__input cpp-form__select"
                    value={contactFormData.gender}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="cpp-form__group">
                  <label className="cpp-form__label">Message *</label>
                  <textarea
                    required
                    rows={4}
                    maxLength={1000}
                    className="cpp-form__input cpp-form__textarea"
                    placeholder="Tell me about your fitness goals..."
                    value={contactFormData.message}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, message: e.target.value }))}
                  />
                  <span className="cpp-form__char-count">{contactFormData.message.length}/1000</span>
                </div>

                <button type="submit" className="cpp-btn cpp-btn--primary cpp-btn--full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="cpp-btn__spinner" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function PublicCoachProfilePage() {
  return (
    <Suspense fallback={
      <div className="cpp-loading">
        <div className="cpp-loading__spinner" />
        <p>Loading profile...</p>
      </div>
    }>
      <PublicCoachProfileContent />
    </Suspense>
  );
}
