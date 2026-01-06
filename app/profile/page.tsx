"use client";

import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { User, Upload, Trash2 } from "lucide-react";
import { useProfileQuery, PROFILE_QUERY_KEY } from "@/lib/queries/profile";
import { useMyDocumentsQuery } from "@/lib/queries/documents";
import api from "@/lib/axios";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const PaymentQrUploader = dynamic(() => import("@/components/coach/PaymentQrUploader"), { ssr: false });

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useProfileQuery();
  const [uploading, setUploading] = useState(false);
  const [addressEditing, setAddressEditing] = useState(false);
  const [addressValue, setAddressValue] = useState({
    phoneNumber: "",
    line1: "",
    line2: "",
    neighborhood: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [coachInfoEditing, setCoachInfoEditing] = useState(false);
  const [coachInfoValue, setCoachInfoValue] = useState({
    specialization: "",
    experienceYears: "",
    description: "",
  });
  const [coachInfoSaving, setCoachInfoSaving] = useState(false);
  const [socialMediaEditing, setSocialMediaEditing] = useState(false);
  const [socialMediaValue, setSocialMediaValue] = useState({
    instagram: "",
    facebook: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    website: "",
  });
  const [socialMediaSaving, setSocialMediaSaving] = useState(false);
  const [awardsPage, setAwardsPage] = useState(0);
  const [transformationsPage, setTransformationsPage] = useState(0);
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");
  const [submittingDeletion, setSubmittingDeletion] = useState(false);
  const ITEMS_PER_PAGE = 4;
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const setAvatarUrl = useAuthStore((s) => s.setAvatarUrl);
  const storeAvatar = useAuthStore((s) => s.user?.avatarUrl);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const { data: myDocuments, isLoading: docsLoading } = useMyDocumentsQuery();

  const currentAddress = data?.address || null;

  const startEditAddress = () => {
    setAddressValue({
      phoneNumber: currentAddress?.phoneNumber || "",
      line1: currentAddress?.line1 || "",
      line2: currentAddress?.line2 || "",
      neighborhood: currentAddress?.neighborhood || "",
      city: currentAddress?.city || "",
      state: currentAddress?.state || "",
      postalCode: currentAddress?.postalCode || "",
      country: currentAddress?.country || "",
    });
    setAddressEditing(true);
  };

  const cancelEditAddress = () => {
    setAddressEditing(false);
    setAddressValue({
      phoneNumber: currentAddress?.phoneNumber || "",
      line1: currentAddress?.line1 || "",
      line2: currentAddress?.line2 || "",
      neighborhood: currentAddress?.neighborhood || "",
      city: currentAddress?.city || "",
      state: currentAddress?.state || "",
      postalCode: currentAddress?.postalCode || "",
      country: currentAddress?.country || "",
    });
  };

  const saveAddress = async () => {
    if (!data) return;
    try {
      setAddressSaving(true);
      const cleanedAddress = {
        phoneNumber: addressValue.phoneNumber.trim() || null,
        line1: addressValue.line1.trim() || null,
        line2: addressValue.line2.trim() || null,
        neighborhood: addressValue.neighborhood.trim() || null,
        city: addressValue.city.trim() || null,
        state: addressValue.state.trim() || null,
        postalCode: addressValue.postalCode.trim() || null,
        country: addressValue.country.trim() || null,
      };

      const allNull = Object.values(cleanedAddress).every((v) => v === null);

      await api.put("/users/profile", { address: allNull ? null : cleanedAddress });
      queryClient.setQueryData(PROFILE_QUERY_KEY, (prev: unknown) =>
        prev ? { ...(prev as Record<string, unknown>), address: allNull ? null : cleanedAddress } : prev
      );
      setAddressEditing(false);
    } catch (err) {
      // Error saving address
    } finally {
      setAddressSaving(false);
    }
  };

  const startEditCoachInfo = () => {
    setCoachInfoValue({
      specialization: data?.specialization || "",
      experienceYears: data?.experienceYears != null ? String(data.experienceYears) : "",
      description: data?.description || "",
    });
    setCoachInfoEditing(true);
  };

  const cancelEditCoachInfo = () => {
    setCoachInfoEditing(false);
    setCoachInfoValue({
      specialization: data?.specialization || "",
      experienceYears: data?.experienceYears != null ? String(data.experienceYears) : "",
      description: data?.description || "",
    });
  };

  const saveCoachInfo = async () => {
    if (!data) return;
    try {
      setCoachInfoSaving(true);
      const payload: any = {};
      
      const spec = coachInfoValue.specialization.trim();
      if (spec) payload.specialization = spec;
      else payload.specialization = null;
      
      const exp = coachInfoValue.experienceYears.trim();
      if (exp) {
        const num = Number(exp);
        if (!isNaN(num) && num >= 0 && num <= 50) {
          payload.experienceYears = num;
        }
      } else {
        payload.experienceYears = null;
      }

      const desc = coachInfoValue.description.trim();
      if (desc) payload.description = desc;
      else payload.description = null;

      await api.put("/users/profile", payload);
      queryClient.setQueryData(PROFILE_QUERY_KEY, (prev: unknown) =>
        prev ? { ...(prev as Record<string, unknown>), ...payload } : prev
      );
      setCoachInfoEditing(false);
    } catch (err) {
      // Error saving coach info
    } finally {
      setCoachInfoSaving(false);
    }
  };

  const startEditSocialMedia = () => {
    setSocialMediaValue({
      instagram: data?.socialMedia?.instagram || "",
      facebook: data?.socialMedia?.facebook || "",
      twitter: data?.socialMedia?.twitter || "",
      linkedin: data?.socialMedia?.linkedin || "",
      youtube: data?.socialMedia?.youtube || "",
      website: data?.socialMedia?.website || "",
    });
    setSocialMediaEditing(true);
  };

  const cancelEditSocialMedia = () => {
    setSocialMediaEditing(false);
    setSocialMediaValue({
      instagram: data?.socialMedia?.instagram || "",
      facebook: data?.socialMedia?.facebook || "",
      twitter: data?.socialMedia?.twitter || "",
      linkedin: data?.socialMedia?.linkedin || "",
      youtube: data?.socialMedia?.youtube || "",
      website: data?.socialMedia?.website || "",
    });
  };

  const saveSocialMedia = async () => {
    if (!data) return;
    try {
      setSocialMediaSaving(true);
      
      // Validate URLs before sending
      const isValidUrl = (url: string) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };
      
      const cleanedSocialMedia: Record<string, string> = {};
      
      // Only include non-empty, valid URLs
      const trimmedInstagram = socialMediaValue.instagram.trim();
      if (trimmedInstagram && isValidUrl(trimmedInstagram)) cleanedSocialMedia.instagram = trimmedInstagram;
      
      const trimmedFacebook = socialMediaValue.facebook.trim();
      if (trimmedFacebook && isValidUrl(trimmedFacebook)) cleanedSocialMedia.facebook = trimmedFacebook;
      
      const trimmedTwitter = socialMediaValue.twitter.trim();
      if (trimmedTwitter && isValidUrl(trimmedTwitter)) cleanedSocialMedia.twitter = trimmedTwitter;
      
      const trimmedLinkedin = socialMediaValue.linkedin.trim();
      if (trimmedLinkedin && isValidUrl(trimmedLinkedin)) cleanedSocialMedia.linkedin = trimmedLinkedin;
      
      const trimmedYoutube = socialMediaValue.youtube.trim();
      if (trimmedYoutube && isValidUrl(trimmedYoutube)) cleanedSocialMedia.youtube = trimmedYoutube;
      
      const trimmedWebsite = socialMediaValue.website.trim();
      if (trimmedWebsite && isValidUrl(trimmedWebsite)) cleanedSocialMedia.website = trimmedWebsite;

      await api.put("/users/profile", { socialMedia: cleanedSocialMedia });
      queryClient.setQueryData(PROFILE_QUERY_KEY, (prev: unknown) =>
        prev ? { ...(prev as Record<string, unknown>), socialMedia: cleanedSocialMedia } : prev
      );
      setSocialMediaEditing(false);
    } catch (err) {
      // Error saving social media
    } finally {
      setSocialMediaSaving(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!deletionReason.trim()) {
      toast.error("Please provide a reason for account deletion");
      return;
    }

    try {
      setSubmittingDeletion(true);
      await api.post("/users/request-deletion", { reason: deletionReason });
      toast.success("Account deletion request submitted. An admin will review your request.");
      setShowDeletionDialog(false);
      setDeletionReason("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = (err as any).response?.data?.message || (err as any).message;
        toast.error(msg || "Failed to submit deletion request");
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to submit deletion request");
      } else {
        toast.error(String(err) || "Failed to submit deletion request");
      }
    } finally {
      setSubmittingDeletion(false);
    }
  };

  const detailRows = useMemo(() => {
    if (!data) return [];
    const entries: Array<{ label: string; value: string }> = [
      { label: "Full Name", value: data.fullName },
      { label: "Email", value: data.email },
      { label: "Role", value: data.role },
    ];

    if (data.phone) entries.push({ label: "Phone", value: data.phone });
    if (data.whatsappNumber)
      entries.push({ label: "WhatsApp", value: data.whatsappNumber });
    if (data.specialization)
      entries.push({ label: "Specialization", value: data.specialization });
    if (typeof data.experienceYears === "number")
      entries.push({ label: "Experience (years)", value: `${data.experienceYears}` });
    if (typeof data.weight === "number") entries.push({ label: "Weight", value: `${data.weight} kg` });
    if (typeof data.height === "number") entries.push({ label: "Height", value: `${data.height} cm` });
    if (typeof data.bmi === "number") entries.push({ label: "BMI", value: `${data.bmi}` });
    // Progress Summary intentionally removed from profile view.

    return entries;
  }, [data]);

  return (
    <motion.div
      className="profile-shell"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="profile-inner">
        <header className="profile-header">
          <div>
            <h1
              className="profile-header__title"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <User className="w-6 h-6" />
              My Profile
            </h1>
            <p className="profile-header__subtitle">
              Your account, contact and health info in one place.
            </p>
          </div>
          <div className="profile-header__badge">
            <span />
            Role: {data?.role || "-"}
          </div>
        </header>

        <div className="profile-card" style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
              {(storeAvatar || data?.avatarUrl) ? (
                <Image src={storeAvatar || data?.avatarUrl || ""} alt="Avatar" width={72} height={72} style={{ width: 72, height: 72, borderRadius: 999, objectFit: "cover", filter: "brightness(1.2)" }} priority />
              ) : (
                <div className="client-profile-avatar" style={{ width: 72, height: 72, fontSize: 22 }}>
                  {data?.fullName?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <div className="client-section-title">Profile Picture</div>
                <p className="profile-header__subtitle" style={{ fontSize: "0.8rem" }}>PNG/JPEG/WebP up to 2 MB</p>
              </div>
            </div>
            <div>
              <label className="btn btn--outline" style={{ cursor: uploading ? "default" : "pointer" }}>
                <Upload className="btn__icon" /> {uploading ? "Uploading..." : "Upload New"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  disabled={uploading}
                  ref={avatarInputRef}
                  onChange={async (e) => {
                    if (!e.target.files || !e.target.files[0]) return;
                    const file = e.target.files[0];
                    const form = new FormData();
                    form.append("image", file);
                    try {
                      setUploading(true);
                      const res = await api.post("/users/upload-avatar", form, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      const newUrl = res.data?.data?.avatarUrl as string | undefined;
                      if (newUrl) {
                        // Update store (persisted) so other pages use cached avatar
                        setAvatarUrl(newUrl);
                        // Update profile query cache locally without refetch
                        queryClient.setQueryData(PROFILE_QUERY_KEY, (prev: unknown) =>
                          prev ? { ...(prev as Record<string, unknown>), avatarUrl: newUrl } : prev
                        );
                      }
                    } catch (err) {
                      // Error uploading avatar
                    } finally {
                      setUploading(false);
                      if (avatarInputRef.current) avatarInputRef.current.value = "";
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <section className="profile-grid">
          {data?.role === "client" && (
            <div
              className="profile-card"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <h2
                className="profile-header__title"
                style={{ fontSize: "1rem" }}
              >
                My Documents
              </h2>
              <p
                className="profile-header__subtitle"
                style={{ marginTop: 4, marginBottom: 12, fontSize: "0.85rem" }}
              >
                Upload and manage your medical reports, lab results, and other health documents in one place.
              </p>
              <div style={{ marginBottom: 12, flex: 1 }}>
                {docsLoading ? (
                  <p className="profile-header__subtitle" style={{ fontSize: "0.8rem" }}>
                    Loading your documents...
                  </p>
                ) : myDocuments && myDocuments.length > 0 ? (
                  <ul style={{ fontSize: "0.8rem", color: "#4b5563", paddingLeft: "1rem", marginBottom: 4 }}>
                    {myDocuments.slice(0, 3).map((doc) => (
                      <li key={doc._id} style={{ listStyle: "disc", marginBottom: 4 }}>
                        <button
                          type="button"
                          onClick={() => window.open(doc.viewUrl, "_blank")}
                          style={{
                            border: "none",
                            background: "none",
                            padding: 0,
                            margin: 0,
                            cursor: "pointer",
                            color: "#2563eb",
                            textDecoration: "underline",
                            fontSize: "0.8rem",
                          }}
                        >
                          {doc.name || doc.originalName}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="profile-header__subtitle" style={{ fontSize: "0.8rem" }}>
                    You haven&apos;t uploaded any documents yet.
                  </p>
                )}
                {myDocuments && myDocuments.length > 3 && (
                  <p className="profile-header__subtitle" style={{ fontSize: "0.8rem", marginTop: 2 }}>
                    and {myDocuments.length - 3} more...
                  </p>
                )}
              </div>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => router.push("/client/documents")}
                style={{
                  marginTop: "auto",
                  fontSize: "0.9rem",
                  paddingInline: "1rem",
                  paddingBlock: "0.5rem",
                }}
              >
                Go to My Documents
              </button>
            </div>
          )}

          <div className="profile-card">
            <h2 className="profile-header__title" style={{ fontSize: "1rem" }}>
              Basic Info
            </h2>
            <dl
              className="profile-fields"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 8,
              }}
            >
              <div className="profile-field" style={{ gridColumn: "1 / -1" }}>
                <dt className="profile-field__label">Full Name</dt>
                <dd className="profile-field__value">{data?.fullName || "-"}</dd>
              </div>
              <div className="profile-field" style={{ gridColumn: "1 / -1" }}>
                <dt className="profile-field__label">Email</dt>
                <dd className="profile-field__value">{data?.email || "-"}</dd>
              </div>
              <div className="profile-field">
                <dt className="profile-field__label">Phone</dt>
                <dd className="profile-field__value">{data?.phone || "-"}</dd>
              </div>
              <div className="profile-field">
                <dt className="profile-field__label">WhatsApp</dt>
                <dd className="profile-field__value">{data?.whatsappNumber || "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="profile-card">
            <h2 className="profile-header__title" style={{ fontSize: "1rem" }}>
              Account & Coach
            </h2>
            <dl className="profile-fields">
              <div className="profile-field">
                <dt className="profile-field__label">Role</dt>
                <dd
                  className="profile-field__value"
                  style={{ textTransform: "capitalize" }}
                >
                  {data?.role || "-"}
                </dd>
              </div>
              <div className="profile-field">
                <dt className="profile-field__label">Coach Code</dt>
                <dd className="profile-field__value">{data?.coachCode || "-"}</dd>
              </div>
              <div className="profile-field">
                <dt className="profile-field__label">Joined On</dt>
                <dd className="profile-field__value">{formatDate(data?.createdAt)}</dd>
              </div>
            </dl>
          </div>

          {data?.role === "client" && (
            <div className="profile-card">
              <h2 className="profile-header__title" style={{ fontSize: "1rem" }}>
                Health Overview
              </h2>
              <dl className="profile-fields">
                <div className="profile-field">
                  <dt className="profile-field__label">Weight</dt>
                  <dd className="profile-field__value">
                    {typeof data?.weight === "number" ? `${data.weight} kg` : "-"}
                  </dd>
                </div>
                <div className="profile-field">
                  <dt className="profile-field__label">Height</dt>
                  <dd className="profile-field__value">
                    {typeof data?.height === "number" ? `${data.height} cm` : "-"}
                  </dd>
                </div>
                <div className="profile-field">
                  <dt className="profile-field__label">BMI</dt>
                  <dd className="profile-field__value">
                    {typeof data?.bmi === "number" ? data.bmi : "-"}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {data?.role === "coach" && (
            <div className="profile-card" style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <h2 className="profile-header__title" style={{ fontSize: "1rem" }}>
                  Coach Information
                </h2>
                {!coachInfoEditing && (
                  <button
                    type="button"
                    className="btn btn--outline"
                    style={{ fontSize: "0.8rem", paddingInline: "0.75rem", paddingBlock: "0.25rem" }}
                    onClick={startEditCoachInfo}
                  >
                    Edit
                  </button>
                )}
              </div>

              {!coachInfoEditing && (
                <div className="profile-fields" style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                  <div className="profile-field">
                    <dt className="profile-field__label">Specialization</dt>
                    <dd className="profile-field__value">{data?.specialization || "-"}</dd>
                  </div>
                  <div className="profile-field">
                    <dt className="profile-field__label">Experience (years)</dt>
                    <dd className="profile-field__value">
                      {typeof data?.experienceYears === "number" ? `${data.experienceYears} years` : "-"}
                    </dd>
                  </div>
                  <div className="profile-field" style={{ gridColumn: "1 / -1" }}>
                    <dt className="profile-field__label">About Me / Description</dt>
                    <dd className="profile-field__value" style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                      {data?.description || "-"}
                    </dd>
                  </div>
                </div>
              )}

              {coachInfoEditing && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="client-form" style={{ gap: 8 }}>
                    <div className="client-form__row">
                      <label className="client-form__label">Specialization</label>
                      <input
                        className="client-form__control"
                        type="text"
                        placeholder="e.g., Weight Loss, Muscle Gain, Sports Nutrition"
                        value={coachInfoValue.specialization}
                        onChange={(e) => setCoachInfoValue((prev) => ({ ...prev, specialization: e.target.value }))}
                      />
                    </div>
                    <div className="client-form__row">
                      <label className="client-form__label">Experience (years)</label>
                      <input
                        className="client-form__control"
                        type="number"
                        min="0"
                        max="50"
                        placeholder="e.g., 5"
                        value={coachInfoValue.experienceYears}
                        onChange={(e) => setCoachInfoValue((prev) => ({ ...prev, experienceYears: e.target.value }))}
                      />
                    </div>
                    <div className="client-form__row client-form__row--full">
                      <label className="client-form__label">About Me / Description</label>
                      <textarea
                        className="client-form__control"
                        rows={6}
                        maxLength={1000}
                        placeholder="Tell potential clients about yourself, your achievements, certifications, coaching philosophy, success stories, etc."
                        value={coachInfoValue.description}
                        onChange={(e) => setCoachInfoValue((prev) => ({ ...prev, description: e.target.value }))}
                        style={{ resize: "vertical", fontFamily: "inherit" }}
                      />
                      <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.25rem" }}>
                        {coachInfoValue.description.length}/1000 characters
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={cancelEditCoachInfo}
                      disabled={coachInfoSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={saveCoachInfo}
                      disabled={coachInfoSaving}
                    >
                      {coachInfoSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {data?.role === "coach" && (
            <div className="profile-card" style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <h2 className="profile-header__title" style={{ fontSize: "1rem" }}>
                  Social Media Links
                </h2>
                {!socialMediaEditing && (
                  <button
                    type="button"
                    className="btn btn--outline"
                    style={{ fontSize: "0.8rem", paddingInline: "0.75rem", paddingBlock: "0.25rem" }}
                    onClick={startEditSocialMedia}
                  >
                    Edit
                  </button>
                )}
              </div>

              {!socialMediaEditing && (
                <div className="profile-fields" style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                  <div className="profile-field">
                    <dt className="profile-field__label">Instagram</dt>
                    <dd className="profile-field__value" style={{ wordBreak: "break-all" }}>{data?.socialMedia?.instagram || "-"}</dd>
                  </div>
                  <div className="profile-field">
                    <dt className="profile-field__label">Facebook</dt>
                    <dd className="profile-field__value" style={{ wordBreak: "break-all" }}>{data?.socialMedia?.facebook || "-"}</dd>
                  </div>
                  <div className="profile-field">
                    <dt className="profile-field__label">Twitter</dt>
                    <dd className="profile-field__value" style={{ wordBreak: "break-all" }}>{data?.socialMedia?.twitter || "-"}</dd>
                  </div>
                  <div className="profile-field">
                    <dt className="profile-field__label">LinkedIn</dt>
                    <dd className="profile-field__value" style={{ wordBreak: "break-all" }}>{data?.socialMedia?.linkedin || "-"}</dd>
                  </div>
                  <div className="profile-field">
                    <dt className="profile-field__label">YouTube</dt>
                    <dd className="profile-field__value" style={{ wordBreak: "break-all" }}>{data?.socialMedia?.youtube || "-"}</dd>
                  </div>
                  <div className="profile-field">
                    <dt className="profile-field__label">Website</dt>
                    <dd className="profile-field__value" style={{ wordBreak: "break-all" }}>{data?.socialMedia?.website || "-"}</dd>
                  </div>
                </div>
              )}

              {socialMediaEditing && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="client-form" style={{ gap: 8 }}>
                    <div className="client-form__row">
                      <label className="client-form__label">Instagram URL</label>
                      <input
                        className="client-form__control"
                        type="url"
                        placeholder="https://instagram.com/yourprofile"
                        value={socialMediaValue.instagram}
                        onChange={(e) => setSocialMediaValue((prev) => ({ ...prev, instagram: e.target.value }))}
                      />
                    </div>
                    <div className="client-form__row">
                      <label className="client-form__label">Facebook URL</label>
                      <input
                        className="client-form__control"
                        type="url"
                        placeholder="https://facebook.com/yourpage"
                        value={socialMediaValue.facebook}
                        onChange={(e) => setSocialMediaValue((prev) => ({ ...prev, facebook: e.target.value }))}
                      />
                    </div>
                    <div className="client-form__row">
                      <label className="client-form__label">Twitter URL</label>
                      <input
                        className="client-form__control"
                        type="url"
                        placeholder="https://twitter.com/yourprofile"
                        value={socialMediaValue.twitter}
                        onChange={(e) => setSocialMediaValue((prev) => ({ ...prev, twitter: e.target.value }))}
                      />
                    </div>
                    <div className="client-form__row">
                      <label className="client-form__label">LinkedIn URL</label>
                      <input
                        className="client-form__control"
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={socialMediaValue.linkedin}
                        onChange={(e) => setSocialMediaValue((prev) => ({ ...prev, linkedin: e.target.value }))}
                      />
                    </div>
                    <div className="client-form__row">
                      <label className="client-form__label">YouTube URL</label>
                      <input
                        className="client-form__control"
                        type="url"
                        placeholder="https://youtube.com/@yourchannel"
                        value={socialMediaValue.youtube}
                        onChange={(e) => setSocialMediaValue((prev) => ({ ...prev, youtube: e.target.value }))}
                      />
                    </div>
                    <div className="client-form__row">
                      <label className="client-form__label">Website URL</label>
                      <input
                        className="client-form__control"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={socialMediaValue.website}
                        onChange={(e) => setSocialMediaValue((prev) => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={cancelEditSocialMedia}
                      disabled={socialMediaSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={saveSocialMedia}
                      disabled={socialMediaSaving}
                    >
                      {socialMediaSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {data?.role === "coach" && (
            <>
              {/* Awards & Achievements Gallery */}
              <div className="profile-card" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <h2 className="profile-header__title" style={{ fontSize: "1rem" }}>
                    Awards & Achievements
                  </h2>
                </div>
                <p className="profile-header__subtitle" style={{ fontSize: "0.85rem", marginTop: "0.5rem", marginBottom: "1rem" }}>
                  Upload certificates, awards, and achievements (max 10 images)
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                  {data.awards?.slice(awardsPage * ITEMS_PER_PAGE, (awardsPage + 1) * ITEMS_PER_PAGE).map((award) => (
                    <div key={award.publicId} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                      <Image src={award.url} alt="Award" width={200} height={200} style={{ width: "100%", height: "200px", objectFit: "cover", filter: "brightness(1.2)" }} loading="lazy" />
                      <button
                        type="button"
                        className="btn btn--ghost"
                        style={{
                          position: "absolute",
                          top: "0.5rem",
                          right: "0.5rem",
                          fontSize: "0.75rem",
                          paddingInline: "0.5rem",
                          paddingBlock: "0.25rem",
                          backgroundColor: "rgba(255,255,255,0.9)"
                        }}
                        onClick={async () => {
                          if (confirm("Delete this award image?")) {
                            try {
                              await api.delete(`/users/awards/${encodeURIComponent(award.publicId)}`);
                              queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
                            } catch (err) {
                              // Error deleting award
                            }
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
                
                {data.awards && data.awards.length > ITEMS_PER_PAGE && (
                  <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => setAwardsPage(p => Math.max(0, p - 1))}
                      disabled={awardsPage === 0}
                      style={{ fontSize: "0.9rem", paddingInline: "1rem", paddingBlock: "0.5rem" }}
                    >
                      Previous
                    </button>
                    <span style={{ display: "flex", alignItems: "center", fontSize: "0.9rem", color: "#6b7280" }}>
                      Page {awardsPage + 1} of {Math.ceil(data.awards.length / ITEMS_PER_PAGE)}
                    </span>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => setAwardsPage(p => Math.min(Math.ceil((data.awards?.length || 0) / ITEMS_PER_PAGE) - 1, p + 1))}
                      disabled={awardsPage >= Math.ceil((data.awards?.length || 0) / ITEMS_PER_PAGE) - 1}
                      style={{ fontSize: "0.9rem", paddingInline: "1rem", paddingBlock: "0.5rem" }}
                    >
                      Next
                    </button>
                  </div>
                )}
                
                {(!data.awards || data.awards.length < 10) && (
                  <div style={{ marginTop: "1rem" }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="award-upload"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("image", file);
                        try {
                          await api.post("/users/upload-award", formData, {
                            headers: { "Content-Type": "multipart/form-data" }
                          });
                          queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
                          e.target.value = "";
                        } catch (err) {
                          alert("Failed to upload image");
                        }
                      }}
                    />
                    <label htmlFor="award-upload">
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => document.getElementById("award-upload")?.click()}
                        style={{ fontSize: "0.9rem" }}
                      >
                        Upload Award Image
                      </button>
                    </label>
                  </div>
                )}
              </div>

              {/* Transformation Results Gallery */}
              <div className="profile-card" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <h2 className="profile-header__title" style={{ fontSize: "1rem" }}>
                    Transformation Results
                  </h2>
                </div>
                <p className="profile-header__subtitle" style={{ fontSize: "0.85rem", marginTop: "0.5rem", marginBottom: "1rem" }}>
                  Upload client transformation photos (max 20 images)
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                  {data.transformations?.slice(transformationsPage * ITEMS_PER_PAGE, (transformationsPage + 1) * ITEMS_PER_PAGE).map((transformation) => (
                    <div key={transformation.publicId} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                      <Image src={transformation.url} alt="Transformation" width={200} height={200} style={{ width: "100%", height: "200px", objectFit: "cover", filter: "brightness(1.2)" }} loading="lazy" />
                      <button
                        type="button"
                        className="btn btn--ghost"
                        style={{
                          position: "absolute",
                          top: "0.5rem",
                          right: "0.5rem",
                          fontSize: "0.75rem",
                          paddingInline: "0.5rem",
                          paddingBlock: "0.25rem",
                          backgroundColor: "rgba(255,255,255,0.9)"
                        }}
                        onClick={async () => {
                          if (confirm("Delete this transformation image?")) {
                            try {
                              await api.delete(`/users/transformations/${encodeURIComponent(transformation.publicId)}`);
                              queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
                            } catch (err) {
                              // Error deleting transformation
                            }
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
                
                {data.transformations && data.transformations.length > ITEMS_PER_PAGE && (
                  <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => setTransformationsPage(p => Math.max(0, p - 1))}
                      disabled={transformationsPage === 0}
                      style={{ fontSize: "0.9rem", paddingInline: "1rem", paddingBlock: "0.5rem" }}
                    >
                      Previous
                    </button>
                    <span style={{ display: "flex", alignItems: "center", fontSize: "0.9rem", color: "#6b7280" }}>
                      Page {transformationsPage + 1} of {Math.ceil(data.transformations.length / ITEMS_PER_PAGE)}
                    </span>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => setTransformationsPage(p => Math.min(Math.ceil((data.transformations?.length || 0) / ITEMS_PER_PAGE) - 1, p + 1))}
                      disabled={transformationsPage >= Math.ceil((data.transformations?.length || 0) / ITEMS_PER_PAGE) - 1}
                      style={{ fontSize: "0.9rem", paddingInline: "1rem", paddingBlock: "0.5rem" }}
                    >
                      Next
                    </button>
                  </div>
                )}
                
                {(!data.transformations || data.transformations.length < 20) && (
                  <div style={{ marginTop: "1rem" }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="transformation-upload"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("image", file);
                        try {
                          await api.post("/users/upload-transformation", formData, {
                            headers: { "Content-Type": "multipart/form-data" }
                          });
                          queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
                          e.target.value = "";
                        } catch (err) {
                          alert("Failed to upload image");
                        }
                      }}
                    />
                    <label htmlFor="transformation-upload">
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => document.getElementById("transformation-upload")?.click()}
                        style={{ fontSize: "0.9rem" }}
                      >
                        Upload Transformation Image
                      </button>
                    </label>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="profile-card" style={{ gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <h2 className="profile-header__title" style={{ fontSize: "1rem" }}>
                Address
              </h2>
              {!addressEditing && (
                <button
                  type="button"
                  className="btn btn--outline"
                  style={{ fontSize: "0.8rem", paddingInline: "0.75rem", paddingBlock: "0.25rem" }}
                  onClick={startEditAddress}
                >
                  Edit
                </button>
              )}
            </div>

            {!addressEditing && (
              <div className="profile-fields" style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                <div className="profile-field" style={{ gridColumn: "1 / -1" }}>
                  <dt className="profile-field__label">Address Line 1</dt>
                  <dd className="profile-field__value">{currentAddress?.line1 || "-"}</dd>
                </div>
                <div className="profile-field" style={{ gridColumn: "1 / -1" }}>
                  <dt className="profile-field__label">Address Line 2</dt>
                  <dd className="profile-field__value">{currentAddress?.line2 || "-"}</dd>
                </div>
                <div className="profile-field">
                  <dt className="profile-field__label">Phone Number</dt>
                  <dd className="profile-field__value">{currentAddress?.phoneNumber || "-"}</dd>
                </div>
                <div className="profile-field">
                  <dt className="profile-field__label">Neighborhood / Locality</dt>
                  <dd className="profile-field__value">{currentAddress?.neighborhood || "-"}</dd>
                </div>
                <div className="profile-field">
                  <dt className="profile-field__label">City / Town</dt>
                  <dd className="profile-field__value">{currentAddress?.city || "-"}</dd>
                </div>
                <div className="profile-field">
                  <dt className="profile-field__label">State / Province / Region</dt>
                  <dd className="profile-field__value">{currentAddress?.state || "-"}</dd>
                </div>
                <div className="profile-field">
                  <dt className="profile-field__label">Postal Code / ZIP / PIN</dt>
                  <dd className="profile-field__value">{currentAddress?.postalCode || "-"}</dd>
                </div>
                <div className="profile-field">
                  <dt className="profile-field__label">Country</dt>
                  <dd className="profile-field__value">{currentAddress?.country || "-"}</dd>
                </div>
                {!currentAddress && (
                  <p className="profile-header__subtitle" style={{ marginTop: 8 }}>
                    No address added yet.
                  </p>
                )}
              </div>
            )}

            {addressEditing && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="client-form" style={{ gap: 8 }}>
                  <div className="client-form__row client-form__row--full">
                    <label className="client-form__label">Address Line 1</label>
                    <input
                      className="client-form__control"
                      type="text"
                      placeholder="House/flat number, building, street"
                      value={addressValue.line1}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, line1: e.target.value }))}
                    />
                  </div>
                  <div className="client-form__row client-form__row--full">
                    <label className="client-form__label">Address Line 2 (optional)</label>
                    <input
                      className="client-form__control"
                      type="text"
                      placeholder="Apartment, area, landmark"
                      value={addressValue.line2}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, line2: e.target.value }))}
                    />
                  </div>
                  <div className="client-form__row">
                    <label className="client-form__label">Neighborhood / Locality</label>
                    <input
                      className="client-form__control"
                      type="text"
                      value={addressValue.neighborhood}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, neighborhood: e.target.value }))}
                    />
                  </div>
                  <div className="client-form__row">
                    <label className="client-form__label">City / Town</label>
                    <input
                      className="client-form__control"
                      type="text"
                      value={addressValue.city}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="client-form__row">
                    <label className="client-form__label">State / Province / Region</label>
                    <input
                      className="client-form__control"
                      type="text"
                      value={addressValue.state}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div className="client-form__row">
                    <label className="client-form__label">Postal Code / ZIP / PIN</label>
                    <input
                      className="client-form__control"
                      type="text"
                      value={addressValue.postalCode}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>
                  <div className="client-form__row">
                    <label className="client-form__label">Country</label>
                    <input
                      className="client-form__control"
                      type="text"
                      value={addressValue.country}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                  <div className="client-form__row">
                    <label className="client-form__label">Phone Number</label>
                    <input
                      className="client-form__control"
                      type="text"
                      value={addressValue.phoneNumber}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={cancelEditAddress}
                    disabled={addressSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={saveAddress}
                    disabled={addressSaving}
                  >
                    {addressSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Coach-only payment QR uploader */}
        {data?.role === "coach" && <PaymentQrUploader />}

        <section style={{ marginTop: "1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "stretch" }}>
          {/* Security Section */}
          <div className="profile-card" style={{ 
            flex: "1 1 320px", 
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column"
          }}>
            <h2 style={{ 
              fontSize: "1.125rem", 
              marginBottom: "0.5rem", 
              fontWeight: 600,
              color: "#1e293b"
            }}>
              Security
            </h2>
            <p style={{ 
              marginBottom: "1.25rem", 
              lineHeight: "1.6",
              color: "#64748b",
              fontSize: "0.9rem",
              flex: 1
            }}>
              Log out from all your devices and browsers.
            </p>
            <button
              type="button"
              className="btn btn--danger"
              onClick={async () => {
                const confirmed = window.confirm("Are you sure you want to logout from everywhere?");
                if (!confirmed) return;
                try {
                  await api.post("/auth/logout-all");
                } catch (err) {
                  // ignore backend error; proceed to clear local state
                } finally {
                  logout();
                  router.replace("/auth/login");
                }
              }}
              style={{ 
                width: "100%", 
                justifyContent: "center",
                padding: "0.75rem 1.25rem",
                fontSize: "0.95rem",
                fontWeight: 500
              }}
            >
              Logout from everywhere
            </button>
          </div>

          {/* Danger Zone */}
          {(data?.role === "client" || data?.role === "coach") && (
            <div className="profile-card" style={{ 
              flex: "1 1 320px",
              padding: "1.75rem",
              border: "2px solid #fecaca",
              background: "linear-gradient(135deg, rgba(254, 202, 202, 0.1) 0%, rgba(252, 165, 165, 0.05) 100%)",
              display: "flex",
              flexDirection: "column"
            }}>
              <h2 style={{ 
                fontSize: "1.125rem", 
                marginBottom: "0.5rem", 
                color: "#dc2626",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <span style={{ fontSize: "1.25rem" }}>⚠️</span>
                Danger Zone
              </h2>
              <p style={{ 
                marginBottom: "1.25rem", 
                lineHeight: "1.6",
                color: "#991b1b",
                fontSize: "0.9rem",
                flex: 1
              }}>
                Request permanent deletion of your account and all associated data. This action requires admin approval and cannot be undone once processed.
              </p>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => setShowDeletionDialog(true)}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  gap: "0.5rem",
                  width: "100%",
                  padding: "0.75rem 1.25rem",
                  fontSize: "0.95rem",
                  fontWeight: 500
                }}
              >
                <Trash2 style={{ width: "18px", height: "18px" }} />
                Request Account Deletion
              </button>
            </div>
          )}
        </section>

        {/* Deletion Request Dialog */}
        {showDeletionDialog && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1rem",
            }}
            onClick={() => !submittingDeletion && setShowDeletionDialog(false)}
          >
            <div
              className="profile-card"
              style={{
                maxWidth: "500px",
                width: "100%",
                margin: 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="profile-header__title" style={{ fontSize: "1.25rem", marginBottom: 12, color: "#dc2626" }}>
                Request Account Deletion
              </h2>
              <p className="profile-header__subtitle" style={{ marginBottom: 16 }}>
                Please tell us why you want to delete your account. This will help us improve our service.
                An admin will review your request before processing.
              </p>
              <textarea
                className="client-form__control"
                rows={5}
                maxLength={1000}
                placeholder="Reason for account deletion (required)"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                style={{ resize: "vertical", fontFamily: "inherit", width: "100%", marginBottom: "0.5rem" }}
                disabled={submittingDeletion}
              />
              <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem" }}>
                {deletionReason.length}/1000 characters
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setShowDeletionDialog(false);
                    setDeletionReason("");
                  }}
                  disabled={submittingDeletion}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={handleRequestDeletion}
                  disabled={submittingDeletion || !deletionReason.trim()}
                >
                  {submittingDeletion ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}