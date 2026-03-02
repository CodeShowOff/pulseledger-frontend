"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import getErrorMessage from "@/lib/getErrorMessage";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; message: string }) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/contact-us/submit`,
        data
      );
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

  const handleSubmit = (e: React.FormEvent) => {
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
    <main className="client-page footer-page">
      <header className="client-page__header">
        <h1 className="client-page__title">Contact Us</h1>
      </header>

      <section className="client-page__sections">
        <div className="client-card">

          <p className="profile-field__value">
            We're here to support your coaching journey and client experience. Choose
            the best way to reach our team and we'll get back to you as soon as
            possible.
          </p>

          <div className="profile-grid" style={{ marginTop: "1.25rem" }}>
            <div className="profile-field">
              <div className="profile-field__label">Support Email</div>
              <div className="profile-field__value">mail.fitcoach@gmail.com</div>
            </div>
            <div className="profile-field">
              <div className="profile-field__label">Business Enquiries</div>
              <div className="profile-field__value">mail.fitcoach@gmail.com</div>
            </div>
          </div>

          <form className="auth-form" style={{ marginTop: "1.5rem" }} onSubmit={handleSubmit}>
            <div className="auth-form__field">
              <label>Your Name</label>
              <input
                type="text"
                className="auth-form__input"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={submitMutation.isPending}
              />
            </div>
            <div className="auth-form__field">
              <label>Your Email</label>
              <input
                type="email"
                className="auth-form__input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={submitMutation.isPending}
              />
            </div>
            <div className="auth-form__field">
              <label>Message</label>
              <textarea
                className="auth-form__input"
                rows={4}
                placeholder="Tell us how we can help..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={submitMutation.isPending}
              />
            </div>
            <button 
              type="submit" 
              className="auth-form__submit"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
