"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Twitter, Linkedin, Youtube, Globe, Phone, Mail } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

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
  const [profile, setProfile] = useState<PublicCoachProfileResponse["data"] | null>(
    null
  );
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
  const [awardsPage, setAwardsPage] = useState(0);
  const [transformationsPage, setTransformationsPage] = useState(0);
  const ITEMS_PER_PAGE = 4;
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

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
            
            // Fetch progress data for chart
            try {
              setLoadingProgress(true);
              const progressRes = await api.get(`/coach/public-profile/${encodeURIComponent(referralCode)}/progress`);
              if (progressRes.data && Array.isArray(progressRes.data)) {
                setProgressData(progressRes.data);
              }
            } catch (progressErr) {
              // Progress data not available
            } finally {
              setLoadingProgress(false);
            }
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message || "Unable to load coach profile."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [referralCode]);

  const handleJoinClick = () => {
    const existingParams = new URLSearchParams(
      searchParams ? searchParams.toString() : ""
    );
    existingParams.set("coach", referralCode);
    router.push(`/auth/register?${existingParams.toString()}`);
  };

  const scrollToContactForm = () => {
    // Prefer hash navigation for better mobile support within nested scroll containers
    try {
      const el = contactFormRef.current || document.getElementById("contact-form");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Update hash so browser preserves position on mobile
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.hash = "contact-form";
          window.history.replaceState(null, "", url.toString());
        }
        return;
      }
    } catch {}
    // Fallback: push hash to trigger default browser jump
    router.push(`#contact-form`);
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
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to submit contact request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-shell">
        <div className="profile-inner">
          <p className="profile-header__subtitle">Loading coach profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-shell">
        <div className="profile-inner">
          <p className="profile-header__subtitle text-red-600">
            {error || "Coach not found."}
          </p>
          <Link href="/" className="btn btn--secondary" style={{ marginTop: "1rem" }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { coach, stats, plans } = profile;

  const location = coach.address?.city || coach.address?.state
    ? [coach.address.city, coach.address.state].filter(Boolean).join(", ")
    : null;

  return (
    <div className="profile-shell">
      <div className="profile-inner" style={{ maxWidth: "100%", padding: "10px" }}>
        <header className="profile-header" style={{ marginBottom: "1rem", marginTop: 0, paddingTop: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginLeft: 0 }}>
            {coach.avatarUrl ? (
              <Image
                src={coach.avatarUrl}
                alt={coach.fullName}
                width={160}
                height={160}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: "12px",
                  objectFit: "cover",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  border: "2px solid #ffffff",
                  filter: "brightness(1.2)",
                }}
              />
            ) : (
              <div
                className="client-profile-avatar"
                style={{ 
                  width: 160, 
                  height: 160, 
                  fontSize: 64,
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  border: "2px solid #ffffff",
                }}
              >
                {coach.fullName?.[0]?.toUpperCase() || "C"}
              </div>
            )}
            <div style={{ flex: 1, marginTop: 0, paddingTop: 0 }}>
              <h1 
                className="profile-header__title" 
                style={{ 
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  backgroundImage: "linear-gradient(90deg, #1e3a8a 0%, #1e40af 25%, #3b82f6 50%, #1e40af 75%, #1e3a8a 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shine 3s linear infinite",
                  marginBottom: "0.25rem",
                  letterSpacing: "-0.02em",
                }}
              >
                {coach.fullName}
              </h1>
              <style jsx>{`
                @keyframes shine {
                  to {
                    background-position: 200% center;
                  }
                }
                @keyframes shimmer {
                  0%, 100% {
                    opacity: 1;
                    filter: brightness(1);
                  }
                  50% {
                    opacity: 0.8;
                    filter: brightness(1.3);
                  }
                }
              `}</style>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                {location && (
                  <p className="profile-header__subtitle" style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.25rem", margin: 0 }}>
                     {location}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <div className="profile-header__badge" style={{ display: "inline-flex", fontSize: "0.8rem", alignItems: "center", gap: "0.35rem" }}>
                  PulseLedger Coach
                  <Image
                    src="/tick-ico.png"
                    alt="Verified"
                    width={16}
                    height={16}
                    style={{ animation: "shimmer 2s ease-in-out infinite", flexShrink: 0 }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn"
                  onClick={scrollToContactForm}
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#3b82f6",
                    borderColor: "#3b82f6",
                    border: "2px solid #3b82f6",
                    fontSize: "0.8rem",
                    paddingInline: "0.75rem",
                    paddingBlock: "0.4rem",
                    fontWeight: 600,
                  }}
                >
                  Contact Me
                </button>
                {coach.socialMedia && (
                  <>
                  {coach.socialMedia.instagram && (
                    <a
                      href={coach.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        color: "#6b7280", 
                        transition: "color 0.2s",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: "8px",
                        backgroundColor: "rgba(107, 114, 128, 0.1)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#374151"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
                      title="Instagram"
                    >
                      <Instagram size={20} />
                    </a>
                  )}
                  {coach.socialMedia.facebook && (
                    <a
                      href={coach.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        color: "#6b7280", 
                        transition: "color 0.2s",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: "8px",
                        backgroundColor: "rgba(107, 114, 128, 0.1)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#374151"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
                      title="Facebook"
                    >
                      <Facebook size={20} />
                    </a>
                  )}
                  {coach.socialMedia.twitter && (
                    <a
                      href={coach.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        color: "#6b7280", 
                        transition: "color 0.2s",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: "8px",
                        backgroundColor: "rgba(107, 114, 128, 0.1)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#374151"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
                      title="Twitter"
                    >
                      <Twitter size={20} />
                    </a>
                  )}
                  {coach.socialMedia.linkedin && (
                    <a
                      href={coach.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        color: "#6b7280", 
                        transition: "color 0.2s",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: "8px",
                        backgroundColor: "rgba(107, 114, 128, 0.1)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#374151"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
                      title="LinkedIn"
                    >
                      <Linkedin size={20} />
                    </a>
                  )}
                  {coach.socialMedia.youtube && (
                    <a
                      href={coach.socialMedia.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        color: "#6b7280", 
                        transition: "color 0.2s",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: "8px",
                        backgroundColor: "rgba(107, 114, 128, 0.1)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#374151"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
                      title="YouTube"
                    >
                      <Youtube size={20} />
                    </a>
                  )}
                  {coach.socialMedia.website && (
                    <a
                      href={coach.socialMedia.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        color: "#6b7280", 
                        transition: "color 0.2s",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: "8px",
                        backgroundColor: "rgba(107, 114, 128, 0.1)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#374151"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
                      title="Website"
                    >
                      <Globe size={20} />
                    </a>
                  )}
                </>
              )}
              </div>
            </div>
          </div>
        </header>

        {coach.description && (
          <div className="profile-card" style={{ marginBottom: "1.25rem" }}>
            <h2 className="profile-header__title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
              About {coach.fullName.split(" ")[0]}
            </h2>
            <p className="profile-header__subtitle" style={{ lineHeight: "1.7", whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>
              {coach.description}
            </p>
          </div>
        )}

        {/* Awards & Achievements Gallery */}
        {coach.awards && coach.awards.length > 0 && (
          <div className="profile-card" style={{ marginBottom: "1.25rem" }}>
            <h2 className="profile-header__title" style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#3b82f6" }}>
              Awards & Achievements
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
              {coach.awards
                .slice(awardsPage * ITEMS_PER_PAGE, (awardsPage + 1) * ITEMS_PER_PAGE)
                .map((award) => (
                  <div
                    key={award.publicId}
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <Image
                      src={award.url}
                      alt="Award"
                      width={250}
                      height={250}
                      style={{
                        width: "100%",
                        height: "250px",
                        objectFit: "cover",
                        filter: "brightness(1.2)",
                      }}
                    />
                  </div>
                ))}
            </div>
            {coach.awards.length > ITEMS_PER_PAGE && (
              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                <button
                  className="btn btn--secondary"
                  onClick={() => setAwardsPage(p => Math.max(0, p - 1))}
                  disabled={awardsPage === 0}
                  style={{ fontSize: "0.9rem", paddingInline: "1rem", paddingBlock: "0.5rem" }}
                >
                  Previous
                </button>
                <span style={{ display: "flex", alignItems: "center", fontSize: "0.9rem", color: "#6b7280" }}>
                  Page {awardsPage + 1} of {Math.ceil(coach.awards.length / ITEMS_PER_PAGE)}
                </span>
                <button
                  className="btn btn--secondary"
                  onClick={() => setAwardsPage(p => Math.min(Math.ceil((coach.awards?.length || 0) / ITEMS_PER_PAGE) - 1, p + 1))}
                  disabled={awardsPage >= Math.ceil((coach.awards?.length || 0) / ITEMS_PER_PAGE) - 1}
                  style={{ fontSize: "0.9rem", paddingInline: "1rem", paddingBlock: "0.5rem" }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Transformation Results Gallery */}
        {coach.transformations && coach.transformations.length > 0 && (
          <div className="profile-card" style={{ marginBottom: "1.25rem" }}>
            <h2 className="profile-header__title" style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#3b82f6" }}>
              Transformation Results
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
              {coach.transformations
                .slice(transformationsPage * ITEMS_PER_PAGE, (transformationsPage + 1) * ITEMS_PER_PAGE)
                .map((transformation) => (
                  <div
                    key={transformation.publicId}
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <Image
                      src={transformation.url}
                      alt="Transformation"
                      width={250}
                      height={250}
                      style={{
                        width: "100%",
                        height: "250px",
                        objectFit: "cover",
                        filter: "brightness(1.2)",
                      }}
                    />
                  </div>
                ))}
            </div>
            {coach.transformations.length > ITEMS_PER_PAGE && (
              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                <button
                  className="btn btn--secondary"
                  onClick={() => setTransformationsPage(p => Math.max(0, p - 1))}
                  disabled={transformationsPage === 0}
                  style={{ fontSize: "0.9rem", paddingInline: "1rem", paddingBlock: "0.5rem" }}
                >
                  Previous
                </button>
                <span style={{ display: "flex", alignItems: "center", fontSize: "0.9rem", color: "#6b7280" }}>
                  Page {transformationsPage + 1} of {Math.ceil(coach.transformations.length / ITEMS_PER_PAGE)}
                </span>
                <button
                  className="btn btn--secondary"
                  onClick={() => setTransformationsPage(p => Math.min(Math.ceil((coach.transformations?.length || 0) / ITEMS_PER_PAGE) - 1, p + 1))}
                  disabled={transformationsPage >= Math.ceil((coach.transformations?.length || 0) / ITEMS_PER_PAGE) - 1}
                  style={{ fontSize: "0.9rem", paddingInline: "1rem", paddingBlock: "0.5rem" }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        <div className="profile-card" style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p className="profile-header__subtitle" style={{ marginBottom: 8 }}>
                Join PulseLedger using this coach's referral link. Your account will be
                automatically connected to them.
              </p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleJoinClick}
              >
                Join PulseLedger with {coach.fullName}
              </button>
            </div>
            <div className="profile-header__badge" style={{ alignSelf: "flex-start" }}>
              Referral Code: {coach.referralCode}
            </div>
          </div>
        </div>

        {coach.bio && (
          <div className="profile-card" style={{ marginBottom: "1.25rem" }}>
            <h2 className="profile-header__title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              About
            </h2>
            <p className="profile-header__subtitle" style={{ lineHeight: "1.6" }}>
              {coach.bio}
            </p>
          </div>
        )}

        <section className="profile-grid">
          <div className="profile-card">
            <h2 className="profile-header__title" style={{ fontSize: "1rem" }}>
              Professional Info
            </h2>
            <dl className="profile-fields">
              <div className="profile-field">
                <dt className="profile-field__label">Specialization</dt>
                <dd className="profile-field__value">
                  {coach.specialization || "General Coaching"}
                </dd>
              </div>
              <div className="profile-field">
                <dt className="profile-field__label">Experience</dt>
                <dd className="profile-field__value">
                  {coach.experienceYears != null
                    ? `${coach.experienceYears} years`
                    : "Not specified"}
                </dd>
              </div>
              <div className="profile-field">
                <dt className="profile-field__label">Member Since</dt>
                <dd className="profile-field__value">
                  {coach.memberSince
                    ? new Date(coach.memberSince).toLocaleDateString()
                    : "N/A"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="profile-card">
            <h2 className="profile-header__title" style={{ fontSize: "1rem" }}>
              Stats
            </h2>
            <dl className="profile-fields">
              <div className="profile-field">
                <dt className="profile-field__label">Clients Guided</dt>
                <dd className="profile-field__value">{stats.clientsCount}</dd>
              </div>
              <div className="profile-field">
                <dt className="profile-field__label">Plans Created</dt>
                <dd className="profile-field__value">{stats.plansCount}</dd>
              </div>
              <div className="profile-field">
                <dt className="profile-field__label">Products Offered</dt>
                <dd className="profile-field__value">{stats.productsCount}</dd>
              </div>
            </dl>
          </div>
        </section>

        {plans && plans.length > 0 && (
          <div className="profile-card" style={{ marginTop: "1.25rem" }}>
            <h2 className="profile-header__title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
              Available Plans
            </h2>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  style={{
                    padding: "1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    {plan.title}
                  </h3>
                  {plan.description && (
                    <p className="profile-header__subtitle" style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                      {plan.description}
                    </p>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
                    {plan.durationWeeks && (
                      <span className="profile-header__subtitle" style={{ fontSize: "0.85rem" }}>
                        {plan.durationWeeks} weeks
                      </span>
                    )}
                    {plan.price != null && (
                      <span style={{ fontSize: "1rem", fontWeight: 600, color: "#059669" }}>
                        ₹{plan.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Client Progress Chart */}
        {progressData && progressData.length > 0 && (
          <div className="profile-card" style={{ marginTop: "1.25rem" }}>
            <h2 className="profile-header__title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              Client Progress (Avg BMI)
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
              Average BMI across all clients, grouped by week
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBMIPublic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip 
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "0.75rem",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                            {payload[0].payload.week}
                          </p>
                          <p style={{ fontSize: "1rem", fontWeight: "600", color: "#111827" }}>
                            {payload[0].value != null ? payload[0].value.toFixed(1) : "-"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgBMI"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#colorBMIPublic)"
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Contact Form */}
        <div id="contact-form" ref={contactFormRef} className="profile-card" style={{ marginTop: "2rem", scrollMarginTop: "2rem" }}>
          <h2 className="profile-header__title" style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#3b82f6" }}>
            Contact Me
          </h2>
          
          {submitSuccess && (
            <div style={{ 
              padding: "1rem", 
              backgroundColor: "#dbeafe", 
              border: "1px solid #3b82f6", 
              borderRadius: "8px", 
              marginBottom: "1rem",
              color: "#1e40af"
            }}>
              <strong>Success!</strong> Your message has been sent. {coach.fullName} will reach out to you soon!
            </div>
          )}

          <form onSubmit={handleContactFormSubmit}>
            <div className="client-form" style={{ gap: "1rem" }}>
              <div className="client-form__row">
                <label className="client-form__label">First Name *</label>
                <input
                  className="client-form__control"
                  type="text"
                  required
                  maxLength={50}
                  value={contactFormData.firstName}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              
              <div className="client-form__row">
                <label className="client-form__label">Last Name *</label>
                <input
                  className="client-form__control"
                  type="text"
                  required
                  maxLength={50}
                  value={contactFormData.lastName}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>

              <div className="client-form__row">
                <label className="client-form__label">Email (optional)</label>
                <input
                  className="client-form__control"
                  type="email"
                  value={contactFormData.email}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="client-form__row">
                <label className="client-form__label">Phone Number *</label>
                <input
                  className="client-form__control"
                  type="tel"
                  required
                  value={contactFormData.phone}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="client-form__row">
                <label className="client-form__label">Height (cm, approx)</label>
                <input
                  className="client-form__control"
                  type="number"
                  min="50"
                  max="300"
                  value={contactFormData.height}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>

              <div className="client-form__row">
                <label className="client-form__label">Weight (kg, approx)</label>
                <input
                  className="client-form__control"
                  type="number"
                  min="20"
                  max="500"
                  value={contactFormData.weight}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>

              <div className="client-form__row">
                <label className="client-form__label">Age *</label>
                <input
                  className="client-form__control"
                  type="number"
                  required
                  min="10"
                  max="120"
                  value={contactFormData.age}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>

              <div className="client-form__row">
                <label className="client-form__label">Gender *</label>
                <select
                  className="client-form__control"
                  required
                  value={contactFormData.gender}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="client-form__row client-form__row--full">
                <label className="client-form__label">Message *</label>
                <textarea
                  className="client-form__control"
                  required
                  rows={5}
                  maxLength={1000}
                  placeholder="Tell the coach about your fitness goals, health concerns, or any questions you have..."
                  value={contactFormData.message}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, message: e.target.value }))}
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
                <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.25rem" }}>
                  {contactFormData.message.length}/1000 characters
                </div>
              </div>

              <div className="client-form__row client-form__row--full" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={submitting}
                  style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6", minWidth: "150px" }}
                >
                  {submitting ? "Submitting..." : "Submit Details"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Call Me and Email Me sections */}
        <div className="profile-grid" style={{ marginTop: "1.5rem" }}>
          {coach.phone && (
            <div className="profile-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <div style={{ 
                  width: "40px", 
                  height: "40px", 
                  borderRadius: "50%", 
                  backgroundColor: "#dbeafe", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center" 
                }}>
                  <Phone size={20} style={{ color: "#3b82f6" }} />
                </div>
                <h2 className="profile-header__title" style={{ fontSize: "1.1rem", margin: 0 }}>
                  Call Me
                </h2>
              </div>
              <p className="profile-header__subtitle" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                Feel free to call me directly for any questions or consultations.
              </p>
              <a 
                href={`tel:${coach.phone}`}
                className="btn btn--primary"
                style={{ 
                  backgroundColor: "#3b82f6", 
                  borderColor: "#3b82f6",
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontSize: "0.95rem"
                }}
              >
                <Phone size={18} />
                {coach.phone}
              </a>
            </div>
          )}

          <div className="profile-card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "50%", 
                backgroundColor: "#dbeafe", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <Mail size={20} style={{ color: "#3b82f6" }} />
              </div>
              <h2 className="profile-header__title" style={{ fontSize: "1.1rem", margin: 0 }}>
                Email Me
              </h2>
            </div>
            <p className="profile-header__subtitle" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              Send me an email and I'll get back to you as soon as possible.
            </p>
            <a 
              href={`mailto:${coach.email}`}
              className="btn btn--primary"
              style={{ 
                backgroundColor: "#3b82f6", 
                borderColor: "#3b82f6",
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "0.95rem"
              }}
            >
              <Mail size={18} />
              {coach.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicCoachProfilePage() {
  return (
    <Suspense fallback={<div className="profile-shell"><div className="profile-inner"><p className="profile-header__subtitle">Loading coach profile…</p></div></div>}>
      <PublicCoachProfileContent />
    </Suspense>
  );
}
