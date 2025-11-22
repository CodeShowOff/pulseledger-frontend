"use client";

import React from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2 className="auth-card__title">{title}</h2>
        <p className="auth-card__subtitle">{subtitle}</p>
        {children}
      </div>
    </div>
  );
};
