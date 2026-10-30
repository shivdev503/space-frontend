"use client";

import { useEffect, useRef, useState } from "react";

type GoogleCredentialResponse = { credential?: string };

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        ux_mode?: "popup" | "redirect";
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          type?: "standard" | "icon";
          theme?: "outline" | "filled_blue" | "filled_black";
          size?: "large" | "medium" | "small";
          text?: "signin_with" | "signup_with" | "continue_with" | "signin";
          shape?: "rectangular" | "pill" | "circle" | "square";
          logo_alignment?: "left" | "center";
          width?: number;
        },
      ) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";

let gsiScript: Promise<void> | null = null;

/** Loads Google Identity Services once per page. */
function loadGsi(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiScript) {
    gsiScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gsiScript = null;
        reject(new Error("Could not load Google sign-in"));
      };
      document.head.appendChild(script);
    });
  }
  return gsiScript;
}

/**
 * Official "Continue with Google" button (Google Identity Services, popup mode).
 * Calls `onCredential` with the Google ID token, which the backend verifies.
 */
export function GoogleSignInButton({
  onCredential,
  disabled = false,
}: {
  onCredential: (credential: string) => void;
  disabled?: boolean;
}) {
  const holderRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [failed, setFailed] = useState(false);
  callbackRef.current = onCredential;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    loadGsi()
      .then(() => {
        const holder = holderRef.current;
        const gsi = window.google?.accounts?.id;
        if (cancelled || !holder || !gsi) return;
        gsi.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) callbackRef.current(response.credential);
          },
          ux_mode: "popup",
          cancel_on_tap_outside: true,
        });
        holder.innerHTML = "";
        gsi.renderButton(holder, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
          width: Math.min(400, Math.max(240, Math.round(holder.getBoundingClientRect().width))),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="rounded-lg border border-amber-200/90 bg-amber-50/90 px-4 py-2.5 text-sm text-amber-950">
        Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.
      </p>
    );
  }

  if (failed) {
    return (
      <p className="rounded-lg border border-red-200/90 bg-red-50/90 px-4 py-2.5 text-sm text-red-800">
        Could not load Google sign-in. Check your connection or ad blocker and reload the page.
      </p>
    );
  }

  return (
    <div
      className={disabled ? "pointer-events-none opacity-60" : undefined}
      aria-busy={disabled}
    >
      <div ref={holderRef} className="flex min-h-[44px] w-full justify-center" />
    </div>
  );
}
