"use client";

import Link from "next/link";
import Image from "next/image";
import { useMyCoachQuery } from "@/lib/queries/coach";

export default function ClientCoachProfilePage() {
  const { data, isLoading, error } = useMyCoachQuery();

  if (isLoading) {
    return (
      <div className="client-page__sections">
        <div className="client-card">
          <p className="client-card__subtitle">Loading coach profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-page__sections">
        <div className="client-card">
          <p className="client-card__subtitle" style={{ color: "#dc2626" }}>
            Unable to load coach information.
          </p>
          <Link href="/client/dashboard" className="client-button client-button--outline" style={{ marginTop: "0.75rem" }}>
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="client-page__sections">
        <div className="client-card">
          <p className="client-card__subtitle">You do not have a coach assigned yet.</p>
          <Link href="/client/dashboard" className="client-button client-button--outline" style={{ marginTop: "0.75rem" }}>
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="client-page__sections">
        <header className="client-page__header">
          <h1 className="client-page__title">My Coach</h1>
        </header>

        <div className="client-card">
          <div className="client-card__header" style={{ flexDirection: "column", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%" }}>
              {data.avatarUrl ? (
                <Image
                  src={data.avatarUrl}
                  alt={data.fullName}
                  width={80}
                  height={80}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                    filter: "brightness(1.2)",
                  }}
                />
              ) : (
                <div 
                  className="client-profile-avatar" 
                  style={{ 
                    width: 80, 
                    height: 80, 
                    fontSize: "1.75rem",
                    flexShrink: 0,
                  }}
                >
                  {data.fullName?.[0]?.toUpperCase() || "C"}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h2 className="client-card__title" style={{ marginBottom: "0.25rem" }}>{data.fullName}</h2>
                <p className="client-card__subtitle" style={{ textTransform: "capitalize", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                  {data.role}
                </p>
                {(data.coachCode || data.referralCode) && (
                  <p className="client-card__subtitle" style={{ fontSize: "0.85rem" }}>
                    Coach Code: <span style={{ fontWeight: 600 }}>{data.coachCode || data.referralCode}</span>
                  </p>
                )}
              </div>
              {data.isActive !== undefined && (
                <span
                  style={{
                    padding: "0.35rem 0.85rem",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    backgroundColor: data.isActive ? "#d1fae5" : "#fee2e2",
                    color: data.isActive ? "#047857" : "#b91c1c",
                    flexShrink: 0,
                  }}
                >
                  {data.isActive ? "Active" : "Inactive"}
                </span>
              )}
            </div>
          </div>

          <div className="client-page__sections">
            <section>
              <p className="client-section-title">Contact</p>
              <div className="client-profile-grid" style={{ marginTop: "0.55rem" }}>
                <div className="client-profile-field">
                  <p className="client-profile-field__label">Email</p>
                  <p className="client-profile-field__value">{data.email}</p>
                </div>
                {data.phone && (
                  <div className="client-profile-field">
                    <p className="client-profile-field__label">Phone</p>
                    <p className="client-profile-field__value">{data.phone}</p>
                  </div>
                )}
                {data.whatsappNumber && (
                  <div className="client-profile-field">
                    <p className="client-profile-field__label">WhatsApp</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <p className="client-profile-field__value">{data.whatsappNumber}</p>
                      <button
                        type="button"
                        className="client-button"
                        style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem", background: "transparent", border: "none", cursor: "pointer" }}
                        onClick={() => {
                          const phone = (data.whatsappNumber || "").toString().replace(/[^0-9]/g, "");
                          const text = encodeURIComponent(
                            `Hi ${data.fullName}, I am your client. Can we chat?`
                          );
                          if (!phone) return;
                          window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
                        }}
                      >
                        <Image src="/whatsapp.png" alt="WhatsApp" width={32} height={32} style={{ flexShrink: 0 }} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section>
              <p className="client-section-title">Profile</p>
              <div className="client-profile-grid" style={{ marginTop: "0.55rem" }}>
                {typeof data.experienceYears === "number" && (
                  <div className="client-profile-field">
                    <p className="client-profile-field__label">Experience</p>
                    <p className="client-profile-field__value">
                      {data.experienceYears} years
                    </p>
                  </div>
                )}
                {data.specialization && (
                  <div className="client-profile-field">
                    <p className="client-profile-field__label">Specialization</p>
                    <p className="client-profile-field__value">{data.specialization}</p>
                  </div>
                )}
              </div>
            </section>

            {data.bio && (
              <section>
                <p className="client-section-title">Bio</p>
                <p
                  className="client-card__subtitle"
                  style={{ marginTop: "0.5rem", fontSize: "0.9rem", lineHeight: 1.6 }}
                >
                  {data.bio}
                </p>
              </section>
            )}

            {data.address && Object.values(data.address).some(val => val) && (
              <section>
                <p className="client-section-title">Address</p>
                <div className="client-profile-grid" style={{ marginTop: "0.55rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                  {data.address.line1 && (
                    <div className="client-profile-field" style={{ gridColumn: "1 / -1" }}>
                      <p className="client-profile-field__label">Address Line 1</p>
                      <p className="client-profile-field__value">{data.address.line1}</p>
                    </div>
                  )}
                  {data.address.line2 && (
                    <div className="client-profile-field" style={{ gridColumn: "1 / -1" }}>
                      <p className="client-profile-field__label">Address Line 2</p>
                      <p className="client-profile-field__value">{data.address.line2}</p>
                    </div>
                  )}
                  {data.address.phoneNumber && (
                    <div className="client-profile-field">
                      <p className="client-profile-field__label">Phone Number</p>
                      <p className="client-profile-field__value">{data.address.phoneNumber}</p>
                    </div>
                  )}
                  {data.address.neighborhood && (
                    <div className="client-profile-field">
                      <p className="client-profile-field__label">Neighborhood / Locality</p>
                      <p className="client-profile-field__value">{data.address.neighborhood}</p>
                    </div>
                  )}
                  {data.address.city && (
                    <div className="client-profile-field">
                      <p className="client-profile-field__label">City / Town</p>
                      <p className="client-profile-field__value">{data.address.city}</p>
                    </div>
                  )}
                  {data.address.state && (
                    <div className="client-profile-field">
                      <p className="client-profile-field__label">State / Province / Region</p>
                      <p className="client-profile-field__value">{data.address.state}</p>
                    </div>
                  )}
                  {data.address.postalCode && (
                    <div className="client-profile-field">
                      <p className="client-profile-field__label">Postal Code / ZIP / PIN</p>
                      <p className="client-profile-field__value">{data.address.postalCode}</p>
                    </div>
                  )}
                  {data.address.country && (
                    <div className="client-profile-field">
                      <p className="client-profile-field__label">Country</p>
                      <p className="client-profile-field__value">{data.address.country}</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          <div
            style={{
              marginTop: "1.1rem",
              display: "flex",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <Link href="/client/dashboard" className="client-button client-button--outline">
              Back to Dashboard
            </Link>
            {(data.referralCode || data.coachCode) && (
              <a
                href={`/public/${encodeURIComponent(data.referralCode || data.coachCode || '')}`}
                rel="noopener noreferrer"
                className="client-button"
              >
                Visit Public Profile
              </a>
            )}
          </div>
        </div>
    </div>
  );
}
