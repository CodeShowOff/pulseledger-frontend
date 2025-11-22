"use client";

import { useEffect, useState, useRef } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isInstalled) {
      return;
    }

    // Check if user permanently dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'permanent') {
      return;
    }

    // If user dismissed within last 30 days, don't show
    if (dismissed && dismissed !== 'permanent') {
      const dismissedTime = parseInt(dismissed);
      if (!isNaN(dismissedTime)) {
        const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissal < 30) {
          return;
        } else {
          // Clear old timestamp if more than 30 days passed
          localStorage.removeItem('pwa-install-dismissed');
        }
      }
    }

    // Don't show more than once per session
    const promptShown = sessionStorage.getItem('pwa-prompt-shown');
    if (promptShown) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Double-check before showing (in case user dismissed in another tab)
      timeoutRef.current = setTimeout(() => {
        const dismissedCheck = localStorage.getItem('pwa-install-dismissed');
        const sessionCheck = sessionStorage.getItem('pwa-prompt-shown');
        
        if (!dismissedCheck && !sessionCheck) {
          setShowPrompt(true);
          sessionStorage.setItem('pwa-prompt-shown', 'true');
        }
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        // Clear any dismissal flags since user installed
        localStorage.removeItem('pwa-install-dismissed');
        sessionStorage.removeItem('pwa-prompt-shown');
      } else {
        // User declined the install, treat as dismissal
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      }
    } catch (error) {
      // Installation failed or was cancelled
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
    // Mark as dismissed permanently (user explicitly closed the prompt)
    localStorage.setItem('pwa-install-dismissed', 'permanent');
    sessionStorage.setItem('pwa-prompt-shown', 'true');
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        maxWidth: '90%',
        width: '400px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem', color: '#111827' }}>
            Install PulseLedger
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Install our app for a better experience with offline access
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="btn btn--primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
          }}
        >
          <Download size={16} />
          Install
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
