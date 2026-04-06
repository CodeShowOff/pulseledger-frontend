"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";
import getErrorMessage from "@/lib/getErrorMessage";
import Link from "next/link";
import Image from "next/image";
import { 
  Instagram, Facebook, Twitter, Linkedin, Youtube, Globe, Phone, Mail,
  MapPin, Calendar, Award, Users, FileText, ShoppingBag, Star, 
  ChevronRight, ChevronLeft, CheckCircle2, Check, Sparkles, TrendingUp,
  Clock, Target, Heart, ArrowRight, Send
} from "lucide-react";
import "./coach-profile.css";

const PublicProgressChart = dynamic<{ data: Array<{ week: string; avgBMI: number }> }>(
  () => import("../../../components/charts/PublicProgressChart"),
  {
  ssr: false,
  loading: () => (
    <div className="cpp-progress__chart">
      <div
        style={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
        }}
      >
        Loading progress chart...
      </div>
    </div>
  ),
}
);

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
      totalReviews: number;
    };
    plans: Array<{
      _id: string;
      title: string;
      description?: string;
      durationWeeks?: number;
      price?: number;
      createdAt?: string;
    }>;
    reviews: Array<{
      _id: string;
      client: {
        fullName: string;
        avatarUrl?: string;
      };
      review: string;
      createdAt: string;
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
  const [awardsIndex, setAwardsIndex] = useState(0);
  const [transformsIndex, setTransformsIndex] = useState(0);
  const [awardsPage, setAwardsPage] = useState(0);
  const [transformsPage, setTransformsPage] = useState(0);
  const [progressData, setProgressData] = useState<Array<{ week: string; avgBMI: number }>>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [reviewsPagination, setReviewsPagination] = useState<any>(null);

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

  // NOTE: autoplay removed — carousels advance only via user controls (navs/dots/switch button).

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

  // Fetch all reviews with pagination
  const fetchAllReviews = async (page: number) => {
    if (!profile?.coach.id) return;
    try {
      const res = await api.get(`/coach-reviews/coach/${profile.coach.id}`, {
        params: { page, limit: 4 },
      });
      setAllReviews(res.data.data.reviews);
      setReviewsPagination(res.data.data.pagination);
    } catch (err) {
      // console.error("Failed to fetch reviews:", err);
    }
  };

  // Fetch reviews when profile loads or page changes
  useEffect(() => {
    if (profile?.coach.id) {
      fetchAllReviews(reviewsPage);
    }
  }, [profile?.coach.id, reviewsPage]);

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
  const coachFirstName = coach.fullName?.trim().split(/\s+/)[0] || "Coach";
  const joinWithLabel = `Join with ${coachFirstName}`;

  return (
    <div className={`cpp ${isVisible ? 'cpp--visible' : ''}`}>
      {/* Hero Section */}
      <section className="cpp-hero">
        <div className="cpp-hero__bg">
          <div className="cpp-hero__gradient" />
          <div className="cpp-hero__pattern" />
        </div>

        {/* Cover/banner placeholder - replaceable by actual image */}
        <div className="cpp-hero__cover" />

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
              <Check size={22} strokeWidth={3} />
            </div>
          </div>

          <div className="cpp-hero__info">
            <div className="cpp-hero__badge">
              <Sparkles size={14} />
              <span>FitCoach Certified Coach</span>
            </div>
            
            <h1 className="cpp-hero__name">{coach.fullName}</h1>

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

            {/* actions moved below into the CTA row located above the stats section */}

          </div>
        </div>
      </section>

      {/* CTA Row (buttons moved out of hero) */}
      <div className="cpp-cta">
        <div className="cpp-cta__container">
          <button onClick={scrollToContactForm} className="cpp-btn cpp-btn--primary cpp-btn--lg">
            <Send size={18} />
            Get in Touch
          </button>
          <button onClick={handleJoinClick} className="cpp-btn cpp-btn--secondary cpp-btn--lg" title={joinWithLabel}>
            <span className="cpp-cta__join-text">{joinWithLabel}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <section className="cpp-stats">
        <div className="cpp-stats__container">
          <div className="cpp-stats__item">
            <div className="cpp-stats__icon cpp-stats__icon--clients">
              <Users size={24} />
            </div>
            <div className="cpp-stats__content">
              <span className="cpp-stats__number">{stats.clientsCount}</span>
              <span className="cpp-stats__label">Happy Clients</span>
            </div>
          </div>
          <div className="cpp-stats__divider" />
          <div className="cpp-stats__item">
            <div className="cpp-stats__icon cpp-stats__icon--plans">
              <FileText size={24} />
            </div>
            <div className="cpp-stats__content">
              <span className="cpp-stats__number">{stats.plansCount}</span>
              <span className="cpp-stats__label">Custom Plans</span>
            </div>
          </div>
          <div className="cpp-stats__divider" />
          <div className="cpp-stats__item">
            <div className="cpp-stats__icon cpp-stats__icon--products">
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
                <div className="cpp-stats__icon cpp-stats__icon--experience">
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
        {(coach.description || coach.bio || hasSocialLinks) && (
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

              {hasSocialLinks && (
                <div className="cpp-about__social">
                  {coach.socialMedia?.instagram && (
                    <a href={coach.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="cpp-social-link cpp-social-link--instagram" title="Instagram">
                      <Instagram size={20} />
                    </a>
                  )}
                  {coach.socialMedia?.facebook && (
                    <a href={coach.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="cpp-social-link cpp-social-link--facebook" title="Facebook">
                      <Facebook size={20} />
                    </a>
                  )}
                  {coach.socialMedia?.twitter && (
                    <a href={coach.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="cpp-social-link cpp-social-link--twitter" title="Twitter">
                      <Twitter size={20} />
                    </a>
                  )}
                  {coach.socialMedia?.linkedin && (
                    <a href={coach.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="cpp-social-link cpp-social-link--linkedin" title="LinkedIn">
                      <Linkedin size={20} />
                    </a>
                  )}
                  {coach.socialMedia?.youtube && (
                    <a href={coach.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="cpp-social-link cpp-social-link--youtube" title="YouTube">
                      <Youtube size={20} />
                    </a>
                  )}
                  {coach.socialMedia?.website && (
                    <a href={coach.socialMedia.website} target="_blank" rel="noopener noreferrer" className="cpp-social-link cpp-social-link--website" title="Website">
                      <Globe size={20} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Achievements Section (Awards) */}
        {(coach.awards?.length || 0) > 0 && (
          <section className="cpp-section cpp-gallery cpp-gallery--awards">
            <div className="cpp-section__header">
              <h2 className="cpp-section__title">
                <Award size={24} />
                Achievements
              </h2>
            </div>

            {/* Desktop grid (3 items) */}
            <div className="cpp-gallery__grid">
              {((coach.awards || []).slice(awardsPage * 3, awardsPage * 3 + 3)).map((a, idx) => (
                <div key={a.publicId || idx} className="cpp-gallery__tile">
                  {a?.url ? (
                    <Image src={a.url} alt={`Award ${awardsPage * 4 + idx + 1}`} width={360} height={360} className="cpp-gallery__image" />
                  ) : (
                    <div className="cpp-gallery__placeholder">No image</div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop pager */}
            {((coach.awards?.length || 0) > 3) && (
              <div className="cpp-gallery__pager">
                <button className="cpp-gallery__pager-btn" disabled={awardsPage <= 0} onClick={() => setAwardsPage(p => Math.max(0, p - 1))}>Previous</button>
                <div className="cpp-gallery__pager-info">Page {awardsPage + 1} of {Math.ceil((coach.awards?.length || 0) / 3)}</div>
                <button className="cpp-gallery__pager-btn" disabled={awardsPage >= Math.ceil((coach.awards?.length || 0) / 3) - 1} onClick={() => setAwardsPage(p => Math.min(Math.ceil((coach.awards?.length || 0) / 3) - 1, p + 1))}>Next</button>
              </div>
            )}

            {/* Mobile carousel (1 item) */}
            <div className="cpp-gallery__carousel-mobile">
              <div className="cpp-gallery__viewport-mobile">
                <button
                  className="cpp-gallery__nav cpp-gallery__nav--prev"
                  disabled={(coach.awards?.length || 0) <= 1}
                  onClick={() => setAwardsIndex((p) => (p - 1 + (coach.awards?.length || 1)) % (coach.awards?.length || 1))}
                  aria-label="Previous award"
                >
                  <ChevronLeft size={18} />
                </button>
                {coach.awards?.[awardsIndex]?.url ? (
                  <Image src={coach.awards[awardsIndex].url} alt={`Award`} width={600} height={600} className="cpp-gallery__image" />
                ) : (
                  <div className="cpp-gallery__placeholder" />
                )}
                <button
                  className="cpp-gallery__nav cpp-gallery__nav--next"
                  disabled={(coach.awards?.length || 0) <= 1}
                  onClick={() => setAwardsIndex((p) => (p + 1) % Math.max(1, (coach.awards?.length || 1)))}
                  aria-label="Next award"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              {(coach.awards?.length || 0) > 0 && (
                <div className="cpp-gallery__thumbs" aria-label="Award image previews">
                  {coach.awards!.map((award, i) => (
                    <button
                      key={award.publicId || `award-thumb-${i}`}
                      type="button"
                      className={`cpp-gallery__thumb ${i === awardsIndex ? "cpp-gallery__thumb--active" : ""}`}
                      onClick={() => setAwardsIndex(i)}
                      aria-label={`Show award ${i + 1}`}
                      aria-current={i === awardsIndex ? "true" : undefined}
                    >
                      {award?.url ? (
                        <Image
                          src={award.url}
                          alt={`Award preview ${i + 1}`}
                          width={84}
                          height={84}
                          className="cpp-gallery__thumb-image"
                        />
                      ) : (
                        <span className="cpp-gallery__thumb-placeholder">N/A</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Dots for mobile carousel */}
            {(coach.awards?.length || 0) > 1 && (
              <div className="cpp-gallery__dots">
                {coach.awards!.map((_, i) => (
                  <button
                    key={i}
                    className={`cpp-gallery__dot ${i === awardsIndex ? 'cpp-gallery__dot--active' : ''}`}
                    onClick={() => setAwardsIndex(i)}
                    aria-label={`Show award ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Results Section (Transformations) */}
        {(coach.transformations?.length || 0) > 0 && (
          <section className="cpp-section cpp-gallery cpp-gallery--results">
            <div className="cpp-section__header">
              <h2 className="cpp-section__title">
                <TrendingUp size={24} />
                Results
              </h2>
            </div>

            <div className="cpp-gallery__grid">
              {((coach.transformations || []).slice(transformsPage * 3, transformsPage * 3 + 3)).map((t, idx) => (
                <div key={t.publicId || idx} className="cpp-gallery__tile">
                  {t?.url ? (
                    <Image src={t.url} alt={`Result ${transformsPage * 4 + idx + 1}`} width={360} height={360} className="cpp-gallery__image" />
                  ) : (
                    <div className="cpp-gallery__placeholder">No image</div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop pager */}
            {((coach.transformations?.length || 0) > 3) && (
              <div className="cpp-gallery__pager">
                <button className="cpp-gallery__pager-btn" disabled={transformsPage <= 0} onClick={() => setTransformsPage(p => Math.max(0, p - 1))}>Previous</button>
                <div className="cpp-gallery__pager-info">Page {transformsPage + 1} of {Math.ceil((coach.transformations?.length || 0) / 3)}</div>
                <button className="cpp-gallery__pager-btn" disabled={transformsPage >= Math.ceil((coach.transformations?.length || 0) / 3) - 1} onClick={() => setTransformsPage(p => Math.min(Math.ceil((coach.transformations?.length || 0) / 3) - 1, p + 1))}>Next</button>
              </div>
            )}

            <div className="cpp-gallery__carousel-mobile">
              <div className="cpp-gallery__viewport-mobile">
                <button
                  className="cpp-gallery__nav cpp-gallery__nav--prev"
                  disabled={(coach.transformations?.length || 0) <= 1}
                  onClick={() => setTransformsIndex((p) => (p - 1 + (coach.transformations?.length || 1)) % (coach.transformations?.length || 1))}
                  aria-label="Previous result"
                >
                  <ChevronLeft size={18} />
                </button>
                {coach.transformations?.[transformsIndex]?.url ? (
                  <Image src={coach.transformations[transformsIndex].url} alt={`Result`} width={600} height={600} className="cpp-gallery__image" />
                ) : (
                  <div className="cpp-gallery__placeholder" />
                )}
                <button
                  className="cpp-gallery__nav cpp-gallery__nav--next"
                  disabled={(coach.transformations?.length || 0) <= 1}
                  onClick={() => setTransformsIndex((p) => (p + 1) % Math.max(1, (coach.transformations?.length || 1)))}
                  aria-label="Next result"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              {(coach.transformations?.length || 0) > 0 && (
                <div className="cpp-gallery__thumbs" aria-label="Transformation image previews">
                  {coach.transformations!.map((result, i) => (
                    <button
                      key={result.publicId || `result-thumb-${i}`}
                      type="button"
                      className={`cpp-gallery__thumb ${i === transformsIndex ? "cpp-gallery__thumb--active" : ""}`}
                      onClick={() => setTransformsIndex(i)}
                      aria-label={`Show result ${i + 1}`}
                      aria-current={i === transformsIndex ? "true" : undefined}
                    >
                      {result?.url ? (
                        <Image
                          src={result.url}
                          alt={`Result preview ${i + 1}`}
                          width={84}
                          height={84}
                          className="cpp-gallery__thumb-image"
                        />
                      ) : (
                        <span className="cpp-gallery__thumb-placeholder">N/A</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {(coach.transformations?.length || 0) > 1 && (
              <div className="cpp-gallery__dots">
                {coach.transformations!.map((_, i) => (
                  <button
                    key={i}
                    className={`cpp-gallery__dot ${i === transformsIndex ? 'cpp-gallery__dot--active' : ''}`}
                    onClick={() => setTransformsIndex(i)}
                    aria-label={`Show result ${i + 1}`}
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
              {plans.slice(0, 4).map((plan) => (
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

            <PublicProgressChart data={progressData} />
          </section>
        )}

        {/* Client Reviews Section */}
        <section className="cpp-section cpp-reviews">
          <div className="cpp-container">
            <div className="cpp-section__header">
              <div>
                <h2 className="cpp-section__title">
                  <Star size={24} />
                  Client Reviews
                </h2>
                <p className="cpp-section__subtitle">
                  {stats.totalReviews > 0 ? (
                    <>
                      {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                    </>
                  ) : (
                    "No reviews yet"
                  )}
                </p>
              </div>
            </div>

            {/* Display Reviews */}
            {allReviews.length > 0 ? (
              <>
                <div className="cpp-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                  {allReviews.map((review: any) => (
                    <div key={review._id} className="cpp-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                        {review.client.avatarUrl ? (
                          <img
                            src={review.client.avatarUrl}
                            alt={review.client.fullName}
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "600",
                              fontSize: "1.25rem",
                            }}
                          >
                            {review.client.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                            {review.client.fullName}
                          </div>
                        </div>
                      </div>
                      <p style={{ color: "#4b5563", lineHeight: "1.6", marginBottom: "0.75rem" }}>
                        {review.review}
                      </p>
                      <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reviews Pagination */}
                {reviewsPagination && reviewsPagination.pages > 1 && (
                  <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "1rem", alignItems: "center" }}>
                    <button
                      onClick={() => setReviewsPage(p => Math.max(1, p - 1))}
                      disabled={reviewsPage === 1}
                      className="cpp-btn cpp-btn--secondary"
                      style={{ opacity: reviewsPage === 1 ? 0.5 : 1 }}
                    >
                      Previous
                    </button>
                    <span style={{ color: "#6b7280" }}>
                      Page {reviewsPage} of {reviewsPagination.pages}
                    </span>
                    <button
                      onClick={() => setReviewsPage(p => Math.min(reviewsPagination.pages, p + 1))}
                      disabled={reviewsPage === reviewsPagination.pages}
                      className="cpp-btn cpp-btn--secondary"
                      style={{ opacity: reviewsPage === reviewsPagination.pages ? 0.5 : 1 }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="cpp-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
                <p style={{ color: "#9ca3af" }}>No reviews yet. Be the first to review this coach!</p>
              </div>
            )}
          </div>
        </section>

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
