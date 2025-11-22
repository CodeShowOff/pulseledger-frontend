"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const fetchCoachStats = async () => {
  const res = await api.get("/coach/stats");
  return res.data;
};

const CoachStats = React.memo(function CoachStats() {
  const { data, isLoading } = useQuery({ queryKey: ["coachStats"], queryFn: fetchCoachStats });

  const items = useMemo(
    () => [
      { label: "Total Clients", value: data?.clients || 0 },
      { label: "Active Plans", value: data?.plans || 0 },
      { label: "Products Listed", value: data?.products || 0 },
    ],
    [data]
  );

  if (isLoading) {
    return <p>Loading stats...</p>;
  }

  return (
    <>
      {items.map((stat) => (
        <div key={stat.label} className="admin-card admin-card--stat">
          <p className="admin-card__label">{stat.label}</p>
          <p className="admin-card__value">{stat.value}</p>
        </div>
      ))}
    </>
  );
});

export default CoachStats;
