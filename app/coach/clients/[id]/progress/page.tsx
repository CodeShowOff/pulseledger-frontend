"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import { motion } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProgressDataCards from "@/components/client/ProgressDataCards";
import ClientProgressPhotos from "@/components/coach/ClientProgressPhotos";

const DetailedProgressCharts = dynamic(
  () => import("@/components/client/DetailedProgressCharts"),
  {
    ssr: false,
    loading: () => (
      <Card className="border-slate-200/80 bg-white/95">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">Loading progress charts...</p>
        </CardContent>
      </Card>
    ),
  }
);

type ClientData = {
  fullName?: string;
};

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function CoachClientProgressPage() {
  const params = useParams();
  const idValue = params?.id;
  const clientId = Array.isArray(idValue) ? idValue[0] : (idValue as string | undefined) ?? "";

  const { data: client } = useQuery<ClientData>({
    queryKey: ["coachClient", clientId],
    queryFn: async () => {
      const res = await api.get(`/coach/clients/${clientId}`);
      return res.data.data as ClientData;
    },
    enabled: Boolean(clientId),
    retry: false,
  });

  const clientName = client?.fullName || "Client";
  const detailHref = clientId ? `/coach/clients/${clientId}` : "/coach/clients";

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

      <motion.section variants={fadeInUp} initial="initial" animate="animate" transition={{ duration: 0.28 }}>
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 text-white">
          <CardHeader className="gap-3 p-5 sm:p-6">
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                Progress
              </CardTitle>
              <CardDescription className="hidden max-w-3xl text-sm !text-white/90 sm:block md:text-base">
                View measurements, trends, and progress photos for {clientName}.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.05 }}
      >
        <ProgressDataCards clientId={clientId} />
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.1 }}
      >
        <DetailedProgressCharts clientId={clientId} viewerRole="coach" />
      </motion.section>

      <motion.section
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.28, delay: 0.14 }}
      >
        <ClientProgressPhotos clientId={clientId} />
      </motion.section>
    </div>
  );
}
