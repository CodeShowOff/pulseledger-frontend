"use client";

import React from "react";
import Link from "next/link";

const Footer = React.memo(function Footer() {
  return (
    <footer
      className="site-footer"
      style={{
        background: "linear-gradient(90deg, #f3f4f6 0%, #e0f2fe 55%, #ede9fe 100%)",
        borderTop: "1px solid #d1d5db",
        padding: "2rem 0",
        boxShadow: "0 -6px 12px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        className="site-footer__inner"
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 1rem',
          gap: '1rem',
        }}
      >
        <div
          className="site-footer__links"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, auto))',
            gap: '0.75rem 1rem',
            justifyContent: 'center',
            width: '100%',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}
        >
          <Link href="/footer-pages/about" className="site-footer__link">About</Link>
          <Link href="/footer-pages/contact" className="site-footer__link">Contact</Link>
          <Link href="/footer-pages/privacy-policy" className="site-footer__link">Privacy Policy</Link>
          <Link href="/footer-pages/terms-and-conditions" className="site-footer__link">Terms & Conditions</Link>
          <Link href="/footer-pages/refund-policy" className="site-footer__link">Refund Policy</Link>
          <Link href="/footer-pages/help-center" className="site-footer__link">Help Center</Link>
          <Link href="/footer-pages/report-bugs" className="site-footer__link">Report Bugs</Link>
          <Link href="/footer-pages/feedback" className="site-footer__link">Feedback</Link>
        </div>
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#1f2937',
            fontWeight: 500,
            letterSpacing: '0.015em',
            marginTop: '0.5rem',
          }}
        >
          © {new Date().getFullYear()} PulseLedger. All rights reserved.
        </div>
      </div>
    </footer>
  );
});

export default Footer;
