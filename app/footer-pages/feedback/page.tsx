"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { MessageSquare, Star, User, Mail, FileText, Lightbulb, Send } from "lucide-react";

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userRole: "visitor",
    feedbackType: "general",
    category: "other",
    rating: 5,
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  // Submit feedback mutation
  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axios.post("/feedback/submit", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Thank you! Your feedback has been submitted successfully.");
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        userRole: "visitor",
        feedbackType: "general",
        category: "other",
        rating: 5,
        subject: "",
        message: "",
      });

      // Reset submitted state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err?.response?.data?.message || "Failed to submit feedback. Please try again.";
      toast.error(message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    submitMutation.mutate(formData);
  };

  const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <main className="client-page footer-page">

      <header className="client-page__header">
        <h1 className="client-page__title">We Value Your Feedback</h1>
      </header>

      <section className="client-page__sections">
          {/* Guidelines Section */}
          <div className="client-card" style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <Lightbulb className="w-5 h-5 text-blue-600" style={{ marginTop: "0.25rem", flexShrink: 0 }} />
              <div>
                <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Helpful Feedback Guidelines</h3>
                <ul style={{ fontSize: "0.875rem", color: "#374151", lineHeight: "1.625" }}>
                  <li>• <strong>Be specific:</strong> Detailed feedback helps us understand your experience better</li>
                  <li>• <strong>Be constructive:</strong> Suggest improvements or alternatives when pointing out issues</li>
                  <li>• <strong>Share examples:</strong> Real scenarios help us see things from your perspective</li>
                  <li>• <strong>Rate honestly:</strong> Your rating helps us prioritize improvements</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {submitted && (
            <div className="client-card" style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: "#dcfce7", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg
                    style={{ width: "1.5rem", height: "1.5rem", color: "#16a34a" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, color: "#14532d", marginBottom: "0.25rem" }}>Feedback Submitted Successfully!</h3>
                  <p style={{ fontSize: "0.875rem", color: "#15803d" }}>
                    Thank you for taking the time to share your thoughts. We review all feedback and use
                    it to improve FitCoach.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="client-card">
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Personal Information */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                {/* Name */}
                <div className="auth-form__field">
                  <label htmlFor="name">
                    <User style={{ display: "inline", width: "1rem", height: "1rem", marginRight: "0.25rem" }} />
                    Full Name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="auth-form__input"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div className="auth-form__field">
                  <label htmlFor="email">
                    <Mail style={{ display: "inline", width: "1rem", height: "1rem", marginRight: "0.25rem" }} />
                    Email Address <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="auth-form__input"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Role and Type */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                {/* User Role */}
                <div className="auth-form__field">
                  <label htmlFor="userRole">
                    You are a:
                  </label>
                  <select
                    id="userRole"
                    name="userRole"
                    value={formData.userRole}
                    onChange={handleChange}
                    className="auth-form__input"
                  >
                    <option value="visitor">Visitor</option>
                    <option value="client">Client</option>
                    <option value="coach">Coach</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Feedback Type */}
                <div className="auth-form__field">
                  <label htmlFor="feedbackType">
                    Feedback Type
                  </label>
                  <select
                    id="feedbackType"
                    name="feedbackType"
                    value={formData.feedbackType}
                    onChange={handleChange}
                    className="auth-form__input"
                  >
                    <option value="general">General Feedback</option>
                    <option value="feature-request">Feature Request</option>
                    <option value="improvement">Improvement Suggestion</option>
                    <option value="complaint">Complaint</option>
                    <option value="praise">Praise</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Category and Rating */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                {/* Category */}
                <div className="auth-form__field">
                  <label htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="auth-form__input"
                  >
                    <option value="platform">Platform/Website</option>
                    <option value="coaches">Coaches</option>
                    <option value="subscriptions">Subscriptions</option>
                    <option value="products">Products</option>
                    <option value="progress-tracking">Progress Tracking</option>
                    <option value="ui-ux">User Interface/Experience</option>
                    <option value="performance">Performance/Speed</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Rating */}
                <div className="auth-form__field">
                  <label htmlFor="rating">
                    <Star style={{ display: "inline", width: "1rem", height: "1rem", marginRight: "0.25rem", color: "#eab308" }} />
                    Overall Rating <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    required
                    className="auth-form__input"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} - {ratingLabels[num - 1]}
                      </option>
                    ))}
                  </select>
                  <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.25rem" }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Star
                        key={num}
                        style={{
                          width: "1.25rem",
                          height: "1.25rem",
                          color: num <= formData.rating ? "#eab308" : "#d1d5db",
                          fill: num <= formData.rating ? "#eab308" : "none"
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="auth-form__field">
                <label htmlFor="subject">
                  <FileText style={{ display: "inline", width: "1rem", height: "1rem", marginRight: "0.25rem" }} />
                  Subject <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  className="auth-form__input"
                  placeholder="Brief summary of your feedback"
                />
                <small style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>
                  {formData.subject.length}/200 characters
                </small>
              </div>

              {/* Message */}
              <div className="auth-form__field">
                <label htmlFor="message">
                  <MessageSquare style={{ display: "inline", width: "1rem", height: "1rem", marginRight: "0.25rem" }} />
                  Your Feedback <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  maxLength={2000}
                  className="auth-form__input"
                  style={{ resize: "none" }}
                  placeholder="Share your detailed feedback, suggestions, or experiences..."
                />
                <small style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>
                  {formData.message.length}/2000 characters
                </small>
              </div>

              {/* Submit Button */}
              <div className="auth-form__actions">
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="client-button"
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                >
                  {submitMutation.isPending ? (
                    <>
                      <svg
                        style={{ animation: "spin 1s linear infinite", height: "1.25rem", width: "1.25rem" }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          style={{ opacity: 0.25 }}
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          style={{ opacity: 0.75 }}
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send style={{ width: "1.25rem", height: "1.25rem" }} />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {/* Response Time */}
            <div className="client-card" style={{ backgroundColor: "#f9fafb" }}>
              <h3 style={{ fontWeight: 600, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg
                  style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Response Time
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                We review all feedback within 2-3 business days. Feature requests and suggestions
                are evaluated monthly for our product roadmap.
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="client-card" style={{ backgroundColor: "#f9fafb" }}>
              <h3 style={{ fontWeight: 600, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg
                  style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Privacy Notice
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                Your feedback is confidential. We only use your email to follow up if needed.
                See our{" "}
                <a href="/footer-pages/privacy-policy" style={{ color: "#2563eb", textDecoration: "underline" }}>
                  Privacy Policy
                </a>{" "}
                for details.
              </p>
            </div>
          </div>

          {/* Alternative Contact */}
          <div className="client-card" style={{ textAlign: "center", fontSize: "0.875rem", color: "#4b5563" }}>
            <p>
              Need immediate assistance?{" "}
              <a href="/footer-pages/contact" style={{ color: "#2563eb", textDecoration: "underline", fontWeight: 500 }}>
                Contact our support team
              </a>{" "}
              or visit our{" "}
              <a href="/footer-pages/help-center" style={{ color: "#2563eb", textDecoration: "underline", fontWeight: 500 }}>
                Help Center
              </a>
            </p>
          </div>
        </section>
    </main>
  );
}
