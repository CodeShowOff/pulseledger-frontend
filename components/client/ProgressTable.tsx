// src/components/client/ProgressTable.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CLIENT_PROGRESS_QUERY_KEY,
  ClientProgressEntry,
  fetchClientProgressEntries,
} from "@/lib/queries/clientProgress";

export default function ProgressTable() {
  const [viewMode, setViewMode] = useState<"all" | "basic" | "scale" | "vitals">("basic");
  
  const { data: response, isLoading } = useQuery({
    queryKey: CLIENT_PROGRESS_QUERY_KEY,
    queryFn: () => fetchClientProgressEntries(),
  });

  if (isLoading)
    return <p className="client-card__subtitle">Loading progress history...</p>;
  if (!response || !response.data || response.data.length === 0)
    return <p className="client-card__subtitle">No progress history yet</p>;

  const data = response.data;
  const profile = response.profile;
  const totalEntries = data.length;
  const latestEntry = data[0];

  return (
    <>
      <div className="client-meta-row" style={{ marginBottom: "0.75rem" }}>
        <span>Total entries: {totalEntries}</span>
        {latestEntry && (
          <span>
            Last entry: {new Date(latestEntry.date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* View Mode Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setViewMode("basic")}
          className={`btn ${viewMode === "basic" ? "btn--primary" : "btn--outline"}`}
          style={{ fontSize: "0.9rem" }}
        >
          Basic
        </button>
        <button
          type="button"
          onClick={() => setViewMode("scale")}
          className={`btn ${viewMode === "scale" ? "btn--primary" : "btn--outline"}`}
          style={{ fontSize: "0.9rem" }}
        >
          Smart Scale
        </button>
        <button
          type="button"
          onClick={() => setViewMode("vitals")}
          className={`btn ${viewMode === "vitals" ? "btn--primary" : "btn--outline"}`}
          style={{ fontSize: "0.9rem" }}
        >
          Vitals
        </button>
        <button
          type="button"
          onClick={() => setViewMode("all")}
          className={`btn ${viewMode === "all" ? "btn--primary" : "btn--outline"}`}
          style={{ fontSize: "0.9rem" }}
        >
          All Data
        </button>
      </div>

      <div className="client-table-wrapper">
        <table className="client-table">
          <thead>
            <tr>
              <th>Date</th>
              {(viewMode === "basic" || viewMode === "all") && (
                <>
                  <th>Weight (kg)</th>
                  <th>Height (cm)</th>
                  <th>BMI</th>
                </>
              )}
              {(viewMode === "scale" || viewMode === "all") && (
                <>
                  <th>Body Fat %</th>
                  <th>Visceral Fat</th>
                  <th>Muscle (kg)</th>
                  <th>Metabolic Age</th>
                  <th>Water %</th>
                  <th>Bone (kg)</th>
                </>
              )}
              {(viewMode === "vitals" || viewMode === "all") && (
                <>
                  <th>BS Fasting</th>
                  <th>BS Random</th>
                  <th>BP Sys/Dia</th>
                </>
              )}
              {(viewMode === "basic" || viewMode === "all") && <th>Notes</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((p, idx) => (
              <tr key={`${p.date ?? "row"}-${idx}`}>
                <td>{new Date(p.date).toLocaleDateString()}</td>
                {(viewMode === "basic" || viewMode === "all") && (
                  <>
                    <td>{p.weight != null ? p.weight.toFixed(1) : "-"}</td>
                    <td>{p.height ?? "-"}</td>
                    <td>{p.bmi != null ? p.bmi.toFixed(1) : "-"}</td>
                  </>
                )}
                {(viewMode === "scale" || viewMode === "all") && (
                  <>
                    <td>{p.bodyFatPercentage != null ? p.bodyFatPercentage.toFixed(1) : "-"}</td>
                    <td>{p.visceralFatLevel != null ? p.visceralFatLevel.toFixed(1) : "-"}</td>
                    <td>{p.muscleMass != null ? p.muscleMass.toFixed(1) : "-"}</td>
                    <td>{p.metabolicAge ?? "-"}</td>
                    <td>{p.bodyWaterPercentage != null ? p.bodyWaterPercentage.toFixed(1) : "-"}</td>
                    <td>{p.boneMass != null ? p.boneMass.toFixed(1) : "-"}</td>
                  </>
                )}
                {(viewMode === "vitals" || viewMode === "all") && (
                  <>
                    <td>{p.bloodSugarFasting != null ? p.bloodSugarFasting.toFixed(0) : "-"}</td>
                    <td>{p.bloodSugarRandom != null ? p.bloodSugarRandom.toFixed(0) : "-"}</td>
                    <td>
                      {p.bloodPressureSystolic != null && p.bloodPressureDiastolic != null
                        ? `${Math.round(p.bloodPressureSystolic)}/${Math.round(p.bloodPressureDiastolic)}`
                        : p.bloodPressureSystolic != null
                        ? `${Math.round(p.bloodPressureSystolic)}/-`
                        : p.bloodPressureDiastolic != null
                        ? `-/${Math.round(p.bloodPressureDiastolic)}`
                        : "-"}
                    </td>
                  </>
                )}
                {(viewMode === "basic" || viewMode === "all") && (
                  <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.notes || "-"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
