"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import Link from "next/link";

type CoachClient = {
  _id: string;
  fullName: string;
  email: string;
  bmi?: number;
  latestProgress?: {
    bmi?: number;
  } | null;
};

const fetchClients = async (): Promise<CoachClient[]> => {
  const res = await api.get("/coach/clients?limit=5");
  return res.data.data;
};

export default function CoachClientTable() {
  const { data, isLoading } = useQuery({ queryKey: ["coachClients"], queryFn: fetchClients });

  if (isLoading) {
    return <p>Loading clients...</p>;
  }

  return (
    <div className="admin-card">
      <h3 className="admin-card__title" style={{ marginBottom: "0.75rem" }}>
        Recent Clients
      </h3>
      <div className="admin-table-wrapper">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>BMI</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((client) => {
                const bmiValue =
                  typeof client.bmi === "number"
                    ? client.bmi
                    : typeof client.latestProgress?.bmi === "number"
                    ? client.latestProgress?.bmi
                    : undefined;

                return (
                  <tr key={client._id}>
                    <td>{client.fullName}</td>
                    <td>{client.email}</td>
                    <td>{typeof bmiValue === "number" ? bmiValue.toFixed(1) : "-"}</td>
                    <td>
                      <Link href={`/coach/clients/${client._id}`} className="btn btn--outline">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
