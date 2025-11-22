// src/components/client/CoachProfileCard.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

export default function CoachProfileCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/users/me");
      return res.data.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  const user = data;
  const coach = user?.assignedCoach ? user.assignedCoach : user?.coach; // depending on shape

  // If assignedCoach is id, fetch coach details separately:
  // For simplicity assume /users/me returns populated assignedCoach object with contact fields.

  if (!coach) return <div>No coach assigned</div>;

  return (
    <div className="bg-white rounded-xl p-4 border shadow-sm">
      <h4 className="text-lg font-semibold">Your Coach</h4>
      <div className="mt-2">
        <div className="text-md font-medium">{coach.fullName}</div>
        <div className="text-sm text-gray-500">{coach.email}</div>
        <div className="mt-3 flex items-center gap-2">
          <WhatsAppButton
            phone={coach.whatsappNumber || coach.phone}
            prefill={`Hi ${coach.fullName}, this is ${user.fullName}.`}
            label="Message Coach"
          />
        </div>
      </div>
    </div>
  );
}
