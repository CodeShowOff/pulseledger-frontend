"use client";

import React from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  variant?: "default" | "split";
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
  variant = "default",
}) => {
  const isSplit = variant === "split";

  return (
    <div className={`auth-shell${isSplit ? " auth-shell--split" : ""}`}>
      <div className={`auth-card${isSplit ? " auth-card--split" : ""}`}>
        <div className="auth-card__content">
          <h2 className="auth-card__title">{title}</h2>
          <p className="auth-card__subtitle">{subtitle}</p>
          {children}
        </div>

        {isSplit ? (
          <div className="auth-card__visual" aria-hidden="true">
            <span className="auth-card__orb auth-card__orb--lg" />
            <span className="auth-card__orb auth-card__orb--md" />
            <span className="auth-card__orb auth-card__orb--sm" />
          </div>
        ) : null}
      </div>
    </div>
  );
};
