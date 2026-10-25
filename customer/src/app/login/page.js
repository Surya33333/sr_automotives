"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
    FiArrowLeft,
    FiArrowRight,
    FiCheck,
    FiEdit2,
    FiPhone,
    FiShield,
    FiUser,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const EMPTY_OTP = ["", "", "", "", "", ""];
function AuthPageContent() {
    const { login, isAuthenticated, authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState("mobile");
    const [mobile, setMobile] = useState("");
    const [fullname, setFullname] = useState("");
    const [showName, setShowName] = useState(false);
    const [otp, setOtp] = useState(EMPTY_OTP);
    const [challengeId, setChallengeId] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [customer, setCustomer] = useState(null);
    const otpRefs = useRef([]);
    const requestedRedirect = searchParams.get("redirect");
    const redirectTo =
        requestedRedirect?.startsWith("/") &&
            !requestedRedirect.startsWith("//") &&
            !requestedRedirect.startsWith("/\\")
            ? requestedRedirect
            : "/account";
    useEffect(() => {
        if (!authLoading && isAuthenticated && step === "mobile") {
            router.replace(redirectTo);
        }
    }, [authLoading, isAuthenticated, step, router, redirectTo]);
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => {
            setCountdown((previous) => Math.max(0, previous - 1));
        }, 1000);
        return () => clearTimeout(timer);
    }, [countdown]);
    useEffect(() => {
        if (step === "otp") {
            otpRefs.current[0]?.focus();
        }
    }, [step]);
    const resetOtp = () => setOtp([...EMPTY_OTP]);
    async function sendOtp(event) {
        event?.preventDefault();
        setError("");
        if (!/^[6-9]\d{9}$/.test(mobile)) {
            setError("Enter a valid 10-digit Indian mobile number.");
            return;
        }
        if (showName && fullname.trim().length < 2) {
            setError("Enter your full name to create an account.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_phone: mobile,
                    ...(fullname.trim()
                        ? { customer_fullname: fullname.trim() }
                        : {}),
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                if (
                    response.status === 400 &&
                    /full name|required for new customers/i.test(
                        data.message || ""
                    )
                ) {
                    setShowName(true);
                    setStep("mobile");
                    setError("Please enter your full name to register.");
                    return;
                }
                throw new Error(data.message || "Unable to send OTP.");
            }
            setChallengeId(data.challenge_id);
            resetOtp();
            setCountdown(data.resend_after ?? 60);
            setStep("otp");
        } catch (err) {
            setError(err.message || "Unable to send OTP.");
        } finally {
            setLoading(false);
        }
    }
    function handleOtpChange(index, value) {
        const digit = value.replace(/\D/g, "").slice(-1);
        setOtp((previous) => {
            const updated = [...previous];
            updated[index] = digit;
            return updated;
        });
        if (digit && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    }
    function handleOtpKeyDown(index, event) {
        if (
            event.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            otpRefs.current[index - 1]?.focus();
        }
    }
    function handleOtpPaste(event) {
        const pasted = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);
        if (!pasted) return;
        event.preventDefault();
        setOtp(
            Array.from({ length: 6 }, (_, index) => pasted[index] || "")
        );
        otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
    async function verifyOtp(event) {
        event.preventDefault();
        setError("");
        const enteredOtp = otp.join("");
        if (enteredOtp.length !== 6) {
            setError("Enter the complete 6-digit OTP.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_phone: mobile,
                    challenge_id: challengeId,
                    otp: enteredOtp,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "OTP verification failed.");
            }
            // Temporary storage until AuthContext is implemented.
            login({
                token: data.token,
                customer: data.customer,
            });

            setCustomer(data.customer);
            setStep("success");
        } catch (err) {
            setError(err.message || "Unable to verify OTP.");
        } finally {
            setLoading(false);
        }
    }
    function goBack() {
        setStep("mobile");
        setError("");
        resetOtp();
    }
    const animation = {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.25 },
    };
    const primaryButton =
        "flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--brand-gold)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#b58448] disabled:cursor-not-allowed disabled:opacity-50";
    const secondaryButton =
        "flex h-11 w-full items-center justify-center rounded-md border border-[var(--border)] bg-transparent px-4 text-[13px] font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--brand-gold)]";
    const inputGroup =
        "flex h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-white px-3.5 transition-colors focus-within:border-[var(--brand-gold)]";
    return (

        <main
            className="
                flex
                min-h-[calc(100svh)]
                items-center
                justify-center
                bg-[var(--brand-cream)]
                px-4 py-3

                pt-[84px]

                lg:h-[100svh]
                lg:min-h-0
                lg:overflow-y-auto
                lg:px-6
                lg:pt-[84px]
                lg:pb-3"
        >

            <section
                className="
          grid w-full max-w-[1120px]
          grid-cols-1 overflow-hidden
          rounded-xl bg-white shadow-xl
          lg:h-full lg:max-h-[760px]
          lg:grid-cols-[0.9fr_1.1fr]
        "
            >
                {/* DESKTOP BRAND PANEL */}
                <aside
                    className="
            relative hidden overflow-hidden
            bg-[var(--brand-black)]
            text-white lg:flex
            lg:flex-col lg:justify-between
            lg:p-8
          "
                >
                    <Image
                        src="/aboutus.png"
                        alt=""
                        fill
                        priority
                        quality={100}
                        sizes="100vw"
                        className="
                                object-cover
                                object-[62%_center]
                                sm:object-[65%_center]
                                lg:object-center
                            "
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/90" />
                    <div className="relative z-10 flex flex-col">
                        <span className="text-4xl font-black italic tracking-[-3px] text-[var(--brand-gold)]">
                            SR
                        </span>
                        <span className="text-[10px] font-bold tracking-[3px] text-[var(--brand-gold-light)]">
                            AUTOMOTIVES
                        </span>
                    </div>
                    <div className="relative z-10 max-w-[340px]">
                        <div className="mb-4 h-[3px] w-11 bg-[var(--brand-gold)]" />
                        <h2 className="text-[clamp(26px,2.5vw,36px)] leading-[1.12] font-bold tracking-tight">
                            Premium Accessories
                            <br />
                            for{" "}
                            <span className="text-[var(--brand-gold-light)]">
                                Every Journey
                            </span>
                        </h2>
                        <p className="mt-3 text-[13px] leading-relaxed text-white/75">
                            Enhance your drive with quality products and
                            expert services.
                        </p>
                    </div>
                </aside>
                {/* AUTH FORM */}
                <section
                    className="
            flex min-h-[calc(100svh-90px)] flex-col
            bg-white px-5 py-5
            sm:px-10
            lg:min-h-0 lg:px-10 lg:py-5
            xl:px-14
          "
                >
                    {/* TOP BAR */}
                    <div className="flex shrink-0 items-center justify-between gap-3">
                        {step === "mobile" ? (
                            <span className="text-[10px] font-semibold tracking-[1.5px] text-[var(--text-secondary)]">
                                SECURE CUSTOMER ACCESS
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={goBack}
                                className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--brand-gold)]"
                            >
                                <FiArrowLeft />
                                Back
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => router.push("/products")}
                            className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-gold)]"
                        >
                            Continue as Guest
                            <FiArrowRight />
                        </button>
                    </div>
                    {/* FORM CENTER */}
                    <div
                        className="
              flex flex-1 items-center justify-center
              py-8
              lg:min-h-0 lg:py-3
            "
                    >
                        <div className="w-full max-w-[410px]">
                            <AnimatePresence mode="wait">
                                {step === "mobile" && (
                                    <motion.div key="mobile" {...animation}>
                                        <div className="mb-5 flex items-center gap-3 border-b border-[var(--border)] pb-3 text-[10px] tracking-wide">
                                            <span className="font-bold">
                                                LOGIN / REGISTER
                                            </span>
                                            <span className="text-[var(--text-secondary)]">
                                                WITH MOBILE OTP
                                            </span>
                                        </div>
                                        <h1 className="text-[clamp(29px,3vw,39px)] leading-[1.12] font-extrabold tracking-[-1.3px] text-[var(--text-primary)]">
                                            Welcome to
                                            <br />
                                            SR Automotives
                                        </h1>
                                        <p className="mt-3 mb-7 text-[13px] leading-relaxed text-[var(--text-secondary)] lg:mb-5">
                                            Access your account, manage vehicles,
                                            track orders and more.
                                        </p>
                                        <form onSubmit={sendOtp}>
                                            <label
                                                htmlFor="mobile"
                                                className="mb-2 block text-xs font-semibold"
                                            >
                                                Mobile Number
                                            </label>
                                            <div className={inputGroup}>
                                                <FiPhone className="shrink-0 text-[var(--text-secondary)]" />
                                                <span className="text-[13px] font-semibold">
                                                    +91
                                                </span>
                                                <input
                                                    id="mobile"
                                                    type="tel"
                                                    inputMode="numeric"
                                                    autoComplete="tel-national"
                                                    placeholder="Enter mobile number"
                                                    maxLength={10}
                                                    value={mobile}
                                                    onChange={(event) =>
                                                        setMobile(
                                                            event.target.value.replace(/\D/g, "")
                                                        )
                                                    }
                                                    className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#aaa59d]"
                                                    required
                                                />
                                            </div>
                                            <p className="mt-2 text-[11px] text-[var(--text-secondary)]">
                                                We'll send a one-time password to this number.
                                            </p>
                                            {showName && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    className="mt-4 overflow-hidden"
                                                >
                                                    <label
                                                        htmlFor="fullname"
                                                        className="mb-2 block text-xs font-semibold"
                                                    >
                                                        Full Name
                                                    </label>
                                                    <div className={inputGroup}>
                                                        <FiUser className="text-[var(--text-secondary)]" />
                                                        <input
                                                            id="fullname"
                                                            type="text"
                                                            autoComplete="name"
                                                            placeholder="Enter your full name"
                                                            maxLength={100}
                                                            value={fullname}
                                                            onChange={(event) =>
                                                                setFullname(event.target.value)
                                                            }
                                                            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
                                                            required
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                            {error && (
                                                <p
                                                    role="alert"
                                                    className="mt-3 text-xs text-red-600"
                                                >
                                                    {error}
                                                </p>
                                            )}
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={`${primaryButton} mt-5`}
                                            >
                                                {loading ? "Sending OTP..." : "Send OTP"}
                                                {!loading && <FiArrowRight />}
                                            </button>
                                        </form>
                                        <div className="my-4 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                                            <div className="h-px flex-1 bg-[var(--border)]" />
                                            or
                                            <div className="h-px flex-1 bg-[var(--border)]" />
                                        </div>
                                        <button
                                            type="button"
                                            className={secondaryButton}
                                            onClick={() => router.push("/products")}
                                        >
                                            Continue as Guest
                                        </button>
                                        <p className="mt-5 text-center text-[11px] leading-relaxed text-[var(--text-secondary)]">
                                            By continuing, you agree to our
                                            <br />
                                            <a
                                                href="/terms"
                                                className="text-[var(--text-primary)] underline underline-offset-2"
                                            >
                                                Terms of Service
                                            </a>{" "}
                                            and{" "}
                                            <a
                                                href="/privacy"
                                                className="text-[var(--text-primary)] underline underline-offset-2"
                                            >
                                                Privacy Policy
                                            </a>
                                            .
                                        </p>
                                    </motion.div>
                                )}
                                {step === "otp" && (
                                    <motion.div key="otp" {...animation}>
                                        <div className="mb-5 flex items-center gap-3 border-b border-[var(--border)] pb-3 text-[10px] tracking-wide">
                                            <span className="font-bold">
                                                MOBILE VERIFICATION
                                            </span>
                                            <span className="text-[var(--text-secondary)]">
                                                SECURE OTP
                                            </span>
                                        </div>
                                        <h1 className="text-[clamp(30px,3vw,39px)] font-extrabold tracking-tight">
                                            Enter OTP
                                        </h1>
                                        <p className="mt-3 mb-6 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                                            We've sent a 6-digit OTP to
                                            <br />
                                            <strong className="text-[var(--text-primary)]">
                                                +91 {mobile}
                                            </strong>{" "}
                                            <button
                                                type="button"
                                                onClick={goBack}
                                                className="inline-flex items-center gap-1 font-semibold text-[var(--brand-gold)]"
                                            >
                                                Edit <FiEdit2 size={12} />
                                            </button>
                                        </p>
                                        <form onSubmit={verifyOtp}>
                                            <div
                                                className="grid grid-cols-6 gap-2"
                                                onPaste={handleOtpPaste}
                                            >
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        ref={(element) => {
                                                            otpRefs.current[index] = element;
                                                        }}
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={1}
                                                        autoComplete={
                                                            index === 0 ? "one-time-code" : "off"
                                                        }
                                                        value={digit}
                                                        onChange={(event) =>
                                                            handleOtpChange(
                                                                index,
                                                                event.target.value
                                                            )
                                                        }
                                                        onKeyDown={(event) =>
                                                            handleOtpKeyDown(index, event)
                                                        }
                                                        aria-label={`OTP digit ${index + 1}`}
                                                        className="h-12 w-full min-w-0 rounded-md border border-[var(--border)] bg-white text-center text-lg font-bold outline-none focus:border-[var(--brand-gold)]"
                                                    />
                                                ))}
                                            </div>
                                            <div className="mt-6 flex flex-wrap justify-center gap-1 text-xs text-[var(--text-secondary)]">
                                                <span>Didn't receive the OTP?</span>
                                                {countdown > 0 ? (
                                                    <span className="font-semibold text-[var(--brand-gold)]">
                                                        Resend in 00:
                                                        {String(countdown).padStart(2, "0")}
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => sendOtp()}
                                                        disabled={loading}
                                                        className="font-semibold text-[var(--brand-gold)]"
                                                    >
                                                        Resend OTP
                                                    </button>
                                                )}
                                            </div>
                                            {error && (
                                                <p
                                                    role="alert"
                                                    className="mt-3 text-center text-xs text-red-600"
                                                >
                                                    {error}
                                                </p>
                                            )}
                                            <button
                                                type="submit"
                                                disabled={loading || otp.join("").length !== 6}
                                                className={`${primaryButton} mt-6`}
                                            >
                                                {loading ? "Verifying..." : "Verify OTP"}
                                                {!loading && <FiArrowRight />}
                                            </button>
                                        </form>
                                        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[var(--text-secondary)]">
                                            <FiShield className="text-[var(--brand-gold)]" />
                                            Your mobile number is verified securely.
                                        </div>
                                    </motion.div>
                                )}
                                {step === "success" && (
                                    <motion.div
                                        key="success"
                                        {...animation}
                                        className="text-center"
                                    >
                                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-gold-light)]/40 text-[var(--brand-gold)]">
                                            <FiCheck size={36} />
                                        </div>
                                        <h1 className="text-[clamp(29px,3vw,39px)] leading-tight font-extrabold tracking-tight">
                                            Welcome to
                                            <br />
                                            SR Automotives!
                                        </h1>
                                        <p className="mt-4 mb-8 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                                            You're successfully signed in
                                            {customer?.customer_fullname
                                                ? `, ${customer.customer_fullname}`
                                                : ""}
                                            .
                                        </p>
                                        <button
                                            type="button"
                                            className={primaryButton}
                                            onClick={() => router.replace(redirectTo)}
                                        >
                                            Go to My Account <FiArrowRight />
                                        </button>
                                        <button
                                            type="button"
                                            className={`${secondaryButton} mt-3`}
                                            onClick={() => router.replace("/products")}
                                        >
                                            Continue Shopping
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    {/* FOOTER */}
                    <p className="shrink-0 text-center text-[10px] text-[#a9a49c]">
                        © {new Date().getFullYear()} SR Automotives
                    </p>
                </section>
            </section>
        </main>
    );
}
export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <AuthPageContent />
        </Suspense>
    );
}
