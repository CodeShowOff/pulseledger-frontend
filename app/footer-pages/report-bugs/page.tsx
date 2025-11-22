"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";

export default function ReportBugsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    description: "",
    stepsToReproduce: "",
    severity: "medium",
    category: "other",
    pageUrl: "",
    browserInfo: "",
    deviceInfo: "",
  });

  useEffect(() => {
    // Auto-detect browser and device info
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent;
      const browser = detectBrowser(userAgent);
      const device = detectDevice(userAgent);
      
      setFormData(prev => ({
        ...prev,
        browserInfo: browser,
        deviceInfo: device,
        pageUrl: window.location.href,
      }));
    }
  }, []);

  const detectBrowser = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  };

  const detectDevice = (userAgent: string) => {
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      if (/iPad/i.test(userAgent)) return "iPad";
      if (/iPhone/i.test(userAgent)) return "iPhone";
      if (/Android/i.test(userAgent)) return "Android Mobile";
      return "Mobile Device";
    }
    return "Desktop";
  };

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/bug-reports/submit`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Bug report submitted successfully! Thank you for helping us improve.");
      setFormData({
        name: "",
        email: "",
        title: "",
        description: "",
        stepsToReproduce: "",
        severity: "medium",
        category: "other",
        pageUrl: "",
        browserInfo: formData.browserInfo,
        deviceInfo: formData.deviceInfo,
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit bug report");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.title || !formData.description || !formData.stepsToReproduce) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    submitMutation.mutate(formData);
  };

  return (
    <main className="client-page">
      <div className="client-page__inner">
        <header className="client-page__header">
          <h1 className="client-page__title">Report a Bug</h1>
          <p className="client-page__subtitle">
            Last Updated: November 20, 2025
          </p>
          <p className="client-page__subtitle">
            Found a bug or technical issue? Help us improve PulseLedger by reporting it. Your detailed feedback helps us fix problems quickly and enhance your experience.
          </p>
        </header>

        <section className="client-page__sections">
          {/* Introduction */}
          <div className="client-card">
            <h2 className="client-card__section-title">Why Report Bugs?</h2>
            <div className="client-card__content">
              <p>
                Your bug reports are invaluable in helping us maintain a high-quality platform. When you report a bug, you're helping:
              </p>
              <ul className="client-list">
                <li><strong>Improve User Experience:</strong> Fixing bugs makes the platform better for everyone</li>
                <li><strong>Prevent Data Loss:</strong> Critical bugs can be addressed before they affect more users</li>
                <li><strong>Speed Up Development:</strong> Detailed reports help our team fix issues faster</li>
                <li><strong>Build a Better Community:</strong> Contributing to platform improvement benefits all users</li>
              </ul>
            </div>
          </div>

          {/* Bug Report Form */}
          <div className="client-card">
            <h2 className="client-card__section-title">Submit a Bug Report</h2>
            <div className="client-card__content">
              <p style={{ marginBottom: "1.5rem" }}>
                Please provide as much detail as possible. The more information you give us, the faster we can identify and fix the issue.
              </p>
              
              <form className="auth-form" onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="auth-form__field">
                  <label htmlFor="name">
                    Your Name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="auth-form__input"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={submitMutation.isPending}
                    required
                  />
                </div>

                <div className="auth-form__field">
                  <label htmlFor="email">
                    Your Email <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="auth-form__input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={submitMutation.isPending}
                    required
                  />
                  <small style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    We'll use this to contact you about the bug if needed
                  </small>
                </div>

                {/* Bug Details */}
                <div className="auth-form__field">
                  <label htmlFor="title">
                    Bug Title <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="auth-form__input"
                    placeholder="Brief summary of the issue (e.g., 'Login button not working')"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={submitMutation.isPending}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="auth-form__field">
                  <label htmlFor="category">Bug Category</label>
                  <select
                    id="category"
                    className="auth-form__input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={submitMutation.isPending}
                  >
                    <option value="other">Other / Not Sure</option>
                    <option value="ui">UI/Design Issue</option>
                    <option value="functionality">Functionality Problem</option>
                    <option value="performance">Performance/Speed Issue</option>
                    <option value="security">Security Concern</option>
                    <option value="data">Data/Information Error</option>
                  </select>
                </div>

                <div className="auth-form__field">
                  <label htmlFor="severity">
                    Severity Level <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    id="severity"
                    className="auth-form__input"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    disabled={submitMutation.isPending}
                    required
                  >
                    <option value="low">Low - Minor inconvenience</option>
                    <option value="medium">Medium - Affects some functionality</option>
                    <option value="high">High - Major feature broken</option>
                    <option value="critical">Critical - System unusable</option>
                  </select>
                  <small style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    How severely does this bug affect your use of the platform?
                  </small>
                </div>

                <div className="auth-form__field">
                  <label htmlFor="description">
                    Bug Description <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    id="description"
                    className="auth-form__input"
                    rows={4}
                    placeholder="Describe what happened, what you expected to happen, and any error messages you saw..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={submitMutation.isPending}
                    maxLength={2000}
                    required
                  />
                  <small style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    {formData.description.length}/2000 characters
                  </small>
                </div>

                <div className="auth-form__field">
                  <label htmlFor="stepsToReproduce">
                    Steps to Reproduce <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    id="stepsToReproduce"
                    className="auth-form__input"
                    rows={5}
                    placeholder={"1. Go to the login page\n2. Enter valid credentials\n3. Click 'Login' button\n4. Error message appears instead of logging in"}
                    value={formData.stepsToReproduce}
                    onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                    disabled={submitMutation.isPending}
                    maxLength={2000}
                    required
                  />
                  <small style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    List the exact steps to recreate this bug. Be as specific as possible.
                  </small>
                </div>

                {/* Optional Technical Details */}
                <div className="auth-form__field">
                  <label htmlFor="pageUrl">Page URL (Optional)</label>
                  <input
                    type="text"
                    id="pageUrl"
                    className="auth-form__input"
                    placeholder="https://pulseledger.com/..."
                    value={formData.pageUrl}
                    onChange={(e) => setFormData({ ...formData, pageUrl: e.target.value })}
                    disabled={submitMutation.isPending}
                  />
                  <small style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    The page where you encountered the bug (auto-detected)
                  </small>
                </div>

                <div className="auth-form__field">
                  <label htmlFor="browserInfo">Browser (Auto-detected)</label>
                  <input
                    type="text"
                    id="browserInfo"
                    className="auth-form__input"
                    value={formData.browserInfo}
                    onChange={(e) => setFormData({ ...formData, browserInfo: e.target.value })}
                    disabled={submitMutation.isPending}
                    placeholder="Chrome, Firefox, Safari, etc."
                  />
                </div>

                <div className="auth-form__field">
                  <label htmlFor="deviceInfo">Device (Auto-detected)</label>
                  <input
                    type="text"
                    id="deviceInfo"
                    className="auth-form__input"
                    value={formData.deviceInfo}
                    onChange={(e) => setFormData({ ...formData, deviceInfo: e.target.value })}
                    disabled={submitMutation.isPending}
                    placeholder="Desktop, iPhone, Android, etc."
                  />
                </div>

                <button 
                  type="submit" 
                  className="auth-form__submit"
                  disabled={submitMutation.isPending}
                  style={{ marginTop: "1rem" }}
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Bug Report"}
                </button>
              </form>
            </div>
          </div>

          {/* Guidelines */}
          <div className="client-card">
            <h2 className="client-card__section-title">Bug Reporting Guidelines</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">What Makes a Good Bug Report?</h3>
              <ul className="client-list">
                <li><strong>Clear Title:</strong> Summarize the issue in one sentence</li>
                <li><strong>Detailed Description:</strong> Explain what went wrong and what you expected</li>
                <li><strong>Reproducible Steps:</strong> List exact steps to recreate the bug</li>
                <li><strong>Screenshots/Videos:</strong> Visual evidence helps (attach via email if needed)</li>
                <li><strong>Error Messages:</strong> Include any error messages you saw</li>
                <li><strong>Context:</strong> Mention what you were trying to do when the bug occurred</li>
              </ul>

              <h3 className="client-card__subsection-title">Before Reporting</h3>
              <ul className="client-list">
                <li>Try refreshing the page or clearing your browser cache</li>
                <li>Check if the issue happens in different browsers</li>
                <li>Verify your internet connection is stable</li>
                <li>See if the problem persists after logging out and back in</li>
                <li>Check our <Link href="/footer-pages/help-center" className="client-link">Help Center</Link> for known issues</li>
              </ul>

              <h3 className="client-card__subsection-title">What Happens Next?</h3>
              <ol className="client-list">
                <li><strong>Acknowledgment:</strong> You'll receive a confirmation email when we receive your report</li>
                <li><strong>Investigation:</strong> Our team reviews the report and tries to reproduce the bug</li>
                <li><strong>Prioritization:</strong> We prioritize based on severity and number of affected users</li>
                <li><strong>Fix & Testing:</strong> Developers fix the bug and test thoroughly</li>
                <li><strong>Deployment:</strong> Fix is deployed to production</li>
                <li><strong>Update:</strong> We may contact you for additional information or to confirm the fix</li>
              </ol>

              <h3 className="client-card__subsection-title">Response Times</h3>
              <ul className="client-list">
                <li><strong>Critical:</strong> Within 24 hours</li>
                <li><strong>High:</strong> 2-3 business days</li>
                <li><strong>Medium:</strong> 5-7 business days</li>
                <li><strong>Low:</strong> Reviewed in next update cycle</li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="client-card">
            <h2 className="client-card__section-title">Need Help?</h2>
            <div className="client-card__content">
              <p>
                For urgent issues or if you need immediate assistance:
              </p>
              <ul className="client-list">
                <li><strong>Email:</strong> <a href="mailto:mail.pulseledger@gmail.com" className="client-link">mail.pulseledger@gmail.com</a></li>
                <li><strong>Help Center:</strong> <Link href="/footer-pages/help-center" className="client-link">Visit our comprehensive help documentation</Link></li>
                <li><strong>Contact Form:</strong> <Link href="/footer-pages/contact" className="client-link">Send us a general inquiry</Link></li>
              </ul>
              <p style={{ marginTop: "1rem" }}>
                Thank you for helping us make PulseLedger better! Your feedback is essential to providing the best possible experience for our coaching community.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
