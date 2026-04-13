import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const PROFILE_QUERY_KEY = ["profile"] as const;

export type ProfileResponse = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  paymentQrUrl?: string | null;
  paymentQrPublicId?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  address?: {
    phoneNumber?: string | null;
    line1?: string | null;
    line2?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
  specialization?: string;
  experienceYears?: number;
  description?: string | null;
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
  // These health metrics are computed on the backend from the latest history arrays
  bmi?: number;
  weight?: number;
  height?: number;
  coachCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
  planSummary?: {
    current?: {
      type: "subscription" | "default" | null;
      subscriptionId?: string | null;
      planId?: string | null;
      planTitle?: string | null;
      goal?: string | null;
      price?: number | null;
      durationWeeks?: number | null;
      status?: string | null;
      startDate?: string | null;
      endDate?: string | null;
      isDefault?: boolean;
    } | null;
    pending?: Array<{
      subscriptionId: string;
      planId: string | null;
      planTitle: string | null;
      amount: number;
      durationWeeks: number | null;
      requestedAt: string | null;
      status: string;
    }>;
    defaultPlan?: {
      _id?: string;
      title?: string;
      description?: string;
      goal?: string;
      durationWeeks?: number;
      price?: number;
      isDefault?: boolean;
    } | null;
  };
};

const fetchProfile = async (): Promise<ProfileResponse> => {
  const res = await api.get("/users/me");
  return res.data.data;
};

export function useProfileQuery() {
  return useQuery({ queryKey: PROFILE_QUERY_KEY, queryFn: fetchProfile });
}