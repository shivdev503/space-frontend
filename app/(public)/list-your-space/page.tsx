"use client";

import { Eye, EyeOff, Headset, KeyRound, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Container } from "@/components/ui/container";
import { isListingOtpSkippedPublic } from "@/lib/listing-skip-otp";
import { cn } from "@/utils/cn";

const OTP_STEP_DISABLED = isListingOtpSkippedPublic();

type Mode = "signup" | "login";
type ListAuthStep = "form" | "otp";

type CompactFieldProps = {
  label: string;
  icon: React.ReactNode;
  hasPrefix?: boolean;
  children: React.ReactNode;
};

function CompactField({ label, icon, hasPrefix, children }: CompactFieldProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-ink/45">
        {label}
      </span>
      <div
        className={cn(
          "flex h-11 items-stretch gap-2 rounded-xl border border-ink/10 bg-white px-3 text-base",
          "shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition",
          "focus-within:border-[color:var(--color-brand)] focus-within:ring-2 focus-within:ring-[rgba(76,175,80,0.18)]",
        )}
      >
        <span className="flex w-6 shrink-0 items-center justify-center self-center text-[color:var(--color-brand)]/85">
          {icon}
        </span>
        {hasPrefix ? (
          <span className="flex shrink-0 items-center self-center pr-0.5 text-sm font-medium tabular-nums text-ink/75">
            +91
            <span aria-hidden className="mx-2 text-ink/20">
              |
            </span>
          </span>
        ) : null}
        {children}
      </div>
    </label>
  );
}

export default function ListYourSpacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("reason") === "session-expired";
  const loginRequired = searchParams.get("reason") === "login-required";
  const [mode, setMode] = useState<Mode>("signup");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [authStep, setAuthStep] = useState<ListAuthStep>("form");
  const [otp, setOtp] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phone10 = useMemo(
    () => phoneNumber.replace(/\D/g, "").slice(-10),
    [phoneNumber],
  );
  const isValidPhone = phone10.length === 10;

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email],
  );

  const canSubmitSignup =
    firstName.trim().length >= 1 &&
    lastName.trim().length >= 1 &&
    isValidEmail &&
    isValidPhone;

  const canSubmitLogin = isValidPhone;

  const switchMode = useCallback((next: Mode) => {
    setMode(next);
    setError(null);
    setAuthStep("form");
    setOtp("");
    setPendingPhone("");
    setShowOtp(false);
  }, []);

  const goBackToForm = useCallback(() => {
    setAuthStep("form");
    setOtp("");
    setError(null);
    setShowOtp(false);
  }, []);

  async function requestSignupOtp() {
    if (!canSubmitSignup || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/user/vendorSignUp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone_number: phone10,
          dial_code: "+91",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        sessionReady?: boolean;
      };
      if (!res.ok) {
        setError(data.message || "Could not start sign up. Try again.");
        return;
      }
      if (data.sessionReady || OTP_STEP_DISABLED) {
        if (data.sessionReady) {
          router.push("/add");
          return;
        }
        setError(
          "Sign-up started but could not start a session. Set LISTING_BYPASS_OTP to your backend dev OTP.",
        );
        return;
      }
      setPendingPhone(phone10);
      setOtp("");
      setShowOtp(false);
      setAuthStep("otp");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function requestLoginOtp() {
    if (!canSubmitLogin || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/user/vendorLogin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone10 }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        sessionReady?: boolean;
      };
      if (!res.ok) {
        setError(data.message || "Could not sign in. Check your number or create an account.");
        return;
      }
      if (data.sessionReady || OTP_STEP_DISABLED) {
        if (data.sessionReady) {
          router.push("/add");
          return;
        }
        setError(
          "Could not sign in without OTP. Set LISTING_BYPASS_OTP to your backend dev OTP.",
        );
        return;
      }
      setPendingPhone(phone10);
      setOtp("");
      setShowOtp(false);
      setAuthStep("otp");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    const code = otp.replace(/\D/g, "");
    if (code.length < 4 || !pendingPhone || busy) {
      if (code.length < 4) {
        setError("Enter the full OTP sent to your phone.");
      }
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/user/validateVendor", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: pendingPhone, otp: code }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; ok?: boolean };
      if (!res.ok) {
        setError(data.message || "Invalid or expired OTP. Try again.");
        return;
      }
      router.push("/add");
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resendOtp() {
    if (!pendingPhone || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") {
        const res = await fetch("/api/user/vendorLogin", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: pendingPhone }),
        });
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        if (!res.ok) {
          setError(data.message || "Could not resend OTP.");
        }
      } else {
        const res = await fetch("/api/user/resendOTP", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: pendingPhone, dial_code: "+91" }),
        });
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        if (!res.ok) {
          setError(data.message || "Could not resend OTP.");
        }
      }
    } catch {
      setError("Could not resend OTP. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!OTP_STEP_DISABLED && authStep === "otp") {
      void verifyOtp();
      return;
    }
    if (mode === "signup") return void requestSignupOtp();
    return void requestLoginOtp();
  }

  return (
    <div className="min-h-[60vh] bg-[#f7f4ee]">
      <Container className="py-8 sm:py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-stretch gap-8 lg:grid lg:max-w-6xl lg:grid-cols-[1.1fr_minmax(0,28rem)] lg:items-start lg:gap-10 xl:gap-12">
          <div className="order-2 lg:order-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink/50">
              List with SpaceWallah
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.15] text-ink sm:text-4xl lg:text-[2.25rem]">
              List your property. Get verified leads. Close faster.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/70 sm:text-[0.95rem]">
              Create your host account to list Coworking and Managed Office spaces. Manage inventory, track
              leads, and update listings anytime.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
              {["Zero brokerage", "Genuine leads", "Pan-India reach"].map((t) => (
                <div
                  key={t}
                  className="rounded-lg border border-ink/8 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-ink shadow-sm"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 w-full lg:order-2 lg:justify-self-end">
            <div
              className={cn(
                "mx-auto w-full max-w-md rounded-2xl border border-ink/8 bg-white p-6 shadow-[0_16px_48px_rgba(0,0,0,0.08)]",
                "sm:p-7",
              )}
            >
              <div className="text-center">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.65rem]">
                  {!OTP_STEP_DISABLED && authStep === "otp"
                    ? "Verify OTP"
                    : mode === "signup"
                      ? "Create account"
                      : "Log in"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">
                  {!OTP_STEP_DISABLED && authStep === "otp"
                    ? "Enter the code we sent to your phone."
                    : mode === "signup"
                      ? OTP_STEP_DISABLED
                        ? "Takes a minute — then you can start listing."
                        : "Takes a minute — we'll text you a code."
                      : OTP_STEP_DISABLED
                        ? "Sign in with your mobile number."
                        : "We'll text you a one-time code."}
                </p>
              </div>

              {sessionExpired ? (
                <div className="mt-4 rounded-lg border border-amber-200/90 bg-amber-50/90 px-4 py-2.5 text-sm leading-snug text-amber-950">
                  Session expired. Sign in again to continue.
                </div>
              ) : null}

              {loginRequired ? (
                <div className="mt-4 rounded-lg border border-sky-200/90 bg-sky-50/90 px-4 py-2.5 text-sm leading-snug text-sky-950">
                  Sign in to open the host listing panel.
                </div>
              ) : null}

              {OTP_STEP_DISABLED || authStep === "form" ? (
                <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
                  {mode === "signup" ? (
                    <>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <CompactField label="First name" icon={<User className="h-4 w-4" />}>
                          <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First"
                            className="min-h-0 w-full min-w-0 border-0 bg-transparent py-0.5 text-base outline-none placeholder:text-ink/35"
                            disabled={busy}
                            autoFocus
                          />
                        </CompactField>
                        <CompactField label="Last name" icon={<User className="h-4 w-4" />}>
                          <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last"
                            className="min-h-0 w-full min-w-0 border-0 bg-transparent py-0.5 text-base outline-none placeholder:text-ink/35"
                            disabled={busy}
                          />
                        </CompactField>
                      </div>

                      <CompactField label="Email" icon={<Mail className="h-4 w-4" />}>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="you@email.com"
                          className="min-h-0 w-full min-w-0 border-0 bg-transparent py-0.5 text-base outline-none placeholder:text-ink/35"
                          disabled={busy}
                        />
                      </CompactField>
                    </>
                  ) : null}

                  <CompactField label="Mobile" icon={<Phone className="h-4 w-4" />} hasPrefix>
                    <input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="10-digit number"
                      className="min-h-0 w-full min-w-0 border-0 bg-transparent py-0.5 text-base outline-none placeholder:text-ink/35"
                      disabled={busy}
                      autoFocus={mode === "login"}
                    />
                  </CompactField>

                  {error ? (
                    <div className="rounded-lg border border-red-200/90 bg-red-50/90 px-4 py-2.5 text-sm text-red-800">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={busy || (mode === "signup" ? !canSubmitSignup : !canSubmitLogin)}
                    className={cn(
                      "mt-1 flex h-12 w-full items-center justify-center rounded-full text-base font-semibold transition",
                      "border border-[color:var(--color-brand)] bg-[color:var(--color-brand)] text-white",
                      "hover:brightness-105 active:scale-[0.99]",
                      "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100",
                    )}
                  >
                    {busy ? "Please wait…" : OTP_STEP_DISABLED ? "Continue" : "Send OTP"}
                  </button>

                  <p className="pt-1 text-center text-sm text-ink/65">
                    {mode === "signup" ? (
                      <>
                        Already have an Account?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("login")}
                          className="font-semibold text-[color:var(--color-brand)] hover:text-[color:var(--color-accent)]"
                        >
                          Sign in
                        </button>
                      </>
                    ) : (
                      <>
                        Create an Account?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("signup")}
                          className="font-semibold text-[color:var(--color-brand)] hover:text-[color:var(--color-accent)]"
                        >
                          Sign up
                        </button>
                      </>
                    )}
                  </p>
                </form>
              ) : (
                <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
                  <p className="text-center text-sm text-ink/70">
                    Code sent to <span className="font-semibold text-ink">+91 {pendingPhone}</span>
                  </p>
                  <div className="grid gap-1.5">
                    <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-ink/45">
                      One-time code
                    </span>
                    <div
                      className={cn(
                        "flex h-11 items-stretch gap-1 rounded-xl border border-ink/10 bg-white px-2 text-base",
                        "shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition",
                        "focus-within:border-[color:var(--color-brand)] focus-within:ring-2 focus-within:ring-[rgba(76,175,80,0.18)]",
                      )}
                    >
                      <span className="flex w-6 shrink-0 items-center justify-center self-center text-[color:var(--color-brand)]/85">
                        <KeyRound className="h-4 w-4" />
                      </span>
                      <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                        type={showOtp ? "text" : "password"}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="••••••"
                        className="min-w-0 flex-1 border-0 bg-transparent py-0.5 text-base font-medium tracking-widest outline-none placeholder:text-ink/35"
                        disabled={busy}
                        autoFocus
                        name="listing-vendor-otp"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOtp((s) => !s)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-lg text-ink/55 transition hover:bg-ink/5 hover:text-ink"
                        aria-pressed={showOtp}
                        aria-label={showOtp ? "Hide OTP" : "Show OTP"}
                      >
                        {showOtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error ? (
                    <div className="rounded-lg border border-red-200/90 bg-red-50/90 px-4 py-2.5 text-sm text-red-800">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={busy || otp.replace(/\D/g, "").length < 4}
                    className={cn(
                      "mt-1 flex h-12 w-full items-center justify-center rounded-full text-base font-semibold transition",
                      "border border-[color:var(--color-brand)] bg-[color:var(--color-brand)] text-white",
                      "hover:brightness-105 active:scale-[0.99]",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    {busy ? "Please wait…" : "Verify & continue"}
                  </button>

                  <div className="flex items-center justify-between gap-2 pt-1 text-sm">
                    <button
                      type="button"
                      onClick={() => void resendOtp()}
                      disabled={busy}
                      className="font-semibold text-[color:var(--color-brand)] hover:underline disabled:opacity-50"
                    >
                      Resend code
                    </button>
                    <button
                      type="button"
                      onClick={goBackToForm}
                      disabled={busy}
                      className="font-medium text-ink/55 hover:text-ink disabled:opacity-50"
                    >
                      Change number
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="mx-auto mt-4 flex w-full max-w-md items-center gap-3 rounded-2xl border border-ink/8 bg-white/95 p-4 shadow-[0_8px_28px_rgba(0,0,0,0.05)] sm:items-start sm:gap-4 sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)] sm:h-12 sm:w-12">
                <Headset className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-ink sm:text-base">Need help listing?</h3>
                <div className="mt-1.5 flex flex-col gap-1 text-sm sm:mt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-1 sm:gap-y-0.5">
                  <a
                    href="tel:+919457777791"
                    className="w-fit font-medium leading-snug text-ink whitespace-nowrap hover:text-[color:var(--color-brand)]"
                  >
                    +91 945 777 7791
                  </a>
                  <span className="hidden text-ink/40 sm:inline" aria-hidden>
                    ,
                  </span>
                  <a
                    href="mailto:info@spacewallah.com"
                    className="font-medium leading-snug text-ink/80 break-all hover:text-[color:var(--color-brand)] sm:break-normal"
                  >
                    info@spacewallah.com
                  </a>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-ink/55 lg:hidden">
              <Link href="/" className="hover:text-ink">
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
