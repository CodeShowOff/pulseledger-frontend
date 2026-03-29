"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Camera,
  FileText,
  Link2,
  MapPin,
  Shield,
  Trash2,
  Upload,
  User,
  UserRoundCog,
} from "lucide-react";
import { useProfileQuery, PROFILE_QUERY_KEY } from "@/lib/queries/profile";
import { useMyDocumentsQuery } from "@/lib/queries/documents";
import api from "@/lib/axios";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const PaymentQrUploader = dynamic(() => import("@/components/coach/PaymentQrUploader"), { ssr: false });

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
};

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
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
  const awardInputRef = useRef<HTMLInputElement | null>(null);
  const transformationInputRef = useRef<HTMLInputElement | null>(null);
  const setAvatarUrl = useAuthStore((s) => s.setAvatarUrl);
  const storeAvatar = useAuthStore((s) => s.user?.avatarUrl);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const isClientProfile = data?.role === "client";
  const { data: myDocuments, isLoading: docsLoading } = useMyDocumentsQuery({
    enabled: isClientProfile,
  });

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

  if (isLoading) {
    return (
      <div className="space-y-4 px-[var(--page-gutter-inline)] pt-4 md:pt-6">
        <div className="h-[210px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`profile-loading-${idx}`}
              className="h-[180px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-[var(--page-gutter-inline)] pt-4 md:pt-6">
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="flex items-center gap-2 py-6">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <p className="text-sm font-medium text-rose-700">Unable to load your profile right now.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-[var(--page-gutter-inline)] pt-4 md:pt-6">
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-slate-600">No profile data is available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div className="space-y-5 px-[var(--page-gutter-inline)] pt-4 md:pt-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <motion.section variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.28 }}>
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-4 sm:gap-4 sm:p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Badge className="hidden w-fit border-white/25 bg-white/15 text-white sm:inline-flex">Profile Center</Badge>
                <CardTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                  <span className="inline-flex items-center gap-2">
                    <User className="h-5 w-5 sm:h-6 sm:w-6" />
                    My Profile
                  </span>
                </CardTitle>
                <CardDescription className="hidden max-w-2xl text-sm !text-white/90 sm:block md:text-base">
                  Your account, contact and health information in one polished workspace.
                </CardDescription>
              </div>

              <div className="hidden rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 sm:block sm:px-4 sm:py-3">
                <p className="text-[10px] uppercase tracking-wide text-blue-100 sm:text-[11px]">Current role</p>
                <p className="mt-1 text-sm font-semibold capitalize text-white">{data.role || "-"}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.28, delay: 0.04 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Camera className="h-4 w-4" />
              </span>
              Profile picture
            </CardTitle>
            <CardDescription className="hidden sm:block">Upload PNG, JPEG, or WebP image files up to 2 MB.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {storeAvatar || data.avatarUrl ? (
                <Image
                  src={storeAvatar || data.avatarUrl || ""}
                  alt="Profile avatar"
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-full object-cover"
                  priority
                />
              ) : (
                <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
                  {data.fullName?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-slate-900">{data.fullName || "User"}</p>
                <p className="text-xs text-slate-500">{data.email || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
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
                      setAvatarUrl(newUrl);
                      queryClient.setQueryData(PROFILE_QUERY_KEY, (prev: unknown) =>
                        prev ? { ...(prev as Record<string, unknown>), avatarUrl: newUrl } : prev
                      );
                    }
                  } catch {
                    // Error uploading avatar
                  } finally {
                    setUploading(false);
                    if (avatarInputRef.current) avatarInputRef.current.value = "";
                  }
                }}
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload new"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.08 }}
        className="grid gap-4 lg:grid-cols-2"
      >
        {data.role === "client" && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText className="h-4 w-4" />
                </span>
                My Documents
              </CardTitle>
              <CardDescription className="hidden sm:block">
                Upload and manage your medical reports, lab results, and other health documents in one place.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {docsLoading ? (
                <p className="text-sm text-slate-500">Loading your documents...</p>
              ) : myDocuments && myDocuments.length > 0 ? (
                <ul className="space-y-2">
                  {myDocuments.slice(0, 3).map((doc) => (
                    <li key={doc._id}>
                      <button
                        type="button"
                        onClick={() => window.open(doc.viewUrl, "_blank")}
                        className="rounded text-sm font-medium text-indigo-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                      >
                        {doc.name || doc.originalName}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">You haven&apos;t uploaded any documents yet.</p>
              )}

              {myDocuments && myDocuments.length > 3 ? (
                <p className="text-xs text-slate-500">and {myDocuments.length - 3} more...</p>
              ) : null}

              <div className="pt-1">
                <Button type="button" size="sm" onClick={() => router.push("/client/documents")}>
                  Go to My Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <User className="h-4 w-4" />
              </span>
              Basic Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 sm:col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Full name</dt>
                <dd className="mt-1 break-words text-sm font-medium text-slate-900">{data.fullName || "-"}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 sm:col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</dt>
                <dd className="mt-1 break-all text-sm font-medium text-slate-900">{data.email || "-"}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Phone</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{data.phone || "-"}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">WhatsApp</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{data.whatsappNumber || "-"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <UserRoundCog className="h-4 w-4" />
              </span>
              Account & Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Role</dt>
                <dd className="mt-1 text-sm font-medium capitalize text-slate-900">{data.role || "-"}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Coach code</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{data.coachCode || "-"}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Joined on</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{formatDate(data.createdAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {data.role === "client" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Health Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Weight</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {typeof data.weight === "number" ? `${data.weight} kg` : "-"}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Height</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {typeof data.height === "number" ? `${data.height} cm` : "-"}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">BMI</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {typeof data.bmi === "number" ? data.bmi : "-"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        {data.role === "coach" && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base md:text-lg">Coach Information</CardTitle>
                {!coachInfoEditing ? (
                  <Button type="button" variant="outline" size="sm" onClick={startEditCoachInfo}>
                    Edit
                  </Button>
                ) : null}
              </div>
            </CardHeader>

            <CardContent>
              {!coachInfoEditing ? (
                <dl className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Specialization</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">{data.specialization || "-"}</dd>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Experience (years)</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">
                      {typeof data.experienceYears === "number" ? `${data.experienceYears} years` : "-"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 sm:col-span-2">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">About me / description</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {data.description || "-"}
                    </dd>
                  </div>
                </dl>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="coach-specialization" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Specialization
                      </label>
                      <Input
                        id="coach-specialization"
                        type="text"
                        placeholder="e.g., Weight Loss, Muscle Gain, Sports Nutrition"
                        value={coachInfoValue.specialization}
                        onChange={(e) =>
                          setCoachInfoValue((prev) => ({ ...prev, specialization: e.target.value }))
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="coach-experience" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Experience (years)
                      </label>
                      <Input
                        id="coach-experience"
                        type="number"
                        min="0"
                        max="50"
                        placeholder="e.g., 5"
                        value={coachInfoValue.experienceYears}
                        onChange={(e) =>
                          setCoachInfoValue((prev) => ({ ...prev, experienceYears: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="coach-description" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      About me / description
                    </label>
                    <textarea
                      id="coach-description"
                      rows={6}
                      maxLength={1000}
                      placeholder="Tell potential clients about yourself, achievements, certifications, coaching philosophy, and success stories."
                      value={coachInfoValue.description}
                      onChange={(e) =>
                        setCoachInfoValue((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                    />
                    <p className="text-xs text-slate-500">{coachInfoValue.description.length}/1000 characters</p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={cancelEditCoachInfo} disabled={coachInfoSaving}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={saveCoachInfo} disabled={coachInfoSaving}>
                      {coachInfoSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {data.role === "coach" && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Link2 className="h-4 w-4" />
                  </span>
                  Social Media Links
                </CardTitle>
                {!socialMediaEditing ? (
                  <Button type="button" variant="outline" size="sm" onClick={startEditSocialMedia}>
                    Edit
                  </Button>
                ) : null}
              </div>
            </CardHeader>

            <CardContent>
              {!socialMediaEditing ? (
                <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Instagram", value: data.socialMedia?.instagram || "-" },
                    { label: "Facebook", value: data.socialMedia?.facebook || "-" },
                    { label: "Twitter", value: data.socialMedia?.twitter || "-" },
                    { label: "LinkedIn", value: data.socialMedia?.linkedin || "-" },
                    { label: "YouTube", value: data.socialMedia?.youtube || "-" },
                    { label: "Website", value: data.socialMedia?.website || "-" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</dt>
                      <dd className="mt-1 break-all text-sm font-medium text-slate-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="instagram-url" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Instagram URL
                      </label>
                      <Input
                        id="instagram-url"
                        type="url"
                        placeholder="https://instagram.com/yourprofile"
                        value={socialMediaValue.instagram}
                        onChange={(e) => setSocialMediaValue((prev) => ({ ...prev, instagram: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="facebook-url" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Facebook URL
                      </label>
                      <Input
                        id="facebook-url"
                        type="url"
                        placeholder="https://facebook.com/yourpage"
                        value={socialMediaValue.facebook}
                        onChange={(e) => setSocialMediaValue((prev) => ({ ...prev, facebook: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="twitter-url" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Twitter URL
                      </label>
                      <Input
                        id="twitter-url"
                        type="url"
                        placeholder="https://twitter.com/yourprofile"
                        value={socialMediaValue.twitter}
                        onChange={(e) => setSocialMediaValue((prev) => ({ ...prev, twitter: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="linkedin-url" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        LinkedIn URL
                      </label>
                      <Input
                        id="linkedin-url"
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={socialMediaValue.linkedin}
                        onChange={(e) => setSocialMediaValue((prev) => ({ ...prev, linkedin: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="youtube-url" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        YouTube URL
                      </label>
                      <Input
                        id="youtube-url"
                        type="url"
                        placeholder="https://youtube.com/@yourchannel"
                        value={socialMediaValue.youtube}
                        onChange={(e) => setSocialMediaValue((prev) => ({ ...prev, youtube: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="website-url" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Website URL
                      </label>
                      <Input
                        id="website-url"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={socialMediaValue.website}
                        onChange={(e) => setSocialMediaValue((prev) => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={cancelEditSocialMedia}
                      disabled={socialMediaSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="button" onClick={saveSocialMedia} disabled={socialMediaSaving}>
                      {socialMediaSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {data.role === "coach" ? (
          <>
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Awards & Achievements</CardTitle>
                <CardDescription className="hidden sm:block">
                  Upload certificates, awards, and achievements (max 10 images).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.awards && data.awards.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {data.awards
                      .slice(awardsPage * ITEMS_PER_PAGE, (awardsPage + 1) * ITEMS_PER_PAGE)
                      .map((award) => (
                        <div key={award.publicId} className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          <Image
                            src={award.url}
                            alt="Award"
                            width={280}
                            height={220}
                            className="h-[220px] w-full object-contain"
                            loading="lazy"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute right-2 top-2 h-7 px-2 text-[11px]"
                            onClick={async () => {
                              if (window.confirm("Delete this award image?")) {
                                try {
                                  await api.delete(`/users/awards/${encodeURIComponent(award.publicId)}`);
                                  queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
                                } catch {
                                  // Error deleting award
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No awards uploaded yet.</p>
                )}

                {data.awards && data.awards.length > ITEMS_PER_PAGE ? (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setAwardsPage((p) => Math.max(0, p - 1))}
                      disabled={awardsPage === 0}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-slate-500">
                      Page {awardsPage + 1} of {Math.ceil(data.awards.length / ITEMS_PER_PAGE)}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setAwardsPage((p) =>
                          Math.min(Math.ceil((data.awards?.length || 0) / ITEMS_PER_PAGE) - 1, p + 1)
                        )
                      }
                      disabled={awardsPage >= Math.ceil((data.awards?.length || 0) / ITEMS_PER_PAGE) - 1}
                    >
                      Next
                    </Button>
                  </div>
                ) : null}

                {(!data.awards || data.awards.length < 10) ? (
                  <div>
                    <input
                      ref={awardInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("image", file);

                        try {
                          await api.post("/users/upload-award", formData, {
                            headers: { "Content-Type": "multipart/form-data" },
                          });
                          queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
                          e.target.value = "";
                        } catch {
                          alert("Failed to upload image");
                        }
                      }}
                    />
                    <Button type="button" size="sm" onClick={() => awardInputRef.current?.click()}>
                      <Upload className="h-4 w-4" />
                      Upload Award Image
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Transformation Results</CardTitle>
                <CardDescription className="hidden sm:block">
                  Upload client transformation photos (max 20 images).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.transformations && data.transformations.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {data.transformations
                      .slice(transformationsPage * ITEMS_PER_PAGE, (transformationsPage + 1) * ITEMS_PER_PAGE)
                      .map((transformation) => (
                        <div
                          key={transformation.publicId}
                          className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                        >
                          <Image
                            src={transformation.url}
                            alt="Transformation"
                            width={280}
                            height={220}
                            className="h-[220px] w-full object-contain"
                            loading="lazy"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute right-2 top-2 h-7 px-2 text-[11px]"
                            onClick={async () => {
                              if (window.confirm("Delete this transformation image?")) {
                                try {
                                  await api.delete(`/users/transformations/${encodeURIComponent(transformation.publicId)}`);
                                  queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
                                } catch {
                                  // Error deleting transformation
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No transformation images uploaded yet.</p>
                )}

                {data.transformations && data.transformations.length > ITEMS_PER_PAGE ? (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setTransformationsPage((p) => Math.max(0, p - 1))}
                      disabled={transformationsPage === 0}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-slate-500">
                      Page {transformationsPage + 1} of {Math.ceil(data.transformations.length / ITEMS_PER_PAGE)}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setTransformationsPage((p) =>
                          Math.min(Math.ceil((data.transformations?.length || 0) / ITEMS_PER_PAGE) - 1, p + 1)
                        )
                      }
                      disabled={
                        transformationsPage >= Math.ceil((data.transformations?.length || 0) / ITEMS_PER_PAGE) - 1
                      }
                    >
                      Next
                    </Button>
                  </div>
                ) : null}

                {(!data.transformations || data.transformations.length < 20) ? (
                  <div>
                    <input
                      ref={transformationInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("image", file);

                        try {
                          await api.post("/users/upload-transformation", formData, {
                            headers: { "Content-Type": "multipart/form-data" },
                          });
                          queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
                          e.target.value = "";
                        } catch {
                          alert("Failed to upload image");
                        }
                      }}
                    />
                    <Button type="button" size="sm" onClick={() => transformationInputRef.current?.click()}>
                      <Upload className="h-4 w-4" />
                      Upload Transformation Image
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </>
        ) : null}

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <MapPin className="h-4 w-4" />
                </span>
                Address
              </CardTitle>

              {!addressEditing ? (
                <Button type="button" variant="outline" size="sm" onClick={startEditAddress}>
                  Edit
                </Button>
              ) : null}
            </div>
          </CardHeader>

          <CardContent>
            {!addressEditing ? (
              <div className="space-y-2">
                <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Address line 1", value: currentAddress?.line1 || "-", full: true },
                    { label: "Address line 2", value: currentAddress?.line2 || "-", full: true },
                    { label: "Phone number", value: currentAddress?.phoneNumber || "-" },
                    { label: "Neighborhood / locality", value: currentAddress?.neighborhood || "-" },
                    { label: "City / town", value: currentAddress?.city || "-" },
                    { label: "State / province / region", value: currentAddress?.state || "-" },
                    { label: "Postal code / ZIP / PIN", value: currentAddress?.postalCode || "-" },
                    { label: "Country", value: currentAddress?.country || "-" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 ${
                        item.full ? "sm:col-span-2 lg:col-span-3" : ""
                      }`}
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>

                {!currentAddress ? <p className="text-sm text-slate-500">No address added yet.</p> : null}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                    <label htmlFor="address-line1" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Address line 1
                    </label>
                    <Input
                      id="address-line1"
                      type="text"
                      placeholder="House/flat number, building, street"
                      value={addressValue.line1}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, line1: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                    <label htmlFor="address-line2" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Address line 2 (optional)
                    </label>
                    <Input
                      id="address-line2"
                      type="text"
                      placeholder="Apartment, area, landmark"
                      value={addressValue.line2}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, line2: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="address-neighborhood" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Neighborhood / locality
                    </label>
                    <Input
                      id="address-neighborhood"
                      type="text"
                      value={addressValue.neighborhood}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, neighborhood: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="address-city" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      City / town
                    </label>
                    <Input
                      id="address-city"
                      type="text"
                      value={addressValue.city}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="address-state" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      State / province / region
                    </label>
                    <Input
                      id="address-state"
                      type="text"
                      value={addressValue.state}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="address-postal" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Postal code / ZIP / PIN
                    </label>
                    <Input
                      id="address-postal"
                      type="text"
                      value={addressValue.postalCode}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="address-country" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Country
                    </label>
                    <Input
                      id="address-country"
                      type="text"
                      value={addressValue.country}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="address-phone" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Phone number
                    </label>
                    <Input
                      id="address-phone"
                      type="text"
                      value={addressValue.phoneNumber}
                      onChange={(e) => setAddressValue((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={cancelEditAddress} disabled={addressSaving}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={saveAddress} disabled={addressSaving}>
                    {addressSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {data.role === "coach" ? (
        <motion.section variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.28, delay: 0.12 }}>
          <PaymentQrUploader />
        </motion.section>
      ) : null}

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.16 }}
        className="grid gap-4 lg:grid-cols-2"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Shield className="h-4 w-4" />
              </span>
              Security
            </CardTitle>
            <CardDescription className="hidden sm:block">Log out from all your devices and browsers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="destructive"
              className="w-full justify-center"
              onClick={async () => {
                const confirmed = window.confirm("Are you sure you want to logout from everywhere?");
                if (!confirmed) return;
                try {
                  await api.post("/auth/logout-all");
                } catch {
                  // ignore backend error; proceed to clear local state
                } finally {
                  logout();
                  router.replace("/auth/login");
                }
              }}
            >
              Logout from everywhere
            </Button>
          </CardContent>
        </Card>

        {data.role === "client" || data.role === "coach" ? (
          <Card className="border-rose-200 bg-gradient-to-br from-rose-50/90 to-red-50/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-rose-700 md:text-lg">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </CardTitle>
              <CardDescription className="hidden text-rose-600/80 sm:block">
                Request permanent deletion of your account and associated data. This action requires admin approval.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="destructive"
                className="w-full justify-center"
                onClick={() => setShowDeletionDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Request Account Deletion
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </motion.section>

      {showDeletionDialog ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => !submittingDeletion && setShowDeletionDialog(false)}
        >
          <Card
            className="w-full max-w-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deletion-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-3">
              <CardTitle id="deletion-dialog-title" className="flex items-center gap-2 text-base text-rose-700 md:text-lg">
                <AlertTriangle className="h-4 w-4" />
                Request Account Deletion
              </CardTitle>
              <CardDescription className="hidden sm:block">
                Please tell us why you want to delete your account. An admin will review your request before
                processing.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="deletion-reason" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reason for account deletion
                </label>
                <textarea
                  id="deletion-reason"
                  rows={5}
                  maxLength={1000}
                  placeholder="Reason for account deletion (required)"
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                  disabled={submittingDeletion}
                />
                <p className="text-xs text-slate-500">{deletionReason.length}/1000 characters</p>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDeletionDialog(false);
                    setDeletionReason("");
                  }}
                  disabled={submittingDeletion}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRequestDeletion}
                  disabled={submittingDeletion || !deletionReason.trim()}
                >
                  {submittingDeletion ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </motion.div>
  );
}