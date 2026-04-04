"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import getErrorMessage from "@/lib/getErrorMessage";
import { Mail } from "lucide-react";
import {
  cardShadowClass,
  headingClass,
  primaryGradientButtonClass,
  primaryGradientButtonStyle,
  sectionPad,
  textMuted,
} from "@/components/home/homeTheme";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; message: string }) => {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/contact-us/submit`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to send message"));
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    submitMutation.mutate(formData);
  };

  return (
    <section id="contact" className={`${sectionPad} bg-[#F8FAFC] pb-10 pt-14 md:pb-8 md:pt-[10vh]`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:gap-[4vw]">
        <div className="flex-1">
          <h2 className={`${headingClass} mb-6 text-[clamp(32px,3.2vw,52px)]`}>
            Let&apos;s talk.
          </h2>

          <p className={`${textMuted} mb-8 text-base leading-relaxed sm:text-lg`}>
            Questions about coaching, teams, or pricing? We&apos;re here to help.
          </p>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1116111A] bg-[#F6F7F6]">
              <Mail className="h-4 w-4 text-[#111611]" strokeWidth={1.5} />
            </div>
            <a href="mailto:hello@fitcoach.app" className="font-medium text-[#111611]">
              hello@fitcoach.app
            </a>
          </div>
        </div>

        <div
          className={`flex-1 rounded-[24px] bg-[#F6F7F6] p-5 sm:p-6 md:rounded-[28px] md:p-8 ${cardShadowClass}`}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#111611]">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-[#1116111A] bg-[#F6F7F6] px-4 py-3 text-[#111611] placeholder:text-[#64748B]"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={submitMutation.isPending}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#111611]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#1116111A] bg-[#F6F7F6] px-4 py-3 text-[#111611] placeholder:text-[#64748B]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={submitMutation.isPending}
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-[#111611]">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={4}
                placeholder="How can we help?"
                className="w-full resize-none rounded-xl border border-[#1116111A] bg-[#F6F7F6] px-4 py-3 text-[#111611] placeholder:text-[#64748B]"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={submitMutation.isPending}
              />
            </div>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-medium sm:text-base ${primaryGradientButtonClass}`}
              style={primaryGradientButtonStyle}
            >
              {submitMutation.isPending ? "Sending..." : "Send message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
