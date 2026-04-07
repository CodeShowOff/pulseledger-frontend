"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import api from "@/lib/axios";
import ClientWorkoutHistoryCalendar from "@/components/coach/ClientWorkoutHistoryCalendar";
import ClientDietHistoryCalendar from "@/components/coach/ClientDietHistoryCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ClientData = {
  fullName?: string;
};

export default function CoachClientHistoryPage() {
  const params = useParams();
  const idValue = params?.id;
  const id = Array.isArray(idValue) ? idValue[0] : (idValue as string | undefined) ?? "";

  const { data: client } = useQuery<ClientData>({
    queryKey: ["coachClient", id],
    queryFn: async () => {
      const res = await api.get(`/coach/clients/${id}`);
      return res.data.data as ClientData;
    },
    enabled: Boolean(id),
    retry: false,
  });

  const clientName = client?.fullName || "Client";
  const detailHref = id ? `/coach/clients/${id}` : "/coach/clients";

  return (
    <div className="space-y-5 pt-4 md:pt-6">
      <div className="flex items-center">
        <Link href={detailHref}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Client Details
          </Button>
        </Link>
      </div>

      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
            <CalendarDays className="h-5 w-5 text-indigo-600" />
            Workout & Diet History
          </CardTitle>
          <CardDescription>
            Daily history timeline for {clientName}. Use this page to track adherence and consistency.
          </CardDescription>
        </CardHeader>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <ClientWorkoutHistoryCalendar clientId={id} clientName={clientName} />
        <ClientDietHistoryCalendar clientId={id} clientName={clientName} />
      </section>
    </div>
  );
}
