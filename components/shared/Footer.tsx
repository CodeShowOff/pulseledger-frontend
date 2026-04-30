"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = React.memo(function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const productLinks = [
    { href: "/footer-pages/about", label: "About Us" },
    { href: "/footer-pages/pricing", label: "Pricing" },
    { href: "/footer-pages/contact", label: "Contact" },
    { href: "/footer-pages/help-center", label: "Help Center" },
  ];

  const legalLinks = [
    { href: "/footer-pages/privacy-policy", label: "Privacy Policy" },
    { href: "/footer-pages/terms-and-conditions", label: "Terms of Service" },
    { href: "/footer-pages/refund-policy", label: "Refund Policy" },
  ];

  const supportLinks = [
    { href: "/footer-pages/report-bugs", label: "Report Bugs" },
    { href: "/footer-pages/feedback", label: "Feedback" },
  ];

  const allLinks = [...productLinks, ...legalLinks, ...supportLinks];

  const socialLinks = [
    {
      href: "https://instagram.com/fitcoach.os",
      label: "Instagram",
      icon: Instagram,
      username: "fitcoach.os",
    },
    { href: "#", label: "Twitter", icon: Twitter, username: "fitcoach.os" },
    { href: "#", label: "YouTube", icon: Youtube, username: "FitCoach" },
  ];

  return (
    <footer className="footer-modern">
      <div className="footer-modern__container">
        {/* Main Footer Content */}
        {isHomePage && (
          <div className="footer-modern__main">
            {/* Brand Section */}
            <div className="footer-modern__brand">
              <Link href="/" className="footer-modern__logo">
                <span className="footer-modern__logo-text">FITCOACH</span>
              </Link>
              <p className="footer-modern__tagline">
                Personalized coaching to help you reach your fitness goals.
              </p>
            </div>

            {/* Links Grid - Desktop */}
            <div className="footer-modern__links-grid">
              <div className="footer-modern__links-section">
                <h4 className="footer-modern__links-title">Company</h4>
                <ul className="footer-modern__links-list">
                  {productLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="footer-modern__link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-modern__links-section">
                <h4 className="footer-modern__links-title">Legal</h4>
                <ul className="footer-modern__links-list">
                  {legalLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="footer-modern__link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-modern__links-section">
                <h4 className="footer-modern__links-title">Support</h4>
                <ul className="footer-modern__links-list">
                  {supportLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="footer-modern__link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mobile Dropdown */}
            <div className="footer-modern__mobile-dropdown">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="footer-modern__dropdown-btn"
              >
                <span>Quick Links</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>
              {isDropdownOpen && (
                <div className="footer-modern__dropdown-menu">
                  {allLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="footer-modern__dropdown-link"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="footer-modern__bottom">
          <p className="footer-modern__copyright">
            © {new Date().getFullYear()} FitCoach. All rights reserved.
          </p>
          {isHomePage && (
            <div className="footer-modern__bottom-right">
              <div className="footer-modern__socials" aria-label="Social links">
                {socialLinks.map(({ href, label, icon: Icon, username }) => (
                  <a
                    key={label}
                    href={href}
                    className="footer-modern__social-link"
                    aria-label={`${label} (${username})`}
                    title={`${label}: ${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
});

export default Footer;
